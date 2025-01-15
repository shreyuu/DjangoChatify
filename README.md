# DjangoChatify: Real-Time Chat Application

## Overview

**DjangoChatify** is a real-time chat application built with Django on the backend and React.js on the frontend. It uses WebSockets (via Django Channels) for instant communication and MongoDB for message storage. Tailwind CSS enhances the frontend with a clean, responsive design.

---

## Features

- 🔄 **Real-Time Messaging**: Powered by WebSockets.
- 📦 **Scalable Backend**: Built with Django Channels.
- 💅 **Responsive Design**: Styled using Tailwind CSS.
- 🗂️ **MongoDB Database**: For efficient message storage.
- 💻 **Cross-Platform**: Supports macOS and Windows.

---

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Django, Django Channels, WebSockets
- **Database**: MongoDB

---

## Prerequisites

- Python (3.9+)
- Node.js (16+)
- MongoDB (local or cloud)
- VS Code or your preferred code editor
- Redis (for WebSocket channel layers)
- **macOS** or **Windows**

---

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/shreyuu/djangochatify.git
cd djangochatify
```

### Backend Setup (Django)

### macOS

1. **Set up a virtual environment**:

    ```bash
    python3 -m venv env
    source env/bin/activate
    ```

2. **Install dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

3. **Run the MongoDB service**:
    - Ensure MongoDB is running locally or use a cloud-based service like MongoDB Atlas.

4. **Set up Redis**:
    - Install Redis via Homebrew:

        ```bash
        brew install redis
        brew services start redis
        ```

5. **Run database migrations**:

    ```bash
    python manage.py migrate
    ```

6. **Start the Django server**:

    ```bash
    python manage.py runserver
    ```

### Windows

1. **Set up a virtual environment**:

    ```bash
    python -m venv env
    env\Scripts\activate
    ```

2. **Install dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

3. **Run the MongoDB service**:
    - Ensure MongoDB is running locally or use a cloud-based service like MongoDB Atlas.
4. **Set up Redis**:
    - Download Redis for Windows from Microsoft’s GitHub repository.
    - Start the Redis server:

        ```bash
        redis-server
        ```

5. **Run database migrations**:

    ```bash
    python manage.py migrate
    ```

6. **Start the Django server**:

    ```bash
    python manage.py runserver
    ```

### Frontend Setup (React.js)

macOS & Windows

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

## Running the Application

1. Open the Django backend at <http://127.0.0.1:8000/>.
2. Access the React frontend at <http://localhost:3000/>.
3. Chat in real-time by joining a room!

## Folder Structure

```plaintext
DjangoChatify/
├── backend/ (Django project)
│   ├── chat/ (Django app)
│   ├── realtime_chat/ (Django settings)
│   └── manage.py
├── frontend/ (React project)
│   ├── src/
│   ├── public/
│   └── package.json
├── requirements.txt
└── README.md
```

## Troubleshooting

- **MongoDB Connection**: Ensure MongoDB is running, and the connection URI in settings.py is correct.
- **Redis Not Found**: Check if Redis is installed and running.
- **CORS Errors**: Add the frontend URL to Django’s CORS_ALLOWED_ORIGINS.

## License

This project is licensed under the MIT License.

## Author

Developed by [Shreyash Meshram](https://github.com/shreyuu). Feel free to connect or contribute!
