import React from 'react';
import { AvatarConfig } from './avatarOptions';

interface AvatarSVGProps {
  config: AvatarConfig;
  size?: number;
}

const AvatarSVG: React.FC<AvatarSVGProps> = ({ config, size = 200 }) => {
  const { skinColor, hairStyle, hairColor, eyeStyle, eyeColor, noseStyle, glasses, beard, outfit, outfitColor, gender } = config;

  const darken = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
    const b = Math.max(0, (num & 0x0000FF) - amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  const skinShadow = darken(skinColor, 30);

  const renderHair = () => {
    if (hairStyle === 'bald') return null;
    switch (hairStyle) {
      case 'short':
        return <path d="M30 58 C30 30, 70 20, 100 25 C130 20, 170 30, 170 58 C170 45, 155 28, 100 22 C45 28, 30 45, 30 58Z" fill={hairColor} />;
      case 'buzz':
        return <path d="M35 60 C35 38, 65 25, 100 25 C135 25, 165 38, 165 60 C165 50, 150 32, 100 30 C50 32, 35 50, 35 60Z" fill={hairColor} />;
      case 'spiky':
        return (<g fill={hairColor}>
          <path d="M30 60 C30 35, 65 20, 100 22 C135 20, 170 35, 170 60 C170 48, 155 30, 100 25 C45 30, 30 48, 30 60Z" />
          <polygon points="55,28 50,8 65,25" /><polygon points="80,22 78,2 90,20" />
          <polygon points="110,20 115,0 120,20" /><polygon points="140,25 148,6 150,28" />
        </g>);
      case 'sidepart':
        return <path d="M30 58 C30 32, 60 18, 100 22 C140 18, 170 32, 170 58 C170 48, 155 30, 100 25 C45 30, 30 48, 30 58Z M30 55 C28 48, 26 38, 35 30 C30 42, 30 50, 30 55Z" fill={hairColor} />;
      case 'long':
        return <path d="M25 58 C25 28, 65 15, 100 18 C135 15, 175 28, 175 58 L175 110 C175 115, 170 118, 168 110 L168 70 C168 50, 155 30, 100 25 C45 30, 32 50, 32 70 L32 110 C30 118, 25 115, 25 110Z" fill={hairColor} />;
      case 'curly':
        return (<g fill={hairColor}>
          <circle cx="45" cy="40" r="18" /><circle cx="70" cy="30" r="18" /><circle cx="100" cy="26" r="18" />
          <circle cx="130" cy="30" r="18" /><circle cx="155" cy="40" r="18" /><circle cx="35" cy="58" r="14" />
          <circle cx="165" cy="58" r="14" />
        </g>);
      case 'afro':
        return <ellipse cx="100" cy="48" rx="65" ry="52" fill={hairColor} />;
      case 'mohawk':
        return <path d="M80 60 C80 20, 85 5, 100 2 C115 5, 120 20, 120 60 C118 30, 112 15, 100 10 C88 15, 82 30, 80 60Z" fill={hairColor} />;
      case 'ponytail':
        return (<g fill={hairColor}>
          <path d="M30 58 C30 30, 70 20, 100 25 C130 20, 170 30, 170 58 C170 45, 155 28, 100 22 C45 28, 30 45, 30 58Z" />
          <path d="M155 55 C165 50, 180 55, 185 70 C190 85, 185 105, 175 115 C170 100, 172 80, 165 65 C160 55, 155 55, 155 55Z" />
        </g>);
      default: return null;
    }
  };

  const renderEyes = () => {
    const eyeY = 82;
    const leftX = 75, rightX = 125;
    switch (eyeStyle) {
      case 'round':
        return (<g>
          <ellipse cx={leftX} cy={eyeY} rx="10" ry="10" fill="white" /><ellipse cx={rightX} cy={eyeY} rx="10" ry="10" fill="white" />
          <circle cx={leftX+2} cy={eyeY} r="5" fill={eyeColor} /><circle cx={rightX+2} cy={eyeY} r="5" fill={eyeColor} />
          <circle cx={leftX+3} cy={eyeY-2} r="2" fill="white" /><circle cx={rightX+3} cy={eyeY-2} r="2" fill="white" />
        </g>);
      case 'almond':
        return (<g>
          <ellipse cx={leftX} cy={eyeY} rx="12" ry="7" fill="white" /><ellipse cx={rightX} cy={eyeY} rx="12" ry="7" fill="white" />
          <circle cx={leftX+1} cy={eyeY} r="4.5" fill={eyeColor} /><circle cx={rightX+1} cy={eyeY} r="4.5" fill={eyeColor} />
          <circle cx={leftX+2} cy={eyeY-1} r="1.5" fill="white" /><circle cx={rightX+2} cy={eyeY-1} r="1.5" fill="white" />
        </g>);
      case 'narrow':
        return (<g>
          <ellipse cx={leftX} cy={eyeY} rx="11" ry="5" fill="white" /><ellipse cx={rightX} cy={eyeY} rx="11" ry="5" fill="white" />
          <circle cx={leftX+1} cy={eyeY} r="4" fill={eyeColor} /><circle cx={rightX+1} cy={eyeY} r="4" fill={eyeColor} />
          <circle cx={leftX+2} cy={eyeY-1} r="1.5" fill="white" /><circle cx={rightX+2} cy={eyeY-1} r="1.5" fill="white" />
        </g>);
      case 'wide':
        return (<g>
          <ellipse cx={leftX} cy={eyeY} rx="13" ry="11" fill="white" /><ellipse cx={rightX} cy={eyeY} rx="13" ry="11" fill="white" />
          <circle cx={leftX+2} cy={eyeY+1} r="6" fill={eyeColor} /><circle cx={rightX+2} cy={eyeY+1} r="6" fill={eyeColor} />
          <circle cx={leftX+3} cy={eyeY-1} r="2.5" fill="white" /><circle cx={rightX+3} cy={eyeY-1} r="2.5" fill="white" />
        </g>);
      default: return null;
    }
  };

  const renderNose = () => {
    const noseY = 100;
    switch (noseStyle) {
      case 'small': return <path d="M97 95 L100 103 L103 95" fill="none" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" />;
      case 'medium': return <path d="M95 92 L100 106 L105 92" fill="none" stroke={skinShadow} strokeWidth="2.5" strokeLinecap="round" />;
      case 'wide': return <path d="M92 96 Q100 110 108 96" fill="none" stroke={skinShadow} strokeWidth="2.5" strokeLinecap="round" />;
      case 'pointed': return <path d="M98 90 L100 108 L102 90" fill="none" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" />;
      default: return null;
    }
  };

  const renderGlasses = () => {
    const y = 82;
    switch (glasses) {
      case 'none': return null;
      case 'round':
        return (<g fill="none" stroke="#333" strokeWidth="2.5">
          <circle cx="75" cy={y} r="16" /><circle cx="125" cy={y} r="16" />
          <line x1="91" y1={y} x2="109" y2={y} /><line x1="59" y1={y} x2="40" y2={y-5} /><line x1="141" y1={y} x2="160" y2={y-5} />
        </g>);
      case 'square':
        return (<g fill="none" stroke="#333" strokeWidth="2.5">
          <rect x="59" y={y-12} width="32" height="24" rx="3" /><rect x="109" y={y-12} width="32" height="24" rx="3" />
          <line x1="91" y1={y} x2="109" y2={y} /><line x1="59" y1={y-5} x2="40" y2={y-8} /><line x1="141" y1={y-5} x2="160" y2={y-8} />
        </g>);
      case 'aviator':
        return (<g fill="rgba(100,180,255,0.25)" stroke="#888" strokeWidth="2">
          <path d="M59 72 Q75 65 91 72 Q91 95 75 98 Q59 95 59 72Z" /><path d="M109 72 Q125 65 141 72 Q141 95 125 98 Q109 95 109 72Z" />
          <line x1="91" y1="75" x2="109" y2="75" stroke="#888" /><line x1="59" y1="75" x2="40" y2="72" /><line x1="141" y1="75" x2="160" y2="72" />
        </g>);
      case 'shades':
        return (<g>
          <path d="M55 72 Q75 62 95 72 Q95 98 75 100 Q55 98 55 72Z" fill="rgba(20,20,20,0.85)" stroke="#222" strokeWidth="2.5" />
          <path d="M105 72 Q125 62 145 72 Q145 98 125 100 Q105 98 105 72Z" fill="rgba(20,20,20,0.85)" stroke="#222" strokeWidth="2.5" />
          <line x1="95" y1="76" x2="105" y2="76" stroke="#222" strokeWidth="3" />
          <line x1="55" y1="76" x2="38" y2="73" stroke="#222" strokeWidth="2.5" /><line x1="145" y1="76" x2="162" y2="73" stroke="#222" strokeWidth="2.5" />
        </g>);
      default: return null;
    }
  };

  const renderBeard = () => {
    if (gender === 'female') return null;
    switch (beard) {
      case 'none': return null;
      case 'stubble':
        return (<g fill={darken(hairColor, 20)} opacity="0.3">
          {Array.from({ length: 30 }).map((_, i) => {
            const x = 72 + Math.random() * 56;
            const y = 108 + Math.random() * 30;
            return <circle key={i} cx={x} cy={y} r="1" />;
          })}
        </g>);
      case 'short':
        return <path d="M65 115 Q70 140 100 145 Q130 140 135 115 Q130 130 100 135 Q70 130 65 115Z" fill={hairColor} opacity="0.8" />;
      case 'full':
        return <path d="M58 105 Q55 150 100 160 Q145 150 142 105 Q138 140 100 150 Q62 140 58 105Z" fill={hairColor} opacity="0.85" />;
      case 'goatee':
        return <path d="M85 118 Q90 145 100 148 Q110 145 115 118 Q110 138 100 140 Q90 138 85 118Z" fill={hairColor} opacity="0.85" />;
      case 'mustache':
        return <path d="M78 112 Q85 108 100 115 Q115 108 122 112 Q115 118 100 120 Q85 118 78 112Z" fill={hairColor} opacity="0.85" />;
      default: return null;
    }
  };

  const renderOutfit = () => {
    const outfitDark = darken(outfitColor, 30);
    switch (outfit) {
      case 'hoodie':
        return (<g>
          <path d="M45 165 Q45 148 65 140 Q82 135 100 134 Q118 135 135 140 Q155 148 155 165 L155 200 L45 200Z" fill={outfitColor} />
          <path d="M82 140 Q100 155 118 140" fill="none" stroke={outfitDark} strokeWidth="2" />
          <path d="M88 140 L88 165 Q100 172 112 165 L112 140" fill={outfitDark} opacity="0.3" />
        </g>);
      case 'tshirt':
        return (<g>
          <path d="M50 165 Q50 148 68 140 Q84 135 100 134 Q116 135 132 140 Q150 148 150 165 L150 200 L50 200Z" fill={outfitColor} />
          <path d="M68 140 Q65 150 45 155 L45 170 Q60 162 68 152" fill={outfitColor} />
          <path d="M132 140 Q135 150 155 155 L155 170 Q140 162 132 152" fill={outfitColor} />
          <path d="M85 138 Q100 148 115 138" fill="none" stroke={outfitDark} strokeWidth="1.5" />
        </g>);
      case 'suit':
        return (<g>
          <path d="M45 165 Q45 148 65 140 Q82 135 100 134 Q118 135 135 140 Q155 148 155 165 L155 200 L45 200Z" fill={outfitColor} />
          <path d="M100 140 L95 200" fill="none" stroke={outfitDark} strokeWidth="1.5" />
          <path d="M100 140 L105 200" fill="none" stroke={outfitDark} strokeWidth="1.5" />
          <path d="M85 140 L75 155 L88 150Z" fill={outfitDark} opacity="0.5" />
          <path d="M115 140 L125 155 L112 150Z" fill={outfitDark} opacity="0.5" />
          <circle cx="100" cy="160" r="2.5" fill="white" /><circle cx="100" cy="175" r="2.5" fill="white" />
        </g>);
      case 'labcoat':
        return (<g>
          <path d="M42 165 Q42 145 65 138 Q82 133 100 132 Q118 133 135 138 Q158 145 158 165 L158 200 L42 200Z" fill="#F0F0F0" />
          <path d="M100 138 L100 200" fill="none" stroke="#DDD" strokeWidth="1.5" />
          <rect x="55" y="165" width="15" height="18" rx="3" fill="none" stroke="#DDD" strokeWidth="1" />
          <circle cx="95" cy="155" r="2" fill="#DDD" /><circle cx="95" cy="170" r="2" fill="#DDD" />
          <path d="M70 138 Q68 148 55 152 L52 165 Q62 158 70 148" fill="#F0F0F0" stroke="#DDD" strokeWidth="0.5" />
        </g>);
      case 'leather':
        return (<g>
          <path d="M42 165 Q42 146 65 139 Q82 134 100 133 Q118 134 135 139 Q158 146 158 165 L158 200 L42 200Z" fill="#2C2C2C" />
          <path d="M100 139 L98 200" fill="none" stroke="#444" strokeWidth="1.5" />
          <path d="M100 139 L102 200" fill="none" stroke="#444" strokeWidth="1.5" />
          <path d="M70 139 Q65 155 50 158" fill="none" stroke="#444" strokeWidth="2" />
          <path d="M130 139 Q135 155 150 158" fill="none" stroke="#444" strokeWidth="2" />
          <path d="M82 139 Q100 150 118 139" fill="none" stroke="#555" strokeWidth="1.5" />
        </g>);
      case 'dress':
        return (<g>
          <path d="M55 165 Q55 148 72 140 Q86 135 100 134 Q114 135 128 140 Q145 148 145 165 L155 200 L45 200Z" fill={outfitColor} />
          <path d="M83 138 Q100 148 117 138" fill="none" stroke={outfitDark} strokeWidth="1.5" />
          <path d="M72 140 Q68 145 60 148" fill="none" stroke={outfitDark} strokeWidth="1.5" />
          <path d="M128 140 Q132 145 140 148" fill="none" stroke={outfitDark} strokeWidth="1.5" />
        </g>);
      default: return null;
    }
  };

  // Mouth - simple smile
  const renderMouth = () => (
    <path d="M85 118 Q100 130 115 118" fill="none" stroke={darken(skinColor, 60)} strokeWidth="2" strokeLinecap="round" />
  );

  // Eyebrows
  const renderEyebrows = () => (
    <g stroke={darken(hairColor, 10)} strokeWidth="2.5" strokeLinecap="round" fill="none">
      <path d="M63 68 Q75 62 87 66" />
      <path d="M113 66 Q125 62 137 68" />
    </g>
  );

  // Ears
  const renderEars = () => (
    <g>
      <ellipse cx="38" cy="88" rx="8" ry="12" fill={skinColor} stroke={skinShadow} strokeWidth="1" />
      <ellipse cx="162" cy="88" rx="8" ry="12" fill={skinColor} stroke={skinShadow} strokeWidth="1" />
    </g>
  );

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className="drop-shadow-lg">
      <defs>
        <clipPath id="avatarClip"><circle cx="100" cy="100" r="98" /></clipPath>
      </defs>
      <g clipPath="url(#avatarClip)">
        {/* Background */}
        <circle cx="100" cy="100" r="100" fill="hsl(var(--muted))" />
        
        {/* Outfit (behind head) */}
        {renderOutfit()}
        
        {/* Neck */}
        <rect x="88" y="125" width="24" height="20" rx="5" fill={skinColor} />
        
        {/* Head */}
        <ellipse cx="100" cy="88" rx="62" ry="65" fill={skinColor} />
        
        {/* Ears */}
        {renderEars()}
        
        {/* Hair behind (for long styles) */}
        {(hairStyle === 'long' || hairStyle === 'afro') && renderHair()}
        
        {/* Eyebrows */}
        {renderEyebrows()}
        
        {/* Eyes */}
        {renderEyes()}
        
        {/* Nose */}
        {renderNose()}
        
        {/* Mouth */}
        {renderMouth()}
        
        {/* Beard */}
        {renderBeard()}
        
        {/* Hair (on top) */}
        {hairStyle !== 'long' && hairStyle !== 'afro' && renderHair()}
        
        {/* Glasses */}
        {renderGlasses()}
      </g>
    </svg>
  );
};

export default AvatarSVG;
