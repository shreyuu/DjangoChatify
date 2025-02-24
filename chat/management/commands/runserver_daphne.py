from django.core.management.base import BaseCommand
import subprocess

class Command(BaseCommand):
    help = 'Runs the server with Daphne'

    def handle(self, *args, **options):
        self.stdout.write('Starting server with Daphne...')
        subprocess.run([
            'daphne',
            '-b', '127.0.0.1',
            '-p', '8000',
            'backend.asgi:application'
        ])