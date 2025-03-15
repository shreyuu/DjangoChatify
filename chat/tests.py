import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from .routing import application

class HelloWorldTest(TestCase):
    def test_hello_world(self):
        # Simple assertion without string concatenation
        self.assertEqual("Hello World", "Hello World")

class ChatTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up data for all test methods
        cls.User = get_user_model()
        cls.test_user = cls.User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )

    def test_user_creation(self):
        # Test user attributes directly without string concatenation
        self.assertIsNotNone(self.test_user)
        self.assertEqual(self.test_user.username, 'testuser')
        self.assertEqual(self.test_user.email, 'test@example.com')

    @pytest.mark.asyncio
    @pytest.mark.django_db(transaction=True)
    async def test_websocket_connection(self):
        communicator = WebsocketCommunicator(
            application=application,
            path="/ws/chat/testroom/"
        )
        try:
            connected, _ = await communicator.connect()
            self.assertTrue(connected)
        finally:
            await communicator.disconnect()
