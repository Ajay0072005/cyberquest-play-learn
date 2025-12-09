import React from "react";
import { SQLInjectionGame } from "@/components/SQLInjectionGame";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";

const SQLGame = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <DashboardLayout>
      <SQLInjectionGame onBack={handleBack} />
    </DashboardLayout>
  );
};

export default SQLGame;
