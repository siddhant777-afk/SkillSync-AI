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
        "id": 100,
        "name": "Subhi Sharma",
        "email": "subhi.sharma@glbajaj.ac.in",
        "college": "GL Bajaj Institute of Technology and Management",
        "branch": "Computer Science Engineering",
        "year": "4th Year",
        "careerGoal": "Full Stack Software Engineer",
        "sector": "Full Stack & Cloud Systems",
        "placementReadiness": 96,
        "maxContestRating": 1840,
        "totalQuestionsSolved": 780,
        "achievementsCount": 3,
        "projectsCount": 5,
        "commitsCount": 850,
        "leetcodeSolved": 620,
        "leetcodeContestRating": 1840,
        "codeforcesRating": 1750,
        "codeforcesSolved": 120,
        "codechefRating": 1820,
        "codechefSolved": 40,
        "dpSolved": 92,
        "advancedTopicsSolved": 92,
        "algorithmicDepth": 95,
        "githubContributions": 850,
        "skills": ["React", "FastAPI", "Python", "PostgreSQL", "Docker", "Tailwind CSS", "AWS", "System Design"],
        "verifiedHandles": {"leetcode": True, "github": True, "codeforces": True, "codechef": True},
        "achievements": ["Winner - National Smart India Hackathon 2024", "Rank #1 Inter-College Coder", "AWS Certified Cloud Practitioner"],
    },
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
        "maxContestRating": 1720,
        "totalQuestionsSolved": 690,
        "achievementsCount": 2,
        "projectsCount": 4,
        "commitsCount": 740,
        "leetcodeSolved": 580,
        "leetcodeContestRating": 1680,
        "codeforcesRating": 1720,
        "codeforcesSolved": 110,
        "codechefRating": 1650,
        "codechefSolved": 0,
        "dpSolved": 85,
        "advancedTopicsSolved": 85,
        "algorithmicDepth": 92,
        "githubContributions": 740,
        "skills": ["Go / Golang", "PostgreSQL", "Docker", "FastAPI", "Redis", "Kafka", "System Design"],
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
        "maxContestRating": 1650,
        "totalQuestionsSolved": 580,
        "achievementsCount": 2,
        "projectsCount": 5,
        "commitsCount": 510,
        "leetcodeSolved": 490,
        "leetcodeContestRating": 1620,
        "codeforcesRating": 1650,
        "codeforcesSolved": 90,
        "codechefRating": 1580,
        "codechefSolved": 0,
        "dpSolved": 72,
        "advancedTopicsSolved": 72,
        "algorithmicDepth": 88,
        "githubContributions": 510,
        "skills": ["Python", "PyTorch", "Transformers", "NLP", "LLMs", "Scikit-Learn", "FastAPI"],
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
        "maxContestRating": 1580,
        "totalQuestionsSolved": 490,
        "achievementsCount": 2,
        "projectsCount": 4,
        "commitsCount": 620,
        "leetcodeSolved": 410,
        "leetcodeContestRating": 1520,
        "codeforcesRating": 1580,
        "codeforcesSolved": 80,
        "codechefRating": 1500,
        "codechefSolved": 0,
        "dpSolved": 55,
        "advancedTopicsSolved": 55,
        "algorithmicDepth": 82,
        "githubContributions": 620,
        "skills": ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Prometheus", "Go / Golang"],
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
        "maxContestRating": 1540,
        "totalQuestionsSolved": 390,
        "achievementsCount": 2,
        "projectsCount": 3,
        "commitsCount": 430,
        "leetcodeSolved": 320,
        "leetcodeContestRating": 1490,
        "codeforcesRating": 1540,
        "codeforcesSolved": 70,
        "codechefRating": 1450,
        "codechefSolved": 0,
        "dpSolved": 42,
        "advancedTopicsSolved": 42,
        "algorithmicDepth": 76,
        "githubContributions": 430,
        "skills": ["Penetration Testing", "Network Security", "OWASP Top 10", "Wireshark", "Cryptography", "Python"],
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
        "maxContestRating": 1600,
        "totalQuestionsSolved": 440,
        "achievementsCount": 1,
        "projectsCount": 4,
        "commitsCount": 480,
        "leetcodeSolved": 360,
        "leetcodeContestRating": 1550,
        "codeforcesRating": 1600,
        "codeforcesSolved": 80,
        "codechefRating": 1520,
        "codechefSolved": 0,
        "dpSolved": 50,
        "advancedTopicsSolved": 50,
        "algorithmicDepth": 84,
        "githubContributions": 480,
        "skills": ["Modern C++", "Rust", "Linux Kernel", "RTOS", "Multithreading", "Socket Programming"],
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
        "maxContestRating": 1480,
        "totalQuestionsSolved": 370,
        "achievementsCount": 1,
        "projectsCount": 5,
        "commitsCount": 560,
        "leetcodeSolved": 310,
        "leetcodeContestRating": 1440,
        "codeforcesRating": 1480,
        "codeforcesSolved": 60,
        "codechefRating": 1400,
        "codechefSolved": 0,
        "dpSolved": 38,
        "advancedTopicsSolved": 38,
        "algorithmicDepth": 74,
        "githubContributions": 560,
        "skills": ["Flutter", "Kotlin", "React Native", "Android SDK", "Firebase", "REST APIs"],
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
    min_dp: Optional[int] = Query(0, description="Minimum Advanced Topics solved"),
    min_advanced: Optional[int] = Query(0, description="Minimum Advanced Topics solved"),
    skill: Optional[str] = Query(None, description="Search by skill name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = []
    effective_min_adv = max(min_dp or 0, min_advanced or 0)

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
        adv_topics = topic_counts.get("advanced_topics", 0) or topic_counts.get("dp_and_advanced", 0) or dp_solved
        alg_depth = lc_stats.get("algorithmic_depth_score", 0)

        if min_leetcode and lc_solved < min_leetcode:
            continue

        if effective_min_adv and adv_topics < effective_min_adv:
            continue

        user_skills = [s.name for s in u.skills]
        if skill and not any(skill.lower() in s.lower() for s in user_skills):
            continue

        cf_stats = stats.get("codeforces", {})
        cc_stats = stats.get("codechef", {})
        gh_stats = stats.get("github", {})

        lc_contest_rating = lc_stats.get("contest_rating", 0)
        cf_rating = cf_stats.get("rating", 0)
        cc_rating = cc_stats.get("rating", 0)
        max_contest_rating = max(lc_contest_rating, cf_rating, cc_rating, 0)

        cf_solved = cf_stats.get("solved", 0)
        cc_solved = cc_stats.get("solved", 0)
        total_questions = lc_solved + cf_solved + cc_solved

        gh_commits = gh_stats.get("commits", 0) or gh_stats.get("contributions", 0)
        projects_count = len(u.projects)
        achievements_list = [a.title for a in u.achievements]
        achievements_count = len(achievements_list)

        results.append({
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "college": normalize_college_name(profile.college) if (profile and profile.college) else "",
            "branch": normalize_branch_name(profile.branch) if (profile and profile.branch) else "",
            "year": profile.year if (profile and profile.year) else "",
            "careerGoal": profile.career_goal or "Software Engineer",
            "placementReadiness": readiness,
            # Priority metrics (1 to 5)
            "maxContestRating": max_contest_rating,
            "totalQuestionsSolved": total_questions,
            "achievementsCount": achievements_count,
            "projectsCount": projects_count,
            "commitsCount": gh_commits,
            # Individual platform metrics
            "leetcodeSolved": lc_solved,
            "leetcodeContestRating": lc_contest_rating,
            "codeforcesRating": cf_rating,
            "codeforcesSolved": cf_solved,
            "codechefRating": cc_rating,
            "codechefSolved": cc_solved,
            "dpSolved": dp_solved,
            "advancedTopicsSolved": adv_topics,
            "algorithmicDepth": alg_depth,
            "githubContributions": gh_commits,
            "skills": user_skills,
            "verifiedHandles": {
                "leetcode": lc_stats.get("verified", False),
                "github": gh_stats.get("verified", False),
                "codeforces": cf_stats.get("verified", False),
                "codechef": cc_stats.get("verified", False),
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

            b_adv = b.get("advancedTopicsSolved", b.get("dpSolved", 0))
            if effective_min_adv and b_adv < effective_min_adv:
                continue

            if skill and not any(skill.lower() in s.lower() for s in b["skills"]):
                continue

            results.append(dict(b))

    # Strict multi-tier priority sort:
    # 1st: Contest Rating -> 2nd: Questions Solved -> 3rd: Achievements -> 4th: Projects -> 5th: Commits
    results.sort(
        key=lambda c: (
            c.get("maxContestRating", 0),
            c.get("totalQuestionsSolved", 0),
            c.get("achievementsCount", 0),
            c.get("projectsCount", 0),
            c.get("commitsCount", 0),
            c.get("placementReadiness", 0),
        ),
        reverse=True,
    )
    return results
