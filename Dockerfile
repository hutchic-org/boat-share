FROM node:22-bullseye@sha256:549b964736c2d5c02112fd369037e981f8b935083d6fdf1a924b831930946b6c

# Set working directory
WORKDIR /src

# Install dependencies
COPY app/package.json app/package-lock.json ./
RUN npm install

# Copy project files
COPY app/ .

# Build the project
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
