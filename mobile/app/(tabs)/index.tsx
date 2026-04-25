import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { useAppContext } from '@/context/useAppContext'
import { api } from '@/components/ApiHandler'
import { GENRES } from '@/constants/data'
import {
  ContinueReadingSkeleton,
  CommunityUploadsSkeleton,
  AiPicksSkeleton,
  PopularBooksSkeleton,
} from '@/components/SkeletonLoaders'
import { GUEST_BOOKS } from '@/components/data'

const { width: SCREEN_WIDTH } = Dimensions.get('window')



// Safe guest fallbacks — filter out any undefined slots in GUEST_BOOKS
const ALL_GUEST = (GUEST_BOOKS || []).filter(Boolean)
const AI_PICKS_GUEST = ALL_GUEST.slice(2, 4)
const TRENDING_GUEST = ALL_GUEST.slice(4, 7)
const READING_GUEST  = ALL_GUEST.slice(0, 2)

// ─── Helpers ─────────────────────────────────────────────────────────────────
const withTimeout = async <T,>(promise: Promise<T>, ms = 9500): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms),
    ),
  ])

export const REASON_LABELS: Record<string, string> = {
  'Science Fiction': 'BECAUSE YOU LIKED SCI-FI',
  Fiction: 'BECAUSE YOU LIKED FICTION',
  Thriller: 'TRENDING IN THRILLER',
  Fantasy: 'BECAUSE YOU LIKED FANTASY',
  Classic: 'TIMELESS CLASSIC',
  Mystery: 'BECAUSE YOU LIKED MYSTERY',
  'Self-Help': 'POPULAR IN SELF-HELP',
}

// Always returns a string — never crashes on malformed book objects
const reasonFor = (book: Book): string => {
  if (!book) return 'RECOMMENDED FOR YOU'
  const genre = book.genre ?? (Array.isArray(book.genres) ? book.genres[0] : '') ?? ''
  return REASON_LABELS[genre] ?? 'RECOMMENDED FOR YOU'
}

// Safe id helper — book.bookId or book._id, never undefined
const getId = (book: Book): string => (book as any).bookId || book._id || (book as any).id || ''

// ─── Component ───────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const { colors, setBookId } = useAppContext()
  const router = useRouter()
  const { user } = useAuthStore()
  console.log(user)

  const [continueReading, setContinueReading] = useState<Book[]>([])
  const [aiPicks, setAiPicks]                 = useState<Book[]>([])
  const [trending, setTrending]               = useState<Book[]>([])
  const [community, setCommunity]             = useState<Book[]>([])
  const [selectedGenre, setSelectedGenre]     = useState<string>('All')
  const [offlineMode, setOfflineMode]         = useState(false)
  const [loadingSections, setLoadingSections] = useState({
    continueReading: true,
    aiPicks: true,
    trending: true,
    community: true,
  })
  const [refreshing, setRefreshing] = useState(false)

  const loadHomeData = async () => {
    setLoadingSections({ continueReading: true, aiPicks: true, trending: true, community: true })
    try {
      const [readingRes, aiRes, trendingRes, communityRes] = await Promise.all([
        withTimeout(api.getReadingLibrary()),
        withTimeout(api.getPersonalizedRecommendations(5)),
        withTimeout(api.getPopularBooks(5)),
        withTimeout(api.getBooks(1, 6)),
      ])

      console.log(JSON.stringify(readingRes, null, 2))
      console.log(JSON.stringify(aiRes, null, 2))
      console.log(JSON.stringify(trendingRes, null, 2))
      console.log(JSON.stringify(communityRes, null, 2))

      setContinueReading(readingRes.success ? ((readingRes.data  as any)?.books ?? []) : [])
      setAiPicks(aiRes.success ? ((aiRes.data as any)?.recommendations ?? []) : [])
      setTrending(trendingRes.success ? ((trendingRes.data as any)?.popularBooks ?? []) : [])
      setCommunity(communityRes.success ? ((communityRes.data as any)?.books ?? []) : [])

      setOfflineMode(
        [readingRes, aiRes, trendingRes, communityRes].some((r) => !r.success),
      )
    } catch (err) {
      console.error('Home load error:', err)
      setOfflineMode(true)
      setContinueReading([])
      setAiPicks(AI_PICKS_GUEST)
      setTrending(TRENDING_GUEST)
      setCommunity(ALL_GUEST)
    } finally {
      // Guaranteed to clear loading regardless of success or failure
      setLoadingSections({ continueReading: false, aiPicks: false, trending: false, community: false })
    }
  }

  useEffect(() => { loadHomeData() }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadHomeData()
    setRefreshing(false)
  }

  const openBook = async (id: string) => {
    if (!id) return
    if (!id.startsWith('guest-')) await api.trackBookView(id)
    setBookId(id)
    router.push(`/details?bookId=${id}`)
  }

  const allBooks = useMemo(
    () => [...continueReading, ...aiPicks, ...trending, ...community].filter(Boolean),
    [continueReading, aiPicks, trending, community],
  )

  const topGenres = useMemo(() => {
    const freq: Record<string, number> = {}
    allBooks.forEach((b) => {
      const gs = Array.isArray(b.genres) && b.genres.length ? b.genres : [b.genre || 'Fiction']
      gs.forEach((g) => { if (g) freq[g] = (freq[g] || 0) + 1 })
    })
    const ranked = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([g]) => g)
    return ['All', ...ranked, ...GENRES.filter((g) => !ranked.includes(g)).slice(0, 8)].slice(0, 10)
  }, [allBooks])

  const filterByGenre = (books: Book[]) => {
    const safe = books.filter(Boolean)
    if (selectedGenre === 'All') return safe
    return safe.filter((b) => {
      const gs = Array.isArray(b.genres) && b.genres.length ? b.genres : [b.genre]
      return gs.includes(selectedGenre)
    })
  }

  const guestMode = !user || offlineMode
  console.log(offlineMode)

  const readingBooks   = filterByGenre(continueReading.filter(Boolean))
  const aiPickBooks    = filterByGenre((aiPicks.length  ? aiPicks  : AI_PICKS_GUEST).filter(Boolean))
  const trendingBooks  = filterByGenre((trending.length ? trending : TRENDING_GUEST).filter(Boolean))
  const communityBooks = filterByGenre((community.length ? community : ALL_GUEST).filter(Boolean))

  const ACCENT2 = '#f4a261'
  const DANGER  = '#ff4444'

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, width: '100%' },

    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      margin: 12, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8, backgroundColor: colors.cardBackground, borderRadius: 24,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.primary },
    welcomeText: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
    userName: { color: colors.textPrimary, fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
    bellBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center',
    },

    searchWrap: { paddingHorizontal: 20, marginBottom: 16 },
    searchBar: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.inputBackground, borderRadius: 32,
      paddingHorizontal: 12, paddingVertical: 4,
      gap: 10, borderWidth: 1, borderColor: colors.border,
    },
    searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14, flexWrap: 'wrap', height: 'auto' },

    // FIX: flexDirection:'row' + marginRight on chip — gap doesn't work in ScrollView contentContainerStyle
    genreScrollContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 14,
    },
    chip: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
      backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
    chipTextActive: { color: colors.white },

    section: { marginBottom: 28 },
    sectionHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, marginBottom: 14,
    },
    sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
    seeAll: { color: colors.primary, fontSize: 13, fontWeight: '600' },
    emptyText: { color: colors.textSecondary, paddingHorizontal: 20, fontSize: 13 },

    hotBadge: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: DANGER,
      borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, gap: 3, marginLeft: 8,
    },
    hotText: { color: colors.white, fontSize: 10, fontWeight: '800' },

    continueCard: { width: (SCREEN_WIDTH - 60) / 2.1, marginLeft: 20, borderRadius: 14 },
    continueCover:  { width: '100%', height: 160, borderRadius: 14 },
    progressTrack: { height: 3, backgroundColor: colors.border, borderRadius: 2, marginTop: 8 },
    progressFill: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },
    progressPct: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
    continueTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginTop: 4 },
    continueAuthor: { color: colors.textSecondary, fontSize: 11 },

    aiCard: {
      marginHorizontal: 20, marginBottom: 12, backgroundColor: colors.cardBackground,
      borderRadius: 16, flexDirection: 'row', alignItems: 'center',
      padding: 14, gap: 14, borderWidth: 1, borderColor: colors.border,
    },
    aiCover: { width: 72, height: 96, borderRadius: 10 },
    aiCardContent: { flex: 1 },
    aiReasonBadge: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginBottom: 5 },
    aiReasonBadgeAccent2: { color: ACCENT2 },
    aiTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 3 },
    aiDesc: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginBottom: 10 },
    aiBtn: {
      backgroundColor: colors.primary, borderRadius: 8,
      paddingHorizontal: 14, paddingVertical: 8,
      alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    aiBtnText: { color: colors.white, fontSize: 12, fontWeight: '700' },

    trendCard: { width: 110, marginLeft: 20 },
    trendCover: { width: 110, height: 150, borderRadius: 12 },
    trendRankBadge: {
      position: 'absolute', top: 8, left: 8, backgroundColor: colors.primary,
      borderRadius: 8, width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
    },
    trendRank: { color: colors.white, fontSize: 10, fontWeight: '800' },
    trendTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: '600', marginTop: 7 },
    trendAuthor: { color: colors.textSecondary, fontSize: 10 },

    communityGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
    communityCard: {
      width: (SCREEN_WIDTH - 52) / 2, borderRadius: 14, overflow: 'hidden',
      backgroundColor: colors.cardBackground,
    },
    communityImg:{ width: '100%', height: 130 },
    communityOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000066' },
    communityGenreTag: {
      position: 'absolute', bottom: 8, left: 8,
      backgroundColor: colors.border + '99', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    },
    communityGenreText: { color: colors.white, fontSize: 10, fontWeight: '700' },
    communityCardInfo: { padding: 10 },
    communityTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
    communityAuthor: { color: colors.textSecondary, fontSize: 11 },
    communityUserRow: {
      position: 'absolute', top: 8, right: 8,
      flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    communityUserAvatar: { width: 20, height: 20, borderRadius: 10 },
    communityUserName: { color: colors.white, fontSize: 9, fontWeight: '600', maxWidth: 55 },
  })

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Image
            source={{ uri: user?.profileImage || 'https://i.pravatar.cc/100?img=32' }}
            style={s.avatar}
          />
          <View>
            <Text style={s.welcomeText}>{guestMode ? 'Offline / Guest mode' : 'Welcome back,'}</Text>
            <Text style={s.userName}>{user?.username || 'Reader'}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.bellBtn}>
          <Feather name="bell" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <MaterialCommunityIcons name="star-four-points" size={18} color={colors.primary} />
          <TextInput
            style={s.searchInput}
            placeholder={guestMode ? 'Browse offline picks...' : 'Ask AI about your book...'}
            placeholderTextColor={colors.placeholderText}
            onFocus={() => router.push('/chat')}
          />
          <TouchableOpacity>
            <Feather name="mic" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Genre chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexShrink: 0 }}
        contentContainerStyle={s.genreScrollContent}
      >
        {topGenres.map((genre) => (
          <TouchableOpacity
            key={genre}
            onPress={() => setSelectedGenre(genre)}
            style={[s.chip, selectedGenre === genre && s.chipActive]}
          >
            <Text style={[s.chipText, selectedGenre === genre && s.chipTextActive]} numberOfLines={1}>
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* ── Continue Reading (always shown) ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{guestMode ? 'Start Here' : 'Continue Reading'}</Text>
            <TouchableOpacity onPress={() => router.push('/books')}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {loadingSections.continueReading ? (
            <ContinueReadingSkeleton />
          ) : readingBooks.length === 0 ? (
            <Text style={s.emptyText}>No books yet — start exploring!</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}>
              {readingBooks.map((book) => (
                <TouchableOpacity key={getId(book) || book.title}
                  style={s.continueCard} onPress={() => openBook(getId(book))}>
                  <Image source={{ uri: book.coverImage || book.image }}
                    style={s.continueCover} contentFit="cover" />
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${book.progressPercentage || 0}%` }]} />
                  </View>
                  <Text style={s.progressPct}>{book.progressPercentage || 0}% complete</Text>
                  <Text style={s.continueTitle} numberOfLines={1}>{book.title}</Text>
                  <Text style={s.continueAuthor} numberOfLines={1}>{book.author || 'Unknown'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── AI Picks ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={16} color={colors.primary} style={{ marginRight: 5 }} />
              <Text style={s.sectionTitle}>AI Picks for You</Text>
            </View>
          </View>

          {loadingSections.aiPicks ? (
            <AiPicksSkeleton />
          ) : (
            aiPickBooks.map((book) => {
              const reason     = reasonFor(book)          // always a string, never undefined
              const isTrending = reason.startsWith('TRENDING')
              const id         = getId(book)
              return (
                <TouchableOpacity key={id || book.title} style={s.aiCard} onPress={() => openBook(id)}>
                  <Image source={{ uri: book.coverImage || book.image }}
                    style={s.aiCover} contentFit="cover" />
                  <View style={s.aiCardContent}>
                    <Text style={[s.aiReasonBadge, isTrending && s.aiReasonBadgeAccent2]}>
                      {reason}
                    </Text>
                    <Text style={s.aiTitle} numberOfLines={1}>{book.title}</Text>
                    <Text style={s.aiDesc} numberOfLines={2}>
                      {(book as any).description || 'A compelling read handpicked for your taste.'}
                    </Text>
                    <TouchableOpacity
                      style={[s.aiBtn, isTrending && { backgroundColor: ACCENT2 }]}
                      onPress={() => openBook(id)}>
                      <Text style={s.aiBtnText}>Start Reading</Text>
                      <Feather name="arrow-right" size={12} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </View>

        {/* ── Trending Now ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={s.sectionTitle}>Trending Now</Text>
              <View style={s.hotBadge}>
                <Ionicons name="flame" size={10} color={colors.white} />
                <Text style={s.hotText}>HOT</Text>
              </View>
            </View>
          </View>

          {loadingSections.trending ? (
            <PopularBooksSkeleton />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}>
              {trendingBooks.map((book, idx) => (
                <TouchableOpacity key={getId(book) || book.title}
                  style={s.trendCard} onPress={() => openBook(getId(book))}>
                  <View>
                    <Image source={{ uri: book.coverImage || book.image }}
                      style={s.trendCover} contentFit="cover" />
                    <View style={s.trendRankBadge}>
                      <Text style={s.trendRank}>#{idx + 1}</Text>
                    </View>
                  </View>
                  <Text style={s.trendTitle} numberOfLines={2}>{book.title}</Text>
                  <Text style={s.trendAuthor} numberOfLines={1}>{book.author || 'Unknown'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Community Uploads ── */}
        {communityBooks.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Community Uploads</Text>
              <TouchableOpacity onPress={() => router.push('/books')}>
                <Text style={s.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {loadingSections.community ? (
              <CommunityUploadsSkeleton />
            ) : (
              <View style={s.communityGrid}>
                {communityBooks.map((book) => (
                  <TouchableOpacity key={getId(book) || book.title}
                    style={s.communityCard} onPress={() => openBook(getId(book))}>
                    <View>
                      <Image source={{ uri: book.coverImage || book.image }}
                        style={s.communityImg} contentFit="cover" />
                      <View style={s.communityOverlay} />
                      <View style={s.communityUserRow}>
                        <Image
                          source={{ uri: book.user?.profileImage || 'https://i.pravatar.cc/100' }}
                          style={s.communityUserAvatar} />
                        <Text style={s.communityUserName} numberOfLines={1}>
                          {book.user?.username || 'Anon'}
                        </Text>
                      </View>
                      {!!book.genre && (
                        <View style={s.communityGenreTag}>
                          <Text style={s.communityGenreText}>{book.genre}</Text>
                        </View>
                      )}
                    </View>
                    <View style={s.communityCardInfo}>
                      <Text style={s.communityTitle} numberOfLines={2}>{book.title}</Text>
                      <Text style={s.communityAuthor} numberOfLines={1}>
                        {book.author || 'Unknown Author'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default HomeScreen