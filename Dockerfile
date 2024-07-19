# Use Node.js 22 image
FROM node:22-bullseye@sha256:549b964736c2d5c02112fd369037e981f8b935083d6fdf1a924b831930946b6c

# Set build-time arguments
ARG NODE_ENV=development

# Set environment variables
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /src

# Install dependencies
COPY app/package.json app/package-lock.json ./
RUN npm install

# Copy project files and set permissions
COPY --chown=node:node app/ .

# Change to non-root user
USER node

# Expose port 3000
EXPOSE 3000

# Default command for development
CMD ["npm", "run", "dev"]
