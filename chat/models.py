from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    participants = models.ManyToManyField(User, related_name='chat_rooms')
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['name'])
        ]
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.name
    
    @property
    def participant_count(self):
        return self.participants.count()
    
    def get_recent_messages(self, limit=50):
        return self.message_set.order_by('-timestamp')[:limit]
    
    def mark_as_inactive(self):
        self.is_active = False
        self.save(update_fields=['is_active', 'updated_at'])

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_read = models.BooleanField(default=False)
    read_by = models.ManyToManyField(User, related_name='read_messages', blank=True)
    attachment = models.FileField(upload_to='chat_attachments/', null=True, blank=True)
    
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
        ('system', 'System'),
    )
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')

    class Meta:
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['room', 'timestamp'])
        ]
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}..."
    
    def mark_as_read(self, user):
        if user != self.user:  # Only mark as read if not the sender
            self.read_by.add(user)
            if self.read_by.count() == self.room.participants.count() - 1:  # All participants except sender
                self.is_read = True
                self.save(update_fields=['is_read', 'updated_at'])
    
    @property
    def is_modified(self):
        time_diff = self.updated_at - self.timestamp
        return time_diff.total_seconds() > 1  # If edited more than 1 second after creation
