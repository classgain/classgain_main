import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createVideoUploaderChannel } from '../services/api';
import { readStoredPartnerSession } from '../services/partnerSession';
import './Loginpage-Design.css';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function VideoUploaderChannelPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedSession = readStoredPartnerSession();
  const partner = location.state?.partner || storedSession?.partner;
  const token = location.state?.token || storedSession?.token || '';
  const [formData, setFormData] = useState({
    partnerId: partner?.id || '',
    bannerImage: '',
    profileImage: '',
    channelName: partner?.organizationName || '',
    ownerName: '',
    channelDescription: '',
    videoCategory: 'Career Guidance',
    uploadCount: '',
    totalWatchMembers: '',
    totalEarnings: '',
    boosterPlan: 'Starter Boost',
    introVideoUrl: '',
    reelsVideoUrl: '',
    uploadedVideos: '',
    allowDelete: true,
    contactEmail: partner?.officialEmail || ''
  });
  const [previewImage, setPreviewImage] = useState('');
  const [profilePreviewImage, setProfilePreviewImage] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const bannerImage = await readFileAsDataUrl(file);
      setFormData((current) => ({ ...current, bannerImage }));
      setPreviewImage(bannerImage);
    } catch (_error) {
      setStatus({ type: 'error', message: 'Banner image could not be loaded. Please try another file.' });
    }
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const profileImage = await readFileAsDataUrl(file);
      setFormData((current) => ({ ...current, profileImage }));
      setProfilePreviewImage(profileImage);
    } catch (_error) {
      setStatus({ type: 'error', message: 'Profile image could not be loaded. Please try another file.' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!formData.channelName.trim() || !formData.ownerName.trim() || !formData.introVideoUrl.trim()) {
      setStatus({ type: 'error', message: 'Please enter the channel name, owner name, and intro video URL.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await createVideoUploaderChannel({
        token,
        ...formData
      });
      setStatus({ type: 'success', message: 'Video channel uploaded successfully.' });
      setTimeout(() => navigate('/video-education'), 1200);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-page">
      <section className="portal-page__hero">
        <div className="portal-page__grid">
          <div className="portal-page__intro portal-page__intro--video">
            <p className="portal-page__eyebrow">Video Channel Upload</p>
            <h1>Create your own learning channel like a YouTube education studio</h1>
            <p>
              Register your teaching channel, upload the banner image, add intro and reels video links, and prepare
              your own education stream inside What Next.
            </p>

            <div className="portal-summary-card portal-summary-card--video">
              <span className="portal-summary-card__label">Uploader account</span>
              <strong>{partner?.organizationName || 'Video uploader studio'}</strong>
              <p>{partner?.officialEmail || 'Complete your channel profile to start publishing video education.'}</p>
            </div>
          </div>

          <div className="portal-form-card">
            <form className="portal-form" onSubmit={handleSubmit}>
              <p className="portal-form__eyebrow">Video Education Channel</p>
              <h2>Create Our Own Channel</h2>

              <label className="portal-form__field">
                <span>Channel banner image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>

              {previewImage ? <img className="portal-form__preview" src={previewImage} alt="Video channel banner preview" /> : null}

              <label className="portal-form__field">
                <span>Creator profile image</span>
                <input type="file" accept="image/*" onChange={handleProfileImageChange} />
              </label>

              {profilePreviewImage ? <img className="portal-form__preview portal-form__preview--small" src={profilePreviewImage} alt="Video creator profile preview" /> : null}

              <div className="portal-form__split">
                <label className="portal-form__field">
                  <span>Channel name</span>
                  <input
                    type="text"
                    name="channelName"
                    value={formData.channelName}
                    onChange={handleChange}
                    placeholder="What Next Learning TV"
                  />
                </label>

                <label className="portal-form__field">
                  <span>Owner name</span>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Channel owner"
                  />
                </label>
              </div>

              <label className="portal-form__field">
                <span>Channel description</span>
                <textarea
                  name="channelDescription"
                  value={formData.channelDescription}
                  onChange={handleChange}
                  placeholder="Tell students what your channel teaches."
                  rows="4"
                />
              </label>

              <div className="portal-form__split">
                <label className="portal-form__field">
                  <span>Video category</span>
                  <select name="videoCategory" value={formData.videoCategory} onChange={handleChange}>
                    <option>Career Guidance</option>
                    <option>Exam Preparation</option>
                    <option>Primary Learning</option>
                    <option>Higher Education</option>
                    <option>Skills & Coding</option>
                  </select>
                </label>

                <label className="portal-form__field">
                  <span>How many videos</span>
                  <input
                    type="number"
                    min="1"
                    name="uploadCount"
                    value={formData.uploadCount}
                    onChange={handleChange}
                    placeholder="20"
                  />
                </label>
              </div>

              <div className="portal-form__split">
                <label className="portal-form__field">
                  <span>How many members watching</span>
                  <input
                    type="number"
                    min="0"
                    name="totalWatchMembers"
                    value={formData.totalWatchMembers}
                    onChange={handleChange}
                    placeholder="2500"
                  />
                </label>

                <label className="portal-form__field">
                  <span>How much money earning</span>
                  <input
                    type="number"
                    min="0"
                    name="totalEarnings"
                    value={formData.totalEarnings}
                    onChange={handleChange}
                    placeholder="12000"
                  />
                </label>
              </div>

              <label className="portal-form__field">
                <span>Uploaded video line</span>
                <textarea
                  name="uploadedVideos"
                  value={formData.uploadedVideos}
                  onChange={handleChange}
                  placeholder="Career video one | Reels intro | Live counselling clip"
                  rows="3"
                />
              </label>

              <label className="portal-form__field">
                <span>Intro video URL</span>
                <input
                  type="url"
                  name="introVideoUrl"
                  value={formData.introVideoUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>

              <label className="portal-form__field">
                <span>Reels or short video URL</span>
                <input
                  type="url"
                  name="reelsVideoUrl"
                  value={formData.reelsVideoUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/shorts/..."
                />
              </label>

              <div className="portal-form__split">
                <label className="portal-form__field">
                  <span>Add booster</span>
                  <select name="boosterPlan" value={formData.boosterPlan} onChange={handleChange}>
                    <option>Starter Boost</option>
                    <option>Trending Boost</option>
                    <option>Premium Boost</option>
                  </select>
                </label>

                <label className="portal-form__field portal-form__field--checkbox">
                  <span>Delete option available</span>
                  <input type="checkbox" name="allowDelete" checked={formData.allowDelete} onChange={handleChange} />
                </label>
              </div>

              <label className="portal-form__field">
                <span>Contact email</span>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="video@example.com"
                />
              </label>

              {status.message ? <p className={`portal-form__status portal-form__status--${status.type}`}>{status.message}</p> : null}

              <div className="portal-form__actions">
                <button type="submit" className="login-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Channel...' : 'Upload Video Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
