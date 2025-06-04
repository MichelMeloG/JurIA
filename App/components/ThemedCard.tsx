import React from 'react';
import { TouchableOpacity, StyleSheet, type TouchableOpacityProps } from 'react-native';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedCardProps = TouchableOpacityProps & {
  elevated?: boolean;
  noPadding?: boolean;
};

export function ThemedCard({ 
  style, 
  elevated = true,
  noPadding = false,
  children,
  ...rest 
}: ThemedCardProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const shadowColor = useThemeColor({}, 'shadow');

  if (rest.onPress) {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          elevated && {
            ...styles.elevated,
            shadowColor,
            borderColor,
          },
          !noPadding && styles.padding,
          { backgroundColor },
          style,
        ]}
        activeOpacity={0.7}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        elevated && {
          ...styles.elevated,
          shadowColor,
          borderColor,
        },
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  elevated: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(60,60,60,0.08)',
  },
  padding: {
    padding: 24,
  },
});
