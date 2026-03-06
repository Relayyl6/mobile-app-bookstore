import { StyleSheet } from 'react-native';

const profileFillStyle = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarBorder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#8b6f47',
    padding: 6,
  },
  avatar: {
    borderRadius: 72,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
    fontWeight: '500',
  },
  memberSince: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 6,
    borderColor: colors.primary,
    borderTopColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    transform: [{ rotate: '-45deg' }],
  },
  progressInner: {
    transform: [{ rotate: '45deg' }],
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#b8d4c8',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryThumbnail2: {
    backgroundColor: '#4a6b6b',
  },
  bookCover: {
    width: 40,
    height: 50,
    backgroundColor: '#9ac4b4',
    borderRadius: 4,
  },
  bookCover2: {
    backgroundColor: '#5a7b7b',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  summaryMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  logoutButton: {
    paddingVertical: 18,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  navLabelActive: {
    color: colors.primary,
  },
});

export default profileFillStyle;