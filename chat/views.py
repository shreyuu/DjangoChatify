from django.shortcuts import render
from django.http import JsonResponse
from django.db import connections
from django.db.utils import OperationalError
from redis import Redis
from django.conf import settings

# Create your views here.

def health_check(request):
    """
    Health check endpoint for the application.
    Checks database and Redis connections.
    """
    # Check database connection
    db_healthy = True
    try:
        connections['default'].cursor()
    except OperationalError:
        db_healthy = False
    
    # Check Redis connection
    redis_healthy = True
    try:
        redis_host = settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0][0]
        redis_port = settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0][1]
        r = Redis(host=redis_host, port=redis_port)
        r.ping()
    except Exception:
        redis_healthy = False
    
    status = 200 if db_healthy and redis_healthy else 503
    
    response_data = {
        'status': 'healthy' if status == 200 else 'unhealthy',
        'database': 'up' if db_healthy else 'down',
        'redis': 'up' if redis_healthy else 'down',
    }
    
    return JsonResponse(data=response_data, status=status)
