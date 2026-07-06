import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyStateCard from "../components/EmptyStateCard";
import Panel from "../components/Panel";
import MovementDetailModal from "../components/MovementDetailModal";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { buildGuideTarget, getGuideStatusLabel, resolveMovementVisual } from "../../shared/exerciseCatalog";
import { getExerciseImageSrc } from "../utils/getExerciseImageSrc";

const INITIAL_VISIBLE_COUNT = 8;
const MOBILITY_CATEGORY_STORAGE_KEY = "pulsepeak.mobility.lastCategory";
const CATEGORY_ENTRY_META = {
  mobility_stretch: {
    icon: "◐",
    title: "Mobility & Stretch",
    description: "Drills and stretches for stiff areas that need direct support."
  },
  yoga: {
    icon: "△",
    title: "Yoga",
    description: "Flow-based movement sessions for breathing, range, and control."
  },
  recovery: {
    icon: "○",
    title: "Recovery",
    description: "Low-friction movement support for fatigue, stress, and soreness."
  },
  injury_support: {
    icon: "+",
    title: "Injury Support",
    description: "Guided rehab and ache support with strict targeted filtering."
  }
};
const TOP_LEVEL_ENTRY_CARDS = [
  {
    id: "strength",
    icon: "◆",
    title: "Strength",
    description: "Open the full strength movement library and workout path.",
    type: "route",
    to: "/exercise-library"
  },
  {
    id: "mobility_stretch",
    icon: CATEGORY_ENTRY_META.mobility_stretch.icon,
    title: CATEGORY_ENTRY_META.mobility_stretch.title,
    description: CATEGORY_ENTRY_META.mobility_stretch.description,
    type: "category"
  },
  {
    id: "yoga",
    icon: CATEGORY_ENTRY_META.yoga.icon,
    title: CATEGORY_ENTRY_META.yoga.title,
    description: CATEGORY_ENTRY_META.yoga.description,
    type: "category"
  },
  {
    id: "cardio",
    icon: "↗",
    title: "Cardio",
    description: "Jump into conditioning and cardio-focused movement options.",
    type: "route",
    to: "/exercise-library"
  },
  {
    id: "injury_support",
    icon: CATEGORY_ENTRY_META.injury_support.icon,
    title: CATEGORY_ENTRY_META.injury_support.title,
    description: CATEGORY_ENTRY_META.injury_support.description,
    type: "category"
  }
];
const QUICK_ACTIONS = [
  {
    id: "fix-pain",
    label: "Fix pain",
    description: "Go straight into guided injury support.",
    targetCategory: "injury_support"
  },
  {
    id: "improve-mobility",
    label: "Improve mobility",
    description: "Open direct mobility and stretch support.",
    targetCategory: "mobility_stretch"
  },
  {
    id: "start-workout",
    label: "Browse strength library",
    description: "Open the main strength movement library and workout path.",
    routeTo: "/exercise-library"
  }
];

export default function MobilityPage() {
  const { data, summary, loading, error } = useDashboardData();
  const { workoutMemory, workoutMomentum } = useAuth();
  const navigate = useNavigate();
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(() => readStoredMobilityCategory());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedIssueType, setSelectedIssueType] = useState("none");
  const [selectedInjury, setSelectedInjury] = useState("none");
  const [selectedSymptomType, setSelectedSymptomType] = useState("none");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [selectedSwaps, setSelectedSwaps] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCounts, setVisibleCounts] = useState({});
  const [loadingMoreKey, setLoadingMoreKey] = useState("");
  const mobilityModule = summary?.mobilityModule || null;
  const categories = mobilityModule?.categories || [];
  const effectiveEnvironment = data?.profile?.trainingEnvironment || "hybrid";
  const guidanceLevel = data?.profile?.exerciseGuidanceLevel || "standard";
  const routines = mobilityModule?.library || [];
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const isSearchMode = Boolean(normalizedSearchQuery);
  const openMovementGuide = (target) => setSelectedMovement(buildGuideTarget(target));
  const continuityContext = {
    title: "Stay consistent with targeted support",
    detail: "Use the guided movement categories to keep support work organized without extra coaching overlays."
  };

  const injuryMappingOptions = useMemo(() => {
    const configuredOptions = mobilityModule?.filterOptions?.injuryMappingOptions;
    return Array.isArray(configuredOptions) ? configuredOptions : [];
  }, [mobilityModule?.filterOptions?.injuryMappingOptions]);
  const acheBodyAreaOptions = useMemo(() => {
    const configuredOptions = mobilityModule?.filterOptions?.acheBodyAreaOptions;
    return Array.isArray(configuredOptions) ? configuredOptions : [];
  }, [mobilityModule?.filterOptions?.acheBodyAreaOptions]);
  const symptomTypeOptions = useMemo(() => {
    const configuredOptions = mobilityModule?.filterOptions?.symptomTypeOptions;
    return Array.isArray(configuredOptions) ? configuredOptions : [];
  }, [mobilityModule?.filterOptions?.symptomTypeOptions]);
  const selectedInjuryMapping = useMemo(
    () => injuryMappingOptions.find((option) => option.value === selectedInjury) || null,
    [injuryMappingOptions, selectedInjury]
  );
  const selectedInjuryBodyArea = selectedInjuryMapping?.bodyArea || "all";
  const issueTypePrompt = "Select your issue type to begin";
  const injurySupportPrompt = "Select an injury support type and body area to see targeted movements.";
  const acheSupportPrompt = "Select a body area and symptom type to see targeted support.";
  const recommendedCategory = getRecommendedCategory({
    selectedIssueType,
    selectedInjury,
    selectedArea,
    selectedSymptomType
  });
  const categoryIds = categories.map((category) => category.id);
  const recommendedSupportCategory = categoryIds.includes(recommendedCategory) ? recommendedCategory : "";
  const fallbackCategory = mobilityModule?.suggestedCategory || categories[0]?.id || "mobility_stretch";
  const effectiveCategory = categoryIds.includes(selectedCategory) ? selectedCategory : recommendedSupportCategory || fallbackCategory;
  const isInjurySupportReady =
    effectiveCategory !== "injury_support" ||
    (selectedIssueType === "injury"
      ? selectedInjury !== "none"
      : selectedIssueType === "ache"
        ? selectedArea !== "all" && selectedSymptomType !== "none"
        : false);

  useEffect(() => {
    setVisibleCounts({});
  }, [effectiveCategory, normalizedSearchQuery, selectedDifficulty, selectedEquipment, selectedArea, selectedIssueType, selectedInjury, selectedSymptomType]);

  useEffect(() => {
    if (!categories.length) {
      return;
    }

    if (categoryIds.includes(selectedCategory)) {
      return;
    }

    const nextCategory = recommendedSupportCategory || fallbackCategory;
    if (nextCategory && nextCategory !== selectedCategory) {
      setSelectedCategory(nextCategory);
    }
  }, [categories.length, categoryIds, fallbackCategory, recommendedSupportCategory, selectedCategory]);

  useEffect(() => {
    if (!effectiveCategory || !categoryIds.includes(effectiveCategory) || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(MOBILITY_CATEGORY_STORAGE_KEY, effectiveCategory);
  }, [categoryIds, effectiveCategory]);

  const browseRoutines = useMemo(() => {
    if (isSearchMode) {
      return [];
    }

    return routines
      .filter((routine) => {
        if (effectiveEnvironment !== "hybrid" && !(routine.environments || []).includes(effectiveEnvironment) && !(routine.environments || []).includes("hybrid")) {
          return false;
        }
        if (selectedDifficulty !== "all" && String(routine.difficulty || "").toLowerCase() !== selectedDifficulty) {
          return false;
        }
        if (selectedEquipment !== "all" && String(routine.equipmentProfile || "").toLowerCase() !== selectedEquipment) {
          return false;
        }

        if (effectiveCategory === "mobility_stretch") {
          return ["mobility_production", "stretch_production"].includes(routine.sourceType);
        }

        if (effectiveCategory === "yoga") {
          return routine.sourceType === "yoga_production";
        }

        if (effectiveCategory === "recovery") {
          return routine.supportTypes.includes("recovery");
        }

        if (effectiveCategory === "injury_support") {
          if (!isInjurySupportReady) {
            return false;
          }
          if (selectedIssueType === "injury") {
            return matchesInjurySupportRoutine(routine, selectedInjuryMapping);
          }
          if (selectedIssueType === "ache") {
            return matchesAcheSupportRoutine(routine, selectedArea, selectedSymptomType);
          }
          return false;
        }

        return false;
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [
    effectiveCategory,
    effectiveEnvironment,
    isInjurySupportReady,
    isSearchMode,
    routines,
    selectedArea,
    selectedDifficulty,
    selectedEquipment,
    selectedInjuryMapping,
    selectedIssueType,
    selectedSymptomType
  ]);

  const searchResults = useMemo(() => {
    if (!isSearchMode) {
      return [];
    }

    return routines
      .filter((routine) => {
        if (effectiveEnvironment !== "hybrid" && !(routine.environments || []).includes(effectiveEnvironment) && !(routine.environments || []).includes("hybrid")) {
          return false;
        }
        if (selectedDifficulty !== "all" && String(routine.difficulty || "").toLowerCase() !== selectedDifficulty) {
          return false;
        }
        if (selectedEquipment !== "all" && String(routine.equipmentProfile || "").toLowerCase() !== selectedEquipment) {
          return false;
        }
        if (!buildRoutineSearchHaystack(routine).includes(normalizedSearchQuery)) {
          return false;
        }
        return Boolean(getSearchCategoryId(routine));
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [effectiveEnvironment, isSearchMode, normalizedSearchQuery, routines, selectedDifficulty, selectedEquipment]);

  const searchGroups = useMemo(() => {
    if (!isSearchMode) {
      return [];
    }

    const grouped = new Map();
    searchResults.forEach((routine) => {
      const categoryId = getSearchCategoryId(routine);
      if (!categoryId) {
        return;
      }
      const entries = grouped.get(categoryId) || [];
      entries.push(routine);
      grouped.set(categoryId, entries);
    });

    return categories
      .map((category) => ({
        category,
        routines: grouped.get(category.id) || []
      }))
      .filter((group) => group.routines.length);
  }, [categories, isSearchMode, searchResults]);

  const suggestedRoutines = useMemo(() => {
    if (isSearchMode || (effectiveCategory === "injury_support" && !isInjurySupportReady)) {
      return [];
    }

    const direct = browseRoutines.slice(0, 4);
    if (direct.length >= 4) {
      return direct;
    }

    const fallback = routines.filter((routine) => {
      if (direct.some((entry) => entry.name === routine.name)) {
        return false;
      }
      if (effectiveCategory === "mobility_stretch") {
        return ["mobility_production", "stretch_production"].includes(routine.sourceType);
      }
      if (effectiveCategory === "yoga") {
        return routine.sourceType === "yoga_production";
      }
      if (effectiveCategory === "recovery") {
        return routine.supportTypes.includes("recovery");
      }
      return false;
    });

    return [...direct, ...fallback.slice(0, 4 - direct.length)];
  }, [browseRoutines, effectiveCategory, isInjurySupportReady, isSearchMode, routines]);

  const suggestedRoutineCards = useMemo(
    () =>
      suggestedRoutines.map((routine) => ({
        routine,
        currentRoutine: selectedSwaps[routine.name] || routine,
        swapOptions: browseRoutines.filter((entry) => entry.name !== routine.name && entry.phase === routine.phase)
      })),
    [browseRoutines, selectedSwaps, suggestedRoutines]
  );

  const totalSuggestedMinutes = suggestedRoutines.reduce((total, routine) => total + (routine.minutes || 0), 0);
  const visibleLibraryRoutines = browseRoutines.slice(0, getVisibleCount(visibleCounts, effectiveCategory));
  const visibleSearchGroups = searchGroups.map((group) => ({
    ...group,
    visibleRoutines: group.routines.slice(0, getVisibleCount(visibleCounts, `search-${group.category.id}`))
  }));

  if (loading) {
    return <div className="screen-center">Loading mobility guidance...</div>;
  }

  if (!data || !summary || !mobilityModule) {
    return (
      <div className="screen-center">
        <EmptyStateCard
          ctaLabel="Open Guided Start"
          ctaTo="/guided-start"
          description={error || "Use a working start path while mobility guidance reconnects."}
          title="Mobility guidance unavailable"
        />
      </div>
    );
  }

  const handleLoadMore = (key) => {
    setLoadingMoreKey(key);
    setVisibleCounts((current) => ({
      ...current,
      [key]: getVisibleCount(current, key) + INITIAL_VISIBLE_COUNT
    }));
    window.setTimeout(() => setLoadingMoreKey((current) => (current === key ? "" : current)), 320);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
    setSelectedArea("all");
    setSelectedIssueType("none");
    setSelectedInjury("none");
    setSelectedSymptomType("none");
    setSelectedDifficulty("all");
    setSelectedEquipment("all");
    setShowFilters(false);
  };

  const handleQuickAction = (action) => {
    if (action.routeTo) {
      navigate(action.routeTo);
      return;
    }
    handleCategorySelect(action.targetCategory);
    if (action.targetCategory === "injury_support") {
      setShowFilters(true);
    }
  };

  return (
    <div className="page-grid page-grid-tight">
      <section className="module-page-hero">
        <div className="mobility-hero-copy">
          <p className="badge">Mobility</p>
          <h2>{mobilityModule?.title || "Guided movement support that fits today"}</h2>
          <p className="lead-copy">{getModeLeadCopy(isSearchMode ? effectiveCategory : effectiveCategory)}</p>
          <p className="support-copy recommendation-context-note">{continuityContext.title}</p>
          <p className="support-copy smart-default-copy">
            Recommended right now: <strong>{getSmartCategoryLabel(recommendedCategory)}</strong>
          </p>
        </div>
        <div className="smart-quick-actions" aria-label="Quick actions">
          {QUICK_ACTIONS.map((action) => {
            const isRecommendedAction =
              (action.targetCategory && action.targetCategory === recommendedCategory) ||
              (action.routeTo && recommendedCategory === "strength");
            return (
              <button
                key={action.id}
                className={`smart-quick-action ${isRecommendedAction ? "smart-quick-action-recommended" : ""}`}
                type="button"
                onClick={() => handleQuickAction(action)}
              >
                <span className="smart-quick-action-label-row">
                  <strong>{action.label}</strong>
                  {isRecommendedAction ? <span className="recommendation-badge">Suggested</span> : null}
                </span>
                <span>{action.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Panel eyebrow="Top-level categories" title="Choose your training path">
        <div className="section-context">
          <span className="section-context-label">Start with the path that matches your goal</span>
          <p>Strength and Cardio stay easy to reach, while the guided movement-support modes stay available below for more targeted work.</p>
        </div>
        <div className="top-level-entry-grid">
          {TOP_LEVEL_ENTRY_CARDS.map((entry) => {
            const active = entry.type === "category" && effectiveCategory === entry.id && !isSearchMode;
            const recommended = entry.id === recommendedCategory;
            return (
              <button
                key={entry.id}
                className={`top-level-entry-card ${active ? "top-level-entry-card-active" : ""} ${recommended ? "top-level-entry-card-recommended" : ""}`}
                type="button"
                onClick={() => {
                  if (entry.type === "route") {
                    navigate(entry.to);
                    return;
                  }
                  handleCategorySelect(entry.id);
                }}
              >
                <span className="top-level-entry-icon" aria-hidden="true">{getEntryIcon(entry.id)}</span>
                {recommended ? <span className="recommendation-badge">Recommended</span> : null}
                <strong>{entry.title}</strong>
                <span>{entry.description}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel eyebrow="Choose your mode" title="Browse one support mode at a time">
        <div className="section-context">
          <span className="section-context-label">{isSearchMode ? "Search results" : "Today&apos;s support"}</span>
          <p>{isSearchMode ? "Search spans every support family and groups the matches below so you can jump directly into the right category." : getModeSupportCopy(effectiveCategory)}</p>
        </div>

        <div className="mobility-search-row">
          <label className="mobility-search-input">
            Search movements
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search movements, muscles, or goals"
            />
          </label>
        </div>

        <div className="selector-row selector-row-entry">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`selector-pill ${effectiveCategory === category.id ? "selector-pill-active" : ""} ${recommendedCategory === category.id ? "selector-pill-recommended" : ""}`}
              type="button"
              onClick={() => handleCategorySelect(category.id)}
            >
              <span className="selector-pill-icon" aria-hidden="true">
                {CATEGORY_ENTRY_META[category.id]?.icon || "•"}
              </span>
              {recommendedCategory === category.id ? <span className="recommendation-badge">Recommended</span> : null}
              <strong>{CATEGORY_ENTRY_META[category.id]?.title || category.label}</strong>
              <span>{CATEGORY_ENTRY_META[category.id]?.description || category.description}</span>
            </button>
          ))}
        </div>

        <div className="module-note module-note-inline">
          <button className="ghost-button" type="button" onClick={() => setShowFilters((current) => !current)}>
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
        </div>

        {showFilters ? (
          <div className="filter-bar discovery-filter-bar">
            {effectiveCategory !== "injury_support" ? (
              <>
                <label>
                  Difficulty
                  <select value={selectedDifficulty} onChange={(event) => setSelectedDifficulty(event.target.value)}>
                    {(mobilityModule?.filterOptions?.difficultyOptions || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Equipment
                  <select value={selectedEquipment} onChange={(event) => setSelectedEquipment(event.target.value)}>
                    {(mobilityModule?.filterOptions?.equipmentOptions || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <div className="injury-support-guide">
                  <div className="injury-support-steps">
                    <span className={`injury-step-pill ${selectedIssueType !== "none" ? "injury-step-pill-active" : ""}`}>Step 1 · Issue Type</span>
                    <span className={`injury-step-pill ${selectedIssueType === "injury" ? "injury-step-pill-active" : selectedIssueType === "ache" && selectedArea !== "all" ? "injury-step-pill-active" : ""}`}>Step 2 · Body Area / Injury</span>
                    <span className={`injury-step-pill ${isInjurySupportReady ? "injury-step-pill-active" : ""}`}>Step 3 · Results</span>
                  </div>
                  <p className="support-copy">We&apos;ll tailor movements based on your selection.</p>
                </div>
                <label>
                  Issue type
                  <select
                    value={selectedIssueType}
                    onChange={(event) => {
                      setSelectedIssueType(event.target.value);
                      setSelectedArea("all");
                      setSelectedInjury("none");
                      setSelectedSymptomType("none");
                    }}
                  >
                    <option value="none">Select issue type</option>
                    <option value="injury">Injury</option>
                    <option value="ache">Ache / Tightness</option>
                  </select>
                </label>

                {selectedIssueType === "injury" ? (
                  <label>
                    Injury
                    <select value={selectedInjury} onChange={(event) => setSelectedInjury(event.target.value)}>
                      <option value="none">Select injury</option>
                      {injuryMappingOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {selectedIssueType === "injury" && selectedInjuryMapping ? (
                  <label>
                    Body area
                    <select value={selectedInjuryBodyArea} disabled>
                      <option value={selectedInjuryBodyArea}>{formatBodyAreaLabel(selectedInjuryBodyArea)}</option>
                    </select>
                  </label>
                ) : null}

                {selectedIssueType === "ache" ? (
                  <label>
                    Body area
                    <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
                      <option value="all">Select body area</option>
                      {acheBodyAreaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {selectedIssueType === "ache" ? (
                  <label>
                    Symptom
                    <select value={selectedSymptomType} onChange={(event) => setSelectedSymptomType(event.target.value)}>
                      <option value="none">Select symptom</option>
                      {symptomTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </Panel>

      <div className={`content-grid category-transition-shell ${isSearchMode ? "category-transition-shell-search" : ""}`} key={isSearchMode ? `search-${normalizedSearchQuery}` : effectiveCategory}>
        <Panel eyebrow="Suggested today" title="Start here first">
          {isSearchMode ? (
            <div className="search-mode-state">
              <strong>Search results are shown separately from browsing mode.</strong>
              <p className="support-copy">Matches are grouped by category below so you can move straight into the right support library.</p>
            </div>
          ) : effectiveCategory === "injury_support" && !isInjurySupportReady ? (
            <EmptyStateCard
              ctaLabel="Start Injury Support"
              ctaTo="/injury-support"
              description={
                selectedIssueType === "none"
                  ? "Choose whether you are managing an injury or an ache so PulsePeak can narrow the support path."
                  : selectedIssueType === "injury"
                    ? "Choose the injury first and PulsePeak will lock the correct body area automatically."
                    : "Choose a body area and symptom so PulsePeak can narrow the support options."
              }
              title="Choose your issue first"
            />
          ) : (
            <>
              <div className="module-note">
                <strong>{categories.find((category) => category.id === effectiveCategory)?.label || "Guided movement support"}</strong>
                <p className="support-copy">{getGuidedBlockSupportCopy(effectiveCategory)}</p>
                <p className="support-copy">Total session time: about {totalSuggestedMinutes} minutes.</p>
                {browseRoutines.length > suggestedRoutines.length ? (
                  <p className="support-copy">{browseRoutines.length - suggestedRoutines.length} more options are available below if you want to expand or swap.</p>
                ) : null}
              </div>
              <div className="module-card-grid mobility-guided-grid">
                {suggestedRoutineCards.map(({ routine, currentRoutine, swapOptions }) => (
                  <RoutineCard
                    key={`suggested-${routine.name}`}
                    routine={routine}
                    currentRoutine={currentRoutine}
                    categoryId={effectiveCategory}
                    onOpen={openMovementGuide}
                    onSwap={setSelectedSwaps}
                    swapOptions={swapOptions}
                  />
                ))}
              </div>
            </>
          )}
        </Panel>

        <Panel eyebrow="Why this matters" title="Keep the support work useful">
          <div className="module-note">
            <strong>{continuityContext.title || summary.planSummary?.mobilityBlock?.weeklyTarget || "Use mobility to improve the next training session, not just fill time."}</strong>
            <p className="support-copy">{continuityContext.detail || summary.planSummary?.mobilityBlock?.reason || mobilityModule?.description}</p>
          </div>
        </Panel>
      </div>

      <Panel eyebrow={isSearchMode ? "Search results" : "Library"} title={isSearchMode ? "Find the best match quickly" : "Pick the exact flow you need"}>
        {isSearchMode ? (
          visibleSearchGroups.length ? (
            <div className="library-category-groups">
              {visibleSearchGroups.map((group) => (
                <section className="library-category-group" key={group.category.id}>
                  <div className="section-context compact-section-context">
                    <span className="section-context-label">{group.category.label}</span>
                    <p>{group.category.description}</p>
                  </div>
                  <div className="module-card-grid">
                    {group.visibleRoutines.map((routine) => (
                      <RoutineCard
                        key={`search-${group.category.id}-${routine.name}-${routine.phase}`}
                        routine={routine}
                        currentRoutine={selectedSwaps[routine.name] || routine}
                        categoryId={group.category.id}
                        onOpen={openMovementGuide}
                        searchQuery={searchQuery}
                      />
                    ))}
                  </div>
                  {group.routines.length > group.visibleRoutines.length ? (
                    <div className="module-card-actions">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => handleLoadMore(`search-${group.category.id}`)}
                      >
                        {loadingMoreKey === `search-${group.category.id}` ? "Loading more…" : "Show more movements"}
                      </button>
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              ctaLabel="Start Guided Session"
              ctaTo="/guided-start"
              description="Try a broader keyword or return to browsing mode to open a guided support path."
              title="No search results"
            />
          )
        ) : effectiveCategory === "injury_support" && !isInjurySupportReady ? (
          <EmptyStateCard
            ctaLabel="Start Injury Support"
            ctaTo="/injury-support"
            description={
              selectedIssueType === "none"
                ? "Choose your issue type first so this library can lock onto the right support path."
                : selectedIssueType === "injury"
                  ? injurySupportPrompt
                  : acheSupportPrompt
            }
            title="Injury support needs one more step"
          />
        ) : browseRoutines.length ? (
          <>
            <div className="module-card-grid">
              {visibleLibraryRoutines.map((routine) => {
                const swapOptions = browseRoutines.filter((entry) => entry.name !== routine.name && entry.phase === routine.phase);
                return (
                  <RoutineCard
                    key={`${routine.name}-${routine.phase}`}
                    routine={routine}
                    currentRoutine={selectedSwaps[routine.name] || routine}
                    categoryId={effectiveCategory}
                    onOpen={openMovementGuide}
                    onSwap={setSelectedSwaps}
                    swapOptions={swapOptions}
                  />
                );
              })}
            </div>
            {browseRoutines.length > visibleLibraryRoutines.length ? (
              <div className="module-card-actions">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => handleLoadMore(effectiveCategory)}
                >
                  {loadingMoreKey === effectiveCategory ? "Loading more…" : "Show more movements"}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyStateCard
            ctaLabel={effectiveCategory === "injury_support" ? "Start Injury Support" : "Start Guided Session"}
            ctaTo={effectiveCategory === "injury_support" ? "/injury-support" : "/guided-start"}
            description={
              effectiveCategory === "injury_support"
                ? selectedIssueType === "injury"
                  ? "No rehab movements match that injury mapping yet, so use the broader mobility path for a safer next step."
                  : "No mobility, stretch, or light rehab movements match that ache pattern yet, so open the broader mobility path instead."
                : "Clear one filter or open a guided session path to get moving without guessing."
            }
            title={effectiveCategory === "injury_support" ? "No support matches yet" : "No movements match these filters"}
          />
        )}
      </Panel>

      {/* Recovery is a chapter in the training day, not a dead-end library —
          carry the user forward into reflection and tomorrow. */}
      <section className="recovery-next">
        <div className="recovery-next-copy">
          <p className="section-label">Next in your day</p>
          <strong>See how your week is coming together</strong>
          <p className="support-copy">Check what's improving, then line up tomorrow's session.</p>
        </div>
        <div className="recovery-next-actions">
          <button className="primary-button" type="button" onClick={() => navigate("/progress")}>
            See your progress →
          </button>
          <button className="ghost-button" type="button" onClick={() => navigate("/")}>
            Back to today
          </button>
        </div>
      </section>

      <MovementDetailModal
        guidanceLevel={guidanceLevel}
        movement={selectedMovement}
        movementId={selectedMovement?.detailId || selectedMovement?.guideTargetId || selectedMovement?.id}
        onClose={() => setSelectedMovement(null)}
      />
    </div>
  );
}

function RoutineCard({ routine, currentRoutine, categoryId, onOpen, onSwap, swapOptions = [], searchQuery = "" }) {
  const highlightedName = searchQuery ? highlightMatch(currentRoutine.name, searchQuery) : currentRoutine.name;
  const highlightedBenefit = searchQuery ? highlightMatch(currentRoutine.benefit, searchQuery) : currentRoutine.benefit;

  return (
    <article
      className="module-card module-card-clickable"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(currentRoutine.movement || currentRoutine)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(currentRoutine.movement || currentRoutine);
        }
      }}
    >
      <div className="movement-card-topline">
        <span className="movement-card-category-tag">{getCardCategoryLabel(categoryId)}</span>
        {currentRoutine.difficulty ? <span className="movement-card-difficulty-badge">{formatLabelCase(currentRoutine.difficulty)}</span> : null}
      </div>
      <p className="section-label">
        {currentRoutine.group} · {currentRoutine.minutes} min
      </p>
      <div className="library-card-hero">
        {renderMobilityPreview(currentRoutine)}
        <div className="library-card-hero-copy">
          <span className="library-depth-note">{getCardSupportLabel(categoryId, currentRoutine)}</span>
          <span className="library-depth-note">{swapOptions.length ? `+ ${swapOptions.length} alternatives` : getGuideStatusLabel(currentRoutine.movement || currentRoutine)}</span>
        </div>
      </div>
      <h4>{highlightedName}</h4>
      <p className="support-copy">{highlightedBenefit}</p>
      <p className="support-copy">{getRoutineSupportLine(categoryId)}</p>
      {swapOptions.length && onSwap ? (
        <label className="exercise-swap-picker" onClick={(event) => event.stopPropagation()}>
          Swap drill
          <select
            value={currentRoutine.name}
            onChange={(event) => {
              const nextRoutine = [routine, ...swapOptions].find((entry) => entry.name === event.target.value) || routine;
              onSwap((current) => ({
                ...current,
                [routine.name]: nextRoutine
              }));
            }}
          >
            {[routine, ...swapOptions].map((option) => (
              <option key={`${routine.name}-${option.name}`} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        className="ghost-button"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen(currentRoutine.movement || currentRoutine);
        }}
      >
        Open guide
      </button>
    </article>
  );
}

function getCardCategoryLabel(categoryId) {
  return CATEGORY_ENTRY_META[categoryId]?.title || formatLabelCase(categoryId);
}

function getEntryIcon(entryId) {
  const iconMap = {
    strength: "ST",
    mobility_stretch: "MS",
    yoga: "YG",
    cardio: "CD",
    injury_support: "IS",
    recovery: "RC"
  };
  return iconMap[entryId] || "GO";
}

function readStoredMobilityCategory() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(MOBILITY_CATEGORY_STORAGE_KEY) || "";
}

function getRecommendedCategory(userContext = {}) {
  if (
    userContext.selectedIssueType === "injury" ||
    (userContext.selectedInjury && userContext.selectedInjury !== "none")
  ) {
    return "injury_support";
  }
  if (
    userContext.selectedIssueType === "ache" ||
    userContext.selectedArea !== "all" ||
    userContext.selectedSymptomType !== "none"
  ) {
    return "mobility_stretch";
  }
  return "strength";
}

function getSmartCategoryLabel(categoryId) {
  const labelMap = {
    strength: "Strength",
    mobility_stretch: "Mobility & Stretch",
    yoga: "Yoga",
    cardio: "Cardio",
    injury_support: "Injury Support",
    recovery: "Recovery"
  };
  return labelMap[categoryId] || "Strength";
}

function getCardSupportLabel(categoryId, routine) {
  if (categoryId === "yoga") {
    return "Yoga flow";
  }
  if (categoryId === "injury_support") {
    return "Targeted support";
  }
  if (categoryId === "recovery") {
    return routine.recoveryFit === "high" ? "Recovery-focused" : "Recovery support";
  }
  return routine.recoveryFit === "high" ? "Recovery-focused" : "Movement support ready";
}

function getRoutineSupportLine(categoryId) {
  if (categoryId === "yoga") {
    return "Follow this flow as a movement sequence and keep the pace calm.";
  }
  if (categoryId === "injury_support") {
    return "Use the guide exactly as written and stay inside the intended support path.";
  }
  if (categoryId === "recovery") {
    return "Use this when you need a calmer reset without forcing strict body targeting.";
  }
  return "Start with this movement and keep the tempo controlled from rep to rep.";
}

function getModeLeadCopy(category) {
  if (category === "mobility_stretch") {
    return "Use Mobility & Stretch for practical drills and static stretches when tight or stiff areas need direct support without drifting into rehab-only rules.";
  }
  if (category === "yoga") {
    return "Use yoga for fuller flow-based movement sessions built from core poses, connected sequences, and deeper variations.";
  }
  if (category === "recovery") {
    return "Use recovery for broader system-level support when fatigue, soreness, or stress should drive the session instead of one joint.";
  }
  return "Use Injury Support when you need stricter filtering around a known injury or a specific ache pattern instead of broad movement browsing.";
}

function getModeSupportCopy(category) {
  if (category === "mobility_stretch") {
    return "Mobility & Stretch keeps browsing simple: one support list, a clean header, and only the essential filters when you need them.";
  }
  if (category === "yoga") {
    return "Yoga stays focused on flow-based movement so you can browse the full library without extra category clutter.";
  }
  if (category === "recovery") {
    return "Recovery keeps the view broad and low-friction when you need lighter movement support.";
  }
  return "Injury Support stays guided: choose the issue type first, then only the inputs that matter for that support path.";
}

function getGuidedBlockSupportCopy(category) {
  if (category === "mobility_stretch") {
    return "These top options surface the clearest starting points first, while the library below keeps the full movement pool easy to expand.";
  }
  if (category === "yoga") {
    return "These flow options are meant to feel like a real movement session, not a scattered pose list.";
  }
  if (category === "recovery") {
    return "These recovery options help reduce fatigue and stiffness without overwhelming the page.";
  }
  return "These support drills stay organized around the exact issue you selected so the session feels focused, relevant, and safer to use.";
}

function buildRoutineSearchHaystack(routine) {
  return [
    routine.name,
    routine.displayName,
    routine.benefit,
    routine.primaryFocus,
    routine.secondaryFocus,
    ...(routine.bodyAreas || []),
    ...(routine.bodyAreaAliases || []),
    ...(routine.restrictedAreas || []),
    ...(routine.supportTopics || []),
    ...(routine.symptomTags || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesSelectedBodyArea(routine, selectedArea) {
  if (selectedArea === "all") {
    return true;
  }
  return (
    (routine.bodyAreaAliases || []).includes(selectedArea) ||
    (routine.bodyAreas || []).includes(selectedArea) ||
    (routine.restrictedAreas || []).includes(selectedArea) ||
    routine.bodyArea === selectedArea
  );
}

function matchesInjurySupportRoutine(routine, injuryMapping) {
  if (!injuryMapping) {
    return false;
  }
  if (String(routine.visualCategory || "").toLowerCase() !== "rehab") {
    return false;
  }
  if (String(routine.supportGoal || "").toLowerCase() !== "rehab") {
    return false;
  }
  if (!matchesStrictInjuryBodyArea(routine, injuryMapping.bodyArea, injuryMapping.value)) {
    return false;
  }
  return injuryMapping.supportTopics.some(
    (topic) => (routine.supportTopics || []).includes(topic) || (routine.injuryTags || []).includes(topic) || (routine.injuryTags || []).includes(injuryMapping.value)
  );
}

function matchesAcheSupportRoutine(routine, selectedArea, symptomType) {
  if (selectedArea === "all" || symptomType === "none") {
    return false;
  }
  if (!matchesSelectedBodyArea(routine, selectedArea)) {
    return false;
  }
  const visualCategory = String(routine.visualCategory || "").toLowerCase();
  if (!["mobility", "stretch", "rehab"].includes(visualCategory)) {
    return false;
  }
  if (visualCategory === "rehab" && !routine.lightRehab) {
    return false;
  }
  return (routine.symptomTags || []).includes(symptomType);
}

function formatBodyAreaLabel(value) {
  const map = {
    "lower-back": "Lower back",
    calves: "Calves",
    shoulders: "Shoulders",
    hips: "Hips",
    knees: "Knees",
    ankles: "Ankles",
    neck: "Neck",
    wrists: "Wrists",
    shoulder: "Shoulder",
    elbow: "Elbow",
    knee: "Knee",
    ankle: "Ankle",
    wrist: "Wrist"
  };
  return map[value] || String(value || "").replace(/-/g, " ");
}

function matchesStrictInjuryBodyArea(routine, selectedArea, injuryKey) {
  const primaryArea = String(routine.bodyArea || "").toLowerCase();
  if (selectedArea === "lower-back") {
    return primaryArea === "back" || (routine.bodyAreaAliases || []).includes("lower-back");
  }
  if (selectedArea === "elbow") {
    return primaryArea === "elbow" || (primaryArea === "wrist" && (routine.injuryTags || []).includes(injuryKey));
  }
  return primaryArea === selectedArea;
}

function getSearchCategoryId(routine) {
  if (routine.sourceType === "yoga_production") {
    return "yoga";
  }
  if (String(routine.visualCategory || "").toLowerCase() === "rehab" || String(routine.supportGoal || "").toLowerCase() === "rehab") {
    return "injury_support";
  }
  if (["mobility_production", "stretch_production"].includes(routine.sourceType)) {
    return "mobility_stretch";
  }
  if ((routine.supportTypes || []).includes("recovery")) {
    return "recovery";
  }
  return "";
}

function getVisibleCount(visibleCounts, key) {
  return visibleCounts[key] || INITIAL_VISIBLE_COUNT;
}

function formatLabelCase(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function highlightMatch(text, query) {
  const value = String(text || "");
  const needle = String(query || "").trim();
  if (!value || !needle) {
    return value;
  }
  const lowerValue = value.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const matchIndex = lowerValue.indexOf(lowerNeedle);
  if (matchIndex < 0) {
    return value;
  }
  return (
    <>
      {value.slice(0, matchIndex)}
      <mark>{value.slice(matchIndex, matchIndex + needle.length)}</mark>
      {value.slice(matchIndex + needle.length)}
    </>
  );
}

function renderMobilityPreview(routine) {
  const visual = resolveMovementVisual(routine.movement || routine);
  if (visual.mode === "image") {
    return <img alt={visual.alt} className="library-card-thumb" loading="lazy" src={getExerciseImageSrc(visual.src)} />;
  }
  return (
    <div className="library-card-thumb library-card-thumb-placeholder movement-image-fallback">
      <span>{visual.initials}</span>
      <small>{visual.label}</small>
    </div>
  );
}
