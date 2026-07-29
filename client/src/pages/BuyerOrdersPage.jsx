import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import SafeImage from '../components/SafeImage';
import { fetchMyOrders } from '../services/api';
import { readStudentSession } from '../services/studentSession';
import './BuyerOrdersPage.css';

const ORDER_STEPS = ['Order Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
const SESSION_KEY = 'what-next-student-session-v1';

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export default function BuyerOrdersPage() {
  const navigate = useNavigate();
  const session = useMemo(() => readStudentSession(), []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(session?.token));
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!session?.token) return undefined;

    let active = true;
    fetchMyOrders(session.token)
      .then((data) => {
        if (active) setOrders(data.items || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load your orders right now.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey, session?.token]);

  if (!session?.token) {
    return (
      <Navigate
        to="/student-login"
        replace
        state={{ accessMode: 'buyer', message: 'Please use Ecommerce Buying login to view your order dashboard.' }}
      />
    );
  }

  const totalSpent = orders
    .filter((order) => order.orderStatus !== 'Cancelled')
    .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const activeOrders = orders.filter((order) => !['Delivered', 'Cancelled'].includes(order.orderStatus)).length;

  const handleLogout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    navigate('/student-login', {
      replace: true,
      state: { accessMode: 'buyer', message: 'You have been signed out of Ecommerce Buying.' }
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    setRefreshKey((value) => value + 1);
  };

  return (
    <main className="buyer-dashboard">
      <header className="buyer-dashboard__header">
        <Link to="/ecommerce" className="buyer-dashboard__brand" aria-label="ClassGain ecommerce home">
          <span>Class</span>Gain
        </Link>
        <div className="buyer-dashboard__account">
          <span>{session.user?.email}</span>
          <button type="button" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <div className="buyer-dashboard__content">
        <section className="buyer-dashboard__hero">
          <div>
            <span className="buyer-dashboard__eyebrow">Ecommerce Buying Dashboard</span>
            <h1>Your order details</h1>
            <p>Only your products, payment details, delivery information, and tracking status are shown here.</p>
          </div>
          <div className="buyer-dashboard__hero-actions">
            <button type="button" onClick={handleRefresh} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Orders'}
            </button>
            <Link to="/ecommerce">Continue Shopping</Link>
          </div>
        </section>

        <section className="buyer-dashboard__summary" aria-label="Order summary">
          <article>
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </article>
          <article>
            <span>Active deliveries</span>
            <strong>{activeOrders}</strong>
          </article>
          <article>
            <span>Order value</span>
            <strong>{formatMoney(totalSpent)}</strong>
          </article>
        </section>

        {loading ? (
          <section className="buyer-dashboard__state" role="status">
            <span className="buyer-dashboard__loader" aria-hidden="true" />
            <h2>Loading your buying details</h2>
            <p>Please wait while your orders are retrieved.</p>
          </section>
        ) : error ? (
          <section className="buyer-dashboard__state buyer-dashboard__state--error" role="alert">
            <h2>Orders could not be loaded</h2>
            <p>{error}</p>
            <button type="button" onClick={handleRefresh}>Try Again</button>
          </section>
        ) : orders.length === 0 ? (
          <section className="buyer-dashboard__state">
            <span className="buyer-dashboard__empty-icon" aria-hidden="true">B</span>
            <h2>No orders yet</h2>
            <p>Products you buy will appear here with full payment and delivery details.</p>
            <Link to="/ecommerce">Start Shopping</Link>
          </section>
        ) : (
          <section className="buyer-order-list" aria-label="Your orders">
            {orders.map((order) => {
              const activeStep = ORDER_STEPS.indexOf(order.orderStatus);
              const cancelled = order.orderStatus === 'Cancelled';

              return (
                <article className="buyer-order-card" key={order._id}>
                  <div className="buyer-order-card__topline">
                    <div>
                      <span>Order number</span>
                      <strong>{order.orderNumber}</strong>
                    </div>
                    <div>
                      <span>Order date</span>
                      <strong>{formatDate(order.createdAt)}</strong>
                    </div>
                    <b className={`buyer-order-card__status ${cancelled ? 'buyer-order-card__status--cancelled' : ''}`}>
                      {order.orderStatus}
                    </b>
                  </div>

                  <div className="buyer-order-card__body">
                    <SafeImage src={order.productImage} alt={order.productName} />
                    <div className="buyer-order-card__product">
                      <span>Product</span>
                      <h2>{order.productName}</h2>
                      <p>{order.quantity} × {formatMoney(order.unitPrice)}</p>
                      <strong>{formatMoney(order.totalAmount)}</strong>
                    </div>

                    <dl className="buyer-order-card__details">
                      <div>
                        <dt>Customer</dt>
                        <dd>{order.customer?.name || session.user?.name || 'Customer'}</dd>
                      </div>
                      <div>
                        <dt>Email</dt>
                        <dd>{order.customer?.email || session.user?.email}</dd>
                      </div>
                      <div>
                        <dt>Phone</dt>
                        <dd>{order.customer?.phone || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt>Payment</dt>
                        <dd>{order.paymentMode} · {order.paymentStatus}</dd>
                      </div>
                      <div className="buyer-order-card__address">
                        <dt>Delivery address</dt>
                        <dd>{order.address}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="buyer-order-card__tracking" aria-label={`Tracking status for ${order.orderNumber}`}>
                    {cancelled ? (
                      <div className="buyer-order-card__cancelled">This order was cancelled.</div>
                    ) : ORDER_STEPS.map((step, index) => (
                      <div className={index <= activeStep ? 'buyer-order-step buyer-order-step--active' : 'buyer-order-step'} key={step}>
                        <span>{index + 1}</span>
                        <strong>{step}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
