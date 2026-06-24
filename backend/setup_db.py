import asyncio

from . import models  # Registers every model with SQLAlchemy metadata.
from .database import Base, engine


async def setup() -> None:
    async with engine.begin() as connection:
        print("Dropping existing application tables...")
        await connection.run_sync(Base.metadata.drop_all)
        print("Creating application tables...")
        await connection.run_sync(Base.metadata.create_all)
        print("Database setup complete.")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(setup())
