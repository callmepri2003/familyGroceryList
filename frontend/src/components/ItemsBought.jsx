export default function ItemsBought(){
  return (
    <>
    <h3 class="section-title"><i class="bi bi-check2-circle"></i> Items Bought</h3>
    <div class="card">
        <ul class="list-group list-group-flush" id="bought-list">
            <li class="list-group-item empty-state">
                <div>
                    <i class="bi bi-cart-check"></i>
                    <h5>No items bought yet</h5>
                    <p>Mark items as bought when you purchase them</p>
                </div>
            </li>
        </ul>
    </div>
    </>
  )
}