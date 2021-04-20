import os
from loguru import logger

APP_FOLDER = os.path.dirname(os.path.realpath(__file__))
DB_PATH = f"{APP_FOLDER}/data/bikes.db"
logger.add(f"{APP_FOLDER}/logs/api.log", rotation="1 MB")
