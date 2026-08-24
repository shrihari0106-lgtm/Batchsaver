# BatchSaver Deployment Guide

## 1. Local Edge Deployment (Docker Compose)

To start the full local infrastructure stack:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

This starts:
- PostgreSQL on `localhost:5432` with auto-initialized schema
- Mosquitto MQTT broker on `localhost:1883` and `localhost:9001`
- BatchSaver API service on `localhost:4000`
- BatchSaver Web HMI dashboard on `localhost:3000`

## 2. Production Hardening Checklist
- [ ] Change all default database and JWT passwords in production `.env`.
- [ ] Enable TLS/SSL certificates for REST, WebSocket, and MQTT endpoints.
- [ ] Restrict database network access to localhost / internal Docker network.
- [ ] Mount persistent storage volumes for PostgreSQL data (`/var/lib/postgresql/data`).
- [ ] Configure automatic log rotation for high-frequency sensor readings.
