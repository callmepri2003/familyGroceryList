import { useState } from 'react';

export default function AddItemForm({ onAddItem }) {
  const [itemName, setItemName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!itemName.trim()) {
      return;
    }

    setIsSubmitting(true);
    const success = await onAddItem(itemName.trim());
    
    if (success) {
      setItemName(''); // Clear input on success
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="card">
      <div className="card-header">
          <i className="bi bi-plus-circle"></i> Add New Item
      </div>
      <div className="card-body">
          <form onSubmit={handleSubmit}>
              <div className="input-group">
                  <input 
                    data-cy="add-item-input"
                    type="text" 
                    className="form-control" 
                    placeholder="Add milk, eggs, bread..." 
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    disabled={isSubmitting}
                    required 
                  />
                  <button 
                    data-cy="add-item-button"
                    className="btn btn-add" 
                    type="submit"
                    disabled={isSubmitting || !itemName.trim()}
                  >
                      <i className="bi bi-plus-lg"></i> 
                      {isSubmitting ? 'Adding...' : 'Add Item'}
                  </button>
              </div>
          </form>
      </div>
  </div>
  )
}