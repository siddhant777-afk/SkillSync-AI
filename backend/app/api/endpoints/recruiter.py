from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.normalizer import normalize_college_name, normalize_branch_name, are_colleges_matching
from app.models.profile import PlatformStats, StudentProfile
from app.models.user import User

router = APIRouter()

# Benchmark candidates across diverse sectors for recruiter talent pool
BENCHMARK_CANDIDATES = [
    {
        "id": 101,
        "name": "Aarav Gupta",
        "email": "aarav.gupta@dtu.ac.in",
        "college": "Delhi Technological University (DTU)",
        "branch": "Computer Science",
        "year": "4th Year",
        "careerGoal": "Backend Platform Engineer",
        "sector": "Backend & Distributed Systems",
        "placementReadiness": 94,
        "leetcodeSolved": 580,
        "dpSolved": 85,
        "algorithmicDepth": 92,
        "codeforcesRating": 1720,
        "githubContributions": 740,
        "skills": ["Go / Golang", "PostgreSQL", "Docker", "FastAPI", "Redis", "Kafka", "System Design"],
        "projectsCount": 4,
        "verifiedHandles": {"leetcode": True, "github": True, "codeforces": True},
        "achievements": ["1st Place - Smart India Hackathon 2024", "Finalist - ICPC Regional 2023"],
    },
    {
        "id": 102,
        "name": "Priya Mehra",
        "email": "priya.m@iitd.ac.in",
        "college": "IIT Delhi",
        "branch": "Information Technology",
        "year": "3rd Year",
        "careerGoal": "AI / Machine Learning Engineer",
        "sector": "AI & Data Science",
        "placementReadiness": 91,
        "leetcodeSolved": 490,
        "dpSolved": 72,
        "algorithmicDepth": 88,
        "codeforcesRating": 1650,
        "githubContributions": 510,
        "skills": ["Python", "PyTorch", "Transformers", "NLP", "LLMs", "Scikit-Learn", "FastAPI"],
        "projectsCount": 5,
        "verifiedHandles": {"leetcode": True, "github": True, "codeforces": True},
        "achievements": ["Published IEEE Paper on Graph Transformers", "Google AI Summer Researcher"],
    },
    {
        "id": 103,
        "name": "Rohan Deshmukh",
        "email": "rohan.d@pilani.bits-pilani.ac.in",
        "college": "BITS Pilani",
        "branch": "Computer Science",
        "year": "4th Year",
        "careerGoal": "Cloud & DevOps Engineer",
        "sector": "Cloud & Infrastructure",
        "placementReadiness": 87,
        "leetcodeSolved": 410,
        "dpSolved": 55,
        "algorithmicDepth": 82,
        "codeforcesRating": 1580,
        "githubContributions": 620,
        "skills": ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Prometheus", "Go / Golang"],
        "projectsCount": 4,
        "verifiedHandles": {"leetcode": True, "github": True, "codeforces": True},
        "achievements": ["AWS Certified Solutions Architect Associate", "CNCF Community Contributor"],
    },
    {
        "id": 104,
        "name": "Devansh Roy",
        "email": "devansh.roy@iiith.ac.in",
        "college": "IIIT Hyderabad",
        "branch": "Computer Science",
        "year": "3rd Year",
        "careerGoal": "Cybersecurity & Security Engineer",
        "sector": "Cybersecurity",
        "placementReadiness": 88,
        "leetcodeSolved": 320,
        "dpSolved": 42,
        "algorithmicDepth": 76,
        "codeforcesRating": 1540,
        "githubContributions": 430,
        "skills": ["Penetration Testing", "Network Security", "OWASP Top 10", "Wireshark", "Cryptography", "Python"],
        "projectsCount": 3,
        "verifiedHandles": {"leetcode": True, "github": True, "codeforces": True},
        "achievements": ["Top 10 - DEF CON CTF Qualifiers", "Hall of Fame - HackerOne Bug Bounty"],
    },
    {
        "id": 105,
        "name": "Aditya Nambiar",
        "email": "aditya.n@nitt.edu",
        "college": "NIT Trichy",
        "branch": "Electronics & Communication",
        "year": "4th Year",
        "careerGoal": "Systems & Embedded Software Engineer",
        "sector": "Core Systems & Embedded",
        "placementReadiness": 86,
        "leetcodeSolved": 360,
        "dpSolved": 50,
        "algorithmicDepth": 84,
        "codeforcesRating": 1600,
        "githubContributions": 480,
        "skills": ["Modern C++", "Rust", "Linux Kernel", "RTOS", "Multithreading", "Socket Programming"],
        "projectsCount": 4,
        "verifiedHandles": {"leetcode": True, "github": True, "codeforces": True},
        "achievements": ["Author of High-Throughput Linux Packet Sniffer (1.2k GitHub Stars)"],
    },
    {
        "id": 106,
        "name": "Sneha Kulkarni",
        "email": "sneha.k@iitb.ac.in",
        "college": "IIT Bombay",
        "branch": "Computer Science",
        "year": "3rd Year",
        "careerGoal": "Mobile Application Engineer",
        "sector": "Mobile Development",
        "placementReadiness": 85,
        "leetcodeSolved": 310,
        "dpSolved": 38,
        "algorithmicDepth": 74,
        "codeforcesRating": 1480,
        "githubContributions": 560,
        "skills": ["Flutter", "Kotlin", "React Native", "Android SDK", "Firebase", "REST APIs"],
        "projectsCount": 5,
        "verifiedHandles": {"leetcode": True, "github": True, "codeforces": True},
        "achievements": ["Published 2 Flutter Apps with 50k+ active Play Store downloads"],
    },
]


@router.get("/candidates")
def search_candidates(
    role: Optional[str] = Query(None, description="Filter by career goal or sector"),
    college: Optional[str] = Query(None, description="Filter by college"),
    min_score: Optional[int] = Query(0, description="Minimum placement readiness score"),
    min_leetcode: Optional[int] = Query(0, description="Minimum LeetCode solved problems"),
    min_dp: Optional[int] = Query(0, description="Minimum DP / Advanced DSA solved"),
    skill: Optional[str] = Query(None, description="Search by skill name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = []

    # 1. Real DB students
    query = db.query(User).filter(User.role == "student")
    users = query.all()

    for u in users:
        profile = u.profile
        if not profile:
            continue

        readiness = profile.placement_readiness if profile and profile.placement_readiness is not None else 0
        if min_score and readiness < min_score:
            continue

        if role and role.lower() not in (profile.career_goal or "").lower():
            continue

        if college and not are_colleges_matching(college, profile.college):
            continue

        stats = {ps.platform: ps.stats_data for ps in u.platform_stats}
        lc_stats = stats.get("leetcode", {})
        lc_solved = lc_stats.get("solved", 0)
        topic_counts = lc_stats.get("topic_counts", {})
        dp_solved = topic_counts.get("dp_specific", 0)
        alg_depth = lc_stats.get("algorithmic_depth_score", 0)

        if min_leetcode and lc_solved < min_leetcode:
            continue

        if min_dp and dp_solved < min_dp:
            continue

        user_skills = [s.name for s in u.skills]
        if skill and not any(skill.lower() in s.lower() for s in user_skills):
            continue

        cf_stats = stats.get("codeforces", {})
        gh_stats = stats.get("github", {})

        achievements_list = [a.title for a in u.achievements]

        results.append({
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "college": normalize_college_name(profile.college) if (profile and profile.college) else "",
            "branch": normalize_branch_name(profile.branch) if (profile and profile.branch) else "",
            "year": profile.year if (profile and profile.year) else "",
            "careerGoal": profile.career_goal or "Software Engineer",
            "placementReadiness": readiness,
            "leetcodeSolved": lc_solved,
            "dpSolved": dp_solved,
            "algorithmicDepth": alg_depth,
            "codeforcesRating": cf_stats.get("rating", 0),
            "githubContributions": gh_stats.get("contributions", 0),
            "skills": user_skills,
            "projectsCount": len(u.projects),
            "verifiedHandles": {
                "leetcode": lc_stats.get("verified", False),
                "github": gh_stats.get("verified", False),
                "codeforces": cf_stats.get("verified", False),
            },
            "achievements": achievements_list,
        })

    # 2. Benchmark candidates ONLY for testing account (subhi@example.com)
    # Real verified users strictly see real registered candidates from PostgreSQL!
    if current_user and current_user.email and current_user.email.lower().strip() == "subhi@example.com":
        for b in BENCHMARK_CANDIDATES:
            if min_score and b["placementReadiness"] < min_score:
                continue

            if role and (role.lower() not in b["careerGoal"].lower() and role.lower() not in b["sector"].lower()):
                continue

            if college and not are_colleges_matching(college, b["college"]):
                continue

            if min_leetcode and b["leetcodeSolved"] < min_leetcode:
                continue

            if min_dp and b["dpSolved"] < min_dp:
                continue

            if skill and not any(skill.lower() in s.lower() for s in b["skills"]):
                continue

            results.append(dict(b))

    # Sort descending by readiness score
    results.sort(key=lambda c: c["placementReadiness"], reverse=True)
    return results
