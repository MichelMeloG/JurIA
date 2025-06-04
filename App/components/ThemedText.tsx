import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'button' | 'link';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  secondary?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = 'body1',
  weight = 'regular',
  secondary = false,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    secondary ? 'textSecondary' : 'text'
  );

  const getFontWeight = () => {
    switch (weight) {
      case 'medium': return '500';
      case 'semibold': return '600';
      case 'bold': return '700';
      default: return '400';
    }
  };

  return (
    <Text
      style={[
        { color },
        styles[variant],
        { fontWeight: getFontWeight() },
        variant === 'link' && styles.link,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1,
  },
  h2: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  body1: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  body2: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    opacity: 0.7,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
