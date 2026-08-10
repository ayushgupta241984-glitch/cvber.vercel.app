import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Callable, Optional
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class ServiceState(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    FAILED = "failed"
    RESTARTING = "restarting"


@dataclass
class ServiceHealth:
    name: str
    state: ServiceState = ServiceState.HEALTHY
    last_check: float = 0.0
    consecutive_failures: int = 0
    total_restarts: int = 0
    uptime_seconds: float = 0.0
    last_error: Optional[str] = None


class ServiceSupervisor:
    def __init__(self):
        self.services: Dict[str, ServiceHealth] = {}
        self._check_interval: int = 30
        self._max_failures: int = 3
        self._restart_delay: int = 5
        self._running: bool = False
        self._tasks: List[asyncio.Task] = []

    def register(
        self,
        name: str,
        health_check: Callable,
        restart_handler: Optional[Callable] = None,
        check_interval: int = 30,
    ):
        self.services[name] = ServiceHealth(name=name)
        self.services[name]._health_check = health_check
        self.services[name]._restart_handler = restart_handler
        self.services[name]._check_interval = check_interval
        logger.info(f"Supervisor: registered service '{name}' (interval={check_interval}s)")

    async def _check_service(self, name: str, health: ServiceHealth):
        try:
            result = await health._health_check()
            health.last_check = time.time()

            if result.get("status") in ("healthy", "ok"):
                if health.state != ServiceState.RESTARTING:
                    health.state = ServiceState.HEALTHY
                health.consecutive_failures = 0
                health.uptime_seconds = time.time() - getattr(health, "_start_time", time.time())
                health.last_error = None
            else:
                health.consecutive_failures += 1
                health.last_error = result.get("detail", result.get("reason", "unknown"))
                if health.consecutive_failures >= self._max_failures:
                    health.state = ServiceState.FAILED
                    logger.warning(f"Supervisor: service '{name}' FAILED after {health.consecutive_failures} failures")
                    if health._restart_handler:
                        await self._restart_service(name, health)
                elif health.consecutive_failures >= 1:
                    health.state = ServiceState.DEGRADED

        except Exception as e:
            health.consecutive_failures += 1
            health.last_error = str(e)
            health.state = ServiceState.FAILED
            logger.error(f"Supervisor: health check error for '{name}': {e}")
            if health.consecutive_failures >= self._max_failures and health._restart_handler:
                await self._restart_service(name, health)

    async def _restart_service(self, name: str, health: ServiceHealth):
        logger.info(f"Supervisor: restarting service '{name}' (attempt {health.total_restarts + 1})")
        health.state = ServiceState.RESTARTING
        health.total_restarts += 1
        health._start_time = time.time()

        try:
            if health._restart_handler:
                await health._restart_handler()
            health.consecutive_failures = 0
            health.state = ServiceState.HEALTHY
            logger.info(f"Supervisor: service '{name}' restarted successfully")
        except Exception as e:
            health.state = ServiceState.FAILED
            health.last_error = f"Restart failed: {e}"
            logger.error(f"Supervisor: restart of '{name}' failed: {e}")

    async def _monitor_loop(self):
        while self._running:
            for name, health in self.services.items():
                asyncio.create_task(self._check_service(name, health))
            await asyncio.sleep(self._check_interval)

    async def start(self):
        self._running = True
        for name, health in self.services.items():
            health._start_time = time.time()
        self._tasks.append(asyncio.create_task(self._monitor_loop()))
        logger.info("Supervisor: started monitoring")

    async def stop(self):
        self._running = False
        for task in self._tasks:
            task.cancel()
        try:
            await asyncio.gather(*self._tasks, return_exceptions=True)
        except asyncio.CancelledError:
            pass
        logger.info("Supervisor: stopped")

    def get_status(self) -> Dict[str, Any]:
        return {
            name: {
                "state": health.state.value,
                "last_check": datetime.fromtimestamp(health.last_check, tz=timezone.utc).isoformat() if health.last_check else None,
                "consecutive_failures": health.consecutive_failures,
                "total_restarts": health.total_restarts,
                "uptime_seconds": round(health.uptime_seconds, 1),
                "last_error": health.last_error,
            }
            for name, health in self.services.items()
        }

    def get_overall_status(self) -> str:
        states = [h.state for h in self.services.values()]
        if ServiceState.FAILED in states:
            return "degraded"
        if ServiceState.DEGRADED in states:
            return "degraded"
        if ServiceState.RESTARTING in states:
            return "recovering"
        return "healthy"


supervisor = ServiceSupervisor()