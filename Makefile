.PHONY: build dev logs clean package stop restart exec

# Build the Docker images
build:
	UID=$$(id -u) GID=$$(id -g) docker compose build

# Start the development environment
dev: build
	UID=$$(id -u) GID=$$(id -g) docker compose up -d

# Stop the development environment
stop:
	docker compose stop

# Restart the development environment
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

# Generate the static site
package: clean dev
	docker compose exec --user=root nuxt chown -R node:node /src
	UID=$$(id -u) GID=$$(id -g) docker compose exec nuxt /bin/bash -c "npx nuxt generate --preset github_pages"
	cd app/.output/public && ln -s . boat-share || true
