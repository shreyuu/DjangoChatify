# DjangoChatify: Real-Time Chat Application

## Overview

**DjangoChatify** is a real-time chat application built with Django on the backend and React.js on the frontend. It uses WebSockets (via Django Channels) for instant communication and MongoDB for message storage. Tailwind CSS enhances the frontend with a clean, responsive design.

---

## Features

- 🔄 **Real-Time Messaging**: Powered by WebSockets via Django Channels.
- 📦 **Scalable Backend**: Built with Django, with Gunicorn for production.
- 💅 **Responsive Design**: Styled using Tailwind CSS.
- 🗂️ **PostgreSQL Database**: For primary data storage with optimized models.
- 💻 **Cross-Platform**: Supports macOS and Windows.
- 🐳 **Dockerized**: Complete Docker setup for easy development and deployment.
- 🔒 **Security**: Production-ready with non-root user container setup.
- 🧪 **Comprehensive Tests**: Includes unit and WebSocket tests.
- 🚀 **CI/CD**: GitHub Actions workflow with code quality checks.

---

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Django, Django Channels, WebSockets
- **Database**: PostgreSQL, Redis (for WebSocket channels)
- **Deployment**: Docker, Docker Compose, Gunicorn

---

## Prerequisites

- Python (3.9+)
- Node.js (16+)
- Docker and Docker Compose (for containerized setup)
- VS Code or your preferred code editor
- **macOS** or **Windows**

---

## Setup Instructions

### Using Docker (Recommended)

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/shreyuu/djangochatify.git
   cd djangochatify
   ```

2. **Create Environment File**:

   Create a `.env` file in the project root based on the `.env.example` template.

3. **Build and Run with Docker Compose**:

   ```bash
   docker-compose up --build
   ```

4. **Access the Application**:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

### Manual Setup

#### Backend Setup (Django)

1. **Set up a virtual environment**:

   ```bash
   python -m venv djangochatifyenv
   source djangochatifyenv/bin/activate  # On Windows: djangochatifyenv\Scripts\activate
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL and Redis**:

   - Ensure both services are running
   - Create a database named `djangochatify_db`

4. **Create a .env file**:

   - Use the `.env.example` as a template

5. **Run database migrations**:

   ```bash
   python manage.py migrate
   ```

6. **Start the Django server**:

   ```bash
   python manage.py runserver
   ```

#### Frontend Setup (React.js)

1. **Navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the React development server**:

   ```bash
   npm start
   ```

## Running Tests

```bash
# Run all tests
pytest

# Run specific tests
pytest chat/tests.py

# Run with verbose output
pytest -v
```

## Health Check Endpoint

The application includes a health check endpoint at `/health/` that monitors:

- Database connectivity
- Redis connectivity

## Production Deployment

For production deployment:

1. **Build the Docker images**:

   ```bash
   docker-compose build
   ```

2. **Deploy with proper environment variables**:

   - Set `DEBUG=False` in your production `.env` file
   - Set proper `ALLOWED_HOSTS` for your domain
   - Use a strong `SECRET_KEY`

3. **Run with**:
   ```bash
   docker-compose up -d
   ```

## License

This project is licensed under the MIT License.

## Author

Developed by [Shreyash Meshram](https://github.com/shreyuu). Feel free to connect or contribute!
