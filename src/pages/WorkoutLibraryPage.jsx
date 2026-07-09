import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EQUIPMENT_FILTERS,
  MUSCLE_GROUPS,
  WORKOUT_TYPES,
  resolveLibraryMedia,
  getLibraryMediaCoverage
} from "../config/workoutLibrary";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";

// Muscle groups that map 1:1 to an Exercise Library category filter (precise
// filtering). Arms (biceps/triceps) and Full Body have no single category, so
// they fall through to a keyword search instead.
const MUSCLE_TO_CATEGORY = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  legs: "Legs",
  glutes: "Glutes",
  core: "Core"
};

// ======================================================================
// WORKOUT LIBRARY — a production-ready browse framework.
// Browse by equipment (icon UI), muscle group (approved anatomical media),
// and popular workout types (approved photography). Media that isn't approved
// yet renders a clean "awaiting approved media" production state; approved
// assets drop straight into this finished layout via config.
// ======================================================================

export default function WorkoutLibraryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [library, setLibrary] = useState(null);
  const searchRef = useRef(null);

  // The bar's search affordance is real on every viewport: on desktop the
  // field is always visible and the icon focuses it; on mobile the icon
  // swaps the title for the field.
  const onSearchToggle = () => {
    setFiltersOpen((open) => !open);
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  // Live exercise counts per muscle group (approved-benchmark detail). Real
  // data from the exercise library; until it loads (or if it fails) the tiles
  // simply show no count — never a fabricated number.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiRequest("/exercise-library", {}, token)
      .then((payload) => {
        if (!cancelled) setLibrary(payload);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  const muscleCounts = useMemo(() => {
    if (!library) return null;
    const byLabel = new Map((library.categories || []).map((c) => [c.label, c.count]));
    const total = (library.entries || []).length;
    return {
      chest: byLabel.get("Chest"),
      back: byLabel.get("Back"),
      shoulders: byLabel.get("Shoulders"),
      arms: (byLabel.get("Biceps") || 0) + (byLabel.get("Triceps") || 0) || undefined,
      legs: byLabel.get("Legs"),
      glutes: byLabel.get("Glutes"),
      core: byLabel.get("Core"),
      fullBody: total || undefined
    };
  }, [library]);

  const q = query.trim().toLowerCase();
  const match = (label) => !q || label.toLowerCase().includes(q);

  const equipment = useMemo(() => EQUIPMENT_FILTERS.filter((e) => match(e.label)), [q]);
  const muscles = useMemo(() => MUSCLE_GROUPS.filter((m) => match(m.label)), [q]);
  const types = useMemo(() => WORKOUT_TYPES.filter((t) => match(t.label)), [q]);
  const coverage = useMemo(() => getLibraryMediaCoverage(), []);

  const resultCount = equipment.length + muscles.length + types.length;
  const hasResults = resultCount > 0;

  // Map a browse tile to the Exercise Library's filters. Muscle groups that
  // have an exact library category filter to it (precise); everything else
  // (equipment / workout type / focus / region / arms / full-body) opens a
  // keyword search — the library's search pool already covers name, category,
  // muscles and equipment, so this reliably lands on a filtered result set.
  const openItem = (item) => {
    const category = item.filter.muscle ? MUSCLE_TO_CATEGORY[item.filter.muscle] : null;
    const query = category ? { category } : { q: item.label };
    navigate(`/exercise-library?${new URLSearchParams(query).toString()}`);
  };

  return (
    <div className="page-grid page-grid-tight workout-library-page editorial-sections">
      <header className={`library-topbar${filtersOpen ? " is-searching" : ""}`}>
        <button
          type="button"
          className="library-back"
          aria-label="Back to Train"
          onClick={() => navigate("/workouts")}
        >
          <BackIcon />
        </button>
        <h1 className="library-topbar-title">Workout Library</h1>
        <label className="library-search-field library-topbar-search">
          <SearchIcon />
          <input
            ref={searchRef}
            type="search"
            value={query}
            aria-label="Search equipment, muscle groups, or workout types"
            placeholder="Search the library"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button
          type="button"
          className={`library-filter-toggle${filtersOpen ? " is-open" : ""}`}
          aria-pressed={filtersOpen}
          aria-label="Search the library"
          onClick={onSearchToggle}
        >
          <FilterIcon />
        </button>
      </header>

      {q ? (
        <p className="library-search-count">
          {resultCount} match{resultCount === 1 ? "" : "es"}
        </p>
      ) : null}

      {!hasResults ? (
        <section className="panel library-empty" aria-live="polite">
          <strong>No matches for “{query}”.</strong>
          <p className="muted">Try a broader term — an equipment type, a muscle group, or a training style.</p>
          <button type="button" className="secondary-button" onClick={() => setQuery("")}>
            Clear search
          </button>
        </section>
      ) : null}

      {/* Benchmark order: muscle groups lead, then equipment, then types.
          One quiet caps heading per section — the eyebrow IS the heading. */}
      {muscles.length ? (
        <section className="panel library-section">
          <h2 className="section-label library-section-heading">Browse by muscle group</h2>
          <div className="library-muscle-grid">
            {muscles.map((group) => (
              <MediaTile
                key={group.id}
                className="library-muscle-card"
                label={group.label}
                description={
                  Number.isFinite(muscleCounts?.[group.id])
                    ? `${muscleCounts[group.id]} exercise${muscleCounts[group.id] === 1 ? "" : "s"}`
                    : undefined
                }
                src={resolveLibraryMedia(group.media)}
                aspect="muscle"
                alt={`${group.label} muscle group`}
                onClick={() => openItem(group)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {equipment.length ? (
        <section className="panel library-section">
          <h2 className="section-label library-section-heading">Browse by equipment</h2>
          <div className="library-equipment-grid">
            {equipment.map((item) => (
              <button
                key={item.id}
                type="button"
                className="library-equipment-card"
                onClick={() => openItem(item)}
              >
                <span className="library-equipment-icon" aria-hidden="true">
                  <EquipmentIcon name={item.icon} />
                </span>
                <span className="library-equipment-label">{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {types.length ? (
        <section className="panel library-section">
          <h2 className="section-label library-section-heading">Popular workout types</h2>
          <div className="library-type-grid">
            {types.map((type) => (
              <MediaTile
                key={type.id}
                className="library-type-card"
                label={type.label}
                description={type.description}
                src={resolveLibraryMedia(type.media)}
                aspect="type"
                alt={`${type.label} workout`}
                cta
                onClick={() => openItem(type)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {coverage.awaiting > 0 ? (
        <p className="library-media-note muted">
          {coverage.approved} of {coverage.total} library images are live. The rest show an
          awaiting-approved-media state and appear automatically once approved photography lands.
        </p>
      ) : null}
    </div>
  );
}

// A single media-backed tile. Renders the approved image when available,
// otherwise a clean, intentional "awaiting approved media" production state —
// never fake imagery. Handles the image's own loading state.
function MediaTile({ className, label, description, src, alt, aspect, cta, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(src) && !errored;

  return (
    <button type="button" className={className} onClick={onClick}>
      <span className={`library-media library-media-${aspect}`}>
        {showImage ? (
          <>
            {!loaded ? <span className="library-media-loading" aria-hidden="true" /> : null}
            <img
              src={src}
              alt={alt}
              loading="lazy"
              className={loaded ? "is-loaded" : ""}
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
            />
          </>
        ) : (
          <span className="library-media-awaiting" role="img" aria-label={`${label} — image in production`}>
            <MediaMarkIcon />
            <span className="library-media-awaiting-text">Image in production</span>
          </span>
        )}
      </span>
      <span className="library-media-body">
        <span className="library-media-label">{label}</span>
        {description ? <span className="library-media-desc">{description}</span> : null}
      </span>
      {cta ? (
        <span className="library-media-cta" aria-hidden="true">
          <ArrowIcon />
        </span>
      ) : null}
    </button>
  );
}

// ---- Icons (thin, athletic line icons; currentColor) ------------------
function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function MediaMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M21 15l-5-5-6 6-3-3-4 4" />
    </svg>
  );
}
function EquipmentIcon({ name }) {
  const p = { viewBox: "0 0 24 24", width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "dumbbell":
      return (<svg {...p}><path d="M6.5 8v8M17.5 8v8M4 9.5v5M20 9.5v5M6.5 12h11" /></svg>);
    case "barbell":
      return (<svg {...p}><path d="M3 9v6M6 8v8M18 8v8M21 9v6M6 12h12" /></svg>);
    case "kettlebell":
      return (<svg {...p}><path d="M9 6.5a3 3 0 0 1 6 0" /><path d="M8 8c-2 1.4-3 3.6-3 6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3c0-2.4-1-4.6-3-6" /></svg>);
    case "machine":
      return (<svg {...p}><path d="M4 4v16M4 8h6l3 3v6M20 6v12" /></svg>);
    case "band":
      return (<svg {...p}><path d="M5 5c6 3 8 11 14 14" /><circle cx="5" cy="5" r="1.5" /><circle cx="19" cy="19" r="1.5" /></svg>);
    case "pullup":
      return (<svg {...p}><path d="M3 5h18M7 5v4M17 5v4M9 9h6v2a3 3 0 0 1-6 0z" /></svg>);
    case "bench":
      return (<svg {...p}><path d="M3 10h18M5 10v6M19 10v6M8 13h8" /></svg>);
    case "clock":
      return (<svg {...p}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>);
    case "home":
      return (<svg {...p}><path d="M4 11l8-6 8 6M6 10v9h12v-9" /></svg>);
    case "shield":
      return (<svg {...p}><path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z" /></svg>);
    case "recovery":
      return (<svg {...p}><path d="M20 12a8 8 0 1 1-3-6.2M20 4v4h-4" /></svg>);
    case "strength":
      return (<svg {...p}><path d="M6.5 8v8M17.5 8v8M4 9.5v5M20 9.5v5M6.5 12h11" /></svg>);
    case "upper":
      return (<svg {...p}><circle cx="12" cy="6" r="2.4" /><path d="M6 12l3-2h6l3 2M9 10v4M15 10v4" /></svg>);
    case "lower":
      return (<svg {...p}><path d="M9 4v7l-2 9M15 4v7l2 9M9 8h6" /></svg>);
    case "core":
      return (<svg {...p}><ellipse cx="12" cy="12" rx="4" ry="8" /><path d="M12 4v16M8.5 8h7M8.5 16h7" /></svg>);
    case "bodyweight":
    default:
      return (<svg {...p}><circle cx="12" cy="5" r="2.2" /><path d="M12 7v7M12 9l-5 3M12 9l5 3M12 14l-3 6M12 14l3 6" /></svg>);
  }
}
