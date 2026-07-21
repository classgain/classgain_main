import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { createEducationApplication, fetchEducationItemDetails } from '../services/api';
import { readStudentSession } from '../services/studentSession';

const categoryMap = {
  startingeducation: { key: 'primary', title: 'School', path: '/startingeducation' },
  'starting-education': { key: 'primary', title: 'School', path: '/startingeducation' },
  highereducation: { key: 'secondary', title: 'College', path: '/highereducation' },
  'higher-education': { key: 'secondary', title: 'College', path: '/highereducation' },
  additionaleducation: { key: 'extra', title: 'Coaching Center', path: '/additionaleducation' },
  'additional-education': { key: 'extra', title: 'Coaching Center', path: '/additionaleducation' }
};

function splitList(value) {
  return (value || '')
    .split(/[\n,|]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getInitials(value = 'WN') {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function buildFallbackDetails(item, categoryTitle) {
  const courseNames = splitList(item.courseList);
  const courses = (courseNames.length ? courseNames : [item.badge || categoryTitle, 'Student Guidance', 'Career Support']).map(
    (name, index) => ({
      id: `course-${index}`,
      name,
      duration: index === 0 ? `${item.courseCount || 1} course option${item.courseCount > 1 ? 's' : ''}` : 'Flexible',
      fee: 'Contact center',
      intake: 0,
      status: 'Active'
    })
  );

  return {
    courses,
    activity: [
      { id: 'activity-main', title: 'Campus Activity', image: item.image || item.thumbnail || item.profileImage || '' },
      { id: 'activity-video', title: 'Video Preview', image: item.profileImage || item.image || item.thumbnail || '' },
      { id: 'activity-course', title: 'Course Guidance', image: item.image || item.thumbnail || item.profileImage || '' }
    ],
    scholarships: [
      {
        id: 'scholarship-top-rankers',
        name: 'Top Rankers',
        benefit: 'Scholarship details are managed from the education center dashboard.',
        eligibility: 'Contact admission office'
      },
      {
        id: 'scholarship-sports',
        name: 'Sports Scholarship',
        benefit: 'Sports and talent support can be updated by the center.',
        eligibility: 'Center review'
      },
      {
        id: 'scholarship-government',
        name: 'Government Scholarship',
        benefit: 'Eligible students can ask for available schemes.',
        eligibility: 'Government rules'
      }
    ],
    videos: item.videoUrl
      ? [{ id: 'video-main', title: `${item.title} video`, videoUrl: item.videoUrl, image: item.image || item.thumbnail || '' }]
      : [],
    stats: {
      students: '6000+',
      faculty: '250+',
      courses: `${item.courseCount || courses.length}+`,
      placementRate: '95%'
    }
  };
}

const initialApplicationForm = {
  studentName: '',
  phone: '',
  currentStudy: '',
  completedStudy: '',
  completedStudyPercentage: '',
  address: '',
  scholarshipInterest: false,
  documentName: '',
  documentType: '',
  documentData: ''
};

const MAX_APPLICATION_DOCUMENT_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DetailIcon({ index }) {
  const icons = [
    <path key="car" d="M5 16h14l-1.2-4.2A2.5 2.5 0 0 0 15.4 10H8.6a2.5 2.5 0 0 0-2.4 1.8L5 16Zm2 0v2m10-2v2M8 13h8" />,
    <path key="gear" d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-5v3m0 11v3m8.5-8.5h-3m-11 0h-3m14.4-6.4-2.1 2.1M8.2 15.8l-2.1 2.1m11.8 0-2.1-2.1M8.2 8.2 6.1 6.1" />,
    <path key="building" d="M5 20V6l7-3 7 3v14M9 20v-4h6v4M8 8h1m3 0h1m3 0h1M8 12h1m3 0h1m3 0h1" />,
    <path key="bolt" d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" />,
    <path key="monitor" d="M4 5h16v11H4zM9 20h6m-3-4v4" />,
    <path key="flask" d="M9 3h6M10 3v5l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V3" />,
    <path key="chip" d="M8 8h8v8H8zM4 10h4m8 0h4M4 14h4m8 0h4M10 4v4m4-4v4m-4 8v4m4-4v4" />,
    <path key="plane" d="M3 11.5 21 4l-7.5 18-2.5-7-8-3.5Z" />,
    <path key="leaf" d="M19 4c-7.5.4-12 4.7-12 11.5V20m0-4c7.5-.3 11.4-4.5 12-12" />
  ];

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[index % icons.length]}
    </svg>
  );
}

export default function EducationDetailsPage() {
  const navigate = useNavigate();
  const studentSession = readStudentSession();
  const { categorySlug, itemId } = useParams();
  const category = categoryMap[categorySlug];
  const [item, setItem] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [applicationForm, setApplicationForm] = useState(initialApplicationForm);
  const [applicationStatus, setApplicationStatus] = useState({ type: '', message: '' });
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetails() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchEducationItemDetails(itemId, { signal: controller.signal });
        setItem(data.item || null);
        setDetails(data.details || null);
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setError(loadError.message || 'Unable to load this education center.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => controller.abort();
  }, [itemId]);

  const resolvedDetails = useMemo(() => {
    if (!item) {
      return null;
    }

    return {
      ...buildFallbackDetails(item, category?.title),
      ...(details || {}),
      courses: details?.courses?.length ? details.courses : buildFallbackDetails(item, category?.title).courses,
      activity: details?.activity?.length ? details.activity : buildFallbackDetails(item, category?.title).activity,
      scholarships: details?.scholarships?.length
        ? details.scholarships
        : buildFallbackDetails(item, category?.title).scholarships
    };
  }, [category?.title, details, item]);

  if (!category) {
    return (
      <section className="education-profile-page py-5">
        <Container fluid="xl">
          <Alert variant="warning">Education route not found.</Alert>
        </Container>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="education-profile-page py-5">
        <Container fluid="xl">
          <div className="status-panel">
            <Spinner animation="border" variant="primary" />
            <span>Loading full center details...</span>
          </div>
        </Container>
      </section>
    );
  }

  if (error || !item || !resolvedDetails) {
    return (
      <section className="education-profile-page py-5">
        <Container fluid="xl">
          <Alert variant="danger">{error || 'Education details not found for this card.'}</Alert>
        </Container>
      </section>
    );
  }

  const heroImage = item.image || item.thumbnail || item.profileImage || resolvedDetails.activity?.[0]?.image || '';
  const activityItems = resolvedDetails.activity.slice(0, 6);
  const scholarshipItems = resolvedDetails.scholarships.slice(0, 4);
  const stats = resolvedDetails.stats || {};

  const handleApplyClick = (course) => {
    setSelectedCourse(course);
    setApplicationForm(initialApplicationForm);
    setApplicationStatus({ type: '', message: '' });
  };

  const handleApplicationChange = (event) => {
    const { name, value, type, checked } = event.target;
    setApplicationForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (applicationStatus.type === 'error') {
      setApplicationStatus({ type: '', message: '' });
    }
  };

  const handleDocumentChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setApplicationForm((current) => ({ ...current, documentName: '', documentType: '', documentData: '' }));
      return;
    }
    if (file.size > MAX_APPLICATION_DOCUMENT_BYTES) {
      event.target.value = '';
      setApplicationStatus({ type: 'error', message: 'Supporting document must be 2 MB or smaller.' });
      return;
    }
    try {
      const documentData = await readFileAsDataUrl(file);
      setApplicationForm((current) => ({ ...current, documentName: file.name, documentType: file.type, documentData }));
      setApplicationStatus({ type: '', message: '' });
    } catch (_error) {
      setApplicationStatus({ type: 'error', message: 'The supporting document could not be loaded.' });
    }
  };

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();

    if (!selectedCourse) {
      return;
    }

    if (!studentSession?.token) {
      navigate('/student-login', { state: { message: 'Please login before applying to an education center.' } });
      return;
    }

    if (
      !applicationForm.studentName.trim() ||
      !applicationForm.phone.trim() ||
      !applicationForm.currentStudy.trim() ||
      !applicationForm.completedStudy.trim() ||
      !applicationForm.completedStudyPercentage.trim() ||
      !applicationForm.address.trim()
    ) {
      setApplicationStatus({ type: 'error', message: 'Please complete all application fields.' });
      return;
    }

    try {
      setIsApplying(true);
      const data = await createEducationApplication(itemId, {
        ...applicationForm,
        course: selectedCourse.name,
        statement: `${applicationForm.studentName} applied for ${selectedCourse.name}.`
      }, studentSession.token);

      setApplicationStatus({
        type: 'success',
        message: data.message || 'Application submitted successfully.'
      });
      setApplicationForm(initialApplicationForm);
      setTimeout(() => navigate('/student-login', { state: { panel: 'applications', message: 'Application submitted successfully.' } }), 900);
    } catch (submitError) {
      setApplicationStatus({
        type: 'error',
        message: submitError.message || 'Unable to submit the application right now.'
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <section className="education-profile-page">
      <div className="education-profile-hero" style={heroImage ? { backgroundImage: `url("${heroImage}")` } : undefined}>
        <Link to={category.path} className="education-profile-hero__arrow education-profile-hero__arrow--left" aria-label={`Back to ${category.title}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        {item.videoUrl ? (
          <a href={item.videoUrl} target="_blank" rel="noreferrer" className="education-profile-hero__arrow education-profile-hero__arrow--right" aria-label="Open video">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 6v12l10-6-10-6Z" />
            </svg>
          </a>
        ) : null}
        <div className="education-profile-hero__overlay">
          <span className="education-profile-hero__badge">{item.level || category.title}</span>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
          <a href="#available-courses" className="education-profile-hero__button">
            Explore More
          </a>
          <div className="education-profile-hero__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <Container fluid="xl" className="education-profile-content">
        <section className="profile-section" id="available-courses">
          <div className="profile-section__heading">
            <h2>Available Courses</h2>
          </div>
          <div className="available-course-grid">
            {resolvedDetails.courses.slice(0, 9).map((course, index) => (
              <article key={course.id || course.name} className="available-course-card">
                <span className="available-course-card__icon">
                  <DetailIcon index={index} />
                </span>
                <div>
                  <h3>{course.name}</h3>
                  <p>{course.duration || 'Flexible program'} . {course.fee || 'Contact center'}</p>
                  <span>Intake: {course.intake || 'Contact'} . Status: {course.status || 'Active'}</span>
                </div>
                <button type="button" className="available-course-card__apply" onClick={() => handleApplyClick(course)}>
                  Apply Now
                </button>
              </article>
            ))}
          </div>

          {selectedCourse ? (
            <div className="course-apply-modal" role="dialog" aria-modal="true" aria-labelledby="course-apply-title" onMouseDown={() => setSelectedCourse(null)}>
            <div className="course-apply-panel" onMouseDown={(event) => event.stopPropagation()}>
              <div className="course-apply-panel__header">
                <div>
                  <span>{item.title} · Application Form</span>
                  <h3 id="course-apply-title">{selectedCourse.name}</h3>
                </div>
                <button type="button" onClick={() => setSelectedCourse(null)} aria-label="Close application form">
                  Close
                </button>
              </div>

              <form className="course-apply-form" onSubmit={handleApplicationSubmit}>
                <label>
                  <span>Student name</span>
                  <input name="studentName" value={applicationForm.studentName} onChange={handleApplicationChange} placeholder="Enter student name" />
                </label>
                <label>
                  <span>Phone number</span>
                  <input name="phone" value={applicationForm.phone} onChange={handleApplicationChange} placeholder="Enter phone number" />
                </label>
                <label>
                  <span>Current study</span>
                  <input name="currentStudy" value={applicationForm.currentStudy} onChange={handleApplicationChange} placeholder="Example: 12th, Diploma, B.Sc" />
                </label>
                <label>
                  <span>Completed study</span>
                  <input name="completedStudy" value={applicationForm.completedStudy} onChange={handleApplicationChange} placeholder="Example: 10th, 12th, Diploma" />
                </label>
                <label>
                  <span>Completed study percentage</span>
                  <input name="completedStudyPercentage" value={applicationForm.completedStudyPercentage} onChange={handleApplicationChange} placeholder="Example: 82%" />
                </label>
                <label className="course-apply-form__wide">
                  <span>Student address</span>
                  <textarea name="address" value={applicationForm.address} onChange={handleApplicationChange} rows="3" placeholder="Full student address" />
                </label>
                <label className="course-apply-form__wide">
                  <span>Supporting document</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handleDocumentChange} />
                  <small>PDF, JPG, JPEG, or PNG · maximum 2 MB{applicationForm.documentName ? ` · ${applicationForm.documentName}` : ''}</small>
                </label>
                <label className="course-apply-form__check">
                  <input
                    type="checkbox"
                    name="scholarshipInterest"
                    checked={applicationForm.scholarshipInterest}
                    onChange={handleApplicationChange}
                  />
                  <span>Apply for scholarship</span>
                </label>

                {applicationStatus.message ? (
                  <p className={`course-apply-form__status course-apply-form__status--${applicationStatus.type}`}>
                    {applicationStatus.message}
                  </p>
                ) : null}

                <div className="course-apply-form__actions">
                  <button type="submit" disabled={isApplying}>
                    {isApplying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
            </div>
          ) : null}
        </section>

        <section className="profile-section">
          <div className="profile-section__heading">
            <h2>Center Activity</h2>
          </div>
          <div className="center-activity-strip">
            {activityItems.map((activity) => (
              <article key={activity.id || activity.title} className="center-activity-card">
                {activity.image ? (
                  <img src={activity.image} alt={activity.title} loading="lazy" />
                ) : (
                  <div className="center-activity-card__empty">{getInitials(activity.title)}</div>
                )}
                <h3>{activity.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section__heading">
            <h2>Scholarship Details</h2>
          </div>
          <div className="scholarship-detail-grid">
            {scholarshipItems.map((scholarship, index) => (
              <article key={scholarship.id || scholarship.name} className="scholarship-detail-card">
                <span className={`scholarship-detail-card__mark scholarship-detail-card__mark--${index % 4}`}>
                  <DetailIcon index={index + 4} />
                </span>
                <h3>{scholarship.name}</h3>
                <p>{scholarship.benefit || scholarship.eligibility || 'Scholarship support available from this center.'}</p>
              </article>
            ))}
          </div>
        </section>
      </Container>

      <div className="education-profile-footer">
        <Container fluid="xl">
          <div className="education-profile-stats">
            <div>
              <strong>{stats.students || '6000+'}</strong>
              <span>Students</span>
            </div>
            <div>
              <strong>{stats.faculty || '250+'}</strong>
              <span>Faculty</span>
            </div>
            <div>
              <strong>{stats.courses || `${item.courseCount || resolvedDetails.courses.length}+`}</strong>
              <span>Courses</span>
            </div>
            <div>
              <strong>{stats.placementRate || '95%'}</strong>
              <span>Placement Rate</span>
            </div>
          </div>
          <div className="education-profile-footer__grid">
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <div>
              <h3>Admissions</h3>
              <p>{splitList(item.courseList)[0] || item.badge || category.title}</p>
              <p>{item.contactEmail || 'Contact email will be updated soon'}</p>
            </div>
            <div>
              <h3>Contact Us</h3>
              <p>{item.address || 'Address will be updated soon'}</p>
              <p>{item.phone || 'Phone number will be updated soon'}</p>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
