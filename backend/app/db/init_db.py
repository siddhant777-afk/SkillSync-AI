from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.achievement import Achievement
from app.models.profile import ConnectedAccounts, PlatformStats, StudentProfile
from app.models.project import Project
from app.models.recommendation import Recommendation
from app.models.resume import ResumeData
from app.models.skill import Skill, SkillGap
from app.models.user import User


def init_db(db: Session) -> None:
    # Check if student exists
    student = db.query(User).filter(User.email == "subhi@example.com").first()
    if not student:
        student = User(
            email="subhi@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Subhi Sharma",
            role="student",
            is_verified=True,
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        profile = StudentProfile(
            user_id=student.id,
            year="3rd Year",
            branch="AIML",
            college="GL Bajaj Institute of Technology and Management",
            bio="AIML undergraduate student passionate about intelligent systems, competitive programming, and scalable backend infrastructure.",
            career_goal="AI / ML Engineer",
            target_company_type="Product Tech Giants & High-Growth AI Startups",
            placement_readiness=82,
            profile_completion=90,
        )
        db.add(profile)

        accounts = ConnectedAccounts(
            user_id=student.id,
            github_username="SubhiSharma",
            leetcode_username="subhisharma",
            codeforces_username="subhisharma",
            codechef_username="subhisharma",
            kaggle_username="subhisharma",
        )
        db.add(accounts)

        # Platform stats
        stats = [
            PlatformStats(
                user_id=student.id,
                platform="github",
                stats_data={"username": "SubhiSharma", "contributions": 620, "repositories": 18, "stars": 42},
            ),
            PlatformStats(
                user_id=student.id,
                platform="leetcode",
                stats_data={"username": "subhisharma", "solved": 420, "rank": "Top 18%", "easy": 180, "medium": 210, "hard": 30},
            ),
            PlatformStats(
                user_id=student.id,
                platform="codeforces",
                stats_data={"username": "subhisharma", "rating": 1580, "title": "Pupil", "maxRating": 1620},
            ),
            PlatformStats(
                user_id=student.id,
                platform="codechef",
                stats_data={"username": "subhisharma", "rating": 1760, "title": "3★"},
            ),
            PlatformStats(
                user_id=student.id,
                platform="kaggle",
                stats_data={"username": "subhisharma", "notebooks": 4},
            ),
        ]
        for s in stats:
            db.add(s)

        # Skills
        skills_data = [
            ("Python", 90, "Languages", "Strong"),
            ("DSA", 88, "Computer Science", "Strong"),
            ("Machine Learning", 80, "AI & Data", "Strong"),
            ("SQL", 75, "Databases", "Strong"),
            ("Web Development", 60, "Engineering", "Growing"),
            ("System Design", 40, "Architecture", "Needs Improvement"),
        ]
        for name, level, cat, st in skills_data:
            db.add(Skill(user_id=student.id, name=name, level=level, category=cat, status=st))

        # Skill Gaps
        gaps_data = [
            ("Kubernetes", "High", "DevOps", "Industry requirement for scalable container orchestration."),
            ("Data Engineering", "High", "Data", "Required for large-scale ML training pipelines."),
            ("CI/CD", "Medium", "Engineering", "Automated deployment standards for top tech companies."),
            ("Docker", "Medium", "Cloud", "Containerization fundamental."),
            ("Go / Golang", "Low", "Backend", "Beneficial for high-throughput microservices."),
        ]
        for name, pri, cat, reason in gaps_data:
            db.add(SkillGap(user_id=student.id, name=name, priority=pri, category=cat, reason=reason))

        # Projects
        projects_data = [
            (
                "SkillSync AI",
                "Career intelligence SaaS for students, faculty and recruiters aggregating multi-platform signals.",
                "React · FastAPI · PostgreSQL",
                "https://github.com/subhisharma409/SkillSync-AI",
                "https://subhisharma409.github.io/SkillSync-AI/",
                "In Progress",
                92,
            ),
            (
                "Customer Churn Prediction",
                "End-to-end ML pipeline with explainability (SHAP), automated data preprocessing and hyperparameter tuning.",
                "Python · scikit-learn · Streamlit",
                "https://github.com/subhisharma409",
                "",
                "Deployed",
                84,
            ),
            (
                "Spam SMS Detection",
                "Natural language processing pipeline utilizing TF-IDF vectorization and Naive Bayes / SVM classifiers.",
                "Python · NLP · scikit-learn",
                "https://github.com/subhisharma409",
                "",
                "Completed",
                76,
            ),
        ]
        for name, desc, stack, gh, live, status, score in projects_data:
            db.add(Project(user_id=student.id, name=name, description=desc, stack=stack, github_url=gh, live_url=live, status=status, score=score))

        # Achievements
        achievements_data = [
            ("500 LeetCode Problems Solved", "20 May 2024", "Consistent DSA practice milestone across data structures.", "leetcode"),
            ("100 Days Coding Streak", "18 May 2024", "Maintained daily competitive programming streak without interruption.", "streak"),
            ("Top 10% LeetCode Weekly Contest", "12 May 2024", "Strong contest performance solving 3/4 challenging problems.", "contest"),
        ]
        for title, date, desc, icon in achievements_data:
            db.add(Achievement(user_id=student.id, title=title, date=date, description=desc, icon=icon))

        # Recommendations
        recs = [
            "Learn Docker and containerize one of your ML projects.",
            "Practice 50 more Graph and DP problems on LeetCode.",
            "Build and deploy an end-to-end ML project with CI/CD.",
            "Start low-level System Design with APIs, caching and databases.",
        ]
        for idx, text in enumerate(recs):
            db.add(Recommendation(user_id=student.id, text=text, sequence=idx + 1))

        # Resume
        resume = ResumeData(
            user_id=student.id,
            headline="Aspiring AI / ML & Software Engineer",
            summary="Pre-final year undergraduate in Artificial Intelligence and Machine Learning with deep expertise in Python, Data Structures & Algorithms, and Machine Learning pipelines.",
            ats_score=84,
            education=[
                {
                    "degree": "B.Tech in Artificial Intelligence & Machine Learning",
                    "institution": "GL Bajaj Institute of Technology and Management",
                    "year": "2022 - 2026",
                    "score": "8.8 CGPA",
                }
            ],
            skills_json=["Python", "DSA", "Machine Learning", "FastAPI", "React", "PostgreSQL", "SQL", "Git", "Docker"],
            projects_json=[
                {
                    "title": "SkillSync AI",
                    "stack": "React, FastAPI, PostgreSQL, Tailwind",
                    "description": "Engineered a unified career intelligence system integrating GitHub, LeetCode, and Codeforces APIs with automated placement readiness scoring.",
                },
                {
                    "title": "Customer Churn Prediction",
                    "stack": "Python, Scikit-Learn, Streamlit",
                    "description": "Constructed an end-to-end machine learning model with 91% accuracy, reducing prediction latency by 35%.",
                },
            ],
            experience_json=[
                {
                    "role": "Machine Learning Research Intern",
                    "company": "Innovation Tech Labs",
                    "duration": "Jun 2024 - Aug 2024",
                    "description": "Developed predictive models for time-series forecasting, utilizing automated feature engineering.",
                }
            ],
            achievements_json=[
                "500+ LeetCode problems solved (Top 18% global ranking)",
                "100 Days coding streak on competitive platforms",
                "Winner of College Level Hackathon 2024",
            ],
            ai_feedback="Your resume is strong on technical projects. Adding quantified impact metrics and cloud deployment details will boost your ATS pass rate.",
        )
        db.add(resume)

    db.commit()
