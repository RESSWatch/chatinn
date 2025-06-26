import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://chatinn:chatinn@localhost:5432/chatinn")
engine = create_async_engine(DATABASE_URL, echo=False, pool_size=5, max_overflow=10)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()
async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session
