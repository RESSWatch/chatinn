import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from database import Base

class Conversation(Base):
    __tablename__ = "conversation"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    started_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    messages: Mapped[list["Message"]] = relationship(back_populates="conversation")

class Message(Base):
    __tablename__ = "message"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    conversation_id: Mapped[int] = mapped_column(sa.ForeignKey("conversation.id"))
    role: Mapped[str] = mapped_column(sa.String(20))
    content: Mapped[str] = mapped_column(sa.Text())
    ts: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
