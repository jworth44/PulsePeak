import React, { useEffect, useMemo, useRef, useState } from "react";
import Panel from "../components/Panel";
import MovementDetailModal from "../components/MovementDetailModal";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { buildGuideTarget, getGuideStatusLabel, resolveMovementVisual } from "../../shared/exerciseCatalog";

const LIBRARY_CATEGORY_ORDER = ["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Glutes", "Core", "Conditioning", "Mobility"];

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
  const searchInputRef = useRef(null);
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
    return entries.filter((entry) => {
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

      const matchesCategory = selectedCategory === "All" || entry.category === selectedCategory;
      const matchesEquipment = selectedEquipment === "all" || (entry.equipment || []).includes(selectedEquipment);
      const matchesDifficulty = selectedDifficulty === "all" || entry.difficulty === selectedDifficulty;
      return matchesCategory && matchesEquipment && matchesDifficulty;
    });
  }, [entries, search, selectedCategory, selectedDifficulty, selectedEquipment]);
  const topSearchMatch = filteredEntries[0] || null;
  const hasActiveFilters =
    Boolean(search.trim()) || selectedCategory !== "All" || selectedEquipment !== "all" || selectedDifficulty !== "all";

  const visualCount = entries.filter((entry) => resolveMovementVisual(entry, { visualModelPreference }).visualLevel === "full").length;
  const textGuideCount = entries.filter((entry) => resolveMovementVisual(entry, { visualModelPreference }).visualLevel !== "full").length;

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
    return <div className="screen-center">{error}</div>;
  }

  return (
    <>
      <div className="page-grid page-grid-tight">
        <section className="module-page-hero exercise-library-hero">
          <div className="today-hero-copy">
            <p className="section-label">Exercise Library</p>
            <h2>Browse every movement used by PulsePeak workouts.</h2>
            <p className="lead-copy">
              This library now drives the live movement guide, workout exercise cards, and the deeper movement pool so every exercise has one real source of truth.
            </p>
          </div>
          <div className="today-hero-score">
            <span className="section-label">Coverage</span>
            <strong>{library?.total || entries.length} live exercises</strong>
            <p className="support-copy">{visualCount} visual guides</p>
            <p className="support-copy">{textGuideCount} text coaching guides</p>
          </div>
        </section>

        <Panel eyebrow="Search and filters" title="Find the exact movement you need">
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

            <div className="exercise-library-search-actions">
              <button className="secondary-button" disabled={!topSearchMatch} type="button" onClick={openTopSearchMatch}>
                {topSearchMatch ? `Open top match: ${topSearchMatch.name}` : "No matching exercise"}
              </button>
              <button className="ghost-button" disabled={!hasActiveFilters} type="button" onClick={resetExerciseSearch}>
                Clear search and filters
              </button>
            </div>

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
                  {(library?.equipmentOptions || []).map((equipment) => (
                    <option key={equipment} value={equipment}>
                      {equipment}
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

        <Panel eyebrow="Exercise library" title="Source-of-truth exercise cards">
          <div className="section-context compact-section-context">
            <span className="section-context-label">Visible results</span>
            <p>
              {search.trim()
                ? `${filteredEntries.length} exercises match the current search.`
                : `${filteredEntries.length} exercises match the current search and filters.`}
            </p>
          </div>
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
                <div className="exercise-library-card-meta">
                  <p className="support-copy"><strong>Pattern:</strong> {entry.movementPattern}</p>
                  <p className="support-copy"><strong>Equipment:</strong> {entry.equipmentDisplay}</p>
                  <p className="support-copy"><strong>Primary muscles:</strong> {entry.primaryMuscleGroup}</p>
                  <p className="support-copy"><strong>Difficulty:</strong> {entry.difficulty} · <strong>Joint stress:</strong> {entry.jointStress}</p>
                </div>
                <p className="exercise-library-card-status">
                  {getGuideStatusLabel(entry, { visualModelPreference })}
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
    return <img alt={visual.alt} className="library-card-thumb" src={visual.src} />;
  }

  return (
    <div className="library-card-thumb library-card-thumb-placeholder exercise-library-card-fallback">
      <small>Text coaching guide</small>
      <strong>{entry.name}</strong>
      <p>{entry.primaryMuscleGroup}</p>
      <span>{entry.equipmentDisplay}</span>
      <span>{entry.difficulty} · {entry.jointStress} joint stress</span>
    </div>
  );
}
