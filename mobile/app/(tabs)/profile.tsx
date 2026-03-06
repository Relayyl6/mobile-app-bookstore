



import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/context/useAppContext';
import profileFillStyle from '@/constants/profileFill.styles';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore'
import DeveloperMenu from '@/components/DevMenu';

const ProfileScreen = () => {
  const { colors } = useAppContext()
  const styles = profileFillStyle(colors)
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [something, setSomething] = useState(false)
  // console.log(user)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="settings" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="share-2" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <SvgUri
                uri={user?.profileImage}
                width="100%"
                height="100%"
                style={styles.avatar}
              />
            </View>
          </View>
          <Text style={styles.name}>{user.username}</Text>
          <Text style={styles.tagline}>Avid Reader & AI Enthusiast</Text>
          <Text style={styles.memberSince}>Member since {user.createdAt}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="book-open-page-variant" size={32} color={colors.primary} />
            <Text style={styles.statLabel}>BOOKS</Text>
            <Text style={styles.statValue}>42</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="fire" size={32} color={colors.primary} />
            <Text style={styles.statLabel}>STREAK</Text>
            <Text style={styles.statValue}>15d</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="robot" size={32} color={colors.primary} />
            <Text style={styles.statLabel}>AI CHATS</Text>
            <Text style={styles.statValue}>128</Text>
          </View>
        </View>

        {/* Reading Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Reading Goals</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalContent}>
              <View style={styles.progressCircle}>
                <View style={styles.progressInner}>
                  <Text style={styles.progressText}>75%</Text>
                </View>
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>{new Date().getFullYear()} Challenge</Text>
                <Text style={styles.goalSubtitle}>Read 20 books by year end</Text>
              </View>
              <Text style={styles.goalProgress}>15/20</Text>
            </View>
          </View>
        </View>

        {/* Saved AI Summaries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved AI Summaries</Text>
          
          <TouchableOpacity style={styles.summaryCard}>
            <View style={styles.summaryThumbnail}>
              <View style={styles.bookCover} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>The Midnight Library</Text>
              <Text style={styles.summaryMeta}>Summary generated 2d ago</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.summaryCard}>
            <View style={[styles.summaryThumbnail, styles.summaryThumbnail2]}>
              <View style={[styles.bookCover, styles.bookCover2]} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>Project Hail Mary</Text>
              <Text style={styles.summaryMeta}>Summary generated 1w ago</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Feather name="user" size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>Personal Information</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Feather name="bell" size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Feather name="shield" size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>Privacy & Security</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/theme')}>
            <View style={styles.settingLeft}>
              <Feather name="grid" size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>Theme Switcher</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setSomething(!something)}>
            <View style={styles.settingLeft}>
              <Feather name="grid" size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>Dev Menu</Text>

              <DeveloperMenu visible={something} onClose={() => setSomething(!something)} />
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <View style={styles.settingLeft}>
              <Feather name="log-out" size={20} color="#ff4444" />
              <Text style={styles.logoutText}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};



export default ProfileScreen;