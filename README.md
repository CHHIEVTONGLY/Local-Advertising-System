# Local Advertising System (Unfinished)

A full-stack advertising platform for creating, managing, and delivering digital advertisements with real-time communication and AI-powered image detection.

This project is inspired by the concept of **Times Square billboard advertising**, adapted into a local digital advertising platform.

# Features

- Microservice architecture
- Telegram Bot for notifications and approval
- User authentication and authorization
- Advertisement creation and management
- Advertisement scheduling
- Real-time advertisement communication
- Billing and payment management (Internal Wallet / Stripe)
- Fine-tuned AI image detection for detecting prohibited content
- IoT integration (ESP32 + LED display)
- Docker-based development and deployment

# Planned Features

- [ ] Advertisement analytics
- [ ] Campaign scheduling
- [ ] Advanced reporting
- [ ] Dynamic advertisement pricing based on weather and prime time using AI

# Project Status

> **Status: Unfinished**

This project was developed as a school project. The core system architecture and main services were implemented as part of the project requirements.

Development has been discontinued after the completion of the project, so the remaining planned features are not currently being developed or maintained.

# Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS v4

### Backend

- Node.js
- Express.js
- TypeScript

### AI

- Python
- YOLOv8
- FastAPI

### Infrastructure

- Docker
- Docker Compose
- Kong API Gateway
- AWS S3

### Real-Time Communication

- WebSocket

### IoT

- ESP32
- LED 32×32
- Arduino

# Project Structure

```text
Local-Advertising-System/
├── admin/
├── backend/
│   ├── Ads-Service/
│   ├── Billing-Service/
│   ├── image-detector-ai/
│   ├── kong-gateway/
│   ├── Telegram-Bot/
│   ├── User-Service/
│   └── websocket/
├── frontend/
├── docs/
│   ├── System Requirements Specifications.pdf
│   ├── Design System.pdf
│   ├── Implementation Documentation.pdf
│   ├── Testing Documentation.pdf
│   ├── User Documentation.pdf
│   └── Maintenance & Support Documentation.pdf
├── docker-compose.yml
└── README.md
```

# Requirements

Before running the project, make sure you have installed:

- Git
- Node.js 18.x or higher
- Docker
- Docker Compose
- Python 3.x or higher

## External Services

The system requires access to the following external services:

- MongoDB
- AWS S3

## Hardware Requirements

The IoT component requires:

- ESP32 with Wi-Fi support
- 32×32 LED display

# Getting Started

## Clone the Repository

```bash
git clone git@github.com:CHHIEVTONGLY/Local-Advertising-System.git
cd Local-Advertising-System
```

## Environment Variables

Each service requires its own environment configuration.

For GitHub projects, use `.env.example` files to document the required environment variables without exposing sensitive credentials.

### Environment Configuration

```text
Local-Advertising-System/
├── frontend/
│   └── .env.example
├── backend/
│   ├── Ads-Service/
│   │   └── .env.example
│   ├── Billing-Service/
│   │   └── .env.example
│   ├── image-detector-ai/
│   │   └── .env.example
│   ├── kong-gateway/
│   ├── Telegram-Bot/
│   │   └── .env.example
│   ├── User-Service/
│   │   └── .env.example
│   └── websocket/
│       └── .env.example
└── docker-compose.yml
```

Copy each `.env.example` file to `.env` and configure the required values.

For example:

```bash
cp frontend/.env.example frontend/.env
cp backend/Ads-Service/.env.example backend/Ads-Service/.env
cp backend/Billing-Service/.env.example backend/Billing-Service/.env
cp backend/User-Service/.env.example backend/User-Service/.env
cp backend/websocket/.env.example backend/websocket/.env
cp backend/Telegram-Bot/.env.example backend/Telegram-Bot/.env
cp backend/image-detector-ai/.env.example backend/image-detector-ai/.env
```

### Environment Configuration Overview

| Service           | Environment File                 | Purpose                               |
| ----------------- | -------------------------------- | ------------------------------------- |
| Frontend          | `frontend/.env`                  | Frontend API and public configuration |
| Ads Service       | `backend/Ads-Service/.env`       | Advertisement service configuration   |
| Billing Service   | `backend/Billing-Service/.env`   | Billing and payment configuration     |
| Image Detector AI | `backend/image-detector-ai/.env` | AI image detection configuration      |
| Telegram Bot      | `backend/Telegram-Bot/.env`      | Telegram Bot configuration            |
| User Service      | `backend/User-Service/.env`      | Authentication and user management    |
| WebSocket         | `backend/websocket/.env`         | Real-time communication configuration |

For the complete list of environment variables, their descriptions, and required values, see the [Implementation Documentation](./docs/Implementation%20Documentation.pdf).

> **Important:** Never commit actual `.env` files or sensitive credentials to the repository.

## Run the Project

After configuring the environment variables, start the application using Docker Compose:

```bash
docker compose up -d --build
```

To view running containers:

```bash
docker compose ps
```

To view logs:

```bash
docker compose logs -f
```

# Documentation

The complete system documentation is organized into six documents covering the system requirements, design, implementation, testing, user instructions, and maintenance procedures.

| #   | Document                                                                                      | Description                                                              |
| --- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 01  | [System Requirements Specifications](./docs/System%20Requirements%20Specifications.pdf)       | System requirements, features, constraints, and business rules           |
| 02  | [Design System](./docs/Design%20System.pdf)                                                   | UI/UX guidelines, components, colors, typography, and design standards   |
| 03  | [Implementation Documentation](./docs/Implementation%20Documentation.pdf)                     | Architecture, technology stack, services, APIs, database, and deployment |
| 04  | [Testing Documentation](./docs/Testing%20Documentation.pdf)                                   | Testing strategy, test cases, results, and validation                    |
| 05  | [User Documentation](./docs/User%20Documentation.pdf)                                         | User guides and instructions for using the platform                      |
| 06  | [Maintenance & Support Documentation](./docs/Maintenance%20%26%20Support%20Documentation.pdf) | Maintenance, troubleshooting, monitoring, backup, and support procedures |


# Quick Demo Video 

<video src="./demo/demo.mp4" controls></video>