interface UnavailableBannerProps {
  onGoAvailable: () => void;
}

export function UnavailableBanner({ onGoAvailable }: UnavailableBannerProps) {
  return (
    <div className="dd-unavailable-banner">
      <div className="dd-unavailable-banner__content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 8v4m0 4h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <div>
          <strong>You are currently set as unavailable</strong>
          <p>
            Patients cannot book new appointments with you. Your profile will
            show as &quot;Unavailable&quot; on the patient app. Existing
            appointments are not affected.
          </p>
        </div>
      </div>
      <button className="dd-unavailable-banner__btn" onClick={onGoAvailable}>
        Go Available
      </button>
    </div>
  );
}