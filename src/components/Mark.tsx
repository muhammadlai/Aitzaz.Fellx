export function Mark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="12" fill="#12151c" />
      <rect x=".6" y=".6" width="46.8" height="46.8" rx="11.4" fill="none" stroke="#d4b084" strokeOpacity=".35" />
      <path
        d="M13 12h10.4l6.6 12.2L36 12h.2v24h-5.1V24.4L25.2 36h-3.6L16.8 24.2V36H13V12z"
        fill="#d4b084"
      />
    </svg>
  );
}
