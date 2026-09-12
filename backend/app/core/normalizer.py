import re
from typing import Optional

# Known acronyms that should always be rendered in UPPERCASE
KNOWN_ACRONYMS = {
    "iit", "iiit", "nit", "bits", "dtu", "nsut", "mit", "vit", "srm",
    "tiet", "coep", "gl", "vjti", "rvce", "bmsce", "msrit", "pes",
    "igdtuw", "iiest", "lnmiit", "thapar", "pec", "da-iict", "daiict",
    "cse", "it", "ece", "eee", "ai", "aiml", "ds", "iim", "du", "jnu", "amu", "bhu"
}

# Words that should remain lowercase unless at the very start
LOWERCASE_WORDS = {"of", "and", "in", "for", "the", "at", "&"}

# Common spelling corrections
SPELLING_FIXES = {
    "tecnology": "Technology",
    "technolgy": "Technology",
    "tecnological": "Technological",
    "technolocal": "Technological",
    "institue": "Institute",
    "inst": "Institute",
    "engg": "Engineering",
    "enginerring": "Engineering",
    "enginering": "Engineering",
    "colg": "College",
    "univ": "University",
}


def normalize_college_name(name: Optional[str]) -> str:
    """
    Standardizes college/university names so that case differences,
    extra spaces, common typos, or casing variations
    (e.g., 'gl bajaj', 'GL BAJAJ', 'Gl Bajaj') map to the exact same string.
    """
    if not name:
        return ""

    raw = name.strip()
    if not raw:
        return ""

    # Collapse multiple whitespaces
    tokens = re.split(r"\s+", raw)
    normalized_tokens = []

    for i, token in enumerate(tokens):
        t_lower = token.lower()

        # Handle parentheses or punctuation wrapping: e.g. "(dtu)" or "dtu,"
        prefix = ""
        suffix = ""
        core = t_lower
        while core and core[0] in "([{\"'":
            prefix += core[0]
            core = core[1:]
        while core and core[-1] in ")]}\"',.":
            suffix = core[-1] + suffix
            core = core[:-1]

        if not core:
            normalized_tokens.append(token)
            continue

        # Check spelling fixes
        if core in SPELLING_FIXES:
            fixed = SPELLING_FIXES[core]
            normalized_tokens.append(f"{prefix}{fixed}{suffix}")
            continue

        # Check acronyms
        if core in KNOWN_ACRONYMS:
            normalized_tokens.append(f"{prefix}{core.upper()}{suffix}")
            continue

        # Check lowercase prepositions/conjunctions
        if i > 0 and core in LOWERCASE_WORDS:
            normalized_tokens.append(f"{prefix}{core.lower()}{suffix}")
            continue

        # Default title-case
        normalized_tokens.append(f"{prefix}{core.capitalize()}{suffix}")

    return " ".join(normalized_tokens)


def normalize_branch_name(branch: Optional[str]) -> str:
    """Standardizes academic branches across case variations."""
    if not branch:
        return ""

    b = branch.strip()
    if not b:
        return ""

    b_lower = b.lower()

    if b_lower in ["cse", "cs", "computer science", "computer science engineering", "b.tech in cse", "b.tech cse"]:
        return "Computer Science Engineering"
    if b_lower in ["aiml", "ai & ml", "ai/ml", "artificial intelligence and machine learning", "artificial intelligence"]:
        return "Artificial Intelligence & Machine Learning"
    if b_lower in ["it", "information technology"]:
        return "Information Technology"
    if b_lower in ["ece", "electronics", "electronics and communication"]:
        return "Electronics & Communication"
    if b_lower in ["ee", "eee", "electrical"]:
        return "Electrical Engineering"
    if b_lower in ["me", "mech", "mechanical"]:
        return "Mechanical Engineering"
    if b_lower in ["ce", "civil"]:
        return "Civil Engineering"

    return normalize_college_name(b)


def are_colleges_matching(c1: Optional[str], c2: Optional[str]) -> bool:
    """Case-insensitive, alias-aware comparison between two college names."""
    if not c1 or not c2:
        return False

    n1 = normalize_college_name(c1).lower()
    n2 = normalize_college_name(c2).lower()

    if n1 == n2:
        return True

    # If one is a substring of another (e.g. 'GL Bajaj' in 'GL Bajaj Institute of Technology and Management')
    if n1 in n2 or n2 in n1:
        return True

    return False
