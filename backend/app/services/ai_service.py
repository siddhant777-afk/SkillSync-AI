from typing import Any, Dict, List, Optional
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.profile import PlatformStats, StudentProfile
from app.models.project import Project
from app.models.resume import ResumeData
from app.models.skill import Skill, SkillGap


ROLE_REQUIRED_SKILLS = {
    "AI / ML Engineer": [
        {"name": "Python", "category": "Languages", "priority": "High"},
        {"name": "Machine Learning", "category": "Data & AI", "priority": "High"},
        {"name": "Deep Learning / PyTorch", "category": "Data & AI", "priority": "High"},
        {"name": "Data Engineering", "category": "Data & AI", "priority": "High"},
        {"name": "Docker & Kubernetes", "category": "Cloud & DevOps", "priority": "Medium"},
        {"name": "Model Deployment / MLOps", "category": "Cloud & DevOps", "priority": "Medium"},
        {"name": "System Design", "category": "Architecture", "priority": "Low"},
    ],
    "Backend Developer": [
        {"name": "FastAPI / Node.js", "category": "Frameworks", "priority": "High"},
        {"name": "PostgreSQL / Databases", "category": "Databases", "priority": "High"},
        {"name": "System Design & Caching", "category": "Architecture", "priority": "High"},
        {"name": "Docker & Containers", "category": "DevOps", "priority": "Medium"},
        {"name": "CI/CD Pipelines", "category": "DevOps", "priority": "Medium"},
        {"name": "Microservices", "category": "Architecture", "priority": "Low"},
    ],
    "Data Scientist": [
        {"name": "Python & Pandas", "category": "Languages", "priority": "High"},
        {"name": "SQL & Analytical Queries", "category": "Databases", "priority": "High"},
        {"name": "Statistics & Probability", "category": "Math", "priority": "High"},
        {"name": "Machine Learning", "category": "AI", "priority": "High"},
        {"name": "Data Visualization", "category": "Analytics", "priority": "Medium"},
        {"name": "Big Data (Spark)", "category": "Data", "priority": "Low"},
    ],
    "Full Stack Developer": [
        {"name": "React / Next.js", "category": "Frontend", "priority": "High"},
        {"name": "Node / Python Backend", "category": "Backend", "priority": "High"},
        {"name": "SQL & NoSQL", "category": "Databases", "priority": "High"},
        {"name": "REST & GraphQL APIs", "category": "APIs", "priority": "Medium"},
        {"name": "Docker", "category": "DevOps", "priority": "Medium"},
        {"name": "Cloud (AWS / GCP)", "category": "Cloud", "priority": "Low"},
    ],
}


class AIService:
    @staticmethod
    def calculate_placement_readiness(
        stats_map: Dict[str, Any],
        skills: List[Skill],
        projects: List[Project],
        resume: Optional[ResumeData],
    ) -> int:
        """
        Calculates a composite placement readiness score (0-100) based on:
        - 35% Competitive Coding (LeetCode solved + Codeforces rating)
        - 30% Portfolio Projects & GitHub activity
        - 20% Verified Technical Skills Breadth
        - 15% Resume ATS and Completeness
        """
        # 1. Coding score (0-35 points)
        lc = stats_map.get("leetcode", {})
        solved = lc.get("solved", 0)
        cf = stats_map.get("codeforces", {})
        rating = cf.get("rating", 0)

        # 400+ problems = ~25 pts, 1600+ rating = ~10 pts
        lc_score = min(25, (solved / 400) * 25)
        cf_score = min(10, (rating / 1600) * 10) if rating > 0 else min(10, (solved / 600) * 10)
        coding_points = lc_score + cf_score

        # 2. Project & GitHub score (0-30 points)
        gh = stats_map.get("github", {})
        contributions = gh.get("contributions", 0)
        repos = gh.get("repositories", 0)
        proj_count = len(projects)

        proj_points = min(18, proj_count * 6)
        gh_points = min(12, (contributions / 500) * 8 + (repos / 10) * 4)
        project_points = proj_points + gh_points

        # 3. Technical skills score (0-20 points)
        if skills:
            avg_skill = sum(s.level for s in skills) / len(skills)
            skill_points = min(20, (avg_skill / 100) * 15 + min(5, len(skills)))
        else:
            skill_points = 10

        # 4. Resume / Profile score (0-15 points)
        ats = resume.ats_score if resume else 75
        resume_points = min(15, (ats / 100) * 15)

        total_score = round(coding_points + project_points + skill_points + resume_points)
        return max(30, min(99, total_score))

    @staticmethod
    def identify_skill_gaps(target_role: str, user_skills: List[Skill]) -> List[Dict[str, str]]:
        existing_names = {s.name.lower().strip() for s in user_skills}
        role_reqs = ROLE_REQUIRED_SKILLS.get(target_role, ROLE_REQUIRED_SKILLS["AI / ML Engineer"])

        gaps = []
        for req in role_reqs:
            req_name = req["name"]
            # Check if student has this skill
            matched = any(
                keyword in existing_names or any(keyword in s.lower() for s in existing_names)
                for keyword in req_name.lower().split(" / ")
            )
            if not matched:
                gaps.append(
                    {
                        "name": req_name,
                        "priority": req["priority"],
                        "category": req["category"],
                        "reason": f"Essential skill for {target_role} placement screening.",
                    }
                )

        if not gaps:
            gaps.append(
                {
                    "name": "Kubernetes & Production MLOps",
                    "priority": "High",
                    "category": "Cloud",
                    "reason": "Differentiates top candidates for senior roles.",
                }
            )

        return gaps

    @staticmethod
    async def review_resume_ats(resume: ResumeData, target_role: str = "Software Engineer") -> Dict[str, Any]:
        """
        Calculates ATS compatibility score and returns detailed suggestions.
        Can invoke Gemini API if GEMINI_API_KEY is configured.
        """
        # Check if Gemini key is available
        if settings.GEMINI_API_KEY:
            try:
                prompt = f"""
                You are an expert technical ATS evaluator and tech recruiter.
                Analyze the following resume sections for the target role: {target_role}.
                Headline: {resume.headline}
                Summary: {resume.summary}
                Skills: {resume.skills_json}
                Projects: {resume.projects_json}
                Experience: {resume.experience_json}

                Provide a JSON response with:
                - ats_score (integer between 60 and 98)
                - feedback (string with clear recommendations, quantified metrics and keywords)
                - missing_keywords (list of strings)
                """
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"},
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        import json
                        parsed = json.loads(text)
                        return {
                            "ats_score": parsed.get("ats_score", 86),
                            "feedback": parsed.get("feedback", "Strong resume baseline."),
                            "missing_keywords": parsed.get("missing_keywords", []),
                        }
            except Exception:
                pass

        # Robust built-in heuristic evaluation
        score = 78
        feedback_points = []

        # Analyze summary
        if len(resume.summary or "") < 80:
            score -= 5
            feedback_points.append("Expand professional summary with core focus areas and years of coding experience.")
        else:
            score += 4

        # Analyze projects
        proj_list = resume.projects_json or []
        if len(proj_list) >= 2:
            score += 6
            feedback_points.append("Strong technical project portfolio demonstrated.")
        else:
            score -= 6
            feedback_points.append("Add at least 2 full-stack or machine learning projects with GitHub links.")

        # Keywords & impact
        feedback_points.append("Include quantifiable outcomes (e.g., 'reduced query latency by 40%', 'processed 50k records').")
        feedback_points.append("Mention Docker, CI/CD, and live deployment URLs to maximize ATS matching.")

        final_score = max(65, min(95, score))
        return {
            "ats_score": final_score,
            "feedback": " ".join(feedback_points),
            "missing_keywords": ["Docker", "CI/CD", "PostgreSQL", "Scalability", "Unit Testing"],
        }
