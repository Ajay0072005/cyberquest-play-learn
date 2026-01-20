import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains a number', test: (p) => /[0-9]/.test(p) },
  { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

// Common weak passwords to check against (subset of known breached passwords)
const commonPasswords = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
  'dragon', 'letmein', 'login', 'welcome', 'admin', 'princess', 'football',
  'iloveyou', 'sunshine', 'password1', 'password123', '123456789', '1234567890'
];

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { strength, isCommon, metRequirements } = useMemo(() => {
    if (!password) {
      return { strength: 0, isCommon: false, metRequirements: 0 };
    }

    const isCommon = commonPasswords.some(
      (common) => password.toLowerCase().includes(common)
    );

    const metRequirements = requirements.filter((req) => req.test(password)).length;
    
    // Calculate strength (0-5)
    let strength = metRequirements;
    if (isCommon) strength = Math.max(0, strength - 2);

    return { strength, isCommon, metRequirements };
  }, [password]);

  const getStrengthLabel = () => {
    if (!password) return '';
    if (strength <= 1) return 'Very Weak';
    if (strength === 2) return 'Weak';
    if (strength === 3) return 'Fair';
    if (strength === 4) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-destructive';
    if (strength === 2) return 'bg-orange-500';
    if (strength === 3) return 'bg-yellow-500';
    if (strength === 4) return 'bg-green-500';
    return 'bg-primary';
  };

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={strength >= 4 ? 'text-primary' : 'text-muted-foreground'}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Common password warning */}
      {isCommon && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          This password is commonly used and may be compromised
        </p>
      )}

      {/* Requirements checklist */}
      <div className="space-y-1">
        {requirements.map((req, index) => {
          const met = req.test(password);
          return (
            <div
              key={index}
              className={`flex items-center gap-2 text-xs transition-colors ${
                met ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {met ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {req.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const isPasswordStrong = (password: string): boolean => {
  const metRequirements = requirements.filter((req) => req.test(password)).length;
  const isCommon = commonPasswords.some(
    (common) => password.toLowerCase().includes(common)
  );
  return metRequirements >= 4 && !isCommon;
};
