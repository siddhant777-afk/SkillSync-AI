from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.normalizer import normalize_college_name, normalize_branch_name, are_colleges_matching
from app.models.profile import PlatformStats, StudentProfile
from app.models.user import User

router = APIRouter()


def create_platform_breakdown(
    lc_handle, lc_rating, lc_badge, lc_solved, lc_adv,
    cf_handle, cf_rating, cf_rank, cf_solved,
    cc_handle, cc_rating, cc_stars, cc_solved,
    gh_handle, gh_commits, gh_repos_count, gh_repos=None
):
    return {
        "leetcode": {
            "platform": "LeetCode",
            "handle": lc_handle,
            "verified": bool(lc_handle),
            "contestRating": lc_rating,
            "contestBadge": lc_badge,
            "solved": lc_solved,
            "advancedTopicsSolved": lc_adv,
            "profileUrl": f"https://leetcode.com/u/{lc_handle}" if lc_handle else "",
        },
        "codeforces": {
            "platform": "Codeforces",
            "handle": cf_handle,
            "verified": bool(cf_handle),
            "rating": cf_rating,
            "maxRating": cf_rating,
            "rank": cf_rank,
            "solved": cf_solved,
            "profileUrl": f"https://codeforces.com/profile/{cf_handle}" if cf_handle else "",
        },
        "codechef": {
            "platform": "CodeChef",
            "handle": cc_handle,
            "verified": bool(cc_handle),
            "rating": cc_rating,
            "stars": cc_stars,
            "solved": cc_solved,
            "profileUrl": f"https://www.codechef.com/users/{cc_handle}" if cc_handle else "",
        },
        "github": {
            "platform": "GitHub",
            "handle": gh_handle,
            "verified": bool(gh_handle),
            "commits": gh_commits,
            "repositoriesCount": gh_repos_count,
            "repositoriesList": gh_repos or [],
            "profileUrl": f"https://github.com/{gh_handle}" if gh_handle else "",
        },
    }


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
        "platformBreakdown": create_platform_breakdown(
            lc_handle="subhi_coder", lc_rating=1840, lc_badge="Knight", lc_solved=620, lc_adv=92,
            cf_handle="subhi_sharma", cf_rating=1750, cf_rank="Expert", cf_solved=120,
            cc_handle="subhi_cc", cc_rating=1820, cc_stars="4★", cc_solved=40,
            gh_handle="subhi-dev", gh_commits=850, gh_repos_count=5,
            gh_repos=[
                {"name": "Distributed-Task-Queue", "html_url": "https://github.com/subhi-dev/Distributed-Task-Queue", "description": "High-throughput async task orchestrator built with FastAPI, Redis, and Celery", "stars": 42, "forks": 9, "language": "Python"},
                {"name": "SkillSync-AI-Engine", "html_url": "https://github.com/subhi-dev/SkillSync-AI-Engine", "description": "Microservice for multi-platform talent verification and algorithmic benchmarking", "stars": 67, "forks": 15, "language": "Python"},
                {"name": "React-Interactive-Dashboard", "html_url": "https://github.com/subhi-dev/React-Interactive-Dashboard", "description": "Responsive real-time analytics UI built with Vite and Tailwind CSS", "stars": 28, "forks": 5, "language": "JavaScript"},
            ]
        ),
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
        "platformBreakdown": create_platform_breakdown(
            lc_handle="aarav_g", lc_rating=1680, lc_badge="Specialist", lc_solved=580, lc_adv=85,
            cf_handle="aarav_coder", cf_rating=1720, cf_rank="Candidate Master", cf_solved=110,
            cc_handle="aarav_dtu", cc_rating=1650, cc_stars="3★", cc_solved=0,
            gh_handle="aarav-g", gh_commits=740, gh_repos_count=4,
            gh_repos=[
                {"name": "Raft-Consensus-Go", "html_url": "https://github.com/aarav-g/Raft-Consensus-Go", "description": "Distributed fault-tolerant consensus engine in Go", "stars": 88, "forks": 17, "language": "Go"},
                {"name": "Kafka-Event-Streamer", "html_url": "https://github.com/aarav-g/Kafka-Event-Streamer", "description": "High-velocity event pipeline with Redis and Kafka", "stars": 35, "forks": 6, "language": "Go"},
            ]
        ),
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
        "platformBreakdown": create_platform_breakdown(
            lc_handle="priya_ai", lc_rating=1620, lc_badge="Specialist", lc_solved=490, lc_adv=72,
            cf_handle="priya_m", cf_rating=1650, cf_rank="Expert", cf_solved=90,
            cc_handle="priya_cc", cc_rating=1580, cc_stars="3★", cc_solved=0,
            gh_handle="priya-m", gh_commits=510, gh_repos_count=5,
            gh_repos=[
                {"name": "Graph-Transformer-NLP", "html_url": "https://github.com/priya-m/Graph-Transformer-NLP", "description": "PyTorch implementation of graph-augmented transformer models", "stars": 112, "forks": 24, "language": "Python"},
                {"name": "LLM-FineTune-Pipeline", "html_url": "https://github.com/priya-m/LLM-FineTune-Pipeline", "description": "LoRA and QLoRA efficient fine-tuning suite for open weights", "stars": 54, "forks": 11, "language": "Python"},
            ]
        ),
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
        "platformBreakdown": create_platform_breakdown(
            lc_handle="rohan_cloud", lc_rating=1520, lc_badge="", lc_solved=410, lc_adv=55,
            cf_handle="rohan_d", cf_rating=1580, cf_rank="Specialist", cf_solved=80,
            cc_handle="rohan_cc", cc_rating=1500, cc_stars="3★", cc_solved=0,
            gh_handle="rohan-cloud", gh_commits=620, gh_repos_count=4,
            gh_repos=[
                {"name": "K8s-Auto-Scaler-Controller", "html_url": "https://github.com/rohan-cloud/K8s-Auto-Scaler-Controller", "description": "Custom Kubernetes CRD controller for predictive workload scaling", "stars": 76, "forks": 14, "language": "Go"},
                {"name": "Terraform-AWS-Production", "html_url": "https://github.com/rohan-cloud/Terraform-AWS-Production", "description": "Multi-region modular infrastructure-as-code configuration", "stars": 41, "forks": 8, "language": "HCL"},
            ]
        ),
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
        "platformBreakdown": create_platform_breakdown(
            lc_handle="devansh_sec", lc_rating=1490, lc_badge="", lc_solved=320, lc_adv=42,
            cf_handle="devansh_r", cf_rating=1540, cf_rank="Specialist", cf_solved=70,
            cc_handle="devansh_cc", cc_rating=1450, cc_stars="2★", cc_solved=0,
            gh_handle="devansh-sec", gh_commits=430, gh_repos_count=3,
            gh_repos=[
                {"name": "Network-Packet-Analyzer", "html_url": "https://github.com/devansh-sec/Network-Packet-Analyzer", "description": "Real-time protocol dissector and anomaly detector with Scapy", "stars": 63, "forks": 12, "language": "Python"},
                {"name": "OWASP-Audit-CLI", "html_url": "https://github.com/devansh-sec/OWASP-Audit-CLI", "description": "Automated web application security audit tool", "stars": 49, "forks": 9, "language": "Python"},
            ]
        ),
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
        "platformBreakdown": create_platform_breakdown(
            lc_handle="aditya_sys", lc_rating=1550, lc_badge="", lc_solved=360, lc_adv=50,
            cf_handle="aditya_n", cf_rating=1600, cf_rank="Expert", cf_solved=80,
            cc_handle="aditya_cc", cc_rating=1520, cc_stars="3★", cc_solved=0,
            gh_handle="aditya-sys", gh_commits=480, gh_repos_count=4,
            gh_repos=[
                {"name": "High-Throughput-Packet-Sniffer", "html_url": "https://github.com/aditya-sys/High-Throughput-Packet-Sniffer", "description": "Raw socket Linux packet sniffer with zero-copy ring buffers", "stars": 120, "forks": 28, "language": "C++"},
                {"name": "Mini-RTOS-ARM", "html_url": "https://github.com/aditya-sys/Mini-RTOS-ARM", "description": "Preemptive real-time operating system kernel for ARM Cortex-M", "stars": 82, "forks": 16, "language": "C"},
            ]
        ),
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
        "platformBreakdown": create_platform_breakdown(
            lc_handle="sneha_mob", lc_rating=1440, lc_badge="", lc_solved=310, lc_adv=38,
            cf_handle="sneha_k", cf_rating=1480, cf_rank="Pupil", cf_solved=60,
            cc_handle="sneha_cc", cc_rating=1400, cc_stars="2★", cc_solved=0,
            gh_handle="sneha-mobile", gh_commits=560, gh_repos_count=5,
            gh_repos=[
                {"name": "Flutter-Finance-App", "html_url": "https://github.com/sneha-mobile/Flutter-Finance-App", "description": "Production personal budgeting app with 50k+ active Play Store downloads", "stars": 94, "forks": 22, "language": "Dart"},
                {"name": "Kotlin-Health-Tracker", "html_url": "https://github.com/sneha-mobile/Kotlin-Health-Tracker", "description": "Jetpack Compose health and step tracker app with background sensors", "stars": 57, "forks": 10, "language": "Kotlin"},
            ]
        ),
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
            "platformBreakdown": create_platform_breakdown(
                lc_handle=lc_stats.get("username") or "",
                lc_rating=lc_contest_rating,
                lc_badge=lc_stats.get("contest_badge") or "",
                lc_solved=lc_solved,
                lc_adv=adv_topics,
                cf_handle=cf_stats.get("username") or "",
                cf_rating=cf_rating,
                cf_rank=cf_stats.get("rank") or cf_stats.get("title") or "Unrated",
                cf_solved=cf_solved,
                cc_handle=cc_stats.get("username") or "",
                cc_rating=cc_rating,
                cc_stars=cc_stats.get("stars") or "",
                cc_solved=cc_solved,
                gh_handle=gh_stats.get("username") or "",
                gh_commits=gh_commits,
                gh_repos_count=gh_stats.get("repositories", 0) or len(gh_stats.get("repositories_list", [])),
                gh_repos=gh_stats.get("repositories_list", []),
            ),
        })

    # 2. Benchmark candidates: Included for testing account or as fallback when DB has fewer than 2 candidates
    is_tester = current_user and current_user.email and current_user.email.lower().strip() in ("subhi@example.com", "test@example.com")
    if is_tester or len(results) < 2:
        existing_emails = {r["email"].lower() for r in results if r.get("email")}
        for b in BENCHMARK_CANDIDATES:
            if b["email"].lower() in existing_emails:
                continue
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
