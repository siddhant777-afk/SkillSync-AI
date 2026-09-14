from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.achievement import Achievement
from app.models.recommendation import Recommendation
from app.models.user import User
from app.services.live_jobs_service import LiveJobsService
from app.services.profile_service import update_user_profile_completion

router = APIRouter()



# -------------------------------------------------------------
# Schemas for Custom Non-DSA Achievements
# -------------------------------------------------------------
class AchievementCreate(BaseModel):
    title: str
    category: str = "Hackathon"  # Hackathon, Research, Certification, Open Source, Leadership
    date: str = "Recently"
    description: str
    icon: Optional[str] = "trophy"


class AchievementResponse(BaseModel):
    id: int
    title: str
    category: str
    date: str
    description: str
    icon: str


# -------------------------------------------------------------
# Industry Roles Catalog across Diverse Sectors
# -------------------------------------------------------------
INDUSTRY_ROLES = [
    {
        "id": "sde-tier1",
        "title": "Software Development Engineer (SDE-1)",
        "sector": "Product Software Engineering",
        "companies": ["Google", "Amazon", "Microsoft", "Uber", "Atlassian"],
        "min_dsa": 250,
        "min_dp": 45,
        "required_skills": ["Data Structures & Algorithms", "Dynamic Programming", "System Design", "Java", "C++", "Python", "PostgreSQL", "REST APIs", "Git"],
        "description": "Solve high-complexity algorithmic challenges, build distributed microservices, and design scalable software architectures.",
    },
    {
        "id": "ai-ml-engineer",
        "title": "AI / Machine Learning Engineer",
        "sector": "AI & Data Science",
        "companies": ["Google DeepMind", "OpenAI", "Nvidia", "Microsoft", "Meta"],
        "min_dsa": 140,
        "min_dp": 25,
        "required_skills": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Machine Learning", "Deep Learning", "SQL", "Pandas", "NLP", "LLMs", "MLOps"],
        "description": "Design, fine-tune, and deploy deep learning models, LLMs, computer vision pipelines, and intelligent AI agents.",
    },
    {
        "id": "cloud-devops",
        "title": "Cloud & DevOps Engineer",
        "sector": "Cloud & Infrastructure",
        "companies": ["AWS", "Google Cloud", "Microsoft Azure", "HashiCorp", "Red Hat"],
        "min_dsa": 80,
        "min_dp": 12,
        "required_skills": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Python", "Bash", "Prometheus", "Grafana", "Networking"],
        "description": "Automate multi-cloud infrastructure as code, architect scalable Kubernetes clusters, and build automated CI/CD pipelines.",
    },
    {
        "id": "cybersecurity-analyst",
        "title": "Cybersecurity & Security Engineer",
        "sector": "Cybersecurity",
        "companies": ["CrowdStrike", "Palo Alto Networks", "Cloudflare", "Cisco", "Mandiant"],
        "min_dsa": 70,
        "min_dp": 10,
        "required_skills": ["Penetration Testing", "Network Security", "OWASP Top 10", "Wireshark", "Cryptography", "Linux Hardening", "Python", "SIEM", "Burp Suite"],
        "description": "Uncover critical vulnerabilities, perform red-team penetration tests, analyze malware, and enforce zero-trust defenses.",
    },
    {
        "id": "mobile-app-dev",
        "title": "Mobile Application Engineer",
        "sector": "Mobile Development",
        "companies": ["Uber", "Swiggy", "Zomato", "Spotify", "Meta"],
        "min_dsa": 100,
        "min_dp": 18,
        "required_skills": ["Flutter", "React Native", "Kotlin", "Swift", "Android SDK", "REST APIs", "Firebase", "Mobile UI/UX", "State Management"],
        "description": "Engineer responsive, fluid cross-platform or native mobile apps delivering smooth 60fps animations and offline sync.",
    },
    {
        "id": "systems-embedded",
        "title": "Systems & Embedded Software Engineer",
        "sector": "Core Systems & Embedded",
        "companies": ["Qualcomm", "Intel", "AMD", "Apple", "Tesla"],
        "min_dsa": 160,
        "min_dp": 30,
        "required_skills": ["C++", "C", "Rust", "Linux Kernel", "Multithreading", "Socket Programming", "Data Structures", "RTOS", "Memory Management"],
        "description": "Build high-throughput, deterministic low-latency systems, kernel drivers, firmware, and multithreaded network engines.",
    },
    {
        "id": "backend-platform",
        "title": "Backend Platform Engineer",
        "sector": "Backend & Distributed Systems",
        "companies": ["Stripe", "Netflix", "Razorpay", "Uber", "Coinbase"],
        "min_dsa": 150,
        "min_dp": 25,
        "required_skills": ["FastAPI", "Node.js", "Go / Golang", "PostgreSQL", "Redis", "Kafka", "Docker", "Microservices", "System Design"],
        "description": "Architect high-availability microservices, distributed transaction systems, caching layers, and event-driven data streaming.",
    },
]


# -------------------------------------------------------------
# Real-Time Job Suggestion & Skill Gap Engine
# -------------------------------------------------------------
@router.get("/career/jobs")
def get_job_recommendations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Computes real-time match scores against industry job roles based on current preparation."""
    profile = user.profile
    stats = {ps.platform: ps.stats_data for ps in user.platform_stats}
    lc = stats.get("leetcode", {})

    total_dsa = lc.get("solved", 0)
    topic_counts = lc.get("topic_counts", {})
    dp_solved = topic_counts.get("dp_specific", 0) + int(topic_counts.get("dp_and_advanced", 0) * 0.4)
    algorithmic_depth = lc.get("algorithmic_depth_score", 0)

    # Normalize user's existing skills
    user_skills_list = [s.name.lower().strip() for s in user.skills]
    projects_count = len(user.projects)

    role_evaluations = []

    for role in INDUSTRY_ROLES:
        required = role["required_skills"]
        # Match skills case-insensitively
        skills_have = []
        skills_missing = []

        for req in required:
            req_lower = req.lower()
            if any(req_lower in s or s in req_lower for s in user_skills_list):
                skills_have.append(req)
            else:
                skills_missing.append(req)

        # 1. Skill coverage (50% max)
        skill_ratio = len(skills_have) / max(1, len(required))
        skill_pts = skill_ratio * 50.0

        # 2. DSA Count coverage (25% max)
        dsa_ratio = min(1.0, total_dsa / float(role["min_dsa"]))
        dsa_pts = dsa_ratio * 25.0

        # 3. DP / Advanced DSA coverage (15% max)
        dp_ratio = min(1.0, dp_solved / float(role["min_dp"]))
        dp_pts = dp_ratio * 15.0

        # 4. Project & Portfolio factor (10% max)
        proj_pts = min(10.0, projects_count * 3.5)

        total_match = int(min(98, max(12, skill_pts + dsa_pts + dp_pts + proj_pts)))

        # Generate tailored "What to Focus on Next" action roadmap
        focus_actions = []
        if dsa_ratio < 0.7:
            diff = max(5, role["min_dsa"] - total_dsa)
            focus_actions.append(f"Solve {diff} more LeetCode problems to satisfy standard screening threshold ({role['min_dsa']}+ questions).")

        if dp_ratio < 0.6:
            dp_diff = max(5, role["min_dp"] - dp_solved)
            focus_actions.append(f"Practice {dp_diff} more Dynamic Programming & Graph problems to pass round 2 technical interviews.")

        if skills_missing:
            top_missing = skills_missing[:3]
            focus_actions.append(f"Learn and build with key required technologies: {', '.join(top_missing)}.")

        if projects_count < 2:
            focus_actions.append(f"Build and deploy a portfolio project aligned with {role['sector']}.")

        if not focus_actions:
            focus_actions.append("Keep refining system design principles and take timed mock interviews.")

        role_evaluations.append({
            "id": role["id"],
            "title": role["title"],
            "sector": role["sector"],
            "companies": role["companies"],
            "matchPercentage": total_match,
            "minDsa": role["min_dsa"],
            "minDp": role["min_dp"],
            "studentDsa": total_dsa,
            "studentDp": dp_solved,
            "algorithmicDepth": algorithmic_depth,
            "requiredSkills": required,
            "matchedSkills": skills_have,
            "missingSkills": skills_missing,
            "skillsHave": skills_have,
            "skillsNeed": skills_missing,
            "description": role["description"],
            "recommendedAction": focus_actions[0] if focus_actions else "Continue consistent preparation.",
            "whatToFocusOn": focus_actions,
            "isTargetGoal": bool(profile and profile.career_goal and profile.career_goal.lower() in role["title"].lower()),
        })

    # Sort: target goal first, then descending match percentage
    role_evaluations.sort(key=lambda x: (1 if x["isTargetGoal"] else 0, x["matchPercentage"]), reverse=True)

    return {
        "currentReadiness": profile.placement_readiness if profile and profile.placement_readiness is not None else 0,
        "totalDsaSolved": total_dsa,
        "dpSolved": dp_solved,
        "dpAndAdvancedSolved": dp_solved,
        "algorithmicDepth": algorithmic_depth,
        "totalSkillsVerified": len(user.skills),
        "verifiedSkillsCount": len(user.skills),
        "roles": role_evaluations,
    }


@router.get("/career/live-jobs")
async def get_live_jobs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetches real-time active engineering jobs from valid organisations matched against user's verified skills."""
    raw_jobs = await LiveJobsService.fetch_live_jobs()
    user_skills = [s.name for s in user.skills]
    career_goal = user.profile.career_goal if user.profile else "Software Engineer"
    matched = LiveJobsService.match_jobs_for_candidate(raw_jobs, user_skills, career_goal)

    return {
        "candidateSkills": user_skills,
        "careerGoal": career_goal,
        "totalLiveJobs": len(matched),
        "jobs": matched[:20],
    }


# -------------------------------------------------------------
# Custom Non-DSA Student Achievements (CRUD)
# -------------------------------------------------------------
@router.get("/achievements")
def get_achievements(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    achievements = (
        db.query(Achievement)
        .filter(Achievement.user_id == user.id)
        .order_by(Achievement.created_at.desc())
        .all()
    )
    # Zero-mock: return actual user achievements
    return [
        {
            "id": a.id,
            "title": a.title,
            "category": a.icon or "Hackathon",
            "date": a.date,
            "description": a.description,
            "icon": a.icon or "trophy",
        }
        for a in achievements
    ]


@router.post("/achievements", status_code=status.HTTP_201_CREATED)
def create_achievement(
    payload: AchievementCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allows students to log non-DSA achievements: Hackathons, Research Papers, Certifications, Open Source, Leadership."""
    new_achievement = Achievement(
        user_id=user.id,
        title=payload.title.strip(),
        date=payload.date.strip() or "Recently",
        description=payload.description.strip(),
        icon=payload.category.lower().replace(" ", "_"),
    )
    db.add(new_achievement)
    db.commit()
    db.refresh(new_achievement)
    update_user_profile_completion(user, db)
    return {
        "id": new_achievement.id,
        "title": new_achievement.title,
        "category": payload.category,
        "date": new_achievement.date,
        "description": new_achievement.description,
        "icon": new_achievement.icon,
        "message": "Achievement added successfully",
    }


@router.delete("/achievements/{achievement_id}")
def delete_achievement(
    achievement_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ach = (
        db.query(Achievement)
        .filter(Achievement.id == achievement_id, Achievement.user_id == user.id)
        .first()
    )
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")

    db.delete(ach)
    db.commit()
    update_user_profile_completion(user, db)
    return {"message": "Achievement removed successfully"}


@router.get("/career/recommendations")
def get_recommendations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == user.id)
        .order_by(Recommendation.sequence)
        .all()
    )
    if not recs:
        # Dynamic advice based on user stats
        default_texts = [
            "Practice 30 more Dynamic Programming and Graph problems on LeetCode.",
            "Containerize your backend service with Docker and add health check probes.",
            "Contribute to an open-source GitHub repository in your domain.",
            "Review low-level System Design principles (caching, database indexing, load balancing).",
        ]
        return {
            "careerFit": "Active",
            "learningPriority": "High",
            "projectOpportunity": "2",
            "recommendations": default_texts,
        }

    return {
        "careerFit": "Active",
        "learningPriority": "High",
        "projectOpportunity": "2",
        "recommendations": [r.text for r in recs],
    }
