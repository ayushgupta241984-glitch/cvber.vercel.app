"""Tools layer -- catalog of functions the brain can call."""


class Tools:
    SCHEMA = [
        {
            "type": "function",
            "function": {
                "name": "get_time",
                "description": "Get the current time and date",
                "parameters": {"type": "object", "properties": {}, "required": []},
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the weather for a location",
                "parameters": {
                    "type": "object",
                    "properties": {"location": {"type": "string", "description": "City name"}},
                    "required": ["location"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "open_app",
                "description": "Open an application on the computer",
                "parameters": {
                    "type": "object",
                    "properties": {"app_name": {"type": "string", "description": "Name of the app to open"}},
                    "required": ["app_name"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "web_search",
                "description": "Search the web for information",
                "parameters": {
                    "type": "object",
                    "properties": {"query": {"type": "string", "description": "Search query"}},
                    "required": ["query"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "set_reminder",
                "description": "Set a reminder for a future time",
                "parameters": {
                    "type": "object",
                    "properties": {"text": {"type": "string"}, "time": {"type": "string", "description": "When to remind"}},
                    "required": ["text", "time"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_news",
                "description": "Get recent news headlines",
                "parameters": {"type": "object", "properties": {}, "required": []},
            },
        },
        {
            "type": "function",
            "function": {
                "name": "calc",
                "description": "Perform a math calculation",
                "parameters": {
                    "type": "object",
                    "properties": {"expression": {"type": "string", "description": "Math expression to evaluate"}},
                    "required": ["expression"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "list_files",
                "description": "List files in a directory",
                "parameters": {
                    "type": "object",
                    "properties": {"path": {"type": "string", "description": "Directory path"}},
                    "required": ["path"],
                },
            },
        },
    ]

    def __init__(self):
        self.dispatch = {
            "get_time": self.get_time,
            "get_weather": self.get_weather,
            "open_app": self.open_app,
            "web_search": self.web_search,
            "set_reminder": self.set_reminder,
            "get_news": self.get_news,
            "calc": self.calc,
            "list_files": self.list_files,
        }

    def execute(self, name, params):
        fn = self.dispatch.get(name)
        if fn:
            return fn(**params) if isinstance(params, dict) else fn()
        return f"Unknown tool: {name}"

    def get_time(self):
        from datetime import datetime
        now = datetime.now()
        return now.strftime("%I:%M %p, %A, %B %d, %Y")

    def get_weather(self, location):
        import requests
        try:
            r = requests.get(
                f"http://wttr.in/{location}?format=3",
                timeout=5,
            )
            return r.text.strip() if r.status_code == 200 else f"Weather unavailable for {location}"
        except Exception as e:
            return f"Weather fetch error: {e}"

    def open_app(self, app_name):
        import subprocess
        try:
            subprocess.Popen(app_name, shell=True)
            return f"Opened {app_name}"
        except Exception as e:
            return f"Could not open {app_name}: {e}"

    def web_search(self, query):
        return f"Search query: {query}"

    def set_reminder(self, text, time):
        return f"Reminder set: '{text}' at {time}"

    def get_news(self):
        import requests
        try:
            r = requests.get("https://news.ycombinator.com/bigrss.xml", timeout=5)
            return "News feed retrieved" if r.status_code == 200 else "News unavailable"
        except Exception:
            return "News fetch error"

    def calc(self, expression):
        try:
            return str(eval(expression, {"__builtins__": {}}, {}))
        except Exception as e:
            return f"Calc error: {e}"

    def list_files(self, path):
        import os
        try:
            return ", ".join(os.listdir(path))
        except Exception as e:
            return f"Cannot list {path}: {e}"
