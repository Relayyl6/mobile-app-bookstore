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
    // JetBrains Mono NL (No Ligatures)
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
