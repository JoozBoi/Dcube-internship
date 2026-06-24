import asyncio
from database import engine, Base
import models  # ensures all models are registered with Base


async def setup():
    async with engine.begin() as conn:
        print("🗑️  Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("🏗️  Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database setup complete!")


if __name__ == "__main__":
    asyncio.run(setup())