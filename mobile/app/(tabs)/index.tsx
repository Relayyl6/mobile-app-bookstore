import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  TextInput,
} from 'react-native'
import { Image } from 'expo-image'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { useAppContext } from '@/context/useAppContext'
import homePageStyle from '@/constants/homepage.styles'
import { api } from '@/components/ApiHandler'
import { GENRES } from '@/constants/data'
import { ContinueReadingSkeleton, CommunityUploadsSkeleton, AiPicksSkeleton, PopularBooksSkeleton } from '@/components/SkeletonLoaders'

const GUEST_BOOKS: Book[] = [
  {
    _id: 'guest-1',
    bookId: 'guest-1',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=60',
    progressPercentage: 42,
    title: 'Atomic Habits',
    author: 'James Clear',
    image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=500&q=60',
    genre: 'Self-Help',
    genres: ['Self-Help'],
    price: '0',
    user: { _id: 'g1', username: 'Guest Shelf', profileImage: 'https://i.pravatar.cc/100?img=14' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-2',
    bookId: 'guest-2',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=60',
    progressPercentage: 0,
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=500&q=60',
    genre: 'Mystery',
    genres: ['Mystery'],
    price: '0',
    user: { _id: 'g2', username: 'Mystery Club', profileImage: 'https://i.pravatar.cc/100?img=9' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-3',
    bookId: 'guest-3',
    coverImage: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=500&q=60',
    progressPercentage: 0,
    title: 'Dune',
    author: 'Frank Herbert',
    image: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=500&q=60',
    genre: 'Science Fiction',
    genres: ['Science Fiction'],
    price: '0',
    user: { _id: 'g3', username: 'Sci-Fi Fan', profileImage: 'https://i.pravatar.cc/100?img=3' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]



const withTimeout = async <T,>(promise: Promise<T>, ms = 6500): Promise<T> => {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

const HomeScreen = () => {
  const { colors } = useAppContext()
  const styles = homePageStyle(colors)
  const router = useRouter()
  const { user } = useAuthStore()

  const [continueReading, setContinueReading] = useState<Book[]>([])
  const [aiPicks, setAiPicks] = useState<Book[]>([])
  const [trending, setTrending] = useState<Book[]>([])
  const [community, setCommunity] = useState<Book[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string>('All')
  const [offlineMode, setOfflineMode] = useState(false)

  const [loadingSections, setLoadingSections] = useState({
    continueReading: true,
    aiPicks: true,
    trending: true,
    community: true,
  })
  const [refreshing, setRefreshing] = useState(false)

  const loadHomeData = async () => {
    try {
      const [readingRes, aiRes, trendingRes, communityRes] = await Promise.all([
        withTimeout(api.getReadingLibrary(1)),
        withTimeout(api.getPersonalizedRecommendations(5)),
        withTimeout(api.getPopularBooks(5)),
        withTimeout(api.getBooks(1, 6)),
      ])

      setContinueReading(readingRes.success ? (((readingRes.data as any)?.books as any) || []) : [])
      setAiPicks(aiRes.success ? (aiRes.data?.recommendations as any) || [] : [])
      setTrending(trendingRes.success ? (trendingRes.data?.popularBooks as any) || [] : [])
      setCommunity(communityRes.success ? (((communityRes.data as any)?.books as any) || []) : [])

      const hadNetworkFailure = [readingRes, aiRes, trendingRes, communityRes].some((res) => !res.success)
      setOfflineMode(hadNetworkFailure)

      setLoadingSections({ continueReading: false, aiPicks: false, trending: false, community: false })
    } catch (err) {
      console.error('Home load error:', err)
      setOfflineMode(true)
      setContinueReading([])
      setAiPicks(GUEST_BOOKS)
      setTrending(GUEST_BOOKS)
      setCommunity(GUEST_BOOKS)
      setLoadingSections({ continueReading: false, aiPicks: false, trending: false, community: false })
    }
  }

  useEffect(() => {
    loadHomeData()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    setLoadingSections({ continueReading: true, aiPicks: true, trending: true, community: true })
    await loadHomeData()
    setRefreshing(false)
  }

  const openBook = async (bookId: string) => {
    if (!bookId.startsWith('guest-')) {
      await api.trackBookView(bookId)
    }
    router.push(`/details?bookId=${bookId}`)
  }

  const allBooks = useMemo(() => [...continueReading, ...aiPicks, ...trending, ...community], [continueReading, aiPicks, trending, community])

  const topGenres = useMemo(() => {
    const freq: Record<string, number> = {}
    allBooks.forEach((book) => {
      ;(book.genres || [book.genre || 'Fiction']).forEach((g) => {
        if (!g) return
        freq[g] = (freq[g] || 0) + 1
      })
    })

    const ranked = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([g]) => g)

    return ['All', ...ranked, ...GENRES.filter((g) => !ranked.includes(g)).slice(0, 8)].slice(0, 10)
  }, [allBooks])

  const filterByGenre = (books: Book[]) => {
    if (selectedGenre === 'All') return books
    return books.filter((book) => (book.genres || [book.genre]).includes(selectedGenre))
  }

  const guestMode = !user || offlineMode

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: user?.profileImage || 'https://i.pravatar.cc/100?img=32' }} style={styles.avatar} />
          <View>
            <Text style={styles.welcomeText}>{guestMode ? 'Offline / Guest mode' : 'Welcome back,'}</Text>
            <Text style={styles.userName}>{user?.username || 'Reader'}</Text>
          </View>
        </View>
        <Feather name="bell" size={22} color={colors.white} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="star" size={20} color={colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder={guestMode ? 'Browse offline picks...' : 'Ask AI about your next book...'}
            placeholderTextColor={colors.placeholderText}
            onFocus={() => router.push('/chat')}
          />
          <TouchableOpacity>
            <Feather name="mic" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatGenreRow colors={colors} styles={styles} genres={topGenres} selectedGenre={selectedGenre} setSelectedGenre={setSelectedGenre} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {(guestMode || continueReading.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{guestMode ? 'Start here' : 'Continue Reading'}</Text>
              <TouchableOpacity onPress={() => router.push('/books')}>
                <Text style={styles.seeAllButton}>See all</Text>
              </TouchableOpacity>
            </View>

            {loadingSections.continueReading ? (
              <ContinueReadingSkeleton />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {(guestMode ? GUEST_BOOKS : filterByGenre(continueReading)).map((book) => (
                  <TouchableOpacity key={book._id} style={styles.bookCard} onPress={() => openBook(book.bookId || book._id)}>
                    <Image source={{ uri: book.coverImage || book.image }} style={styles.bookCover} />
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${book.progressPercentage || 0}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{book.progressPercentage || 0}% complete</Text>
                    <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                    <Text style={styles.bookAuthor} numberOfLines={1}>{book.author || 'Unknown'}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}


        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Picks</Text>
          </View>
          {loadingSections.aiPicks ? (
            <AiPicksSkeleton />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {filterByGenre(aiPicks.length ? aiPicks : GUEST_BOOKS).map((book) => (
                <TouchableOpacity key={book._id} style={styles.bookCard} onPress={() => openBook(book._id)}>
                  <Image source={{ uri: book.image || book.coverImage }} style={styles.bookCover} />
                  <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>{book.author || 'Unknown'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>
          {loadingSections.trending ? (
            <PopularBooksSkeleton />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {filterByGenre(trending.length ? trending : GUEST_BOOKS).map((book) => (
                <TouchableOpacity key={book._id} style={styles.bookCard} onPress={() => openBook(book._id)}>
                  <Image source={{ uri: book.image || book.coverImage }} style={styles.bookCover} />
                  <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>{book.author || 'Unknown'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {filterByGenre(community.length ? community : GUEST_BOOKS).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Community Uploads</Text>
              <TouchableOpacity onPress={() => router.push('/books')}>
                <Text style={styles.seeAllButton}>See all</Text>
              </TouchableOpacity>
            </View>

            {loadingSections.community ? (
              <CommunityUploadsSkeleton />
            ) : (
              <View style={styles.communityGrid}>
                {filterByGenre(community.length ? community : GUEST_BOOKS).map((book) => (
                  <TouchableOpacity key={book._id} style={styles.communityCard} onPress={() => openBook(book._id)}>
                    <View style={styles.communityImageContainer}>
                      <Image source={{ uri: book.image || book.coverImage }} style={styles.communityImage} />
                      <View style={styles.communityImageOverlay} />
                      <View style={styles.communityUserBadge}>
                        <Image source={{ uri: book.user?.profileImage || 'https://i.pravatar.cc/100' }} style={styles.communityUserAvatar} />
                        <Text style={styles.communityUserName} numberOfLines={1}>{book.user?.username || 'Anonymous'}</Text>
                      </View>
                      {!!book.genre && (
                        <View style={styles.communityGenreTag}>
                          <Text style={styles.communityGenreText}>{book.genre}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.communityCardContent}>
                      <Text style={styles.communityTitle} numberOfLines={2}>{book.title}</Text>
                      <Text style={styles.communityAuthor} numberOfLines={1}>{book.author || 'Unknown Author'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

const FlatGenreRow = ({ styles, colors, genres, selectedGenre, setSelectedGenre }: any) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 12 }}>
    {genres.map((genre: string) => (
      <TouchableOpacity
        key={genre}
        onPress={() => setSelectedGenre(genre)}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: selectedGenre === genre ? colors.primary : colors.inputBackground,
        }}
      >
        <Text style={{ color: selectedGenre === genre ? colors.white : colors.textSecondary, fontWeight: '700' }}>{genre}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
)

export default HomeScreen
