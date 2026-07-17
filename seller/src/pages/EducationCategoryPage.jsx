import { Alert, Col, Row, Spinner } from 'react-bootstrap';
import CategoryCard from '../components/CategoryCard';
import SectionHero from '../components/SectionHero';
import { useEducationItems } from '../services/useEducationItems';

export default function EducationCategoryPage({ categoryKey, category }) {
  const { items, loading, error } = useEducationItems(categoryKey);
  const grid = category.grid ?? { md: 6, lg: 6, xl: 4 };

  return (
    <>
      <SectionHero
        eyebrow={category.tag}
        title={category.title}
        description="Discover trusted schools, coaching centers, and guided programs with clear addresses, rich previews, and a student-friendly path forward."
      />

      <section className="category-section py-5">
        <div className="container-xl">
          <div className="section-heading d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-3 mb-4">
            <div>
              <span className="name-tag">{category.tag}</span>
              <h2 className="section-title mt-3">{category.heading}</h2>
            </div>
            <p className="section-note mb-0">{category.note}</p>
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
              No education centers have been uploaded in this category yet.
            </Alert>
          )}

          {!loading && !error && items.length > 0 && (
            <Row className="g-4">
              {items.map((item) => (
                <Col key={item.id} md={grid.md} lg={grid.lg} xl={grid.xl}>
                  <CategoryCard item={item} compact={category.compactGrid} to={`/${category.slug}/${item.id}`} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </section>
    </>
  );
}
