from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Post,TravelPackage
import uuid

router = APIRouter()

@router.get("/posts")
async def get_posts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post))
    posts = result.scalars().all()
    return posts

@router.post("/posts")
async def create_post(post: dict, db: AsyncSession = Depends(get_db)):
    new_post = Post(
        id=str(uuid.uuid4()),
        title=post["title"],
        description=post.get("description"),
        location=post.get("location"),
        author=post.get("author"),
        cost=post.get("cost"),
        duration=post.get("duration"),
        image_url=post.get("imageUrl"),
    )
    db.add(new_post)
    await db.commit()
    return new_post 


@router.get("/packages")
async def get_packages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TravelPackage))
    packages = result.scalars().all()
    return packages

@router.post("/packages")
async def create_package(package: dict, db: AsyncSession = Depends(get_db)):
    new_package = TravelPackage(
        id=str(uuid.uuid4()),
        title=package["title"],
        description=package.get("description"),
        location=package.get("location"),
        price=package.get("price"),
        duration=package.get("duration"),
        agency=package.get("agency"),
        image_url=package.get("imageUrl"),
        highlights=package.get("highlights"),
    )
    db.add(new_package)
    await db.commit()
    return new_package

@router.put("/packages/{id}")
async def update_package(id: str, package: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TravelPackage).where(TravelPackage.id == id))
    existing = result.scalar_one_or_none()
    if not existing:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Package not found")
    for key, value in package.items():
        setattr(existing, key, value)
    await db.commit()
    return existing

@router.delete("/packages/{id}")
async def delete_package(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TravelPackage).where(TravelPackage.id == id))
    existing = result.scalar_one_or_none()
    if not existing:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Package not found")
    await db.delete(existing)
    await db.commit()
    return {"message": "Package deleted"}