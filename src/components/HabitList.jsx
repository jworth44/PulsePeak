import React from "react";

export default function HabitList({ habits, onToggle }) {
  return (
    <div className="habit-grid">
      {habits.map((habit) => (
        <button
          className={`habit-card ${habit.completedToday ? "habit-done" : ""}`}
          key={habit.id}
          type="button"
          onClick={() => onToggle(habit.id)}
        >
          <div>
            <p className="section-label">Habit streak</p>
            <h4>{habit.name}</h4>
            <p className="muted">{habit.target}</p>
          </div>
          <div className="habit-status">
            <strong>{habit.streak} days</strong>
            <span>{habit.completedToday ? "Done today" : "Tap to complete"}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
