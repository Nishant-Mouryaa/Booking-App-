"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OTPVerification from "@/components/OTPVerification";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const phone = localStorage.getItem("verificationPhone");
    if (!phone) {
      router.push("/");
    } else {
      setPhoneNumber(phone);
    }
  }, [router]);

  if (!phoneNumber) {
    return null;
  }

  return (
    <main className="main-container">
      <div className="mobile-wrapper">
        <OTPVerification 
          phoneNumber={phoneNumber}
          onBack={() => router.push("/")}
        />
      </div>
    </main>
  );
}