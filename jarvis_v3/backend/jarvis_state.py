import asyncio
import threading
import queue
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

connected_clients = set()
current_state = "standby"
command_queue = queue.Queue()
processing_lock = threading.Lock()
is_processing = False
_main_loop = None
_send_queue = queue.Queue()


def init(loop):
    global _main_loop
    _main_loop = loop
    threading.Thread(target=_sender, daemon=True).start()


def _sender():
    while True:
        try:
            msg_type, data = _send_queue.get(timeout=1.0)
            msg = json.dumps({"type": msg_type, "data": data})
            for client in list(connected_clients):
                try:
                    coro = client.send_text(msg)
                    asyncio.run_coroutine_threadsafe(coro, _main_loop)
                except Exception:
                    connected_clients.discard(client)
        except queue.Empty:
            continue
        except Exception as e:
            print(f"[BROADCAST] Error: {e}")


def broadcast(msg_type, data):
    _send_queue.put((msg_type, data))


def on_update(update):
    broadcast("state_update", update)
