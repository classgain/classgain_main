import { Link } from 'react-router-dom';

export default function CategoryCard({ item, compact = false, to }) {
  const image = item.image || item.thumbnail || item.profileImage || '';
  const addressQuery = encodeURIComponent(item.address || item.title || 'education center');
  const locationUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
  const courseLine =
    item.courseList
      ?.split(/[\n,|]+/)
      .map((entry) => entry.trim())
      .filter(Boolean)[0] ||
    item.badge ||
    item.level ||
    'Education Center';
  const badgeLabel = (item.badge || item.level || 'Education').replace(/\s*Center$/i, '');

  return (
    <article className={`education-card h-100 ${compact ? 'education-card--compact' : ''}`}>
      <Link to={to} className="education-card__main-link text-decoration-none" aria-label={`Open ${item.title} details`}>
        <div className="education-card__media-wrap">
          {image ? (
            <img src={image} alt={item.title} className="education-card__image" loading="lazy" />
          ) : (
            <div className="education-card__image education-card__image--empty">{item.title?.slice(0, 2) || 'WN'}</div>
          )}
          <div className="education-card__overlay">
            <span className="education-card__cart">{badgeLabel}</span>
            <span className="education-card__play">{item.mediaType ?? 'Image & Video'}</span>
          </div>
        </div>
      </Link>
        <div className="education-card__body">
          <Link to={to} className="education-card__title-link text-decoration-none">
            <h3 className="education-card__title">{item.title}</h3>
          </Link>
          <div className="education-card__detail">
            <span className="education-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
                <circle cx="12" cy="9" r="2.4" />
              </svg>
            </span>
            <span>{item.address || 'Address will be updated soon'}</span>
          </div>
          <div className="education-card__detail">
            <span className="education-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 20h16" />
                <path d="M6 20V9l6-4 6 4v11" />
                <path d="M9 20v-6h6v6" />
              </svg>
            </span>
            <span>{courseLine}</span>
          </div>
          <p className="education-card__text">{item.description}</p>
          <div className="education-card__actions">
            <Link to={to} className="education-card__button education-card__button--primary">
              Apply Now
            </Link>
            <a href={locationUrl} target="_blank" rel="noreferrer" className="education-card__button education-card__button--ghost">
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2.4" />
                </svg>
              </span>
              View Location
            </a>
          </div>
        </div>
    </article>
  );
}
