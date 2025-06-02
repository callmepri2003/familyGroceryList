export default function ItemsToBuy(){
  return (
    <>
      <h3 class="section-title"><i class="bi bi-list-check"></i> Items To Buy</h3>
      <div class="card">
          <ul class="list-group list-group-flush" id="grocery-list">
              <li class="list-group-item empty-state">
                  <div>
                      <i class="bi bi-emoji-smile"></i>
                      <h5>Your list is empty</h5>
                      <p>Add some items to get started!</p>
                  </div>
              </li>
          </ul>
      </div>
    </>
  )
}