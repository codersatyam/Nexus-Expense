import { StyleSheet, TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button = ({ title, onPress, variant = 'primary', disabled }: ButtonProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        variant === 'secondary' && styles.secondaryButton,
        disabled && styles.disabled
      ]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[
        styles.text,
        variant === 'secondary' && styles.secondaryText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#007AFF',
  },
}); 