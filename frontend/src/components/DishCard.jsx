import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faPlus, faMinus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';

const DishCard = ({ item }) => {
  const { cartItems, addToCart, updateQty } = useCart();

  const imageUrl = item.image_url
    ? item.image_url.startsWith('http')
      ? item.image_url
      : `http://localhost:5000${item.image_url}`
    : null;

  const cartItem = cartItems.find((i) => i.id === item.id);
  const qty = cartItem ? cartItem.qty : 0;

  return (
    <div className="card">
      {imageUrl ? (
        <img src={imageUrl} alt={item.name} className="card-img" />
      ) : (
        <div className="card-img-placeholder">
          <FontAwesomeIcon icon={faUtensils} />
        </div>
      )}

      <div className="card-body">
        <span className="card-category">{item.category}</span>
        <h3 className="card-title">{item.name}</h3>
        <p className="card-desc">{item.description}</p>

        <div className="card-footer">
          <p className="card-price">₹{Number(item.price).toFixed(2)}</p>

          {qty === 0 ? (
            <button className="btn-add-cart" onClick={() => addToCart(item)}>
              <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
            </button>
          ) : (
            <div className="qty-control">
              <button className="qty-btn" onClick={() => updateQty(item.id, qty - 1)}>
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn" onClick={() => updateQty(item.id, qty + 1)}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCard;
