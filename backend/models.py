import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from .database import Base


def new_id() -> str:
    return str(uuid.uuid4())


class TimestampedModel:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class User(TimestampedModel, Base):
    __tablename__ = "users"
    uid = Column(String(64), primary_key=True, default=new_id)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="traveller")
    bio = Column(Text)
    contact_no = Column(String(40))
    company_name = Column(String(200))
    is_verified = Column(Boolean, nullable=False, default=False)


class Post(TimestampedModel, Base):
    __tablename__ = "posts"
    id = Column(String(64), primary_key=True, default=new_id)
    author_email = Column(String(255), ForeignKey("users.email"), index=True)
    author = Column(String(100))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    location = Column(String(200))
    cost = Column(String(100))
    duration = Column(String(100))
    image_url = Column(String(2000))
    highlights = Column(JSONB, nullable=False, default=list)
    day_by_day = Column(JSONB, nullable=False, default=list)


class PostVote(TimestampedModel, Base):
    __tablename__ = "post_votes"
    __table_args__ = (UniqueConstraint("post_id", "voter_email", name="uq_post_vote_user"),)
    id = Column(String(64), primary_key=True, default=new_id)
    post_id = Column(String(64), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    voter_email = Column(String(255), ForeignKey("users.email"), nullable=False)
    direction = Column(Integer, nullable=False)


class Comment(TimestampedModel, Base):
    __tablename__ = "comments"
    id = Column(String(64), primary_key=True, default=new_id)
    post_id = Column(String(64), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(String(64), ForeignKey("comments.id", ondelete="CASCADE"))
    author_email = Column(String(255), ForeignKey("users.email"))
    author = Column(String(100))
    text = Column(Text, nullable=False)


class TravelPackage(TimestampedModel, Base):
    __tablename__ = "packages"
    id = Column(String(64), primary_key=True, default=new_id)
    owner_email = Column(String(255), ForeignKey("users.email"), index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    destination = Column("location", String(200))
    price = Column(String(100))
    duration = Column(String(100))
    agency_name = Column("agency", String(200))
    image_url = Column(String(2000))
    highlights = Column(JSONB, nullable=False, default=list)
    inclusions = Column(JSONB, nullable=False, default=list)
    day_by_day = Column(JSONB, nullable=False, default=list)
    status = Column(String(20), nullable=False, default="active")
    rating = Column(Integer, nullable=False, default=0)
    reviews_count = Column(Integer, nullable=False, default=0)


class Verification(TimestampedModel, Base):
    __tablename__ = "verifications"
    id = Column(String(64), primary_key=True, default=new_id)
    agency_email = Column(String(255), ForeignKey("users.email"), nullable=False, index=True)
    company_name = Column(String(200), nullable=False)
    documents = Column(JSONB, nullable=False, default=list)
    status = Column(String(20), nullable=False, default="pending")
    reviewed_by = Column(String(255), ForeignKey("users.email"))
    review_note = Column(Text)
    reviewed_at = Column(DateTime(timezone=True))


class FlaggedPost(TimestampedModel, Base):
    __tablename__ = "flagged_posts"
    id = Column(String(64), primary_key=True, default=new_id)
    post_id = Column(String(64), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    reporter_email = Column(String(255), ForeignKey("users.email"))
    reason = Column(String(100), nullable=False)
    content = Column(Text)
    status = Column(String(20), nullable=False, default="open")


class CommentReport(TimestampedModel, Base):
    __tablename__ = "comment_reports"
    id = Column(String(64), primary_key=True, default=new_id)
    comment_id = Column(String(64), ForeignKey("comments.id", ondelete="CASCADE"), nullable=False, index=True)
    reporter_email = Column(String(255), ForeignKey("users.email"))
    reason = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default="open")
