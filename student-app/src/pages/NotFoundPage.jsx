import { Link } from 'react-router-dom';
import Button from '../components/Button';
import SectionWrapper from '../components/SectionWrapper';

export default function NotFoundPage() {
  return (
    <SectionWrapper centered className="my-auto py-20">
      <div className="max-w-md mx-auto bg-surface-container-lowest p-10 rounded-2xl shadow-card border border-outline-variant/30 text-center">
        <div className="text-6xl font-headline font-extrabold text-primary mb-3">404</div>
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-3">Page Not Found</h2>
        <p className="text-sm font-sans text-on-surface-variant mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" size="md">
            Back to Home
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
