import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { searchEducationCenters } from '../services/api';

const categoryRoutes = {
  primary: 'startingeducation',
  secondary: 'highereducation',
  extra: 'additionaleducation'
};

export default function EducationSearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const [state, setState] = useState({ loading: true, error: '', items: [] });

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: '', items: [] });
    searchEducationCenters({ query, type })
      .then((data) => active && setState({ loading: false, error: '', items: data.items || [] }))
      .catch((error) => active && setState({ loading: false, error: error.message, items: [] }));
    return () => { active = false; };
  }, [query, type]);

  return (
    <section className="education-results py-5">
      <Container fluid="xl">
        <span className="name-tag">Education Search</span>
        <h1 className="section-title mt-3">{query ? `Results for “${query}”` : 'Browse education centers'}</h1>
        <p className="section-note mb-4">Search results include center names, locations, and available courses from MongoDB.</p>

        {state.loading ? <div className="status-panel"><Spinner animation="border" /><span>Searching education centers...</span></div> : null}
        {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
        {!state.loading && !state.error && !state.items.length ? <Alert variant="info">No matching school, college, or coaching center was found. Try a nearby town, course name, or a shorter phrase.</Alert> : null}
        {!state.loading && !state.error && state.items.length ? (
          <>
            <p className="education-results__count">{state.items.length} education center{state.items.length === 1 ? '' : 's'} found</p>
            <Row className="g-4">
              {state.items.map((item) => (
                <Col key={item.id} md={6} xl={4}>
                  <CategoryCard item={item} to={`/${categoryRoutes[item.category] || 'startingeducation'}/${item.id}`} />
                </Col>
              ))}
            </Row>
          </>
        ) : null}
      </Container>
    </section>
  );
}
