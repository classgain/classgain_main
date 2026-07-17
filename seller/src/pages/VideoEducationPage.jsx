import { useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import VideoPlayerCard from '../components/VideoPlayerCard';
import { useEducationItems } from '../services/useEducationItems';

function getEmbedUrl(url) {
  if (!url) {
    return '';
  }

  try {
    const parsed = new URL(url);
    const videoId = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.replace('/', '')
      : parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop();

    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch (error) {
    return url;
  }
}

export default function VideoEducationPage() {
  const { items, loading, error } = useEducationItems('videos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const topicFilters = ['All', 'Campus Tour', 'Lessons', 'Reels', 'Career Skills'];
  const [activeFilter, setActiveFilter] = useState('All');
  const filteredVideos = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return items.filter((video) => {
      const haystack = [video.title, video.channel, video.description].join(' ').toLowerCase();
      const matchesSearch = !normalizedTerm || haystack.includes(normalizedTerm);
      const matchesTopic = activeFilter === 'All' || video.topic === activeFilter;

      if (activeFilter === 'Campus Tour') {
        return matchesSearch && (haystack.includes('campus') || haystack.includes('classroom') || haystack.includes('spaces'));
      }

      if (activeFilter === 'Lessons') {
        return matchesSearch && (haystack.includes('lesson') || haystack.includes('education') || haystack.includes('learning'));
      }

      if (activeFilter === 'Reels') {
        return matchesSearch && (haystack.includes('reel') || haystack.includes('preview') || haystack.includes('watch'));
      }

      if (activeFilter === 'Career Skills') {
        return matchesSearch && (haystack.includes('skills') || haystack.includes('career') || haystack.includes('job'));
      }

      return matchesSearch && matchesTopic;
    });
  }, [activeFilter, items, searchTerm]);

  const firstVideo = useMemo(() => filteredVideos[0] ?? null, [filteredVideos]);
  const currentVideo = activeVideo ?? firstVideo;
  const recommendedVideos = filteredVideos.filter((video) => video.id !== currentVideo?.id);

  const handleVideoSelect = (video) => {
    setActiveVideo(video);
  };

  const handleSearchChange = (event) => {
    const nextValue = event.target.value;
    setSearchTerm(nextValue);

    if (!nextValue.trim()) {
      setActiveVideo(null);
      return;
    }

    const matchedVideo = items.find((video) =>
      [video.title, video.channel, video.description].join(' ').toLowerCase().includes(nextValue.trim().toLowerCase())
    );

    setActiveVideo(matchedVideo ?? null);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setActiveVideo(filteredVideos[0] ?? null);
  };

  return (
    <section className="video-hub py-4 py-lg-5">
      <Container fluid="xl">
        <div className="video-hub__shell">
          <form className="video-search-bar video-search-bar--youtube" onSubmit={handleSearchSubmit}>
            <div className="video-search-bar__brand-group">
              <div className="video-search-bar__logo">Play</div>
              <div>
                <p className="video-search-bar__eyebrow">What Next Stream</p>
                <h1 className="video-search-bar__title">Video Education</h1>
              </div>
            </div>
            <div className="video-search-bar__field-wrap">
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="video-search-bar__input"
                placeholder="Search video lessons, reels, classrooms, or skills"
                aria-label="Search video education"
              />
              <button type="submit" className="video-search-bar__button">
                Search
              </button>
            </div>
          </form>

          <div className="video-topic-strip">
            {topicFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`video-topic-strip__chip ${activeFilter === filter ? 'video-topic-strip__chip--active' : ''}`}
                onClick={() => {
                  setActiveFilter(filter);
                  setActiveVideo(null);
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          <Row className="g-4 align-items-start">
            <Col xl={8} lg={7}>
              <div className="video-watch-layout">
                <div className="video-stage video-stage--youtube">
                  {loading && <p className="mb-0 p-4">Loading videos...</p>}
                  {!loading && error && <p className="text-danger mb-0 p-4">{error}</p>}
                  {!loading && !error && !currentVideo && (
                    <p className="mb-0 p-4">No video found for this search. Try lesson, reels, campus, or skills.</p>
                  )}
                  {!loading && !error && currentVideo && getEmbedUrl(currentVideo.videoUrl) && (
                    <>
                      <div className="video-frame-wrap">
                        <iframe
                          src={getEmbedUrl(currentVideo.videoUrl)}
                          title={currentVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div className="video-stage__body video-stage__body--youtube">
                        <span className="name-tag">YouTube Model</span>
                        <h2 className="video-stage__title">{currentVideo.title}</h2>
                        <div className="video-meta-row">
                          <div className="video-channel-card">
                            <div className="video-channel-card__avatar">{currentVideo.channel.slice(0, 2).toUpperCase()}</div>
                            <div>
                              <h3>{currentVideo.channel}</h3>
                              <p>Learning channel for students, parents, and education centers</p>
                            </div>
                          </div>
                          <div className="video-actions-row">
                            <button type="button" className="video-pill-button">
                              Subscribe
                            </button>
                            <button type="button" className="video-pill-button video-pill-button--soft">
                              Share
                            </button>
                            <button type="button" className="video-pill-button video-pill-button--soft">
                              Save
                            </button>
                          </div>
                        </div>
                        <div className="video-description-box">
                          <p className="video-description-box__lead">{currentVideo.description}</p>
                          <p className="mb-0">
                            Watch the selected video in an easy YouTube-style player and switch quickly to related reels,
                            lessons, and campus previews from the right side.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {!loading && !error && currentVideo && !getEmbedUrl(currentVideo.videoUrl) && (
                    <div className="video-stage__body video-stage__body--youtube">
                      <span className="name-tag">Video Education</span>
                      <h2 className="video-stage__title">{currentVideo.title}</h2>
                      <p className="video-stage__text mb-0">
                        This video card is ready, but the video link is missing. Add a YouTube URL in MongoDB or the
                        education center dashboard to play it here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            <Col xl={4} lg={5}>
              <aside className="reels-panel reels-panel--youtube">
                <div className="reels-panel__header reels-panel__header--youtube">
                  <span className="name-tag">Up Next</span>
                  <h2>Recommended videos</h2>
                  <p>Shortlist of related education clips, reels, and classroom previews.</p>
                </div>
                <div className="reels-panel__list">
                  {(recommendedVideos.length ? recommendedVideos : filteredVideos).map((video) => (
                    <VideoPlayerCard
                      key={video.id}
                      video={video}
                      isActive={currentVideo?.id === video.id}
                      onSelect={handleVideoSelect}
                    />
                  ))}
                </div>
              </aside>
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  );
}

