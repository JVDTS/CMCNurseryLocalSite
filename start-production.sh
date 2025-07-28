#!/bin/bash

# Production startup script for the nursery management platform
# This script builds the application and starts it in production mode

echo "Building application for production..."
npm run build

echo "Starting application in production mode..."
NODE_ENV=production node dist/index.js