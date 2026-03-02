"use client";

import mockData from "@/data/mockData.json";
import type { Doctor, DoctorOverrides } from "../types/doctor.types";

interface ReviewsContactCardProps {
  mergedDoctor: Doctor & { availability: { days: string; hours: string } };
  overrides: DoctorOverrides;
  onChange: <K extends keyof DoctorOverrides>(
    key: K,
    value: DoctorOverrides[K]
  ) => void;
}

export function ReviewsContactCard({
  mergedDoctor,
  overrides,
  onChange,
}: ReviewsContactCardProps) {
  return (
    <section className="dd-card">
      <div className="dd-card__header">
        <div>
          <div className="dd-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <span>Reviews & Ratings</span>
          </div>
          <p className="dd-card__subtitle">
            This is based on patient feedback from the mock data.
          </p>
        </div>
      </div>

      <div className="dd-card__body">
        <div className="dd-rating">
          <div className="dd-rating__value">{mergedDoctor.rating}</div>
          <div>
            <div className="dd-rating__stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={i + 1 <= Math.round(mergedDoctor.rating) ? "#FBBF24" : "none"}
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"
                    stroke="#FBBF24"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              ))}
            </div>
            <div className="dd-rating__meta">
              <span>
                Based on {mergedDoctor.reviews.toLocaleString()} patient reviews
              </span>
              <span>
                Patients see this rating on the doctor listing and booking screen.
              </span>
            </div>
          </div>
        </div>

        <div className="dd-form-row">
          <label className="dd-label"><span>Contact Email</span></label>
          <input
            className="dd-input"
            placeholder="clinic@example.com"
            value={overrides.contactEmail ?? (mockData.testUser.email || "")}
            onChange={(e) => onChange("contactEmail", e.target.value)}
          />
        </div>

        <div className="dd-form-row">
          <label className="dd-label"><span>Phone Number</span></label>
          <input
            className="dd-input"
            placeholder="+91XXXXXXXXXX"
            value={overrides.contactPhone ?? (mockData.testUser.mobile || "")}
            onChange={(e) => onChange("contactPhone", e.target.value)}
          />
        </div>

        <div className="dd-contact-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 16.5v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 1.5 3.18 2 2 0 0 1 3.5 1h3a2 2 0 0 1 2 1.72 12.75 12.75 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l2.27-1.66a2 2 0 0 1 2.11-.45 12.75 12.75 0 0 0 2.81.7A2 2 0 0 1 21 16.5z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            These contact details are only used inside this demo and are not
            sent anywhere.
          </span>
        </div>
      </div>
    </section>
  );
}