import { Link } from 'react-router-dom';
import Button from '../components/Button';
import SectionWrapper from '../components/SectionWrapper';

export default function HomePage() {
  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section with Visual Gradient & Tech Teal Overlay */}
      <section className="relative w-full min-h-[560px] md:min-h-[620px] flex items-center justify-center overflow-hidden bg-primary">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/85 to-primary/60 z-0"></div>

        <div className="relative z-10 max-w-container-max mx-auto px-gutter text-center flex flex-col items-center py-16">
          <span className="text-xs font-headline font-bold uppercase tracking-wider text-primary-fixed bg-white/10 px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-6 backdrop-blur-md border border-white/10 shadow-sm">
            Campus Facilities & Lab Maintenance
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-on-primary mb-6 max-w-4xl leading-tight tracking-tight drop-shadow-sm">
            Broken Lab Equipment? We&apos;ll Get it Fixed.
          </h1>

          <p className="text-base sm:text-lg md:text-xl font-sans text-on-primary/90 mb-10 max-w-2xl leading-relaxed">
            Report malfunctioning computers, ACs, projectors, fans, and lab hardware in under 60 seconds. Direct to maintenance — no login required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link to="/report">
              <Button variant="surface" size="lg" className="px-8 shadow-float flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Report an Issue Now</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Process Cards */}
      <SectionWrapper
        eyebrow="Frictionless Workflow"
        title="Fast, Transparent Campus Maintenance"
        subtitle="Experience reporting built around zero friction: snap evidence, pinpoint the lab room, and let our intelligent engine prioritize the repair."
        centered
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 shadow-card hover:shadow-float hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 font-headline font-extrabold text-2xl">
              1
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-3">Snap Evidence</h3>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              Take a quick photo of the malfunctioning equipment. Our technicians see the issue upfront before heading to your room.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 shadow-card hover:shadow-float hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 font-headline font-extrabold text-2xl">
              2
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-3">Select Location</h3>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              Choose your building and room number. Adding an asset tag number enables instant verification.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 shadow-card hover:shadow-float hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 font-headline font-extrabold text-2xl">
              3
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-3">Auto-Deduplicated</h3>
            <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
              Multiple students reporting the same broken device boost ticket priority automatically instead of creating duplicate clutter.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* Intro Context Banner */}
      <section className="py-16 px-gutter bg-surface-container-low border-y border-outline-variant/20">
        <div className="max-w-container-max mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-card border border-outline-variant/30 h-[360px] relative">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
              alt="Indian University Computer Laboratory and Tech Center"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/10"></div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-headline font-bold uppercase tracking-wider text-primary">
              Institutional Reliability
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-headline font-bold text-primary tracking-tight">
              Keep Campus Labs & Classrooms Running
            </h2>
            <p className="text-base font-sans text-on-surface-variant leading-relaxed">
              CampusPlus is designed to keep technical learning environments functional without bureaucratic hurdles. Whether it&apos;s a dead projector before a presentation or an unresponsive lab workstation, reporting takes seconds and directly mobilizes departmental staff.
            </p>
            <div className="pt-2">
              <Link to="/report">
                <Button variant="primary" size="md">
                  Submit a Fault Report
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
