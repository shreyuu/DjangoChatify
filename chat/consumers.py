import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] New connection in room: {self.room_name}")

    async def disconnect(self, close_code):
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Connection closed in room: {self.room_name}")
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            # Handle double-encoded JSON
            text_data_json = json.loads(text_data)
            if isinstance(text_data_json, str):
                message_data = json.loads(text_data_json)
            else:
                message_data = text_data_json

            # Print debug information for received message
            print("\n=== Message Received From Client ===")
            print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"Room: {self.room_name}")
            print(f"From User: {message_data['userId']}")
            print(f"Message: {message_data['message']}")
            print("Broadcasting to group members...")
            print("========================\n")

            # Broadcasting to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message_data['message'],
                    'userId': message_data['userId'],
                    'timestamp': message_data['timestamp'],
                    'sender_channel': self.channel_name  # Add sender channel name
                }
            )
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

    async def chat_message(self, event):
        # Only log broadcasting details
        if event.get('sender_channel') != self.channel_name:
            print(f"\n=== Broadcasting Message to Client ===")
            print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"To Channel: {self.channel_name}")
            print(f"Message: {event['message']}")
            print("========================\n")
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'userId': event['userId'],
            'timestamp': event['timestamp']
        }))