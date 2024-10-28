#!/bin/bash

# Apply database migrations
echo "Apply database migrations"
python manage.py collectstatic
python manage.py makemigrations
python manage.py migrate

# Start Django server
echo "Starting Django server"
python manage.py runserver 0.0.0.0:8000