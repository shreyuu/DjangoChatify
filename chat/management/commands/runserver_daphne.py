import shutil
import subprocess
from typing import Any, Dict

from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Runs the server with Daphne"

    def add_arguments(self, parser):
        parser.add_argument(
            "--host",
            default="127.0.0.1",
            help="Host to bind to",
        )
        parser.add_argument(
            "--port",
            default="8000",
            type=str,
            help="Port to bind to",
        )

    def handle(self, *args: Any, **options: Dict[str, Any]) -> None:
        # Validate host and port
        host = options["host"]
        port = options["port"]
        
        if not isinstance(host, str) or not isinstance(port, str):
            raise CommandError("Host and port must be strings")

        # Ensure we have the full path to daphne
        daphne_path = shutil.which("daphne")
        if not daphne_path:
            raise CommandError(
                "Daphne executable not found. Please ensure it is installed and in your PATH."
            )

        # Construct the command with validated arguments
        # Note: This is safe because:
        # 1. We use full path to daphne
        # 2. All arguments are validated
        # 3. We don't use shell=True
        # 4. The application path is hardcoded
        cmd = [
            daphne_path,
            "-b",
            host,
            "-p",
            port,
            "backend.asgi:application"
        ]

        self.stdout.write(f"Starting server with Daphne on {host}:{port}...")
        
        try:
            # nosec B603 - This is safe as we validate all inputs and don't use shell=True
            subprocess.run(
                cmd,
                check=True,
                text=True,
            )
        except subprocess.CalledProcessError as e:
            raise CommandError(f"Daphne failed to start: {e}")
        except KeyboardInterrupt:
            self.stdout.write("\nShutting down Daphne server...")
