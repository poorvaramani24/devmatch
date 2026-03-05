import math
from app.models.profile import Profile


# Weights for each matching dimension
WEIGHTS = {
    "tech_stack": 0.30,
    "experience": 0.15,
    "work_style": 0.15,
    "location": 0.10,
    "personality": 0.15,
    "matching_mode": 0.15,
}

# Personality compatibility matrix (higher = more compatible)
PERSONALITY_COMPAT = {
    ("Introvert", "Introvert"): 0.7,
    ("Introvert", "Extrovert"): 0.6,
    ("Introvert", "Ambivert"): 0.8,
    ("Introvert", "Builder"): 0.7,
    ("Introvert", "Researcher"): 0.9,
    ("Introvert", "Mentor"): 0.7,
    ("Extrovert", "Extrovert"): 0.7,
    ("Extrovert", "Ambivert"): 0.8,
    ("Extrovert", "Builder"): 0.8,
    ("Extrovert", "Researcher"): 0.5,
    ("Extrovert", "Mentor"): 0.9,
    ("Ambivert", "Ambivert"): 0.8,
    ("Ambivert", "Builder"): 0.8,
    ("Ambivert", "Researcher"): 0.7,
    ("Ambivert", "Mentor"): 0.8,
    ("Builder", "Builder"): 0.9,
    ("Builder", "Researcher"): 0.8,
    ("Builder", "Mentor"): 0.7,
    ("Researcher", "Researcher"): 0.8,
    ("Researcher", "Mentor"): 0.7,
    ("Mentor", "Mentor"): 0.6,
}

# Tech stack category groupings for partial matching
TECH_CATEGORIES = {
    "frontend": {"react", "vue", "angular", "svelte", "nextjs", "nuxt", "html", "css", "javascript", "typescript", "tailwind", "bootstrap"},
    "backend": {"python", "java", "go", "rust", "node", "express", "fastapi", "django", "spring", "rails", "ruby", "php", "laravel", "dotnet", "c#"},
    "mobile": {"react native", "flutter", "swift", "kotlin", "ios", "android"},
    "data": {"sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "kafka", "spark", "hadoop"},
    "devops": {"docker", "kubernetes", "aws", "gcp", "azure", "terraform", "jenkins", "github actions", "ci/cd", "linux"},
    "ml": {"tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "jupyter", "mlflow", "huggingface"},
    "testing": {"selenium", "playwright", "cypress", "jest", "pytest", "junit", "testng", "cucumber"},
}


def jaccard_similarity(set_a: set, set_b: set) -> float:
    if not set_a and not set_b:
        return 0.0
    intersection = set_a & set_b
    union = set_a | set_b
    return len(intersection) / len(union) if union else 0.0


def tech_stack_score(stack_a: list[str], stack_b: list[str]) -> float:
    set_a = {s.lower().strip() for s in stack_a}
    set_b = {s.lower().strip() for s in stack_b}

    # Direct overlap (Jaccard similarity)
    direct_score = jaccard_similarity(set_a, set_b)

    # Category overlap - people in similar domains get a bonus
    cats_a = set()
    cats_b = set()
    for cat, techs in TECH_CATEGORIES.items():
        if set_a & techs:
            cats_a.add(cat)
        if set_b & techs:
            cats_b.add(cat)

    category_score = jaccard_similarity(cats_a, cats_b)

    # Weighted combination: direct overlap matters more
    return direct_score * 0.7 + category_score * 0.3


def experience_score(exp_a: int, exp_b: int) -> float:
    diff = abs(exp_a - exp_b)
    # 0 diff = 1.0, 2 years diff = 0.8, 5+ years diff = 0.4
    return max(0.2, 1.0 - (diff * 0.12))


def work_style_score(style_a: str, style_b: str) -> float:
    if style_a == style_b:
        return 1.0
    # Flexible matches well with everything
    if "Flexible" in (style_a, style_b):
        return 0.8
    # Hybrid is somewhat compatible with both remote and onsite
    if "Hybrid" in (style_a, style_b):
        return 0.6
    # Remote vs Onsite is least compatible
    return 0.3


def location_score(profile_a: Profile, profile_b: Profile) -> float:
    # If either prefers remote work, location matters less
    if profile_a.work_style == "Remote" or profile_b.work_style == "Remote":
        return 0.8

    # Same city
    if profile_a.city and profile_b.city and profile_a.city.lower() == profile_b.city.lower():
        return 1.0

    # Same state
    if profile_a.state and profile_b.state and profile_a.state.lower() == profile_b.state.lower():
        return 0.8

    # Same country
    if profile_a.country.lower() == profile_b.country.lower():
        return 0.5

    # If we have coordinates, use distance
    if all([profile_a.latitude, profile_a.longitude, profile_b.latitude, profile_b.longitude]):
        dist = haversine_distance(
            profile_a.latitude, profile_a.longitude,
            profile_b.latitude, profile_b.longitude,
        )
        max_dist = max(profile_a.max_distance_km, profile_b.max_distance_km)
        if dist <= max_dist:
            return max(0.3, 1.0 - (dist / max_dist) * 0.7)
        return 0.1

    return 0.4


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


def personality_score(p_a: str, p_b: str) -> float:
    key = (p_a, p_b) if (p_a, p_b) in PERSONALITY_COMPAT else (p_b, p_a)
    return PERSONALITY_COMPAT.get(key, 0.5)


def matching_mode_score(mode_a: str, mode_b: str) -> float:
    if mode_a == mode_b:
        return 1.0
    # Casual and Hackathon Buddy are somewhat compatible
    casual_modes = {"Casual", "Hackathon Buddy", "Co-founder Energy"}
    if mode_a in casual_modes and mode_b in casual_modes:
        return 0.6
    return 0.2


def calculate_compatibility(profile_a: Profile, profile_b: Profile) -> float:
    scores = {
        "tech_stack": tech_stack_score(profile_a.tech_stack or [], profile_b.tech_stack or []),
        "experience": experience_score(profile_a.years_experience, profile_b.years_experience),
        "work_style": work_style_score(profile_a.work_style, profile_b.work_style),
        "location": location_score(profile_a, profile_b),
        "personality": personality_score(profile_a.personality, profile_b.personality),
        "matching_mode": matching_mode_score(profile_a.matching_mode, profile_b.matching_mode),
    }

    total = sum(scores[key] * WEIGHTS[key] for key in WEIGHTS)

    # Hobby bonus (up to 5%)
    if profile_a.hobbies and profile_b.hobbies:
        hobby_overlap = jaccard_similarity(
            {h.lower() for h in profile_a.hobbies},
            {h.lower() for h in profile_b.hobbies},
        )
        total += hobby_overlap * 0.05

    # Cap at 1.0 and convert to percentage
    return round(min(total, 1.0) * 100, 1)


def passes_basic_filters(viewer: Profile, candidate: Profile) -> bool:
    # Age preferences
    if candidate.age < viewer.min_age_preference or candidate.age > viewer.max_age_preference:
        return False
    if viewer.age < candidate.min_age_preference or viewer.age > candidate.max_age_preference:
        return False

    # Gender preferences
    if viewer.looking_for and candidate.gender not in viewer.looking_for:
        return False
    if candidate.looking_for and viewer.gender not in candidate.looking_for:
        return False

    # Visibility
    if not candidate.is_visible:
        return False

    return True
