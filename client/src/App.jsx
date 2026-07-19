import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppShellMainOnly from './components/AppShellMainOnly';

const CounsellingPage = lazy(() => import('./pages/CounsellingPage'));
const EducationCenterLoginPage = lazy(() => import('./pages/EducationCenterLoginPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const VideoEducationPage = lazy(() => import('./pages/VideoEducationPage'));
const EducationDetailsPage = lazy(() => import('./pages/EducationDetailsPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const EducationCategoryPage = lazy(() => import('./pages/EducationCategoryPage'));
const EcommerceHomePage = lazy(() => import('./pages/EcommerceHomePage'));
const EcommerceOrderPage = lazy(() => import('./pages/EcommerceOrderPage'));

const categoryConfig = {
  primary: {
    slug: 'startingeducation',
    legacySlug: 'starting-education',
    title: 'School',
    tag: 'Primary',
    accent: 'primary',
    heading: 'School centers',
    note: 'Primary learning cards with full image, video-ready preview, title, and full address details.',
    grid: {
      md: 6,
      lg: 6,
      xl: 4
    }
  },
  secondary: {
    slug: 'highereducation',
    legacySlug: 'higher-education',
    title: 'College',
    tag: 'Secondary',
    accent: 'secondary',
    heading: 'College centers',
    note: 'Secondary education options designed for students planning exams, college preparation, and next-step guidance.',
    grid: {
      md: 6,
      lg: 6,
      xl: 4
    }
  },
  extra: {
    slug: 'additionaleducation',
    legacySlug: 'additional-education',
    title: 'Coaching Center',
    tag: 'Extra Skills',
    accent: 'success',
    compactGrid: true,
    heading: 'Coaching centers',
    note: 'Two-card coaching layout focused on practical skills, coaching center names, and clear addresses.',
    grid: {
      md: 6,
      lg: 6,
      xl: 6
    }
  }
};

export default function App() {
  return (
    <Suspense fallback={<div className="route-loading" role="status">Loading page...</div>}><Routes>
      <Route path="/" element={<AppShellMainOnly />}>
        <Route index element={<HomePage categories={categoryConfig} />} />
        <Route path="home" element={<HomePage categories={categoryConfig} />} />
        <Route
          path={categoryConfig.primary.slug}
          element={<EducationCategoryPage categoryKey="primary" category={categoryConfig.primary} />}
        />
        <Route
          path={categoryConfig.primary.legacySlug}
          element={<EducationCategoryPage categoryKey="primary" category={categoryConfig.primary} />}
        />
        <Route
          path={categoryConfig.secondary.slug}
          element={<EducationCategoryPage categoryKey="secondary" category={categoryConfig.secondary} />}
        />
        <Route
          path={categoryConfig.secondary.legacySlug}
          element={<EducationCategoryPage categoryKey="secondary" category={categoryConfig.secondary} />}
        />
        <Route
          path={categoryConfig.extra.slug}
          element={<EducationCategoryPage categoryKey="extra" category={categoryConfig.extra} />}
        />
        <Route
          path={categoryConfig.extra.legacySlug}
          element={<EducationCategoryPage categoryKey="extra" category={categoryConfig.extra} />}
        />
        <Route path=":categorySlug/:itemId" element={<EducationDetailsPage />} />
        <Route path="counselling" element={<CounsellingPage />} />
        <Route path="help-center" element={<HelpCenterPage />} />
        <Route path="education-center-login" element={<EducationCenterLoginPage />} />
        <Route path="student-login" element={<LoginPage />} />
        <Route path="video-education" element={<VideoEducationPage />} />
        <Route path="ecommerce" element={<EcommerceHomePage />} />
        <Route path="ecommerce-orders" element={<EcommerceOrderPage />} />
      </Route>
    </Routes></Suspense>
  );
}
