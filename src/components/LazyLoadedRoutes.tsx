import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '../components/Loading/LoadingSpinner.tsx';

// Lazy load components
const LandingPage = React.lazy(() => import('../components/LandingPage.tsx'));
const About = React.lazy(() => import('../components/About.tsx'));
const Contact = React.lazy(() => import('../components/Contact.tsx'));
const Regulations = React.lazy(() => import('../components/Regulations.tsx'));
const Login = React.lazy(() => import('../components/Auth/Login.tsx'));
const Register = React.lazy(() => import('../components/Auth/Register.tsx'));
const UserAccount = React.lazy(() => import('../components/User/UserAccount.tsx'));
const ReferralDashboard = React.lazy(() => import('../components/Referrals/ReferralDashboard.tsx'));
const CourseView = React.lazy(() => import('../components/Courses/CourseView.tsx'));
const CourseList = React.lazy(() => import('../components/Courses/CourseList.tsx'));
const PaymentCallback = React.lazy(() => import('../components/Payment/PaymentCallback.tsx'));
const PaymentForm = React.lazy(() => import('../components/Payment/PaymentForm.tsx'));
const PaymentSuccess = React.lazy(() => import('../components/Payment/PaymentSuccess.tsx'));
const Checkout = React.lazy(() => import('../components/Payment/Checkout.tsx'));
const UserInvoiceComponent = React.lazy(() => import('../components/User/UserInvoice.tsx'));
const Quiz = React.lazy(() => import('../components/Quiz/Quiz.tsx'));
const Quiz1 = React.lazy(() => import('../components/Quiz/Quiz1.tsx'));
const Quiz2 = React.lazy(() => import('../components/Quiz/Quiz2.tsx'));
const FAQ = React.lazy(() => import('../components/FAQ.tsx'));
const ResetPassword = React.lazy(() => import('../components/ResetPassword'));

// Admin components
const AdminLayout = React.lazy(() => import('../components/Admin/AdminLayout.tsx'));
const AnalyticsDashboard = React.lazy(() => import('../components/Admin/AnalyticsDashboard.tsx'));
const PaymentManagement = React.lazy(() => import('../components/Admin/PaymentManagement.tsx'));
const CertificateManagement = React.lazy(() => import('../components/Admin/CertificateManagement.tsx'));
const TestManagement = React.lazy(() => import('../components/Admin/TestManagement.tsx'));
const CourseManagement = React.lazy(() => import('../components/Admin/CourseManagement.tsx'));
const UserManagement = React.lazy(() => import('../components/Admin/UserManagement.tsx'));
const MessagesManagement = React.lazy(() => import('../components/Admin/MessagesManagement.tsx'));
const OpinionsManagement = React.lazy(() => import('../components/Admin/OpinionsManagement.tsx'));
const InvoiceManagement = React.lazy(() => import('../components/Admin/InvoiceManagement.tsx'));
const Settings = React.lazy(() => import('../components/Admin/Settings.tsx'));
const DiscountManagement = React.lazy(() => import('../components/Admin/DiscountManagement.tsx'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <LoadingSpinner size="large" />
  </div>
);

// Lazy loaded routes component
export const LazyLoadedRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/*" element={
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="courses" element={<CourseList />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="regulations" element={<Regulations />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="reset-password" element={<ResetPassword />} />
              
              {/* Protected User Routes */}
              <Route path="account" element={<UserAccount />} />
              <Route path="referrals" element={<ReferralDashboard />} />
              <Route path="course/:id/learn" element={<CourseView />} />
              <Route path="payment/callback" element={<PaymentCallback />} />
              <Route path="payment/checkout" element={<PaymentForm />} />
              <Route path="payment/success" element={<PaymentSuccess />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account/invoices" element={<UserInvoiceComponent />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/quiz1" element={<Quiz1 />} />
              <Route path="/quiz2" element={<Quiz2 />} />

              {/* Protected Admin Routes */}
              <Route path="admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AnalyticsDashboard />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="tests" element={<TestManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="payments" element={<PaymentManagement />} />
                <Route path="certificates" element={<CertificateManagement />} />
                <Route path="messages" element={<MessagesManagement />} />
                <Route path="opinions" element={<OpinionsManagement />} />
                <Route path="settings" element={<Settings />} />
                <Route path="discounts" element={<DiscountManagement />} />
                <Route path="invoices" element={<InvoiceManagement />} />
              </Route>
            </Routes>
          </main>
        } />
      </Routes>
    </Suspense>
  );
};

export default LazyLoadedRoutes;