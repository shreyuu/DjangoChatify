from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.db import connections
from django.db.utils import OperationalError
from redis import Redis
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.response import Response
from django_ratelimit.decorators import ratelimit
from rest_framework.decorators import action
from .models import ChatRoom, Message
from django.core.cache import cache

# Create your views here.


def health_check(request):
    """
    Health check endpoint for the application.
    Checks database and Redis connections.
    """
    # Check database connection
    db_healthy = True
    try:
        connections["default"].cursor()
    except OperationalError:
        db_healthy = False

    # Check Redis connection
    redis_healthy = True
    try:
        redis_host = settings.CHANNEL_LAYERS["default"]["CONFIG"]["hosts"][0][0]
        redis_port = settings.CHANNEL_LAYERS["default"]["CONFIG"]["hosts"][0][1]
        r = Redis(host=redis_host, port=redis_port)
        r.ping()
    except Exception:
        redis_healthy = False

    status = 200 if db_healthy and redis_healthy else 503

    response_data = {
        "status": "healthy" if status == 200 else "unhealthy",
        "database": "up" if db_healthy else "down",
        "redis": "up" if redis_healthy else "down",
    }

    return JsonResponse(data=response_data, status=status)


class ChatViewSet(viewsets.ViewSet):
    @ratelimit(key="ip", rate="100/h", method=["POST"])
    @action(detail=False, methods=["post"])
    def create_room(self, request):
        try:
            name = request.data.get("name")
            description = request.data.get("description", "")

            if not name:
                return Response(
                    {"error": "Room name is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            room = ChatRoom.objects.create(name=name, description=description)
            room.participants.add(request.user)

            return Response(
                {"id": room.id, "name": room.name, "description": room.description},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @ratelimit(key="ip", rate="1000/h", method=["GET"])
    @action(detail=True, methods=["get"])
    def get_messages(self, request, pk=None):
        try:
            room = get_object_or_404(ChatRoom, id=pk)
            cache_key = f"room_messages_{room.id}"

            # Try to get messages from cache
            messages = cache.get(cache_key)
            if messages is None:
                messages = room.get_recent_messages()
                # Cache for 5 minutes
                cache.set(cache_key, messages, timeout=300)

            message_data = [
                {
                    "id": str(msg.id),
                    "content": msg.content,
                    "user": msg.user.username,
                    "timestamp": msg.timestamp.isoformat(),
                    "message_type": msg.message_type,
                    "is_modified": msg.is_modified,
                }
                for msg in messages
            ]

            return Response(message_data)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["post"])
    def mark_messages_read(self, request, pk=None):
        try:
            room = get_object_or_404(ChatRoom, id=pk)
            unread_messages = Message.objects.filter(room=room, is_read=False).exclude(
                user=request.user
            )

            for message in unread_messages:
                message.mark_as_read(request.user)

            return Response({"status": "messages marked as read"})

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
