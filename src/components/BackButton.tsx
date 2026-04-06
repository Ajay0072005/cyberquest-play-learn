import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallback?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ fallback = "/dashboard", className }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      className={className}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};
