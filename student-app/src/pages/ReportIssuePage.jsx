import SectionWrapper from '../components/SectionWrapper';

export default function ReportIssuePage() {
  return (
    <SectionWrapper
      eyebrow="Fault Submission"
      title="Report an Issue"
      subtitle="Help maintenance fix lab equipment faster by submitting accurate details and a clear photo."
      centered
    >
      <div className="max-w-2xl mx-auto bg-surface-container-lowest p-8 rounded-xl shadow-card border border-outline-variant/30 text-center">
        <p className="text-on-surface-variant text-sm">
          Report Form will be fully wired in Phase 9.
        </p>
      </div>
    </SectionWrapper>
  );
}
