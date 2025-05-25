import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    connected_users = {}  # Store connected users and their channels

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        print(
            f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] New connection in room: {self.room_name}"
        )

    async def disconnect(self, close_code):
        if hasattr(self, "username"):
            # Remove user from connected users
            if self.username in self.connected_users:
                del self.connected_users[self.username]

            # Notify others about user leaving
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": f"{self.username} has left the chat",
                    "username": "System",
                },
            )

            # Update user list
            await self.update_user_list()

        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(
            f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Connection closed in room: {self.room_name}"
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            if isinstance(text_data_json, str):
                message_data = json.loads(text_data_json)
            else:
                message_data = text_data_json

            if message_data.get("type") == "user_joined":
                # Handle new user joining
                username = message_data.get("username")
                if username:
                    self.username = username
                    self.connected_users[username] = self.channel_name

                    # Send welcome message
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            "type": "chat_message",
                            "message": f"{username} has joined the chat",
                            "username": "System",
                        },
                    )

                    # Update user list for all clients
                    await self.update_user_list()
                    return

            # Handle regular chat messages
            print("\n=== Message Received From Client ===")
            print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"Room: {self.room_name}")
            print(f"From User: {message_data.get('username', 'Anonymous')}")
            print(f"Message: {message_data.get('message', '')}")
            print("Broadcasting to group members...")
            print("========================\n")

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message_data.get("message", ""),
                    "username": message_data.get("username", "Anonymous"),
                    "timestamp": message_data.get(
                        "timestamp", datetime.now().isoformat()
                    ),
                },
            )
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "message": event["message"],
                    "username": event["username"],
                    "timestamp": event.get("timestamp", datetime.now().isoformat()),
                }
            )
        )

    async def update_user_list(self):
        """Send updated user list to all connected clients"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "user_list_update", "users": list(self.connected_users.keys())},
        )

    async def user_list_update(self, event):
        """Handle user list updates"""
        await self.send(
            text_data=json.dumps({"type": "user_list", "users": event["users"]})
        )
