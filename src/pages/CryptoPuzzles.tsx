import React from "react";
import { CryptoPuzzle } from "@/components/CryptoPuzzle";
import { useNavigate } from "react-router-dom";

const CryptoPuzzles = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return <CryptoPuzzle onBack={handleBack} />;
};

export default CryptoPuzzles;