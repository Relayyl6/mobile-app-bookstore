import { useAppContext } from '@/context/useAppContext';
import { Ionicons } from '@expo/vector-icons';
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
            <Ionicons name="home-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen 
        name="books" 
        options={{
          title: 'Books',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="create" 
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-outline" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="chat" 
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox-outline" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )
        }} 
      />
    </Tabs>
  );
}