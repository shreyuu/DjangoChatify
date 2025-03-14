import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from .routing import application

class HelloWorldTest(TestCase):
    def test_hello_world(self):
        self.assertEqual("Hello World", "Hello World")

class ChatTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.test_user = self.User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_user_creation(self):
        self.assertIsNotNone(self.test_user)
        self.assertEqual(self.test_user.username, 'testuser')

    @pytest.mark.asyncio
    @pytest.mark.django_db(transaction=True)
    async def test_websocket_connection(self):
        communicator = WebsocketCommunicator(
            application=application,
            path="/ws/chat/testroom/"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()
