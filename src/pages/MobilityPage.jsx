import React, { useMemo, useState } from "react";
import Panel from "../components/Panel";
import MovementDetailModal from "../components/MovementDetailModal";
import { useDashboardData } from "../hooks/useDashboardData";
import { getMovementMedia } from "../../shared/exerciseCatalog";
import { MOBILITY_SORT_OPTIONS } from "../../shared/libraryTaxonomy.js";

export default function MobilityPage() {
  const { data, summary, loading, error } = useDashboardData();
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedTime, setSelectedTime] = useState("10");
  const [selectedRecovery, setSelectedRecovery] = useState("all");
  const [selectedFlowType, setSelectedFlowType] = useState("all");
  const [selectedIntensity, setSelectedIntensity] = useState("all");
  const [selectedInjurySupport, setSelectedInjurySupport] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [selectedSwaps, setSelectedSwaps] = useState({});
  const mobilityModule = summary?.mobilityModule || null;
  const categories = mobilityModule?.categories || [];
  const effectiveCategory = selectedCategory || mobilityModule?.suggestedCategory || categories[0]?.id || "stretching";
  const effectiveEnvironment = data?.profile?.trainingEnvironment || "hybrid";
  const guidanceLevel = data?.profile?.exerciseGuidanceLevel || "standard";
  const routines = mobilityModule?.library || [];

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
  const injurySupportOptions = useMemo(() => {
    const configuredOptions = mobilityModule?.filterOptions?.injurySupportOptions;
    if (Array.isArray(configuredOptions) && configuredOptions.length) {
      return configuredOptions;
    }

    const options = Array.from(
      new Set(
        routines
          .filter((routine) => routine.supportTypes.includes("physiotherapy") || routine.supportTypes.includes("injury_specific"))
          .flatMap((routine) => routine.supportTopics || [])
      )
    );
    return [{ value: "all", label: "Any injury support" }, ...options.map((value) => ({ value, label: formatSupportTopic(value) }))];
  }, [mobilityModule?.filterOptions?.injurySupportOptions, routines]);

  const filteredRoutines = useMemo(() => {
    const normalizeSupportTopic = (value) => {
      const map = {
        wrist: "carpal_tunnel",
        elbow: "tennis_elbow",
        shoulder: "shoulder_irritation",
        knee: "knee_support",
        ankle: "ankle_stiffness",
        back: "lower_back",
        hip: "hip_tightness"
      };
      return map[value] || value;
    };

    const filtered = routines.filter((routine) => {
      if (!routine.supportTypes.includes(effectiveCategory)) {
        return false;
      }
      if (Number(selectedTime) && routine.minutes > Number(selectedTime)) {
        return false;
      }
      if (effectiveEnvironment !== "hybrid" && !routine.environments.includes(effectiveEnvironment) && !routine.environments.includes("hybrid")) {
        return false;
      }

      if (effectiveCategory === "yoga") {
        const flowType = getRoutineFlowType(routine);
        if (selectedFlowType !== "all" && flowType !== selectedFlowType) {
          return false;
        }
        if (selectedIntensity !== "all" && String(routine.recoveryFit || "").toLowerCase() !== selectedIntensity) {
          return false;
        }
        return true;
      }

      if (effectiveCategory === "stretching") {
        if (
          selectedArea !== "all" &&
          !(routine.bodyAreas || []).includes(selectedArea) &&
          !(routine.restrictedAreas || []).includes(selectedArea) &&
          !(routine.supportTopics || []).includes(normalizeSupportTopic(selectedArea))
        ) {
          return false;
        }
        return true;
      }

      if (effectiveCategory === "physiotherapy") {
        if (
          selectedArea !== "all" &&
          !(routine.bodyAreas || []).includes(selectedArea) &&
          !(routine.restrictedAreas || []).includes(selectedArea)
        ) {
          return false;
        }
        if (selectedInjurySupport !== "all" && !(routine.supportTopics || []).includes(selectedInjurySupport)) {
          return false;
        }
        return true;
      }

      if (effectiveCategory === "recovery") {
        if (selectedRecovery === "low" && routine.recoveryFit === "low") {
          return false;
        }
        if (selectedRecovery === "steady" && routine.recoveryFit === "high" && routine.phase === "recovery") {
          return false;
        }
        return true;
      }

      if (effectiveCategory === "injury_specific") {
        if (selectedInjurySupport !== "all" && !(routine.supportTopics || []).includes(selectedInjurySupport)) {
          return false;
        }
        if (
          selectedArea !== "all" &&
          !(routine.bodyAreas || []).includes(selectedArea) &&
          !(routine.restrictedAreas || []).includes(selectedArea)
        ) {
          return false;
        }
        return true;
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
  }, [effectiveCategory, effectiveEnvironment, routines, selectedArea, selectedFlowType, selectedInjurySupport, selectedIntensity, selectedRecovery, selectedSort, selectedTime]);

  const suggestedRoutines = useMemo(() => {
    const direct = filteredRoutines.slice(0, 4);
    if (direct.length >= 4) {
      return direct;
    }
    const fallback = routines.filter(
      (routine) => routine.supportTypes.includes(effectiveCategory) && !direct.some((entry) => entry.name === routine.name)
    );
    return [...direct, ...fallback.slice(0, 4 - direct.length)];
  }, [effectiveCategory, filteredRoutines, routines]);

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
                setSelectedArea("all");
                setSelectedRecovery("all");
                setSelectedFlowType("all");
                setSelectedIntensity("all");
                setSelectedInjurySupport("all");
              }}
            >
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </button>
          ))}
        </div>

        <div className="filter-bar discovery-filter-bar">
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

          {effectiveCategory === "stretching" ? (
            <>
              <label>
                Body area
                <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
                  {(mobilityModule?.filterOptions?.areaOptions || []).map((option) => (
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

          {effectiveCategory === "physiotherapy" ? (
            <>
              <label>
                Body area
                <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
                  {(mobilityModule?.filterOptions?.areaOptions || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Injury support
                <select value={selectedInjurySupport} onChange={(event) => setSelectedInjurySupport(event.target.value)}>
                  {injurySupportOptions.map((option) => (
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

          {effectiveCategory === "injury_specific" ? (
            <>
              <label>
                Injury mapping
                <select value={selectedInjurySupport} onChange={(event) => setSelectedInjurySupport(event.target.value)}>
                  {injurySupportOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Body area
                <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
                  {(mobilityModule?.filterOptions?.areaOptions || []).map((option) => (
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
      </Panel>

      <div className="content-grid">
        <Panel eyebrow="Suggested today" title="Start here first">
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
                onClick={() => setSelectedMovement(currentRoutine.movement || currentRoutine)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedMovement(currentRoutine.movement || currentRoutine);
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
                    <span className="library-depth-note">{swapOptions.length ? `+ ${swapOptions.length} more in this flow` : "Guide ready"}</span>
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
                <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedMovement(currentRoutine.movement || currentRoutine); }}>
                  Open guide
                </button>
              </article>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Why this matters" title="Keep the support work useful">
          <div className="module-note">
            <strong>{summary.planSummary?.mobilityBlock?.weeklyTarget || "Use mobility to improve the next training session, not just fill time."}</strong>
            <p className="support-copy">{summary.planSummary?.mobilityBlock?.reason || mobilityModule?.description}</p>
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Library" title="Pick the exact flow you need">
        {filteredRoutines.length ? (
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
                  onClick={() => setSelectedMovement(currentRoutine.movement || currentRoutine)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedMovement(currentRoutine.movement || currentRoutine);
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
                      <span className="library-depth-note">{swapOptions.length ? `+ ${swapOptions.length} alternatives` : "Guide ready"}</span>
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
                  <button className="ghost-button" type="button" onClick={(event) => { event.stopPropagation(); setSelectedMovement(currentRoutine.movement || currentRoutine); }}>
                    Open guide
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="muted">No mobility drills match that filter combination yet. Loosen one filter and try again.</p>
        )}
      </Panel>

      <MovementDetailModal guidanceLevel={guidanceLevel} movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
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
  if (category === "yoga") {
    return "Use yoga for flow-based movement sessions built from core poses, linked sequences, and deeper variations when you want a fuller movement practice.";
  }
  if (category === "stretching") {
    return "Use stretching for simple targeted lengthening before training, after training, or anytime one area feels tight.";
  }
  if (category === "physiotherapy") {
    return "Use physiotherapy for controlled, lower-risk drills that rebuild confidence around a specific joint or movement limitation.";
  }
  if (category === "recovery") {
    return "Use recovery for system-level support when soreness, fatigue, stiffness, or stress should drive the session.";
  }
  return "Use injury-specific support when you need stricter filtering around a known limitation instead of a general movement session.";
}

function getModeSupportCopy(category) {
  if (category === "yoga") {
    return "Yoga uses flow type, time, and intensity because it should feel like a real flow system with base poses, sequence options, and deeper variations, not targeted therapy.";
  }
  if (category === "stretching") {
    return "Stretching stays simple and direct: choose the area you want to open up and how long you have.";
  }
  if (category === "physiotherapy") {
    return "Physiotherapy stays highly targeted: choose the body area and the kind of injury support you need.";
  }
  if (category === "recovery") {
    return "Recovery is system-level. Choose how you feel and how much time you have instead of forcing strict body targeting.";
  }
  return "Injury-specific support stays structured around the issue you are managing, not broad wellness browsing.";
}

function getGuidedBlockSupportCopy(category) {
  if (category === "yoga") {
    return "These flows are built to move together as a sequence, so the top four cards all surface real session options immediately while the deeper pool handles variations and swap depth.";
  }
  if (category === "stretching") {
    return "These stretches are direct and targeted so you can quickly address the area that needs attention.";
  }
  if (category === "physiotherapy") {
    return "These drills are surfaced as real rehab-session items so each one feels equally actionable, not hidden in a text list.";
  }
  if (category === "recovery") {
    return "These recovery drills help reduce fatigue and stiffness without pretending every session has to target one joint.";
  }
  return "These support drills stay organized around the specific issue you selected so the session feels focused and safe.";
}

function renderMobilityPreview(routine) {
  const mediaView = getMovementMedia(routine.movement || routine);
  if (mediaView.thumbnail) {
    return <img alt={`${routine.name} preview`} className="library-card-thumb" src={mediaView.thumbnail} />;
  }
  return (
    <div className="library-card-thumb library-card-thumb-placeholder">
      <span>{mediaView.placeholderInitials}</span>
      <small>{mediaView.placeholderLabel}</small>
    </div>
  );
}
