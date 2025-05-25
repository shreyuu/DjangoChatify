from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid
from django.core.cache import cache
from cacheops import cached_as


class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    participants = models.ManyToManyField(User, related_name="chat_rooms")
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        indexes = [models.Index(fields=["created_at"]), models.Index(fields=["name"])]
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name

    def get_participant_count(self):
        cache_key = f"room_participants_{self.id}"
        count = cache.get(cache_key)
        if count is None:
            count = self.participants.count()
            cache.set(cache_key, count, timeout=300)  # Cache for 5 minutes
        return count

    def get_recent_messages(self, limit=50):
        cache_key = f"room_messages_{self.id}"
        messages = cache.get(cache_key)
        if messages is None:
            messages = self.messages.order_by("-timestamp")[:limit]
            cache.set(cache_key, messages, timeout=300)  # Cache for 5 minutes
        return messages

    def mark_as_inactive(self):
        self.is_active = False
        self.updated_at = timezone.now()
        self.save(update_fields=["is_active", "updated_at"])
        # Invalidate cache
        cache.delete(f"room_messages_{self.id}")
        cache.delete(f"room_participants_{self.id}")


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name="messages"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_read = models.BooleanField(default=False)
    read_by = models.ManyToManyField(User, related_name="read_messages", blank=True)
    attachment = models.FileField(upload_to="chat_attachments/", null=True, blank=True)

    MESSAGE_TYPES = (
        ("text", "Text"),
        ("image", "Image"),
        ("file", "File"),
        ("system", "System"),
    )
    message_type = models.CharField(
        max_length=10, choices=MESSAGE_TYPES, default="text"
    )

    class Meta:
        indexes = [
            models.Index(fields=["timestamp"]),
            models.Index(fields=["room", "timestamp"]),
        ]
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}..."

    def mark_as_read(self, user):
        if user != self.user:  # Only mark as read if not the sender
            self.read_by.add(user)
            if (
                self.read_by.count() == self.room.participants.count() - 1
            ):  # All participants except sender
                self.is_read = True
                self.save(update_fields=["is_read", "updated_at"])

    @property
    def is_modified(self):
        time_diff = self.updated_at - self.timestamp
        return (
            time_diff.total_seconds() > 1
        )  # If edited more than 1 second after creation

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Invalidate cache when new message is saved
        cache.delete(f"room_messages_{self.room.id}")
