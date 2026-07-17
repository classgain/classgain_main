import EducationItem from '../model/educationItemModel.js';
import EducationCenterUpload from '../model/educationCenterUploadModel.js';
import EducationCenter from '../model/educationCenterModel.js';
import EducationPartner from '../model/educationPartnerModel.js';
import { buildApprovedEducationCenterPublicItem } from './educationCenterController.js';
import {
  educationCategoryLevelMap,
  validEducationCategoryKeys
} from '../utils/educationCategories.js';

function splitList(value = '') {
  return value
    .split(/[\n,|]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function createApplicationId() {
  return `application-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function formatDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function buildPublicItemFromProfile(profile) {
  const courses = profile.courses || [];
  const courseNames = courses.length ? courses.map((course) => course.name).filter(Boolean) : splitList(profile.courseList);
  const galleryImages = profile.galleryImages || [];
  const videoItems = profile.videoItems || [];
  const image = profile.image || galleryImages[0]?.image || profile.profileImage || '';

  return {
    id: `db-center-${profile._id}`,
    category: profile.categoryKey,
    title: profile.educationCenterName,
    level: educationCategoryLevelMap[profile.categoryKey] || profile.courseType,
    description:
      profile.description ||
      profile.courseList ||
      `${profile.educationCenterName} uploaded through the education center dashboard.`,
    address: profile.address,
    image,
    profileImage: profile.profileImage || galleryImages[1]?.image || image,
    thumbnail: image,
    videoUrl: profile.promoVideoUrl || videoItems[0]?.videoUrl || '',
    mediaType: 'Image & Video',
    badge: `${profile.courseType} Center`,
    courseCount: courses.length || profile.courseCount || courseNames.length,
    courseList: courseNames.join(', '),
    contactEmail: profile.contactEmail || '',
    phone: profile.phone || '',
    source: 'education-center-upload',
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
}

function mergePublicItems(items, profiles) {
  const mergedItems = new Map();

  items.forEach((item) => {
    mergedItems.set(item.id, item);
  });

  profiles.forEach((profile) => {
    const publicItem = buildPublicItemFromProfile(profile);
    mergedItems.set(publicItem.id, publicItem);
  });

  return [...mergedItems.values()].sort((first, second) => {
    const firstDate = new Date(first.updatedAt || first.createdAt || 0).getTime();
    const secondDate = new Date(second.updatedAt || second.createdAt || 0).getTime();

    if (firstDate !== secondDate) {
      return secondDate - firstDate;
    }

    return String(first.title).localeCompare(String(second.title));
  });
}

function buildCourses(item, profile) {
  if (profile?.courses?.length) {
    return profile.courses.map((course) => ({ ...course }));
  }

  const courseNames = splitList(item.courseList);

  return (courseNames.length ? courseNames : [item.badge || item.level || 'Education Program']).map((name, index) => ({
    id: `course-${index}`,
    name,
    duration: index === 0 && item.courseCount ? `${item.courseCount} courses available` : 'Flexible program',
    intake: 0,
    fee: 'Contact center',
    status: 'Active'
  }));
}

function buildScholarships(profile) {
  if (profile?.scholarships?.length) {
    return profile.scholarships.map((scholarship) => ({ ...scholarship }));
  }

  return [
    {
      id: 'scholarship-top-rankers',
      name: 'Top Rankers',
      type: 'Merit',
      eligibility: 'Center admission review',
      benefit: 'Scholarship details are updated from the education center dashboard.',
      status: 'Active'
    },
    {
      id: 'scholarship-sports',
      name: 'Sports Scholarship',
      type: 'Sports',
      eligibility: 'State or national level players',
      benefit: 'Sports scholarship support available after center review.',
      status: 'Active'
    },
    {
      id: 'scholarship-government',
      name: 'Government Scholarship',
      type: 'Government',
      eligibility: 'As per government schemes',
      benefit: 'Eligible students can ask the admission team for support.',
      status: 'Active'
    }
  ];
}

function buildActivity(item, profile) {
  const galleryActivity = (profile?.galleryImages || []).map((image) => ({
    id: image.id,
    title: image.title || 'Center Activity',
    image: image.image
  }));
  const videoActivity = (profile?.videoItems || []).map((video) => ({
    id: video.id,
    title: video.title || 'Video Activity',
    image: video.image || item.image || item.thumbnail || ''
  }));
  const activity = [...galleryActivity, ...videoActivity].filter((entry) => entry.image || entry.title);

  if (activity.length) {
    return activity;
  }

  return [
    { id: 'activity-campus', title: 'Campus', image: item.image || item.thumbnail || item.profileImage || '' },
    { id: 'activity-guidance', title: 'Student Guidance', image: item.profileImage || item.image || item.thumbnail || '' },
    { id: 'activity-video', title: 'Video Preview', image: item.image || item.thumbnail || item.profileImage || '' }
  ];
}

function buildStats(item, courses, profile) {
  const applicationsCount = profile?.applications?.length || 0;

  return {
    students: applicationsCount > 0 ? `${Math.max(applicationsCount * 250, 500)}+` : '6000+',
    faculty: `${Math.max(courses.length * 12, 25)}+`,
    courses: `${item.courseCount || courses.length}+`,
    placementRate: '95%'
  };
}

async function findProfileForItem(item) {
  if (!item?.id?.startsWith('db-center-')) {
    return null;
  }

  const profileId = item.id.replace('db-center-', '');

  if (!profileId.match(/^[a-f\d]{24}$/i)) {
    return null;
  }

  return EducationCenterUpload.findById(profileId).lean();
}

async function findApprovedCenterByPublicItemId(itemId) {
  if (!itemId?.startsWith('education-center-')) {
    return null;
  }

  const centerId = itemId.replace('education-center-', '');

  if (!centerId.match(/^[a-f\d]{24}$/i)) {
    return null;
  }

  return EducationCenter.findOne({ _id: centerId, status: 'Approved' }).lean();
}

async function findProfileForApprovedCenter(center) {
  if (!center?.email) {
    return null;
  }

  const partner = await EducationPartner.findOne({ officialEmail: center.email }).lean();

  if (!partner) {
    return null;
  }

  return EducationCenterUpload.findOne({ partnerId: partner._id }).lean();
}

async function resolveProfileByPublicItemId(itemId) {
  const approvedCenter = await findApprovedCenterByPublicItemId(itemId);

  if (approvedCenter) {
    const approvedProfile = await findProfileForApprovedCenter(approvedCenter);
    return approvedProfile ? EducationCenterUpload.findById(approvedProfile._id) : null;
  }

  if (itemId?.startsWith('db-center-')) {
    const profileId = itemId.replace('db-center-', '');

    if (profileId.match(/^[a-f\d]{24}$/i)) {
      return EducationCenterUpload.findById(profileId);
    }
  }

  const item = await EducationItem.findOne({ id: itemId }).lean();

  if (!item) {
    return null;
  }

  return EducationCenterUpload.findOne({
    educationCenterName: item.title,
    categoryKey: item.category
  }).sort({ updatedAt: -1, createdAt: -1 });
}

export async function getAllEducationCenters(_req, res, next) {
  try {
    const approvedCenters = await EducationCenter.find({ status: 'Approved' }).sort({ created_at: -1 }).lean();

    return res.json({
      category: 'all',
      items: approvedCenters.map((center) => buildApprovedEducationCenterPublicItem(center))
    });
  } catch (error) {
    return next(error);
  }
}

export async function getEducationByCategory(req, res, next) {
  try {
    const { category } = req.params;
    const supportedCategories = [...validEducationCategoryKeys, 'videos'];

    if (!supportedCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid education category.' });
    }

    if (category === 'videos') {
      const items = await EducationItem.find({ category }).sort({ createdAt: -1, title: 1 }).lean();

      return res.json({ category, items: mergePublicItems(items, []) });
    }

    const approvedCenters = await EducationCenter.find({ status: 'Approved' }).sort({ created_at: -1 }).lean();
    const items = approvedCenters
      .map((center) => buildApprovedEducationCenterPublicItem(center))
      .filter((item) => item.category === category);

    return res.json({ category, items });
  } catch (error) {
    return next(error);
  }
}

export async function getEducationDetails(req, res, next) {
  try {
    const { itemId } = req.params;
    const approvedCenter = await findApprovedCenterByPublicItemId(itemId);
    let item = await EducationItem.findOne({ id: itemId }).lean();

    if (!item && approvedCenter) {
      item = buildApprovedEducationCenterPublicItem(approvedCenter);
    }

    if (!item && itemId?.startsWith('db-center-')) {
      const profileId = itemId.replace('db-center-', '');
      const profile = profileId.match(/^[a-f\d]{24}$/i)
        ? await EducationCenterUpload.findById(profileId).lean()
        : null;

      if (profile) {
        item = buildPublicItemFromProfile(profile);
      }
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Education center not found.' });
    }

    const profile = approvedCenter ? await findProfileForApprovedCenter(approvedCenter) : await findProfileForItem(item);
    const courses = buildCourses(item, profile);
    const scholarships = buildScholarships(profile);
    const activity = buildActivity(item, profile);
    const videos = profile?.videoItems?.length
      ? profile.videoItems.map((video) => ({ ...video }))
      : item.videoUrl
        ? [
            {
              id: 'video-main',
              title: `${item.title} video`,
              image: item.image || item.thumbnail || '',
              videoUrl: item.videoUrl,
              duration: item.duration || 'Video'
            }
          ]
        : [];

    return res.json({
      success: true,
      item,
      details: {
        profile,
        courses,
        scholarships,
        activity,
        videos,
        stats: buildStats(item, courses, profile)
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function createEducationApplication(req, res, next) {
  try {
    const { itemId } = req.params;
    const profile = await resolveProfileByPublicItemId(itemId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Education center not found for this application.'
      });
    }

    const studentName = normalizeText(req.body.studentName);
    const mobile = normalizeText(req.body.phone || req.body.mobile);
    const course = normalizeText(req.body.course);
    const currentStudy = normalizeText(req.body.currentStudy);
    const completedStudy = normalizeText(req.body.completedStudy);
    const completedStudyPercentage = normalizeText(req.body.completedStudyPercentage || req.body.percentage);
    const address = normalizeText(req.body.address);
    const scholarshipInterest = req.body.scholarshipInterest === true || req.body.scholarshipInterest === 'true';

    if (!studentName || !mobile || !course || !currentStudy || !completedStudy || !completedStudyPercentage || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required application fields.'
      });
    }

    const scholarshipName =
      scholarshipInterest && profile.scholarships?.length
        ? profile.scholarships.find((scholarship) => scholarship.status === 'Active')?.name || profile.scholarships[0].name
        : '';

    const application = {
      id: createApplicationId(),
      studentObjectId: req.student._id,
      studentName,
      course,
      mobile,
      email: req.student.email,
      status: 'New',
      appliedOn: formatDateLabel(),
      address,
      currentStudy,
      completedStudy,
      completedStudyPercentage,
      previousEducation: completedStudy,
      marks: completedStudyPercentage,
      scholarshipInterest,
      scholarshipName,
      statement: normalizeText(
        req.body.statement,
        `${studentName} applied for ${course}${scholarshipInterest ? ' with scholarship interest' : ''}.`
      ),
      notes: ''
    };

    profile.applications = [application, ...(profile.applications || [])];
    await profile.save();

    req.student.applicationStatuses.unshift({
      applicationId: application.id,
      college: profile.educationCenterName || profile.centerName || profile.name || 'Education Center',
      course,
      status: 'Applied',
      updatedLabel: application.appliedOn
    });
    await req.student.save();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application
    });
  } catch (error) {
    return next(error);
  }
}
