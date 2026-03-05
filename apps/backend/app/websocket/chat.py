import json
from uuid import UUID
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session
from app.models.match import Match
from app.models.message import Message
from app.auth.jwt import decode_token
from app.websocket.manager import manager

router = APIRouter()


@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    # Authenticate via query param token
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        return

    user_id_str = decode_token(token)
    if not user_id_str:
        await websocket.close(code=4001, reason="Invalid token")
        return

    user_id = UUID(user_id_str)
    await manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "message":
                await handle_message(user_id, data)
            elif msg_type == "typing":
                await handle_typing(user_id, data)
            elif msg_type == "read":
                await handle_read(user_id, data)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception:
        manager.disconnect(user_id)


async def handle_message(sender_id: UUID, data: dict):
    match_id = UUID(data["match_id"])
    content = data.get("content", "")
    content_type = data.get("content_type", "text")

    async with async_session() as db:
        # Verify sender is part of match
        result = await db.execute(
            select(Match).where(
                and_(
                    Match.id == match_id,
                    or_(Match.user1_id == sender_id, Match.user2_id == sender_id),
                )
            )
        )
        match = result.scalar_one_or_none()
        if not match:
            return

        # Save message
        message = Message(
            match_id=match_id,
            sender_id=sender_id,
            content=content,
            content_type=content_type,
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)

        # Determine recipient
        recipient_id = match.user2_id if match.user1_id == sender_id else match.user1_id

        # Send to recipient
        await manager.send_to_match(sender_id, recipient_id, {
            "type": "message",
            "id": str(message.id),
            "match_id": str(match_id),
            "sender_id": str(sender_id),
            "content": content,
            "content_type": content_type,
            "created_at": message.created_at.isoformat(),
        })

        # Echo back to sender with the saved message ID
        await manager.send_personal(sender_id, {
            "type": "message_sent",
            "id": str(message.id),
            "match_id": str(match_id),
            "content": content,
            "content_type": content_type,
            "created_at": message.created_at.isoformat(),
        })


async def handle_typing(sender_id: UUID, data: dict):
    match_id = UUID(data["match_id"])

    async with async_session() as db:
        result = await db.execute(
            select(Match).where(
                and_(
                    Match.id == match_id,
                    or_(Match.user1_id == sender_id, Match.user2_id == sender_id),
                )
            )
        )
        match = result.scalar_one_or_none()
        if not match:
            return

        recipient_id = match.user2_id if match.user1_id == sender_id else match.user1_id
        await manager.broadcast_typing(sender_id, recipient_id, match_id)


async def handle_read(sender_id: UUID, data: dict):
    match_id = UUID(data["match_id"])
    message_id = UUID(data["message_id"])

    async with async_session() as db:
        result = await db.execute(
            select(Match).where(
                and_(
                    Match.id == match_id,
                    or_(Match.user1_id == sender_id, Match.user2_id == sender_id),
                )
            )
        )
        match = result.scalar_one_or_none()
        if not match:
            return

        recipient_id = match.user2_id if match.user1_id == sender_id else match.user1_id
        await manager.broadcast_read(sender_id, recipient_id, match_id, message_id)
