export default function ItemsBought({ items, onUpdateItem, onDeleteItem }) {
  const handleMarkAsNotBought = (id) => {
    onUpdateItem(id, false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDeleteItem(id);
    }
  };

  return (
    <>
      <h3 className="section-title"><i className="bi bi-check2-circle"></i> Items Bought</h3>
      <div className="card">
          <ul className="list-group list-group-flush">
              {items.length === 0 ? (
                <li className="list-group-item empty-state">
                    <div>
                        <i className="bi bi-cart-check"></i>
                        <h5>No items bought yet</h5>
                        <p>Mark items as bought when you purchase them</p>
                    </div>
                </li>
              ) : (
                items.map(item => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center bought-item">
                    <div className="item-info">
                      <span className="item-name text-decoration-line-through text-muted">{item.name}</span>
                      <small className="text-muted d-block">
                        Added: {new Date(item.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="item-actions">
                      <button 
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleMarkAsNotBought(item.id)}
                        title="Mark as not bought"
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                        title="Delete item"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </li>
                ))
              )}
          </ul>
      </div>
    </>
  )
}