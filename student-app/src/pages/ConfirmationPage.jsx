import { Link } from 'react-router-dom';
import Button from '../components/Button';
import SectionWrapper from '../components/SectionWrapper';

export default function ConfirmationPage() {
  return (
    <SectionWrapper centered>
      <div className="max-w-md mx-auto bg-surface-container-lowest p-8 rounded-xl shadow-card border border-outline-variant/30 text-center">
        <div className="w-16 h-16 rounded-full bg-status-resolved/10 text-status-resolved flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Report Submitted!</h2>
        <p className="text-sm font-sans text-on-surface-variant mb-6">
          Thank you for reporting. Campus maintenance has received the ticket.
        </p>
        <Link to="/">
          <Button variant="primary" size="md">
            Return Home
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
