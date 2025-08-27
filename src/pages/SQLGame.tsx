import React from "react";
import { SQLInjectionGame } from "@/components/SQLInjectionGame";
import { useNavigate } from "react-router-dom";

const SQLGame = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return <SQLInjectionGame onBack={handleBack} />;
};

export default SQLGame;