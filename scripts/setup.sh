#!/bin/bash

echo "Starting Setup.."
# Check if the .env.tpl file exists one folder up
if [ -e ../.env.tpl ]; then
  # Create .env
  cp ../.env.tpl ../.env3
  echo "Create .env file"
else
  echo "The .env.tpl file in the parent directory was not found. Please make sure it exists in the project"
fi


echo "Create docker image for database.."
# Move to the docker directory
cd ../docker
# Build the mariadb image
docker build -t mariadb:lts .
cd ..


echo "Install dependencies.."
npm install