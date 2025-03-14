from django.test import TestCase
from django.contrib.auth.models import User
from channels.testing import WebsocketCommunicator
from channels.routing import URLRouter
from chat.routing import websocket_urlpatterns
from channels.layers import get_channel_layer
from django.urls import re_path
from chat.consumers import ChatConsumer
from channels.testing import WebsocketCommunicator
from django.test import TestCase
from .routing import application
import pytest

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

    @pytest.mark.asyncio
    @pytest.mark.django_db(transaction=True)
    async def test_websocket_connection(self):
        try:
            communicator = WebsocketCommunicator(application, "/ws/chat/testroom/")
            connected, _ = await communicator.connect()
            self.assertTrue(connected)
            await communicator.disconnect()
        except Exception as e:
            self.fail(f"Test failed with exception: {str(e)}")
