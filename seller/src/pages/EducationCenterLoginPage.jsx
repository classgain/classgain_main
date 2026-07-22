import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import campusFrontImage from '../assets/cms college image .png';
import campusLogoImage from '../assets/cms logo.png';
import galleryImageOne from '../assets/college1.png';
import galleryImageTwo from '../assets/college2.png';
import galleryImageThree from '../assets/college3.png';
import {
  createEducationCenterCourse,
  createEducationCenterGalleryImage,
  createEducationCenterScholarship,
  createEducationCenterVideo,
  deleteEducationCenterCourse,
  deleteEducationCenterGalleryImage,
  deleteEducationCenterScholarship,
  deleteEducationCenterVideo,
  fetchEducationCenterDashboard,
  loginEducationCenter,
  updateEducationCenterApplication,
  updateEducationCenterCourse,
  updateEducationCenterScholarship
} from '../services/api';

const MAX_DASHBOARD_UPLOAD_BYTES = 100 * 1024 * 1024;
import {
  buildPartnerSession,
  clearPartnerSession,
  readStoredPartnerSession,
  savePartnerSession
} from '../services/partnerSession';
import { educationCategoryOptions } from '../constants/educationCategories';
import './Loginpage-Design.css';

const publicSiteUrl = (import.meta.env.VITE_CLIENT_URL || '/').replace(/\/$/, '');

const sidebarLinks = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'profile', label: 'College Profile', icon: 'profile' },
  { key: 'courses', label: 'Manage Courses', icon: 'courses' },
  { key: 'scholarships', label: 'Manage Scholarships', icon: 'scholarships' },
  { key: 'applications', label: 'Student Applications', icon: 'applications' },
  { key: 'images', label: 'Images', icon: 'image' },
  { key: 'videos', label: 'Videos', icon: 'video' }
];

const fallbackOverview = {
  totalCourses: 4,
  applications: 4,
  scholarships: 4,
  enquiries: 2
};

const fallbackImages = [
  { id: 'fallback-image-1', title: 'Campus Front', image: galleryImageOne },
  { id: 'fallback-image-2', title: 'Library Session', image: galleryImageTwo },
  { id: 'fallback-image-3', title: 'Faculty Support', image: galleryImageThree }
];

const fallbackVideos = [
  {
    id: 'fallback-video-1',
    title: 'College Overview',
    duration: '1:45',
    image: campusFrontImage,
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw'
  },
  {
    id: 'fallback-video-2',
    title: 'Campus Tour',
    duration: '2:30',
    image: galleryImageTwo,
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw'
  }
];

const fallbackCourses = [
  { id: 'course-1', name: 'B.E - Mechanical Engineering', duration: '4 Years', intake: 60, fee: 'Rs. 75,000', status: 'Active' },
  { id: 'course-2', name: 'B.E - Civil Engineering', duration: '4 Years', intake: 60, fee: 'Rs. 75,000', status: 'Active' },
  { id: 'course-3', name: 'B.E - Computer Science Engineering', duration: '4 Years', intake: 60, fee: 'Rs. 85,000', status: 'Active' },
  { id: 'course-4', name: 'B.Tech - Information Technology', duration: '4 Years', intake: 60, fee: 'Rs. 85,000', status: 'Inactive' }
];

const fallbackScholarships = [
  { id: 'scholarship-1', name: 'Merit Scholarship 2024', type: 'Merit Based', eligibility: '80% & above in 12th', benefit: '50% Tuition Fee', status: 'Active' },
  { id: 'scholarship-2', name: 'Sports Scholarship', type: 'Sports Based', eligibility: 'State / National Level', benefit: '30% Tuition Fee', status: 'Active' },
  { id: 'scholarship-3', name: 'Government Scholarship', type: 'Government', eligibility: 'As per Govt. Norms', benefit: 'Full / Partial Fee', status: 'Active' },
  { id: 'scholarship-4', name: 'Special Scholarship (SC/ST)', type: 'Category Based', eligibility: 'SC / ST Students', benefit: '100% Tuition Fee', status: 'Inactive' }
];

const fallbackApplications = [
  {
    id: 'application-1',
    studentName: 'Arun K',
    course: 'B.E - Mechanical Engineering',
    mobile: '9876543210',
    email: 'arun@gmail.com',
    status: 'New',
    appliedOn: '18 May 2026',
    address: '14 Lake View Street, Salem, Tamil Nadu',
    currentStudy: 'Class 12 completed',
    completedStudy: 'Class 12 - State Board',
    completedStudyPercentage: '86%',
    previousEducation: 'Class 12 - State Board',
    marks: '86%',
    scholarshipInterest: true,
    scholarshipName: 'Merit Scholarship 2024',
    statement: 'Looking for a mechanical engineering seat with hostel support and scholarship assistance.',
    notes: 'Parent called for campus visit.'
  },
  {
    id: 'application-2',
    studentName: 'Priya S',
    course: 'B.E - Computer Science Engineering',
    mobile: '9123456780',
    email: 'priya.s@gmail.com',
    status: 'Under Review',
    appliedOn: '17 May 2026',
    address: '22 Bharathi Nagar, Erode, Tamil Nadu',
    currentStudy: 'Class 12 completed',
    completedStudy: 'Class 12 - CBSE',
    completedStudyPercentage: '91%',
    previousEducation: 'Class 12 - CBSE',
    marks: '91%',
    scholarshipInterest: true,
    scholarshipName: 'Sports Scholarship',
    statement: 'Interested in CSE with a strong scholarship option and coding club support.',
    notes: 'Documents verified.'
  }
];

const applicationReplyTemplates = {
  contact: 'Thank you for your application. Our admission team will contact you shortly using your registered phone number. Please keep your academic documents ready for verification.',
  join: 'Your application is accepted and we are happy to invite you to join our education center. Please contact the admission office to complete document verification and enrollment.',
  scholarship: 'Your scholarship request is under positive consideration. Please submit the required mark sheets, income certificate, and supporting documents so our scholarship team can complete the review.',
  ineligible: 'Thank you for applying. Based on the information currently provided, you are not eligible for this course or scholarship. You may contact our admission team to discuss other suitable programs.',
  details: 'We need more information to continue your application. Please provide the missing academic documents, correct percentage details, and contact information. Our team will review the application after receiving them.'
};

const fallbackActivity = [
  { id: 'activity-1', icon: 'applications', title: 'New application from Arun K', timeLabel: '18 May 2026' },
  { id: 'activity-2', icon: 'scholarship', title: 'Merit Scholarship 2024 is active', timeLabel: 'Recently updated' },
  { id: 'activity-3', icon: 'courses', title: 'Mechanical Engineering admissions are open', timeLabel: 'Dashboard sync' }
];

const initialAuthForm = {
  organizationName: '',
  contactPerson: '',
  governmentCode: '',
  officialEmail: '',
  phone: '',
  password: '',
  confirmPassword: ''
};

const initialCourseForm = {
  name: '',
  duration: '',
  intake: '',
  fee: ''
};

const initialScholarshipForm = {
  name: '',
  type: '',
  eligibility: '',
  benefit: ''
};

const initialImageForm = {
  title: '',
  image: '',
  setAsHero: true,
  setAsProfile: false
};

const initialVideoForm = {
  title: '',
  duration: '',
  videoUrl: '',
  image: ''
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DashboardIcon({ name }) {
  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    profile: (
      <>
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </>
    ),
    courses: (
      <>
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v14.5A1.5 1.5 0 0 0 18.5 17H6.5A2.5 2.5 0 0 0 4 19.5Z" />
        <path d="M6.5 17A2.5 2.5 0 0 0 4 19.5A2.5 2.5 0 0 0 6.5 22H20" />
      </>
    ),
    scholarships: (
      <>
        <path d="M12 4 4 8l8 4 8-4-8-4Z" />
        <path d="M7 10v4.5A7.5 7.5 0 0 0 12 17a7.5 7.5 0 0 0 5-2.5V10" />
        <path d="M10 17v4l2-1.5 2 1.5v-4" />
      </>
    ),
    applications: (
      <>
        <path d="M9 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
        <path d="M17 12a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 17 12Z" />
        <path d="M4 20a5 5 0 0 1 10 0" />
        <path d="M14 20a4 4 0 0 1 8 0" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
        <path d="m7 17 4-4 3 3 3-4 4 5" />
      </>
    ),
    video: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17v2a2 2 0 0 0 2 2h6" />
        <path d="M18 12H7" />
        <path d="m14 8 4 4-4 4" />
        <path d="M10 7V5a2 2 0 0 1 2-2h6" />
      </>
    ),
    detail: (
      <>
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="9" />
      </>
    )
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[name] || icons.dashboard}
    </svg>
  );
}

function DashboardStatusBadge({ status }) {
  return <span className={`education-status-badge education-status-badge--${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>;
}

function normalizeDashboardData(dashboard) {
  if (!dashboard) {
    return {
      partner: null,
      profile: {
        id: 'demo-education-center',
        categoryKey: 'secondary',
        centerName: 'CMS Engineering College',
        address: 'CMS Nagar, Eranapuram (Post), Namakkal (TK), Namakkal (DT), Tamil Nadu - 636138',
        heroImage: campusFrontImage,
        logoImage: campusLogoImage,
        website: 'www.cmsengg.edu.in',
        contactEmail: 'info@cmsengg.edu.in',
        phone: '+91 98765 43210',
        description: 'A student-focused higher education campus with guided programs, practical labs, and scholarship support.',
        courseType: 'Higher Education',
        courseCount: fallbackCourses.length,
        courseList: fallbackCourses.map((course) => course.name).join(', ')
      },
      overview: fallbackOverview,
      recentActivity: fallbackActivity,
      courses: fallbackCourses,
      images: fallbackImages,
      videos: fallbackVideos,
      applications: fallbackApplications,
      scholarships: fallbackScholarships
    };
  }

  const images = dashboard.images?.length
    ? dashboard.images.map((item, index) => ({
        ...item,
        image: item.image || fallbackImages[index % fallbackImages.length].image
      }))
    : fallbackImages;
  const videos = dashboard.videos?.length
    ? dashboard.videos.map((item, index) => ({
        ...item,
        image: item.image || images[0]?.image || fallbackVideos[index % fallbackVideos.length].image
      }))
    : fallbackVideos;

  return {
    partner: dashboard.partner || null,
    profile: {
      id: dashboard.profile?.id || 'demo-education-center',
      categoryKey: dashboard.profile?.categoryKey || 'secondary',
      centerName: dashboard.profile?.centerName || 'CMS Engineering College',
      address: dashboard.profile?.address || 'CMS Nagar, Eranapuram (Post), Namakkal (TK), Namakkal (DT), Tamil Nadu - 636138',
      heroImage: dashboard.profile?.heroImage || images[0]?.image || campusFrontImage,
      logoImage: dashboard.profile?.logoImage || images[1]?.image || campusLogoImage,
      website: dashboard.profile?.website || 'www.cmsengg.edu.in',
      contactEmail: dashboard.profile?.contactEmail || 'info@cmsengg.edu.in',
      phone: dashboard.profile?.phone || '+91 98765 43210',
      description:
        dashboard.profile?.description ||
        'A student-focused higher education campus with guided programs, practical labs, and scholarship support.',
      courseType: dashboard.profile?.courseType || 'Higher Education',
      courseCount: dashboard.profile?.courseCount || dashboard.courses?.length || fallbackCourses.length,
      courseList: dashboard.profile?.courseList || (dashboard.courses || []).map((course) => course.name).join(', ')
    },
    overview: { ...fallbackOverview, ...(dashboard.overview || {}) },
    recentActivity: dashboard.recentActivity?.length ? dashboard.recentActivity : fallbackActivity,
    courses: dashboard.courses?.length ? dashboard.courses : fallbackCourses,
    images,
    videos,
    applications: dashboard.applications?.length ? dashboard.applications : fallbackApplications,
    scholarships: dashboard.scholarships?.length ? dashboard.scholarships : fallbackScholarships
  };
}

function DetailItem({ label, value }) {
  return (
    <div className="education-detail-item">
      <span>{label}</span>
      <strong>{value || 'Not provided yet'}</strong>
    </div>
  );
}

export default function EducationCenterLoginPage() {
  const [authMode, setAuthMode] = useState('signin');
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [session, setSession] = useState(() => readStoredPartnerSession());
  const [dashboard, setDashboard] = useState(null);
  const [selectedNav, setSelectedNav] = useState('dashboard');
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [applicationStatusDraft, setApplicationStatusDraft] = useState('New');
  const [applicationNotesDraft, setApplicationNotesDraft] = useState('');
  const [applicationReplyDraft, setApplicationReplyDraft] = useState('');
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [scholarshipForm, setScholarshipForm] = useState(initialScholarshipForm);
  const [imageForm, setImageForm] = useState(initialImageForm);
  const [videoForm, setVideoForm] = useState(initialVideoForm);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const [isDashboardLoading, setIsDashboardLoading] = useState(() => Boolean(readStoredPartnerSession()?.token));
  const [status, setStatus] = useState(() => ({
    type: 'info',
    message: readStoredPartnerSession()?.token ? 'Restoring your education center session...' : ''
  }));

  const dashboardRef = useRef(null);
  const profileRef = useRef(null);
  const coursesRef = useRef(null);
  const scholarshipsRef = useRef(null);
  const applicationsRef = useRef(null);
  const imagesRef = useRef(null);
  const videosRef = useRef(null);

  const resolvedDashboard = useMemo(() => normalizeDashboardData(dashboard), [dashboard]);
  const selectedApplication = useMemo(
    () => resolvedDashboard.applications.find((application) => application.id === selectedApplicationId) || null,
    [resolvedDashboard.applications, selectedApplicationId]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!session?.token) {
        setDashboard(null);
        setIsDashboardLoading(false);
        return;
      }

      try {
        setIsDashboardLoading(true);
        const data = await fetchEducationCenterDashboard({ token: session.token });

        if (!isMounted) {
          return;
        }

        setDashboard(data.dashboard || null);
        setStatus((currentStatus) =>
          currentStatus.message
            ? currentStatus
            : {
                type: 'success',
                message: `Welcome back, ${session.partner.organizationName}.`
              }
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        clearPartnerSession();
        setSession(null);
        setDashboard(null);
        setStatus({
          type: 'error',
          message: error.message || 'Education center session expired. Please sign in again.'
        });
      } finally {
        if (isMounted) {
          setIsDashboardLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    if (!resolvedDashboard.applications.length) {
      setSelectedApplicationId('');
      return;
    }

    if (!selectedApplicationId || !resolvedDashboard.applications.some((item) => item.id === selectedApplicationId)) {
      setSelectedApplicationId(resolvedDashboard.applications[0].id);
    }
  }, [resolvedDashboard.applications, selectedApplicationId]);

  useEffect(() => {
    if (!selectedApplication) {
      return;
    }

    setApplicationStatusDraft(selectedApplication.status || 'New');
    setApplicationNotesDraft(selectedApplication.notes || '');
    setApplicationReplyDraft(selectedApplication.reply || '');
  }, [selectedApplication]);

  const sectionRefs = {
    dashboard: dashboardRef,
    profile: profileRef,
    courses: coursesRef,
    scholarships: scholarshipsRef,
    applications: applicationsRef,
    images: imagesRef,
    videos: videosRef
  };

  const statusTone = status.type || 'info';

  const authHeading = 'Education Center Sign In';

  const uploadLinkState = {
    partner: session?.partner,
    token: session?.token,
    preferredCategoryKey: resolvedDashboard.profile.categoryKey
  };

  const runDashboardAction = async (busyKey, action, resetForm) => {
    setBusyAction(busyKey);
    setStatus({ type: '', message: '' });

    try {
      const data = await action();

      if (data.dashboard) {
        setDashboard(data.dashboard);
      }

      if (typeof resetForm === 'function') {
        resetForm();
      }

      setStatus({
        type: 'success',
        message: data.message || 'Saved successfully.'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to save the update right now.'
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleNavClick = (key) => {
    setSelectedNav(key);
    const target = sectionRefs[key]?.current;

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));

    if (status.type === 'error') {
      setStatus({ type: '', message: '' });
    }
  };

  const handleAuthModeChange = (mode) => {
    setAuthMode(mode);
    setAuthForm(initialAuthForm);
    setStatus({ type: '', message: '' });
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const officialEmail = authForm.officialEmail.trim().toLowerCase();
    const password = authForm.password.trim();

    if (!officialEmail || !password) {
      setStatus({ type: 'error', message: 'Email or username and password are required.' });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    try {
      setIsAuthSubmitting(true);

      const responseData = await loginEducationCenter({
        login: officialEmail,
        password
      });

      const nextSession = buildPartnerSession(responseData);

      if (!nextSession) {
        throw new Error('Education center session could not be created. Please try again.');
      }

      savePartnerSession(nextSession);
      setSession(nextSession);
      setDashboard(responseData.dashboard || null);
      setAuthForm(initialAuthForm);
      setStatus({
        type: 'success',
        message: 'Education center sign in successful.'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to continue with the education center account.'
      });
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearPartnerSession();
    setSession(null);
    setDashboard(null);
    setSelectedNav('dashboard');
    setSelectedApplicationId('');
    setAuthMode('signin');
    setAuthForm(initialAuthForm);
    setStatus({
      type: 'info',
      message: 'You have been signed out of the education center portal.'
    });
  };

  const handleCourseFormChange = (event) => {
    const { name, value } = event.target;
    setCourseForm((current) => ({ ...current, [name]: value }));
  };

  const handleScholarshipFormChange = (event) => {
    const { name, value } = event.target;
    setScholarshipForm((current) => ({ ...current, [name]: value }));
  };

  const handleImageFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setImageForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVideoFormChange = (event) => {
    const { name, value } = event.target;
    setVideoForm((current) => ({ ...current, [name]: value }));
  };

  const handleImageUploadChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }
    if (file.size > MAX_DASHBOARD_UPLOAD_BYTES) {
      event.target.value = '';
      setStatus({ type: 'error', message: 'Image must be 100 MB or smaller.' });
      return;
    }

    try {
      const image = await readFileAsDataUrl(file);
      setImageForm((current) => ({ ...current, image }));
      setImagePreview(image);
    } catch (_error) {
      setStatus({ type: 'error', message: 'Image could not be loaded. Please try another file.' });
    }
  };

  const handleVideoThumbnailChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }
    if (file.size > MAX_DASHBOARD_UPLOAD_BYTES) {
      event.target.value = '';
      setStatus({ type: 'error', message: 'Thumbnail must be 100 MB or smaller.' });
      return;
    }

    try {
      const image = await readFileAsDataUrl(file);
      setVideoForm((current) => ({ ...current, image }));
      setVideoPreview(image);
    } catch (_error) {
      setStatus({ type: 'error', message: 'Video preview image could not be loaded. Please try another file.' });
    }
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();

    if (!courseForm.name.trim()) {
      setStatus({ type: 'error', message: 'Please enter the course name.' });
      return;
    }

    await runDashboardAction(
      'course-create',
      () =>
        createEducationCenterCourse({
          token: session.token,
          ...courseForm
        }),
      () => setCourseForm(initialCourseForm)
    );
  };

  const handleScholarshipSubmit = async (event) => {
    event.preventDefault();

    if (!scholarshipForm.name.trim()) {
      setStatus({ type: 'error', message: 'Please enter the scholarship name.' });
      return;
    }

    await runDashboardAction(
      'scholarship-create',
      () =>
        createEducationCenterScholarship({
          token: session.token,
          ...scholarshipForm
        }),
      () => setScholarshipForm(initialScholarshipForm)
    );
  };

  const handleImageSubmit = async (event) => {
    event.preventDefault();

    if (!imageForm.image) {
      setStatus({ type: 'error', message: 'Please choose an image to upload.' });
      return;
    }

    await runDashboardAction(
      'image-create',
      () =>
        createEducationCenterGalleryImage({
          token: session.token,
          ...imageForm
        }),
      () => {
        setImageForm(initialImageForm);
        setImagePreview('');
      }
    );
  };

  const handleVideoSubmit = async (event) => {
    event.preventDefault();

    if (!videoForm.videoUrl.trim()) {
      setStatus({ type: 'error', message: 'Please enter the video URL.' });
      return;
    }

    await runDashboardAction(
      'video-create',
      () =>
        createEducationCenterVideo({
          token: session.token,
          ...videoForm
        }),
      () => {
        setVideoForm(initialVideoForm);
        setVideoPreview('');
      }
    );
  };

  const handleCourseStatusToggle = async (course) => {
    await runDashboardAction('course-status', () =>
      updateEducationCenterCourse(course.id, {
        token: session.token,
        status: course.status === 'Active' ? 'Inactive' : 'Active'
      })
    );
  };

  const handleCourseDelete = async (courseId) => {
    await runDashboardAction('course-delete', () => deleteEducationCenterCourse(courseId, session.token));
  };

  const handleScholarshipStatusToggle = async (scholarship) => {
    await runDashboardAction('scholarship-status', () =>
      updateEducationCenterScholarship(scholarship.id, {
        token: session.token,
        status: scholarship.status === 'Active' ? 'Inactive' : 'Active'
      })
    );
  };

  const handleScholarshipDelete = async (scholarshipId) => {
    await runDashboardAction('scholarship-delete', () =>
      deleteEducationCenterScholarship(scholarshipId, session.token)
    );
  };

  const handleImageDelete = async (imageId) => {
    await runDashboardAction('image-delete', () => deleteEducationCenterGalleryImage(imageId, session.token));
  };

  const handleVideoDelete = async (videoId) => {
    await runDashboardAction('video-delete', () => deleteEducationCenterVideo(videoId, session.token));
  };

  const handleApplicationSave = async () => {
    if (!selectedApplicationId) {
      return;
    }

    await runDashboardAction('application-update', () =>
      updateEducationCenterApplication(selectedApplicationId, {
        token: session.token,
        status: applicationStatusDraft,
        notes: applicationNotesDraft,
        reply: applicationReplyDraft
      })
    );
  };

  if (!session?.token) {
    return (
      <div className="education-auth-page">
        {status.message ? (
          <div className={`dashboard-page__status dashboard-page__status--${statusTone}`}>{status.message}</div>
        ) : null}

        <div className="education-auth-grid">
          <section className="education-auth-intro">
            <p className="education-auth-intro__eyebrow">Education Center Login</p>
            <h1>Sign in after admin approval</h1>
            <p>
              Register your education center, wait for admin approval, then manage course lists, scholarship offers,
              student applications, image uploads, and video uploads from one portal.
            </p>

            <div className="education-auth-metrics">
              <article className="education-auth-metric">
                <strong>Courses</strong>
                <span>Add, activate, inactivate, and delete course rows.</span>
              </article>
              <article className="education-auth-metric">
                <strong>Students</strong>
                <span>View full student details and update application status.</span>
              </article>
              <article className="education-auth-metric">
                <strong>Media</strong>
                <span>Upload center images and videos from the dashboard.</span>
              </article>
            </div>

            <div className="education-auth-highlights">
              <div className="education-auth-highlight">
                <strong>Node + Express API</strong>
                <span>Education center actions now save through protected API routes.</span>
              </div>
              <div className="education-auth-highlight">
                <strong>MongoDB connection</strong>
                <span>Dashboard data is prepared for persistent courses, scholarships, and applications.</span>
              </div>
              <div className="education-auth-highlight">
                <strong>Public center support</strong>
                <span>Profile saves keep the public center card synced with your latest dashboard data.</span>
              </div>
            </div>

            <div className="dashboard-page__actions">
              <a href={publicSiteUrl} className="dashboard-page__button">
                View Public Centers
              </a>
              <Link to="/education-center/help" className="dashboard-page__button dashboard-page__button--ghost">
                Need Help
              </Link>
            </div>

            <div className="education-category-admin-actions">
              {educationCategoryOptions.map((category) => (
                <a
                  key={category.id}
                  href={`${publicSiteUrl}/${category.id === 'primary' ? 'startingeducation' : category.id === 'secondary' ? 'highereducation' : 'additionaleducation'}`}
                  className="education-category-admin-actions__button"
                >
                  {category.label}
                </a>
              ))}
            </div>
          </section>

          <section className="education-auth-card">
            <div className="education-auth-card__toggle" role="tablist" aria-label="Education center access mode">
              <button
                type="button"
                className={
                  authMode === 'signin'
                    ? 'education-auth-card__toggle-button education-auth-card__toggle-button--active'
                    : 'education-auth-card__toggle-button'
                }
                onClick={() => handleAuthModeChange('signin')}
              >
                Sign In
              </button>
              <Link to="/education-center/register" className="education-auth-card__toggle-button text-center text-decoration-none">
                Register
              </Link>
            </div>

            <form className="education-auth-form" onSubmit={handleAuthSubmit}>
              <p className="portal-form__eyebrow">Center Portal Access</p>
              <h2>{authHeading}</h2>
              <p className="education-auth-form__text">
                Approved education centers can sign in to manage courses, scholarship offers, applications, and media
                uploads.
              </p>

              <label className="portal-form__field">
                <span>Email or username</span>
                <input
                  type="text"
                  name="officialEmail"
                  value={authForm.officialEmail}
                  onChange={handleAuthChange}
                  placeholder="center@example.com"
                  autoComplete="username"
                />
              </label>

              <label className="portal-form__field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="current-password"
                />
              </label>

              <div className="education-auth-form__meta">
                <span>New registrations stay pending until the admin approves the education center account.</span>
              </div>

              <div className="portal-form__actions">
                <button type="submit" className="login-submit" disabled={isAuthSubmitting}>
                  {isAuthSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="education-dashboard-page">
      {isDashboardLoading || status.message ? (
        <div className={`dashboard-page__status dashboard-page__status--${statusTone}`}>
          {isDashboardLoading ? 'Connecting education center dashboard...' : status.message}
        </div>
      ) : null}

      <div className="dashboard-page__hero">
        <div>
          <span className="dashboard-page__eyebrow">Education Center Dashboard</span>
          <h1 className="dashboard-page__title">{resolvedDashboard.profile.centerName}</h1>
          <p className="dashboard-page__text">
            Manage public profile content, courses, scholarship offers, student applications, and media uploads from
            your center workspace.
          </p>
        </div>

        <div className="dashboard-page__actions">
          {educationCategoryOptions.map((category) => (
            <Link
              key={category.id}
              to="/education-center-upload"
              state={{
                ...uploadLinkState,
                preferredCategoryKey: category.id
              }}
              className="dashboard-page__button dashboard-page__button--ghost"
            >
              {category.label}
            </Link>
          ))}
          <button type="button" className="dashboard-page__button" onClick={() => handleNavClick('applications')}>
            View Student Details
          </button>
          <button type="button" className="dashboard-page__button dashboard-page__button--ghost" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="education-dashboard-shell">
        <aside className="education-sidebar">
          <div className="education-sidebar__brand">
            <span className="education-sidebar__brand-mark">classgain</span>
            <span className="education-sidebar__brand-subtitle">{resolvedDashboard.profile.courseType}</span>
          </div>

          <div className="education-sidebar__meta">
            <strong>{session.partner.organizationName}</strong>
            <span>{session.partner.officialEmail}</span>
          </div>

          <nav className="education-sidebar__nav" aria-label="Education dashboard">
            {sidebarLinks.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`education-sidebar__link ${
                  selectedNav === item.key ? 'education-sidebar__link--active' : ''
                }`}
                onClick={() => handleNavClick(item.key)}
              >
                <span className="education-sidebar__icon">
                  <DashboardIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button type="button" className="education-sidebar__logout" onClick={handleLogout}>
            <span className="education-sidebar__icon">
              <DashboardIcon name="logout" />
            </span>
            <span>Logout</span>
          </button>
        </aside>

        <div className="education-dashboard-main">
          <div className="education-dashboard-top-grid" ref={dashboardRef}>
            <section className="education-panel education-profile-panel" ref={profileRef}>
              <div className="education-panel__header">
                <h2>College Profile</h2>
                <Link to="/education-center-upload" state={uploadLinkState} className="education-panel__button">
                  Edit Full Profile
                </Link>
              </div>

              <div className="education-profile-card">
                <div className="education-profile-card__hero">
                  <img src={resolvedDashboard.profile.heroImage} alt={resolvedDashboard.profile.centerName} />
                </div>

                <div className="education-profile-card__identity">
                  <div className="education-profile-card__logo">
                    <img src={resolvedDashboard.profile.logoImage} alt={`${resolvedDashboard.profile.centerName} logo`} />
                  </div>

                  <div>
                    <h3>{resolvedDashboard.profile.centerName}</h3>
                    <p>{resolvedDashboard.profile.address}</p>
                  </div>
                </div>

                <div className="education-profile-card__meta">
                  <span>{resolvedDashboard.profile.phone}</span>
                  <span>{resolvedDashboard.profile.contactEmail}</span>
                  <span>{resolvedDashboard.profile.website}</span>
                </div>

                <div className="education-profile-card__note">
                  <p>{resolvedDashboard.profile.description}</p>
                </div>
              </div>
            </section>

            <aside className="education-panel education-overview-panel">
              <div className="education-panel__header">
                <h2>Quick Overview</h2>
              </div>

              <div className="education-overview-grid">
                {[
                  { key: 'totalCourses', label: 'Total Courses', icon: 'courses' },
                  { key: 'applications', label: 'Applications', icon: 'applications' },
                  { key: 'scholarships', label: 'Scholarships', icon: 'scholarships' },
                  { key: 'enquiries', label: 'Open Reviews', icon: 'applications' }
                ].map((item) => (
                  <div key={item.key} className="education-overview-card">
                    <span className="education-overview-card__icon">
                      <DashboardIcon name={item.icon} />
                    </span>
                    <small>{item.label}</small>
                    <strong>{resolvedDashboard.overview[item.key]}</strong>
                  </div>
                ))}
              </div>

              <div className="education-activity-list">
                <h3>Recent Activity</h3>
                {resolvedDashboard.recentActivity.map((item) => (
                  <div key={item.id} className="education-activity-item">
                    <span className="education-activity-item__icon">
                      <DashboardIcon name={item.icon} />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.timeLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <section className="education-panel" ref={coursesRef}>
            <div className="education-panel__header">
              <h2>Manage Courses</h2>
              <span className="education-panel__helper">Add, activate, inactivate, or delete course rows.</span>
            </div>

            <form className="education-quick-form" onSubmit={handleCourseSubmit}>
              <div className="education-quick-form__grid">
                <label className="portal-form__field">
                  <span>Course name</span>
                  <input
                    type="text"
                    name="name"
                    value={courseForm.name}
                    onChange={handleCourseFormChange}
                    placeholder="B.Sc Computer Science"
                  />
                </label>

                <label className="portal-form__field">
                  <span>Duration</span>
                  <input
                    type="text"
                    name="duration"
                    value={courseForm.duration}
                    onChange={handleCourseFormChange}
                    placeholder="4 Years"
                  />
                </label>

                <label className="portal-form__field">
                  <span>Intake</span>
                  <input
                    type="number"
                    min="0"
                    name="intake"
                    value={courseForm.intake}
                    onChange={handleCourseFormChange}
                    placeholder="60"
                  />
                </label>

                <label className="portal-form__field">
                  <span>Fees</span>
                  <input
                    type="text"
                    name="fee"
                    value={courseForm.fee}
                    onChange={handleCourseFormChange}
                    placeholder="Rs. 75,000"
                  />
                </label>
              </div>

              <div className="education-quick-form__actions">
                <button
                  type="submit"
                  className="education-panel__button education-panel__button--solid"
                  disabled={busyAction === 'course-create'}
                >
                  {busyAction === 'course-create' ? 'Adding...' : 'Add New Course'}
                </button>
              </div>
            </form>

            <div className="education-table-wrap">
              <table className="education-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Course Name</th>
                    <th>Duration</th>
                    <th>Intake</th>
                    <th>Fees (Per Year)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedDashboard.courses.map((course, index) => (
                    <tr key={course.id}>
                      <td>{index + 1}</td>
                      <td>{course.name}</td>
                      <td>{course.duration}</td>
                      <td>{course.intake}</td>
                      <td>{course.fee}</td>
                      <td>
                        <DashboardStatusBadge status={course.status} />
                      </td>
                      <td>
                        <div className="education-table__actions">
                          <label className="course-status-switch"><input type="checkbox" checked={course.status === 'Active'} onChange={() => handleCourseStatusToggle(course)} disabled={busyAction === 'course-status'}/><span className="course-status-switch__track"/><b>{course.status}</b></label>
                          <button type="button" className="education-table__danger" onClick={() => handleCourseDelete(course.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="education-panel" ref={scholarshipsRef}>
            <div className="education-panel__header">
              <h2>Manage Scholarships</h2>
              <span className="education-panel__helper">Scholarship apply view is linked with each student record below.</span>
            </div>

            <form className="education-quick-form" onSubmit={handleScholarshipSubmit}>
              <div className="education-quick-form__grid">
                <label className="portal-form__field">
                  <span>Scholarship name</span>
                  <input
                    type="text"
                    name="name"
                    value={scholarshipForm.name}
                    onChange={handleScholarshipFormChange}
                    placeholder="Merit Scholarship 2026"
                  />
                </label>

                <label className="portal-form__field">
                  <span>Type</span>
                  <input
                    type="text"
                    name="type"
                    value={scholarshipForm.type}
                    onChange={handleScholarshipFormChange}
                    placeholder="Merit Based"
                  />
                </label>

                <label className="portal-form__field">
                  <span>Eligibility</span>
                  <input
                    type="text"
                    name="eligibility"
                    value={scholarshipForm.eligibility}
                    onChange={handleScholarshipFormChange}
                    placeholder="80% and above"
                  />
                </label>

                <label className="portal-form__field">
                  <span>Benefit</span>
                  <input
                    type="text"
                    name="benefit"
                    value={scholarshipForm.benefit}
                    onChange={handleScholarshipFormChange}
                    placeholder="50% Tuition Fee"
                  />
                </label>
              </div>

              <div className="education-quick-form__actions">
                <button
                  type="submit"
                  className="education-panel__button education-panel__button--solid"
                  disabled={busyAction === 'scholarship-create'}
                >
                  {busyAction === 'scholarship-create' ? 'Adding...' : 'Add Scholarship'}
                </button>
              </div>
            </form>

            <div className="education-table-wrap">
              <table className="education-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Scholarship Name</th>
                    <th>Type</th>
                    <th>Eligibility</th>
                    <th>Benefit</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedDashboard.scholarships.map((scholarship, index) => (
                    <tr key={scholarship.id}>
                      <td>{index + 1}</td>
                      <td>{scholarship.name}</td>
                      <td>{scholarship.type}</td>
                      <td>{scholarship.eligibility}</td>
                      <td>{scholarship.benefit}</td>
                      <td>
                        <DashboardStatusBadge status={scholarship.status} />
                      </td>
                      <td>
                        <div className="education-table__actions">
                          <button type="button" onClick={() => handleScholarshipStatusToggle(scholarship)}>
                            {scholarship.status === 'Active' ? 'Inactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            className="education-table__danger"
                            onClick={() => handleScholarshipDelete(scholarship.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="education-panel" ref={applicationsRef}>
            <div className="education-panel__header">
              <h2>Student Applications</h2>
              <span className="education-panel__helper">Open full student details and scholarship apply information from the same dashboard.</span>
            </div>

            <div className="education-table-wrap">
              <table className="education-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Scholarship</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedDashboard.applications.map((application, index) => (
                    <tr key={application.id}>
                      <td>{index + 1}</td>
                      <td>{application.studentName}</td>
                      <td>{application.course}</td>
                      <td>{application.mobile}</td>
                      <td>{application.email}</td>
                      <td>{application.scholarshipInterest ? application.scholarshipName || 'Applied' : 'No'}</td>
                      <td>
                        <DashboardStatusBadge status={application.status} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="education-table__details"
                          onClick={() => setSelectedApplicationId(application.id)}
                        >
                          View Full Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedApplication ? (
              <div className="education-detail-card">
                <div className="education-detail-card__header">
                  <div>
                    <span className="education-detail-card__eyebrow">Student Detail View</span>
                    <h3>{selectedApplication.studentName}</h3>
                  </div>
                  <span className="education-detail-card__icon">
                    <DashboardIcon name="detail" />
                  </span>
                </div>

                <div className="education-detail-grid">
                  <DetailItem label="Applied course" value={selectedApplication.course} />
                  <DetailItem label="Applied on" value={selectedApplication.appliedOn} />
                  <DetailItem label="Mobile number" value={selectedApplication.mobile} />
                  <DetailItem label="Email address" value={selectedApplication.email} />
                  <DetailItem label="Current study" value={selectedApplication.currentStudy || selectedApplication.previousEducation} />
                  <DetailItem label="Completed study" value={selectedApplication.completedStudy || selectedApplication.previousEducation} />
                  <DetailItem label="Completed percentage" value={selectedApplication.completedStudyPercentage || selectedApplication.marks} />
                  <DetailItem label="Address" value={selectedApplication.address} />
                  <DetailItem
                    label="Scholarship apply"
                    value={selectedApplication.scholarshipInterest ? selectedApplication.scholarshipName || 'Applied' : 'No'}
                  />
                </div>

                <div className="education-detail-card__note">
                  <strong>Student statement</strong>
                  <p>{selectedApplication.statement || 'No student statement added yet.'}</p>
                </div>

                <div className="education-detail-card__controls">
                  <label className="portal-form__field">
                    <span>Application status</span>
                    <select value={applicationStatusDraft} onChange={(event) => setApplicationStatusDraft(event.target.value)}>
                      <option>New</option>
                      <option>Under Review</option>
                      <option>Accepted</option>
                      <option>Rejected</option>
                    </select>
                  </label>

                  <label className="portal-form__field">
                    <span>Internal notes</span>
                    <textarea
                      rows="3"
                      value={applicationNotesDraft}
                      onChange={(event) => setApplicationNotesDraft(event.target.value)}
                      placeholder="Add scholarship review notes or admission follow-up details."
                    />
                  </label>
                  <label className="portal-form__field">
                    <span>Quick reply message</span>
                    <select defaultValue="" onChange={(event) => event.target.value && setApplicationReplyDraft(applicationReplyTemplates[event.target.value])}>
                      <option value="">Choose a reply</option>
                      <option value="contact">We will contact you</option>
                      <option value="join">Join with us</option>
                      <option value="scholarship">Scholarship information</option>
                      <option value="ineligible">Not eligible</option>
                      <option value="details">Need more details</option>
                    </select>
                  </label>
                  <label className="portal-form__field education-reply-field">
                    <span>Reply visible to student</span>
                    <textarea
                      rows="6"
                      value={applicationReplyDraft}
                      onChange={(event) => setApplicationReplyDraft(event.target.value)}
                      placeholder="Write a clear reply for the student. This message appears in their Apply Status area."
                    />
                  </label>
                </div>

                <div className="education-detail-card__actions">
                  <button
                    type="button"
                    className="education-panel__button education-panel__button--solid"
                    disabled={busyAction === 'application-update'}
                    onClick={handleApplicationSave}
                  >
                    {busyAction === 'application-update' ? 'Saving...' : 'Save Student Update'}
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <div className="education-media-grid">
            <section className="education-panel" ref={imagesRef}>
              <div className="education-panel__header">
                <h2>Upload Images</h2>
                <Link to="/education-center-upload" state={uploadLinkState} className="education-panel__button">
                  Open Full Profile Upload
                </Link>
              </div>

              <form className="education-media-form" onSubmit={handleImageSubmit}>
                <label className="portal-form__field">
                  <span>Image title</span>
                  <input
                    type="text"
                    name="title"
                    value={imageForm.title}
                    onChange={handleImageFormChange}
                    placeholder="Campus Front"
                  />
                </label>

                <label className="portal-form__field">
                  <span>Select image</span>
                  <input type="file" accept="image/*" onChange={handleImageUploadChange} />
                </label>

                <div className="education-media-form__checks">
                  <label className="education-media-form__check">
                    <input
                      type="checkbox"
                      name="setAsHero"
                      checked={imageForm.setAsHero}
                      onChange={handleImageFormChange}
                    />
                    <span>Set as hero image</span>
                  </label>

                  <label className="education-media-form__check">
                    <input
                      type="checkbox"
                      name="setAsProfile"
                      checked={imageForm.setAsProfile}
                      onChange={handleImageFormChange}
                    />
                    <span>Set as profile image</span>
                  </label>
                </div>

                {imagePreview ? <img className="portal-form__preview" src={imagePreview} alt="Education center upload preview" /> : null}

                <div className="education-quick-form__actions">
                  <button
                    type="submit"
                    className="education-panel__button education-panel__button--solid"
                    disabled={busyAction === 'image-create'}
                  >
                    {busyAction === 'image-create' ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </form>

              <div className="education-gallery-grid">
                {resolvedDashboard.images.map((item) => (
                  <article key={item.id} className="education-gallery-card">
                    <img src={item.image} alt={item.title} />
                    <div className="education-gallery-card__body">
                      <span>{item.title}</span>
                      <button type="button" className="education-table__danger" onClick={() => handleImageDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="education-panel" ref={videosRef}>
              <div className="education-panel__header">
                <h2>Upload Videos</h2>
                <Link
                  to="/video-uploader-channel"
                  state={{ partner: session.partner, token: session.token }}
                  className="education-panel__button"
                >
                  Open Creator Upload
                </Link>
              </div>

              <form className="education-media-form" onSubmit={handleVideoSubmit}>
                <div className="education-quick-form__grid">
                  <label className="portal-form__field">
                    <span>Video title</span>
                    <input
                      type="text"
                      name="title"
                      value={videoForm.title}
                      onChange={handleVideoFormChange}
                      placeholder="Campus Tour 2026"
                    />
                  </label>

                  <label className="portal-form__field">
                    <span>Duration label</span>
                    <input
                      type="text"
                      name="duration"
                      value={videoForm.duration}
                      onChange={handleVideoFormChange}
                      placeholder="2:30"
                    />
                  </label>
                </div>

                <label className="portal-form__field">
                  <span>Video URL</span>
                  <input
                    type="url"
                    name="videoUrl"
                    value={videoForm.videoUrl}
                    onChange={handleVideoFormChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </label>

                <label className="portal-form__field">
                  <span>Thumbnail image</span>
                  <input type="file" accept="image/*" onChange={handleVideoThumbnailChange} />
                </label>

                {videoPreview ? <img className="portal-form__preview" src={videoPreview} alt="Video thumbnail preview" /> : null}

                <div className="education-quick-form__actions">
                  <button
                    type="submit"
                    className="education-panel__button education-panel__button--solid"
                    disabled={busyAction === 'video-create'}
                  >
                    {busyAction === 'video-create' ? 'Uploading...' : 'Upload Video'}
                  </button>
                </div>
              </form>

              <div className="education-video-grid">
                {resolvedDashboard.videos.map((video) => (
                  <article key={video.id} className="education-video-card">
                    <a href={video.videoUrl} target="_blank" rel="noreferrer">
                      <img src={video.image} alt={video.title} />
                      <span className="education-video-card__play">Play</span>
                    </a>
                    <div className="education-video-card__meta">
                      <strong>{video.title}</strong>
                      <span>{video.duration}</span>
                    </div>
                    <div className="education-video-card__actions">
                      <button type="button" className="education-table__danger" onClick={() => handleVideoDelete(video.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
