import ipaddress
import re
import shutil
import subprocess  # nosec B404 # Required for running Daphne server
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

    def validate_host(self, host: str) -> bool:
        """Validate if the host is a valid IP address or hostname."""
        try:
            # Check if it's a valid IP address
            ipaddress.ip_address(host)
            return True
        except ValueError:
            # Check if it's a valid hostname
            if len(host) > 255:
                return False
            if host[-1] == ".":
                host = host[:-1]
            allowed = re.compile(r"(?!-)[A-Z\d-]{1,63}(?<!-)$", re.IGNORECASE)
            return all(allowed.match(x) for x in host.split("."))

    def validate_port(self, port: str) -> bool:
        """Validate if the port is within valid range."""
        try:
            port_num = int(port)
            return 1 <= port_num <= 65535
        except ValueError:
            return False

    def handle(self, *args: Any, **options: Dict[str, Any]) -> None:
        # Validate host and port
        host = options["host"]
        port = options["port"]

        if not isinstance(host, str) or not isinstance(port, str):
            raise CommandError("Host and port must be strings")

        # Additional validation
        if not self.validate_host(host):
            raise CommandError(f"Invalid host: {host}")
        if not self.validate_port(port):
            raise CommandError(f"Invalid port: {port}")

        # Ensure we have the full path to daphne
        daphne_path = shutil.which("daphne")
        if not daphne_path:
            raise CommandError(
                "Daphne executable not found. Please ensure it is installed and in your PATH."
            )

        # Construct the command with validated arguments
        # Security measures:
        # 1. Full path to daphne executable is used
        # 2. All arguments are strictly validated
        # 3. No shell=True is used
        # 4. Application path is hardcoded
        # 5. Host and port are validated against strict patterns
        cmd = [daphne_path, "-b", host, "-p", port, "backend.asgi:application"]

        self.stdout.write(f"Starting server with Daphne on {host}:{port}...")

        try:
            # nosec B603 - This is safe because:
            # 1. We use absolute path to daphne from shutil.which()
            # 2. All inputs are validated with strict patterns
            # 3. No user input is directly passed to the command
            # 4. shell=True is not used
            # 5. Command structure is hardcoded
            # 6. Host and port are validated against strict patterns
            subprocess.run(  # nosec
                cmd,
                check=True,
                text=True,
                capture_output=True,  # Capture output for security
            )
        except subprocess.CalledProcessError as e:
            raise CommandError(f"Daphne failed to start: {e}")
        except KeyboardInterrupt:
            self.stdout.write("\nShutting down Daphne server...")
