import { useLoading } from "../LoadingContext";

export default function ItemsToBuy({ items, onUpdateItem, onDeleteItem }) {
  const { loading, setLoading } = useLoading();
  const handleMarkAsBought = async (id) => {
    setLoading(true);
    try {
      await onUpdateItem(id, true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure?')) {
      setLoading(true);
      onDeleteItem(id).finally(() => setLoading(false));
    }
  };

  return (
    <>
      <h3 className="section-title"><i className="bi bi-list-check"></i> Items To Buy</h3>
      <div className="card">
          <ul data-cy="to-buy-section" className="list-group list-group-flush">
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
                  <li data-cy="grocery-item" key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <small className="text-muted d-block">
                        Added: {new Date(item.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="item-actions">
                      <button 
                        data-cy="markAsBoughtBtn"
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleMarkAsBought(item.id)}
                        title="Mark as bought"
                        disabled={loading}
                      >
                        <i className="bi bi-check-lg"></i>
                      </button>
                      <button 
                        data-cy="delete-button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                        title="Delete item"
                        disabled={loading}
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