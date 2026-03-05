import json
from uuid import UUID
from fastapi import WebSocket
from datetime import datetime, timezone


class ConnectionManager:
    def __init__(self):
        # user_id -> WebSocket
        self.active_connections: dict[UUID, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: UUID):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: UUID):
        self.active_connections.pop(user_id, None)

    def is_online(self, user_id: UUID) -> bool:
        return user_id in self.active_connections

    async def send_personal(self, user_id: UUID, data: dict):
        ws = self.active_connections.get(user_id)
        if ws:
            await ws.send_json(data)

    async def send_to_match(self, sender_id: UUID, recipient_id: UUID, data: dict):
        """Send a message to the other user in a match."""
        await self.send_personal(recipient_id, data)

    async def broadcast_typing(self, sender_id: UUID, recipient_id: UUID, match_id: UUID):
        await self.send_personal(recipient_id, {
            "type": "typing",
            "match_id": str(match_id),
            "user_id": str(sender_id),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    async def broadcast_read(self, sender_id: UUID, recipient_id: UUID, match_id: UUID, message_id: UUID):
        await self.send_personal(recipient_id, {
            "type": "read",
            "match_id": str(match_id),
            "message_id": str(message_id),
            "user_id": str(sender_id),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    async def notify_new_match(self, user_id: UUID, match_data: dict):
        await self.send_personal(user_id, {
            "type": "new_match",
            **match_data,
        })


manager = ConnectionManager()
