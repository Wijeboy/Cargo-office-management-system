import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 animate-fade-in">
      <div className="text-center max-w-lg">
        {/* Illustration */}
        <div className="relative mb-10 flex items-center justify-center">
          {/* Animated ship silhouette */}
          <div className="relative">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-card-hover animate-float">
              <span className="material-symbols-outlined material-symbols-filled text-on-primary text-8xl">sailing</span>
            </div>
            {/* Wave rings */}
            <div className="absolute inset-0 rounded-full border-2 border-accent/20 scale-110 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 rounded-full border-2 border-accent/10 scale-125 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          </div>

          {/* 404 badge */}
          <div className="absolute -top-4 -right-4 bg-error text-on-error font-black text-lg px-4 py-2 rounded-2xl shadow-md">
            404
          </div>
        </div>

        {/* Text */}
        <h1 className="text-headline-xl text-primary font-black mb-3">Ship Not Found</h1>
        <p className="text-body-lg text-on-surface-variant leading-relaxed mb-8">
          The page you're looking for has drifted off course. It may have been moved, deleted, or never existed in our system.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary">
            <span className="material-symbols-outlined text-base">dashboard</span>
            Back to Dashboard
          </Link>
          <Link to="/track" className="btn-secondary">
            <span className="material-symbols-outlined text-base">location_searching</span>
            Track a Shipment
          </Link>
        </div>

        {/* Wave animation at bottom */}
        <div className="mt-16 opacity-20 overflow-hidden h-8">
          <svg viewBox="0 0 1200 60" className="w-full" preserveAspectRatio="none">
            <path d="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,60 L0,60 Z" fill="#041627" />
          </svg>
        </div>
        <p className="text-body-sm text-on-surface-variant mt-4">
          <span className="font-mono text-outline">Error: SHIP_NOT_FOUND_IN_REGISTRY</span>
        </p>
      </div>
    </div>
  );
}
