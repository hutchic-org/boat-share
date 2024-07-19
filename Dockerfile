# Use Node.js 22 image
FROM node:22-bullseye@sha256:549b964736c2d5c02112fd369037e981f8b935083d6fdf1a924b831930946b6c

# Set build-time arguments
ARG USER_ID
ARG GROUP_ID

# Set environment variables
ENV USER_ID=${USER_ID}
ENV GROUP_ID=${GROUP_ID}

# Set working directory
WORKDIR /src

# Install dependencies
COPY app/package.json app/package-lock.json ./
RUN npm install

# Copy project files
COPY app/ .

# Ensure the correct ownership of the directories
RUN chown -R node:node /src

# Expose port 3000
EXPOSE 3000

# Default command for development
USER node
CMD ["npm", "run", "dev"]
