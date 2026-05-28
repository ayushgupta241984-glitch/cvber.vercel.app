from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)

_client: Client | None = None
_client_anon: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        logger.info("Supabase client initialized (service role)")
    return _client


def get_supabase_anon() -> Client:
    global _client_anon
    if _client_anon is None:
        _client_anon = create_client(settings.supabase_url, settings.supabase_anon_key)
        logger.info("Supabase anonymous client initialized")
    return _client_anon


def init_supabase() -> Client:
    global _client
    _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    logger.info("Supabase client re-initialized")
    return _client
