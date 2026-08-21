import { Link } from 'react-router-dom';
import SectionWrapper from '../components/SectionWrapper';
import Card from '../components/Card';
import Button from '../components/Button';

export default function TermsPage() {
  return (
    <div className="py-12 md:py-16 animate-fadeIn">
      <SectionWrapper maxWidth="max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-headline font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Acceptable Use Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-extrabold text-on-surface tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm font-sans text-on-surface-variant mt-2">
            Last updated: August 2026 • CampusPlus Hardware Management Platform
          </p>
        </div>

        {/* Terms Content Card */}
        <Card className="p-8 sm:p-12 space-y-10">
          {/* Section 1: Acceptance */}
          <section className="space-y-3">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                1
              </span>
              Acceptance of Terms
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              By accessing and submitting hardware defect reports through CampusPlus, you agree to comply with and be bound by these Terms of Service and your institution&apos;s campus code of conduct. If you do not agree with these terms, please do not use this portal.
            </p>
          </section>

          {/* Section 2: Permitted Use */}
          <section className="space-y-4 pt-6 border-t border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                2
              </span>
              Permitted & Acceptable Use
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              CampusPlus is provided exclusively for reporting legitimate hardware failures, equipment damage, or facility issues within university laboratories, lecture halls, and academic spaces.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm font-sans text-on-surface-variant pl-2">
              <li>
                <strong className="text-on-surface">Truthful Submissions:</strong> You agree to provide accurate information regarding the device type, room number, and nature of the issue.
              </li>
              <li>
                <strong className="text-on-surface">Authentic Identification:</strong> Reports must be submitted using your genuine Student Roll / Registration Code.
              </li>
              <li>
                <strong className="text-on-surface">Clear Evidence:</strong> You agree to upload clear, genuine photos that accurately reflect the state of the damaged or malfunctioning hardware.
              </li>
            </ul>
          </section>

          {/* Section 3: Prohibited Conduct */}
          <section className="space-y-4 pt-6 border-t border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                3
              </span>
              Prohibited Conduct
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              Users of CampusPlus are strictly prohibited from engaging in any of the following activities:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-red-50/50 border border-status-rejected/20">
                <h3 className="font-headline font-bold text-sm text-status-rejected mb-1">
                  False or Spam Reports
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Submitting fraudulent, prank, duplicate, or intentionally misleading defect reports to disrupt campus facilities.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-red-50/50 border border-status-rejected/20">
                <h3 className="font-headline font-bold text-sm text-status-rejected mb-1">
                  Inappropriate Uploads
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Uploading offensive, explicit, copyrighted, or malicious media files unrelated to equipment maintenance.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-red-50/50 border border-status-rejected/20">
                <h3 className="font-headline font-bold text-sm text-status-rejected mb-1">
                  System Tampering
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Attempting to bypass rate limiting, execute denial-of-service, or probe administrative API endpoints.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-red-50/50 border border-status-rejected/20">
                <h3 className="font-headline font-bold text-sm text-status-rejected mb-1">
                  Impersonation
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Submitting tickets using other students&apos; identification codes or falsifying academic affiliations.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Maintenance Triage & SLAs */}
          <section className="space-y-3 pt-6 border-t border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                4
              </span>
              Maintenance Prioritization & Service Availability
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              Submitting a report does not guarantee immediate repair. Facilities staff prioritize tickets based on multiple factors including report frequency, severity, laboratory usage, and technician availability. CampusPlus is provided on an &quot;as is&quot; basis to support institutional operations.
            </p>
          </section>

          {/* Section 5: Modifications */}
          <section className="space-y-3 pt-6 border-t border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                5
              </span>
              Modifications to Terms
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              The university administration reserves the right to update these terms at any time. Continued use of the portal after modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Action CTA */}
          <div className="pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/report">
              <Button variant="primary" size="md">
                I Understand — Report an Issue
              </Button>
            </Link>
            <Link to="/privacy" className="text-xs font-headline font-semibold text-primary hover:underline">
              Read Privacy Policy →
            </Link>
          </div>
        </Card>
      </SectionWrapper>
    </div>
  );
}
