from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Post, PostLike, Comment, Opportunity
from backend.auth_utils import get_current_user_id, get_optional_user_id

router = APIRouter(tags=["posts"])


class CreatePostBody(BaseModel):
    title: str
    content: str
    mediaUrl: Optional[str] = None
    mediaType: Optional[str] = None
    opportunityId: Optional[int] = None


class CreateCommentBody(BaseModel):
    content: str


def _post_dict(post: Post, author: Optional[User], current_user_id: Optional[int],
               likes_count: int, has_liked: bool, comments_count: int,
               opportunity: Optional[Opportunity] = None) -> dict:
    return {
        "id": post.id,
        "userId": post.user_id,
        "authorName": author.name if author else "Usuario",
        "authorType": author.user_type if author else "volunteer",
        "organizationName": author.organization_name if author and author.user_type == "organization" else None,
        "title": post.title,
        "content": post.content,
        "mediaUrl": post.media_url,
        "mediaType": post.media_type,
        "opportunityId": post.opportunity_id,
        "opportunityTitle": opportunity.title if opportunity else None,
        "likesCount": likes_count,
        "hasLiked": has_liked,
        "commentsCount": comments_count,
        "createdAt": post.created_at.isoformat(),
    }


def _comment_dict(comment: Comment, author: Optional[User]) -> dict:
    return {
        "id": comment.id,
        "postId": comment.post_id,
        "userId": comment.user_id,
        "authorName": author.name if author else "Usuario",
        "authorType": author.user_type if author else "volunteer",
        "content": comment.content,
        "createdAt": comment.created_at.isoformat(),
    }


@router.get("/posts")
def list_posts(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_optional_user_id),
):
    posts = (
        db.query(Post)
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    result = []
    for post in posts:
        author = db.query(User).filter(User.id == post.user_id).first()
        opp = db.query(Opportunity).filter(Opportunity.id == post.opportunity_id).first() if post.opportunity_id else None
        likes_count = db.query(PostLike).filter(PostLike.post_id == post.id).count()
        has_liked = bool(
            current_user_id and
            db.query(PostLike).filter(PostLike.post_id == post.id, PostLike.user_id == current_user_id).first()
        )
        comments_count = db.query(Comment).filter(Comment.post_id == post.id).count()
        result.append(_post_dict(post, author, current_user_id, likes_count, has_liked, comments_count, opp))
    return result


@router.post("/posts", status_code=201)
def create_post(
    body: CreatePostBody,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    if not body.title.strip():
        raise HTTPException(400, "El título no puede estar vacío")
    if not body.content.strip():
        raise HTTPException(400, "El contenido no puede estar vacío")

    media_type = body.mediaType
    if media_type not in (None, "image", "video"):
        media_type = None

    post = Post(
        user_id=user_id,
        title=body.title.strip(),
        content=body.content.strip(),
        media_url=body.mediaUrl.strip() if body.mediaUrl else None,
        media_type=media_type,
        opportunity_id=body.opportunityId,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    author = db.query(User).filter(User.id == user_id).first()
    opp = db.query(Opportunity).filter(Opportunity.id == post.opportunity_id).first() if post.opportunity_id else None
    return _post_dict(post, author, user_id, 0, False, 0, opp)


@router.delete("/posts/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post no encontrado")
    if post.user_id != user_id:
        raise HTTPException(403, "No tienes permiso")
    db.query(Comment).filter(Comment.post_id == post_id).delete()
    db.query(PostLike).filter(PostLike.post_id == post_id).delete()
    db.delete(post)
    db.commit()


@router.post("/posts/{post_id}/like", status_code=200)
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post no encontrado")

    existing = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == user_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        db.add(PostLike(post_id=post_id, user_id=user_id))
        db.commit()
        liked = True

    likes_count = db.query(PostLike).filter(PostLike.post_id == post_id).count()
    return {"liked": liked, "likesCount": likes_count}


@router.get("/posts/{post_id}/comments")
def list_comments(
    post_id: int,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_optional_user_id),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post no encontrado")

    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [
        _comment_dict(c, db.query(User).filter(User.id == c.user_id).first())
        for c in comments
    ]


@router.post("/posts/{post_id}/comments", status_code=201)
def create_comment(
    post_id: int,
    body: CreateCommentBody,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post no encontrado")
    if not body.content.strip():
        raise HTTPException(400, "El comentario no puede estar vacío")

    comment = Comment(post_id=post_id, user_id=user_id, content=body.content.strip())
    db.add(comment)
    db.commit()
    db.refresh(comment)

    author = db.query(User).filter(User.id == user_id).first()
    return _comment_dict(comment, author)


@router.delete("/posts/{post_id}/comments/{comment_id}", status_code=204)
def delete_comment(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    comment = db.query(Comment).filter(Comment.id == comment_id, Comment.post_id == post_id).first()
    if not comment:
        raise HTTPException(404, "Comentario no encontrado")
    if comment.user_id != user_id:
        raise HTTPException(403, "No tienes permiso")
    db.delete(comment)
    db.commit()
