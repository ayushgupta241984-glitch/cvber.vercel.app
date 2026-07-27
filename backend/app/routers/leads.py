"""Lead generation API endpoints — wraps LinkedIn & Twitter scrapers"""

import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel

from app.dependencies import get_current_user

TOOLS_DIR = Path(__file__).parent.parent.parent.parent.parent / "tools"

router = APIRouter(prefix="/leads", tags=["leads"])


class LinkedInDiscoverRequest(BaseModel):
    seeds: list[str]
    depth: int = 3
    concurrent: int = 10


class LinkedInSalesNavRequest(BaseModel):
    search: str
    location: str = "US"


class TwitterSearchRequest(BaseModel):
    query: str
    limit: int = 200


class TwitterFollowersRequest(BaseModel):
    users: list[str]
    mode: str = "followers"
    limit: int = 500


class TwitterArtistsRequest(BaseModel):
    limit: int = 100


@router.post("/linkedin/discover")
async def linkedin_discover(
    req: LinkedInDiscoverRequest,
    current_user: dict = Depends(get_current_user),
):
    api_key = os.environ.get("LINKDAPI_KEY")
    if not api_key:
        raise HTTPException(400, "LINKDAPI_KEY not configured")

    try:
        sys.path.insert(0, str(TOOLS_DIR / "linkedin-leads-discover"))
        from src.api.client import LeadsAPIClient
        from src.discovery.tree_discovery import ProfileTreeDiscovery
        from linkdapi import AsyncLinkdAPI
    except ImportError:
        raise HTTPException(501, "LinkedIn discovery requires linkdapi package — not installed on this deployment")

    api_client = LeadsAPIClient(api_key=api_key, max_concurrent=req.concurrent)
    discovery = ProfileTreeDiscovery(api_client=api_client, max_concurrent=req.concurrent)

    try:
        async with AsyncLinkdAPI(api_key) as api:
            result = await discovery.discover_from_usernames(req.seeds, req.depth, api)
    except Exception as e:
        raise HTTPException(500, f"Discovery failed: {e}")

    return {
        "total": result["total_discovered"],
        "profiles": result["profiles"],
    }


@router.post("/twitter/search")
async def twitter_search(
    req: TwitterSearchRequest,
    current_user: dict = Depends(get_current_user),
):
    auth_token = os.environ.get("TWITTER_AUTH_TOKEN")
    if not auth_token:
        raise HTTPException(400, "TWITTER_AUTH_TOKEN not configured")

    try:
        from Scweet import Scweet
    except ImportError:
        raise HTTPException(501, "Twitter search requires Scweet package — not installed on this deployment")

    s = Scweet(auth_token=auth_token)
    try:
        tweets = s.search(req.query, limit=req.limit)
    except Exception as e:
        raise HTTPException(500, f"Search failed: {e}")

    return {"total": len(tweets), "tweets": tweets}


@router.post("/twitter/followers")
async def twitter_followers(
    req: TwitterFollowersRequest,
    current_user: dict = Depends(get_current_user),
):
    auth_token = os.environ.get("TWITTER_AUTH_TOKEN")
    if not auth_token:
        raise HTTPException(400, "TWITTER_AUTH_TOKEN not configured")

    try:
        from Scweet import Scweet
    except ImportError:
        raise HTTPException(501, "Twitter search requires Scweet package — not installed on this deployment")

    s = Scweet(auth_token=auth_token)
    try:
        if req.mode == "followers":
            data = s.get_followers(req.users, limit=req.limit)
        else:
            data = s.get_following(req.users, limit=req.limit)
    except Exception as e:
        raise HTTPException(500, f"Failed to get {req.mode}: {e}")

    return {"total": len(data), "users": data}


@router.post("/twitter/artists")
async def twitter_artists(
    req: TwitterArtistsRequest,
    current_user: dict = Depends(get_current_user),
):
    auth_token = os.environ.get("TWITTER_AUTH_TOKEN")
    if not auth_token:
        raise HTTPException(400, "TWITTER_AUTH_TOKEN not configured")

    try:
        from Scweet import Scweet
    except ImportError:
        raise HTTPException(501, "Twitter search requires Scweet package — not installed on this deployment")
    import time

    queries = [
        '"art theft" -filter:retweets',
        '"my art was stolen" -filter:retweets',
        '"protect my art" -filter:retweets',
        '"art trade" artist -filter:retweets',
    ]

    s = Scweet(auth_token=auth_token)
    all_tweets = []
    usernames_seen = set()

    for q in queries:
        try:
            tweets = s.search(q, limit=req.limit)
            for t in tweets:
                user = t.get("user", {})
                handle = user.get("screen_name", "") if isinstance(user, dict) else t.get("user_screen_name", "")
                if handle and handle not in usernames_seen:
                    usernames_seen.add(handle)
                    all_tweets.append(t)
        except Exception:
            pass
        time.sleep(2)

    return {"total": len(all_tweets), "unique_artists": len(usernames_seen), "tweets": all_tweets}
