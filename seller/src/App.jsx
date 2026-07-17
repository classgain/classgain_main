import { Route, Routes } from 'react-router-dom';
import AppShellMainOnly from './components/AppShellMainOnly';
import EducationCenterHelpPage from './pages/EducationCenterHelpPage';
import EducationCenterLoginPage from './pages/EducationCenterLoginPage';
import EducationCenterRegistrationPage from './pages/EducationCenterRegistrationPage';
import EducationCenterUploadPage from './pages/EducationCenterUploadPage';
import VideoUploaderChannelPage from './pages/VideoUploaderChannelPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShellMainOnly />}>
        <Route index element={<EducationCenterLoginPage />} />
        <Route path="home" element={<EducationCenterLoginPage />} />
        <Route path="education-center/help" element={<EducationCenterHelpPage />} />
        <Route path="education-center/login" element={<EducationCenterLoginPage />} />
        <Route path="education-center/register" element={<EducationCenterRegistrationPage />} />
        <Route path="education-center-login" element={<EducationCenterLoginPage />} />
        <Route path="education-center-help" element={<EducationCenterHelpPage />} />
        <Route path="education-center-register" element={<EducationCenterRegistrationPage />} />
        <Route path="education-center-upload" element={<EducationCenterUploadPage />} />
        <Route path="video-uploader-channel" element={<VideoUploaderChannelPage />} />
        <Route path="*" element={<EducationCenterLoginPage />} />
      </Route>
    </Routes>
  );
}
