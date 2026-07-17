import express from 'express';
import {
  createEducationCenterCourse,
  createEducationCenterGalleryImage,
  createEducationCenterProfile,
  createEducationCenterScholarship,
  createEducationCenterVideo,
  createVideoChannelProfile,
  deleteEducationCenterCourse,
  deleteEducationCenterGalleryImage,
  deleteEducationCenterScholarship,
  deleteEducationCenterVideo,
  getEducationCenterDashboard,
  loginPartner,
  registerPartner,
  updateEducationCenterApplication,
  updateEducationCenterCourse,
  updateEducationCenterScholarship
} from '../controllers/partnerController.js';

const router = express.Router();

router.get('/dashboard', getEducationCenterDashboard);
router.post('/login', loginPartner);
router.post('/register', registerPartner);
router.post('/education-center', createEducationCenterProfile);
router.post('/video-channel', createVideoChannelProfile);
router.post('/courses', createEducationCenterCourse);
router.patch('/courses/:courseId', updateEducationCenterCourse);
router.delete('/courses/:courseId', deleteEducationCenterCourse);
router.post('/scholarships', createEducationCenterScholarship);
router.patch('/scholarships/:scholarshipId', updateEducationCenterScholarship);
router.delete('/scholarships/:scholarshipId', deleteEducationCenterScholarship);
router.patch('/applications/:applicationId', updateEducationCenterApplication);
router.post('/gallery-images', createEducationCenterGalleryImage);
router.delete('/gallery-images/:imageId', deleteEducationCenterGalleryImage);
router.post('/videos', createEducationCenterVideo);
router.delete('/videos/:videoId', deleteEducationCenterVideo);

export default router;
