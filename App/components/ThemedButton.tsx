import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, type TouchableOpacityProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';

export type ThemedButtonProps = TouchableOpacityProps & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  children: string;
};

export function ThemedButton({
  style,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  ...rest
}: ThemedButtonProps) {
  const primary = useThemeColor({}, 'primary');
  const secondary = useThemeColor({}, 'secondary');
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');

  const getBackgroundColor = () => {
    if (disabled) return useThemeColor({}, 'border');
    switch (variant) {
      case 'primary': return primary;
      case 'secondary': return secondary;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return useThemeColor({}, 'textSecondary');
    switch (variant) {
      case 'primary':
      case 'secondary':
        return background;
      case 'outline':
      case 'ghost':
        return text;
      default:
        return background;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'outline' ? primary : 'transparent',
        },
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <ThemedText
          variant="button"
          weight="medium"
          style={[{ color: getTextColor() }]}
        >
          {children}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
    transitionProperty: 'background-color',
    transitionDuration: '200ms',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 36,
  },
  disabled: {
    opacity: 0.5,
  },
});
