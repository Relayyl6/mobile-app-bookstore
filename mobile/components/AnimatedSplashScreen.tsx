import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as SplashScreen from 'expo-splash-screen';

// Keep the native splash screen visible while we setup
SplashScreen.preventAutoHideAsync();

export default function AnimatedSplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isAppReady, setAppReady] = useState(false);

  // Animation values
  const lineScale = useSharedValue(0);
  const lineOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);

  useEffect(() => {
    // Simulate loading your app resources (fonts, data, etc.)
    // Once done, we hide the native splash and start our animation
    async function prepareApp() {
      try {
        // Pre-load things here if needed
        await new Promise(resolve => setTimeout(resolve, 500)); 
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
        startAnimation();
      }
    }

    prepareApp();
  }, []);

  const startAnimation = () => {
    // 1. Line expands horizontally
    lineScale.value = withTiming(1, { duration: 600 }, () => {
      // 2. Line fades out
      lineOpacity.value = withTiming(0, { duration: 300 });

      // 3. Logo fades in and scales up to normal size
      logoOpacity.value = withDelay(
        200,
        withTiming(1, { duration: 2000 })
      );
      logoScale.value = withDelay(
        200,
        withTiming(1, { duration: 2000 }, (finished) => {
          if (finished) {
            // 4. Tell the app to move on to the Home screen
            scheduleOnRN(onComplete);
          }
        })
      );
    });
  };

  const animatedLineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleX: lineScale.value }],
      opacity: lineOpacity.value,
    };
  });

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });

  if (!isAppReady) {
    return null; // Let the native splash screen show
  }

  return (
    <View style={styles.container}>
      {/* The expanding line */}
      <Animated.View style={[styles.line, animatedLineStyle]} />

      {/* The main Veyo Splash Image */}
      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <Image
          source={require('@/assets/images/splash.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03142f', // Must match app.json background
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    height: 4,
    width: '60%',
    backgroundColor: '#03142f',
    borderRadius: 2,
    position: 'absolute',
  },
  logoContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});