/**
 * Link Device Screen
 *
 * Allows user to link device by entering API key or scanning QR code.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '@/hooks/useStore';
import { saveConfig, loadConfig } from '@/services/storage';
import { verifyApiKey } from '@/services/api';

export default function LinkDeviceScreen() {
  const router = useRouter();
  const setConfig = useStore((state) => state.setConfig);

  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle API key submission
  const handleSubmit = useCallback(async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    setIsLoading(true);

    try {
      // Verify API key with server
      const isValid = await verifyApiKey(apiKey.trim());

      if (!isValid) {
        Alert.alert('Invalid API Key', 'The API key you entered is not valid.');
        setIsLoading(false);
        return;
      }

      // Load existing config and update
      const existingConfig = await loadConfig();
      const newConfig = {
        apiUrl: existingConfig?.apiUrl ?? 'https://api.agent-otp.com',
        deviceId: existingConfig?.deviceId ?? `device_${Date.now()}`,
        apiKey: apiKey.trim(),
        isLinked: true,
        linkedAt: new Date(),
        userId: existingConfig?.userId,
        autoApprove: existingConfig?.autoApprove ?? false,
      };

      // Save config
      await saveConfig(newConfig);
      setConfig(newConfig);

      // Navigate back
      Alert.alert('Success', 'Device linked successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('[LinkDevice] Failed to link device:', error);
      Alert.alert('Error', 'Failed to link device. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, setConfig, router]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.title}>Link Your Device</Text>
          <Text style={styles.description}>
            Enter your Agent OTP API key to start receiving OTP requests from
            AI agents. You can find your API key in the dashboard.
          </Text>
        </View>

        {/* API Key input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>API Key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="aotp_..."
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            editable={!isLoading}
            accessibilityLabel="API Key input"
          />
        </View>

        {/* Submit button */}
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Link device"
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Link Device</Text>
          )}
        </Pressable>

        {/* Help text */}
        <Text style={styles.helpText}>
          Don't have an API key?{'\n'}
          Visit app.agent-otp.com to create one.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  instructions: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#374151',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDisabled: {
    backgroundColor: '#4b5563',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  helpText: {
    marginTop: 24,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
