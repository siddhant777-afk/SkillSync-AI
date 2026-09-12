from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.project import Project
from app.models.user import User
from app.schemas import ProjectCreate, ProjectUpdate

router = APIRouter()


@router.get("")
def get_projects(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "stack": p.stack,
            "github_url": p.github_url,
            "live_url": p.live_url,
            "status": p.status,
            "score": p.score,
        }
        for p in projects
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate resume impact score heuristic based on tech stack and description
    score = 75
    if "python" in data.stack.lower() or "fastapi" in data.stack.lower() or "react" in data.stack.lower():
        score += 10
    if data.github_url:
        score += 5
    if data.live_url or data.status == "Deployed":
        score += 5

    project = Project(
        user_id=user.id,
        name=data.name,
        description=data.description,
        stack=data.stack,
        github_url=data.github_url or "",
        live_url=data.live_url or "",
        status=data.status or "In Progress",
        score=min(95, max(60, score)),
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "stack": project.stack,
        "github_url": project.github_url,
        "live_url": project.live_url,
        "status": project.status,
        "score": project.score,
    }


@router.put("/{project_id}")
def update_project(
    project_id: int,
    data: ProjectUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if data.name:
        project.name = data.name
    if data.description:
        project.description = data.description
    if data.stack:
        project.stack = data.stack
    if data.github_url is not None:
        project.github_url = data.github_url
    if data.live_url is not None:
        project.live_url = data.live_url
    if data.status:
        project.status = data.status
    if data.score is not None:
        project.score = data.score

    db.commit()
    return {"success": True, "message": "Project updated successfully"}


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"success": True, "message": "Project deleted successfully"}
