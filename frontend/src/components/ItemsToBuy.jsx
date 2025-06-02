export default function ItemsToBuy({ items, onUpdateItem, onDeleteItem }) {
  const handleMarkAsBought = (id) => {
    onUpdateItem(id, true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDeleteItem(id);
    }
  };

  return (
    <>
      <h3 className="section-title"><i className="bi bi-list-check"></i> Items To Buy</h3>
      <div className="card">
          <ul className="list-group list-group-flush">
              {items.length === 0 ? (
                <li className="list-group-item empty-state">
                    <div>
                        <i className="bi bi-emoji-smile"></i>
                        <h5>Your list is empty</h5>
                        <p>Add some items to get started!</p>
                    </div>
                </li>
              ) : (
                items.map(item => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <small className="text-muted d-block">
                        Added: {new Date(item.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="item-actions">
                      <button 
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleMarkAsBought(item.id)}
                        title="Mark as bought"
                      >
                        <i className="bi bi-check-lg"></i>
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