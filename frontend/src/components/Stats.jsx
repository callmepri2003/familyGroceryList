export default function Stats(){
  return (
    <div className="stats">
            <div className="stat-item">
                <div className="stat-value" id="total-items">0</div>
                <div className="stat-label">Total Items</div>
            </div>
            <div className="stat-item">
                <div className="stat-value" id="active-items">0</div>
                <div className="stat-label">To Buy</div>
            </div>
            <div className="stat-item">
                <div className="stat-value" id="bought-items">0</div>
                <div className="stat-label">Bought</div>
            </div>
        </div>
  )
}