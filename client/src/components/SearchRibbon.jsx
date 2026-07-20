import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const categoryOptions = [
  { value: '', label: 'All education' },
  { value: 'primary', label: 'School' },
  { value: 'secondary', label: 'College' },
  { value: 'extra', label: 'Coaching center' }
];

export default function SearchRibbon() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    if (location.pathname === '/education-search') {
      setQuery(searchParams.get('q') || '');
      setType(searchParams.get('type') || '');
    }
  }, [location.pathname, searchParams]);

  function submitSearch(event) {
    event.preventDefault();
    const value = query.trim();
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    if (type) params.set('type', type);
    navigate(`/education-search?${params.toString()}`);
  }

  return (
    <section className="education-search-bar" aria-label="Education area search">
      <Container fluid="xl">
        <form className="education-search-bar__form" onSubmit={submitSearch}>
          <label className="visually-hidden" htmlFor="education-type">Education type</label>
          <select id="education-type" value={type} onChange={(event) => setType(event.target.value)}>
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <label className="visually-hidden" htmlFor="education-query">Search education centers</label>
          <input
            id="education-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search education name, location, or course (example: best schools in Kalvarayan Hills)"
          />
          <button type="submit" aria-label="Search education centers">Search</button>
        </form>
        <p className="education-search-bar__hint">Education area only — ecommerce products use the separate ecommerce search.</p>
      </Container>
    </section>
  );
}
