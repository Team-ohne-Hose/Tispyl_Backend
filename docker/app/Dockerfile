# Stage 1: Build the application
FROM node:16.10-alpine AS build

# Create a directory for your application
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY ./package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY ../.. .

# Stage 2: Create a lightweight production image
FROM node:16.10-alpine

# Set the working directory within the container to /app
WORKDIR /app

# Copy the built application and its dependencies from the 'build' stage
COPY --from=build /app /app

# Expose port 25670, indicating your application will listen on this port
EXPOSE 25670

# Run the production start script to start your application
CMD ["npm", "run", "start:prod"]