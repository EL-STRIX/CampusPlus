import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ReportIssuePage from './pages/ReportIssuePage';
import ConfirmationPage from './pages/ConfirmationPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background text-on-background">
        <Header />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportIssuePage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
