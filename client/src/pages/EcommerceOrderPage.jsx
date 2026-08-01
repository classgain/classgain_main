import { useEffect, useState } from 'react';
import { Container, Modal } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createOrder, fetchMyOrders } from '../services/api';
import { resolveMediaUrl } from '../services/mediaUrl';
import { readStudentSession } from '../services/studentSession';

const paymentModes = [
  { value: 'COD', label: 'Cash on Delivery', note: 'Active now' },
  { value: 'UPI', label: 'UPI', note: 'Coming soon' },
  { value: 'Card', label: 'Card Payment', note: 'Coming soon' }
];

export default function EcommerceOrderPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const session = readStudentSession();
  const product = state?.product;
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    paymentMode: 'COD',
    quantity: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(null);
  const [unavailablePayment, setUnavailablePayment] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(Boolean(session?.token));
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!session?.token) return;

    fetchMyOrders(session.token)
      .then((data) => setOrders(data.items || []))
      .catch((requestError) => setOrdersError(requestError.message))
      .finally(() => setOrdersLoading(false));
  }, [session?.token, completed]);

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const choosePaymentMode = (mode) => {
    if (mode !== 'COD') {
      setUnavailablePayment(mode);
      return;
    }

    setForm((current) => ({ ...current, paymentMode: 'COD' }));
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!session?.token) {
      navigate('/student-login', {
        state: {
          accessMode: 'buyer',
          message: 'Please use Ecommerce Buying login before buying a product.'
        }
      });
      return;
    }

    if (form.paymentMode !== 'COD') {
      setUnavailablePayment(form.paymentMode);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await createOrder(
        {
          productId: product._id,
          quantity: Number(form.quantity),
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          paymentMode: 'COD'
        },
        session.token
      );
      setCompleted(data.order);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  if (!product && !completed) {
    return (
      <section className="order-workspace">
        <Container fluid="xl">
          <div className="order-panel customer-orders-page">
            <span className="home-hero__label">Customer Orders</span>
            <h1>Your ecommerce order details</h1>
            {!session?.token ? (
              <div className="orders-empty">
                <p>Use Ecommerce Buying login to view your payment and delivery details.</p>
                <Link
                  to="/student-login"
                  state={{ accessMode: 'buyer', message: 'Please login to view your ecommerce orders.' }}
                  className="checkout-submit"
                >
                  Ecommerce Buying Login
                </Link>
              </div>
            ) : ordersLoading ? (
              <p>Loading your orders...</p>
            ) : ordersError ? (
              <div className="alert alert-danger">{ordersError}</div>
            ) : !orders.length ? (
              <div className="orders-empty">
                <p>You have not placed an order yet.</p>
                <Link to="/ecommerce" className="checkout-submit">Shop Products</Link>
              </div>
            ) : (
              <OrderDetails orders={orders} />
            )}
            <div className="customer-orders-actions">
              <Link to="/ecommerce">Continue Shopping</Link>
              {session?.token ? <Link to="/buyer-orders">Open Buying Dashboard</Link> : null}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (completed) {
    return (
      <section className="order-workspace">
        <Container fluid="xl">
          <div className="checkout-success">
            <span>✓</span>
            <h1>Order confirmed</h1>
            <p>Your order <strong>{completed.orderNumber}</strong> was placed successfully.</p>
            <p>Cash payment will be collected when your order is delivered.</p>
            <div>
              <button type="button" onClick={() => navigate('/buyer-orders')}>View Your Orders</button>
              <Link to="/ecommerce">Continue Shopping</Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const image = resolveMediaUrl(product.images?.[0] || product.image);
  const total = (Number(product.finalPrice) * Number(form.quantity || 1)).toFixed(2);

  return (
    <div className="order-page">
      <section className="order-hero">
        <Container fluid="xl">
          <span className="home-hero__label">Secure Checkout</span>
          <h1>Complete your order</h1>
          <p>Cash on Delivery is active. UPI and Card Payment are coming soon.</p>
        </Container>
      </section>
      <section className="order-workspace">
        <Container fluid="xl">
          <div className="checkout-layout">
            <aside className="order-panel checkout-product">
              <img src={image} alt={product.name} />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <label>
                Quantity
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={product.stock}
                  value={form.quantity}
                  onChange={change}
                />
              </label>
              <strong>Order total: Rs. {total}</strong>
            </aside>
            <form className="order-panel checkout-form" onSubmit={submit}>
              <h2>Delivery details</h2>
              {error ? <div className="alert alert-danger">{error}</div> : null}
              <div className="checkout-grid">
                <label>Full name<input name="name" value={form.name} onChange={change} required /></label>
                <label>Email<input type="email" name="email" value={form.email} onChange={change} required /></label>
                <label>Phone<input type="tel" name="phone" pattern="[+0-9][0-9 -]{7,14}" value={form.phone} onChange={change} required /></label>
                <label className="checkout-wide">Delivery address<textarea name="address" rows="4" value={form.address} onChange={change} required /></label>
              </div>
              <h2>Payment mode</h2>
              <p className="checkout-payment-note">Choose Cash on Delivery to confirm your order.</p>
              <div className="checkout-payment" role="radiogroup" aria-label="Payment mode">
                {paymentModes.map((mode) => (
                  <button
                    type="button"
                    key={mode.value}
                    role="radio"
                    aria-checked={form.paymentMode === mode.value}
                    aria-disabled={mode.value !== 'COD'}
                    className={`checkout-payment__option ${form.paymentMode === mode.value ? 'checkout-payment__option--active' : ''} ${mode.value !== 'COD' ? 'checkout-payment__option--unavailable' : ''}`}
                    onClick={() => choosePaymentMode(mode.value)}
                  >
                    <span className="checkout-payment__radio" aria-hidden="true" />
                    <span>
                      <strong>{mode.label}</strong>
                      <small>{mode.note}</small>
                    </span>
                  </button>
                ))}
              </div>
              <button className="checkout-submit" disabled={loading}>
                {loading ? 'Confirming order...' : 'Confirm Cash on Delivery Order'}
              </button>
            </form>
          </div>
        </Container>
      </section>
      <Modal show={Boolean(unavailablePayment)} onHide={() => setUnavailablePayment('')} centered>
        <Modal.Header closeButton>
          <Modal.Title>{unavailablePayment} payment coming soon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="payment-coming-soon-icon" aria-hidden="true">🔒</div>
          <p><strong>{unavailablePayment} payment is currently unavailable.</strong></p>
          <p>
            For your trust and safety, Cash on Delivery is active now. We are working to enable all payment methods in the next update.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-primary" onClick={() => setUnavailablePayment('')}>
            Continue with Cash on Delivery
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function OrderDetails({ orders }) {
  const steps = ['Order Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  return (
    <div className="customer-order-list">
      {orders.map((order) => {
        const active = steps.indexOf(order.orderStatus);
        const image = resolveMediaUrl(order.productImage);

        return (
          <article className="customer-order-card" key={order._id}>
            <img src={image} alt={order.productName} />
            <div className="customer-order-card__details">
              <span>Order {order.orderNumber}</span>
              <h2>{order.productName}</h2>
              <p><strong>Customer:</strong> {order.customer?.name}</p>
              <p><strong>Delivery:</strong> {order.address}</p>
              <p>{order.quantity} × Rs. {order.unitPrice} · {order.paymentMode} · Payment {order.paymentStatus}</p>
              <strong className="customer-order-total">Rs. {order.totalAmount}</strong>
            </div>
            <b className="customer-order-status">{order.orderStatus}</b>
            <div className="customer-order-track">
              {steps.map((step, index) => (
                <span className={index <= active ? 'active' : ''} key={step}>{step}</span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
