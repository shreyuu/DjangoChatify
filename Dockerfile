FROM node:16-alpine as frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
COPY --from=frontend /app/frontend/build /app/static
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]