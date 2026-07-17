import { Alert, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { useAllEducationItems } from '../services/useAllEducationItems';

const defaultCategoryRoutes = {
  primary: { slug: 'startingeducation', label: 'Starting Education' },
  secondary: { slug: 'highereducation', label: 'Higher Education' },
  extra: { slug: 'additionaleducation', label: 'Addisnal Education' }
};

function resolveCategory(categories, categoryKey) {
  return categories?.[categoryKey] || defaultCategoryRoutes[categoryKey] || defaultCategoryRoutes.primary;
}

export default function HomePage({ categories }) {
  const { items, loading, error } = useAllEducationItems();

  return (
    <>
      <section className="home-hero">
        <Container fluid="xl">
          <div className="home-hero__content">
            <span className="home-hero__label">All Education Centers</span>
            <h1 className="home-hero__title">classgain education centers in one place.</h1>
            <p className="home-hero__text">
              Browse school, college, and coaching center cards, then open each profile for full course, activity,
              video, address, and scholarship details.
            </p>
            <div className="home-hero__actions">
              <Link to="/startingeducation" className="home-hero__button">
                Schools
              </Link>
              <Link to="/highereducation" className="home-hero__button home-hero__button--soft">
                Colleges
              </Link>
              <Link to="/additionaleducation" className="home-hero__button home-hero__button--soft">
                Coaching
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="category-section category-section--all py-5">
        <Container fluid="xl">
          <div className="section-heading d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-3 mb-4">
            <div>
              <span className="name-tag">All Centers</span>
              <h2 className="section-title mt-3">Education center cards</h2>
            </div>
            <p className="section-note mb-0">
              Schools, colleges, and coaching centers saved by education center accounts appear together here.
            </p>
          </div>

          {loading && (
            <div className="status-panel">
              <Spinner animation="border" variant="primary" />
              <span>Loading education centers...</span>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="status-panel status-panel--error">
              {error}
            </Alert>
          )}

          {!loading && !error && items.length === 0 && (
            <Alert variant="info" className="status-panel">
              No education centers have been uploaded yet.
            </Alert>
          )}

          {!loading && !error && items.length > 0 && (
            <Row className="g-4">
              {items.map((item) => {
                const category = resolveCategory(categories, item.category);

                return (
                  <Col key={item.id} md={6} xl={4}>
                    <CategoryCard item={item} to={`/${category.slug}/${item.id}`} />
                  </Col>
                );
              })}
            </Row>
          )}
        </Container>
      </section>
    </>
  );
}
