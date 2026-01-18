import { AppContextProvider } from "@/context/useAppContext";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Safescreen from "@/components/Safescreen";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const [fontLoaded, error] = useFonts({
    // JetBrains Mono
    "Mono-Thin": require("../assets/fonts/ttf/JetBrainsMono-Thin.ttf"),
    "Mono-ThinItalic": require("../assets/fonts/ttf/JetBrainsMono-ThinItalic.ttf"),
    "Mono-ExtraLight": require("../assets/fonts/ttf/JetBrainsMono-ExtraLight.ttf"),
    "Mono-ExtraLightItalic": require("../assets/fonts/ttf/JetBrainsMono-ExtraLightItalic.ttf"),
    "Mono-Light": require("../assets/fonts/ttf/JetBrainsMono-Light.ttf"),
    "Mono-LightItalic": require("../assets/fonts/ttf/JetBrainsMono-LightItalic.ttf"),
    "Mono-Regular": require("../assets/fonts/ttf/JetBrainsMono-Regular.ttf"),
    "Mono-Italic": require("../assets/fonts/ttf/JetBrainsMono-Italic.ttf"),
    "Mono-Medium": require("../assets/fonts/ttf/JetBrainsMono-Medium.ttf"),
    "Mono-MediumItalic": require("../assets/fonts/ttf/JetBrainsMono-MediumItalic.ttf"),
    "Mono-SemiBold": require("../assets/fonts/ttf/JetBrainsMono-SemiBold.ttf"),
    "Mono-SemiBoldItalic": require("../assets/fonts/ttf/JetBrainsMono-SemiBoldItalic.ttf"),
    "Mono-Bold": require("../assets/fonts/ttf/JetBrainsMono-Bold.ttf"),
    "Mono-BoldItalic": require("../assets/fonts/ttf/JetBrainsMono-BoldItalic.ttf"),
    "Mono-ExtraBold": require("../assets/fonts/ttf/JetBrainsMono-ExtraBold.ttf"),
    "Mono-ExtraBoldItalic": require("../assets/fonts/ttf/JetBrainsMono-ExtraBoldItalic.ttf"),
    // JetBrains Mono NL (No Ligatures)
    "MonoNL-Thin": require("../assets/fonts/ttf/JetBrainsMonoNL-Thin.ttf"),
    "MonoNL-ThinItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-ThinItalic.ttf"),
    "MonoNL-ExtraLight": require("../assets/fonts/ttf/JetBrainsMonoNL-ExtraLight.ttf"),
    "MonoNL-ExtraLightItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-ExtraLightItalic.ttf"),
    "MonoNL-Light": require("../assets/fonts/ttf/JetBrainsMonoNL-Light.ttf"),
    "MonoNL-LightItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-LightItalic.ttf"),
    "MonoNL-Regular": require("../assets/fonts/ttf/JetBrainsMonoNL-Regular.ttf"),
    "MonoNL-Italic": require("../assets/fonts/ttf/JetBrainsMonoNL-Italic.ttf"),
    "MonoNL-Medium": require("../assets/fonts/ttf/JetBrainsMonoNL-Medium.ttf"),
    "MonoNL-MediumItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-MediumItalic.ttf"),
    "MonoNL-SemiBold": require("../assets/fonts/ttf/JetBrainsMonoNL-SemiBold.ttf"),
    "MonoNL-SemiBoldItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-SemiBoldItalic.ttf"),
    "MonoNL-Bold": require("../assets/fonts/ttf/JetBrainsMonoNL-Bold.ttf"),
    "MonoNL-BoldItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-BoldItalic.ttf"),
    "MonoNL-ExtraBold": require("../assets/fonts/ttf/JetBrainsMonoNL-ExtraBold.ttf"),
    "MonoNL-ExtraBoldItalic": require("../assets/fonts/ttf/JetBrainsMonoNL-ExtraBoldItalic.ttf"),
  })

  useEffect(() => {   
    if (error) throw error;
    if (fontLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, error]);

  if (!fontLoaded) {
    return null;
  }

  if (!fontLoaded && !error) return null;

  return (
    <AppContextProvider>
      <Safescreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="setting" />
        </Stack>
      </Safescreen> 

      <StatusBar style="dark"/>
    </AppContextProvider>
  )
}
