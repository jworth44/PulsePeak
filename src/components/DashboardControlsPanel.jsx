import React, { useMemo, useState } from "react";
import Panel from "./Panel";
import { apiRequest } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { normalizeHiddenModules } from "../../shared/dashboardModules";

const VISIBILITY_OPTIONS = [
  { id: "nutrition", label: "Nutrition", description: "Hide nutrition guidance from the main navigation." },
  { id: "mobility", label: "Mobility", description: "Hide mobility and recovery guidance from the main navigation." },
  { id: "insights_group", label: "Insights group", description: "Hide both Coach and Progress from the main navigation." },
  { id: "coach", label: "Coach", description: "Hide the coach surface from the main navigation." },
  { id: "progress", label: "Progress", description: "Hide progress tracking from the main navigation." }
];

export default function DashboardControlsPanel() {
  const { token, dashboard, refreshSession } = useAuth();
  const profile = dashboard?.profile || {};
  const [hiddenModules, setHiddenModules] = useState(() => normalizeHiddenModules(profile.hiddenModules));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  React.useEffect(() => {
    setHiddenModules(normalizeHiddenModules(profile.hiddenModules));
  }, [profile.hiddenModules]);

  const visibilityOptions = useMemo(
    () =>
      VISIBILITY_OPTIONS.map((option) => {
        if (option.id === "insights_group") {
          const hidden = hiddenModules.includes("coach") && hiddenModules.includes("progress");
          return { ...option, hidden };
        }

        return { ...option, hidden: hiddenModules.includes(option.id) };
      }),
    [hiddenModules]
  );

  const toggleHiddenModule = (moduleId) => {
    setHiddenModules((current) => {
      if (moduleId === "insights_group") {
        const next = new Set(current);
        const bothHidden = next.has("coach") && next.has("progress");
        if (bothHidden) {
          next.delete("coach");
          next.delete("progress");
        } else {
          next.add("coach");
          next.add("progress");
        }
        return Array.from(next);
      }

      return current.includes(moduleId) ? current.filter((entry) => entry !== moduleId) : [...current, moduleId];
    });
  };

  const saveControls = async () => {
    setSaving(true);
    setStatus("");
    try {
      await apiRequest(
        "/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            hiddenModules: normalizeHiddenModules(hiddenModules)
          })
        },
        token
      );
      await refreshSession(token);
      setStatus("Module visibility saved.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel eyebrow="Module Visibility" title="Hide the optional parts of PulsePeak you do not want in the navigation">
      <div className="module-control-list">
        {visibilityOptions.map((module) => {
          const hidden = module.hidden;
          return (
            <div className="module-control-row" key={module.id}>
              <div>
                <strong>{module.label}</strong>
                <p className="muted">{module.description}</p>
              </div>
              <div className="module-control-actions">
                <button className={hidden ? "secondary-button" : "primary-button"} type="button" onClick={() => toggleHiddenModule(module.id)}>
                  {hidden ? "Show" : "Hide"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {status ? <p className="muted">{status}</p> : null}
      <button className="primary-button" disabled={saving} type="button" onClick={saveControls}>
        {saving ? "Saving..." : "Save visibility"}
      </button>
    </Panel>
  );
}
