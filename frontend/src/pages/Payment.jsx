import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart, faTrash, faPlus, faMinus,
  faCreditCard, faCheckCircle, faTimesCircle, faArrowLeft, faLock
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { cartItems, updateQty, removeFromCart, clearCart, cartTotal } = useCart();

  const handlePayment = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setStatus('');
    setMessage('');

    try {
      const { data } = await api.post('/payment/create-order', { amount: cartTotal });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'The Grand Table',
        description: `Order of ${cartItems.length} item(s)`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setStatus('success');
            setMessage(verifyRes.data.message);
            clearCart();
          } catch {
            setStatus('error');
            setMessage('Payment verification failed. Please contact support.');
          }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#0E4D64' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && status !== 'success') {
    return (
      <section className="section" style={{ backgroundColor: '#f5f9fb', minHeight: '80vh' }}>
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added anything yet. Browse our menu and add items!</p>
            <Link to="/menu" className="btn btn-primary">
              <FontAwesomeIcon icon={faArrowLeft} /> Browse Menu
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ backgroundColor: '#f5f9fb', minHeight: '80vh' }}>
      <div className="container">
        <div className="cart-page-header">
          <h1><FontAwesomeIcon icon={faShoppingCart} /> Your Cart</h1>
          <Link to="/menu" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
            <FontAwesomeIcon icon={faArrowLeft} /> Add More Items
          </Link>
        </div>

        {status === 'success' && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
            <FontAwesomeIcon icon={faCheckCircle} /> {message}
          </div>
        )}
        {status === 'error' && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
            <FontAwesomeIcon icon={faTimesCircle} /> {message}
          </div>
        )}

        <div className="cart-layout">
          <div className="cart-items-panel">
            <div className="cart-items-header">
              <span>{cartItems.reduce((s, i) => s + i.qty, 0)} item(s) in cart</span>
              <button className="btn-clear-cart" onClick={clearCart}>Clear All</button>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-category">{item.category}</span>
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-unit">₹{Number(item.price).toFixed(2)} each</p>
                </div>

                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="qty-value">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                  <p className="cart-item-subtotal">₹{(item.price * item.qty).toFixed(2)}</p>
                  <button className="btn-remove-item" onClick={() => removeFromCart(item.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-panel">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-rows">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-row">
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-total-row">
              <span>Total</span>
              <span className="summary-total-amount">₹{cartTotal.toFixed(2)}</span>
            </div>

            <div className="summary-divider" />

            <div className="payment-section">
              <div className="payment-section-header">
                <FontAwesomeIcon icon={faCreditCard} />
                <span>Secure Payment via Razorpay</span>
              </div>

              <button
                className="btn btn-primary pay-now-btn"
                onClick={handlePayment}
                disabled={loading || cartItems.length === 0}
              >
                {loading ? 'Processing...' : <><FontAwesomeIcon icon={faLock} /> Pay ₹{cartTotal.toFixed(2)}</>}
              </button>

              <p className="payment-note">Powered by Razorpay · 100% Secure</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
