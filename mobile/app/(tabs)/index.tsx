import React, { useEffect, useState } from 'react'
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
import { api, Book } from '@/components/ApiHandler'
import Skeleton from '@/components/SkeletonLoaders'

const HomeScreen = () => {
  const { colors } = useAppContext()
  const styles = homePageStyle(colors)
  const router = useRouter()
  const { user } = useAuthStore()

  const [continueReading, setContinueReading] = useState<Book[]>([])
  const [aiPicks, setAiPicks] = useState<Book[]>([])
  const [trending, setTrending] = useState<Book[]>([])
  const [community, setCommunity] = useState<Book[]>([])

  const [loadingSections, setLoadingSections] = useState({
    continueReading: true,
    aiPicks: true,
    trending: true,
    community: true,
  })
  const [refreshing, setRefreshing] = useState(false)

  const isRecent = (createdAt: string) => {
    if (!createdAt) return false
    const bookDate = new Date(createdAt)
    const now = new Date()
    const diffDays = (now.getTime() - bookDate.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7 // New if uploaded in last 7 days
  }

  /* ================= LOAD DATA ================= */

  const loadHomeData = async () => {
    try {
      // Load continue reading
      const readingRes = await api.getReadingLibrary(1)
      if (readingRes.success && readingRes.data) {
        //@ts-ignore
        setContinueReading(readingRes.data.books || [])
      }
      setLoadingSections((prev) => ({ ...prev, continueReading: false }))

      // Load AI picks
      const aiRes = await api.getPersonalizedRecommendations(5)
      if (aiRes.success && aiRes.data) {
        //@ts-ignore
        setAiPicks(aiRes.data.books || [])
      }
      setLoadingSections((prev) => ({ ...prev, aiPicks: false }))

      // Load trending/popular books
      const trendingRes = await api.getPopularBooks(5)
      if (trendingRes.success && trendingRes.data) {
        //@ts-ignore
        setTrending(trendingRes.data.books || [])
      }
      setLoadingSections((prev) => ({ ...prev, trending: false }))

      // Load community uploads
      const communityRes = await api.getBooks(1, 6)
      if (communityRes.success && communityRes.data) {
        //@ts-ignore
        setCommunity(communityRes.data.books || [])
      }
      setLoadingSections((prev) => ({ ...prev, community: false }))
    } catch (err) {
      console.error('Home load error:', err)
      setLoadingSections({
        continueReading: false,
        aiPicks: false,
        trending: false,
        community: false,
      })
    }
  }

  useEffect(() => {
    loadHomeData()
  }, [])

  /* ================= REFRESH ================= */

  const onRefresh = async () => {
    setRefreshing(true)
    setLoadingSections({
      continueReading: true,
      aiPicks: true,
      trending: true,
      community: true,
    })
    await loadHomeData()
    setRefreshing(false)
  }

  /* ================= NAVIGATION ================= */

  const openBook = async (bookId: string) => {
    await api.trackBookView(bookId)
    router.push(`/details?bookId=${bookId}`)
  }

  /* ================= RENDER ================= */

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: user?.profileImage }} style={styles.avatar} />
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.username}</Text>
          </View>
        </View>
        <Feather name="bell" size={22} color={colors.white} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="star" size={20} color={colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ask AI about your next book..."
            placeholderTextColor={colors.placeholderText}
            onFocus={() => router.push('/chat')}
          />
          <TouchableOpacity>
            <Feather name="mic" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Continue Reading */}
        {(loadingSections.continueReading || continueReading.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Reading</Text>
              <TouchableOpacity onPress={() => router.push('/library')}>
                <Text style={styles.seeAllButton}>See all</Text>
              </TouchableOpacity>
            </View>

            {loadingSections.continueReading ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {[1, 2].map((i) => (
                  <View key={i} style={styles.bookCard}>
                    <Skeleton width={120} height={180} borderRadius={8} />
                    <Skeleton
                      width={120}
                      height={8}
                      borderRadius={4}
                      style={{ marginTop: 8 }}
                    />
                    <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
                    <Skeleton width={100} height={14} style={{ marginTop: 4 }} />
                    <Skeleton width={90} height={12} style={{ marginTop: 2 }} />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {continueReading.map((book) => (
                  <TouchableOpacity
                    key={book._id}
                    style={styles.bookCard}
                    onPress={() => openBook(book._id)}
                  >
                    <Image source={{ uri: book.image }} style={styles.bookCover} />
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${book.progress || 0}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {book.progress || 0}% complete
                    </Text>
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={styles.bookAuthor} numberOfLines={1}>
                      {book.author || 'Unknown'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* AI Picks for You */}
        {(loadingSections.aiPicks || aiPicks.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithIcon}>
              <MaterialCommunityIcons
                name="robot"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.sectionTitle}>AI Picks for You</Text>
            </View>

            {loadingSections.aiPicks ? (
              <>
                {[1, 2].map((i) => (
                  <View key={i} style={styles.aiPickCard}>
                    <View style={styles.aiPickContent}>
                      <Skeleton width={100} height={140} borderRadius={8} />
                      <View style={styles.aiPickInfo}>
                        <Skeleton width={150} height={12} />
                        <Skeleton width={120} height={18} style={{ marginTop: 8 }} />
                        <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
                        <Skeleton width="100%" height={14} style={{ marginTop: 4 }} />
                        <Skeleton
                          width={130}
                          height={36}
                          borderRadius={8}
                          style={{ marginTop: 12 }}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <>
                {aiPicks.map((book, index) => (
                  <View key={book._id} style={styles.aiPickCard}>
                    <View style={styles.aiPickContent}>
                      <Image source={{ uri: book.image }} style={styles.aiPickCover} />
                      <View style={styles.aiPickInfo}>
                        <Text
                          style={[
                            styles.aiPickBadge,
                            index === 1 && styles.aiPickBadgeOrange,
                          ]}
                        >
                          {index === 0
                            ? 'BECAUSE YOU LIKED ' +
                              (book.genre || 'FICTION').toUpperCase()
                            : 'TRENDING IN ' +
                              (book.genre || 'THRILLER').toUpperCase()}
                        </Text>
                        <Text style={styles.aiPickTitle} numberOfLines={1}>
                          {book.title}
                        </Text>
                        <Text style={styles.aiPickDescription} numberOfLines={2}>
                          {book.description ||
                            'A masterpiece that matches your reading preferences...'}
                        </Text>
                        <TouchableOpacity
                          style={styles.startReadingButton}
                          onPress={() => openBook(book._id)}
                        >
                          <Text style={styles.startReadingText}>
                            Start Reading
                          </Text>
                          <Feather
                            name="arrow-right"
                            size={16}
                            color={colors.white}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Trending Now */}
        {(loadingSections.trending || trending.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.trendingHeader}>
                <Text style={styles.sectionTitle}>Trending Now</Text>
                <View style={styles.hotBadge}>
                  <Feather name="trending-up" size={12} color="#ff4444" />
                  <Text style={styles.hotText}>HOT</Text>
                </View>
              </View>
            </View>

            {loadingSections.trending ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.trendingCard}>
                    <Skeleton
                      width={32}
                      height={32}
                      borderRadius={16}
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 1,
                      }}
                    />
                    <Skeleton width={140} height={200} borderRadius={8} />
                    <Skeleton width={140} height={14} style={{ marginTop: 8 }} />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {trending.slice(0, 3).map((book, index) => (
                  <TouchableOpacity
                    key={book._id}
                    style={styles.trendingCard}
                    onPress={() => openBook(book._id)}
                  >
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <Image source={{ uri: book.image }} style={styles.trendingCover} />
                    <Text style={styles.trendingTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Community Uploads */}
        // BULLETPROOF VERSION - Handles all missing/null/undefined data
// Replace your community uploads section with this:

{/* Community Uploads - Safe Version */}
{(loadingSections.community || community.length > 0) && (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Community Uploads</Text>
      <TouchableOpacity onPress={() => router.push('/library')}>
        <Text style={styles.seeAllButton}>See all</Text>
      </TouchableOpacity>
    </View>

    {loadingSections.community ? (
      <View style={styles.communityGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={styles.communityCard}>
            <Skeleton width="100%" height={200} borderRadius={12} />
            <View style={styles.communityCardContent}>
              <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
              <Skeleton width="70%" height={12} style={{ marginTop: 4 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Skeleton width={60} height={20} borderRadius={4} />
                <Skeleton width={40} height={20} borderRadius={4} />
              </View>
            </View>
          </View>
        ))}
      </View>
    ) : (
      <View style={styles.communityGrid}>
        {community.map((book) => {
          // Safe data extraction with fallbacks
          const bookImage = book.image || 'https://via.placeholder.com/200x280?text=No+Image'
          const bookTitle = book.title || 'Untitled'
          const bookAuthor = book.author || 'Unknown Author'
          const bookRating = book.rating || 0
          const bookGenre = book.genre || (book.genres && book.genres[0]) || 'Fiction'
          const bookPages = book.pages || book.totalPages || 0
          
          // Safe price handling
          let displayPrice = ''
          if (book.price != null && book.price !== '') {
            if (typeof book.price === 'string') {
              const parsed = parseFloat(book.price)
              displayPrice = isNaN(parsed) ? '' : parsed.toFixed(2)
            } else if (typeof book.price === 'number') {
              displayPrice = book.price.toFixed(2)
            }
          }
          
          // Safe user data
          const userAvatar = book.user?.profileImage || book.user?.profileImage || 'https://via.placeholder.com/16'
          const username = book.user?.username || book.user?.username || 'Anonymous'

          return (
            <TouchableOpacity
              key={book._id}
              style={styles.communityCard}
              onPress={() => openBook(book._id)}
              activeOpacity={0.9}
            >
              {/* Book Cover with Overlay */}
              <View style={styles.communityImageContainer}>
                <Image
                  source={{ uri: bookImage }}
                  style={styles.communityImage}
                />
                
                {/* Gradient Overlay */}
                <View style={styles.communityImageOverlay} />
                
                {/* User Badge - Top Left */}
                <View style={styles.communityUserBadge}>
                  <Image
                    source={{ uri: userAvatar }}
                    style={styles.communityUserAvatar}
                  />
                  <Text style={styles.communityUserName} numberOfLines={1}>
                    {username}
                  </Text>
                </View>
                
                {/* Rating Badge - Top Right */}
                {bookRating > 0 && (
                  <View style={styles.communityRatingBadge}>
                    <Feather name="star" size={10} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.communityRatingText}>
                      {bookRating.toFixed(1)}
                    </Text>
                  </View>
                )}
                
                {/* Genre Tag - Bottom Left */}
                {bookGenre && (
                  <View style={styles.communityGenreTag}>
                    <Text style={styles.communityGenreText}>
                      {bookGenre}
                    </Text>
                  </View>
                )}
              </View>

              {/* Book Info */}
              <View style={styles.communityCardContent}>
                <Text style={styles.communityTitle} numberOfLines={2}>
                  {bookTitle}
                </Text>
                
                <Text style={styles.communityAuthor} numberOfLines={1}>
                  {bookAuthor}
                </Text>
                
                {/* Footer with Pages and Price */}
                <View style={styles.communityCardFooter}>
                  {bookPages > 0 && (
                    <View style={styles.communityPagesContainer}>
                      <Feather name="book-open" size={12} color={colors.textSecondary} />
                      <Text style={styles.communityPages}>
                        {bookPages} pg
                      </Text>
                    </View>
                  )}
                  
                  {displayPrice && (
                    <View style={styles.communityPriceContainer}>
                      <Text style={styles.communityPrice}>
                        ${displayPrice}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    )}
  </View>
)}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

export default HomeScreen