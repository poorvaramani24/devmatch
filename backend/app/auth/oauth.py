import httpx
from app.config import settings


async def get_google_user_info(code: str) -> dict | None:
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": f"{settings.FRONTEND_URL}/auth/callback/google",
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            return None

        access_token = token_resp.json().get("access_token")
        user_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_resp.status_code != 200:
            return None

        data = user_resp.json()
        return {"email": data["email"], "name": data.get("name", ""), "avatar": data.get("picture")}


async def get_github_user_info(code: str) -> dict | None:
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        if token_resp.status_code != 200:
            return None

        access_token = token_resp.json().get("access_token")
        user_resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_resp.status_code != 200:
            return None

        data = user_resp.json()

        # Get email if not public
        email = data.get("email")
        if not email:
            emails_resp = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if emails_resp.status_code == 200:
                for e in emails_resp.json():
                    if e.get("primary"):
                        email = e["email"]
                        break

        return {
            "email": email,
            "name": data.get("name") or data.get("login", ""),
            "avatar": data.get("avatar_url"),
            "github_url": data.get("html_url"),
            "oauth_id": str(data["id"]),
        }
