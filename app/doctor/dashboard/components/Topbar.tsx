"use client";

interface TopbarProps {
  isAvailable: boolean;
  onToggle: () => void;
}

export function Topbar({ isAvailable, onToggle }: TopbarProps) {
  return (
    <header className="dd-topbar">
      <div className="dd-topbar__left">
        <span className="dd-topbar__subtitle">Profile</span>
        <h1 className="dd-topbar__title">Professional Information</h1>
      </div>

      <div className="dd-topbar__right">
        <div
          className={`dd-availability-toggle ${
            isAvailable
              ? "dd-availability-toggle--online"
              : "dd-availability-toggle--offline"
          }`}
        >
          <div className="dd-availability-toggle__info">
            <span className="dd-availability-toggle__dot" />
            <span className="dd-availability-toggle__label">
              {isAvailable ? "Available for Patients" : "Currently Unavailable"}
            </span>
          </div>
          <button
            className={`dd-toggle ${isAvailable ? "dd-toggle--on" : "dd-toggle--off"}`}
            onClick={onToggle}
            role="switch"
            aria-checked={isAvailable}
            aria-label="Toggle availability"
          >
            <span className="dd-toggle__track">
              <span className="dd-toggle__thumb" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}