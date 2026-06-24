import uuid
import bcrypt
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Float, cast, select
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_db
from .models import Comment, CommentReport, FlaggedPost, Post, PostVote, TravelPackage, User, Verification
from .schemas import (CommentCreate, CommentReportCreate, FlaggedPostCreate, InspireRequest,
                      PackageCreate, PostCreate, UserCreate, UserLogin, UserUpdate, VerificationApproval,
                      VerificationCreate, VoteCreate)

api_router = APIRouter()
users_router = APIRouter(prefix="/users", tags=["users"])
posts_router = APIRouter(prefix="/posts", tags=["posts"])
comments_router = APIRouter(tags=["comments"])
packages_router = APIRouter(prefix="/packages", tags=["packages"])
verifications_router = APIRouter(prefix="/verifications", tags=["verifications"])
moderation_router = APIRouter(tags=["moderation"])
ai_router = APIRouter(prefix="/ai", tags=["ai"])


def not_found(resource: str):
    raise HTTPException(status_code=404, detail=f"{resource} not found")


def user_data(user: User) -> dict:
    return {"uid": user.uid, "email": user.email, "username": user.username, "role": user.role,
            "bio": user.bio, "contactNo": user.contact_no, "companyName": user.company_name,
            "isVerified": user.is_verified, "createdAt": user.created_at}


def package_data(package: TravelPackage) -> dict:
    return {"id": package.id, "ownerEmail": package.owner_email, "title": package.title,
            "description": package.description, "destination": package.destination, "price": package.price,
            "duration": package.duration, "agencyName": package.agency_name, "imageUrl": package.image_url,
            "highlights": package.highlights or [], "inclusions": package.inclusions or [],
            "dayByDay": package.day_by_day or [], "status": package.status, "rating": package.rating,
            "reviewsCount": package.reviews_count, "createdAt": package.created_at}


def verification_data(item: Verification) -> dict:
    return {"id": item.id, "agencyEmail": item.agency_email, "companyName": item.company_name,
            "documents": item.documents or [], "status": item.status, "reviewedBy": item.reviewed_by,
            "reviewNote": item.review_note, "submittedAt": item.created_at, "reviewedAt": item.reviewed_at}


@users_router.get("")
async def list_users(uid: str | None = Query(default=None), db: AsyncSession = Depends(get_db)):
    if uid:
        user = await db.get(User, uid)
        if not user:
            not_found("User")
        return user_data(user)
    return [user_data(user) for user in (await db.execute(select(User).order_by(User.created_at.desc()))).scalars()]


@users_router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    if await db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    values = payload.model_dump(exclude={"uid", "password"})
    values["password_hash"] = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(uid=payload.uid or str(uuid.uuid4()), **values)
    db.add(user)
    await db.commit(); await db.refresh(user)
    return user_data(user)


@users_router.post("/login")
async def login_user(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    identifier = payload.identifier.strip().lower()
    user = await db.scalar(select(User).where(User.email == identifier, User.role == payload.role))
    if not user:
        user = await db.scalar(select(User).where(User.username.ilike(identifier), User.role == payload.role))
    if not user or not bcrypt.checkpw(payload.password.encode("utf-8"), user.password_hash.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid email/username, password, or role")
    return user_data(user)


@users_router.put("/{target_email}")
async def update_user(target_email: str, payload: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == target_email))
    if not user:
        not_found("User")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit(); await db.refresh(user)
    return user_data(user)


def comment_data(comment: Comment, replies: list[dict] | None = None) -> dict:
    return {"id": comment.id, "postId": comment.post_id, "parentId": comment.parent_id,
            "authorEmail": comment.author_email, "author": comment.author, "text": comment.text,
            "createdAt": comment.created_at, "replies": replies or []}


async def post_data(post: Post, db: AsyncSession) -> dict:
    votes = (await db.execute(select(PostVote).where(PostVote.post_id == post.id))).scalars().all()
    comments = (await db.execute(select(Comment).where(Comment.post_id == post.id).order_by(Comment.created_at))).scalars().all()
    by_parent: dict[str | None, list[Comment]] = {}
    for comment in comments:
        by_parent.setdefault(comment.parent_id, []).append(comment)
    def tree(parent_id: str | None):
        return [comment_data(comment, tree(comment.id)) for comment in by_parent.get(parent_id, [])]
    return {"id": post.id, "authorEmail": post.author_email, "author": post.author, "title": post.title,
            "description": post.description, "location": post.location, "cost": post.cost,
            "duration": post.duration, "imageUrl": post.image_url, "highlights": post.highlights or [],
            "dayByDay": post.day_by_day or [], "votes": sum(v.direction for v in votes),
            "commentsCount": len(comments), "comments": tree(None), "createdAt": post.created_at}


@posts_router.get("")
async def list_posts(db: AsyncSession = Depends(get_db)):
    posts = (await db.execute(select(Post).order_by(Post.created_at.desc()))).scalars().all()
    return [await post_data(post, db) for post in posts]


@posts_router.post("", status_code=status.HTTP_201_CREATED)
async def create_post(payload: PostCreate, db: AsyncSession = Depends(get_db)):
    values = payload.model_dump()
    post = Post(id=str(uuid.uuid4()), **values)
    db.add(post); await db.commit(); await db.refresh(post)
    return await post_data(post, db)


@posts_router.post("/{post_id}/vote")
async def vote_post(post_id: str, payload: VoteCreate, db: AsyncSession = Depends(get_db)):
    if not await db.get(Post, post_id):
        not_found("Post")
    if not await db.scalar(select(User).where(User.email == payload.voter_email)):
        not_found("Voter")
    vote = await db.scalar(select(PostVote).where(PostVote.post_id == post_id, PostVote.voter_email == payload.voter_email))
    direction = 1 if payload.direction == "up" else -1
    if vote: vote.direction = direction
    else: db.add(PostVote(id=str(uuid.uuid4()), post_id=post_id, voter_email=payload.voter_email, direction=direction))
    await db.commit()
    total = await db.scalar(select(PostVote.direction).where(PostVote.post_id == post_id))
    votes = (await db.execute(select(PostVote.direction).where(PostVote.post_id == post_id))).scalars().all()
    return {"postId": post_id, "votes": sum(votes), "direction": payload.direction}


@posts_router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: str, db: AsyncSession = Depends(get_db)):
    post = await db.get(Post, post_id)
    if not post: not_found("Post")
    await db.delete(post); await db.commit()


@comments_router.post("/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED)
async def create_comment(post_id: str, payload: CommentCreate, db: AsyncSession = Depends(get_db)):
    if not await db.get(Post, post_id): not_found("Post")
    if payload.parent_id:
        parent = await db.get(Comment, payload.parent_id)
        if not parent or parent.post_id != post_id: not_found("Parent comment")
    comment = Comment(id=str(uuid.uuid4()), post_id=post_id, **payload.model_dump())
    db.add(comment); await db.commit(); await db.refresh(comment)
    return comment_data(comment)


@comments_router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(comment_id: str, db: AsyncSession = Depends(get_db)):
    comment = await db.get(Comment, comment_id)
    if not comment: not_found("Comment")
    await db.delete(comment); await db.commit()


@packages_router.get("")
async def list_packages(destination: str | None = None, min_price: float | None = Query(default=None, alias="minPrice"),
                        max_price: float | None = Query(default=None, alias="maxPrice"), duration: str | None = None,
                        db: AsyncSession = Depends(get_db)):
    query = select(TravelPackage).where(TravelPackage.status == "active")
    if destination: query = query.where(TravelPackage.destination.ilike(f"%{destination}%"))
    if duration: query = query.where(TravelPackage.duration.ilike(f"%{duration}%"))
    if min_price is not None: query = query.where(cast(TravelPackage.price, Float) >= min_price)
    if max_price is not None: query = query.where(cast(TravelPackage.price, Float) <= max_price)
    return [package_data(item) for item in (await db.execute(query.order_by(TravelPackage.created_at.desc()))).scalars()]


@packages_router.post("", status_code=status.HTTP_201_CREATED)
async def create_package(payload: PackageCreate, db: AsyncSession = Depends(get_db)):
    values = payload.model_dump(); values["price"] = str(values["price"]) if values["price"] is not None else None
    item = TravelPackage(id=str(uuid.uuid4()), **values)
    db.add(item); await db.commit(); await db.refresh(item)
    return package_data(item)


@packages_router.put("/{package_id}")
async def update_package(package_id: str, payload: PackageCreate, db: AsyncSession = Depends(get_db)):
    item = await db.get(TravelPackage, package_id)
    if not item: not_found("Package")
    values = payload.model_dump(); values["price"] = str(values["price"]) if values["price"] is not None else None
    for field, value in values.items(): setattr(item, field, value)
    await db.commit(); await db.refresh(item)
    return package_data(item)


@packages_router.delete("/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_package(package_id: str, db: AsyncSession = Depends(get_db)):
    item = await db.get(TravelPackage, package_id)
    if not item: not_found("Package")
    await db.delete(item); await db.commit()


@verifications_router.get("")
async def list_verifications(status_filter: str | None = Query(default=None, alias="status"), db: AsyncSession = Depends(get_db)):
    query = select(Verification)
    if status_filter: query = query.where(Verification.status == status_filter)
    return [verification_data(item) for item in (await db.execute(query.order_by(Verification.created_at.desc()))).scalars()]


@verifications_router.post("", status_code=status.HTTP_201_CREATED)
async def create_verification(payload: VerificationCreate, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.agency_email))
    if not user: not_found("Agency")
    if user.role != "agency":
        raise HTTPException(status_code=422, detail="Verification requests require an agency account")
    item = Verification(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(item); await db.commit(); await db.refresh(item)
    return verification_data(item)


@verifications_router.post("", status_code=status.HTTP_201_CREATED)
async def create_verification(payload: VerificationCreate, db: AsyncSession = Depends(get_db)):
    item = Verification(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return verification_data(item)


def flagged_data(item: FlaggedPost) -> dict:
    return {"id": item.id, "postId": item.post_id, "reporterEmail": item.reporter_email,
            "reason": item.reason, "content": item.content, "status": item.status, "createdAt": item.created_at}


@moderation_router.get("/flagged-posts")
async def list_flagged_posts(db: AsyncSession = Depends(get_db)):
    return [flagged_data(item) for item in (await db.execute(select(FlaggedPost).order_by(FlaggedPost.created_at.desc()))).scalars()]


@moderation_router.post("/flagged-posts", status_code=status.HTTP_201_CREATED)
async def create_flagged_post(payload: FlaggedPostCreate, db: AsyncSession = Depends(get_db)):
    if not await db.get(Post, payload.post_id): not_found("Post")
    item = FlaggedPost(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(item); await db.commit(); await db.refresh(item)
    return flagged_data(item)


@moderation_router.delete("/flagged-posts/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def resolve_flagged_post(report_id: str, db: AsyncSession = Depends(get_db)):
    item = await db.get(FlaggedPost, report_id)
    if not item: not_found("Flagged post report")
    await db.delete(item); await db.commit()


def comment_report_data(item: CommentReport) -> dict:
    return {"id": item.id, "commentId": item.comment_id, "reporterEmail": item.reporter_email,
            "reason": item.reason, "status": item.status, "createdAt": item.created_at}


@moderation_router.get("/comment-reports")
async def list_comment_reports(db: AsyncSession = Depends(get_db)):
    return [comment_report_data(item) for item in (await db.execute(select(CommentReport).order_by(CommentReport.created_at.desc()))).scalars()]


@moderation_router.post("/comment-reports", status_code=status.HTTP_201_CREATED)
async def create_comment_report(payload: CommentReportCreate, db: AsyncSession = Depends(get_db)):
    if not await db.get(Comment, payload.comment_id): not_found("Comment")
    item = CommentReport(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(item); await db.commit(); await db.refresh(item)
    return comment_report_data(item)


@moderation_router.delete("/comment-reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def resolve_comment_report(report_id: str, db: AsyncSession = Depends(get_db)):
    item = await db.get(CommentReport, report_id)
    if not item: not_found("Comment report")
    await db.delete(item); await db.commit()


@ai_router.post("/inspire")
async def inspire_trip(payload: InspireRequest):
    return {"id": f"ai-{uuid.uuid4()}", "title": f"A {payload.vibe.strip().title()} Escape",
            "location": "Ubud, Bali, Indonesia", "cost": "$620 USD", "duration": "4 Days, 3 Nights",
            "difficulty": "Easy", "description": "A restorative itinerary built around quiet landscapes, local food, and unhurried exploration.",
            "highlights": ["Morning ridge walk", "Local cooking class", "Sunset wellness session"],
            "dayByDay": [{"day": 1, "title": "Arrive and settle in", "description": "Check in, explore the village, and enjoy a relaxed welcome dinner.", "badges": ["Arrival", "Local food"]},
                          {"day": 2, "title": "Explore at your pace", "description": "Visit nearby landscapes with a local guide and leave room for spontaneous stops.", "badges": ["Nature", "Culture"]}]}


api_router.include_router(users_router)
api_router.include_router(posts_router)
api_router.include_router(comments_router)
api_router.include_router(packages_router)
api_router.include_router(verifications_router)
api_router.include_router(moderation_router)
api_router.include_router(ai_router)
