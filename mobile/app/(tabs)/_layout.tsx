import { useAppContext } from '@/context/useAppContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colors } = useAppContext()
  const insets = useSafeAreaInsets()
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: '#858585',
      headerTitleStyle: {
        color: colors.textPrimary,
        fontWeight: '600'
      },
      headerTitleAlign: "center",
      headerShadowVisible: false,
      tabBarStyle: {
        backgroundColor: colors.cardBackground,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        elevation: 8,
        paddingBottom: insets.bottom,
        height: 70 + insets.bottom,
        paddingTop: 5
      },
      tabBarItemStyle: {
        borderRadius: 12,
        marginHorizontal: 8,
        marginVertical: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      tabBarShowLabel: true,
      }}>
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={colors.textSecondary} />
          )
        }}
      />
      <Tabs.Screen 
        name="books" 
        options={{
          title: 'Books',
          tabBarIcon: ({ color, size }) => (
            <Feather name="book" size={24} color={colors.textSecondary} />
          )
        }} 
      />
      <Tabs.Screen 
        name="create" 
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => (
            <Feather name="compass" size={size} color={colors.textSecondary} />
          )
        }} 
      />
      <Tabs.Screen 
        name="chat" 
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" size={24} color={colors.textSecondary} />
          )
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={24} color={colors.primary} />
          )
        }} 
      />
    </Tabs>
  );
}