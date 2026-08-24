# Production Deployment Architecture

## Deployment Topology
BatchSaver is designed for on-premise industrial edge deployment (Edge Gateway / IPC) with optional hybrid cloud synchronization.

```
[Industrial Plant Network]
   ├── Sensors / PLCs (OPC-UA / Modbus / 4-20mA DAQ)
   └── Edge Server (BatchSaver Platform)
        ├── Docker Compose / MicroK8s Runtime
        ├── PostgreSQL 16 (Local High-Frequency Storage)
        ├── Mosquitto MQTT Broker
        ├── BatchSaver API Service
        └── BatchSaver Web HMI Dashboard (Touchscreen / Operator Kiosk)
```

## Systemd Service Descriptor (`/etc/systemd/system/batchsaver.service`)

```ini
[Unit]
Description=BatchSaver Industrial IoT & Quality Platform
After=network.target docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/batchsaver
ExecStart=/usr/bin/docker compose -f infrastructure/docker/docker-compose.yml up -d
ExecStop=/usr/bin/docker compose -f infrastructure/docker/docker-compose.yml down
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
