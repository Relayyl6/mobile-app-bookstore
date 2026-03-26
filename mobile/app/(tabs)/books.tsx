import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useAppContext } from '@/context/useAppContext'
import libraryStyles from '@/constants/library.style'
import BigCard from '@/components/BigCard'
import SmallCard from '@/components/SmallCard'
import { api } from '@/components/ApiHandler'
import { useRouter } from 'expo-router'
// import Skeleton from '@/components/SkeletonLoaders'
import Skeleton, { LibraryHeaderSkeleton, NewReleasesSkeleton, LibrarySectionSkeleton, LibraryBookGridSkeleton } from '@/components/SkeletonLoaders'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 60) / 2

interface ReadingLibraryData {
  books: SingleBook[]
  total?: number
  limit?: number
}

const LibraryScreen = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [myBooks, setMyBooks] = useState<BookForReading[]>([])
  const [recommendedBooks, setRecommendedBooks] = useState<DisplayBook[]>([])
  const [popularBooks, setPopularBooks] = useState<DisplayBook[]>([])
  const [newBooks, setNewBooks] = useState<DisplayBook[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const [loadingSections, setLoadingSections] = useState({
    recommended: true,
    popular: true,
    newBooks: true,
    myBooks: true,
  })

  const { colors, bookId } = useAppContext()
  const styles = libraryStyles(colors)
  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // -------------------------
  // Load library pages
  // -------------------------
  const loadLibrary = async (page = 1, isRefresh = false) => {
    try {
      // Fetch user's reading library
      const myBooksResponse = await api.getReadingLibrary<ReadingLibraryResponse>(page)
      const books = myBooksResponse.data?.books ?? []

      if (myBooksResponse.success) {
        if (page === 1) {
          setMyBooks(books)
        } else {
          setMyBooks((prev) => [...prev, ...books])
        }

        const totalBooks = myBooksResponse.data?.totalBooks || 0
        const limit = 15  // backend hardcodes this
        setHasMore(page * limit < totalBooks)
      }
      setLoadingSections((prev) => ({ ...prev, myBooks: false }))

      // Fetch other sections only on page 1
      if (page === 1) {
        // Recommended
        const recResponse = await api.getPersonalizedRecommendations(6)
        if (recResponse.success && recResponse.data?.recommendations) {
          setRecommendedBooks(
            recResponse.data?.recommendations.map((b: any) => ({
              _id: b.id,
              title: b.title,
              author: b.author,
              genres: b.genres,
              averageRating: b.averageRating,
              image: b.image,
            })) || []
          )
        }
        setLoadingSections((prev) => ({ ...prev, recommended: false }))

        // Popular
        const popularResponse = await api.getPopularBooks(6)
        if (popularResponse.success && popularResponse.data?.popularBooks) {
          setPopularBooks(
            popularResponse.data?.popularBooks.map((b: any) => ({
              _id: b._id,
              title: b.title,
              author: b.author,
              genres: b.genres,
              averageRating: b.averageRating,
              image: b.image,
            })) || []
          )
        }
        setLoadingSections((prev) => ({ ...prev, popular: false }))

        // New Books
        const newResponse = await api.getNewBooks(6)
        if (newResponse.success && newResponse.data?.newBooks) {
          setNewBooks(
            newResponse.data.newBooks.map(b => ({
              _id: b._id,
              title: b.title,
              author: b.author,
              genres: b.genres,
              averageRating: b.averageRating || 0,
              image: b.image,
              totalPages: b.totalPages || 0,
            }))
          )
          console.log(newBooks)
        }
        setLoadingSections((prev) => ({ ...prev, newBooks: false }))
      }
    } catch (error) {
      console.error('Error loading library:', error)
      setLoadingSections({
        recommended: false,
        popular: false,
        newBooks: false,
        myBooks: false,
      })
    } finally {
      setIsLoadingMore(false)
    }
  }

  const loadMoreBooks = () => {
    if (hasMore && !isLoadingMore && !searchQuery) {
      setIsLoadingMore(true)
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      loadLibrary(nextPage)
    }
  }

  useEffect(() => {
    loadLibrary()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setCurrentPage(1)
    setSearchQuery('')
    setLoadingSections({
      recommended: true,
      popular: true,
      newBooks: true,
      myBooks: true,
    })
    await loadLibrary(1, true)
    setIsRefreshing(false)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setCurrentPage(1)
      loadLibrary(1)
      return
    }

    try {
      const response = await api.searchBooks(bookId as string, query)
      if (response.success) {
        //@ts-ignore
        setMyBooks(response?.answer || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const renderBookCard = (book: DisplayBook, size: 'big' | 'small' = 'big') => {
    const bookId = book._id
    const cover = book.coverImage || book.image || ''

    return (
      <TouchableOpacity
        key={bookId}
        style={{
          marginBottom: 20,
          width: size === 'big' ? CARD_WIDTH : undefined,
        }}
        onPress={() => router.push(`/details?bookId=${bookId}`)}
        activeOpacity={0.85}
      >
        {size === 'big' ? (
          <BigCard
            toptext="AI Summary"
            title={book.title}
            author={book.author || 'Unknown Author'}
            rating={book.averageRating || 0}
            genre={book.genres?.[0] || 'Fiction'}
          />
        ) : (
          <SmallCard
            title={book.title}
            author={book.author || 'Unknown'}
            toptext="AI Summary"
            pageCount={book.totalPages || 0}
            rating={book.averageRating || 0}
          />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="book-open-variant"
            size={28}
            color={colors.primary}
          />
          <Text style={styles.headerTitle}>Library</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="sliders" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search title, author, or genre"
            placeholderTextColor={colors.placeholderText}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* View toggle */}
      <View style={styles.viewToggleContainer}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'grid' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Feather
              name="grid"
              size={18}
              color={viewMode === 'grid' ? colors.white : colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === 'grid' && styles.toggleTextActive,
              ]}
            >
              Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'list' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('list')}
          >
            <Feather
              name="list"
              size={18}
              color={viewMode === 'list' ? colors.white : colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === 'list' && styles.toggleTextActive,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sections ScrollView */}
      <FlatList
        data={myBooks}
        keyExtractor={(item) => item.title}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        ListHeaderComponent={
          <>
            {/* Personalized Recommendations */}
            {(loadingSections.recommended || recommendedBooks.length > 0) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="star"
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Recommended for You</Text>
                </View>

                {loadingSections.recommended ? (
                  <LibrarySectionSkeleton title="Recommended for You" />  // ← place here, replacing the <View style={styles.recommendedGrid}> skeleton block
                ) : (
                  <View style={styles.recommendedGrid}>
                    {recommendedBooks.map((book) => renderBookCard(book, 'big'))}
                  </View>
                )}
              </View>
            )}

            {/* Popular Books */}
            {(loadingSections.popular || popularBooks.length > 0) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="fire" size={22} color="#FF4444" />
                  <Text style={styles.sectionTitle}>Popular Books</Text>
                </View>

                {loadingSections.popular ? <LibrarySectionSkeleton title="Popular Books" /> : (
                  <View style={styles.recommendedGrid}>
                    {popularBooks.map((book) => renderBookCard(book, 'big'))}
                  </View>
                )}
              </View>
            )}

            {/* New Releases */}
            {(loadingSections.newBooks || newBooks.length > 0) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="new-box"
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>New Releases</Text>
                </View>

                {loadingSections.newBooks ? <NewReleasesSkeleton /> : (
                  <>
                    {newBooks.map((book) => (
                      <TouchableOpacity
                        key={book._id}
                        style={styles.listItem}
                        onPress={() => router.push(`/details?bookId=${book._id}`)}
                      >
                        <Image
                          source={{ uri: book.image }}
                          style={styles.listCover}
                        />
                        <View style={styles.listInfo}>
                          <Text style={styles.listTitle} numberOfLines={1}>
                            {book.title}
                          </Text>
                          <Text style={styles.listAuthor} numberOfLines={1}>
                            {book.author || 'Unknown'}
                          </Text>
                          <View style={styles.listFooter}>
                            <View style={styles.aiSummaryBadgeSmall}>
                              <Text style={styles.aiSummaryTextSmall}>
                                AI Summary
                              </Text>
                            </View>
                            <Text style={styles.listPages}>
                              {book.totalPages || 0} pages
                            </Text>
                            <View style={styles.rating}>
                              <Feather
                                name="star"
                                size={14}
                                color="#ffa500"
                                fill="#ffa500"
                              />
                              <Text style={styles.ratingText}>
                                {book.averageRating?.toFixed(1) || '0.0'}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity style={styles.menuButton}>
                          <Feather
                            name="more-vertical"
                            size={20}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            )}

            {/* My Books Header */}
            {myBooks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitlePlain}>
                  My Books ({myBooks.length})
                </Text>
              </View>
            )}

            {/* Empty State */}
            {!loadingSections.myBooks &&
              myBooks.length === 0 &&
              recommendedBooks.length === 0 &&
              popularBooks.length === 0 &&
              newBooks.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Feather name="book" size={64} color={colors.placeholderText} />
                  <Text style={styles.emptyTitle}>No Books in Your Library</Text>
                  <Text style={styles.emptyText}>
                    Upload your first book to get started
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/create')}
                  >
                    <Text style={styles.emptyButtonText}>
                      Upload Your First Book
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </>
        }
        renderItem={({ item }) =>
          viewMode === 'grid' ? (
            renderBookCard(item, 'big')
          ) : (
            <View style={styles.listItem}>
              <TouchableOpacity
                onPress={() => router.push(`/details?bookId=${item.bookId}`)}
                style={{ flexDirection: 'row', flex: 1 }}
              >
                <Image source={{ uri: item.coverImage }} style={styles.listCover} />
                <SmallCard
                  title={item.title}
                  author={item.author || 'Unknown'}
                  toptext="AI Summary"
                  pageCount={item.totalPages || 0}
                  rating={item.averageRating || 0}
                />
              </TouchableOpacity>
            </View>
          )
        }
        onEndReached={loadMoreBooks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary }}>Loading more...</Text>
            </View>
          ) : (
            <View style={{ height: 40 }} />
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* Floating AI Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/chat')}
      >
        <MaterialCommunityIcons name="robot" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  )
}

export default LibraryScreen