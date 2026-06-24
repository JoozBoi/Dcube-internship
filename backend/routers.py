import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_db
from .models import Post, TravelPackage
from .schemas import InspireRequest, PackageCreate, PackageRead, PostCreate, PostRead

router = APIRouter(tags=["travel"])


@router.post("/ai/inspire")
async def inspire_trip(request: InspireRequest):
    """Return a dependable local itinerary until an AI provider is configured."""
    return {
        "id": f"ai-{uuid.uuid4()}",
        "title": f"A {request.vibe.strip().title()} Escape",
        "location": "Ubud, Bali, Indonesia",
        "cost": "$620 USD",
        "duration": "4 Days, 3 Nights",
        "difficulty": "Easy",
        "description": "A restorative itinerary built around quiet landscapes, local food, and unhurried exploration.",
        "highlights": ["Morning ridge walk", "Local cooking class", "Sunset wellness session"],
        "dayByDay": [
            {"day": 1, "title": "Arrive and settle in", "description": "Check in, explore the village, and enjoy a relaxed welcome dinner.", "badges": ["Arrival", "Local food"]},
            {"day": 2, "title": "Explore at your pace", "description": "Visit nearby landscapes with a local guide and leave room for spontaneous stops.", "badges": ["Nature", "Culture"]},
        ],
        "provider": "local-fallback",
    }


@router.get("/posts", response_model=list[PostRead], response_model_by_alias=True)
async def get_posts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).order_by(Post.created_at.desc()))
    return result.scalars().all()


@router.post("/posts", response_model=PostRead, response_model_by_alias=True, status_code=status.HTTP_201_CREATED)
async def create_post(post: PostCreate, db: AsyncSession = Depends(get_db)):
    new_post = Post(id=str(uuid.uuid4()), **post.model_dump())
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    return new_post


def serialize_package(package: TravelPackage) -> dict:
    return {
        "id": package.id,
        "title": package.title,
        "description": package.description,
        "destination": package.destination,
        "price": package.price,
        "duration": package.duration,
        "agencyName": package.agency_name,
        "imageUrl": package.image_url,
        "highlights": json.loads(package.highlights or "[]"),
        "rating": package.rating or 0,
        "reviews_count": package.reviews_count or 0,
        "created_at": package.created_at,
    }


@router.get("/packages", response_model=list[PackageRead], response_model_by_alias=True)
async def get_packages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TravelPackage).order_by(TravelPackage.created_at.desc()))
    return [serialize_package(package) for package in result.scalars().all()]


@router.post("/packages", response_model=PackageRead, response_model_by_alias=True, status_code=status.HTTP_201_CREATED)
async def create_package(package: PackageCreate, db: AsyncSession = Depends(get_db)):
    values = package.model_dump()
    values["highlights"] = json.dumps(values["highlights"])
    new_package = TravelPackage(id=str(uuid.uuid4()), **values)
    db.add(new_package)
    await db.commit()
    await db.refresh(new_package)
    return serialize_package(new_package)


@router.put("/packages/{package_id}", response_model=PackageRead, response_model_by_alias=True)
async def update_package(package_id: str, package: PackageCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.get(TravelPackage, package_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Package not found")
    values = package.model_dump()
    values["highlights"] = json.dumps(values["highlights"])
    for key, value in values.items():
        setattr(existing, key, value)
    await db.commit()
    await db.refresh(existing)
    return serialize_package(existing)


@router.delete("/packages/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_package(package_id: str, db: AsyncSession = Depends(get_db)):
    existing = await db.get(TravelPackage, package_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Package not found")
    await db.delete(existing)
    await db.commit()
