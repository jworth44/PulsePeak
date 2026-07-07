import React from "react";
import { haptic } from "../lib/haptics";

export default function HabitList({ habits, onToggle }) {
  return (
    <div className="habit-grid">
      {habits.map((habit) => (
        <button
          className={`habit-card ${habit.completedToday ? "habit-done" : ""}`}
          key={habit.id}
          type="button"
          onClick={() => {
            // A satisfying tick the moment a habit is marked done (not on undo).
            if (!habit.completedToday) haptic("tap");
            onToggle(habit.id);
          }}
        >
          <div>
            <h4>{habit.name}</h4>
            <p className="muted">{habit.target}</p>
          </div>
          <div className="habit-status">
            <strong>{habit.streak} day{habit.streak === 1 ? "" : "s"}</strong>
            <span>{habit.completedToday ? "Done today" : "Tap to complete"}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
