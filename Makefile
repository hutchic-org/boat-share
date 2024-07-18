.PHONY: build dev logs clean

# Build the Docker images
build:
	docker compose build

# Start the development environment
dev:
	docker compose up -d

stop:
	docker compose stop

restart:
	docker compose restart

# Exec into the development environment
exec:
	docker compose exec nuxt /bin/bash

# View logs for the development environment
logs:
	docker compose logs -f

# Clean up the environment
clean:
	docker compose down -v --rmi all --remove-orphans
	rm -rf node_modules
	rm -rf .nuxt
