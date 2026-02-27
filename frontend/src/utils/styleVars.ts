/**
 * Utility to access CSS variables in JavaScript/TypeScript
 * This ensures all styles are centralized in index.css
 */

export const getCSSVar = (varName: string): string => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }
  return '';
};

// Pre-defined CSS variable names for type safety
export const CSS_VARS = {
  // Backgrounds
  bgPrimary: '--bg-primary',
  bgSecondary: '--bg-secondary',
  bgTertiary: '--bg-tertiary',
  bgElevated: '--bg-elevated',
  bgHover: '--bg-hover',
  
  // Text
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  textTertiary: '--text-tertiary',
  
  // Accents
  accentPrimary: '--accent-primary',
  accentPrimaryHover: '--accent-primary-hover',
  accentPrimaryLight: '--accent-primary-light',
  accentSecondary: '--accent-secondary',
  
  // Gradients
  gradientAccent: '--gradient-accent',
  gradientAccentHover: '--gradient-accent-hover',
  gradientHero: '--gradient-hero',
  gradientPageBg: '--gradient-page-bg',
  gradientCard1: '--gradient-card-1',
  gradientCard1Bg: '--gradient-card-1-bg',
  gradientCard2: '--gradient-card-2',
  gradientCard2Bg: '--gradient-card-2-bg',
  gradientCard3: '--gradient-card-3',
  gradientCard3Bg: '--gradient-card-3-bg',
  
  // Radial gradients
  radialGlowCombined: '--radial-glow-combined',
  
  // Glass
  glassBg: '--glass-bg',
  glassBorder: '--glass-border',
  glassBgHover: '--glass-bg-hover',
  
  // Inputs
  inputBg: '--input-bg',
  inputBgHover: '--input-bg-hover',
  inputBgFocus: '--input-bg-focus',
  inputFocusGlow: '--input-focus-glow',
  
  // Shadows
  shadowGlow: '--shadow-glow',
  shadowGlowLg: '--shadow-glow-lg',
  buttonShadow: '--button-shadow',
  buttonShadowHover: '--button-shadow-hover',
  buttonShadowLg: '--button-shadow-lg',
  buttonShadowLgHover: '--button-shadow-lg-hover',
  buttonShadowIcon: '--button-shadow-icon',
  cardShadow: '--card-shadow',
  cardShadowIcon: '--card-shadow-icon',
  
  // Radius
  radiusSm: '--radius-sm',
  radiusMd: '--radius-md',
  radiusLg: '--radius-lg',
  radiusXl: '--radius-xl',
  
  // Error
  errorBg: '--error-bg',
  errorBorder: '--error-border',
  errorText: '--error-text',
} as const;

