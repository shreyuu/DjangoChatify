import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get the room name from the URL route
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        print(f"WebSocket connected successfully to: {self.room_group_name}")

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def websocket_receive(self, event):
        """
        Override websocket_receive to properly handle incoming messages
        """
        print(f"Received event: {event}")  # Debugging to check the structure of event

        # Check if event is a string (which could be the raw message)
        if isinstance(event, str):
            message = event
        elif isinstance(event, dict):
            # If it's a dictionary, we expect a 'text' key with the actual message
            message = event.get('text', None)
        else:
            # If event is not a string or dictionary, return early
            print(f"Unexpected event type: {type(event)}")
            return

        # If message is None or empty, return early
        if not message:
            print("No message found in event.")
            return

        try:
            # Try to load the message as JSON if it's in string format
            if isinstance(message, str):
                data = json.loads(message)
            else:
                data = message

            # Forward the message to the room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': data.get('message', ''),
                    'userId': data.get('userId', ''),
                    'timestamp': data.get('timestamp', '')
                }
            )
        except json.JSONDecodeError as e:
            # Handle JSON decode errors
            print(f"JSON decode error: {e}")
            await self.send(text_data=json.dumps({
                'error': 'Invalid message format'
            }))
        except Exception as e:
            # General error handler
            print(f"An unexpected error occurred: {e}")
            await self.send(text_data=json.dumps({
                'error': 'An unexpected error occurred'
            }))

    async def chat_message(self, event):
        """
        Send the message to WebSocket
        """
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'userId': event['userId'],
            'timestamp': event['timestamp']
        }))
