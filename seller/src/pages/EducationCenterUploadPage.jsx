import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  educationCategoryOptions,
  getCategoryKeyFromCourseType,
  getCourseTypeFromCategoryKey,
  getEducationCategoryByKey
} from '../constants/educationCategories';
import { createEducationCenterUpload } from '../services/api';
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

export default function EducationCenterUploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedSession = readStoredPartnerSession();
  const partner = location.state?.partner || storedSession?.partner;
  const token = location.state?.token || storedSession?.token || '';
  const preferredCategoryKey =
    location.state?.preferredCategoryKey || getCategoryKeyFromCourseType(location.state?.preferredCategory || '');
  const [formData, setFormData] = useState({
    partnerId: partner?.id || '',
    categoryKey: preferredCategoryKey,
    image: '',
    profileImage: '',
    educationCenterName: partner?.organizationName || '',
    address: '',
    courseType: getCourseTypeFromCategoryKey(preferredCategoryKey),
    courseCount: '',
    courseList: '',
    description: '',
    promoVideoUrl: '',
    contactEmail: partner?.officialEmail || '',
    phone: partner?.phone || ''
  });
  const [previewImage, setPreviewImage] = useState('');
  const [profilePreviewImage, setProfilePreviewImage] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeCategory = getEducationCategoryByKey(formData.categoryKey);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleCategoryChange = (categoryKey) => {
    setFormData((current) => ({
      ...current,
      categoryKey,
      courseType: getCourseTypeFromCategoryKey(categoryKey)
    }));
    setStatus({ type: '', message: '' });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const image = await readFileAsDataUrl(file);
      setFormData((current) => ({ ...current, image }));
      setPreviewImage(image);
    } catch (_error) {
      setStatus({ type: 'error', message: 'Image could not be loaded. Please try another file.' });
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

    if (
      !formData.educationCenterName.trim() ||
      !formData.categoryKey.trim() ||
      !formData.address.trim() ||
      !formData.courseType.trim() ||
      !String(formData.courseCount).trim()
    ) {
      setStatus({ type: 'error', message: 'Please complete the center name, address, course type, and course count.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await createEducationCenterUpload({
        token,
        ...formData
      });
      setStatus({ type: 'success', message: 'Education center profile uploaded successfully.' });
      setTimeout(() => navigate('/education-center/login'), 1200);
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
          <div className="portal-page__intro">
            <p className="portal-page__eyebrow">Education Center Upload</p>
            <h1>{activeCategory.uploadTitle}</h1>
            <p>
              {activeCategory.uploadDescription} Add the center image, full address, and course details so students can
              find it from the correct navigation bar category.
            </p>

            <div className="portal-summary-card">
              <span className="portal-summary-card__label">Registered account</span>
              <strong>{partner?.organizationName || 'Education center workspace'}</strong>
              <p>{partner?.officialEmail || 'Use the upload form to complete your public center profile.'}</p>
              <p>
                Selected category: {activeCategory.label} ({formData.courseType})
              </p>
            </div>
          </div>

          <div className="portal-form-card">
            <form className="portal-form" onSubmit={handleSubmit}>
              <p className="portal-form__eyebrow">Center Public Profile</p>
              <h2>Education Center Upload Form</h2>

              <div className="center-category-picker">
                <span className="center-category-picker__label">Upload category</span>
                <div className="center-category-picker__buttons" role="group" aria-label="Upload category">
                  {educationCategoryOptions.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`center-category-picker__button ${
                        formData.categoryKey === category.id ? 'center-category-picker__button--active' : ''
                      }`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                <p className="center-category-picker__hint">
                  This upload will be saved in MongoDB and shown under the <strong>{activeCategory.label}</strong> navbar
                  section.
                </p>
              </div>

              <label className="portal-form__field">
                <span>College main image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>

              {previewImage ? <img className="portal-form__preview" src={previewImage} alt="Education center preview" /> : null}

              <label className="portal-form__field">
                <span>College profile image</span>
                <input type="file" accept="image/*" onChange={handleProfileImageChange} />
              </label>

              {profilePreviewImage ? <img className="portal-form__preview portal-form__preview--small" src={profilePreviewImage} alt="Education center profile preview" /> : null}

              <label className="portal-form__field">
                <span>Education center name</span>
                <input
                  type="text"
                  name="educationCenterName"
                  value={formData.educationCenterName}
                  onChange={handleChange}
                  placeholder="classgain Academy"
                />
              </label>

              <label className="portal-form__field">
                <span>Address</span>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full address"
                  rows="3"
                />
              </label>

              <label className="portal-form__field">
                <span>Add course names</span>
                <textarea
                  name="courseList"
                  value={formData.courseList}
                  onChange={handleChange}
                  placeholder="BSc Computer Science, NEET Coaching, Spoken English, Class 10 Science"
                  rows="3"
                />
              </label>

              <div className="portal-form__split">
                <label className="portal-form__field">
                  <span>Course type</span>
                  <input type="text" name="courseType" value={formData.courseType} readOnly />
                </label>

                <label className="portal-form__field">
                  <span>How many education course</span>
                  <input
                    type="number"
                    min="1"
                    name="courseCount"
                    value={formData.courseCount}
                    onChange={handleChange}
                    placeholder="12"
                  />
                </label>
              </div>

              <label className="portal-form__field">
                <span>Center description</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your center, faculty, and student support."
                  rows="4"
                />
              </label>

              <label className="portal-form__field">
                <span>Upload video URL</span>
                <input
                  type="url"
                  name="promoVideoUrl"
                  value={formData.promoVideoUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>

              <div className="portal-form__split">
                <label className="portal-form__field">
                  <span>Contact email</span>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="center@example.com"
                  />
                </label>

                <label className="portal-form__field">
                  <span>Phone number</span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 99999 99999"
                  />
                </label>
              </div>

              {status.message ? <p className={`portal-form__status portal-form__status--${status.type}`}>{status.message}</p> : null}

              <div className="portal-form__actions">
                <button type="submit" className="login-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Upload Education Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
