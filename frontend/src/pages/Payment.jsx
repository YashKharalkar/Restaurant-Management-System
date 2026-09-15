import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faTrash,
  faPlus,
  faMinus,
  faMoneyBillWave,
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
  faLock,
  faReceipt,
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cod'

  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const { user } = useAuth();
  const { cartItems, updateQty, updateInstructions, removeFromCart, clearCart, cartTotal } = useCart();

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();

    if (cartItems.length === 0) return;

    if (!address.trim()) {
      setStatus('error');
      setMessage('Please enter a delivery address.');
      return;
    }

    if (!phone.trim()) {
      setStatus('error');
      setMessage('Please enter your phone number.');
      return;
    }

    setLoading(true);
    setStatus('');
    setMessage('');

    try {
      const orderPayload = {
        items: cartItems,
        delivery_address: address,
        contact_phone: phone,
        customer_name: user?.name || 'Rahul Sharma',
        customer_email: user?.email || 'rahul@example.com',
        payment_method: paymentMethod,
      };

      const res = await api.post('/orders/create', orderPayload);

      // Handle Cash on Delivery (COD)
      if (paymentMethod === 'cod') {
        setStatus('success');
        setMessage('Order placed successfully! Pay on delivery.');
        setPlacedOrder({
          id: res.data.dbOrderId,
          total: cartTotal,
          address,
          phone,
          method: 'Cash on Delivery',
        });
        clearCart();
        setLoading(false);
        return;
      }

      // Handle Online Payment (Razorpay)
      const data = res.data;
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'The Grand Table',
        description: `Order #${data.dbOrderId}`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              db_order_id: data.dbOrderId,
            });
            setStatus('success');
            setMessage(verifyRes.data.message || 'Payment verified successfully!');
            setPlacedOrder({
              id: data.dbOrderId,
              total: cartTotal,
              address,
              phone,
              method: 'Online Payment (Razorpay)',
            });
            clearCart();
          } catch {
            setStatus('error');
            setMessage('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name || 'Rahul Sharma',
          email: user?.email || 'rahul@example.com',
          contact: phone,
        },
        theme: { color: '#0E4D64' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setStatus('error');
        setMessage('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  // Order Success Screen
  if (status === 'success' && placedOrder) {
    return (
      <section className="section" style={{ backgroundColor: '#f5f9fb', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="card" style={{ padding: '30px', textAlign: 'center', background: '#fff' }}>
            <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '3rem', color: '#38a169', marginBottom: '15px' }} />
            <h2 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Order Placed Successfully!</h2>
            <p style={{ color: 'var(--text-gray)', marginBottom: '20px' }}>
              Your food is being prepared. Thank you for ordering with us!
            </p>

            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'left', marginBottom: '20px', fontSize: '0.9rem' }}>
              <p><strong>Order ID:</strong> #{placedOrder.id}</p>
              <p><strong>Payment Method:</strong> {placedOrder.method}</p>
              <p><strong>Delivery Address:</strong> {placedOrder.address}</p>
              <p><strong>Phone:</strong> {placedOrder.phone}</p>
              <p><strong>Total Amount:</strong> ₹{placedOrder.total.toFixed(2)}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link to="/orders" className="btn btn-primary">
                <FontAwesomeIcon icon={faReceipt} /> View My Orders
              </Link>
              <Link to="/menu" className="btn btn-outline">
                Browse Menu
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty Cart
  if (cartItems.length === 0) {
    return (
      <section className="section" style={{ backgroundColor: '#f5f9fb', minHeight: '80vh' }}>
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added anything yet. Browse our menu and add items!</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: '15px' }}>
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
          <h1>
            <FontAwesomeIcon icon={faShoppingCart} /> Your Cart
          </h1>
          <Link to="/menu" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
            <FontAwesomeIcon icon={faArrowLeft} /> Add More Items
          </Link>
        </div>

        {status === 'error' && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <FontAwesomeIcon icon={faTimesCircle} /> {message}
          </div>
        )}

        <div className="cart-layout">
          {/* Cart Items List */}
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

                  {/* Simple Note / Special Request Input */}
                  <div style={{ marginTop: '6px' }}>
                    <input
                      type="text"
                      placeholder="Special note (e.g. less spicy, extra cheese)"
                      value={item.special_instructions || ''}
                      onChange={(e) => updateInstructions(item.id, e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '0.8rem',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e0',
                      }}
                    />
                  </div>
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

          {/* Delivery & Checkout Panel */}
          <div className="cart-summary-panel">
            <h3 className="summary-title">Delivery & Payment</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Delivery Address *
              </label>
              <textarea
                rows="2"
                placeholder="Flat 402, Shanti Kunj, Bandra West, Mumbai, Maharashtra 400050"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Payment Method
              </label>
              <div style={{ display: 'flex', gap: '15px', fontSize: '0.88rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="pay_method"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                  Online (Razorpay)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="pay_method"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  Cash on Delivery
                </label>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-total-row">
              <span>Total</span>
              <span className="summary-total-amount">₹{cartTotal.toFixed(2)}</span>
            </div>

            <div className="summary-divider" />

            <button
              className="btn btn-primary pay-now-btn"
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
            >
              {loading ? (
                'Processing...'
              ) : paymentMethod === 'online' ? (
                <><FontAwesomeIcon icon={faLock} /> Pay Online ₹{cartTotal.toFixed(2)}</>
              ) : (
                <><FontAwesomeIcon icon={faMoneyBillWave} /> Place Order (COD) ₹{cartTotal.toFixed(2)}</>
              )}
            </button>

            <p className="payment-note">100% Safe & Secure Checkout</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
