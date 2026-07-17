export default function VideoPlayerCard({ video, isActive, onSelect }) {
  const thumbnail = video.thumbnail || video.image || video.profileImage || '';

  return (
    <button
      type="button"
      className={`video-list-item text-start w-100 ${isActive ? 'video-list-item--active' : ''}`}
      onClick={() => onSelect(video)}
    >
      <div className="video-list-item__thumb-wrap">
        {thumbnail ? (
          <img src={thumbnail} alt={video.title} className="video-list-item__thumb" loading="lazy" />
        ) : (
          <div className="video-list-item__thumb video-list-item__thumb--empty">
            {video.title?.slice(0, 2) || 'WN'}
          </div>
        )}
        <span className="video-list-item__duration">{video.duration}</span>
      </div>
      <div className="video-list-item__meta">
        <h3 className="video-list-item__title">{video.title}</h3>
        <p className="video-list-item__channel">{video.channel}</p>
        <p className="video-list-item__summary">{video.description}</p>
      </div>
    </button>
  );
}
