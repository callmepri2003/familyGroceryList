export default function AddItemForm(){
  return (
    <div class="card">
      <div class="card-header">
          <i class="bi bi-plus-circle"></i> Add New Item
      </div>
      <div class="card-body">
          <form id="add-item-form">
              <div class="input-group">
                  <input type="text" class="form-control" id="new-item-input" placeholder="Add milk, eggs, bread..." required />
                  <button class="btn btn-add" type="submit">
                      <i class="bi bi-plus-lg"></i> Add Item
                  </button>
              </div>
          </form>
      </div>
  </div>
  )
}