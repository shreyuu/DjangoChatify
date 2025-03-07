from django.test import TestCase
from django.contrib.auth.models import User
from channels.testing import WebsocketCommunicator
from channels.routing import URLRouter
from chat.routing import websocket_urlpatterns
from channels.layers import get_channel_layer
from django.urls import re_path
from chat.consumers import ChatConsumer

class HelloWorldTest(TestCase):
    def test_hello_world(self):
        self.assertEqual(1 + 1, 2)

class ChatTests(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_user_creation(self):
        """Test that we can create a user"""
        self.assertEqual(self.user.username, 'testuser')

class WebSocketTests(TestCase):
    async def test_websocket_connection(self):
        application = URLRouter([
            re_path(r'ws/chat/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
        ])
        communicator = WebsocketCommunicator(application, "ws/chat/testroom/")
        
        # Increase timeout if needed
        connected, _ = await communicator.connect(timeout=2)
        self.assertTrue(connected)
        
        # Clean up
        await communicator.disconnect()
