import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CountUp from "../components/CountUp";
import EmptyStateCard from "../components/EmptyStateCard";
import Panel from "../components/Panel";
import MovementDetailModal from "../components/MovementDetailModal";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { buildGuideTarget, getGuideStatusLabel, resolveMovementVisual } from "../../shared/exerciseCatalog";
import { getExerciseImageSrc } from "../utils/getExerciseImageSrc";

const LIBRARY_CATEGORY_ORDER = ["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Glutes", "Core", "Conditioning", "Mobility"];
// Virtual categories: a Workout Library tile with no single library category
// expands to a set. "Arms" = Biceps + Triceps.
const VIRTUAL_CATEGORIES = { Arms: ["Biceps", "Triceps"] };
function entryMatchesCategory(entry, selected) {
  if (selected === "All") return true;
  const set = VIRTUAL_CATEGORIES[selected];
  return set ? set.includes(entry.category) : entry.category === selected;
}

// Canonical equipment families for filtering. The raw catalog equipment
// strings are free text ("Barbell or dumbbell", "Barbell, dumbbells, or
// kettlebells depending on variation", ...) — exact-string matching against
// them made most equipment selections return ZERO results (owner audit F5).
// Filtering is token-based instead: an entry matches "Dumbbells" when any of
// its equipment strings mentions a dumbbell.
const EQUIPMENT_FILTER_OPTIONS = [
  { value: "barbell", label: "Barbell" },
  { value: "dumbbell", label: "Dumbbells" },
  { value: "kettlebell", label: "Kettlebells" },
  { value: "band", label: "Bands" },
  { value: "machine", label: "Machines / Cables" },
  { value: "bench", label: "Bench" },
  { value: "pull-up", label: "Pull-up bar" },
  { value: "bodyweight", label: "Bodyweight" }
];

function entryMatchesEquipment(entry, token) {
  if (!token || token === "all") {
    return true;
  }
  const haystack = (entry.equipment || []).join(" ").toLowerCase();
  if (token === "machine") {
    return /machine|cable/.test(haystack);
  }
  if (token === "pull-up") {
    return /pull-?up|chin-?up/.test(haystack);
  }
  return haystack.includes(token);
}

export default function ExerciseLibraryPage() {
  const { token } = useAuth();
  const { data } = useDashboardData();
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  // Deep-link filters from the Workout Library (or any link): ?category=Chest
  // selects a muscle category, ?q=Dumbbells / ?equipment=<value> pre-fill the
  // search / equipment filter. Re-applies whenever the query changes (e.g.
  // tapping another Workout Library tile) but never fights the user's in-page
  // filter changes (those don't touch the URL).
  useEffect(() => {
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const equipment = searchParams.get("equipment");
    if (category && (LIBRARY_CATEGORY_ORDER.includes(category) || VIRTUAL_CATEGORIES[category])) {
      setSelectedCategory(category);
      setSearch("");
    }
    if (q) {
      setSearch(q);
    }
    if (equipment) {
      const normalized = equipment.trim().toLowerCase();
      const match = EQUIPMENT_FILTER_OPTIONS.find(
        (option) => option.value === normalized || option.label.toLowerCase() === normalized
      );
      if (match) {
        setSelectedEquipment(match.value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const visualModelPreference = data?.profile?.visualModelPreference || "default";
  const openExerciseGuide = (entry) => setSelectedExercise(buildGuideTarget(entry));

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    apiRequest("/exercise-library", {}, token)
      .then((payload) => {
        setLibrary(payload);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [token]);

  const entries = library?.entries || [];
  const categories = useMemo(() => {
    const base = library?.categories || [];
    const byLabel = new Map(base.map((category) => [category.label, category]));
    return LIBRARY_CATEGORY_ORDER.map((label) => {
      if (label === "All") {
        return { id: "all", label: "All", count: entries.length };
      }
      return byLabel.get(label) || { id: label.toLowerCase(), label, count: 0 };
    }).filter((category) => category.count > 0 || category.label === "All");
  }, [entries.length, library?.categories]);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    // Relevance score for a search query: a name/title hit must always rank
    // above a tangential field hit, so searching "squat" surfaces "Back squat"
    // before squat-adjacent mobility ("Ankle rocks", "90/90 hip flow") that
    // only matched via training-use/muscle fields. Without this the results
    // fell back to the library's alphabetical order and the "top match" was
    // whatever sorted first, not the best match.
    const scoreEntry = (entry) => {
      const name = String(entry.name || entry.title || "").toLowerCase();
      if (name === normalizedSearch) return 100;
      if (name.startsWith(normalizedSearch)) return 90;
      if (new RegExp(`\\b${normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(name)) return 80;
      if (name.includes(normalizedSearch)) return 65;
      if (String(entry.category || "").toLowerCase().includes(normalizedSearch)) return 45;
      if ((entry.primaryMuscles || []).some((m) => String(m).toLowerCase().includes(normalizedSearch))) return 35;
      return 10; // matched only via a secondary/training-use field
    };

    const matched = entries.filter((entry) => {
      const searchPool = [
        entry.name,
        entry.title,
        entry.id,
        entry.detailId,
        entry.movementId,
        entry.category,
        entry.primaryMuscleGroup,
        entry.trainingUse,
        ...(entry.primaryMuscles || []),
        ...(entry.secondaryMuscleGroups || []),
        ...(entry.equipment || [])
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      const matchesSearch = searchPool.some((value) => value.includes(normalizedSearch));

      if (normalizedSearch) {
        return matchesSearch;
      }

      const matchesCategory = entryMatchesCategory(entry, selectedCategory);
      const matchesEquipment = entryMatchesEquipment(entry, selectedEquipment);
      const matchesDifficulty = selectedDifficulty === "all" || entry.difficulty === selectedDifficulty;
      return matchesCategory && matchesEquipment && matchesDifficulty;
    });

    if (!normalizedSearch) return matched;
    // Stable sort by relevance (descending); ties keep library order.
    return matched
      .map((entry, index) => ({ entry, index, score: scoreEntry(entry) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((item) => item.entry);
  }, [entries, search, selectedCategory, selectedDifficulty, selectedEquipment]);
  // Only offer equipment families that actually match at least one entry.
  const equipmentFilterOptions = useMemo(
    () => EQUIPMENT_FILTER_OPTIONS.filter((option) => entries.some((entry) => entryMatchesEquipment(entry, option.value))),
    [entries]
  );
  // "Top match" is only a meaningful concept when the user has actually
  // typed a query — otherwise the first library entry is not a "match" and
  // offering to open it (e.g. "Open top match: 90/90 hip flow" on an empty
  // field) reads as random noise.
  const topSearchMatch = search.trim() ? filteredEntries[0] || null : null;
  const hasActiveFilters =
    Boolean(search.trim()) || selectedCategory !== "All" || selectedEquipment !== "all" || selectedDifficulty !== "all";

  const visualCount = entries.filter((entry) => resolveMovementVisual(entry, { visualModelPreference }).visualLevel === "full").length;

  function resetExerciseSearch() {
    setSearch("");
    setSelectedCategory("All");
    setSelectedEquipment("all");
    setSelectedDifficulty("all");
    searchInputRef.current?.focus();
  }

  function openTopSearchMatch() {
    if (topSearchMatch) {
      openExerciseGuide(topSearchMatch);
    }
  }

  if (loading) {
    return <div className="screen-center">Loading exercise library...</div>;
  }

  if (error) {
    return (
      <div className="screen-center">
        <EmptyStateCard
          ctaLabel="Browse Workouts"
          ctaTo="/workouts"
          description={error}
          title="Exercise library unavailable"
        />
      </div>
    );
  }

  return (
    <>
      <div className="page-grid page-grid-tight exercise-library-page">
        {/* Editorial opener (Craftsmanship): the library's scale IS the story —
            real counts staged as hero numbers, same language as Progress. */}
        <section className="progress-pride exercise-library-opener" data-reveal>
          <p className="progress-pride-eyebrow">Exercise Library</p>
          <h2 className="progress-pride-title">Learn every movement, the right way.</h2>
          <p className="progress-pride-copy">
            Search every exercise in your training with step-by-step guides and coaching cues, so you always know exactly how to move.
          </p>
          <div className="progress-pride-stats">
            <div className="pride-stat pride-stat-lead">
              <span className="pride-stat-value"><CountUp value={library?.total || entries.length} /></span>
              <span className="pride-stat-label">Exercises</span>
            </div>
            <div className="pride-stat">
              <span className="pride-stat-value"><CountUp value={visualCount} /></span>
              <span className="pride-stat-label">Step-by-step visual guides</span>
            </div>
          </div>
        </section>

        <Panel title="Find the exact movement you need">
          <div className="exercise-library-filter-stack">
            <label className="form-field exercise-library-search">
              <span>Search exercises</span>
              <input
                ref={searchInputRef}
                placeholder="Search by exercise, muscle, or equipment"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && topSearchMatch) {
                    event.preventDefault();
                    openTopSearchMatch();
                  }
                }}
              />
            </label>

            {/* Only surface search actions once the user is actually
                searching/filtering — an empty field has no "top match" to
                open and nothing to clear. */}
            {search.trim() || hasActiveFilters ? (
              <div className="exercise-library-search-actions">
                {search.trim() ? (
                  <button className="secondary-button" disabled={!topSearchMatch} type="button" onClick={openTopSearchMatch}>
                    {topSearchMatch ? `Open top match: ${topSearchMatch.name}` : "No matching exercise"}
                  </button>
                ) : null}
                <button className="ghost-button" disabled={!hasActiveFilters} type="button" onClick={resetExerciseSearch}>
                  Clear search and filters
                </button>
              </div>
            ) : null}

            {search.trim() ? (
              <p className="support-copy exercise-library-search-hint">
                Press Enter to open the top result quickly.
              </p>
            ) : null}

            <div className="selector-row exercise-library-filters">
              <label className="form-field">
                <span>Equipment</span>
                <select value={selectedEquipment} onChange={(event) => setSelectedEquipment(event.target.value)}>
                  <option value="all">All equipment</option>
                  {equipmentFilterOptions.map((equipment) => (
                    <option key={equipment.value} value={equipment.value}>
                      {equipment.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Difficulty</span>
                <select value={selectedDifficulty} onChange={(event) => setSelectedDifficulty(event.target.value)}>
                  <option value="all">All difficulty levels</option>
                  {(library?.difficultyOptions || []).map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="exercise-library-category-row" role="tablist" aria-label="Exercise categories">
              {categories.map((category) => {
                const active = selectedCategory === category.label;
                return (
                  <button
                    key={category.id}
                    className={`exercise-library-category-pill ${active ? "exercise-library-category-pill-active" : ""}`}
                    aria-pressed={active}
                    type="button"
                    onClick={() => setSelectedCategory(category.label)}
                  >
                    <strong>{category.label}</strong>
                    <span>{category.count} options</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Panel>

        <Panel title="Every movement, with a visual guide">
          <p className="exercise-library-result-count">
            {search.trim()
              ? `${filteredEntries.length} exercises match the current search.`
              : `${filteredEntries.length} exercises match the current search and filters.`}
          </p>
          {filteredEntries.length ? (
            <div className="module-card-grid">
            {filteredEntries.map((entry) => (
              <article
                className="module-card module-card-clickable exercise-library-card"
                key={entry.detailId || entry.id}
                role="button"
                tabIndex={0}
                onClick={() => openExerciseGuide(entry)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openExerciseGuide(entry);
                  }
                }}
              >
                <div className="library-card-hero">
                  {renderExercisePreview(entry, visualModelPreference)}
                  <div className="library-card-hero-copy">
                    <span className="library-depth-note">{entry.category}</span>
                    <span className="library-depth-note">{getGuideStatusLabel(entry, { visualModelPreference })}</span>
                  </div>
                </div>
                <h4>{entry.name}</h4>
                <p className="exercise-library-card-line">
                  {[entry.equipmentDisplay, entry.primaryMuscleGroup].filter(Boolean).join(" · ")}
                </p>
                <div className="module-card-actions">
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openExerciseGuide(entry);
                    }}
                  >
                    Open exercise guide
                  </button>
                </div>
              </article>
            ))}
            </div>
          ) : (
            <EmptyStateCard
              ctaLabel="Start Strength"
              ctaTo="/workout/strength"
              description="Clear the search or filters, or jump straight into a working strength session."
              title="No exercises match these filters"
            />
          )}
        </Panel>
      </div>

      {selectedExercise ? (
        <MovementDetailModal
          movement={selectedExercise}
          movementId={selectedExercise?.detailId || selectedExercise?.guideTargetId || selectedExercise?.id}
          visualModelPreference={visualModelPreference}
          onClose={() => setSelectedExercise(null)}
        />
      ) : null}
    </>
  );
}

function renderExercisePreview(entry, visualModelPreference = "default") {
  const visual = resolveMovementVisual(entry, { visualModelPreference });
  if (visual.mode === "image") {
    return <img alt={visual.alt} className="library-card-thumb" loading="lazy" src={getExerciseImageSrc(visual.src)} />;
  }

  return (
    <div className="library-card-thumb library-card-thumb-placeholder exercise-library-card-fallback">
      <strong>{entry.name}</strong>
    </div>
  );
}
