#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Crée le superuser seulement s'il n'existe pas déjà (ne fait pas planter le build sinon)
python manage.py createsuperuser --noinput || echo "Superuser déjà existant ou variables non définies, on continue."