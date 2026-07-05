import React from "react";

export default function ActivityList({ items, emptyTitle, emptyMeta, onRemove, renderMeta }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    return (
      <ul className="card-list">
        <li className="list-card">
          <div>
            <strong className="item-title">{emptyTitle}</strong>
            <p className="item-meta muted">{emptyMeta}</p>
          </div>
        </li>
      </ul>
    );
  }

  return (
    <ul className="card-list">
      {list.map((item) => (
        <li className="list-card" key={item.id}>
          <div>
            <strong className="item-title">{item.name}</strong>
            <p className="item-meta muted">{renderMeta(item)}</p>
          </div>
          <button className="icon-button" type="button" onClick={() => onRemove(item.id)}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
