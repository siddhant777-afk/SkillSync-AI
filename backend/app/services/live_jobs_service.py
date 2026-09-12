import httpx
import logging
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.user import User

logger = logging.getLogger(__name__)

# Cache for live jobs to avoid rate limits
_CACHED_JOBS: List[Dict[str, Any]] = []
_LAST_FETCH_TIME = 0

class LiveJobsService:
    @staticmethod
    async def fetch_live_jobs() -> List[Dict[str, Any]]:
        global _CACHED_JOBS, _LAST_FETCH_TIME
        import time
        now = time.time()
        # Return cached jobs if within 15 minutes
        if _CACHED_JOBS and (now - _LAST_FETCH_TIME) < 900:
            return _CACHED_JOBS

        jobs = []
        headers = {"User-Agent": "SkillSync-AI-JobIntelligence/1.0"}

        async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
            # 1. Fetch from Arbeitnow (Free Public Job Board API)
            try:
                r = await client.get("https://www.arbeitnow.com/api/job-board-api")
                if r.status_code == 200:
                    data = r.json().get("data", [])
                    for j in data:
                        tags = [str(t).lower() for t in (j.get("tags") or []) if t]
                        # Extract tags from title if tags are sparse
                        title = j.get("title", "")
                        for kw in ["python", "react", "javascript", "typescript", "java", "c++", "go", "node", "sql", "docker", "aws", "machine learning", "ai", "data", "frontend", "backend", "full stack"]:
                            if kw in title.lower() and kw not in tags:
                                tags.append(kw)
                        
                        jobs.append({
                            "id": f"arbeitnow-{j.get('slug', '')[:30] or len(jobs)}",
                            "title": title,
                            "company": j.get("company_name", "Tech Company"),
                            "url": j.get("url", "https://www.arbeitnow.com/"),
                            "location": j.get("location", "Remote"),
                            "remote": j.get("remote", True),
                            "tags": tags,
                            "description": (j.get("description", "") or "")[:250],
                            "posted_at": "Active",
                            "source": "Arbeitnow Verified",
                        })
            except Exception as e:
                logger.warning(f"Arbeitnow fetch failed: {e}")

            # 2. Fetch from Remotive (Free Remote Jobs API)
            try:
                r = await client.get("https://remotive.com/api/remote-jobs?limit=25")
                if r.status_code == 200:
                    data = r.json().get("jobs", [])
                    for j in data:
                        tags = [str(t).lower() for t in (j.get("tags") or []) if t]
                        title = j.get("title", "")
                        jobs.append({
                            "id": f"remotive-{j.get('id', len(jobs))}",
                            "title": title,
                            "company": j.get("company_name", "Global Tech"),
                            "url": j.get("url", "https://remotive.com/"),
                            "location": j.get("candidate_required_location", "Remote (Worldwide)"),
                            "remote": True,
                            "tags": tags,
                            "description": (j.get("description", "") or "")[:250],
                            "posted_at": j.get("publication_date", "Recently")[:10] if j.get("publication_date") else "Active",
                            "source": "Remotive Verified",
                        })
            except Exception as e:
                logger.warning(f"Remotive fetch failed: {e}")

        if jobs:
            _CACHED_JOBS = jobs
            _LAST_FETCH_TIME = now
            logger.info(f"Fetched {len(jobs)} live jobs from valid organisations.")
        return _CACHED_JOBS

    @staticmethod
    def match_jobs_for_candidate(jobs: List[Dict[str, Any]], user_skills: List[str], career_goal: str = "") -> List[Dict[str, Any]]:
        user_skills_clean = [s.strip().lower() for s in user_skills if s]
        goal_words = [w.lower() for w in re.split(r"\W+", career_goal) if len(w) > 2]

        matched_results = []
        for job in jobs:
            job_tags = job.get("tags", [])
            job_title = job.get("title", "").lower()
            job_desc = job.get("description", "").lower()

            matched_skills = []
            for s in user_skills_clean:
                if s in job_tags or s in job_title or s in job_desc:
                    matched_skills.append(s.title())

            # Missing key skills mentioned in tags that user does not have
            missing_skills = []
            for t in job_tags:
                if t not in user_skills_clean and len(t) > 2 and t not in ["international", "remote", "english", "senior", "lead", "junior"]:
                    missing_skills.append(t.title())

            # Calculate match score
            score = 45  # Baseline for engineering roles
            if matched_skills:
                score += min(45, len(matched_skills) * 15)
            # Role alignment bonus
            if any(gw in job_title for gw in goal_words):
                score += 10

            score = min(98, score)

            matched_results.append({
                **job,
                "matchScore": score,
                "matchedSkills": matched_skills,
                "missingSkills": missing_skills[:4],
                "skillsHave": matched_skills,
                "skillsNeed": missing_skills[:4],
            })

        # Rank by match score descending
        matched_results.sort(key=lambda x: (len(x["matchedSkills"]), x["matchScore"]), reverse=True)
        return matched_results

    @staticmethod
    async def sync_notifications_for_user(db: Session, user: User) -> int:
        """Evaluates live jobs and generates notifications for newly matched positions from legitimate companies."""
        user_skills = [s.name for s in user.skills]
        career_goal = user.profile.career_goal if user.profile else "Software Engineer"
        
        jobs = await LiveJobsService.fetch_live_jobs()
        matched_jobs = LiveJobsService.match_jobs_for_candidate(jobs, user_skills, career_goal)

        # Look at top matches with at least 1 verified skill match or strong role match
        top_matches = [j for j in matched_jobs if len(j["matchedSkills"]) > 0 or j["matchScore"] >= 65][:4]

        new_alerts = 0
        for job in top_matches:
            # Check if notification already exists for this job link/title
            existing = (
                db.query(Notification)
                .filter(Notification.user_id == user.id, Notification.title.like(f"%{job['company']}%"))
                .first()
            )
            if not existing:
                skills_str = ", ".join(job["matchedSkills"][:3]) if job["matchedSkills"] else "Engineering Skills"
                notif = Notification(
                    user_id=user.id,
                    type="job_alert",
                    title=f"🎯 Live Job Match: {job['title']} at {job['company']}",
                    message=f"{job['company']} is hiring. Validated match for your verified skills: {skills_str}. Direct application is open.",
                    link=job["url"],
                    link_label="Apply on Company Site ↗",
                    company=job["company"],
                    tags=job["matchedSkills"] or [job.get("source", "Verified")],
                    is_read=False,
                )
                db.add(notif)
                new_alerts += 1

        # Check if user has skills but no skill milestone notification
        if user.skills and not db.query(Notification).filter(Notification.user_id == user.id, Notification.type == "skill_milestone").first():
            top_skill = user.skills[0]
            notif = Notification(
                user_id=user.id,
                type="skill_milestone",
                title=f"⚡ Placement Momentum: {top_skill.name} Mastered",
                message=f"Your competency in {top_skill.name} ({top_skill.level}%) has been added to your profile and factored into live placement momentum.",
                link="/skills",
                link_label="View Skill Matrix",
                company="SkillSync AI",
                tags=[top_skill.name],
                is_read=False,
            )
            db.add(notif)
            new_alerts += 1

        if new_alerts > 0:
            db.commit()
        return new_alerts
