import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import React from 'react';
import { View, Pressable, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/useAppContext';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 0, 
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="books" options={{ title: 'History' }} />
      <Tabs.Screen name="create" options={{ title: 'Profile' }} />
      <Tabs.Screen name="chat" options={{ title: "Chat" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}


function SafeBlur({ children, style }: { children: React.ReactNode, style?: any }) {
  if (Platform.OS === 'android') {
    return (
      <View style={[style, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={80} tint="light" style={style}>
      {children}
    </BlurView>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppContext();
  const styles = tabStyles(colors)
  const activeColor = colors.textSecondary; 

  return (
    <View style={[styles.container, { bottom: insets.bottom + 6, backgroundColor: colors.primary }]}>
      <SafeBlur style={styles.blur}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const Icon = () => {
              const size = 24;
              const color = isFocused ? activeColor : '#8E8E93';
              let iconName: any = 'home';
              
              if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
              if (route.name === 'books') iconName = isFocused ? 'book' : 'book-outline';
              if (route.name === 'create') iconName = isFocused ? 'create' : 'create-outline';
              if (route.name === 'chat') iconName = isFocused ? 'document-text' : 'document-text-outline';
              if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';
              
              return <Ionicons name={iconName} size={size} color={color} />;
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
              >
                <View style={isFocused ? { transform: [{ scale: 1.1 }], marginBottom: 2 } : { marginBottom: 2 }}>
                  <Icon />
                </View>
                {isFocused && (
                  <View style={styles.indicator} />
                )}
              </Pressable>
            );
          })}
        </View>
      </SafeBlur>
    </View>
  );
}

const tabStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  blur: {
    flex: 1,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 55,
    height: 40,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});