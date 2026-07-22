import bcrypt from 'bcrypt';
import EducationCenter, {
  educationCenterCategoryValues,
  educationCenterStatusValues
} from '../model/educationCenterModel.js';
import EducationCenterHelpTicket from '../model/educationCenterHelpTicketModel.js';
import EducationCenterUpload from '../model/educationCenterUploadModel.js';
import EducationItem from '../model/educationItemModel.js';
import EducationPartner from '../model/educationPartnerModel.js';
import SequenceCounter from '../model/sequenceCounterModel.js';
import { createPartnerToken } from '../utils/partnerToken.js';

const PENDING_APPROVAL_MESSAGE = 'Your account is pending admin approval.';
const MAX_REGISTRATION_FILE_BYTES = 100 * 1024 * 1024;

function dataUrlByteSize(value = '') {
  const commaIndex = value.indexOf(',');
  if (commaIndex < 0) return 0;
  const encoded = value.slice(commaIndex + 1).replace(/\s/g, '');
  return Math.floor((encoded.length * 3) / 4) - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0);
}

const categoryDisplayMap = {
  School: {
    categoryKey: 'primary',
    courseType: 'Starting Education',
    level: 'Primary'
  },
  College: {
    categoryKey: 'secondary',
    courseType: 'Higher Education',
    level: 'Secondary'
  },
  'Coaching Center': {
    categoryKey: 'extra',
    courseType: 'Additional Education',
    level: 'Extra Skills'
  }
};

function cleanText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function cleanEmail(value) {
  return cleanText(value).toLowerCase();
}

function cleanUsername(value) {
  return cleanText(value).toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getCenterCategoryConfig(category) {
  return categoryDisplayMap[category] || categoryDisplayMap.College;
}

function buildCenterDescription(center) {
  return `${center.education_center_name} is an approved ${center.category.toLowerCase()} listed on What Next.`;
}

function serializeEducationCenter(center, options = {}) {
  const source = center?.toObject ? center.toObject() : center;

  if (!source) {
    return null;
  }

  const serialized = {
    id: source.id || String(source._id),
    educationCenterName: source.education_center_name,
    ownerName: source.owner_name,
    category: source.category,
    email: source.email,
    phone: source.phone,
    alternatePhone: source.alternate_phone || '',
    address: source.address,
    city: source.city,
    state: source.state,
    pincode: source.pincode,
    username: source.username,
    logo: source.logo || '',
    status: source.status,
    createdAt: source.created_at
  };

  if (options.includeDocuments) {
    serialized.registrationCertificate = source.registration_certificate || '';
    serialized.idProof = source.id_proof || '';
    serialized.addressProof = source.address_proof || '';
  }

  return serialized;
}

export function buildApprovedEducationCenterPublicItem(center) {
  const source = center?.toObject ? center.toObject() : center;
  const categoryConfig = getCenterCategoryConfig(source.category);
  const logo = source.logo || '';

  return {
    id: `education-center-${source._id}`,
    category: categoryConfig.categoryKey,
    title: source.education_center_name,
    level: categoryConfig.level,
    description: buildCenterDescription(source),
    address: [source.address, source.city, source.state, source.pincode].filter(Boolean).join(', '),
    image: logo,
    profileImage: logo,
    thumbnail: logo,
    videoUrl: '',
    mediaType: 'Image & Video',
    badge: `${source.category} Center`,
    courseCount: 1,
    courseList: `${source.category} programs`,
    contactEmail: source.email,
    phone: source.phone,
    source: 'education_centers',
    createdAt: source.created_at,
    updatedAt: source.updated_at
  };
}

function serializePartner(partner) {
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

function buildDashboardPayload(partner, profile) {
  const source = profile?.toObject ? profile.toObject() : profile;
  const heroImage = source?.image || source?.profileImage || '';

  return {
    partner: serializePartner(partner),
    profile: {
      id: source?._id ? String(source._id) : '',
      categoryKey: source?.categoryKey || 'secondary',
      centerName: source?.educationCenterName || partner.organizationName,
      address: source?.address || '',
      heroImage,
      logoImage: source?.profileImage || heroImage,
      website: 'www.whatnextcampus.edu.in',
      contactEmail: source?.contactEmail || partner.officialEmail,
      phone: source?.phone || partner.phone,
      description: source?.description || '',
      courseType: source?.courseType || 'Higher Education',
      courseCount: source?.courseCount || source?.courses?.length || 1,
      courseList: source?.courseList || `${source?.courseType || 'Education'} programs`
    },
    overview: {
      totalCourses: source?.courses?.length || 1,
      applications: source?.applications?.length || 0,
      scholarships: source?.scholarships?.length || 0,
      enquiries: (source?.applications || []).filter((item) => ['New', 'Under Review'].includes(item.status)).length
    },
    recentActivity: [],
    courses: source?.courses || [],
    images: source?.galleryImages || [],
    videos: source?.videoItems || [],
    applications: source?.applications || [],
    scholarships: source?.scholarships || []
  };
}

async function createTicketId() {
  const counter = await SequenceCounter.findOneAndUpdate(
    { key: 'education_center_help_ticket' },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return `EC-${String(counter.seq).padStart(6, '0')}`;
}

async function upsertPendingPartner(center) {
  return EducationPartner.findOneAndUpdate(
    { officialEmail: center.email },
    {
      role: 'education-center',
      organizationName: center.education_center_name,
      contactPerson: center.owner_name,
      governmentCode: center.username,
      officialEmail: center.email,
      phone: center.phone,
      password: center.password_hash,
      status: center.status,
      educationCenterId: center._id
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

async function upsertApprovedPartnerAndProfile(center) {
  const partner = await upsertPendingPartner(center);
  const categoryConfig = getCenterCategoryConfig(center.category);
  const publicAddress = [center.address, center.city, center.state, center.pincode].filter(Boolean).join(', ');
  const description = buildCenterDescription(center);
  const profilePayload = {
    partnerId: partner._id,
    categoryKey: categoryConfig.categoryKey,
    image: center.logo || '',
    profileImage: center.logo || '',
    educationCenterName: center.education_center_name,
    address: publicAddress,
    courseType: categoryConfig.courseType,
    courseCount: 1,
    courseList: `${center.category} programs`,
    description,
    promoVideoUrl: '',
    contactEmail: center.email,
    phone: center.phone
  };
  const profile = await EducationCenterUpload.findOneAndUpdate(
    { partnerId: partner._id },
    {
      $set: profilePayload
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  await EducationItem.findOneAndUpdate(
    { id: `db-center-${profile._id}` },
    {
      id: `db-center-${profile._id}`,
      category: categoryConfig.categoryKey,
      title: center.education_center_name,
      level: categoryConfig.level,
      description,
      address: publicAddress,
      image: center.logo || '',
      profileImage: center.logo || '',
      thumbnail: center.logo || '',
      videoUrl: '',
      mediaType: 'Image & Video',
      badge: `${center.category} Center`,
      courseCount: 1,
      courseList: `${center.category} programs`,
      contactEmail: center.email,
      phone: center.phone,
      source: 'education-center-upload'
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return { partner, profile };
}

async function removeEducationCenterArtifacts(center) {
  const partner = await EducationPartner.findOne({ officialEmail: center.email }).lean();

  await removeEducationCenterPublicArtifacts(center);

  if (partner) {
    await EducationPartner.deleteOne({ _id: partner._id });
  }
}

async function removeEducationCenterPublicArtifacts(center) {
  const partner = await EducationPartner.findOne({ officialEmail: center.email }).lean();
  const profileQuery = partner ? { partnerId: partner._id } : { contactEmail: center.email };
  const profiles = await EducationCenterUpload.find(profileQuery).select('_id').lean();
  const publicItemIds = profiles.map((profile) => `db-center-${profile._id}`);

  if (publicItemIds.length) {
    await EducationItem.deleteMany({ id: { $in: publicItemIds } });
  }

  if (partner) {
    await EducationCenterUpload.deleteMany({ partnerId: partner._id });
  } else {
    await EducationCenterUpload.deleteMany({ contactEmail: center.email });
  }
}

async function hideEducationCenterPublicItems(center) {
  const partner = await EducationPartner.findOne({ officialEmail: center.email }).lean();
  const profileQuery = partner ? { partnerId: partner._id } : { contactEmail: center.email };
  const profiles = await EducationCenterUpload.find(profileQuery).select('_id').lean();
  const publicItemIds = profiles.map((profile) => `db-center-${profile._id}`);
  if (publicItemIds.length) await EducationItem.deleteMany({ id: { $in: publicItemIds } });
}

export async function createEducationCenterHelpTicket(req, res, next) {
  try {
    const educationCenterName = cleanText(req.body.educationCenterName);
    const ownerName = cleanText(req.body.ownerName);
    const category = cleanText(req.body.category);
    const phone = cleanText(req.body.phoneNumber || req.body.phone);
    const email = cleanEmail(req.body.email);
    const address = cleanText(req.body.address);
    const subject = cleanText(req.body.subject);
    const complaintType = cleanText(req.body.complaintType);
    const howCanWeHelp = cleanText(req.body.howCanWeHelp);
    const fullDetails = cleanText(req.body.fullDetails);

    if (
      !educationCenterName ||
      !category ||
      !phone ||
      !email ||
      !address ||
      !subject ||
      !complaintType ||
      !howCanWeHelp ||
      !fullDetails
    ) {
      return res.status(400).json({ success: false, message: 'Please complete all required help fields.' });
    }

    if (!educationCenterCategoryValues.includes(category)) {
      return res.status(400).json({ success: false, message: 'Please select a valid education category.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const ticket = await EducationCenterHelpTicket.create({
      ticket_id: await createTicketId(),
      education_center_name: educationCenterName,
      owner_name: ownerName,
      category,
      phone,
      email,
      address,
      subject,
      complaint_type: complaintType,
      how_can_we_help: howCanWeHelp,
      full_details: fullDetails,
      attachment: cleanText(req.body.attachment),
      status: 'Open'
    });

    return res.status(201).json({
      success: true,
      message: `Help ticket ${ticket.ticket_id} submitted successfully.`,
      id: ticket.id,
      ticketId: ticket.ticket_id
    });
  } catch (error) {
    return next(error);
  }
}

export async function registerEducationCenter(req, res, next) {
  try {
    const educationCenterName = cleanText(req.body.educationCenterName);
    const ownerName = cleanText(req.body.ownerName);
    const category = cleanText(req.body.category);
    const email = cleanEmail(req.body.email);
    const phone = cleanText(req.body.phone);
    const alternatePhone = cleanText(req.body.alternatePhone);
    const address = cleanText(req.body.address);
    const city = cleanText(req.body.city);
    const state = cleanText(req.body.state);
    const pincode = cleanText(req.body.pincode);
    const username = cleanUsername(req.body.username);
    const password = cleanText(req.body.password);
    const confirmPassword = cleanText(req.body.confirmPassword);
    const uploadedPath = (field) => req.files?.[field]?.[0] ? `/uploads/education-center-registration/${req.files[field][0].filename}` : '';
    const registrationCertificate = uploadedPath('registrationCertificate') || cleanText(req.body.registrationCertificate);
    const idProof = uploadedPath('idProof') || cleanText(req.body.idProof);
    const addressProof = uploadedPath('addressProof') || cleanText(req.body.addressProof);
    const logo = uploadedPath('logo') || cleanText(req.body.logo);

    const oversizedUpload = [registrationCertificate, idProof, addressProof, logo].find(
      (value) => value && dataUrlByteSize(value) > MAX_REGISTRATION_FILE_BYTES
    );
    if (oversizedUpload) {
      return res.status(413).json({ success: false, message: 'Each registration upload must be 100 MB or smaller.' });
    }

    if (
      !educationCenterName ||
      !ownerName ||
      !category ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !username ||
      !password ||
      !confirmPassword ||
      !registrationCertificate ||
      !idProof ||
      !addressProof
    ) {
      return res.status(400).json({ success: false, message: 'Please complete all required registration fields.' });
    }

    if (!educationCenterCategoryValues.includes(category)) {
      return res.status(400).json({ success: false, message: 'Please select a valid education category.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Password confirmation does not match.' });
    }

    const existingCenter = await EducationCenter.findOne({
      $or: [{ email }, { username }]
    });

    if (existingCenter) {
      return res.status(409).json({
        success: false,
        message: 'An education center already exists for this email or username.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const center = await EducationCenter.create({
      education_center_name: educationCenterName,
      owner_name: ownerName,
      category,
      email,
      phone,
      alternate_phone: alternatePhone,
      address,
      city,
      state,
      pincode,
      username,
      password_hash: passwordHash,
      registration_certificate: registrationCertificate,
      id_proof: idProof,
      address_proof: addressProof,
      logo,
      status: 'Pending'
    });

    await upsertPendingPartner(center);

    return res.status(201).json({
      success: true,
      message: 'Education center registration submitted. Your account is pending admin approval.',
      educationCenter: serializeEducationCenter(center)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An education center already exists for this email or username.'
      });
    }

    return next(error);
  }
}

export async function loginEducationCenter(req, res, next) {
  try {
    const login = cleanEmail(req.body.login || req.body.email || req.body.officialEmail || req.body.username);
    const password = cleanText(req.body.password);

    if (!login || !password) {
      return res.status(400).json({ success: false, message: 'Email or username and password are required.' });
    }

    const center = await EducationCenter.findOne({
      $or: [{ email: login }, { username: login }]
    });

    if (!center) {
      return res.status(404).json({ success: false, message: 'Education center account not found.' });
    }

    if (center.status !== 'Approved') {
      return res.status(403).json({ success: false, message: PENDING_APPROVAL_MESSAGE });
    }

    const passwordMatches = await bcrypt.compare(password, center.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    const { partner, profile } = await upsertApprovedPartnerAndProfile(center);

    return res.json({
      success: true,
      message: 'Education center login successful.',
      token: createPartnerToken(partner),
      partner: serializePartner(partner),
      dashboard: buildDashboardPayload(partner, profile)
    });
  } catch (error) {
    return next(error);
  }
}

export async function listApprovedEducationCenters(_req, res, next) {
  try {
    const centers = await EducationCenter.find({ status: 'Approved' }).sort({ created_at: -1 }).lean();

    return res.json({
      success: true,
      items: centers.map((center) => serializeEducationCenter(center))
    });
  } catch (error) {
    return next(error);
  }
}

export async function listAdminEducationCenters(req, res, next) {
  try {
    const search = cleanText(req.query.search);
    const status = cleanText(req.query.status);
    const query = {};

    if (status && educationCenterStatusValues.includes(status)) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { education_center_name: searchRegex },
        { owner_name: searchRegex },
        { category: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { username: searchRegex }
      ];
    }

    const centers = await EducationCenter.find(query).sort({ created_at: -1 }).lean();

    return res.json({
      success: true,
      items: centers.map((center) => serializeEducationCenter(center, { includeDocuments: true }))
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminEducationCenter(req, res, next) {
  try {
    const center = await EducationCenter.findById(req.params.id).lean();

    if (!center) {
      return res.status(404).json({ success: false, message: 'Education center not found.' });
    }

    return res.json({
      success: true,
      educationCenter: serializeEducationCenter(center, { includeDocuments: true })
    });
  } catch (error) {
    return next(error);
  }
}

export async function approveEducationCenter(req, res, next) {
  try {
    const center = await EducationCenter.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true, runValidators: true }
    );

    if (!center) {
      return res.status(404).json({ success: false, message: 'Education center not found.' });
    }

    await upsertApprovedPartnerAndProfile(center);

    return res.json({
      success: true,
      message: 'Education center approved successfully.',
      educationCenter: serializeEducationCenter(center, { includeDocuments: true })
    });
  } catch (error) {
    return next(error);
  }
}

export async function rejectEducationCenter(req, res, next) {
  try {
    const center = await EducationCenter.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true, runValidators: true }
    );

    if (!center) {
      return res.status(404).json({ success: false, message: 'Education center not found.' });
    }

    await hideEducationCenterPublicItems(center);

    await upsertPendingPartner(center);

    return res.json({
      success: true,
      message: 'Education center rejected successfully.',
      educationCenter: serializeEducationCenter(center, { includeDocuments: true })
    });
  } catch (error) {
    return next(error);
  }
}

export async function holdEducationCenter(req, res, next) {
  try {
    const center = await EducationCenter.findByIdAndUpdate(req.params.id, { status: 'Held' }, { new: true, runValidators: true });
    if (!center) return res.status(404).json({ success: false, message: 'Education center not found.' });
    await hideEducationCenterPublicItems(center);
    await upsertPendingPartner(center);
    return res.json({ success: true, message: 'Education center account placed on hold.', educationCenter: serializeEducationCenter(center, { includeDocuments: true }) });
  } catch (error) {
    return next(error);
  }
}

export async function pendEducationCenter(req, res, next) {
  try {
    const center = await EducationCenter.findByIdAndUpdate(req.params.id, { status: 'Pending' }, { new: true, runValidators: true });
    if (!center) return res.status(404).json({ success: false, message: 'Education center not found.' });
    await hideEducationCenterPublicItems(center);
    await upsertPendingPartner(center);
    return res.json({ success: true, message: 'Education center returned to pending approval.', educationCenter: serializeEducationCenter(center, { includeDocuments: true }) });
  } catch (error) { return next(error); }
}

export async function deleteEducationCenter(req, res, next) {
  try {
    const center = await EducationCenter.findById(req.params.id);

    if (!center) {
      return res.status(404).json({ success: false, message: 'Education center not found.' });
    }

    await removeEducationCenterArtifacts(center);
    await center.deleteOne();

    return res.json({
      success: true,
      message: 'Education center deleted successfully.'
    });
  } catch (error) {
    return next(error);
  }
}
