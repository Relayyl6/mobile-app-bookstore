import { Dimensions, StyleSheet,  } from "react-native";

const { width } = Dimensions.get('window');

const homePageStyle = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  notificationButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  seeAllButton: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
  },
  bookCard: {
    width: 180,
  },
  bookCover: {
    width: 180,
    height: 260,
    borderRadius: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  aiPickCard: {
    marginHorizontal: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiPickContent: {
    flexDirection: 'row',
    gap: 16,
  },
  aiPickCover: {
    width: 100,
    height: 140,
    borderRadius: 8,
  },
  aiPickInfo: {
    flex: 1,
  },
  aiPickBadge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  aiPickBadgeOrange: {
    color: '#ff8c42',
  },
  aiPickTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  aiPickDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  startReadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  startReadingText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  hotText: {
    fontSize: 10,
    color: '#ff4444',
    fontWeight: '700',
  },
  trendingCard: {
    width: 140,
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rankText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  trendingCover: {
    width: 140,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  bottomSpacer: {
    height: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    left: width / 2 - 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
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

export default homePageStyle;