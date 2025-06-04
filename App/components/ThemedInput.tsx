import React from 'react';
import { View, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';

export type ThemedInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function ThemedInput({ 
  style, 
  label,
  error,
  ...rest 
}: ThemedInputProps) {
  const backgroundColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText
          variant="body2"
          weight="medium"
          style={[styles.label, error && { color: errorColor }]}
        >
          {label}
        </ThemedText>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor,
            color: textColor,
            borderColor: error ? errorColor : borderColor,
          },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        {...rest}
      />
      {error && (
        <ThemedText
          variant="caption"
          style={[styles.error, { color: errorColor }]}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  error: {
    marginTop: 4,
  },
});
