import bcrypt from 'bcrypt';
import User from '../model/studentloginModel.js';
import { sendInternalServerError } from '../utils/httpError.js';
import { createStudentToken, extractBearerToken, verifyStudentToken } from '../utils/studentToken.js';

const defaultAchievements = [
  {
    title: 'Top Learner',
    description: 'Completed 10 courses',
    dateLabel: 'May 2024',
    accent: 'gold'
  },
  {
    title: '7 Days Streak',
    description: 'Studied 7 days in a row',
    dateLabel: 'May 2024',
    accent: 'blue'
  },
  {
    title: 'Quick Helper',
    description: 'Helped 15+ students',
    dateLabel: 'April 2024',
    accent: 'green'
  }
];

const defaultCertificates = [
  {
    title: 'React.js Developer',
    issuer: 'Issued by DevTown',
    dateLabel: 'April 2024',
    accent: 'blue'
  },
  {
    title: 'JavaScript Essentials',
    issuer: 'Issued by Udemy',
    dateLabel: 'March 2024',
    accent: 'amber'
  },
  {
    title: 'HTML & CSS Basics',
    issuer: 'Issued by Sololearn',
    dateLabel: 'Feb 2024',
    accent: 'green'
  }
];

const defaultMessages = [
  {
    title: 'Project mentor message',
    excerpt: 'Keep building your practice projects and upload your latest portfolio link this week.',
    timeLabel: 'Today'
  },
  {
    title: 'Certificate reminder',
    excerpt: 'Your next certificate challenge opens on Friday. Stay ready for the assessment.',
    timeLabel: 'Yesterday'
  }
];

const defaultCompletedCourses = [
  {
    title: 'React Basics',
    provider: 'What Next Academy',
    status: 'Completed',
    dateLabel: 'May 2026',
    progress: 100
  },
  {
    title: 'Communication Skills',
    provider: 'Campus Career Club',
    status: 'Completed',
    dateLabel: 'April 2026',
    progress: 100
  }
];

const defaultCurrentStudies = [
  {
    title: 'Node.js and MongoDB',
    provider: 'Full Stack Track',
    status: 'Studying',
    dateLabel: 'Week 4',
    progress: 62
  },
  {
    title: 'College Interview Preparation',
    provider: 'Counselling Team',
    status: 'In progress',
    dateLabel: 'Today',
    progress: 45
  }
];

const defaultFriends = [
  { name: 'Aarav Kumar', handle: '@aarav.learns', relation: 'following' },
  { name: 'Meera S', handle: '@meera.codes', relation: 'following' },
  { name: 'Nithin Raj', handle: '@nithin.next', relation: 'follower' }
];

const defaultFriendSuggestions = [
  { name: 'Priya Career Lab', handle: '@priya.career', relation: 'suggested' },
  { name: 'Arun Design School', handle: '@arun.design', relation: 'suggested' }
];

const defaultGroups = [
  {
    name: 'Full Stack Study Circle',
    topic: 'Project doubts and daily practice',
    memberCount: 12,
    lastMessage: 'Share your certificate after each module.'
  },
  {
    name: 'College Apply Friends',
    topic: 'Application updates and counselling',
    memberCount: 8,
    lastMessage: 'Update the group when your college status changes.'
  }
];

const defaultStories = [
  {
    title: 'Today study update',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    timeLabel: 'Today'
  },
  {
    title: 'Certificate shared',
    mediaType: 'certificate',
    mediaUrl: '',
    timeLabel: 'Yesterday'
  }
];

const defaultApplicationStatuses = [
  {
    college: 'CMS College',
    course: 'B.Sc Computer Science',
    status: 'Under Review',
    updatedLabel: 'Updated today'
  },
  {
    college: 'Livewire Training Center',
    course: 'Full Stack Development',
    status: 'Applied',
    updatedLabel: 'Updated yesterday'
  }
];

const editableCollections = new Set([
  'certificates',
  'messages',
  'completedCourses',
  'currentStudies',
  'friends',
  'friendSuggestions',
  'groups',
  'stories',
  'applicationStatuses'
]);

function createDefaultStudentProfile(name) {
  return {
    bio: 'Passionate about full stack development.',
    tagline: 'Learning every day and building my future.',
    avatarUrl: '',
    achievementCount: 12,
    certificateCount: 8,
    subjectCount: 5,
    achievements: defaultAchievements,
    certificates: defaultCertificates,
    messages: defaultMessages,
    completedCourses: defaultCompletedCourses,
    currentStudies: defaultCurrentStudies,
    friends: defaultFriends,
    friendSuggestions: defaultFriendSuggestions,
    groups: defaultGroups,
    stories: defaultStories,
    applicationStatuses: defaultApplicationStatuses
  };
}

function withIds(items = [], prefix) {
  return items.map((item, index) => ({
    ...(typeof item?.toObject === 'function' ? item.toObject() : item),
    id: item.id || `${prefix}-${index + 1}`
  }));
}

function buildSafeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email
  };
}

function buildAuthPayload(user) {
  return {
    token: createStudentToken(user),
    user: buildSafeUser(user),
    student: buildStudentDashboard(user)
  };
}

function buildStudentDashboard(user) {
  const defaultProfile = createDefaultStudentProfile(user?.name || 'Kavin');
  const firstName = user?.name?.split(/\s+/)[0] || 'Kavin';

  return {
    id: user?._id ? String(user._id) : 'demo-student',
    name: user?.name || 'Kavin',
    firstName,
    email: user?.email || 'kavin@whatnext.app',
    role: 'Student',
    bio: user?.bio || defaultProfile.bio,
    tagline: user?.tagline || defaultProfile.tagline,
    avatarUrl: user?.avatarUrl || '',
    achievementCount: user?.achievementCount || defaultProfile.achievementCount,
    certificateCount: user?.certificateCount || defaultProfile.certificateCount,
    subjectCount: user?.subjectCount || defaultProfile.subjectCount,
    achievements: withIds(user?.achievements?.length ? user.achievements : defaultProfile.achievements, 'achievement'),
    certificates: withIds(user?.certificates?.length ? user.certificates : defaultProfile.certificates, 'certificate'),
    messages: withIds(user?.messages?.length ? user.messages : defaultProfile.messages, 'message'),
    completedCourses: withIds(
      user?.completedCourses?.length ? user.completedCourses : defaultProfile.completedCourses,
      'completed-course'
    ),
    currentStudies: withIds(
      user?.currentStudies?.length ? user.currentStudies : defaultProfile.currentStudies,
      'current-study'
    ),
    friends: withIds(user?.friends?.length ? user.friends : defaultProfile.friends, 'friend'),
    friendSuggestions: withIds(
      user?.friendSuggestions?.length ? user.friendSuggestions : defaultProfile.friendSuggestions,
      'friend-suggestion'
    ),
    groups: withIds(user?.groups?.length ? user.groups : defaultProfile.groups, 'group'),
    stories: withIds(user?.stories?.length ? user.stories : defaultProfile.stories, 'story'),
    applicationStatuses: withIds(
      user?.applicationStatuses?.length ? user.applicationStatuses : defaultProfile.applicationStatuses,
      'application'
    )
  };
}

async function findStudentFromRequest(req, res) {
  const token = extractBearerToken(req.headers.authorization || '');
  const tokenPayload = token ? verifyStudentToken(token) : null;
  const fallbackEmail = cleanText(req.body?.email || req.query?.email).toLowerCase();

  if (tokenPayload) {
    const tokenUser = await User.findById(tokenPayload.sub);

    if (!tokenUser) {
      res.status(404).json({
        success: false,
        message: 'Student account not found. Please sign in again.'
      });
      return null;
    }

    return tokenUser;
  }

  if (token && !tokenPayload) {
    res.status(401).json({
      success: false,
      message: 'Student session expired. Please sign in again.'
    });
    return null;
  }

  if (!fallbackEmail) {
    res.status(401).json({
      success: false,
      message: 'Please sign in to update the student dashboard.'
    });
    return null;
  }

  const user = await User.findOne({ email: fallbackEmail });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Student account not found for this email.'
    });
    return null;
  }

  return user;
}

function cleanText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeCollectionItem(collection, body) {
  const nowLabel = 'Just now';

  if (collection === 'certificates') {
    return {
      title: cleanText(body.title, 'Uploaded Certificate'),
      issuer: cleanText(body.issuer, 'Uploaded by student'),
      dateLabel: cleanText(body.dateLabel, nowLabel),
      accent: cleanText(body.accent, 'blue')
    };
  }

  if (collection === 'messages') {
    return {
      title: cleanText(body.title, 'Discussion message'),
      excerpt: cleanText(body.excerpt || body.message, ''),
      timeLabel: cleanText(body.timeLabel, nowLabel)
    };
  }

  if (collection === 'completedCourses' || collection === 'currentStudies') {
    return {
      title: cleanText(body.title, 'Course update'),
      provider: cleanText(body.provider, 'What Next'),
      status: cleanText(body.status, collection === 'completedCourses' ? 'Completed' : 'Studying'),
      dateLabel: cleanText(body.dateLabel, nowLabel),
      progress: Number.isFinite(Number(body.progress)) ? Math.max(0, Math.min(100, Number(body.progress))) : 0
    };
  }

  if (collection === 'friends' || collection === 'friendSuggestions') {
    return {
      name: cleanText(body.name, 'New Friend'),
      handle: cleanText(body.handle, '@whatnext.friend'),
      avatarUrl: cleanText(body.avatarUrl),
      relation: cleanText(body.relation, collection === 'friends' ? 'following' : 'suggested')
    };
  }

  if (collection === 'groups') {
    return {
      name: cleanText(body.name, 'New Study Group'),
      topic: cleanText(body.topic, 'Discussion group'),
      memberCount: Number.isFinite(Number(body.memberCount)) ? Math.max(1, Number(body.memberCount)) : 1,
      lastMessage: cleanText(body.lastMessage, 'Group created for student discussions.')
    };
  }

  if (collection === 'stories') {
    return {
      title: cleanText(body.title, 'Daily story update'),
      mediaType: cleanText(body.mediaType, 'video'),
      mediaUrl: cleanText(body.mediaUrl),
      timeLabel: cleanText(body.timeLabel, nowLabel)
    };
  }

  return {
    college: cleanText(body.college, 'College name'),
    course: cleanText(body.course, 'Course name'),
    status: cleanText(body.status, 'Applied'),
    updatedLabel: cleanText(body.updatedLabel, nowLabel)
  };
}

function getIndexedCollection(user, collection) {
  return buildStudentDashboard(user)[collection] || [];
}

function findCollectionIndex(user, collection, itemId) {
  const indexedItems = getIndexedCollection(user, collection);
  return indexedItems.findIndex((item) => item.id === itemId);
}

function syncStudentCounts(user, collection) {
  if (collection === 'certificates') {
    user.certificateCount = user[collection].length;
  }

  if (collection === 'completedCourses' || collection === 'currentStudies') {
    user.subjectCount = user.completedCourses.length + user.currentStudies.length;
  }
}

export const registerUser = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultProfile = createDefaultStudentProfile(name);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      bio: defaultProfile.bio,
      tagline: defaultProfile.tagline,
      avatarUrl: defaultProfile.avatarUrl,
      achievementCount: defaultProfile.achievementCount,
      certificateCount: defaultProfile.certificateCount,
      subjectCount: defaultProfile.subjectCount,
      achievements: defaultProfile.achievements,
      certificates: defaultProfile.certificates,
      messages: defaultProfile.messages,
      completedCourses: defaultProfile.completedCourses,
      currentStudies: defaultProfile.currentStudies,
      friends: defaultProfile.friends,
      friendSuggestions: defaultProfile.friendSuggestions,
      groups: defaultProfile.groups,
      stories: defaultProfile.stories,
      applicationStatuses: defaultProfile.applicationStatuses
    });

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      ...buildAuthPayload(user)
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'student_controller_failed');
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const user = await findStudentFromRequest(req, res);

    if (!user) {
      return;
    }

    const nextName = cleanText(req.body.name);

    if (nextName) {
      user.name = nextName;
    }

    user.bio = cleanText(req.body.bio, user.bio);
    user.tagline = cleanText(req.body.tagline, user.tagline);
    user.avatarUrl = cleanText(req.body.avatarUrl, user.avatarUrl);

    await user.save();

    return res.json({
      success: true,
      message: 'Student profile updated',
      student: buildStudentDashboard(user)
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'student_controller_failed');
  }
};

export const addStudentCollectionItem = async (req, res) => {
  try {
    const collection = req.params.collection;

    if (!editableCollections.has(collection)) {
      return res.status(404).json({ success: false, message: 'Student dashboard section not found.' });
    }

    const user = await findStudentFromRequest(req, res);

    if (!user) {
      return;
    }

    user[collection].unshift(normalizeCollectionItem(collection, req.body || {}));
    syncStudentCounts(user, collection);

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Student dashboard updated',
      student: buildStudentDashboard(user)
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'student_controller_failed');
  }
};

export const updateStudentCollectionItem = async (req, res) => {
  try {
    const collection = req.params.collection;
    const itemId = req.params.itemId;

    if (!editableCollections.has(collection)) {
      return res.status(404).json({ success: false, message: 'Student dashboard section not found.' });
    }

    const user = await findStudentFromRequest(req, res);

    if (!user) {
      return;
    }

    const itemIndex = findCollectionIndex(user, collection, itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'This student item was not found.' });
    }

    user[collection].set(itemIndex, normalizeCollectionItem(collection, req.body || {}));
    syncStudentCounts(user, collection);

    await user.save();

    return res.json({
      success: true,
      message: 'Student dashboard item updated',
      student: buildStudentDashboard(user)
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'student_controller_failed');
  }
};

export const deleteStudentCollectionItem = async (req, res) => {
  try {
    const collection = req.params.collection;
    const itemId = req.params.itemId;

    if (!editableCollections.has(collection)) {
      return res.status(404).json({ success: false, message: 'Student dashboard section not found.' });
    }

    const user = await findStudentFromRequest(req, res);

    if (!user) {
      return;
    }

    const itemIndex = findCollectionIndex(user, collection, itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'This student item was not found.' });
    }

    user[collection].splice(itemIndex, 1);
    syncStudentCounts(user, collection);

    await user.save();

    return res.json({
      success: true,
      message: 'Student item deleted',
      student: buildStudentDashboard(user)
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'student_controller_failed');
  }
};

export const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      ...buildAuthPayload(user)
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'student_controller_failed');
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    const token = extractBearerToken(req.headers.authorization || '');
    const tokenPayload = token ? verifyStudentToken(token) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in to view the student dashboard.'
      });
    }

    if (!tokenPayload) {
      return res.status(401).json({
        success: false,
        message: 'Student session expired. Please sign in again.'
      });
    }

    const user = await User.findById(tokenPayload.sub).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found. Please sign in again.'
      });
    }

    return res.json({
      success: true,
      student: buildStudentDashboard(user)
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'student_controller_failed');
  }
};
