from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class APIModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class UserCreate(APIModel):
    uid: str | None = None
    email: EmailStr
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=128)
    role: Literal["traveller", "agency", "admin"] = "traveller"
    bio: str | None = Field(default=None, max_length=2000)
    contact_no: str | None = Field(default=None, alias="contactNo", max_length=40)
    company_name: str | None = Field(default=None, alias="companyName", max_length=200)


class UserUpdate(APIModel):
    username: str | None = Field(default=None, min_length=1, max_length=100)
    bio: str | None = Field(default=None, max_length=2000)
    contact_no: str | None = Field(default=None, alias="contactNo", max_length=40)
    company_name: str | None = Field(default=None, alias="companyName", max_length=200)


class UserLogin(APIModel):
    identifier: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)
    role: Literal["traveller", "agency", "admin"]


class PostCreate(APIModel):
    author_email: EmailStr | None = Field(default=None, alias="authorEmail")
    author: str | None = Field(default=None, max_length=100)
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    location: str | None = Field(default=None, max_length=200)
    cost: str | None = Field(default=None, max_length=100)
    duration: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, alias="imageUrl", max_length=2000)
    highlights: list[str] = Field(default_factory=list)
    day_by_day: list[dict] = Field(default_factory=list, alias="dayByDay")


class VoteCreate(APIModel):
    voter_email: EmailStr = Field(alias="voterEmail")
    direction: Literal["up", "down"]


class CommentCreate(APIModel):
    author_email: EmailStr | None = Field(default=None, alias="authorEmail")
    author: str | None = Field(default=None, max_length=100)
    text: str = Field(min_length=1, max_length=5000)
    parent_id: str | None = Field(default=None, alias="parentId")


class PackageCreate(APIModel):
    owner_email: EmailStr | None = Field(default=None, alias="ownerEmail")
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    destination: str | None = Field(default=None, max_length=200)
    price: str | float | int | None = None
    duration: str | None = Field(default=None, max_length=100)
    agency_name: str | None = Field(default=None, alias="agencyName", max_length=200)
    image_url: str | None = Field(default=None, alias="imageUrl", max_length=2000)
    highlights: list[str] = Field(default_factory=list)
    inclusions: list[str] = Field(default_factory=list)
    day_by_day: list[dict] = Field(default_factory=list, alias="dayByDay")
    status: Literal["active", "inactive", "draft"] = "active"


class VerificationCreate(APIModel):
    agency_email: EmailStr = Field(alias="agencyEmail")
    company_name: str = Field(alias="companyName", min_length=1, max_length=200)
    documents: list[dict] = Field(default_factory=list)


class VerificationApproval(APIModel):
    approved: bool
    reviewer_email: EmailStr = Field(alias="reviewerEmail")
    review_note: str | None = Field(default=None, alias="reviewNote", max_length=2000)


class FlaggedPostCreate(APIModel):
    post_id: str = Field(alias="postId")
    reporter_email: EmailStr | None = Field(default=None, alias="reporterEmail")
    reason: str = Field(min_length=1, max_length=100)
    content: str | None = Field(default=None, max_length=5000)


class CommentReportCreate(APIModel):
    comment_id: str = Field(alias="commentId")
    reporter_email: EmailStr | None = Field(default=None, alias="reporterEmail")
    reason: str = Field(min_length=1, max_length=100)


class InspireRequest(APIModel):
    vibe: str = Field(min_length=3, max_length=500)
