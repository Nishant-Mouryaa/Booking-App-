"use client";

import { useEffect, useState } from "react";
import AuthLayout from "@/components/AuthLayout";
import OTPVerification from "@/components/OTPVerification";

export default function VerifyOTPPage() {
  const [phone, setPhone] = useState("+91 XXXXXXXXXX");

  useEffect(() => {
    const storedPhone = localStorage.getItem("verificationPhone");
    if (storedPhone) setPhone(storedPhone);
  }, []);

  return (
    <AuthLayout>
      <OTPVerification phoneNumber={phone} />
    </AuthLayout>
  );
}