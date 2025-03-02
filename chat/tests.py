from django.test import TestCase
from django.contrib.auth.models import User
from channels.testing import WebsocketCommunicator
from channels.routing import URLRouter
from chat.routing import websocket_urlpatterns

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
        communicator = WebsocketCommunicator(
            URLRouter(websocket_urlpatterns),
            "/ws/chat/testroom/"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
