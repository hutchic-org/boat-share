# Nuxt3 PWA for Boat Sharing

This repository contains the source code for a Nuxt3 Progressive Web App (PWA) designed to facilitate the sharing of a boat among a pre-defined set of users.

## Table of Contents

- [Project Setup](#project-setup)
- [Development](#development)
- [Makefile Commands](#makefile-commands)
- [License](#license)

## Project Setup

This project is set up with Docker and Docker Compose to streamline the development environment. The setup includes:

- A Dockerfile to create a consistent environment for the Nuxt3 application.
- A docker-compose.yml file to manage containerized services.
- A Makefile to simplify common development tasks.

## Development

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Clone the Repository

```bash
git clone https://github.com/<your-github-username>/<repo-name>.git
cd <repo-name>
```

### Build the Docker Image

To build the Docker image, run:

```bash
make build
```

### Start the Development Environment

To start the development environment, run:

```bash
make dev
```

This will start the Nuxt3 development server, and you can access the application at `http://localhost:3000`.

### View Logs

To view the logs for the development environment, run:

```bash
make logs
```

### Clean the Environment

To stop and clean up the Docker containers, and remove volumes and images, run:

```bash
make clean
```

## Makefile Commands

The Makefile provides the following commands to streamline development tasks:

- **build**: Build the Docker images.
- **dev**: Start the development environment.
- **logs**: View the logs for the development environment.
- **clean**: Clean up the Docker environment by removing containers, volumes, and images, and deleting local node_modules and .nuxt directories.
