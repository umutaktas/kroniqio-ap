#!/bin/sh

# Set default values
export AP_APP_TITLE="${AP_APP_TITLE:-Activepieces}"
export AP_FAVICON_URL="${AP_FAVICON_URL:-https://cdn.activepieces.com/brand/favicon.ico}"
export AP_PORT="${AP_PORT:-3000}"

# Debug: Print important environment variables
echo "Starting Activepieces on Render.com"
echo "AP_PORT: $AP_PORT"
echo "AP_FRONTEND_URL: $AP_FRONTEND_URL"
echo "AP_CACHE_PATH: $AP_CACHE_PATH"
echo "AP_DB_TYPE: $AP_DB_TYPE"

# Process environment variables in index.html
envsubst '${AP_APP_TITLE} ${AP_FAVICON_URL}' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp && \
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

# Start Redis if needed
if [ "$AP_QUEUE_MODE" != "MEMORY" ]; then
    echo "Starting Redis server..."
    redis-server --daemonize yes
fi

# Start Nginx
echo "Starting Nginx..."
nginx -g "daemon off;" &

# Wait a bit for nginx to start
sleep 2

# Start backend server on port 3000
echo "Starting backend server on port $AP_PORT..."
cd /usr/src/app
exec node --enable-source-maps dist/packages/server/api/main.js