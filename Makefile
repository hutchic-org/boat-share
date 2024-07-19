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
	rm -rf node_modules
	rm -rf .nuxt
	rm -rf app/dist

# Generate the static site
package: clean build
	UID=$$(id -u) GID=$$(id -g) docker compose up -d nuxt
	docker compose exec nuxt npm run generate
	$(MAKE) stop
