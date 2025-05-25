import pytest
import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from .routing import application
from .models import ChatRoom, Message


class HealthCheckTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_check(self):
        response = self.client.get(reverse("health_check"))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["database"], "up")
        self.assertIn("redis", data)


class ChatTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up data for all test methods
        cls.User = get_user_model()
        cls.test_user = cls.User.objects.create_user(
            username="testuser", password="testpass123", email="test@example.com"
        )
        cls.test_room = ChatRoom.objects.create(name="testroom")
        cls.test_room.participants.add(cls.test_user)

    def setUp(self):
        self.client = Client()
        self.client.login(username="testuser", password="testpass123")

    def test_user_creation(self):
        # Test user attributes directly without string concatenation
        self.assertIsNotNone(self.test_user)
        self.assertEqual(self.test_user.username, "testuser")
        self.assertEqual(self.test_user.email, "test@example.com")

    def test_chat_room_creation(self):
        self.assertEqual(self.test_room.name, "testroom")
        self.assertTrue(self.test_room.is_active)
        self.assertEqual(self.test_room.participant_count, 1)
        self.assertTrue(
            self.test_room.participants.filter(id=self.test_user.id).exists()
        )

    def test_message_creation(self):
        message = Message.objects.create(
            room=self.test_room, user=self.test_user, content="Hello, world!"
        )
        self.assertEqual(message.content, "Hello, world!")
        self.assertEqual(message.user, self.test_user)
        self.assertEqual(message.room, self.test_room)
        self.assertEqual(message.message_type, "text")
        self.assertFalse(message.is_read)
        self.assertEqual(str(message), f"{self.test_user.username}: Hello, world!...")

    def test_chat_room_methods(self):
        # Create some test messages
        for i in range(5):
            Message.objects.create(
                room=self.test_room, user=self.test_user, content=f"Test message {i}"
            )

        # Test get_recent_messages method
        recent_messages = self.test_room.get_recent_messages(limit=3)
        self.assertEqual(recent_messages.count(), 3)

        # Test mark_as_inactive method
        self.assertTrue(self.test_room.is_active)
        self.test_room.mark_as_inactive()
        self.assertFalse(self.test_room.is_active)

    def test_message_mark_as_read(self):
        # Create another test user
        test_user2 = self.User.objects.create_user(
            username="testuser2", password="testpass456", email="test2@example.com"
        )
        self.test_room.participants.add(test_user2)

        # Create a test message
        message = Message.objects.create(
            room=self.test_room, user=self.test_user, content="Read this message"
        )

        # Initially the message is not read
        self.assertFalse(message.is_read)
        self.assertEqual(message.read_by.count(), 0)

        # Mark as read by test_user2
        message.mark_as_read(test_user2)

        # After being read by all other participants (only test_user2 in this case), it should be marked as read
        self.assertTrue(message.is_read)
        self.assertEqual(message.read_by.count(), 1)
        self.assertTrue(message.read_by.filter(id=test_user2.id).exists())

    @pytest.mark.asyncio
    @pytest.mark.django_db(transaction=True)
    async def test_websocket_connection(self):
        communicator = WebsocketCommunicator(
            application=application, path="/ws/chat/testroom/"
        )
        try:
            connected, _ = await communicator.connect()
            self.assertTrue(connected)
        finally:
            await communicator.disconnect()

    @pytest.mark.asyncio
    @pytest.mark.django_db(transaction=True)
    async def test_websocket_message_send_receive(self):
        communicator1 = WebsocketCommunicator(
            application=application, path="/ws/chat/testroom/"
        )
        communicator2 = WebsocketCommunicator(
            application=application, path="/ws/chat/testroom/"
        )

        connected1, _ = await communicator1.connect()
        connected2, _ = await communicator2.connect()
        self.assertTrue(connected1)
        self.assertTrue(connected2)

        # Send message from communicator1
        test_message = {
            "type": "chat.message",
            "message": "Hello, world!",
            "username": "testuser",
        }
        await communicator1.send_json_to(test_message)

        # Receive response in communicator2
        response = await communicator2.receive_json_from()
        self.assertEqual(response["message"], "Hello, world!")
        self.assertEqual(response["username"], "testuser")

        # Cleanup
        await communicator1.disconnect()
        await communicator2.disconnect()
