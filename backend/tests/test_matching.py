"""Tests for the matching algorithm — the core feature of DevMatch."""
import pytest
from unittest.mock import MagicMock
from app.services.matching import (
    tech_stack_score,
    experience_score,
    work_style_score,
    personality_score,
    matching_mode_score,
    jaccard_similarity,
    haversine_distance,
    calculate_compatibility,
    passes_basic_filters,
)


class TestJaccardSimilarity:
    def test_identical_sets(self):
        assert jaccard_similarity({"a", "b", "c"}, {"a", "b", "c"}) == 1.0

    def test_disjoint_sets(self):
        assert jaccard_similarity({"a", "b"}, {"c", "d"}) == 0.0

    def test_partial_overlap(self):
        result = jaccard_similarity({"a", "b", "c"}, {"b", "c", "d"})
        assert result == pytest.approx(0.5)  # 2 shared / 4 total

    def test_empty_sets(self):
        assert jaccard_similarity(set(), set()) == 0.0

    def test_one_empty(self):
        assert jaccard_similarity({"a"}, set()) == 0.0


class TestTechStackScore:
    def test_identical_stacks(self):
        stack = ["React", "TypeScript", "Node.js"]
        score = tech_stack_score(stack, stack)
        assert score > 0.9

    def test_no_overlap(self):
        score = tech_stack_score(["React", "CSS"], ["Go", "Terraform"])
        assert score < 0.3

    def test_partial_overlap(self):
        score = tech_stack_score(
            ["React", "TypeScript", "Node.js", "PostgreSQL"],
            ["React", "TypeScript", "Python", "MongoDB"],
        )
        assert 0.3 < score < 0.8

    def test_same_category_bonus(self):
        # Both frontend-heavy stacks should score higher than raw overlap
        score = tech_stack_score(
            ["React", "Vue"],
            ["Angular", "Svelte"],
        )
        # No direct overlap but same category (frontend)
        assert score > 0.1

    def test_case_insensitive(self):
        score = tech_stack_score(["react", "TYPESCRIPT"], ["React", "TypeScript"])
        assert score > 0.9

    def test_empty_stacks(self):
        assert tech_stack_score([], []) == 0.0


class TestExperienceScore:
    def test_same_experience(self):
        assert experience_score(5, 5) == 1.0

    def test_close_experience(self):
        score = experience_score(5, 3)
        assert score > 0.7

    def test_large_gap(self):
        score = experience_score(1, 15)
        assert score < 0.5

    def test_minimum_score(self):
        # Even huge gaps shouldn't go below 0.2
        score = experience_score(0, 30)
        assert score >= 0.2


class TestWorkStyleScore:
    def test_same_style(self):
        assert work_style_score("Remote", "Remote") == 1.0

    def test_flexible_matches_well(self):
        assert work_style_score("Flexible", "Remote") == 0.8
        assert work_style_score("Flexible", "Onsite") == 0.8

    def test_hybrid_moderate(self):
        assert work_style_score("Hybrid", "Remote") == 0.6

    def test_remote_vs_onsite(self):
        assert work_style_score("Remote", "Onsite") == 0.3


class TestPersonalityScore:
    def test_introvert_researcher(self):
        # High compatibility
        assert personality_score("Introvert", "Researcher") == 0.9

    def test_extrovert_mentor(self):
        assert personality_score("Extrovert", "Mentor") == 0.9

    def test_builder_builder(self):
        assert personality_score("Builder", "Builder") == 0.9

    def test_symmetric(self):
        assert personality_score("Introvert", "Extrovert") == personality_score("Extrovert", "Introvert")

    def test_unknown_defaults(self):
        assert personality_score("Unknown", "Random") == 0.5


class TestMatchingModeScore:
    def test_same_mode(self):
        assert matching_mode_score("Serious Relationship", "Serious Relationship") == 1.0

    def test_casual_compatible(self):
        score = matching_mode_score("Casual", "Hackathon Buddy")
        assert score == 0.6

    def test_serious_vs_casual(self):
        score = matching_mode_score("Serious Relationship", "Casual")
        assert score == 0.2


class TestHaversineDistance:
    def test_same_point(self):
        assert haversine_distance(37.7749, -122.4194, 37.7749, -122.4194) == 0.0

    def test_sf_to_la(self):
        dist = haversine_distance(37.7749, -122.4194, 34.0522, -118.2437)
        assert 540 < dist < 560  # ~559 km

    def test_sf_to_nyc(self):
        dist = haversine_distance(37.7749, -122.4194, 40.7128, -74.0060)
        assert 4100 < dist < 4200  # ~4129 km


class TestCalculateCompatibility:
    def _make_profile(self, **kwargs):
        """Create a mock profile with sensible defaults."""
        defaults = {
            "tech_stack": ["Python", "React"],
            "years_experience": 5,
            "work_style": "Remote",
            "city": "San Francisco",
            "state": "California",
            "country": "United States",
            "latitude": None,
            "longitude": None,
            "personality": "Ambivert",
            "matching_mode": "Serious Relationship",
            "hobbies": ["coding"],
            "max_distance_km": 100,
            "age": 28,
            "gender": "Male",
            "looking_for": ["Female"],
            "is_visible": True,
            "min_age_preference": 18,
            "max_age_preference": 99,
        }
        defaults.update(kwargs)
        mock = MagicMock()
        for k, v in defaults.items():
            setattr(mock, k, v)
        return mock

    def test_identical_profiles_score_high(self):
        p = self._make_profile()
        score = calculate_compatibility(p, p)
        assert score > 80

    def test_completely_different_profiles(self):
        a = self._make_profile(
            tech_stack=["Go", "Terraform"],
            years_experience=15,
            work_style="Onsite",
            personality="Extrovert",
            matching_mode="Casual",
            city="Denver",
            state="Colorado",
        )
        b = self._make_profile(
            tech_stack=["React", "CSS"],
            years_experience=1,
            work_style="Remote",
            personality="Introvert",
            matching_mode="Serious Relationship",
            city="Miami",
            state="Florida",
        )
        score = calculate_compatibility(a, b)
        assert score < 50

    def test_score_bounded(self):
        p = self._make_profile()
        score = calculate_compatibility(p, p)
        assert 0 <= score <= 100

    def test_hobby_overlap_bonus(self):
        a = self._make_profile(hobbies=["hiking", "gaming", "cooking"])
        b_shared = self._make_profile(hobbies=["hiking", "gaming", "cooking"])
        b_none = self._make_profile(hobbies=["surfing"])

        score_shared = calculate_compatibility(a, b_shared)
        score_none = calculate_compatibility(a, b_none)
        assert score_shared > score_none


class TestPassesBasicFilters:
    def _make_profile(self, **kwargs):
        defaults = {
            "age": 28,
            "gender": "Male",
            "looking_for": ["Female"],
            "min_age_preference": 18,
            "max_age_preference": 99,
            "is_visible": True,
        }
        defaults.update(kwargs)
        mock = MagicMock()
        for k, v in defaults.items():
            setattr(mock, k, v)
        return mock

    def test_passes_when_compatible(self):
        viewer = self._make_profile(gender="Male", looking_for=["Female"])
        candidate = self._make_profile(gender="Female", looking_for=["Male"])
        assert passes_basic_filters(viewer, candidate) is True

    def test_fails_age_too_young(self):
        viewer = self._make_profile(min_age_preference=25)
        candidate = self._make_profile(age=22)
        assert passes_basic_filters(viewer, candidate) is False

    def test_fails_age_too_old(self):
        viewer = self._make_profile(max_age_preference=30)
        candidate = self._make_profile(age=35)
        assert passes_basic_filters(viewer, candidate) is False

    def test_fails_gender_mismatch(self):
        viewer = self._make_profile(looking_for=["Female"])
        candidate = self._make_profile(gender="Male", looking_for=["Male"])
        assert passes_basic_filters(viewer, candidate) is False

    def test_fails_invisible_profile(self):
        viewer = self._make_profile()
        candidate = self._make_profile(is_visible=False)
        assert passes_basic_filters(viewer, candidate) is False

    def test_passes_with_empty_looking_for(self):
        viewer = self._make_profile(looking_for=[])
        candidate = self._make_profile(looking_for=[])
        assert passes_basic_filters(viewer, candidate) is True
