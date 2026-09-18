import logging
from sqlalchemy import create_engine, text
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init() -> None:
    try:
        logger.info("Connecting to database to enable PostGIS...")
        engine = create_engine(settings.DATABASE_URL, isolation_level="AUTOCOMMIT")
        with engine.connect() as connection:
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            logger.info("Successfully enabled PostGIS extension.")
    except Exception as e:
        logger.error(f"Error enabling PostGIS: {e}")
        raise e

if __name__ == "__main__":
    init()
