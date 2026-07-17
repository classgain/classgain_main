import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import EducationCenterUpload from '../model/educationCenterUploadModel.js';
import EducationItem from '../model/educationItemModel.js';
import EducationPartner from '../model/educationPartnerModel.js';
import VideoUploaderChannel from '../model/videoUploaderChannelModel.js';
import User from '../model/studentloginModel.js';
import { sendInternalServerError } from '../utils/httpError.js';
import { createPartnerToken, extractBearerToken, verifyPartnerToken } from '../utils/partnerToken.js';
import { normalizeEducationCategory } from '../utils/educationCategories.js';

const defaultCourseTemplates = [
  { name: 'B.E - Mechanical Engineering', duration: '4 Years', intake: 60, fee: 'Rs. 75,000', status: 'Active' },
  { name: 'B.E - Civil Engineering', duration: '4 Years', intake: 60, fee: 'Rs. 75,000', status: 'Active' },
  { name: 'B.E - Computer Science Engineering', duration: '4 Years', intake: 60, fee: 'Rs. 85,000', status: 'Active' },
  { name: 'B.Tech - Information Technology', duration: '4 Years', intake: 60, fee: 'Rs. 85,000', status: 'Inactive' }
];

const defaultScholarshipTemplates = [
  {
    name: 'Merit Scholarship 2024',
    type: 'Merit Based',
    eligibility: '80% & above in 12th',
    benefit: '50% Tuition Fee',
    status: 'Active'
  },
  {
    name: 'Sports Scholarship',
    type: 'Sports Based',
    eligibility: 'State / National Level',
    benefit: '30% Tuition Fee',
    status: 'Active'
  },
  {
    name: 'Government Scholarship',
    type: 'Government',
    eligibility: 'As per Govt. Norms',
    benefit: 'Full / Partial Fee',
    status: 'Active'
  },
  {
    name: 'Special Scholarship (SC/ST)',
    type: 'Category Based',
    eligibility: 'SC / ST Students',
    benefit: '100% Tuition Fee',
    status: 'Inactive'
  }
];

const defaultApplicantTemplates = [
  {
    studentName: 'Arun K',
    mobile: '9876543210',
    email: 'arun@gmail.com',
    status: 'New',
    address: '14 Lake View Street, Salem, Tamil Nadu',
    currentStudy: 'Class 12 completed',
    completedStudy: 'Class 12 - State Board',
    completedStudyPercentage: '86%',
    previousEducation: 'Class 12 - State Board',
    marks: '86%',
    scholarshipInterest: true,
    statement: 'Looking for a mechanical engineering seat with hostel support and scholarship assistance.',
    notes: 'Parent called for campus visit.'
  },
  {
    studentName: 'Priya S',
    mobile: '9123456780',
    email: 'priya.s@gmail.com',
    status: 'Under Review',
    address: '22 Bharathi Nagar, Erode, Tamil Nadu',
    currentStudy: 'Class 12 completed',
    completedStudy: 'Class 12 - CBSE',
    completedStudyPercentage: '91%',
    previousEducation: 'Class 12 - CBSE',
    marks: '91%',
    scholarshipInterest: true,
    statement: 'Interested in CSE with a strong scholarship option and coding club support.',
    notes: 'Documents verified.'
  },
  {
    studentName: 'Karthik M',
    mobile: '9345678901',
    email: 'karthikm@gmail.com',
    status: 'Accepted',
    address: '9 Gandhi Road, Karur, Tamil Nadu',
    currentStudy: 'Diploma completed',
    completedStudy: 'Diploma - Information Technology',
    completedStudyPercentage: '82%',
    previousEducation: 'Diploma - Information Technology',
    marks: '82%',
    scholarshipInterest: false,
    statement: 'Wants direct lateral entry and placement-focused training.',
    notes: 'Admission approved.'
  },
  {
    studentName: 'Logesh R',
    mobile: '9090909090',
    email: 'logesh.r@gmail.com',
    status: 'Rejected',
    address: '11 West Main Street, Namakkal, Tamil Nadu',
    currentStudy: 'Class 12 completed',
    completedStudy: 'Class 12 - State Board',
    completedStudyPercentage: '67%',
    previousEducation: 'Class 12 - State Board',
    marks: '67%',
    scholarshipInterest: true,
    statement: 'Requested civil engineering counseling and scholarship review.',
    notes: 'Waiting list closed.'
  }
];

const genericEmailProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
const educationCenterRole = 'education-center';
const videoUploaderRole = 'video-uploader';

function createId(prefix) {
  return `${prefix}-${randomUUID().split('-')[0]}`;
}

function normalizeOptionalText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizePositiveNumber(value, fallback = 0) {
  const parsedNumber = Number(value);

  if (Number.isNaN(parsedNumber) || parsedNumber < 0) {
    return fallback;
  }

  return parsedNumber;
}

function formatDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function sanitizePartner(partner) {
  return {
    id: String(partner._id),
    role: partner.role,
    contactPerson: partner.contactPerson,
    organizationName: partner.organizationName,
    officialEmail: partner.officialEmail,
    phone: partner.phone,
    status: partner.status || 'Pending'
  };
}

function splitCourseNames(courseList) {
  return (courseList || '')
    .split(/[\n,|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getDefaultCourseTemplate(index) {
  return defaultCourseTemplates[index] || defaultCourseTemplates[defaultCourseTemplates.length - 1];
}

function normalizeCourseStatus(status) {
  return status === 'Inactive' ? 'Inactive' : 'Active';
}

function normalizeApplicationStatus(status) {
  return ['New', 'Under Review', 'Accepted', 'Rejected'].includes(status) ? status : 'New';
}

function hasApprovedEducationCenterAccess(partner) {
  return partner.role !== educationCenterRole || partner.status === 'Approved';
}

function createDefaultCourses(courseNames = []) {
  const resolvedNames = courseNames.length ? courseNames.slice(0, 8) : defaultCourseTemplates.map((item) => item.name);

  return resolvedNames.map((name, index) => {
    const template = getDefaultCourseTemplate(index);

    return {
      id: createId('course'),
      name,
      duration: template.duration,
      intake: template.intake,
      fee: template.fee,
      status: template.status
    };
  });
}

function createDefaultScholarships() {
  return defaultScholarshipTemplates.map((item) => ({
    id: createId('scholarship'),
    ...item
  }));
}

function createDefaultApplications(courseNames = [], scholarshipNames = []) {
  const resolvedCourseNames = courseNames.length ? courseNames : defaultCourseTemplates.map((item) => item.name);

  return defaultApplicantTemplates.map((template, index) => ({
    id: createId('application'),
    studentName: template.studentName,
    course: resolvedCourseNames[index % resolvedCourseNames.length],
    mobile: template.mobile,
    email: template.email,
    status: template.status,
    appliedOn: formatDateLabel(new Date(Date.now() - index * 86400000)),
    address: template.address,
    currentStudy: template.currentStudy,
    completedStudy: template.completedStudy,
    completedStudyPercentage: template.completedStudyPercentage,
    previousEducation: template.previousEducation,
    marks: template.marks,
    scholarshipInterest: template.scholarshipInterest,
    scholarshipName: template.scholarshipInterest
      ? scholarshipNames[index % Math.max(1, scholarshipNames.length)] || 'Merit Scholarship 2024'
      : '',
    statement: template.statement,
    notes: template.notes
  }));
}

function createDefaultGalleryImages(profile = {}) {
  const candidates = [
    { title: 'Campus Front', image: profile.image || '' },
    { title: 'College Profile', image: profile.profileImage || '' }
  ].filter((item) => item.image);

  return candidates.map((item) => ({
    id: createId('image'),
    title: item.title,
    image: item.image
  }));
}

function createDefaultVideoItems(profile = {}) {
  if (!profile.promoVideoUrl) {
    return [];
  }

  return [
    {
      id: createId('video'),
      title: 'Campus Overview',
      image: profile.image || profile.profileImage || '',
      videoUrl: profile.promoVideoUrl,
      duration: '2:30'
    }
  ];
}

function buildWebsite(partner, profile) {
  const email = partner?.officialEmail || profile?.contactEmail || '';
  const domain = email.split('@')[1] || '';

  if (domain && !genericEmailProviders.includes(domain)) {
    return `www.${domain.replace(/^www\./, '')}`;
  }

  return 'www.whatnextcampus.edu.in';
}

function buildRecentActivity(courses, scholarships, applications, images, videos) {
  const activity = [];

  if (applications[0]) {
    activity.push({
      id: 'activity-1',
      icon: 'applications',
      title: `New application from ${applications[0].studentName}`,
      timeLabel: applications[0].appliedOn || 'Today'
    });
  }

  if (scholarships[0]) {
    activity.push({
      id: 'activity-2',
      icon: 'scholarship',
      title: `${scholarships[0].name} is ${scholarships[0].status.toLowerCase()}`,
      timeLabel: 'Recently updated'
    });
  }

  if (courses[0]) {
    activity.push({
      id: 'activity-3',
      icon: 'courses',
      title: `${courses[0].name} is ready for student admissions`,
      timeLabel: 'Dashboard sync'
    });
  }

  if (!activity.length && (images[0] || videos[0])) {
    activity.push({
      id: 'activity-media',
      icon: images[0] ? 'image' : 'video',
      title: images[0] ? 'Campus image uploaded' : 'Center video uploaded',
      timeLabel: 'Latest media'
    });
  }

  return activity;
}

function buildOverview(courses, scholarships, applications) {
  return {
    totalCourses: courses.length,
    applications: applications.length,
    scholarships: scholarships.length,
    enquiries: applications.filter((item) => ['New', 'Under Review'].includes(item.status)).length
  };
}

function buildDashboardPayload(partner, profile) {
  const courseNames = splitCourseNames(profile?.courseList);
  const courses = profile?.courses?.length ? profile.courses.map((item) => ({ ...item })) : createDefaultCourses(courseNames);
  const scholarships = profile?.scholarships?.length
    ? profile.scholarships.map((item) => ({ ...item }))
    : createDefaultScholarships();
  const applications = profile?.applications?.length
    ? profile.applications.map((item) => ({ ...item }))
    : createDefaultApplications(
        courses.map((course) => course.name),
        scholarships.map((scholarship) => scholarship.name)
      );
  const images = profile?.galleryImages?.length
    ? profile.galleryImages.map((item) => ({ ...item }))
    : createDefaultGalleryImages(profile);
  const videos = profile?.videoItems?.length ? profile.videoItems.map((item) => ({ ...item })) : createDefaultVideoItems(profile);
  const heroImage = profile?.image || images[0]?.image || '';
  const logoImage = profile?.profileImage || images[1]?.image || heroImage;

  return {
    partner: partner ? sanitizePartner(partner) : null,
    profile: {
      id: profile?._id ? String(profile._id) : 'demo-education-center',
      categoryKey: profile?.categoryKey || 'secondary',
      centerName: profile?.educationCenterName || partner?.organizationName || 'What Next Education Center',
      address: profile?.address || 'Update your center address from the education dashboard.',
      heroImage,
      logoImage,
      website: buildWebsite(partner, profile),
      contactEmail: profile?.contactEmail || partner?.officialEmail || 'info@whatnextcampus.edu.in',
      phone: profile?.phone || partner?.phone || '+91 98765 43210',
      description:
        profile?.description ||
        'A student-focused education center with faculty guidance, scholarships, and admissions support.',
      courseType: profile?.courseType || 'Higher Education',
      courseCount: courses.length,
      courseList: courses.map((course) => course.name).join(', ')
    },
    overview: buildOverview(courses, scholarships, applications),
    recentActivity: buildRecentActivity(courses, scholarships, applications, images, videos),
    courses,
    images,
    videos,
    applications,
    scholarships
  };
}

function buildPartnerAuthPayload(partner, profile) {
  return {
    token: createPartnerToken(partner),
    partner: sanitizePartner(partner),
    dashboard: profile ? buildDashboardPayload(partner, profile.toObject ? profile.toObject() : profile) : undefined
  };
}

function createEducationCenterProfileSeed(partner, overrides = {}) {
  const normalizedCategory =
    normalizeEducationCategory(overrides.categoryKey, overrides.courseType) || {
      categoryKey: 'secondary',
      courseType: 'Higher Education'
    };
  const courseNames = splitCourseNames(overrides.courseList);
  const courses = createDefaultCourses(courseNames);
  const scholarships = createDefaultScholarships();
  const applications = createDefaultApplications(
    courses.map((course) => course.name),
    scholarships.map((scholarship) => scholarship.name)
  );
  const seedProfile = {
    partnerId: partner?._id,
    categoryKey: normalizedCategory.categoryKey,
    image: overrides.image || '',
    profileImage: overrides.profileImage || '',
    educationCenterName: overrides.educationCenterName || partner?.organizationName || 'What Next Education Center',
    address: overrides.address || 'Update your center address from the education dashboard.',
    courseType: normalizedCategory.courseType,
    courseCount: courses.length,
    courseList: courses.map((course) => course.name).join(', '),
    description:
      overrides.description ||
      'A student-focused education center with faculty guidance, scholarships, and admissions support.',
    promoVideoUrl: overrides.promoVideoUrl || '',
    contactEmail: overrides.contactEmail || partner?.officialEmail || '',
    phone: overrides.phone || partner?.phone || '',
    courses,
    scholarships,
    applications,
    galleryImages: createDefaultGalleryImages(overrides),
    videoItems: createDefaultVideoItems(overrides)
  };

  if (seedProfile.galleryImages[0]?.image && !seedProfile.image) {
    seedProfile.image = seedProfile.galleryImages[0].image;
  }

  if (seedProfile.galleryImages[1]?.image && !seedProfile.profileImage) {
    seedProfile.profileImage = seedProfile.galleryImages[1].image;
  }

  return seedProfile;
}

function mergeCourseNamesIntoRows(existingCourses, courseNames) {
  return courseNames.map((name, index) => {
    const existingCourse = existingCourses[index];
    const fallbackCourse = createDefaultCourses([name])[0];

    return {
      id: existingCourse?.id || fallbackCourse.id,
      name,
      duration: normalizeOptionalText(existingCourse?.duration, fallbackCourse.duration),
      intake: normalizePositiveNumber(existingCourse?.intake, fallbackCourse.intake),
      fee: normalizeOptionalText(existingCourse?.fee, fallbackCourse.fee),
      status: normalizeCourseStatus(existingCourse?.status || fallbackCourse.status)
    };
  });
}

function syncProfileSummary(profile, partner) {
  const courseNames = (profile.courses || []).map((course) => course.name).filter(Boolean);
  profile.courseCount = courseNames.length;
  profile.courseList = courseNames.join(', ');

  if (!profile.contactEmail && partner?.officialEmail) {
    profile.contactEmail = partner.officialEmail;
  }

  if (!profile.phone && partner?.phone) {
    profile.phone = partner.phone;
  }

  if (!profile.educationCenterName && partner?.organizationName) {
    profile.educationCenterName = partner.organizationName;
  }

  if (!profile.image && profile.galleryImages?.[0]?.image) {
    profile.image = profile.galleryImages[0].image;
  }

  if (!profile.profileImage && profile.galleryImages?.[1]?.image) {
    profile.profileImage = profile.galleryImages[1].image;
  }

  if (!profile.promoVideoUrl && profile.videoItems?.[0]?.videoUrl) {
    profile.promoVideoUrl = profile.videoItems[0].videoUrl;
  }
}

async function hydrateEducationCenterProfile(profile, partner) {
  let hasChanges = false;
  const courseNamesFromList = splitCourseNames(profile.courseList);

  if (!profile.courses?.length) {
    profile.courses = createDefaultCourses(courseNamesFromList);
    hasChanges = true;
  }

  if (profile.courses?.length) {
    const normalizedCourses = profile.courses.map((course, index) => {
      const fallbackCourse = createDefaultCourses([course.name || getDefaultCourseTemplate(index).name])[0];

      return {
        id: course.id || fallbackCourse.id,
        name: normalizeOptionalText(course.name, fallbackCourse.name),
        duration: normalizeOptionalText(course.duration, fallbackCourse.duration),
        intake: normalizePositiveNumber(course.intake, fallbackCourse.intake),
        fee: normalizeOptionalText(course.fee, fallbackCourse.fee),
        status: normalizeCourseStatus(course.status || fallbackCourse.status)
      };
    });

    if (JSON.stringify(profile.courses) !== JSON.stringify(normalizedCourses)) {
      profile.courses = normalizedCourses;
      hasChanges = true;
    }
  }

  if (!profile.scholarships?.length) {
    profile.scholarships = createDefaultScholarships();
    hasChanges = true;
  }

  if (!profile.applications?.length) {
    profile.applications = createDefaultApplications(
      profile.courses.map((course) => course.name),
      profile.scholarships.map((scholarship) => scholarship.name)
    );
    hasChanges = true;
  }

  if (!profile.galleryImages?.length) {
    const galleryImages = createDefaultGalleryImages(profile.toObject ? profile.toObject() : profile);

    if (galleryImages.length) {
      profile.galleryImages = galleryImages;
      hasChanges = true;
    }
  }

  if (!profile.videoItems?.length) {
    const videoItems = createDefaultVideoItems(profile.toObject ? profile.toObject() : profile);

    if (videoItems.length) {
      profile.videoItems = videoItems;
      hasChanges = true;
    }
  }

  if (!profile.partnerId && partner?._id) {
    profile.partnerId = partner._id;
    hasChanges = true;
  }

  syncProfileSummary(profile, partner);

  if (hasChanges) {
    await profile.save();
  }

  return profile;
}

async function upsertEducationCenterPublicItem(partner, profile) {
  const normalizedCategory = normalizeEducationCategory(profile.categoryKey, profile.courseType) || {
    categoryKey: 'secondary',
    courseType: 'Higher Education',
    level: 'Secondary'
  };
  const publicItemId = `db-center-${profile._id}`;
  const description =
    normalizeOptionalText(profile.description) ||
    normalizeOptionalText(profile.courseList) ||
    `${profile.educationCenterName} uploaded through the education center dashboard.`;

  await EducationItem.findOneAndUpdate(
    { id: publicItemId },
    {
      id: publicItemId,
      category: normalizedCategory.categoryKey,
      title: profile.educationCenterName,
      level: normalizedCategory.level,
      description,
      address: profile.address,
      image: profile.image || profile.galleryImages?.[0]?.image || '',
      profileImage: profile.profileImage || profile.galleryImages?.[1]?.image || '',
      videoUrl: profile.promoVideoUrl || profile.videoItems?.[0]?.videoUrl || '',
      mediaType: 'Image & Video',
      badge: `${profile.courseType} Center`,
      courseCount: profile.courses?.length || profile.courseCount || 0,
      courseList: profile.courseList || (profile.courses || []).map((course) => course.name).join(', '),
      contactEmail: profile.contactEmail || partner?.officialEmail || '',
      phone: profile.phone || partner?.phone || '',
      source: 'education-center-upload'
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

async function saveEducationCenterProfile(profile, partner) {
  syncProfileSummary(profile, partner);
  await profile.save();
  await upsertEducationCenterPublicItem(partner, profile.toObject ? profile.toObject() : profile);
  return profile;
}

async function resolveAuthenticatedPartner(req, res, requiredRole = null) {
  const token = extractBearerToken(req.headers.authorization || '');

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Please sign in to continue.'
    });
    return null;
  }

  const tokenPayload = verifyPartnerToken(token);

  if (!tokenPayload) {
    res.status(401).json({
      success: false,
      message: 'Education center session expired. Please sign in again.'
    });
    return null;
  }

  const partner = await EducationPartner.findById(tokenPayload.sub);

  if (!partner) {
    res.status(404).json({
      success: false,
      message: 'Education center account not found.'
    });
    return null;
  }

  if (requiredRole && partner.role !== requiredRole) {
    res.status(403).json({
      success: false,
      message: 'This account does not have access to the education center dashboard.'
    });
    return null;
  }

  if (requiredRole === educationCenterRole && !hasApprovedEducationCenterAccess(partner)) {
    res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval.'
    });
    return null;
  }

  return partner;
}

async function resolvePartnerFromTokenOrBody(req, res, requiredRole = null) {
  const token = extractBearerToken(req.headers.authorization || '');

  if (token) {
    return await resolveAuthenticatedPartner(req, res, requiredRole);
  }

  const partnerId = req.body.partnerId;

  if (!partnerId) {
    res.status(401).json({
      success: false,
      message: 'Please sign in to continue.'
    });
    return null;
  }

  const partner = await EducationPartner.findById(partnerId);

  if (!partner) {
    res.status(404).json({
      success: false,
      message: 'Education center account not found.'
    });
    return null;
  }

  if (requiredRole && partner.role !== requiredRole) {
    res.status(403).json({
      success: false,
      message: 'This account does not have access to the education center dashboard.'
    });
    return null;
  }

  if (requiredRole === educationCenterRole && !hasApprovedEducationCenterAccess(partner)) {
    res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval.'
    });
    return null;
  }

  return partner;
}

async function resolveEducationCenterProfileForPartner(partner) {
  let profile = await EducationCenterUpload.findOne({ partnerId: partner._id }).sort({ updatedAt: -1, createdAt: -1 });

  if (!profile) {
    profile = await EducationCenterUpload.create(createEducationCenterProfileSeed(partner));
  }

  const hydratedProfile = await hydrateEducationCenterProfile(profile, partner);
  await upsertEducationCenterPublicItem(
    partner,
    hydratedProfile.toObject ? hydratedProfile.toObject() : hydratedProfile
  );

  return hydratedProfile;
}

export async function registerPartner(req, res) {
  try {
    const role = normalizeOptionalText(req.body.role, educationCenterRole);
    const organizationName = normalizeOptionalText(req.body.organizationName);
    const contactPerson = normalizeOptionalText(req.body.contactPerson);
    const governmentCode = normalizeOptionalText(req.body.governmentCode);
    const officialEmail = normalizeOptionalText(req.body.officialEmail).toLowerCase();
    const phone = normalizeOptionalText(req.body.phone);
    const password = normalizeOptionalText(req.body.password);

    if (!organizationName || !contactPerson || !governmentCode || !officialEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please complete all required registration fields.' });
    }

    if (![educationCenterRole, videoUploaderRole].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid registration type selected.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existingPartner = await EducationPartner.findOne({ officialEmail });

    if (existingPartner) {
      return res.status(409).json({ success: false, message: 'An account already exists for this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const partner = await EducationPartner.create({
      role,
      organizationName,
      contactPerson,
      governmentCode,
      officialEmail,
      phone,
      status: role === educationCenterRole ? 'Pending' : 'Approved',
      password: hashedPassword
    });

    if (role === educationCenterRole) {
      return res.status(201).json({
        success: true,
        message: 'Registration submitted. Your account is pending admin approval.',
        partner: sanitizePartner(partner)
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration completed successfully.',
      token: createPartnerToken(partner),
      partner: sanitizePartner(partner)
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function loginPartner(req, res) {
  try {
    const officialEmail = normalizeOptionalText(req.body.officialEmail).toLowerCase();
    const password = normalizeOptionalText(req.body.password);

    if (!officialEmail || !password) {
      return res.status(400).json({ success: false, message: 'Official email and password are required.' });
    }

    const partner = await EducationPartner.findOne({ officialEmail });

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Education center account not found.' });
    }

    const isMatch = await bcrypt.compare(password, partner.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    if (partner.role === educationCenterRole) {
      if (!hasApprovedEducationCenterAccess(partner)) {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending admin approval.'
        });
      }

      const profile = await resolveEducationCenterProfileForPartner(partner);

      return res.json({
        success: true,
        message: 'Education center login successful.',
        ...buildPartnerAuthPayload(partner, profile)
      });
    }

    return res.json({
      success: true,
      message: 'Partner login successful.',
      token: createPartnerToken(partner),
      partner: sanitizePartner(partner)
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function getEducationCenterDashboard(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);

    return res.json({
      success: true,
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function createEducationCenterProfile(req, res) {
  try {
    const partner = await resolvePartnerFromTokenOrBody(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const normalizedCategory = normalizeEducationCategory(req.body.categoryKey, req.body.courseType);
    const educationCenterName = normalizeOptionalText(req.body.educationCenterName, partner.organizationName);
    const address = normalizeOptionalText(req.body.address);
    const courseCount = normalizePositiveNumber(req.body.courseCount, 0);
    const description = normalizeOptionalText(
      req.body.description,
      `${educationCenterName} uploaded through the education center dashboard.`
    );
    const contactEmail = normalizeOptionalText(req.body.contactEmail, partner.officialEmail).toLowerCase();
    const phone = normalizeOptionalText(req.body.phone, partner.phone);
    const courseList = normalizeOptionalText(req.body.courseList);
    const courseNames = splitCourseNames(courseList);

    if (!normalizedCategory || !educationCenterName || !address || courseCount < 1) {
      return res.status(400).json({ success: false, message: 'Please complete the center upload form correctly.' });
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);

    profile.categoryKey = normalizedCategory.categoryKey;
    profile.educationCenterName = educationCenterName;
    profile.address = address;
    profile.courseType = normalizedCategory.courseType;
    profile.description = description;
    profile.contactEmail = contactEmail;
    profile.phone = phone;

    if (req.body.image) {
      profile.image = req.body.image;
    }

    if (req.body.profileImage) {
      profile.profileImage = req.body.profileImage;
    }

    if (req.body.promoVideoUrl) {
      profile.promoVideoUrl = normalizeOptionalText(req.body.promoVideoUrl);
    }

    if (courseNames.length) {
      profile.courses = mergeCourseNamesIntoRows(profile.courses || [], courseNames);
    } else if (!(profile.courses || []).length) {
      profile.courses = createDefaultCourses();
    }

    if (!(profile.scholarships || []).length) {
      profile.scholarships = createDefaultScholarships();
    }

    if (!(profile.applications || []).length) {
      profile.applications = createDefaultApplications(
        profile.courses.map((course) => course.name),
        profile.scholarships.map((scholarship) => scholarship.name)
      );
    }

    if (req.body.image) {
      const imageRecord = {
        id: createId('image'),
        title: 'Campus Front',
        image: req.body.image
      };

      profile.galleryImages = [
        imageRecord,
        ...(profile.galleryImages || []).filter((item) => item.image !== req.body.image)
      ];
    }

    if (req.body.profileImage) {
      const profileImageRecord = {
        id: createId('image'),
        title: 'College Profile',
        image: req.body.profileImage
      };

      profile.galleryImages = [
        profileImageRecord,
        ...(profile.galleryImages || []).filter((item) => item.image !== req.body.profileImage)
      ];
    }

    if (req.body.promoVideoUrl) {
      const promoVideo = {
        id: createId('video'),
        title: 'Campus Overview',
        image: profile.image || profile.profileImage || '',
        videoUrl: normalizeOptionalText(req.body.promoVideoUrl),
        duration: '2:30'
      };

      profile.videoItems = [
        promoVideo,
        ...(profile.videoItems || []).filter((item) => item.videoUrl !== promoVideo.videoUrl)
      ];
    }

    profile.courseCount = Math.max(courseCount, profile.courses.length);

    await saveEducationCenterProfile(profile, partner);

    return res.status(201).json({
      success: true,
      message: 'Education center profile saved.',
      profile,
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function createVideoChannelProfile(req, res) {
  try {
    const partner = await resolvePartnerFromTokenOrBody(req, res);

    if (!partner) {
      return undefined;
    }

    const channelName = normalizeOptionalText(req.body.channelName);
    const ownerName = normalizeOptionalText(req.body.ownerName);
    const videoCategory = normalizeOptionalText(req.body.videoCategory);
    const introVideoUrl = normalizeOptionalText(req.body.introVideoUrl);
    const uploadCount = normalizePositiveNumber(req.body.uploadCount, 0);
    const totalWatchMembers = normalizePositiveNumber(req.body.totalWatchMembers, 0);
    const totalEarnings = normalizePositiveNumber(req.body.totalEarnings, 0);

    if (!channelName || !ownerName || !videoCategory || !introVideoUrl) {
      return res.status(400).json({ success: false, message: 'Please complete the video channel form correctly.' });
    }

    const channel = await VideoUploaderChannel.create({
      partnerId: partner._id,
      bannerImage: req.body.bannerImage || '',
      profileImage: req.body.profileImage || '',
      channelName,
      ownerName,
      channelDescription: normalizeOptionalText(req.body.channelDescription),
      videoCategory,
      uploadCount,
      totalWatchMembers,
      totalEarnings,
      boosterPlan: normalizeOptionalText(req.body.boosterPlan, 'Starter Boost'),
      introVideoUrl,
      reelsVideoUrl: normalizeOptionalText(req.body.reelsVideoUrl),
      uploadedVideos: normalizeOptionalText(req.body.uploadedVideos),
      allowDelete: req.body.allowDelete !== false,
      contactEmail: normalizeOptionalText(req.body.contactEmail, partner.officialEmail).toLowerCase()
    });

    await EducationItem.findOneAndUpdate(
      { id: `db-video-${channel._id}` },
      {
        id: `db-video-${channel._id}`,
        category: 'videos',
        title: channelName,
        channel: ownerName,
        duration: uploadCount > 0 ? `${uploadCount} uploads | ${totalWatchMembers} members` : 'New Channel',
        description:
          normalizeOptionalText(req.body.channelDescription) ||
          normalizeOptionalText(req.body.uploadedVideos) ||
          `${channelName} education channel uploaded from the video uploader form.`,
        thumbnail: req.body.bannerImage || '',
        videoUrl: introVideoUrl,
        topic: videoCategory,
        source: 'video-uploader-channel'
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Video uploader channel saved.',
      channel
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function createEducationCenterCourse(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const courseName = normalizeOptionalText(req.body.name);

    if (!courseName) {
      return res.status(400).json({ success: false, message: 'Course name is required.' });
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const course = {
      id: createId('course'),
      name: courseName,
      duration: normalizeOptionalText(req.body.duration, '4 Years'),
      intake: normalizePositiveNumber(req.body.intake, 60),
      fee: normalizeOptionalText(req.body.fee, 'Rs. 75,000'),
      status: normalizeCourseStatus(req.body.status || 'Active')
    };

    profile.courses = [course, ...(profile.courses || [])];
    await saveEducationCenterProfile(profile, partner);

    return res.status(201).json({
      success: true,
      message: 'Course added successfully.',
      course,
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function updateEducationCenterCourse(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const courseIndex = (profile.courses || []).findIndex((course) => course.id === req.params.courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const currentCourse = profile.courses[courseIndex];
    profile.courses[courseIndex] = {
      ...currentCourse,
      name: normalizeOptionalText(req.body.name, currentCourse.name),
      duration: normalizeOptionalText(req.body.duration, currentCourse.duration),
      intake: normalizePositiveNumber(
        req.body.intake,
        normalizePositiveNumber(currentCourse.intake, 60)
      ),
      fee: normalizeOptionalText(req.body.fee, currentCourse.fee),
      status: req.body.status ? normalizeCourseStatus(req.body.status) : currentCourse.status
    };

    await saveEducationCenterProfile(profile, partner);

    return res.json({
      success: true,
      message: 'Course updated successfully.',
      course: profile.courses[courseIndex],
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function deleteEducationCenterCourse(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const nextCourses = (profile.courses || []).filter((course) => course.id !== req.params.courseId);

    if (nextCourses.length === (profile.courses || []).length) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    profile.courses = nextCourses;
    await saveEducationCenterProfile(profile, partner);

    return res.json({
      success: true,
      message: 'Course deleted successfully.',
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function createEducationCenterScholarship(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const scholarshipName = normalizeOptionalText(req.body.name);

    if (!scholarshipName) {
      return res.status(400).json({ success: false, message: 'Scholarship name is required.' });
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const scholarship = {
      id: createId('scholarship'),
      name: scholarshipName,
      type: normalizeOptionalText(req.body.type, 'Merit Based'),
      eligibility: normalizeOptionalText(req.body.eligibility, 'Check with the admission office'),
      benefit: normalizeOptionalText(req.body.benefit, 'Scholarship support available'),
      status: normalizeCourseStatus(req.body.status || 'Active')
    };

    profile.scholarships = [scholarship, ...(profile.scholarships || [])];
    await saveEducationCenterProfile(profile, partner);

    return res.status(201).json({
      success: true,
      message: 'Scholarship added successfully.',
      scholarship,
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function updateEducationCenterScholarship(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const scholarshipIndex = (profile.scholarships || []).findIndex(
      (scholarship) => scholarship.id === req.params.scholarshipId
    );

    if (scholarshipIndex === -1) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    const currentScholarship = profile.scholarships[scholarshipIndex];
    profile.scholarships[scholarshipIndex] = {
      ...currentScholarship,
      name: normalizeOptionalText(req.body.name, currentScholarship.name),
      type: normalizeOptionalText(req.body.type, currentScholarship.type),
      eligibility: normalizeOptionalText(req.body.eligibility, currentScholarship.eligibility),
      benefit: normalizeOptionalText(req.body.benefit, currentScholarship.benefit),
      status: req.body.status ? normalizeCourseStatus(req.body.status) : currentScholarship.status
    };

    await saveEducationCenterProfile(profile, partner);

    return res.json({
      success: true,
      message: 'Scholarship updated successfully.',
      scholarship: profile.scholarships[scholarshipIndex],
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function deleteEducationCenterScholarship(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const nextScholarships = (profile.scholarships || []).filter(
      (scholarship) => scholarship.id !== req.params.scholarshipId
    );

    if (nextScholarships.length === (profile.scholarships || []).length) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    profile.scholarships = nextScholarships;
    await saveEducationCenterProfile(profile, partner);

    return res.json({
      success: true,
      message: 'Scholarship deleted successfully.',
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function updateEducationCenterApplication(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const applicationIndex = (profile.applications || []).findIndex(
      (application) => application.id === req.params.applicationId
    );

    if (applicationIndex === -1) {
      return res.status(404).json({ success: false, message: 'Student application not found.' });
    }

    const currentApplication = profile.applications[applicationIndex];
    const nextStatus = req.body.status
      ? normalizeApplicationStatus(req.body.status)
      : currentApplication.status;
    const nextNotes = req.body.notes !== undefined
      ? normalizeOptionalText(req.body.notes)
      : currentApplication.notes || '';
    const nextReply = req.body.reply !== undefined
      ? normalizeOptionalText(req.body.reply)
      : currentApplication.reply || '';

    // Update only the selected array item. Some older profiles contain legacy
    // application entries that do not satisfy the current schema; saving the
    // whole document would validate those unrelated entries and reject this update.
    await EducationCenterUpload.updateOne(
      { _id: profile._id, 'applications.id': currentApplication.id },
      {
        $set: {
          'applications.$.status': nextStatus,
          'applications.$.notes': nextNotes,
          'applications.$.reply': nextReply
        }
      }
    );

    const studentStatus = nextStatus === 'New' ? 'Applied' : nextStatus;
    const studentQuery = {
      'applicationStatuses.applicationId': currentApplication.id
    };

    if (currentApplication.studentObjectId) {
      studentQuery._id = currentApplication.studentObjectId;
    }

    // applicationId is the shared key between the center and student records.
    // This also supports older applications that were saved without studentObjectId.
    await User.updateOne(
      studentQuery,
      {
        $set: {
          'applicationStatuses.$.status': studentStatus,
          'applicationStatuses.$.reply': nextReply,
          'applicationStatuses.$.updatedLabel': formatDateLabel()
        }
      }
    );

    const updatedProfile = await EducationCenterUpload.findById(profile._id);
    const updatedApplication = updatedProfile.applications.find(
      (application) => application.id === currentApplication.id
    );

    return res.json({
      success: true,
      message: 'Student application updated successfully.',
      application: updatedApplication,
      dashboard: buildDashboardPayload(partner, updatedProfile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function createEducationCenterGalleryImage(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const image = normalizeOptionalText(req.body.image);

    if (!image) {
      return res.status(400).json({ success: false, message: 'Please upload an image.' });
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const galleryImage = {
      id: createId('image'),
      title: normalizeOptionalText(req.body.title, `Campus Image ${profile.galleryImages.length + 1}`),
      image
    };

    profile.galleryImages = [galleryImage, ...(profile.galleryImages || [])];

    if (req.body.setAsHero || !profile.image) {
      profile.image = image;
    }

    if (req.body.setAsProfile || !profile.profileImage) {
      profile.profileImage = image;
    }

    await saveEducationCenterProfile(profile, partner);

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      image: galleryImage,
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function deleteEducationCenterGalleryImage(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const imageToDelete = (profile.galleryImages || []).find((image) => image.id === req.params.imageId);
    const nextImages = (profile.galleryImages || []).filter((image) => image.id !== req.params.imageId);

    if (!imageToDelete) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    profile.galleryImages = nextImages;

    if (profile.image === imageToDelete.image) {
      profile.image = nextImages[0]?.image || '';
    }

    if (profile.profileImage === imageToDelete.image) {
      profile.profileImage = nextImages[1]?.image || nextImages[0]?.image || '';
    }

    await saveEducationCenterProfile(profile, partner);

    return res.json({
      success: true,
      message: 'Image deleted successfully.',
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function createEducationCenterVideo(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const videoUrl = normalizeOptionalText(req.body.videoUrl);

    if (!videoUrl) {
      return res.status(400).json({ success: false, message: 'Please enter the video URL.' });
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const video = {
      id: createId('video'),
      title: normalizeOptionalText(req.body.title, `Campus Video ${profile.videoItems.length + 1}`),
      image: normalizeOptionalText(req.body.image, profile.image || profile.profileImage || ''),
      videoUrl,
      duration: normalizeOptionalText(req.body.duration, 'New video')
    };

    profile.videoItems = [video, ...(profile.videoItems || [])];

    if (!profile.promoVideoUrl) {
      profile.promoVideoUrl = videoUrl;
    }

    await saveEducationCenterProfile(profile, partner);

    return res.status(201).json({
      success: true,
      message: 'Video uploaded successfully.',
      video,
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}

export async function deleteEducationCenterVideo(req, res) {
  try {
    const partner = await resolveAuthenticatedPartner(req, res, educationCenterRole);

    if (!partner) {
      return undefined;
    }

    const profile = await resolveEducationCenterProfileForPartner(partner);
    const videoToDelete = (profile.videoItems || []).find((video) => video.id === req.params.videoId);
    const nextVideos = (profile.videoItems || []).filter((video) => video.id !== req.params.videoId);

    if (!videoToDelete) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    profile.videoItems = nextVideos;

    if (profile.promoVideoUrl === videoToDelete.videoUrl) {
      profile.promoVideoUrl = nextVideos[0]?.videoUrl || '';
    }

    await saveEducationCenterProfile(profile, partner);

    return res.json({
      success: true,
      message: 'Video deleted successfully.',
      dashboard: buildDashboardPayload(partner, profile.toObject())
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'partner_controller_failed');
  }
}
