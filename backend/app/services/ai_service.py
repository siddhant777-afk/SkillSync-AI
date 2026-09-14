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
        achievements: Optional[List[Any]] = None,
        timeline: Optional[Dict[str, Any]] = None,
    ) -> int:
        """
        Authoritative composite placement readiness calculation powered by RankingEngine.
        Evaluates competitive programming, problem solving depth, software engineering,
        project portfolio, consistency, and achievements with non-punitive reweighting.
        """
        from app.services.ranking_engine import RankingEngine
        from app.services.timeline_service import TimelineService

        lc_stats = stats_map.get("leetcode", {})
        cf_stats = stats_map.get("codeforces", {})
        cc_stats = stats_map.get("codechef", {})
        gh_stats = stats_map.get("github", {})

        if not timeline:
            timeline = TimelineService.build_timeline(
                leetcode_stats=lc_stats,
                github_stats=gh_stats,
                codeforces_stats=cf_stats,
                codechef_stats=cc_stats,
            )

        ranking = RankingEngine.calculate_composite_score(
            leetcode_stats=lc_stats,
            codeforces_stats=cf_stats,
            codechef_stats=cc_stats,
            github_stats=gh_stats,
            projects=projects or [],
            achievements=achievements or [],
            timeline=timeline,
        )

        return ranking.get("placement_readiness", 0)

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
    async def review_resume_ats(
        resume: ResumeData,
        target_role: str = "Software Engineer",
        base_score: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates resume ATS compatibility and generates targeted AI recommendations and missing keywords.
        Ensures the score remains 100% deterministic and grounded in actual resume contents.
        """
        has_content = bool(
            (resume.skills_json and len(resume.skills_json) > 0) or
            (resume.summary and len(resume.summary.strip()) > 0) or
            (resume.education and len(resume.education) > 0) or
            (resume.projects_json and len(resume.projects_json) > 0) or
            (resume.experience_json and len(resume.experience_json) > 0) or
            (resume.achievements_json and len(resume.achievements_json) > 0)
        )

        if not has_content:
            return {
                "ats_score": 0,
                "feedback": "Your resume currently contains no details. Fill in your summary, education, skills, and projects to evaluate your ATS readiness.",
                "missing_keywords": ["Python", "SQL", "Git", "REST APIs", "Docker"],
            }

        final_score = base_score if base_score is not None else 0

        # Collect user existing keywords
        user_text = f"{resume.headline or ''} {resume.summary or ''} {' '.join(resume.skills_json or [])}".lower()
        for p in (resume.projects_json or []):
            if isinstance(p, dict):
                user_text += f" {p.get('title', '')} {p.get('stack', '')} {p.get('description', '')}".lower()

        # Find target role required skills
        role_reqs = ROLE_REQUIRED_SKILLS.get(target_role, ROLE_REQUIRED_SKILLS.get("Full Stack Developer", []))
        if not role_reqs:
            role_reqs = [
                {"name": "Docker & Containers"},
                {"name": "PostgreSQL / SQL"},
                {"name": "CI/CD Pipelines"},
                {"name": "System Architecture"},
                {"name": "Unit Testing & QA"},
            ]

        missing_keywords = []
        for req in role_reqs:
            kw_name = req["name"]
            terms = [t.strip().lower() for t in kw_name.replace("&", "/").split("/") if t.strip()]
            if not any(term in user_text for term in terms):
                clean_kw = kw_name.split("/")[0].strip()
                if clean_kw not in missing_keywords:
                    missing_keywords.append(clean_kw)

        if len(missing_keywords) < 3:
            default_additions = ["Docker", "CI/CD", "PostgreSQL", "REST APIs", "Cloud Deployment"]
            for da in default_additions:
                if da.lower() not in user_text and da not in missing_keywords:
                    missing_keywords.append(da)

        # Generate qualitative feedback
        ai_feedback_text = ""
        if settings.GEMINI_API_KEY:
            try:
                prompt = f"""
                You are an enterprise technical ATS evaluator and senior hiring manager reviewing a candidate for '{target_role}'.
                The candidate's deterministic parser score is {final_score}/100.
                Headline: {resume.headline}
                Summary: {resume.summary}
                Skills: {resume.skills_json}
                Projects: {resume.projects_json}
                Education: {resume.education}
                Missing Recommended Keywords: {missing_keywords[:5]}

                Provide a JSON response with:
                - feedback: 2-3 sentences of precise, actionable advice on improving ATS pass rate for {target_role}. Focus on quantifying project impact and incorporating missing technical keywords.
                """
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"},
                }
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        import json
                        parsed = json.loads(text)
                        if parsed.get("feedback"):
                            ai_feedback_text = parsed.get("feedback")
            except Exception:
                pass

        if not ai_feedback_text:
            feedback_points = []
            if len(resume.summary or "") < 60:
                feedback_points.append("Expand your professional summary to highlight core technical focus areas and years of coding experience.")
            else:
                feedback_points.append("Professional summary is concise and highlights key competencies.")

            proj_list = resume.projects_json or []
            if len(proj_list) < 2:
                feedback_points.append("Add at least 2 technical projects with GitHub links and quantified impact metrics.")
            else:
                feedback_points.append("Project portfolio demonstrates hands-on implementation capabilities.")

            if missing_keywords:
                feedback_points.append(f"Consider integrating relevant keywords like {', '.join(missing_keywords[:3])} into your skills and project descriptions.")

            ai_feedback_text = " ".join(feedback_points)

        return {
            "ats_score": final_score,
            "feedback": ai_feedback_text,
            "missing_keywords": missing_keywords[:6],
        }
