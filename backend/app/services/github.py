import httpx
from collections import Counter


async def fetch_github_languages(username: str) -> dict:
    """Fetch public repository languages for a GitHub user."""
    async with httpx.AsyncClient() as client:
        repos_resp = await client.get(
            f"https://api.github.com/users/{username}/repos",
            params={"per_page": 100, "sort": "updated"},
            headers={"Accept": "application/vnd.github.v3+json"},
        )

        if repos_resp.status_code != 200:
            return {"languages": [], "repos_count": 0}

        repos = repos_resp.json()
        lang_counter = Counter()

        for repo in repos:
            if repo.get("language"):
                lang_counter[repo["language"]] += 1

        # Sort by frequency
        top_languages = [lang for lang, _ in lang_counter.most_common(15)]

        return {
            "languages": top_languages,
            "repos_count": len(repos),
        }


async def fetch_github_profile(username: str) -> dict | None:
    """Fetch GitHub profile info."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.github.com/users/{username}",
            headers={"Accept": "application/vnd.github.v3+json"},
        )
        if resp.status_code != 200:
            return None

        data = resp.json()
        return {
            "name": data.get("name"),
            "bio": data.get("bio"),
            "public_repos": data.get("public_repos", 0),
            "followers": data.get("followers", 0),
            "avatar_url": data.get("avatar_url"),
            "contributions": data.get("contributions", 0),
        }
