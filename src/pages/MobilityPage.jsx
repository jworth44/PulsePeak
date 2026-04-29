import React, { useMemo, useState } from "react";
import Panel from "../components/Panel";
import MovementDetailModal from "../components/MovementDetailModal";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../state/AuthContext";
import { buildGuideTarget, getGuideStatusLabel, resolveMovementVisual } from "../../shared/exerciseCatalog";
import { getCurrentPlanFocus } from "../../shared/profileState";
import { getModuleContinuityContext, getRecoveryBias } from "../../shared/workoutEngine";
import { MOBILITY_SORT_OPTIONS } from "../../shared/libraryTaxonomy.js";

export default function MobilityPage() {
  const { data, summary, loading, error } = useDashboardData();
  const { workoutMemory, workoutMomentum } = useAuth();
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedIssueType, setSelectedIssueType] = useState("none");
  const [selectedInjury, setSelectedInjury] = useState("none");
  const [selectedSymptomType, setSelectedSymptomType] = useState("none");
  const [selectedTime, setSelectedTime] = useState("10");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [selectedRecovery, setSelectedRecovery] = useState("all");
  const [selectedFlowType, setSelectedFlowType] = useState("all");
  const [selectedIntensity, setSelectedIntensity] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [selectedSwaps, setSelectedSwaps] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const mobilityModule = summary?.mobilityModule || null;
  const categories = mobilityModule?.categories || [];
  const effectiveCategory = selectedCategory || mobilityModule?.suggestedCategory || categories[0]?.id || "mobility_stretch";
  const effectiveEnvironment = data?.profile?.trainingEnvironment || "hybrid";
  const guidanceLevel = data?.profile?.exerciseGuidanceLevel || "standard";
  const routines = mobilityModule?.library || [];
  const openMovementGuide = (target) => setSelectedMovement(buildGuideTarget(target));
  const currentPlanFocus = useMemo(
    () =>
      getCurrentPlanFocus({
        profile: data?.profile,
        planSummary: summary?.planSummary,
        workoutEngine: summary?.workoutEngine
      }),
    [data?.profile, summary?.planSummary, summary?.workoutEngine]
  );
  const recoveryBias = useMemo(() => getRecoveryBias(workoutMemory), [workoutMemory]);
  const continuityContext = useMemo(
    () =>
      getModuleContinuityContext({
        module: "mobility",
        currentPlanFocus,
        memoryState: workoutMemory,
        workoutMomentum,
        recoveryBias,
        weeklyStructure: summary?.planSummary?.suggestedWorkoutMix
          ? { days: (summary.planSummary.suggestedWorkoutMix.split || []).map((item, index) => ({ day: index + 1, type: String(item).toLowerCase().includes("recovery") ? "recovery" : "training" })) }
          : null,
        nutritionMode: data?.profile?.nutritionMode
      }),
    [currentPlanFocus, data?.profile?.nutritionMode, recoveryBias, summary?.planSummary?.suggestedWorkoutMix, workoutMemory, workoutMomentum]
  );

  const flowTypeOptions = useMemo(
    () => [
      { value: "all", label: "Any flow type" },
      { value: "full_body", label: "Full-body flow" },
      { value: "upper_body", label: "Upper-body flow" },
      { value: "lower_body", label: "Lower-body flow" },
      { value: "reset", label: "Reset flow" }
    ],
    []
  );
  const intensityOptions = useMemo(
    () => [
      { value: "all", label: "Any intensity" },
      { value: "low", label: "Low" },
      { value: "medium", label: "Moderate" },
      { value: "high", label: "Strong" }
    ],
    []
  );
  const injuryMappingOptions = useMemo(() => {
    const configuredOptions = mobilityModule?.filterOptions?.injuryMappingOptions;
    if (Array.isArray(configuredOptions) && configuredOptions.length) {
      return configuredOptions;
    }
    return [];
  }, [mobilityModule?.filterOptions?.injuryMappingOptions]);
  const acheBodyAreaOptions = useMemo(() => {
    const configuredOptions = mobilityModule?.filterOptions?.acheBodyAreaOptions;
    if (Array.isArray(configuredOptions) && configuredOptions.length) {
      return configuredOptions;
    }
    return [];
  }, [mobilityModule?.filterOptions?.acheBodyAreaOptions]);
  const symptomTypeOptions = useMemo(() => {
    const configuredOptions = mobilityModule?.filterOptions?.symptomTypeOptions;
    if (Array.isArray(configuredOptions) && configuredOptions.length) {
      return configuredOptions;
    }
    return [];
  }, [mobilityModule?.filterOptions?.symptomTypeOptions]);
  const mergedAreaOptions = useMemo(
    () => [{ value: "all", label: "All body areas" }, ...acheBodyAreaOptions],
    [acheBodyAreaOptions]
  );
  const selectedInjuryMapping = useMemo(
    () => injuryMappingOptions.find((option) => option.value === selectedInjury) || null,
    [injuryMappingOptions, selectedInjury]
  );
  const selectedInjuryBodyArea = selectedInjuryMapping?.bodyArea || "all";
  const issueTypePrompt = "Select your issue type to begin";
  const injurySupportPrompt = "Select an injury support type and body area to see targeted movements.";
  const acheSupportPrompt = "Select a body area and symptom type to see targeted support.";
  const isInjurySupportReady =
    effectiveCategory !== "injury_support" ||
    (selectedIssueType === "injury"
      ? selectedInjury !== "none"
      : selectedIssueType === "ache"
        ? selectedArea !== "all" && selectedSymptomType !== "none"
        : false);

  const filteredRoutines = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = routines.filter((routine) => {
      if (Number(selectedTime) && routine.minutes > Number(selectedTime)) {
        return false;
      }
      if (effectiveEnvironment !== "hybrid" && !routine.environments.includes(effectiveEnvironment) && !routine.environments.includes("hybrid")) {
        return false;
      }

      if (effectiveCategory === "mobility_stretch") {
        if (!["mobility_production", "stretch_production"].includes(routine.sourceType)) {
          return false;
        }
        const searchHaystack = buildRoutineSearchHaystack(routine);
        if (normalizedQuery && !searchHaystack.includes(normalizedQuery)) {
          return false;
        }
        if (!matchesSelectedBodyArea(routine, selectedArea)) {
          return false;
        }
        if (selectedDifficulty !== "all" && String(routine.difficulty || "").toLowerCase() !== selectedDifficulty) {
          return false;
        }
        if (selectedEquipment !== "all" && String(routine.equipmentProfile || "").toLowerCase() !== selectedEquipment) {
          return false;
        }
        return true;
      }

      if (effectiveCategory === "yoga") {
        if (routine.sourceType !== "yoga_production") {
          return false;
        }
        const flowType = getRoutineFlowType(routine);
        if (selectedFlowType !== "all" && flowType !== selectedFlowType) {
          return false;
        }
        if (selectedIntensity !== "all" && String(routine.recoveryFit || "").toLowerCase() !== selectedIntensity) {
          return false;
        }
        return true;
      }

      if (effectiveCategory === "recovery") {
        if (!routine.supportTypes.includes("recovery")) {
          return false;
        }
        if (selectedRecovery === "low" && routine.recoveryFit === "low") {
          return false;
        }
        if (selectedRecovery === "steady" && routine.recoveryFit === "high" && routine.phase === "recovery") {
          return false;
        }
        return true;
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

      return true;
    });

    return [...filtered].sort((left, right) => {
      switch (selectedSort) {
        case "shortest":
          return (left.minutes || 0) - (right.minutes || 0);
        case "easiest":
          return rankRecoveryFit(left.recoveryFit) - rankRecoveryFit(right.recoveryFit);
        case "recovery_friendly":
          return rankRecoveryFit(right.recoveryFit) - rankRecoveryFit(left.recoveryFit);
        default:
          return 0;
      }
    });
  }, [effectiveCategory, effectiveEnvironment, isInjurySupportReady, routines, searchQuery, selectedArea, selectedDifficulty, selectedEquipment, selectedFlowType, selectedInjuryMapping, selectedIntensity, selectedIssueType, selectedRecovery, selectedSort, selectedSymptomType, selectedTime]);

  const suggestedRoutines = useMemo(() => {
    if (effectiveCategory === "injury_support" && !isInjurySupportReady) {
      return [];
    }
    const direct = filteredRoutines.slice(0, 4);
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
      if (effectiveCategory === "injury_support") {
        return false;
      }
      return routine.supportTypes.includes(effectiveCategory);
    });
    return [...direct, ...fallback.slice(0, 4 - direct.length)];
  }, [effectiveCategory, filteredRoutines, isInjurySupportReady, routines]);

  const suggestedRoutineCards = useMemo(
    () =>
      suggestedRoutines.map((routine) => ({
        routine,
        currentRoutine: selectedSwaps[routine.name] || routine,
        swapOptions: filteredRoutines.filter((entry) => entry.name !== routine.name && entry.phase === routine.phase)
      })),
    [filteredRoutines, selectedSwaps, suggestedRoutines]
  );
  const totalSuggestedMinutes = suggestedRoutines.reduce((total, routine) => total + (routine.minutes || 0), 0);

  if (loading) {
    return <div className="screen-center">Loading mobility guidance...</div>;
  }

  if (!data || !summary || !mobilityModule) {
    return <div className="screen-center">{error || "Unable to load mobility guidance."}</div>;
  }

  return (
    <div className="page-grid page-grid-tight">
      <section className="module-page-hero">
        <div>
          <p className="badge">Mobility</p>
          <h2>{mobilityModule?.title || "Guided movement support that fits today"}</h2>
          <p className="lead-copy">{getModeLeadCopy(effectiveCategory)}</p>
          <p className="support-copy recommendation-context-note">{continuityContext.title}</p>
        </div>
      </section>

      <Panel eyebrow="Choose your mode" title="Guided mobility categories">
        <div className="section-context">
          <span className="section-context-label">Today&apos;s support</span>
          <p>{getModeSupportCopy(effectiveCategory)}</p>
        </div>
        <div className="selector-row">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`selector-pill ${effectiveCategory === category.id ? "selector-pill-active" : ""}`}
              type="button"
              onClick={() => {
                setSelectedCategory(category.id);
                setSearchQuery("");
                setSelectedArea("all");
                setSelectedIssueType("none");
                setSelectedInjury("none");
                setSelectedSymptomType("none");
                setSelectedDifficulty("all");
                setSelectedEquipment("all");
                setSelectedRecovery("all");
                setSelectedFlowType("all");
                setSelectedIntensity("all");
                setSelectedSort("recommended");
                setShowFilters(false);
              }}
            >
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </button>
          ))}
        </div>

        <div className="module-note">
          <button className="ghost-button" type="button" onClick={() => setShowFilters((current) => !current)}>
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
        </div>

        {showFilters ? (
        <div className="filter-bar discovery-filter-bar">
          {effectiveCategory === "mobility_stretch" ? (
            <>
              <label>
                Search
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search hip, ankle, hamstring..."
                />
              </label>
              <label>
                Body area
                <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
                  {mergedAreaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
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
              <label>
                Time
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {(mobilityModule?.filterOptions?.timeOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {effectiveCategory === "yoga" ? (
            <>
              <label>
                Flow type
                <select value={selectedFlowType} onChange={(event) => setSelectedFlowType(event.target.value)}>
                  {flowTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {(mobilityModule?.filterOptions?.timeOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Intensity
                <select value={selectedIntensity} onChange={(event) => setSelectedIntensity(event.target.value)}>
                  {intensityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {effectiveCategory === "recovery" ? (
            <>
              <label>
                Recovery state
                <select value={selectedRecovery} onChange={(event) => setSelectedRecovery(event.target.value)}>
                  {(mobilityModule?.filterOptions?.recoveryOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {(mobilityModule?.filterOptions?.timeOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {effectiveCategory === "injury_support" ? (
            <>
              <label>
                Issue type
                <select value={selectedIssueType} onChange={(event) => {
                  setSelectedIssueType(event.target.value);
                  setSelectedArea("all");
                  setSelectedInjury("none");
                  setSelectedSymptomType("none");
                }}>
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

              <label>
                Time
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {(mobilityModule?.filterOptions?.timeOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          <label>
            Sort
            <select value={selectedSort} onChange={(event) => setSelectedSort(event.target.value)}>
              {MOBILITY_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        ) : null}
      </Panel>

      <div className="content-grid">
        <Panel eyebrow="Suggested today" title="Start here first">
          {effectiveCategory === "injury_support" && !isInjurySupportReady ? (
            <p className="muted">
              {selectedIssueType === "none"
                ? issueTypePrompt
                : selectedIssueType === "injury"
                  ? injurySupportPrompt
                  : acheSupportPrompt}
            </p>
          ) : (
            <>
          <div className="module-note">
            <strong>{mobilityModule?.sessionName || categories.find((category) => category.id === effectiveCategory)?.label || "Guided mobility"}</strong>
            <p className="support-copy">{getGuidedBlockSupportCopy(effectiveCategory)}</p>
            <p className="support-copy">Total session time: about {totalSuggestedMinutes} minutes.</p>
            {filteredRoutines.length > suggestedRoutines.length ? (
              <p className="support-copy">{filteredRoutines.length - suggestedRoutines.length} more drills are available in this support family if you want to swap or expand.</p>
            ) : null}
          </div>
          <div className="module-card-grid mobility-guided-grid">
            {suggestedRoutineCards.map(({ routine, currentRoutine, swapOptions }) => (
              <article
                className="module-card module-card-clickable"
                key={`suggested-${routine.name}`}
                role="button"
                tabIndex={0}
                onClick={() => openMovementGuide(currentRoutine.movement || currentRoutine)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openMovementGuide(currentRoutine.movement || currentRoutine);
                  }
                }}
              >
                <p className="section-label">
                  {currentRoutine.group} · {currentRoutine.minutes} min
                </p>
                <div className="library-card-hero">
                  {renderMobilityPreview(currentRoutine)}
                  <div className="library-card-hero-copy">
                    <span className="library-depth-note">{currentRoutine.recoveryFit === "high" ? "Recovery-focused" : "Matches your current need"}</span>
                      <span className="library-depth-note">{swapOptions.length ? `+ ${swapOptions.length} more in this flow` : getGuideStatusLabel(currentRoutine.movement || currentRoutine)}</span>
                  </div>
                </div>
                <h4>{currentRoutine.name}</h4>
                <p className="support-copy">{currentRoutine.benefit}</p>
                <p className="support-copy">{effectiveCategory === "yoga" ? "Run this flow as the next step in your movement session." : "Open the guide, then run this drill with the same calm pace."}</p>
                <p className="support-copy">
                  {(currentRoutine.bodyAreas || []).length
                    ? `Best for: ${currentRoutine.bodyAreas.join(", ")}`
                    : currentRoutine.restrictedAreas.length
                      ? `Best for: ${currentRoutine.restrictedAreas.join(", ")}`
                      : "General recovery support"}
                </p>
                {swapOptions.length ? (
                  <label className="exercise-swap-picker" onClick={(event) => event.stopPropagation()}>
                    Swap drill
                    <select
                      value={currentRoutine.name}
                      onChange={(event) => {
                        const nextRoutine = [routine, ...swapOptions].find((entry) => entry.name === event.target.value) || routine;
                        setSelectedSwaps((current) => ({
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
                <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); openMovementGuide(currentRoutine.movement || currentRoutine); }}>
                  Open guide
                </button>
              </article>
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

      <Panel eyebrow="Library" title="Pick the exact flow you need">
        {effectiveCategory === "injury_support" && !isInjurySupportReady ? (
          <p className="muted">
            {selectedIssueType === "none"
              ? issueTypePrompt
              : selectedIssueType === "injury"
                ? injurySupportPrompt
                : acheSupportPrompt}
          </p>
        ) : filteredRoutines.length ? (
          <div className="module-card-grid">
            {filteredRoutines.map((routine) => {
              const swapOptions = filteredRoutines.filter((entry) => entry.name !== routine.name && entry.phase === routine.phase);
              const currentRoutine = selectedSwaps[routine.name] || routine;
              return (
                <article
                  className="module-card module-card-clickable"
                  key={`${routine.name}-${routine.phase}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openMovementGuide(currentRoutine.movement || currentRoutine)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openMovementGuide(currentRoutine.movement || currentRoutine);
                    }
                  }}
                >
                  <p className="section-label">
                    {currentRoutine.group} · {currentRoutine.minutes} min
                  </p>
                  <div className="library-card-hero">
                    {renderMobilityPreview(currentRoutine)}
                    <div className="library-card-hero-copy">
                      <span className="library-depth-note">{currentRoutine.recoveryFit === "high" ? "Recovery-focused" : "Movement support ready"}</span>
                      <span className="library-depth-note">{swapOptions.length ? `+ ${swapOptions.length} alternatives` : getGuideStatusLabel(currentRoutine.movement || currentRoutine)}</span>
                    </div>
                  </div>
                  <h4>{currentRoutine.name}</h4>
                  <p className="support-copy">{currentRoutine.benefit}</p>
                  <p className="support-copy">{effectiveCategory === "yoga" ? "Follow this flow as a movement sequence." : "Start with this sequence and keep the tempo controlled."}</p>
                  <p className="support-copy">
                    {(currentRoutine.bodyAreas || []).length
                      ? `Best for: ${currentRoutine.bodyAreas.join(", ")}`
                      : currentRoutine.restrictedAreas.length
                        ? `Best for: ${currentRoutine.restrictedAreas.join(", ")}`
                        : "General recovery support"}
                  </p>
                  {swapOptions.length ? (
                    <label className="exercise-swap-picker" onClick={(event) => event.stopPropagation()}>
                      Swap drill
                      <select
                        value={currentRoutine.name}
                        onChange={(event) => {
                          const nextRoutine = [routine, ...swapOptions].find((entry) => entry.name === event.target.value) || routine;
                          setSelectedSwaps((current) => ({
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
                  <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); openMovementGuide(currentRoutine.movement || currentRoutine); }}>
                    Open guide
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="muted">
            {effectiveCategory === "injury_support"
              ? selectedIssueType === "injury"
                ? "No rehab movements match that injury mapping yet."
                : "No mobility, stretch, or light rehab movements match that ache pattern yet."
              : "No mobility drills match that filter combination yet. Loosen one filter and try again."}
          </p>
        )}
      </Panel>

      <MovementDetailModal
        guidanceLevel={guidanceLevel}
        movement={selectedMovement}
        movementId={selectedMovement?.detailId || selectedMovement?.guideTargetId || selectedMovement?.id}
        onClose={() => setSelectedMovement(null)}
      />
    </div>
  );
}

function rankRecoveryFit(value) {
  const map = { low: 1, medium: 2, high: 3 };
  return map[String(value || "").toLowerCase()] || 2;
}

function getRoutineFlowType(routine) {
  if ((routine.bodyAreas || []).includes("full_body")) {
    return "full_body";
  }
  if ((routine.bodyAreas || []).some((area) => ["shoulder", "back", "wrist", "elbow"].includes(area))) {
    return "upper_body";
  }
  if ((routine.bodyAreas || []).some((area) => ["hip", "knee", "ankle"].includes(area))) {
    return "lower_body";
  }
  return "reset";
}

function formatSupportTopic(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function getModeLeadCopy(category) {
  if (category === "mobility_stretch") {
    return "Use Mobility & Stretch for dynamic drills and static stretches when tight or stiff areas need focused support without drifting into rehab-only rules.";
  }
  if (category === "yoga") {
    return "Use yoga for flow-based movement sessions built from core poses, linked sequences, and deeper variations when you want a fuller movement practice.";
  }
  if (category === "recovery") {
    return "Use recovery for system-level support when soreness, fatigue, stiffness, or stress should drive the session.";
  }
  return "Use Injury Support when you need stricter filtering around a known injury or a specific ache pattern instead of broad movement browsing.";
}

function getModeSupportCopy(category) {
  if (category === "mobility_stretch") {
    return "Mobility & Stretch stays practical: search by area, narrow by difficulty or equipment, and choose the exact drill or stretch that fits the day.";
  }
  if (category === "yoga") {
    return "Yoga uses flow type, time, and intensity because it should feel like a real flow system with base poses, sequence options, and deeper variations, not targeted therapy.";
  }
  if (category === "recovery") {
    return "Recovery is system-level. Choose how you feel and how much time you have instead of forcing strict body targeting.";
  }
  return "Injury Support stays strict: choose the issue type first, then only the inputs that matter for that support path.";
}

function getGuidedBlockSupportCopy(category) {
  if (category === "mobility_stretch") {
    return "These mobility drills and stretches are meant to be mixed and matched, so the top cards surface the best matches while the full library keeps both systems visible together.";
  }
  if (category === "yoga") {
    return "These flows are built to move together as a sequence, so the top four cards all surface real session options immediately while the deeper pool handles variations and swap depth.";
  }
  if (category === "recovery") {
    return "These recovery drills help reduce fatigue and stiffness without pretending every session has to target one joint.";
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
    return (
      primaryArea === "elbow" ||
      (primaryArea === "wrist" && (routine.injuryTags || []).includes(injuryKey))
    );
  }
  return primaryArea === selectedArea;
}

function renderMobilityPreview(routine) {
  const visual = resolveMovementVisual(routine.movement || routine);
  if (visual.mode === "image") {
    return <img alt={visual.alt} className="library-card-thumb" src={visual.src} />;
  }
  return (
    <div className="library-card-thumb library-card-thumb-placeholder movement-image-fallback">
      <span>{visual.initials}</span>
      <small>{visual.label}</small>
    </div>
  );
}
