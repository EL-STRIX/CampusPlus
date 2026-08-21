import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function NotFoundPage() {
  return (
    <div className="flex-grow flex items-center justify-center py-20 px-gutter">
      <div className="max-w-md w-full text-center bg-surface-container-lowest p-8 sm:p-12 rounded-3xl shadow-card border border-outline-variant/30">
        <div className="text-7xl font-headline font-extrabold text-primary mb-3 tracking-tighter">
          404
        </div>
        <h1 className="text-2xl font-headline font-bold text-on-surface mb-3">
          Page Not Found
        </h1>
        <p className="text-sm font-sans text-on-surface-variant mb-8 leading-relaxed">
          The page you requested does not exist, or the link may have expired.
        </p>
        <Link to="/">
          <Button variant="primary" size="md">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
