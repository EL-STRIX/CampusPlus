import { Link } from 'react-router-dom';
import Button from '../components/Button';
import SectionWrapper from '../components/SectionWrapper';

export default function HomePage() {
  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section */}
      <section className="relative w-full min-h-[520px] md:min-h-[580px] flex items-center justify-center overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/80 to-primary/60 z-0"></div>
        <div className="relative z-10 max-w-container-max mx-auto px-gutter text-center flex flex-col items-center py-16">
          <span className="text-xs font-headline font-bold uppercase tracking-wider text-primary-fixed bg-white/10 px-4 py-1.5 rounded-full inline-block mb-4 backdrop-blur-sm">
            Campus Lab Equipment Reporting
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-headline font-extrabold text-on-primary mb-6 max-w-3xl leading-tight">
            Broken Lab Equipment? We&apos;ll Get it Fixed.
          </h1>
          <p className="text-base md:text-xl font-sans text-on-primary/90 mb-8 max-w-2xl leading-relaxed">
            Report malfunctioning fans, ACs, computers, projectors, and more in under 60 seconds — no login required.
          </p>
          <Link to="/report">
            <Button variant="surface" size="lg">
              Report an Issue Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Intro Section */}
      <SectionWrapper
        eyebrow="Frictionless Process"
        title="Keep Campus Labs Running"
        subtitle="CampusPlus connects students directly with campus maintenance to resolve hardware issues quickly."
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 font-headline font-bold text-xl">
              1
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Snap a Photo</h3>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              Take a quick photo of the malfunctioning equipment to show the exact state.
            </p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 font-headline font-bold text-xl">
              2
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Select Location</h3>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              Pick your building, room, and device type. Tag number helps our duplicate detector.
            </p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 font-headline font-bold text-xl">
              3
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Instant Ticket</h3>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              Our automated system groups duplicate reports and dispatches maintenance immediately.
            </p>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
