import { useLoading } from "../LoadingContext";

export default function ItemsBought({ items, onUpdateItem, onDeleteItem }) {
  const { loading, setLoading } = useLoading();
  const handleMarkAsNotBought = async (id) => {
    setLoading(true);
    try {
      await onUpdateItem(id, false);
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
      <h3 className="section-title"><i className="bi bi-check2-circle"></i> Items Bought</h3>
      <div className="card">
          <ul data-cy="bought-section" className="list-group list-group-flush">
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
                  <li data-cy="grocery-item" key={item.id} className="list-group-item d-flex justify-content-between align-items-center bought-item">
                    <div className="item-info">
                      <span className="item-name text-decoration-line-through text-muted">{item.name}</span>
                      <small className="text-muted d-block">
                        Added: {new Date(item.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="item-actions">
                      <button 
                        data-cy="MarkAsNotBoughtBtn"
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleMarkAsNotBought(item.id)}
                        title="Mark as not bought"
                        disabled={loading}
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
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