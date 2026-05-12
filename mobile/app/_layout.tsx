import { AppContextProvider, useAppContext } from "@/context/useAppContext";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import Safescreen from "@/components/Safescreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/authStore";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimatedSplashScreen from "@/components/AnimatedSplashScreen";

// ── inner layout — sits INSIDE AppContextProvider so useAppContext is valid ──
function AppLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { checkAuth, user, token } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const { colors } = useAppContext(); // ✅ safe here — wrapped by provider above
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const inAuthScreen = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)");
    } else if (isSignedIn && !user?.onboardingCompleted && !inOnboarding) {
      router.replace("/onboarding");
    } else if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [isReady, user, token, segments, router]);

  const [fontLoaded, error] = useFonts({
    "JetBrainsMono-Thin": require("../assets/fonts/ttf/JetBrainsMono-Thin.ttf"),
    "JetBrainsMono-ThinItalic": require("../assets/fonts/ttf/JetBrainsMono-ThinItalic.ttf"),
    "JetBrainsMono-ExtraLight": require("../assets/fonts/ttf/JetBrainsMono-ExtraLight.ttf"),
    "JetBrainsMono-ExtraLightItalic": require("../assets/fonts/ttf/JetBrainsMono-ExtraLightItalic.ttf"),
    "JetBrainsMono-Light": require("../assets/fonts/ttf/JetBrainsMono-Light.ttf"),
    "JetBrainsMono-LightItalic": require("../assets/fonts/ttf/JetBrainsMono-LightItalic.ttf"),
    "JetBrainsMono-Regular": require("../assets/fonts/ttf/JetBrainsMono-Regular.ttf"),
    "JetBrainsMono-Italic": require("../assets/fonts/ttf/JetBrainsMono-Italic.ttf"),
    "JetBrainsMono-Medium": require("../assets/fonts/ttf/JetBrainsMono-Medium.ttf"),
    "JetBrainsMono-MediumItalic": require("../assets/fonts/ttf/JetBrainsMono-MediumItalic.ttf"),
    "JetBrainsMono-SemiBold": require("../assets/fonts/ttf/JetBrainsMono-SemiBold.ttf"),
    "JetBrainsMono-SemiBoldItalic": require("../assets/fonts/ttf/JetBrainsMono-SemiBoldItalic.ttf"),
    "JetBrainsMono-Bold": require("../assets/fonts/ttf/JetBrainsMono-Bold.ttf"),
    "JetBrainsMono-BoldItalic": require("../assets/fonts/ttf/JetBrainsMono-BoldItalic.ttf"),
    "JetBrainsMono-ExtraBold": require("../assets/fonts/ttf/JetBrainsMono-ExtraBold.ttf"),
    "JetBrainsMono-ExtraBoldItalic": require("../assets/fonts/ttf/JetBrainsMono-ExtraBoldItalic.ttf"),
    "JetBrainsMonoNL-Thin": require("../assets/fonts/ttf/JetBrainsMonoNL-Thin.ttf"),
    "JetBrainsMonoNL-ThinItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-ThinItalic.ttf"),
    "JetBrainsMonoNL-ExtraLight": require("../assets/fonts/ttf/JetBrainsMonoNL-ExtraLight.ttf"),
    "JetBrainsMonoNL-ExtraLightItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-ExtraLightItalic.ttf"),
    "JetBrainsMonoNL-Light": require("../assets/fonts/ttf/JetBrainsMonoNL-Light.ttf"),
    "JetBrainsMonoNL-LightItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-LightItalic.ttf"),
    "JetBrainsMonoNL-Regular": require("../assets/fonts/ttf/JetBrainsMonoNL-Regular.ttf"),
    "JetBrainsMonoNL-Italic": require("../assets/fonts/ttf/JetBrainsMonoNL-Italic.ttf"),
    "JetBrainsMonoNL-Medium": require("../assets/fonts/ttf/JetBrainsMonoNL-Medium.ttf"),
    "JetBrainsMonoNL-MediumItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-MediumItalic.ttf"),
    "JetBrainsMonoNL-SemiBold": require("../assets/fonts/ttf/JetBrainsMonoNL-SemiBold.ttf"),
    "JetBrainsMonoNL-SemiBoldItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-SemiBoldItalic.ttf"),
    "JetBrainsMonoNL-Bold": require("../assets/fonts/ttf/JetBrainsMonoNL-Bold.ttf"),
    "JetBrainsMonoNL-BoldItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-BoldItalic.ttf"),
    "JetBrainsMonoNL-ExtraBold": require("../assets/fonts/ttf/JetBrainsMonoNL-ExtraBold.ttf"),
    "JetBrainsMonoNL-ExtraBoldItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-ExtraBoldItalic.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontLoaded) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [fontLoaded, error]);

  if (!fontLoaded && !error) return null;

  if (!splashAnimationFinished) {
    return (
      <AnimatedSplashScreen 
        onComplete={() => setSplashAnimationFinished(true)} 
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <Safescreen>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(reading)" />
          <Stack.Screen name="onboarding" />
        </Stack>
      </Safescreen>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

// ── outer shell — just provides the context, nothing else ──
export default function RootLayout() {
  return (
    <AppContextProvider>
      <AppLayout />
    </AppContextProvider>
  );
}