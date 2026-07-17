import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchEducationItems } from '../services/api';

const baseSearchItems = [
  { label: 'Main Page', keywords: ['main page', 'home', 'what next'], to: '/home' },
  { label: 'School', keywords: ['school', 'starting education', 'primary'], to: '/startingeducation' },
  { label: 'College', keywords: ['college', 'higher education', 'secondary'], to: '/highereducation' },
  {
    label: 'Coaching Center',
    keywords: ['coaching center', 'addisnal education', 'additional education', 'extra skills', 'coaching'],
    to: '/additionaleducation'
  },
  { label: 'Video Education', keywords: ['video education', 'videos', 'youtube', 'reels'], to: '/video-education' },
  { label: 'Help', keywords: ['help', 'support'], to: '/help-center' },
  { label: 'Counselling', keywords: ['counselling', 'counseling', 'guidance'], to: '/counselling' }
];

const categorySlugMap = {
  primary: 'startingeducation',
  secondary: 'highereducation',
  extra: 'additionaleducation'
};

function toCenterSearchItem(category, item) {
  const slug = categorySlugMap[category];

  if (!slug || !item?.id || !item?.title) {
    return null;
  }

  return {
    label: item.title,
    keywords: [item.title, item.level, item.address, item.badge].filter(Boolean),
    to: `/${slug}/${item.id}`
  };
}

export default function SearchRibbon() {
  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchableItems, setSearchableItems] = useState(baseSearchItems);

  const browserRecognition = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSearchableItems() {
      const responses = await Promise.allSettled([
        fetchEducationItems('primary'),
        fetchEducationItems('secondary'),
        fetchEducationItems('extra')
      ]);

      if (!isMounted) {
        return;
      }

      const dynamicItems = responses.flatMap((result, index) => {
        if (result.status !== 'fulfilled') {
          return [];
        }

        const category = ['primary', 'secondary', 'extra'][index];
        return (result.value.items ?? [])
          .map((item) => toCenterSearchItem(category, item))
          .filter(Boolean);
      });

      setSearchableItems([...baseSearchItems, ...dynamicItems]);
    }

    loadSearchableItems();

    return () => {
      isMounted = false;
      recognitionRef.current?.stop?.();
    };
  }, []);

  useEffect(() => {
    setIsExpanded(false);
    setSearchError('');
    setSearchTerm('');
    setIsListening(false);
  }, [location.pathname]);

  const searchAndNavigate = (value, event) => {
    if (event) {
      event.preventDefault();
    }

    const normalizedTerm = value.trim().toLowerCase();
    if (!normalizedTerm) {
      setSearchError('find your study.');
      return;
    }

    const match = searchableItems.find((item) => {
      const haystack = [item.label, ...item.keywords].join(' ').toLowerCase();
      return haystack.includes(normalizedTerm);
    });

    if (!match) {
      setSearchError('No match found.');
      return;
    }

    setSearchError('');
    setIsExpanded(false);
    navigate(match.to);
  };

  const handleVoiceSearch = () => {
    if (!browserRecognition) {
      setSearchError('Speech search is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop?.();
      setIsListening(false);
      return;
    }

    const recognition = new browserRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setSearchError('');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || '';
      setSearchTerm(transcript);

      if (transcript) {
        searchAndNavigate(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setSearchError('Speech search could not hear clearly. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className={`search-ribbon-shell ${isExpanded ? 'search-ribbon-shell--open' : ''}`}>
      <button
        type="button"
        className="search-ribbon-toggle"
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Close search bar' : 'Open search bar'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="search-ribbon-toggle__icon">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M16 16L21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {isExpanded ? (
        <div className="search-ribbon">
          <Container fluid="xl">
        <form className="search-ribbon__form" onSubmit={(event) => searchAndNavigate(searchTerm, event)}>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              if (searchError) {
                setSearchError('');
              }
            }}
            className="search-ribbon__input"
            placeholder="Search school name, college name, or additional education name"
            aria-label="Search education center names"
          />
          <button
            type="button"
            className={`search-ribbon__voice ${isListening ? 'search-ribbon__voice--active' : ''}`}
            onClick={handleVoiceSearch}
            aria-label={isListening ? 'Stop speech search' : 'Start speech search'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="15" fill="currentColor" aria-hidden="true">
              <path d="M480-320q83 0 141.5-58.5T680-520h80q0 105-68 183.5T520-244v124h-80v-124q-104-14-172-92.5T200-520h80q0 83 58.5 141.5T480-320Zm0-160q-50 0-85-35t-35-85v-160q0-50 35-85t85-35q50 0 85 35t35 85v160q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T520-600v-160q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v160q0 17 11.5 28.5T480-560Z" />
            </svg>
          </button>
          <button type="submit" className="search-ribbon__submit">
            Go
          </button>
        </form>
        {searchError ? (
          <Alert variant="light" className="search-ribbon__alert mb-0 mt-2">
            {searchError}
          </Alert>
        ) : null}
          </Container>
        </div>
      ) : null}
    </div>
  );
}
