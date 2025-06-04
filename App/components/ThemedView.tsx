import { View, type ViewProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card' | 'surface';
  elevated?: boolean;
  rounded?: boolean;
  padded?: boolean;
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  elevated = false,
  rounded = false,
  padded = false,
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    variant === 'card' ? 'card' : variant === 'surface' ? 'surface' : 'background'
  );
  const borderColor = useThemeColor({}, 'border');
  const shadowColor = useThemeColor({}, 'shadow');

  return (
    <View 
      style={[
        { backgroundColor },
        rounded && styles.rounded,
        padded && styles.padded,
        elevated && {
          ...styles.elevated,
          shadowColor,
          borderColor,
        },
        style
      ]} 
      {...otherProps} 
    />
  );
}

const styles = StyleSheet.create({
  rounded: {
    borderRadius: 18,
  },
  padded: {
    padding: 28,
  },
  elevated: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(60,60,60,0.08)',
  },
});
