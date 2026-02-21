export interface AvatarConfig {
  gender: 'male' | 'female';
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  eyeStyle: string;
  eyeColor: string;
  noseStyle: string;
  glasses: string;
  beard: string;
  outfit: string;
  outfitColor: string;
}

export const defaultAvatarConfig: AvatarConfig = {
  gender: 'male',
  skinColor: '#F5D0A9',
  hairStyle: 'short',
  hairColor: '#3B2314',
  eyeStyle: 'round',
  eyeColor: '#4A3728',
  noseStyle: 'small',
  glasses: 'none',
  beard: 'none',
  outfit: 'hoodie',
  outfitColor: '#6C63FF',
};

export const skinColors = [
  { label: 'Light', value: '#FDEBD0' },
  { label: 'Fair', value: '#F5D0A9' },
  { label: 'Medium', value: '#D4A76A' },
  { label: 'Tan', value: '#C68E4E' },
  { label: 'Brown', value: '#8D6346' },
  { label: 'Dark', value: '#5C3D2E' },
  { label: 'Deep', value: '#3B2314' },
  { label: 'Ebony', value: '#2C1A0E' },
];

export const hairColors = [
  { label: 'Black', value: '#1A1110' },
  { label: 'Dark Brown', value: '#3B2314' },
  { label: 'Brown', value: '#6B4226' },
  { label: 'Auburn', value: '#922B05' },
  { label: 'Red', value: '#C0392B' },
  { label: 'Blonde', value: '#D4AC0D' },
  { label: 'Platinum', value: '#F0E68C' },
  { label: 'Blue', value: '#3498DB' },
  { label: 'Purple', value: '#8E44AD' },
  { label: 'Pink', value: '#E91E8B' },
  { label: 'Green', value: '#27AE60' },
  { label: 'White', value: '#ECF0F1' },
];

export const eyeColors = [
  { label: 'Brown', value: '#4A3728' },
  { label: 'Dark', value: '#1A1110' },
  { label: 'Hazel', value: '#8B7355' },
  { label: 'Green', value: '#2E8B57' },
  { label: 'Blue', value: '#4682B4' },
  { label: 'Gray', value: '#708090' },
  { label: 'Amber', value: '#FFBF00' },
];

export const hairStyles = [
  { label: 'Short', value: 'short' },
  { label: 'Buzz Cut', value: 'buzz' },
  { label: 'Spiky', value: 'spiky' },
  { label: 'Side Part', value: 'sidepart' },
  { label: 'Long', value: 'long' },
  { label: 'Curly', value: 'curly' },
  { label: 'Afro', value: 'afro' },
  { label: 'Mohawk', value: 'mohawk' },
  { label: 'Bald', value: 'bald' },
  { label: 'Ponytail', value: 'ponytail' },
];

export const eyeStyles = [
  { label: 'Round', value: 'round' },
  { label: 'Almond', value: 'almond' },
  { label: 'Narrow', value: 'narrow' },
  { label: 'Wide', value: 'wide' },
];

export const noseStyles = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Wide', value: 'wide' },
  { label: 'Pointed', value: 'pointed' },
];

export const glassesOptions = [
  { label: 'None', value: 'none' },
  { label: 'Round Glasses', value: 'round' },
  { label: 'Square Glasses', value: 'square' },
  { label: 'Aviator Sunglasses', value: 'aviator' },
  { label: 'Cool Shades', value: 'shades' },
];

export const beardOptions = [
  { label: 'None', value: 'none' },
  { label: 'Stubble', value: 'stubble' },
  { label: 'Short Beard', value: 'short' },
  { label: 'Full Beard', value: 'full' },
  { label: 'Goatee', value: 'goatee' },
  { label: 'Mustache', value: 'mustache' },
];

export const outfitOptions = [
  { label: 'Hoodie', value: 'hoodie' },
  { label: 'T-Shirt', value: 'tshirt' },
  { label: 'Suit', value: 'suit' },
  { label: 'Lab Coat', value: 'labcoat' },
  { label: 'Leather Jacket', value: 'leather' },
  { label: 'Dress', value: 'dress' },
];

export const outfitColors = [
  { label: 'Purple', value: '#6C63FF' },
  { label: 'Blue', value: '#3498DB' },
  { label: 'Red', value: '#E74C3C' },
  { label: 'Green', value: '#27AE60' },
  { label: 'Orange', value: '#E67E22' },
  { label: 'Pink', value: '#E91E8B' },
  { label: 'Black', value: '#2C3E50' },
  { label: 'White', value: '#ECF0F1' },
];
