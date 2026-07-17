import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createStudentDashboardItem,
  deleteStudentDashboardItem,
  fetchStudentDashboard,
  loginStudent,
  signupStudent,
  updateStudentProfile
} from '../services/api';
import './Loginpage-Design.css';

const STUDENT_SESSION_STORAGE_KEY = 'what-next-student-session-v1';

const studentSidebarLinks = [
  { key: 'profile', label: 'Profile', icon: 'profile' },
  { key: 'courses', label: 'Courses', icon: 'course' },
  { key: 'certificates', label: 'Certificates', icon: 'certificate' },
  { key: 'discussion', label: 'Discussion', icon: 'message' },
  { key: 'friends', label: 'Friends', icon: 'friends' },
  { key: 'stories', label: 'Stories', icon: 'story' },
  { key: 'applications', label: 'Apply Status', icon: 'application' }
];

const fallbackStudent = {
  name: 'Kavin',
  firstName: 'Kavin',
  role: 'Student',
  bio: 'Passionate about full stack development.',
  tagline: 'Learning every day and building my future.',
  avatarUrl: '',
  achievementCount: 12,
  certificateCount: 8,
  subjectCount: 5,
  achievements: [
    { id: 'achievement-1', title: 'Top Learner', description: 'Completed 10 courses', dateLabel: 'May 2024', accent: 'gold' },
    { id: 'achievement-2', title: '7 Days Streak', description: 'Studied 7 days in a row', dateLabel: 'May 2024', accent: 'blue' },
    { id: 'achievement-3', title: 'Quick Helper', description: 'Helped 15+ students', dateLabel: 'April 2024', accent: 'green' }
  ],
  certificates: [
    { id: 'certificate-1', title: 'React.js Developer', issuer: 'Issued by DevTown', dateLabel: 'April 2024', accent: 'blue' },
    { id: 'certificate-2', title: 'JavaScript Essentials', issuer: 'Issued by Udemy', dateLabel: 'March 2024', accent: 'amber' },
    { id: 'certificate-3', title: 'HTML & CSS Basics', issuer: 'Issued by Sololearn', dateLabel: 'Feb 2024', accent: 'green' }
  ],
  messages: [
    { id: 'message-1', title: 'Mentor update', excerpt: 'Keep building your practice projects and upload your latest portfolio link this week.', timeLabel: 'Today' },
    { id: 'message-2', title: 'Certificate reminder', excerpt: 'Your next certificate challenge opens on Friday. Stay ready for the assessment.', timeLabel: 'Yesterday' }
  ],
  completedCourses: [
    { id: 'completed-course-1', title: 'React Basics', provider: 'classgain Academy', status: 'Completed', dateLabel: 'May 2026', progress: 100 },
    { id: 'completed-course-2', title: 'Communication Skills', provider: 'Campus Career Club', status: 'Completed', dateLabel: 'April 2026', progress: 100 }
  ],
  currentStudies: [
    { id: 'current-study-1', title: 'Node.js and MongoDB', provider: 'Full Stack Track', status: 'Studying', dateLabel: 'Week 4', progress: 62 },
    { id: 'current-study-2', title: 'College Interview Preparation', provider: 'Counselling Team', status: 'In progress', dateLabel: 'Today', progress: 45 }
  ],
  friends: [
    { id: 'friend-1', name: 'Aarav Kumar', handle: '@aarav.learns', relation: 'following', avatarUrl: '' },
    { id: 'friend-2', name: 'Meera S', handle: '@meera.codes', relation: 'following', avatarUrl: '' },
    { id: 'friend-3', name: 'Nithin Raj', handle: '@nithin.next', relation: 'follower', avatarUrl: '' }
  ],
  friendSuggestions: [
    { id: 'friend-suggestion-1', name: 'Priya Career Lab', handle: '@priya.career', relation: 'suggested', avatarUrl: '' },
    { id: 'friend-suggestion-2', name: 'Arun Design School', handle: '@arun.design', relation: 'suggested', avatarUrl: '' }
  ],
  groups: [
    { id: 'group-1', name: 'Full Stack Study Circle', topic: 'Project doubts and daily practice', memberCount: 12, lastMessage: 'Share your certificate after each module.' },
    { id: 'group-2', name: 'College Apply Friends', topic: 'Application updates and counselling', memberCount: 8, lastMessage: 'Update the group when your college status changes.' }
  ],
  stories: [
    { id: 'story-1', title: 'Today study update', mediaType: 'video', mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', timeLabel: 'Today' },
    { id: 'story-2', title: 'Certificate shared', mediaType: 'certificate', mediaUrl: '', timeLabel: 'Yesterday' }
  ],
  applicationStatuses: [
    { id: 'application-1', college: 'CMS College', course: 'B.Sc Computer Science', status: 'Under Review', updatedLabel: 'Updated today' },
    { id: 'application-2', college: 'Livewire Training Center', course: 'Full Stack Development', status: 'Applied', updatedLabel: 'Updated yesterday' }
  ]
};

const initialAuthForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const initialProfileForm = {
  name: '',
  bio: '',
  tagline: '',
  avatarUrl: ''
};

const initialCertificateForm = {
  title: '',
  issuer: '',
  dateLabel: '',
  accent: 'blue'
};

const initialCourseForm = {
  title: '',
  provider: '',
  status: '',
  dateLabel: '',
  progress: 0
};

const initialMessageForm = {
  title: '',
  excerpt: ''
};

const initialFriendForm = {
  name: '',
  handle: '',
  relation: 'following'
};

const initialGroupForm = {
  name: '',
  topic: '',
  lastMessage: ''
};

const initialStoryForm = {
  title: '',
  mediaType: 'video',
  mediaUrl: ''
};

const initialApplicationForm = {
  college: '',
  course: '',
  status: 'Applied'
};

function StudentIcon({ name }) {
  const icons = {
    profile: (
      <>
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </>
    ),
    achievement: (
      <>
        <path d="m12 3 2.6 5.1 5.7.8-4.1 4 1 5.6L12 15.8 6.8 18.5l1-5.6-4.1-4 5.7-.8Z" />
      </>
    ),
    course: (
      <>
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v15H6.5A2.5 2.5 0 0 1 4 16.5Z" />
        <path d="M8 8h8" />
        <path d="M8 12h6" />
      </>
    ),
    certificate: (
      <>
        <rect x="5" y="4" width="14" height="18" rx="2" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </>
    ),
    message: (
      <>
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H16a3 3 0 0 1 0 6H10l-5 4v-7.5Z" />
      </>
    ),
    friends: (
      <>
        <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M17 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M14.5 18.5a4.5 4.5 0 0 1 6 1.5" />
      </>
    ),
    story: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="m10 9 5 3-5 3Z" />
      </>
    ),
    application: (
      <>
        <path d="M7 3h7l4 4v14H7Z" />
        <path d="M14 3v5h5" />
        <path d="m9 15 2 2 4-5" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17v2a2 2 0 0 0 2 2h6" />
        <path d="M18 12H7" />
        <path d="m14 8 4 4-4 4" />
        <path d="M10 7V5a2 2 0 0 1 2-2h6" />
      </>
    )
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[name] || icons.profile}
    </svg>
  );
}

function StudentMedal({ accent }) {
  return (
    <span className={`student-achievement__medal student-achievement__medal--${accent}`}>
      <span className="student-achievement__star">*</span>
    </span>
  );
}

function normalizeCollection(items, prefix, fallbackItems) {
  if (!items?.length) {
    return fallbackItems;
  }

  return items.map((item, index) => ({
    ...item,
    id: item.id || `${prefix}-${index + 1}`
  }));
}

function normalizeStudentData(student) {
  if (!student) {
    return fallbackStudent;
  }

  return {
    ...fallbackStudent,
    ...student,
    firstName: student.firstName || student.name?.split(/\s+/)[0] || fallbackStudent.firstName,
    achievements: normalizeCollection(student.achievements, 'achievement', fallbackStudent.achievements),
    certificates: normalizeCollection(student.certificates, 'certificate', fallbackStudent.certificates),
    messages: normalizeCollection(student.messages, 'message', fallbackStudent.messages),
    completedCourses: normalizeCollection(student.completedCourses, 'completed-course', fallbackStudent.completedCourses),
    currentStudies: normalizeCollection(student.currentStudies, 'current-study', fallbackStudent.currentStudies),
    friends: normalizeCollection(student.friends, 'friend', fallbackStudent.friends),
    friendSuggestions: normalizeCollection(student.friendSuggestions, 'friend-suggestion', fallbackStudent.friendSuggestions),
    groups: normalizeCollection(student.groups, 'group', fallbackStudent.groups),
    stories: normalizeCollection(student.stories, 'story', fallbackStudent.stories),
    applicationStatuses: normalizeCollection(
      student.applicationStatuses,
      'application',
      fallbackStudent.applicationStatuses
    )
  };
}

function readStoredStudentSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(STUDENT_SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession);

    if (!parsedSession?.token || !parsedSession?.user?.email) {
      return null;
    }

    return {
      token: parsedSession.token,
      user: parsedSession.user
    };
  } catch (_error) {
    return null;
  }
}

function saveStudentSession(session) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    STUDENT_SESSION_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      token: session.token,
      user: session.user
    })
  );
}

function clearStudentSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STUDENT_SESSION_STORAGE_KEY);
}

function buildStudentSession(responseData) {
  const token = responseData?.token || responseData?.session?.token;
  const user = responseData?.user || responseData?.session?.user;

  if (!token || !user?.email) {
    return null;
  }

  return { token, user };
}

export default function LoginPage() {
  const [authMode, setAuthMode] = useState('signin');
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [session, setSession] = useState(() => readStoredStudentSession());
  const [student, setStudent] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDashboard, setIsSavingDashboard] = useState(false);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [certificateForm, setCertificateForm] = useState(initialCertificateForm);
  const [completedCourseForm, setCompletedCourseForm] = useState({ ...initialCourseForm, status: 'Completed', progress: 100 });
  const [currentStudyForm, setCurrentStudyForm] = useState({ ...initialCourseForm, status: 'Studying', progress: 40 });
  const [messageForm, setMessageForm] = useState(initialMessageForm);
  const [friendForm, setFriendForm] = useState(initialFriendForm);
  const [groupForm, setGroupForm] = useState(initialGroupForm);
  const [storyForm, setStoryForm] = useState(initialStoryForm);
  const [applicationForm, setApplicationForm] = useState(initialApplicationForm);
  const [isDashboardLoading, setIsDashboardLoading] = useState(() => Boolean(readStoredStudentSession()?.token));
  const [status, setStatus] = useState(() => ({
    type: 'info',
    message: readStoredStudentSession()?.token ? 'Restoring your student session...' : ''
  }));

  const profileRef = useRef(null);
  const coursesRef = useRef(null);
  const certificatesRef = useRef(null);
  const discussionRef = useRef(null);
  const friendsRef = useRef(null);
  const storiesRef = useRef(null);
  const applicationsRef = useRef(null);

  const resolvedStudent = useMemo(() => normalizeStudentData(student), [student]);

  useEffect(() => {
    let isMounted = true;

    async function loadStudentDashboard() {
      if (!session?.token) {
        setStudent(null);
        setIsDashboardLoading(false);
        return;
      }

      try {
        setIsDashboardLoading(true);
        const data = await fetchStudentDashboard({
          token: session.token
        });

        if (!isMounted) {
          return;
        }

        setStudent(data.student || null);
        setStatus((currentStatus) =>
          currentStatus.message
            ? currentStatus
            : {
                type: 'success',
                message: `Welcome back, ${data.student?.firstName || session.user?.name || 'Student'}.`
              }
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        clearStudentSession();
        setSession(null);
        setStudent(null);
        setStatus({
          type: 'error',
          message: error.message || 'Student session expired. Please sign in again.'
        });
      } finally {
        if (isMounted) {
          setIsDashboardLoading(false);
        }
      }
    }

    loadStudentDashboard();

    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    setProfileForm({
      name: resolvedStudent.name || '',
      bio: resolvedStudent.bio || '',
      tagline: resolvedStudent.tagline || '',
      avatarUrl: resolvedStudent.avatarUrl || ''
    });
  }, [resolvedStudent.name, resolvedStudent.bio, resolvedStudent.tagline, resolvedStudent.avatarUrl]);

  const sectionRefs = {
    profile: profileRef,
    courses: coursesRef,
    certificates: certificatesRef,
    discussion: discussionRef,
    friends: friendsRef,
    stories: storiesRef,
    applications: applicationsRef
  };

  const handlePanelSelect = (key) => {
    setSelectedPanel(key);
    const target = sectionRefs[key]?.current;

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));

    if (status.type === 'error') {
      setStatus({ type: '', message: '' });
    }
  };

  const handleFormFieldChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((current) => ({ ...current, [name]: value }));

    if (status.type === 'error') {
      setStatus({ type: '', message: '' });
    }
  };

  const applyDashboardUpdate = (data, message) => {
    setStudent(data.student || null);
    setStatus({
      type: 'success',
      message
    });
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (!profileForm.name.trim()) {
      setStatus({ type: 'error', message: 'Please enter the student name before saving profile changes.' });
      return;
    }

    try {
      setIsSavingDashboard(true);
      const data = await updateStudentProfile({
        token: session.token,
        email: session.user?.email,
        ...profileForm
      });

      applyDashboardUpdate(data, 'Profile updated with your new name and photo details.');
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to update profile right now.' });
    } finally {
      setIsSavingDashboard(false);
    }
  };

  const handleAddDashboardItem = async (collection, form, resetForm, successMessage) => {
    try {
      setIsSavingDashboard(true);
      const data = await createStudentDashboardItem(collection, {
        token: session.token,
        email: session.user?.email,
        ...form
      });

      resetForm();
      applyDashboardUpdate(data, successMessage);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to save this student update right now.' });
    } finally {
      setIsSavingDashboard(false);
    }
  };

  const handleDeleteDashboardItem = async (collection, itemId, successMessage) => {
    try {
      setIsSavingDashboard(true);
      const data = await deleteStudentDashboardItem(collection, itemId, session.token, {
        email: session.user?.email
      });

      applyDashboardUpdate(data, successMessage);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to delete this student item right now.' });
    } finally {
      setIsSavingDashboard(false);
    }
  };

  const handleCertificateSubmit = (event) => {
    event.preventDefault();

    if (!certificateForm.title.trim()) {
      setStatus({ type: 'error', message: 'Please enter the certificate name before upload.' });
      return;
    }

    handleAddDashboardItem('certificates', certificateForm, () => setCertificateForm(initialCertificateForm), 'Certificate uploaded to your student profile.');
  };

  const handleCompletedCourseSubmit = (event) => {
    event.preventDefault();

    if (!completedCourseForm.title.trim()) {
      setStatus({ type: 'error', message: 'Please enter a completed course name.' });
      return;
    }

    handleAddDashboardItem(
      'completedCourses',
      completedCourseForm,
      () => setCompletedCourseForm({ ...initialCourseForm, status: 'Completed', progress: 100 }),
      'Completed course saved.'
    );
  };

  const handleCurrentStudySubmit = (event) => {
    event.preventDefault();

    if (!currentStudyForm.title.trim()) {
      setStatus({ type: 'error', message: 'Please enter the current study name.' });
      return;
    }

    handleAddDashboardItem(
      'currentStudies',
      currentStudyForm,
      () => setCurrentStudyForm({ ...initialCourseForm, status: 'Studying', progress: 40 }),
      'Current study details saved.'
    );
  };

  const handleMessageSubmit = (event) => {
    event.preventDefault();

    if (!messageForm.excerpt.trim()) {
      setStatus({ type: 'error', message: 'Please write a discussion message first.' });
      return;
    }

    handleAddDashboardItem(
      'messages',
      { title: messageForm.title || 'Student discussion', excerpt: messageForm.excerpt },
      () => setMessageForm(initialMessageForm),
      'Discussion message posted.'
    );
  };

  const handleFriendSubmit = (event) => {
    event.preventDefault();

    if (!friendForm.name.trim()) {
      setStatus({ type: 'error', message: 'Please enter your friend name before inviting.' });
      return;
    }

    handleAddDashboardItem('friends', friendForm, () => setFriendForm(initialFriendForm), 'Friend invitation saved.');
  };

  const handleGroupSubmit = (event) => {
    event.preventDefault();

    if (!groupForm.name.trim()) {
      setStatus({ type: 'error', message: 'Please enter a group name.' });
      return;
    }

    handleAddDashboardItem('groups', groupForm, () => setGroupForm(initialGroupForm), 'Friends discussion group created.');
  };

  const handleStorySubmit = (event) => {
    event.preventDefault();

    if (!storyForm.title.trim()) {
      setStatus({ type: 'error', message: 'Please enter a story title.' });
      return;
    }

    handleAddDashboardItem('stories', storyForm, () => setStoryForm(initialStoryForm), 'Daily story updated.');
  };

  const handleApplicationSubmit = (event) => {
    event.preventDefault();

    if (!applicationForm.college.trim()) {
      setStatus({ type: 'error', message: 'Please enter the college name.' });
      return;
    }

    handleAddDashboardItem(
      'applicationStatuses',
      applicationForm,
      () => setApplicationForm(initialApplicationForm),
      'College apply status saved.'
    );
  };

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setAuthForm(initialAuthForm);
    setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const trimmedName = authForm.name.trim();
    const trimmedEmail = authForm.email.trim().toLowerCase();
    const trimmedPassword = authForm.password.trim();
    const isSignupMode = authMode === 'signup';

    if (isSignupMode && !trimmedName) {
      setStatus({ type: 'error', message: 'Please enter your full name to create the student account.' });
      return;
    }

    if (!trimmedEmail || !trimmedPassword) {
      setStatus({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }

    if (trimmedPassword.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (isSignupMode && trimmedPassword !== authForm.confirmPassword.trim()) {
      setStatus({ type: 'error', message: 'Password confirmation does not match.' });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = isSignupMode
        ? {
            name: trimmedName,
            email: trimmedEmail,
            password: trimmedPassword
          }
        : {
            email: trimmedEmail,
            password: trimmedPassword
          };

      const responseData = isSignupMode ? await signupStudent(payload) : await loginStudent(payload);
      const nextSession = buildStudentSession(responseData);

      if (!nextSession) {
        throw new Error('Student session could not be created. Please try again.');
      }

      saveStudentSession(nextSession);
      setSession(nextSession);
      setStudent(responseData.student || null);
      setSelectedPanel('profile');
      setAuthForm(initialAuthForm);
      setStatus({
        type: 'success',
        message: isSignupMode
          ? 'Student account created successfully. Your dashboard is ready.'
          : 'Signed in successfully. Loading your student dashboard.'
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to complete the request right now.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearStudentSession();
    setSession(null);
    setStudent(null);
    setSelectedPanel('profile');
    setAuthMode('signin');
    setAuthForm(initialAuthForm);
    setStatus({
      type: 'info',
      message: 'You have been signed out of the student portal.'
    });
  };

  const statusTone = status.type || 'info';

  if (!session?.token) {
    return (
      <div className="student-auth-page">
        {status.message ? (
          <div className={`dashboard-page__status dashboard-page__status--${statusTone}`}>{status.message}</div>
        ) : null}

        <div className="student-auth-grid">
          <section className="student-auth-intro">
            <p className="student-auth-intro__eyebrow">Student Login</p>
            <h1>Sign in or create your classgain student account</h1>
            <p>
              Keep your learning profile, certificates, achievements, and mentor messages in one place with a student
              portal connected to the Express and MongoDB backend.
            </p>

            <div className="student-auth-metrics">
              <article className="student-auth-metric">
                <strong>4</strong>
                <span>Learning sections</span>
              </article>
              <article className="student-auth-metric">
                <strong>24/7</strong>
                <span>Dashboard access</span>
              </article>
              <article className="student-auth-metric">
                <strong>MongoDB</strong>
                <span>Saved student data</span>
              </article>
            </div>

            <div className="student-auth-highlights">
              <div className="student-auth-highlight">
                <strong>Secure student API</strong>
                <span>Sign-up and sign-in now save a real session for the dashboard.</span>
              </div>
              <div className="student-auth-highlight">
                <strong>Progress at a glance</strong>
                <span>Track achievements, certificates, and mentor notes after login.</span>
              </div>
              <div className="student-auth-highlight">
                <strong>Simple next step</strong>
                <span>Explore courses first, then return here when you want your personal portal.</span>
              </div>
            </div>

            <div className="dashboard-page__actions">
              <Link to="/home" className="dashboard-page__button">
                Explore Starting Education
              </Link>
              <Link to="/help-center" className="dashboard-page__button dashboard-page__button--ghost">
                Need Help
              </Link>
            </div>
          </section>

          <section className="student-auth-card">
            <div className="student-auth-card__toggle" role="tablist" aria-label="Student portal access mode">
              <button
                type="button"
                className={authMode === 'signin' ? 'student-auth-card__toggle-button student-auth-card__toggle-button--active' : 'student-auth-card__toggle-button'}
                onClick={() => handleModeChange('signin')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={authMode === 'signup' ? 'student-auth-card__toggle-button student-auth-card__toggle-button--active' : 'student-auth-card__toggle-button'}
                onClick={() => handleModeChange('signup')}
              >
                Sign Up
              </button>
            </div>

            <form className="student-auth-form" onSubmit={handleSubmit}>
              <p className="portal-form__eyebrow">Student Portal Access</p>
              <h2>{authMode === 'signup' ? 'Create Student Account' : 'Welcome Back Student'}</h2>
              <p className="student-auth-form__text">
                {authMode === 'signup'
                  ? 'Create your student profile so your learning dashboard can be saved in MongoDB.'
                  : 'Sign in to open your dashboard and continue your learning progress.'}
              </p>

              {authMode === 'signup' ? (
                <label className="portal-form__field">
                  <span>Full name</span>
                  <input
                    type="text"
                    name="name"
                    value={authForm.name}
                    onChange={handleFieldChange}
                    placeholder="Student full name"
                    autoComplete="name"
                  />
                </label>
              ) : null}

              <label className="portal-form__field">
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleFieldChange}
                  placeholder="student@example.com"
                  autoComplete="email"
                />
              </label>

              <label className="portal-form__field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleFieldChange}
                  placeholder="Minimum 6 characters"
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                />
              </label>

              {authMode === 'signup' ? (
                <label className="portal-form__field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={authForm.confirmPassword}
                    onChange={handleFieldChange}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                </label>
              ) : null}

              <div className="student-auth-form__meta">
                <span>Session is saved in this browser until you sign out.</span>
              </div>

              <div className="portal-form__actions">
                <button type="submit" className="login-submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? authMode === 'signup'
                      ? 'Creating account...'
                      : 'Signing in...'
                    : authMode === 'signup'
                      ? 'Create Account'
                      : 'Sign In'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard-page">
      {isDashboardLoading || status.message ? (
        <div className={`dashboard-page__status dashboard-page__status--${statusTone}`}>
          {isDashboardLoading ? 'Connecting student dashboard...' : status.message}
        </div>
      ) : null}

      <div className="dashboard-page__hero">
        <div>
          <span className="dashboard-page__eyebrow">Student Dashboard</span>
          <h1 className="dashboard-page__title">Welcome, {resolvedStudent.firstName}</h1>
          <p className="dashboard-page__text">
            Your profile, certificate uploads, courses, friends, stories, discussions, and college apply status are connected to the student login API.
          </p>
        </div>

        <div className="dashboard-page__actions">
          <button type="button" className="dashboard-page__button" onClick={() => handlePanelSelect('courses')}>
            View Courses
          </button>
          <button type="button" className="dashboard-page__button dashboard-page__button--ghost" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="student-dashboard-shell">
        <aside className="student-sidebar">
          <div className="student-sidebar__nav">
            {studentSidebarLinks.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`student-sidebar__link ${
                  selectedPanel === item.key ? 'student-sidebar__link--active' : ''
                }`}
                onClick={() => handlePanelSelect(item.key)}
              >
                <span className="student-sidebar__icon">
                  <StudentIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <button type="button" className="student-sidebar__logout" onClick={handleLogout}>
            <span className="student-sidebar__icon">
              <StudentIcon name="logout" />
            </span>
            <span>Logout</span>
          </button>
        </aside>

        <div className="student-dashboard-main">
          <section className="student-panel student-profile-panel" ref={profileRef}>
            <div className="student-profile-card student-profile-card--editable">
              <div className="student-profile-card__identity">
                {resolvedStudent.avatarUrl ? (
                  <img
                    className="student-profile-card__avatar-image"
                    src={resolvedStudent.avatarUrl}
                    alt={resolvedStudent.name}
                  />
                ) : (
                  <div className="student-profile-card__avatar">{resolvedStudent.firstName?.slice(0, 1) || 'K'}</div>
                )}

                <div>
                  <h2>{resolvedStudent.name}</h2>
                  <span>{resolvedStudent.role}</span>
                </div>
              </div>

              <div className="student-profile-card__bio">
                <p>{resolvedStudent.bio}</p>
                <p>{resolvedStudent.tagline}</p>
              </div>

              <div className="student-metric-grid">
                <div className="student-metric-card">
                  <strong>{resolvedStudent.completedCourses.length}</strong>
                  <span>Completed</span>
                </div>
                <div className="student-metric-card">
                  <strong>{resolvedStudent.certificateCount}</strong>
                  <span>Certificates</span>
                </div>
                <div className="student-metric-card">
                  <strong>{resolvedStudent.subjectCount}</strong>
                  <span>Subjects</span>
                </div>
              </div>

              <form className="student-inline-form" onSubmit={handleProfileSave}>
                <div className="student-inline-form__grid">
                  <label className="portal-form__field">
                    <span>Name change and edit</span>
                    <input type="text" name="name" value={profileForm.name} onChange={handleFormFieldChange(setProfileForm)} placeholder="Student name" />
                  </label>
                  <label className="portal-form__field">
                    <span>Upload profile photo URL</span>
                    <input type="url" name="avatarUrl" value={profileForm.avatarUrl} onChange={handleFormFieldChange(setProfileForm)} placeholder="https://example.com/photo.jpg" />
                  </label>
                  <label className="portal-form__field">
                    <span>Bio</span>
                    <input type="text" name="bio" value={profileForm.bio} onChange={handleFormFieldChange(setProfileForm)} placeholder="Profile bio" />
                  </label>
                  <label className="portal-form__field">
                    <span>Current goal</span>
                    <input type="text" name="tagline" value={profileForm.tagline} onChange={handleFormFieldChange(setProfileForm)} placeholder="Learning goal" />
                  </label>
                </div>
                <button type="submit" className="dashboard-page__button" disabled={isSavingDashboard}>
                  Save Profile
                </button>
              </form>
            </div>
          </section>

          <section className="student-panel" ref={coursesRef}>
            <div className="student-panel__header">
              <h2>Course Details</h2>
              <button type="button" onClick={() => handlePanelSelect('courses')}>
                Completed and current study
              </button>
            </div>

            <div className="student-split-grid">
              <div>
                <h3 className="student-section-title">Completed courses</h3>
                <div className="student-course-list">
                  {resolvedStudent.completedCourses.map((course) => (
                    <article key={course.id} className="student-course-card">
                      <div>
                        <h3>{course.title}</h3>
                        <p>{course.provider}</p>
                        <span>{course.status} . {course.dateLabel}</span>
                      </div>
                      <strong>{course.progress}%</strong>
                    </article>
                  ))}
                </div>
                <form className="student-inline-form" onSubmit={handleCompletedCourseSubmit}>
                  <input name="title" value={completedCourseForm.title} onChange={handleFormFieldChange(setCompletedCourseForm)} placeholder="Completed course name" />
                  <input name="provider" value={completedCourseForm.provider} onChange={handleFormFieldChange(setCompletedCourseForm)} placeholder="Center or teacher" />
                  <button type="submit" className="dashboard-page__button" disabled={isSavingDashboard}>Add Completed</button>
                </form>
              </div>

              <div>
                <h3 className="student-section-title">Current study details</h3>
                <div className="student-course-list">
                  {resolvedStudent.currentStudies.map((course) => (
                    <article key={course.id} className="student-course-card">
                      <div>
                        <h3>{course.title}</h3>
                        <p>{course.provider}</p>
                        <span>{course.status} . {course.dateLabel}</span>
                      </div>
                      <strong>{course.progress}%</strong>
                    </article>
                  ))}
                </div>
                <form className="student-inline-form" onSubmit={handleCurrentStudySubmit}>
                  <input name="title" value={currentStudyForm.title} onChange={handleFormFieldChange(setCurrentStudyForm)} placeholder="Current study name" />
                  <input name="provider" value={currentStudyForm.provider} onChange={handleFormFieldChange(setCurrentStudyForm)} placeholder="Center or teacher" />
                  <input name="progress" type="number" min="0" max="100" value={currentStudyForm.progress} onChange={handleFormFieldChange(setCurrentStudyForm)} placeholder="Progress %" />
                  <button type="submit" className="dashboard-page__button" disabled={isSavingDashboard}>Add Current</button>
                </form>
              </div>
            </div>
          </section>

          <section className="student-panel" ref={certificatesRef}>
            <div className="student-panel__header">
              <h2>Certificates</h2>
              <button type="button" onClick={() => handlePanelSelect('certificates')}>
                Saved certificates
              </button>
            </div>

            <div className="student-certificate-grid">
              {resolvedStudent.certificates.map((certificate) => (
                <article
                  key={certificate.id}
                  className={`student-certificate-card student-certificate-card--${certificate.accent}`}
                >
                  <span className="student-certificate-card__eyebrow">Certificate of Completion</span>
                  <h3>{certificate.title}</h3>
                  <p>{certificate.issuer}</p>
                  <span>{certificate.dateLabel}</span>
                  <button
                    type="button"
                    className="student-card-action"
                    onClick={() => handleDeleteDashboardItem('certificates', certificate.id, 'Certificate deleted.')}
                    disabled={isSavingDashboard}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>

            <form className="student-inline-form" onSubmit={handleCertificateSubmit}>
              <div className="student-inline-form__grid">
                <input name="title" value={certificateForm.title} onChange={handleFormFieldChange(setCertificateForm)} placeholder="Certificate title" />
                <input name="issuer" value={certificateForm.issuer} onChange={handleFormFieldChange(setCertificateForm)} placeholder="Issued by" />
                <input name="dateLabel" value={certificateForm.dateLabel} onChange={handleFormFieldChange(setCertificateForm)} placeholder="Date" />
                <select name="accent" value={certificateForm.accent} onChange={handleFormFieldChange(setCertificateForm)}>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="amber">Amber</option>
                  <option value="violet">Violet</option>
                </select>
              </div>
              <button type="submit" className="dashboard-page__button" disabled={isSavingDashboard}>
                Upload Certificate
              </button>
            </form>
          </section>

          <section className="student-panel" ref={discussionRef}>
            <div className="student-panel__header">
              <h2>Discussion Message</h2>
              <button type="button" onClick={() => handlePanelSelect('discussion')}>
                Student inbox
              </button>
            </div>

            <div className="student-message-list">
              {resolvedStudent.messages.map((message) => (
                <article key={message.id} className="student-message-card">
                  <h3>{message.title}</h3>
                  <p>{message.excerpt}</p>
                  <span>{message.timeLabel}</span>
                </article>
              ))}
            </div>

            <form className="student-inline-form" onSubmit={handleMessageSubmit}>
              <input name="title" value={messageForm.title} onChange={handleFormFieldChange(setMessageForm)} placeholder="Discussion title" />
              <textarea name="excerpt" value={messageForm.excerpt} onChange={handleFormFieldChange(setMessageForm)} placeholder="Write discussion message" rows="3" />
              <button type="submit" className="dashboard-page__button" disabled={isSavingDashboard}>Post Message</button>
            </form>
          </section>

          <section className="student-panel" ref={friendsRef}>
            <div className="student-panel__header">
              <h2>Invite Friends</h2>
              <button type="button" onClick={() => handlePanelSelect('friends')}>
                Following model
              </button>
            </div>

            <div className="student-social-grid">
              {[...resolvedStudent.friends, ...resolvedStudent.friendSuggestions].map((friend) => (
                <article key={friend.id} className="student-social-card">
                  <div className="student-social-card__avatar">{friend.name?.slice(0, 1) || 'S'}</div>
                  <div>
                    <h3>{friend.name}</h3>
                    <p>{friend.handle}</p>
                    <span>{friend.relation === 'follower' ? 'Follower' : friend.relation === 'suggested' ? 'Suggested friend' : 'Following'}</span>
                  </div>
                </article>
              ))}
            </div>

            <form className="student-inline-form" onSubmit={handleFriendSubmit}>
              <div className="student-inline-form__grid">
                <input name="name" value={friendForm.name} onChange={handleFormFieldChange(setFriendForm)} placeholder="Friend name" />
                <input name="handle" value={friendForm.handle} onChange={handleFormFieldChange(setFriendForm)} placeholder="@friend" />
                <select name="relation" value={friendForm.relation} onChange={handleFormFieldChange(setFriendForm)}>
                  <option value="following">Following</option>
                  <option value="follower">Follower</option>
                </select>
              </div>
              <button type="submit" className="dashboard-page__button" disabled={isSavingDashboard}>Invite Friend</button>
            </form>

            <div className="student-group-area">
              <h3 className="student-section-title">Friends group discussion</h3>
              <div className="student-social-grid">
                {resolvedStudent.groups.map((group) => (
                  <article key={group.id} className="student-group-card">
                    <h3>{group.name}</h3>
                    <p>{group.topic}</p>
                    <span>{group.memberCount} members . {group.lastMessage}</span>
                  </article>
                ))}
              </div>
              <form className="student-inline-form" onSubmit={handleGroupSubmit}>
                <input name="name" value={groupForm.name} onChange={handleFormFieldChange(setGroupForm)} placeholder="Group name" />
                <input name="topic" value={groupForm.topic} onChange={handleFormFieldChange(setGroupForm)} placeholder="Discussion topic" />
                <button type="submit" className="dashboard-page__button" disabled={isSavingDashboard}>Create Group</button>
              </form>
            </div>
          </section>

          <section className="student-panel" ref={storiesRef}>
            <div className="student-panel__header">
              <h2>Daily Story</h2>
              <button type="button" onClick={() => handlePanelSelect('stories')}>
                Video and certificate updates
              </button>
            </div>

            <div className="student-story-grid">
              {resolvedStudent.stories.map((story) => (
                <article key={story.id} className="student-story-card">
                  <div className="student-story-card__preview">
                    {story.mediaUrl ? <iframe src={story.mediaUrl} title={story.title} loading="lazy" /> : <span>Certificate</span>}
                  </div>
                  <h3>{story.title}</h3>
                  <p>{story.mediaType}</p>
                  <button
                    type="button"
                    className="student-card-action"
                    onClick={() => handleDeleteDashboardItem('stories', story.id, 'Story deleted.')}
                    disabled={isSavingDashboard}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>

            <form className="student-inline-form" onSubmit={handleStorySubmit}>
              <div className="student-inline-form__grid">
                <input name="title" value={storyForm.title} onChange={handleFormFieldChange(setStoryForm)} placeholder="Story title" />
                <select name="mediaType" value={storyForm.mediaType} onChange={handleFormFieldChange(setStoryForm)}>
                  <option value="video">Video</option>
                  <option value="certificate">Certificate</option>
                </select>
                <input name="mediaUrl" value={storyForm.mediaUrl} onChange={handleFormFieldChange(setStoryForm)} placeholder="Video embed or certificate URL" />
              </div>
              <button type="submit" className="dashboard-page__button" disabled={isSavingDashboard}>Update Story</button>
            </form>
          </section>

          <section className="student-panel" ref={applicationsRef}>
            <div className="student-panel__header">
              <h2>College Apply Status</h2>
              <button type="button" onClick={() => handlePanelSelect('applications')}>
                Track applications
              </button>
            </div>

            <div className="student-application-list">
              {resolvedStudent.applicationStatuses.map((application) => (
                <article key={application.id} className="student-application-card">
                  <div>
                    <h3>{application.college}</h3>
                    <p>{application.course}</p>
                    <span>{application.updatedLabel}</span>
                  </div>
                  <strong>{application.status}</strong>
                </article>
              ))}
            </div>

            <form className="student-inline-form" onSubmit={handleApplicationSubmit}>
              <div className="student-inline-form__grid">
                <input name="college" value={applicationForm.college} onChange={handleFormFieldChange(setApplicationForm)} placeholder="College name" />
                <input name="course" value={applicationForm.course} onChange={handleFormFieldChange(setApplicationForm)} placeholder="Course name" />
                <select name="status" value={applicationForm.status} onChange={handleFormFieldChange(setApplicationForm)}>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <button type="submit" className="dashboard-page__button" disabled={isSavingDashboard}>Save Status</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
