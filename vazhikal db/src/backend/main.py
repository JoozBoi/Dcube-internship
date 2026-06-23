import os

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, Field



# ==========================================
# 1. DATABASE SETUP
# ==========================================
# Connecting to the database created by your setup script
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/vazhikal_db",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# 2. SQLALCHEMY MODELS (matching Sequelize schema)
# ==========================================

# NOTE:
# TS models use table names:
# users, posts, comments, packages, verifications, flagged_posts, comment_reports, audit_logs
# and primary keys as strings for all except users.id.

class User(Base):
    __tablename__ = "users"

    uid = Column(String(255), primary_key=True)
    email = Column(String(255), nullable=False)
    username = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False, default="traveller")
    password = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)


class Post(Base):
    __tablename__ = "posts"

    id = Column(String, primary_key=True)
    author = Column(String, nullable=False)
    authorAvatar = Column(String, nullable=True)
    timeAgo = Column(String, nullable=True)
    location = Column(String, nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cost = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    imageUrl = Column(String, nullable=True)
    imageAlt = Column(String, nullable=True)
    votes = Column(Integer, nullable=False, default=0)
    commentsCount = Column(Integer, nullable=False, default=0)
    difficulty = Column(String, nullable=True)
    dayByDay = Column(JSONB, nullable=True)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True)
    postId = Column(String, nullable=False)
    parentId = Column(String, nullable=True)
    author = Column(String, nullable=False)
    authorAvatar = Column(String, nullable=True)
    timeAgo = Column(String, nullable=True)
    votes = Column(Integer, nullable=False, default=0)
    text = Column(Text, nullable=False)
    isVerified = Column(Boolean, nullable=False, default=False)


class Package(Base):
    __tablename__ = "packages"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    agencyName = Column(String, nullable=False)
    agencyLogo = Column(String, nullable=True)
    isVerifiedAgency = Column(Boolean, nullable=False, default=False)
    imageUrl = Column(String, nullable=True)
    imageAlt = Column(String, nullable=True)
    price = Column(String, nullable=True)
    status = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    inclusions = Column(JSONB, nullable=True)
    stayNameText = Column(String, nullable=True)
    stayDescText = Column(String, nullable=True)
    stayRating = Column(Float, nullable=False, default=4.8)
    stayReviewsCount = Column(Integer, nullable=False, default=0)
    stayValue = Column(String, nullable=True)
    dayByDay = Column(JSONB, nullable=True)


class Verification(Base):
    __tablename__ = "verifications"

    id = Column(String, primary_key=True)
    companyName = Column(String, nullable=False)
    submittedAt = Column(String, nullable=True)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    filesCount = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="pending")


class FlaggedPost(Base):
    __tablename__ = "flagged_posts"

    id = Column(String, primary_key=True)
    username = Column(String, nullable=False)
    userAvatar = Column(String, nullable=True)
    timeAgo = Column(String, nullable=True)
    type = Column(String, nullable=True)
    content = Column(Text, nullable=False)


class CommentReport(Base):
    __tablename__ = "comment_reports"

    id = Column(String, primary_key=True)
    username = Column(String, nullable=False)
    postId = Column(String, nullable=False)
    postTitle = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    reportsCount = Column(Integer, nullable=False, default=1)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True)
    entityType = Column(String, nullable=False)
    entityId = Column(String, nullable=False)
    action = Column(String, nullable=False)
    performedBy = Column(String, nullable=False)
    details = Column(Text, nullable=True)


# We don't need Base.metadata.create_all() here because your 
# setup script already created the tables in PostgreSQL!

# ==========================================
# 3. PYDANTIC SCHEMAS
# ==========================================
class UserCreate(BaseModel):
    uid: str
    email: str
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    uid: str
    email: str
    username: str
    role: str

    class Config:
        from_attributes = True

# ==========================================
# 4. FASTAPI APP & ROUTES
# ==========================================
app = FastAPI(title="Vazhikal API", description="API for the Vazhikal Internship Project")

# CORS: allow only local dev origins while keeping cookies/headers support.
# Frontend defaults to http://127.0.0.1:8000 (see src/frontend/api.ts).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==============================
# USERS
# ==============================

def _integrity_error_to_400(detail: str) -> HTTPException:
    return HTTPException(status_code=400, detail=detail)

# POST: Add a new user to the Vazhikal database
@app.post("/api/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(
        uid=user.uid,
        email=user.email,
        username=user.username,
        role="traveller",
        password=user.password,
        bio=None,
    )

    db.add(db_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _integrity_error_to_400("User already exists (duplicate uid).")

    db.refresh(db_user)
    return db_user

# GET: Fetch all users
@app.get("/api/users", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# GET: Fetch one user by uid
@app.get("/api/users/{uid}", response_model=UserResponse)
def get_user_by_uid(uid: str, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.uid == uid).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u

class UserUpdate(BaseModel):
    email: str | None = None
    username: str | None = None
    bio: str | None = None
    password: str | None = None
    role: str | None = None

# PUT: Update user by uid
@app.put("/api/users/{uid}", response_model=UserResponse)
def update_user(uid: str, update: UserUpdate, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.uid == uid).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = update.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(u, k, v)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _integrity_error_to_400("Update failed due to a duplicate constraint.")

    db.refresh(u)
    return u



# ==============================
# Shared helpers
# ==============================

def _role_from_request(req: Request) -> str:
    return (req.headers.get('x-user-role') or 'traveller').lower()


def _username_from_request(req: Request) -> str:
    role = _role_from_request(req)
    u = req.headers.get('x-user-username')
    if u:
        return u
    if role == 'admin':
        return 'admin'
    if role == 'agency':
        return 'EverestTrek'
    return 'SaraWanderer'


# ==============================
# POSTS
# ==============================

class PostCreate(BaseModel):
    id: str
    author: str
    authorAvatar: str | None = None
    timeAgo: str | None = None
    location: str | None = None
    title: str
    description: str | None = None
    cost: str | None = None
    duration: str | None = None
    imageUrl: str | None = None
    imageAlt: str | None = None
    votes: int = 0
    commentsCount: int = 0
    difficulty: str | None = None
    dayByDay: dict | None = None
    highlights: list[str] | None = None


class VoteBody(BaseModel):
    amount: int


@app.get('/api/posts')
def list_posts(req: Request, db: Session = Depends(get_db)):
    return db.query(Post).all()


@app.post('/api/posts')
def create_post(post: PostCreate, req: Request, db: Session = Depends(get_db)):
    # highlights are not persisted in Post table; store in dayByDay if present
    post_obj = Post(
        id=post.id,
        author=post.author,
        authorAvatar=post.authorAvatar,
        timeAgo=post.timeAgo,
        location=post.location,
        title=post.title,
        description=post.description,
        cost=post.cost,
        duration=post.duration,
        imageUrl=post.imageUrl,
        imageAlt=post.imageAlt,
        votes=post.votes,
        commentsCount=post.commentsCount,
        difficulty=post.difficulty,
        dayByDay=post.dayByDay,
    )
    db.add(post_obj)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _integrity_error_to_400("Post already exists (duplicate id).")
    db.refresh(post_obj)
    return post_obj



@app.delete('/api/posts/{post_id}')
def delete_post(post_id: str, req: Request, db: Session = Depends(get_db)):
    p = db.query(Post).filter(Post.id == post_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Post not found')
    db.delete(p)
    db.commit()
    return {'success': True}


@app.post('/api/posts/{post_id}/vote')
def vote_post(post_id: str, body: VoteBody, req: Request, db: Session = Depends(get_db)):
    p = db.query(Post).filter(Post.id == post_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Post not found')
    p.votes = (p.votes or 0) + int(body.amount)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


# ==============================
# COMMENTS
# ==============================

class CommentCreate(BaseModel):
    id: str
    text: str
    parentId: str | None = None


@app.post('/api/posts/{post_id}/comments')
def add_comment(post_id: str, body: dict, req: Request, db: Session = Depends(get_db)):
    # frontend sends {text,parentId,id}

    cid = body.get('id')
    text = body.get('text')
    parent_id = body.get('parentId')
    if not cid or text is None:
        raise HTTPException(status_code=400, detail='Missing comment id/text')

    author = body.get('author') or _username_from_request(req)

    c = Comment(
        id=cid,
        postId=post_id,
        parentId=parent_id,
        author=author,
        authorAvatar=None,
        timeAgo='Just now',
        votes=0,
        text=text,
        isVerified=(_role_from_request(req) in ['admin', 'agency']),
    )
    db.add(c)

    # increment commentsCount
    p = db.query(Post).filter(Post.id == post_id).first()
    if p:
        p.commentsCount = (p.commentsCount or 0) + 1
        db.add(p)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _integrity_error_to_400("Comment already exists (duplicate id).")

    db.refresh(c)
    return c



def _build_comment_tree(flat_comments: list[Comment]):
    by_id: dict[str, dict] = {}
    roots: list[dict] = []

    for c in flat_comments:
        by_id[c.id] = {
            'id': c.id,
            'author': c.author,
            'authorAvatar': c.authorAvatar,
            'timeAgo': c.timeAgo,
            'votes': c.votes,
            'text': c.text,
            'isVerified': c.isVerified,
            'replies': [],
        }

    for c in flat_comments:
        node = by_id[c.id]
        if c.parentId:
            parent = by_id.get(c.parentId)
            if parent is not None:
                parent['replies'].append(node)
            else:
                roots.append(node)
        else:
            roots.append(node)

    return roots


@app.delete('/api/comments/{comment_id}')
def delete_comment(comment_id: str, req: Request, db: Session = Depends(get_db)):
    # delete only the node and its direct descendants by cascade-like logic (simple)
    target = db.query(Comment).filter(Comment.id == comment_id).first()
    if not target:
        raise HTTPException(status_code=404, detail='Comment not found')

    post_id = target.postId

    # delete descendants recursively (simple loop)
    to_delete = {comment_id}
    changed = True
    while changed:
        changed = False
        rows = db.query(Comment).filter(Comment.parentId.in_(list(to_delete))).all()
        for r in rows:
            if r.id not in to_delete:
                to_delete.add(r.id)
                changed = True

    db.query(Comment).filter(Comment.id.in_(list(to_delete))).delete(synchronize_session=False)

    # decrement post.commentsCount by 1 for top-level decrement (frontend expects -1 per report delete)
    p = db.query(Post).filter(Post.id == post_id).first()
    if p:
        p.commentsCount = max(0, (p.commentsCount or 0) - 1)
        db.add(p)

    db.commit()
    return {'success': True}


@app.get('/api/comments/{post_id}')
def list_comments(post_id: str, db: Session = Depends(get_db)):
    flat = db.query(Comment).filter(Comment.postId == post_id).all()
    return _build_comment_tree(flat)


# ==============================
# PACKAGES
# ==============================

class PackageCreate(BaseModel):
    id: str
    title: str
    destination: str
    duration: str
    agencyName: str
    agencyLogo: str | None = None
    isVerifiedAgency: bool = False
    imageUrl: str | None = None
    imageAlt: str | None = None
    price: str | None = None
    status: str | None = None
    description: str | None = None
    inclusions: dict | None = None
    stayNameText: str | None = None
    stayDescText: str | None = None
    stayRating: float = 4.8
    stayReviewsCount: int = 0
    stayValue: str | None = None
    dayByDay: dict | None = None


@app.get('/api/packages')
def list_packages(req: Request, db: Session = Depends(get_db)):
    return db.query(Package).all()


@app.post('/api/packages')
def create_package(pkg: PackageCreate, req: Request, db: Session = Depends(get_db)):
    p = Package(**pkg.model_dump())
    db.add(p)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _integrity_error_to_400("Package already exists (duplicate id).")
    db.refresh(p)
    return p



@app.put('/api/packages/{pkg_id}')
def update_package(pkg_id: str, updated: dict, req: Request, db: Session = Depends(get_db)):
    p = db.query(Package).filter(Package.id == pkg_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Package not found')

    for k, v in updated.items():
        if hasattr(p, k):
            setattr(p, k, v)

    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@app.delete('/api/packages/{pkg_id}')
def delete_package(pkg_id: str, req: Request, db: Session = Depends(get_db)):
    p = db.query(Package).filter(Package.id == pkg_id).first()
    if not p:
        raise HTTPException(status_code=404, detail='Package not found')
    db.delete(p)
    db.commit()
    return {'success': True}


# ==============================
# VERIFICATIONS
# ==============================

class VerificationCreate(BaseModel):
    id: str
    companyName: str
    submittedAt: str | None = None
    email: str
    phone: str | None = None
    filesCount: int = 0
    status: str = 'pending'


@app.get('/api/verifications')
def list_verifications(req: Request, db: Session = Depends(get_db)):
    return db.query(Verification).all()


@app.post('/api/verifications')
def create_verification(v: VerificationCreate, req: Request, db: Session = Depends(get_db)):
    item = Verification(**v.model_dump())
    db.add(item)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _integrity_error_to_400("Verification already exists (duplicate id).")
    db.refresh(item)
    return item



@app.post('/api/verifications/{verif_id}/approve')
def approve_verification(verif_id: str, body: dict, req: Request, db: Session = Depends(get_db)):
    item = db.query(Verification).filter(Verification.id == verif_id).first()
    if not item:
        raise HTTPException(status_code=404, detail='Verification not found')
    status = body.get('status')
    if status is not None:
        item.status = status
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# ==============================
# FLAGGED POSTS
# ==============================

class FlaggedPostCreate(BaseModel):
    id: str
    username: str
    userAvatar: str | None = None
    timeAgo: str | None = None
    type: str | None = None
    content: str


@app.get('/api/flagged-posts')
def list_flagged_posts(req: Request, db: Session = Depends(get_db)):
    return db.query(FlaggedPost).all()


@app.post('/api/flagged-posts')
def create_flagged_post(fp: FlaggedPostCreate, req: Request, db: Session = Depends(get_db)):
    item = FlaggedPost(**fp.model_dump())
    db.add(item)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _integrity_error_to_400("Flagged post already exists (duplicate id).")
    db.refresh(item)
    return item



@app.delete('/api/flagged-posts/{fp_id}')
def delete_flagged_post(fp_id: str, req: Request, db: Session = Depends(get_db)):
    item = db.query(FlaggedPost).filter(FlaggedPost.id == fp_id).first()
    if not item:
        raise HTTPException(status_code=404, detail='Flagged post not found')
    db.delete(item)
    db.commit()
    return {'success': True}


# ==============================
# COMMENT REPORTS
# ==============================

class CommentReportCreate(BaseModel):
    id: str
    username: str
    postId: str
    postTitle: str
    text: str
    reportsCount: int = 1


@app.get('/api/comment-reports')
def list_comment_reports(req: Request, db: Session = Depends(get_db)):
    return db.query(CommentReport).all()


@app.post('/api/comment-reports')
def create_comment_report(r: CommentReportCreate, req: Request, db: Session = Depends(get_db)):
    item = CommentReport(**r.model_dump())
    db.add(item)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _integrity_error_to_400("Comment report already exists (duplicate id).")
    db.refresh(item)
    return item



@app.delete('/api/comment-reports/{report_id}')
def delete_comment_report(report_id: str, req: Request, db: Session = Depends(get_db)):
    item = db.query(CommentReport).filter(CommentReport.id == report_id).first()
    if not item:
        raise HTTPException(status_code=404, detail='Report not found')
    db.delete(item)
    db.commit()
    return {'success': True}


