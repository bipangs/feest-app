/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Custom color palette - your brand colors
export const CustomColors = {
  white: '#ffffff',
  black: '#1a1a1a',
  darkForestGreen: '#1f4a3c',
  blue: '#007AFF',
  darkGreen: '#06402B',
  // Additional colors for better dark mode support
  lightGray: '#f5f5f5',
  mediumGray: '#8e8e93',
  darkGray: '#2c2c2e',
  card: '#ffffff',
  cardDark: '#1c1c1e',
  border: '#e5e5e7',
  borderDark: '#38383a',
}

const tintColorLight = CustomColors.darkForestGreen;
const tintColorDark = CustomColors.darkForestGreen;

export const Colors = {
  light: {
    text: CustomColors.black,
    background: CustomColors.white,
    tint: tintColorLight,
    icon: CustomColors.mediumGray,
    tabIconDefault: CustomColors.mediumGray,
    tabIconSelected: tintColorLight,
    card: CustomColors.card,
    border: CustomColors.border,
    surface: CustomColors.lightGray,
    primary: CustomColors.darkForestGreen,
    secondary: CustomColors.blue,
    success: '#34c759',
    warning: '#ff9500',
    error: '#ff3b30',
    accent: CustomColors.darkGreen,
  },
  dark: {
    text: CustomColors.white,
    background: CustomColors.black,
    tint: tintColorDark,
    icon: CustomColors.mediumGray,
    tabIconDefault: CustomColors.mediumGray,
    tabIconSelected: tintColorDark,
    card: CustomColors.cardDark,
    border: CustomColors.borderDark,
    surface: CustomColors.darkGray,
    primary: CustomColors.darkForestGreen,
    secondary: CustomColors.blue,
    success: '#30d158',
    warning: '#ff9f0a',
    error: '#ff453a',
    accent: CustomColors.darkGreen,
  },
};
