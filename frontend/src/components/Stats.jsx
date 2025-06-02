export default function Stats({ totalItems, activeItems, boughtItems }) {
  return (
    <div className="stats">
      <div className="stat-item">
          <div className="stat-value">{totalItems}</div>
          <div className="stat-label">Total Items</div>
      </div>
      <div className="stat-item">
          <div className="stat-value">{activeItems}</div>
          <div className="stat-label">To Buy</div>
      </div>
      <div className="stat-item">
          <div className="stat-value">{boughtItems}</div>
          <div className="stat-label">Bought</div>
      </div>
    </div>
  )
}