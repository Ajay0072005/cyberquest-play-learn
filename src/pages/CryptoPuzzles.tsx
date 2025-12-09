import React from "react";
import { CryptoPuzzle } from "@/components/CryptoPuzzle";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";

const CryptoPuzzles = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <DashboardLayout>
      <CryptoPuzzle onBack={handleBack} />
    </DashboardLayout>
  );
};

export default CryptoPuzzles;
