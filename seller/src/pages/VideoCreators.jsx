import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const creatorVideos = [
  {
    title: 'Higher Education Roadmap 2026',
    platform: 'YouTube Style',
    views: '24.8K',
    earnings: 'Rs 18,400',
    booster: 'Active boost',
    status: 'Published'
  },
  {
    title: 'Campus Tour Quick Reel',
    platform: 'Instagram Reel Style',
    views: '11.2K',
    earnings: 'Rs 7,900',
    booster: 'Recommended boost',
    status: 'Trending'
  },
  {
    title: 'Skill Course Intro Video',
    platform: 'Learning Shorts',
    views: '6.4K',
    earnings: 'Rs 3,500',
    booster: 'Boost available',
    status: 'Draft review'
  }
];

export default function VideoCreators() {
  return (
    <section className="creator-page py-4 py-lg-5">
      <Container fluid="xl">
        <div className="creator-hero">
          <div className="creator-hero__content">
            <span className="name-tag">VideoCreators</span>
            <h1 className="hero-band__title">Creator login, upload control, and earning dashboard</h1>
            <p className="hero-band__description">
              This page is for education video creators who want a YouTube and Instagram style workspace with upload
              details, watch members, video income, delete control, and booster promotion.
            </p>
            <div className="creator-hero__actions">
              
              <Link className="education-details-button education-details-button--secondary" to="/video-uploader-channel">
                Open Creator Details
              </Link>
            </div>
          </div>

          <div className="creator-metric-grid">
            <div className="creator-metric-card">
              <span>Total Uploaded Videos</span>
              <strong>128</strong>
              <p>Full video line scroll with creator-owned content.</p>
            </div>
            <div className="creator-metric-card">
              <span>Watching Members</span>
              <strong>42,560</strong>
              <p>Track how many members are watching each upload.</p>
            </div>
            <div className="creator-metric-card">
              <span>Total Earnings</span>
              <strong>Rs 1,84,300</strong>
              <p>Revenue, channel growth, and boost-ready performance.</p>
            </div>
          </div>
        </div>

        <div className="creator-dashboard">
          <div className="creator-dashboard__panel">
            <div className="reels-panel__header reels-panel__header--youtube">
              <span className="name-tag">Uploaded Videos</span>
              <h2>Scroll creator video line</h2>
              <p>Each card shows views, members, earnings, delete control, and booster status.</p>
            </div>

            <div className="creator-video-list">
              {creatorVideos.map((video) => (
                <article key={video.title} className="creator-video-card">
                  <div className="creator-video-card__thumb">
                    <span>{video.platform}</span>
                  </div>
                  <div className="creator-video-card__body">
                    <div className="creator-video-card__header">
                      <div>
                        <h3>{video.title}</h3>
                        <p>{video.status}</p>
                      </div>
                      <span className="education-card__badge">{video.booster}</span>
                    </div>
                    <div className="creator-video-card__stats">
                      <span>Views {video.views}</span>
                      <span>Earnings {video.earnings}</span>
                      <span>Members watching live</span>
                    </div>
                    <div className="creator-video-card__actions">
                      <button type="button" className="video-pill-button">Boost</button>
                      <button type="button" className="video-pill-button video-pill-button--soft">Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
