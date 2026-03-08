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

  const lighten = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
    const b = Math.min(255, (num & 0x0000FF) + amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  const skinLight = lighten(skinColor, 25);
  const skinShadow = darken(skinColor, 35);
  const skinDeep = darken(skinColor, 55);
  const hairDark = darken(hairColor, 40);
  const hairLight = lighten(hairColor, 30);
  const outfitDark = darken(outfitColor, 45);
  const outfitLight = lighten(outfitColor, 35);
  const uid = `av${size}${skinColor.slice(1, 4)}`;

  const renderHair = () => {
    if (hairStyle === 'bald') return null;
    switch (hairStyle) {
      case 'short':
        return (
          <g>
            <path d="M28 62 C28 24, 68 8, 100 12 C132 8, 172 24, 172 62 C172 42, 152 20, 100 16 C48 20, 28 42, 28 62Z" fill={`url(#${uid}HairGrad)`} />
            <path d="M28 62 C28 24, 68 8, 100 12 C132 8, 172 24, 172 62" fill="none" stroke={hairDark} strokeWidth="1" opacity="0.3" />
          </g>
        );
      case 'buzz':
        return (
          <g>
            <path d="M33 63 C33 34, 63 18, 100 20 C137 18, 167 34, 167 63 C167 48, 148 26, 100 24 C52 26, 33 48, 33 63Z" fill={`url(#${uid}HairGrad)`} />
          </g>
        );
      case 'spiky':
        return (
          <g fill={`url(#${uid}HairGrad)`}>
            <path d="M28 62 C28 30, 65 12, 100 15 C135 12, 172 30, 172 62 C172 42, 152 22, 100 18 C48 22, 28 42, 28 62Z" />
            <polygon points="52,25 44,0 66,20" />
            <polygon points="75,16 70,-6 88,14" />
            <polygon points="100,13 100,-10 108,12" />
            <polygon points="125,14 130,-6 138,18" />
            <polygon points="148,22 156,0 158,28" />
            {/* highlight tips */}
            <polygon points="52,25 46,5 58,22" fill={hairLight} opacity="0.3" />
            <polygon points="100,13 100,-5 105,12" fill={hairLight} opacity="0.3" />
          </g>
        );
      case 'sidepart':
        return (
          <g>
            <path d="M26 60 C26 26, 60 8, 100 12 C140 8, 174 26, 174 60 C174 42, 154 22, 100 18 C46 22, 26 42, 26 60Z" fill={`url(#${uid}HairGrad)`} />
            {/* Side sweep */}
            <path d="M26 58 C24 45, 22 32, 34 22 C28 38, 26 48, 26 58Z" fill={hairColor} />
            <path d="M30 50 Q26 38, 36 26" fill="none" stroke={hairLight} strokeWidth="2" opacity="0.3" />
          </g>
        );
      case 'long':
        return (
          <g>
            <path d="M22 60 C22 22, 62 5, 100 8 C138 5, 178 22, 178 60 L178 118 C178 124, 172 128, 170 118 L170 72 C170 46, 152 24, 100 18 C48 24, 30 46, 30 72 L30 118 C28 128, 22 124, 22 118Z" fill={`url(#${uid}HairGrad)`} />
            {/* Shine strands */}
            <path d="M45 40 Q50 70, 35 110" fill="none" stroke={hairLight} strokeWidth="2.5" opacity="0.25" />
            <path d="M155 40 Q150 70, 165 110" fill="none" stroke={hairLight} strokeWidth="2.5" opacity="0.25" />
          </g>
        );
      case 'curly':
        return (
          <g>
            <circle cx="42" cy="38" r="20" fill={`url(#${uid}HairGrad)`} />
            <circle cx="68" cy="26" r="20" fill={hairColor} />
            <circle cx="100" cy="22" r="20" fill={`url(#${uid}HairGrad)`} />
            <circle cx="132" cy="26" r="20" fill={hairColor} />
            <circle cx="158" cy="38" r="20" fill={`url(#${uid}HairGrad)`} />
            <circle cx="30" cy="58" r="16" fill={hairColor} />
            <circle cx="170" cy="58" r="16" fill={hairColor} />
            {/* Curly highlights */}
            <circle cx="68" cy="23" r="6" fill={hairLight} opacity="0.2" />
            <circle cx="132" cy="23" r="6" fill={hairLight} opacity="0.2" />
          </g>
        );
      case 'afro':
        return (
          <g>
            <ellipse cx="100" cy="50" rx="72" ry="58" fill={`url(#${uid}HairGrad)`} />
            {/* Texture rings */}
            <ellipse cx="100" cy="50" rx="60" ry="48" fill="none" stroke={hairLight} strokeWidth="1" opacity="0.15" />
            <ellipse cx="100" cy="50" rx="48" ry="38" fill="none" stroke={hairDark} strokeWidth="1" opacity="0.15" />
          </g>
        );
      case 'mohawk':
        return (
          <g>
            <path d="M78 62 C78 14, 84 -2, 100 -5 C116 -2, 122 14, 122 62 C120 24, 114 8, 100 4 C86 8, 80 24, 78 62Z" fill={`url(#${uid}HairGrad)`} />
            <path d="M90 10 Q100 -2, 110 10" fill="none" stroke={hairLight} strokeWidth="2" opacity="0.3" />
          </g>
        );
      case 'ponytail':
        return (
          <g>
            <path d="M28 60 C28 24, 68 8, 100 12 C132 8, 172 24, 172 60 C172 42, 152 20, 100 16 C48 20, 28 42, 28 60Z" fill={`url(#${uid}HairGrad)`} />
            <path d="M158 52 C168 46, 185 52, 190 70 C195 90, 188 112, 178 122 C174 105, 176 82, 168 66 C162 54, 158 52, 158 52Z" fill={`url(#${uid}HairGrad)`} />
            <ellipse cx="160" cy="52" rx="6" ry="4" fill={hairDark} opacity="0.4" />
          </g>
        );
      default: return null;
    }
  };

  const renderEyes = () => {
    const eyeY = 82;
    const leftX = 74, rightX = 126;

    // Eyelid shadow
    const eyelidShadow = (
      <g>
        <ellipse cx={leftX} cy={eyeY - 3} rx="14" ry="5" fill={skinShadow} opacity="0.25" />
        <ellipse cx={rightX} cy={eyeY - 3} rx="14" ry="5" fill={skinShadow} opacity="0.25" />
      </g>
    );

    const renderPair = (rx: number, ry: number, pupilR: number, irisR: number) => (
      <g>
        {eyelidShadow}
        {/* Whites with subtle gradient */}
        <ellipse cx={leftX} cy={eyeY} rx={rx} ry={ry} fill="white" stroke="#e0ddd8" strokeWidth="0.5" />
        <ellipse cx={rightX} cy={eyeY} rx={rx} ry={ry} fill="white" stroke="#e0ddd8" strokeWidth="0.5" />
        {/* Iris */}
        <circle cx={leftX + 2} cy={eyeY + 0.5} r={irisR} fill={eyeColor} />
        <circle cx={rightX + 2} cy={eyeY + 0.5} r={irisR} fill={eyeColor} />
        {/* Iris inner ring */}
        <circle cx={leftX + 2} cy={eyeY + 0.5} r={irisR * 0.65} fill={darken(eyeColor, 30)} />
        <circle cx={rightX + 2} cy={eyeY + 0.5} r={irisR * 0.65} fill={darken(eyeColor, 30)} />
        {/* Pupil */}
        <circle cx={leftX + 2} cy={eyeY + 0.5} r={pupilR} fill="#111" />
        <circle cx={rightX + 2} cy={eyeY + 0.5} r={pupilR} fill="#111" />
        {/* Big shine */}
        <ellipse cx={leftX + 4} cy={eyeY - 2} rx="2.5" ry="2" fill="white" opacity="0.9" />
        <ellipse cx={rightX + 4} cy={eyeY - 2} rx="2.5" ry="2" fill="white" opacity="0.9" />
        {/* Small shine */}
        <circle cx={leftX} cy={eyeY + 2} r="1.2" fill="white" opacity="0.5" />
        <circle cx={rightX} cy={eyeY + 2} r="1.2" fill="white" opacity="0.5" />
        {/* Upper eyelid line */}
        <path d={`M${leftX - rx} ${eyeY - 1} Q${leftX} ${eyeY - ry - 2} ${leftX + rx} ${eyeY - 1}`} fill="none" stroke={skinDeep} strokeWidth="1.5" strokeLinecap="round" />
        <path d={`M${rightX - rx} ${eyeY - 1} Q${rightX} ${eyeY - ry - 2} ${rightX + rx} ${eyeY - 1}`} fill="none" stroke={skinDeep} strokeWidth="1.5" strokeLinecap="round" />
        {/* Lashes */}
        {gender === 'female' && (
          <g stroke={skinDeep} strokeWidth="1.5" strokeLinecap="round">
            <line x1={leftX - rx + 1} y1={eyeY - 1} x2={leftX - rx - 2} y2={eyeY - 5} />
            <line x1={leftX - rx + 4} y1={eyeY - 3} x2={leftX - rx + 1} y2={eyeY - 7} />
            <line x1={rightX + rx - 1} y1={eyeY - 1} x2={rightX + rx + 2} y2={eyeY - 5} />
            <line x1={rightX + rx - 4} y1={eyeY - 3} x2={rightX + rx - 1} y2={eyeY - 7} />
          </g>
        )}
      </g>
    );

    switch (eyeStyle) {
      case 'round': return renderPair(11, 11, 3, 6);
      case 'almond': return renderPair(13, 8, 2.8, 5.5);
      case 'narrow': return renderPair(12, 6, 2.5, 5);
      case 'wide': return renderPair(14, 12, 3.5, 7);
      default: return null;
    }
  };

  const renderNose = () => {
    switch (noseStyle) {
      case 'small':
        return (
          <g>
            <path d="M96 94 Q100 105 104 94" fill="none" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" />
            <circle cx="96" cy="103" r="2" fill={skinShadow} opacity="0.15" />
            <circle cx="104" cy="103" r="2" fill={skinShadow} opacity="0.15" />
          </g>
        );
      case 'medium':
        return (
          <g>
            <path d="M94 90 Q100 108 106 90" fill="none" stroke={skinShadow} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M93 105 Q96 108 100 107 Q104 108 107 105" fill="none" stroke={skinShadow} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </g>
        );
      case 'wide':
        return (
          <g>
            <path d="M90 96 Q100 112 110 96" fill="none" stroke={skinShadow} strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="92" cy="106" rx="3" ry="2" fill={skinShadow} opacity="0.12" />
            <ellipse cx="108" cy="106" rx="3" ry="2" fill={skinShadow} opacity="0.12" />
          </g>
        );
      case 'pointed':
        return (
          <g>
            <path d="M97 88 L100 110 L103 88" fill="none" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" />
            <circle cx="97" cy="108" r="1.5" fill={skinShadow} opacity="0.2" />
            <circle cx="103" cy="108" r="1.5" fill={skinShadow} opacity="0.2" />
          </g>
        );
      default: return null;
    }
  };

  const renderGlasses = () => {
    const y = 82;
    switch (glasses) {
      case 'none': return null;
      case 'round':
        return (
          <g>
            <circle cx="74" cy={y} r="17" fill="none" stroke="#555" strokeWidth="2.5" />
            <circle cx="126" cy={y} r="17" fill="none" stroke="#555" strokeWidth="2.5" />
            <line x1="91" y1={y} x2="109" y2={y} stroke="#555" strokeWidth="2" />
            <line x1="57" y1={y} x2="38" y2={y - 5} stroke="#555" strokeWidth="2" />
            <line x1="143" y1={y} x2="162" y2={y - 5} stroke="#555" strokeWidth="2" />
            {/* Lens glare */}
            <ellipse cx="68" cy={y - 5} rx="5" ry="3" fill="white" opacity="0.12" />
            <ellipse cx="120" cy={y - 5} rx="5" ry="3" fill="white" opacity="0.12" />
          </g>
        );
      case 'square':
        return (
          <g>
            <rect x="57" y={y - 13} width="34" height="26" rx="4" fill="none" stroke="#444" strokeWidth="2.5" />
            <rect x="109" y={y - 13} width="34" height="26" rx="4" fill="none" stroke="#444" strokeWidth="2.5" />
            <line x1="91" y1={y} x2="109" y2={y} stroke="#444" strokeWidth="2" />
            <line x1="57" y1={y - 5} x2="38" y2={y - 8} stroke="#444" strokeWidth="2" />
            <line x1="143" y1={y - 5} x2="162" y2={y - 8} stroke="#444" strokeWidth="2" />
            <rect x="60" y={y - 10} width="10" height="6" rx="1" fill="white" opacity="0.08" />
            <rect x="112" y={y - 10} width="10" height="6" rx="1" fill="white" opacity="0.08" />
          </g>
        );
      case 'aviator':
        return (
          <g>
            <path d="M57 72 Q74 64 91 72 Q92 98 74 102 Q56 98 57 72Z" fill="rgba(100,180,255,0.2)" stroke="#999" strokeWidth="2" />
            <path d="M109 72 Q126 64 143 72 Q144 98 126 102 Q108 98 109 72Z" fill="rgba(100,180,255,0.2)" stroke="#999" strokeWidth="2" />
            <line x1="91" y1="75" x2="109" y2="75" stroke="#999" strokeWidth="2" />
            <line x1="57" y1="75" x2="38" y2="72" stroke="#999" strokeWidth="2" />
            <line x1="143" y1="75" x2="162" y2="72" stroke="#999" strokeWidth="2" />
            <path d="M62 74 Q70 70 78 74" fill="white" opacity="0.15" />
            <path d="M114 74 Q122 70 130 74" fill="white" opacity="0.15" />
          </g>
        );
      case 'shades':
        return (
          <g>
            <path d="M53 72 Q74 60 95 72 Q96 100 74 103 Q52 100 53 72Z" fill="url(#shadeGrad)" stroke="#222" strokeWidth="2.5" />
            <path d="M105 72 Q126 60 147 72 Q148 100 126 103 Q104 100 105 72Z" fill="url(#shadeGrad)" stroke="#222" strokeWidth="2.5" />
            <line x1="95" y1="76" x2="105" y2="76" stroke="#222" strokeWidth="3" />
            <line x1="53" y1="76" x2="36" y2="73" stroke="#222" strokeWidth="2.5" />
            <line x1="147" y1="76" x2="164" y2="73" stroke="#222" strokeWidth="2.5" />
            {/* Glare */}
            <path d="M60 76 Q68 70 76 76" fill="white" opacity="0.1" />
            <path d="M112 76 Q120 70 128 76" fill="white" opacity="0.1" />
          </g>
        );
      default: return null;
    }
  };

  const renderBeard = () => {
    if (gender === 'female') return null;
    switch (beard) {
      case 'none': return null;
      case 'stubble':
        return (
          <g fill={darken(hairColor, 20)} opacity="0.25">
            {Array.from({ length: 50 }).map((_, i) => {
              const x = 70 + (i * 7.3 + i * i * 3.1) % 60;
              const y = 110 + (i * 5.7 + i * i * 2.3) % 28;
              return <circle key={i} cx={x} cy={y} r="0.8" />;
            })}
          </g>
        );
      case 'short':
        return (
          <g>
            <path d="M63 116 Q68 142 100 148 Q132 142 137 116 Q132 135 100 140 Q68 135 63 116Z" fill={`url(#${uid}HairGrad)`} opacity="0.85" />
            <path d="M70 120 Q100 145 130 120" fill="none" stroke={hairLight} strokeWidth="1" opacity="0.15" />
          </g>
        );
      case 'full':
        return (
          <g>
            <path d="M56 106 Q52 155 100 165 Q148 155 144 106 Q140 145 100 155 Q60 145 56 106Z" fill={`url(#${uid}HairGrad)`} opacity="0.9" />
            <path d="M65 115 Q100 150 135 115" fill="none" stroke={hairLight} strokeWidth="1.5" opacity="0.15" />
          </g>
        );
      case 'goatee':
        return (
          <g>
            <path d="M83 118 Q88 150 100 154 Q112 150 117 118 Q112 144 100 146 Q88 144 83 118Z" fill={`url(#${uid}HairGrad)`} opacity="0.9" />
          </g>
        );
      case 'mustache':
        return (
          <g>
            <path d="M76 113 Q84 108 100 116 Q116 108 124 113 Q116 120 100 122 Q84 120 76 113Z" fill={`url(#${uid}HairGrad)`} opacity="0.9" />
            <path d="M82 112 Q100 118 118 112" fill="none" stroke={hairLight} strokeWidth="0.8" opacity="0.2" />
          </g>
        );
      default: return null;
    }
  };

  const renderOutfit = () => {
    switch (outfit) {
      case 'hoodie':
        return (
          <g>
            <path d="M42 168 Q42 146 64 138 Q82 132 100 131 Q118 132 136 138 Q158 146 158 168 L158 200 L42 200Z" fill={`url(#${uid}OutfitGrad)`} />
            {/* Hood shadow */}
            <path d="M64 138 Q58 145 50 148" fill="none" stroke={outfitDark} strokeWidth="2.5" opacity="0.4" />
            <path d="M136 138 Q142 145 150 148" fill="none" stroke={outfitDark} strokeWidth="2.5" opacity="0.4" />
            {/* Center pocket */}
            <path d="M80 138 Q100 152 120 138" fill="none" stroke={outfitDark} strokeWidth="2" opacity="0.3" />
            <path d="M86 140 L86 168 Q100 176 114 168 L114 140" fill={outfitDark} opacity="0.15" />
            {/* Drawstrings */}
            <line x1="94" y1="140" x2="92" y2="158" stroke={outfitLight} strokeWidth="1.5" opacity="0.4" />
            <line x1="106" y1="140" x2="108" y2="158" stroke={outfitLight} strokeWidth="1.5" opacity="0.4" />
          </g>
        );
      case 'tshirt':
        return (
          <g>
            <path d="M48 168 Q48 146 68 138 Q84 132 100 131 Q116 132 132 138 Q152 146 152 168 L152 200 L48 200Z" fill={`url(#${uid}OutfitGrad)`} />
            {/* Sleeves */}
            <path d="M68 138 Q64 148 44 154 L44 168 Q58 160 68 150" fill={outfitColor} />
            <path d="M132 138 Q136 148 156 154 L156 168 Q142 160 132 150" fill={outfitColor} />
            {/* Collar */}
            <path d="M83 135 Q100 146 117 135" fill="none" stroke={outfitDark} strokeWidth="2" strokeLinecap="round" />
            {/* Highlight */}
            <path d="M85 150 L85 190" stroke={outfitLight} strokeWidth="1" opacity="0.15" />
          </g>
        );
      case 'suit':
        return (
          <g>
            <path d="M42 168 Q42 146 64 138 Q82 132 100 131 Q118 132 136 138 Q158 146 158 168 L158 200 L42 200Z" fill={`url(#${uid}OutfitGrad)`} />
            {/* Lapels */}
            <path d="M83 138 L72 158 L86 152Z" fill={outfitDark} opacity="0.45" />
            <path d="M117 138 L128 158 L114 152Z" fill={outfitDark} opacity="0.45" />
            {/* Center line */}
            <line x1="100" y1="140" x2="98" y2="200" stroke={outfitDark} strokeWidth="1.5" opacity="0.4" />
            <line x1="100" y1="140" x2="102" y2="200" stroke={outfitDark} strokeWidth="1.5" opacity="0.4" />
            {/* Buttons */}
            <circle cx="100" cy="160" r="2.5" fill="white" opacity="0.7" />
            <circle cx="100" cy="176" r="2.5" fill="white" opacity="0.7" />
            {/* Shirt collar peek */}
            <path d="M88 138 Q100 145 112 138" fill="white" opacity="0.5" />
          </g>
        );
      case 'labcoat':
        return (
          <g>
            <path d="M40 168 Q40 143 64 136 Q82 130 100 129 Q118 130 136 136 Q160 143 160 168 L160 200 L40 200Z" fill="#F5F5F5" />
            {/* Lapels */}
            <path d="M86 136 L76 152 L88 148Z" fill="#E8E8E8" />
            <path d="M114 136 L124 152 L112 148Z" fill="#E8E8E8" />
            <line x1="100" y1="138" x2="100" y2="200" stroke="#DDD" strokeWidth="1.5" />
            {/* Pocket */}
            <rect x="54" y="168" width="16" height="20" rx="3" fill="none" stroke="#DDD" strokeWidth="1.5" />
            {/* Buttons */}
            <circle cx="96" cy="155" r="2" fill="#CCC" />
            <circle cx="96" cy="172" r="2" fill="#CCC" />
            {/* Shoulder seam */}
            <path d="M68 138 Q62 148 48 152" fill="none" stroke="#E0E0E0" strokeWidth="1.5" />
            <path d="M132 138 Q138 148 152 152" fill="none" stroke="#E0E0E0" strokeWidth="1.5" />
          </g>
        );
      case 'leather':
        return (
          <g>
            <path d="M40 168 Q40 143 64 136 Q82 130 100 129 Q118 130 136 136 Q160 143 160 168 L160 200 L40 200Z" fill="#2A2A2A" />
            {/* Zipper */}
            <line x1="100" y1="136" x2="99" y2="200" stroke="#555" strokeWidth="2" />
            <line x1="100" y1="136" x2="101" y2="200" stroke="#666" strokeWidth="1" />
            {/* Lapels */}
            <path d="M84 136 Q80 148 68 152" fill="none" stroke="#444" strokeWidth="2.5" />
            <path d="M116 136 Q120 148 132 152" fill="none" stroke="#444" strokeWidth="2.5" />
            {/* Collar */}
            <path d="M80 136 Q100 148 120 136" fill="none" stroke="#555" strokeWidth="2" />
            {/* Sheen */}
            <path d="M60 150 Q65 170, 55 195" fill="none" stroke="#444" strokeWidth="3" opacity="0.3" />
            <path d="M140 150 Q135 170, 145 195" fill="none" stroke="#444" strokeWidth="3" opacity="0.3" />
          </g>
        );
      case 'dress':
        return (
          <g>
            <path d="M52 168 Q52 146 72 138 Q86 132 100 131 Q114 132 128 138 Q148 146 148 168 L158 200 L42 200Z" fill={`url(#${uid}OutfitGrad)`} />
            {/* Neckline */}
            <path d="M80 135 Q100 148 120 135" fill="none" stroke={outfitDark} strokeWidth="2" strokeLinecap="round" />
            {/* Waist gather */}
            <path d="M65 165 Q100 158 135 165" fill="none" stroke={outfitDark} strokeWidth="1.5" opacity="0.3" />
            {/* Straps */}
            <line x1="78" y1="135" x2="82" y2="128" stroke={outfitColor} strokeWidth="3" strokeLinecap="round" />
            <line x1="122" y1="135" x2="118" y2="128" stroke={outfitColor} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      default: return null;
    }
  };

  const renderMouth = () => (
    <g>
      {/* Lips */}
      <path d="M84 118 Q92 114 100 118 Q108 114 116 118" fill="none" stroke={darken(skinColor, 50)} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M84 118 Q100 132 116 118" fill={darken(skinColor, 40)} opacity="0.15" />
      <path d="M84 118 Q100 132 116 118" fill="none" stroke={darken(skinColor, 60)} strokeWidth="2" strokeLinecap="round" />
      {/* Lip shine */}
      <ellipse cx="100" cy="122" rx="5" ry="2" fill="white" opacity="0.08" />
    </g>
  );

  const renderEyebrows = () => (
    <g strokeLinecap="round" fill="none">
      <path d="M61 66 Q74 58 89 64" stroke={darken(hairColor, 10)} strokeWidth="3" />
      <path d="M111 64 Q126 58 139 66" stroke={darken(hairColor, 10)} strokeWidth="3" />
      {/* Highlight */}
      <path d="M64 66 Q74 60 86 64" stroke={hairLight} strokeWidth="1" opacity="0.2" />
      <path d="M114 64 Q126 60 136 66" stroke={hairLight} strokeWidth="1" opacity="0.2" />
    </g>
  );

  const renderEars = () => (
    <g>
      <ellipse cx="36" cy="88" rx="9" ry="13" fill={skinColor} />
      <ellipse cx="164" cy="88" rx="9" ry="13" fill={skinColor} />
      {/* Inner ear */}
      <ellipse cx="37" cy="88" rx="5" ry="8" fill={skinShadow} opacity="0.2" />
      <ellipse cx="163" cy="88" rx="5" ry="8" fill={skinShadow} opacity="0.2" />
      {/* Ear outline */}
      <ellipse cx="36" cy="88" rx="9" ry="13" fill="none" stroke={skinShadow} strokeWidth="0.8" opacity="0.4" />
      <ellipse cx="164" cy="88" rx="9" ry="13" fill="none" stroke={skinShadow} strokeWidth="0.8" opacity="0.4" />
    </g>
  );

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className="drop-shadow-lg">
      <defs>
        <clipPath id={`${uid}Clip`}><circle cx="100" cy="100" r="98" /></clipPath>
        {/* Skin gradient */}
        <radialGradient id={`${uid}SkinGrad`} cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor={skinLight} />
          <stop offset="100%" stopColor={skinColor} />
        </radialGradient>
        {/* Hair gradient */}
        <linearGradient id={`${uid}HairGrad`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={hairLight} stopOpacity="0.5" />
          <stop offset="30%" stopColor={hairColor} />
          <stop offset="100%" stopColor={hairDark} />
        </linearGradient>
        {/* Outfit gradient */}
        <linearGradient id={`${uid}OutfitGrad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={outfitLight} stopOpacity="0.6" />
          <stop offset="40%" stopColor={outfitColor} />
          <stop offset="100%" stopColor={outfitDark} />
        </linearGradient>
        {/* Shades gradient */}
        <linearGradient id="shadeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#333" />
          <stop offset="100%" stopColor="#111" />
        </linearGradient>
        {/* Background gradient */}
        <radialGradient id={`${uid}BgGrad`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.7" />
          <stop offset="100%" stopColor="hsl(var(--muted))" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${uid}Clip)`}>
        {/* Background */}
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}BgGrad)`} />

        {/* Outfit (behind head) */}
        {renderOutfit()}

        {/* Neck with shadow */}
        <rect x="87" y="124" width="26" height="22" rx="6" fill={skinColor} />
        <ellipse cx="100" cy="124" rx="18" ry="4" fill={skinShadow} opacity="0.2" />

        {/* Head */}
        <ellipse cx="100" cy="88" rx="63" ry="66" fill={`url(#${uid}SkinGrad)`} />
        {/* Cheek blush */}
        <ellipse cx="62" cy="102" rx="12" ry="7" fill="#ff9999" opacity="0.08" />
        <ellipse cx="138" cy="102" rx="12" ry="7" fill="#ff9999" opacity="0.08" />
        {/* Jaw shadow */}
        <ellipse cx="100" cy="140" rx="42" ry="10" fill={skinShadow} opacity="0.12" />

        {/* Ears */}
        {renderEars()}

        {/* Hair behind (for long/afro styles) */}
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
