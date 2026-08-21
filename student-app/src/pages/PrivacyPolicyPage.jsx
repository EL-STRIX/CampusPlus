import { Link } from 'react-router-dom';
import SectionWrapper from '../components/SectionWrapper';
import Card from '../components/Card';
import Button from '../components/Button';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 md:py-16 animate-fadeIn">
      <SectionWrapper maxWidth="max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-headline font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Institutional Data Governance
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-extrabold text-on-surface tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm font-sans text-on-surface-variant mt-2">
            Last updated: August 2026 • CampusPlus Hardware Management Platform
          </p>
        </div>

        {/* Policy Content Card */}
        <Card className="p-8 sm:p-12 space-y-10">
          {/* Section 1: Overview */}
          <section className="space-y-3">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                1
              </span>
              Overview & Scope
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              CampusPlus is an institutional facility maintenance and equipment fault reporting system. We prioritize student convenience and privacy by offering a zero-login reporting experience. This policy explains what information we collect when you submit a maintenance ticket, why we collect it, and how your data is handled securely.
            </p>
          </section>

          {/* Section 2: Information Collected */}
          <section className="space-y-4 pt-6 border-t border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                2
              </span>
              Information Collected During Report Submission
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              When a student submits a hardware fault report, CampusPlus collects the following specific data points:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm font-sans text-on-surface-variant pl-2">
              <li>
                <strong className="text-on-surface">Student Identification:</strong> Student Roll Number / University Code, Department, Academic Stream, and optional Year/Semester.
              </li>
              <li>
                <strong className="text-on-surface">Equipment Location:</strong> Campus Building and Room / Laboratory identifier.
              </li>
              <li>
                <strong className="text-on-surface">Hardware Details:</strong> Device category (e.g., Computer, Projector, HVAC), Asset / Device Tag Number (if visible), and descriptive fault notes.
              </li>
              <li>
                <strong className="text-on-surface">Photographic Evidence:</strong> An uploaded image demonstrating the physical fault or broken device state.
              </li>
            </ul>
          </section>

          {/* Section 3: Purpose & Usage */}
          <section className="space-y-4 pt-6 border-t border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                3
              </span>
              Purpose & Use of Data
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              Collected data is used exclusively for campus maintenance operations:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <h3 className="font-headline font-bold text-sm text-on-surface mb-1">
                  Intelligent Triage & Deduplication
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Automatically linking multiple reports about the same faulty device to determine priority and prevent duplicate technician dispatches.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <h3 className="font-headline font-bold text-sm text-on-surface mb-1">
                  Verification & Audit Trail
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Verifying reported issues and maintaining an institutional accountability history of facility repairs.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Photo Guidelines & Privacy */}
          <section className="space-y-3 pt-6 border-t border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                4
              </span>
              Photographic Evidence & Media Privacy
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              Photographs submitted via CampusPlus must focus strictly on the faulty campus hardware (e.g., cracked monitor, faulty keyboard, malfunctioning projector). We do not perform facial recognition or automated biometric scanning. Images are stored securely on campus servers with access restricted to authorized facilities maintenance staff.
            </p>
          </section>

          {/* Section 5: Data Security & Access Controls */}
          <section className="space-y-3 pt-6 border-t border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                5
              </span>
              Security & Access Control
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              All data transmissions are encrypted using standard TLS protocols. Access to submitted reports, student codes, and audit logs is restricted to authenticated campus administrative staff and facilities personnel using industry-standard JWT authentication and password hashing.
            </p>
          </section>

          {/* Section 6: Contact */}
          <section className="space-y-3 pt-6 border-t border-outline-variant/20">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs">
                6
              </span>
              Contact & Inquiries
            </h2>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              For any questions or privacy concerns regarding the CampusPlus reporting platform, please reach out to your University Facilities & IT Administration office.
            </p>
          </section>

          {/* Action CTA */}
          <div className="pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/report">
              <Button variant="primary" size="md">
                Report a Hardware Issue
              </Button>
            </Link>
            <Link to="/terms" className="text-xs font-headline font-semibold text-primary hover:underline">
              Read Terms of Service →
            </Link>
          </div>
        </Card>
      </SectionWrapper>
    </div>
  );
}
