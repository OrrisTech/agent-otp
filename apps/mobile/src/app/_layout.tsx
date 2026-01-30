/**
 * Root Layout
 *
 * App-wide layout with navigation structure.
 * Uses expo-router for file-based routing.
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useStore } from '@/hooks/useStore';
import { loadConfig } from '@/services/storage';

export default function RootLayout() {
  const setConfig = useStore((state) => state.setConfig);
  const setLoading = useStore((state) => state.setLoading);

  // Load configuration on app start
  useEffect(() => {
    async function initializeApp() {
      setLoading(true);
      try {
        const config = await loadConfig();
        setConfig(config);
      } catch (error) {
        console.error('[RootLayout] Failed to load config:', error);
      } finally {
        setLoading(false);
      }
    }

    initializeApp();
  }, [setConfig, setLoading]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#111827',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#111827',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Agent OTP',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="link"
          options={{
            title: 'Link Device',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="request/[id]"
          options={{
            title: 'OTP Request',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
});
