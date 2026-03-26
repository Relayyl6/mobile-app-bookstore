import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  RefreshControl,
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
import { GENRES } from '@/constants/data'
import { LibrarySectionSkeleton, NewReleasesSkeleton, LibraryBookGridSkeleton } from '@/components/SkeletonLoaders'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 60) / 2

const LibraryScreen = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [myBooks, setMyBooks] = useState<BookForReading[]>([])
  const [recommendedBooks, setRecommendedBooks] = useState<DisplayBook[]>([])
  const [popularBooks, setPopularBooks] = useState<DisplayBook[]>([])
  const [newBooks, setNewBooks] = useState<DisplayBook[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState<string>('All')

  const [loadingSections, setLoadingSections] = useState({
    recommended: true,
    popular: true,
    newBooks: true,
    myBooks: true,
  })

  const { colors } = useAppContext()
  const styles = libraryStyles(colors)
  const router = useRouter()

  const normalizeDisplayBook = (b: any): DisplayBook => ({
    _id: b._id || b.id,
    title: b.title,
    author: b.author,
    genres: b.genres || [],
    averageRating: b.averageRating || 0,
    image: b.image,
    coverImage: b.coverImage,
    totalPages: b.totalPages || 0,
  })

  const loadLibrary = async (page = 1) => {
    try {
      const myBooksResponse = await api.getReadingLibrary(page)
      const books = myBooksResponse.data?.books ?? []

      if (myBooksResponse.success) {
        setMyBooks((prev) => (page === 1 ? books : [...prev, ...books]))
        const totalBooks = myBooksResponse.data?.totalBooks || 0
        const limit = 15
        setHasMore(page * limit < totalBooks)
      }

      setLoadingSections((prev) => ({ ...prev, myBooks: false }))

      if (page !== 1) return

      const [recResponse, popularResponse, newResponse] = await Promise.all([
        api.getPersonalizedRecommendations(6),
        api.getPopularBooks(6),
        api.getNewBooks(6),
      ])

      if (recResponse.success && recResponse.data?.recommendations) {
        setRecommendedBooks(recResponse.data.recommendations.map(normalizeDisplayBook))
      }

      if (popularResponse.success && popularResponse.data?.popularBooks) {
        setPopularBooks(popularResponse.data.popularBooks.map(normalizeDisplayBook))
      }

      if (newResponse.success && newResponse.data?.newBooks) {
        setNewBooks(newResponse.data.newBooks.map(normalizeDisplayBook))
      }

      setLoadingSections({ recommended: false, popular: false, newBooks: false, myBooks: false })
    } catch (error) {
      console.error('Error loading library:', error)
      setLoadingSections({ recommended: false, popular: false, newBooks: false, myBooks: false })
    } finally {
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    loadLibrary(1)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setCurrentPage(1)
    setSearchQuery('')
    setSelectedGenre('All')
    setLoadingSections({ recommended: true, popular: true, newBooks: true, myBooks: true })
    await loadLibrary(1)
    setIsRefreshing(false)
  }

  const loadMoreBooks = () => {
    if (!hasMore || isLoadingMore || loadingSections.myBooks || searchQuery.trim()) return
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    setIsLoadingMore(true)
    loadLibrary(nextPage)
  }

  const filteredMyBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return myBooks.filter((book) => {
      const matchesSearch = !q || [book.title, book.author, ...(book.genres || [])].join(' ').toLowerCase().includes(q)
      const matchesGenre = selectedGenre === 'All' || (book.genres || []).includes(selectedGenre)
      return matchesSearch && matchesGenre
    })
  }, [myBooks, searchQuery, selectedGenre])

  const genreOptions = useMemo(() => {
    const used = new Set(myBooks.flatMap((book) => book.genres || []))
    return ['All', ...GENRES.filter((genre) => used.has(genre)).slice(0, 8)]
  }, [myBooks])

  const renderBookCard = (book: DisplayBook | BookForReading, size: 'big' | 'small' = 'big') => {
    const id = (book as any)._id || (book as any).bookId

    return (
      <TouchableOpacity
        key={id}
        style={{ marginBottom: 20, width: size === 'big' ? CARD_WIDTH : undefined }}
        onPress={() => router.push(`/details?bookId=${id}`)}
        activeOpacity={0.85}
      >
        {size === 'big' ? (
          <BigCard
            toptext="AI Summary"
            title={(book as any).title}
            author={(book as any).author || 'Unknown Author'}
            rating={(book as any).averageRating || 0}
            genre={(book as any).genres?.[0] || 'Fiction'}
          />
        ) : (
          <SmallCard
            title={(book as any).title}
            author={(book as any).author || 'Unknown'}
            toptext="AI Summary"
            pageCount={(book as any).totalPages || 0}
            rating={(book as any).averageRating || 0}
          />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="book-open-variant" size={28} color={colors.primary} />
          <Text style={styles.headerTitle}>Library</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="sliders" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search title, author, or genre"
            placeholderTextColor={colors.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        horizontal
        data={genreOptions}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedGenre(item)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedGenre === item ? colors.primary : colors.inputBackground,
            }}
          >
            <Text style={{ color: selectedGenre === item ? colors.white : colors.textPrimary, fontWeight: '600' }}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.viewToggleContainer}>
        <View style={styles.viewToggle}>
          <TouchableOpacity style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]} onPress={() => setViewMode('grid')}>
            <Feather name="grid" size={18} color={viewMode === 'grid' ? colors.white : colors.textSecondary} />
            <Text style={[styles.toggleText, viewMode === 'grid' && styles.toggleTextActive]}>Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]} onPress={() => setViewMode('list')}>
            <Feather name="list" size={18} color={viewMode === 'list' ? colors.white : colors.textSecondary} />
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredMyBooks}
        keyExtractor={(item) => item.bookId}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between', paddingHorizontal: 20 } : undefined}
        ListHeaderComponent={
          <>
            {(loadingSections.recommended || recommendedBooks.length > 0) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="star" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Recommended for You</Text>
                </View>
                {loadingSections.recommended ? (
                  <LibrarySectionSkeleton title="Recommended for You" />
                ) : (
                  <View style={styles.recommendedGrid}>{recommendedBooks.map((book) => renderBookCard(book, 'big'))}</View>
                )}
              </View>
            )}

            {(loadingSections.popular || popularBooks.length > 0) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="fire" size={22} color="#FF4444" />
                  <Text style={styles.sectionTitle}>Popular Books</Text>
                </View>
                {loadingSections.popular ? (
                  <LibrarySectionSkeleton title="Popular Books" />
                ) : (
                  <View style={styles.recommendedGrid}>{popularBooks.map((book) => renderBookCard(book, 'big'))}</View>
                )}
              </View>
            )}

            {(loadingSections.newBooks || newBooks.length > 0) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="new-box" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>New Releases</Text>
                </View>
                {loadingSections.newBooks ? (
                  <NewReleasesSkeleton />
                ) : (
                  newBooks.map((book) => (
                    <TouchableOpacity key={book._id} style={styles.listItem} onPress={() => router.push(`/details?bookId=${book._id}`)}>
                      <Image source={{ uri: book.image }} style={styles.listCover} />
                      <View style={styles.listInfo}>
                        <Text style={styles.listTitle} numberOfLines={1}>{book.title}</Text>
                        <Text style={styles.listAuthor} numberOfLines={1}>{book.author || 'Unknown'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {loadingSections.myBooks && (
              <View style={styles.section}>
                <LibraryBookGridSkeleton />
              </View>
            )}

            {filteredMyBooks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitlePlain}>My Books ({filteredMyBooks.length})</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) =>
          viewMode === 'grid' ? (
            renderBookCard(item, 'big')
          ) : (
            <View style={styles.listItem}>
              <TouchableOpacity onPress={() => router.push(`/details?bookId=${item.bookId}`)} style={{ flexDirection: 'row', flex: 1 }}>
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
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !loadingSections.myBooks ? (
            <View style={styles.emptyContainer}>
              <Feather name="book" size={64} color={colors.placeholderText} />
              <Text style={styles.emptyTitle}>No Books in Your Library</Text>
              <Text style={styles.emptyText}>Upload your first book to get started</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/create')}>
                <Text style={styles.emptyButtonText}>Upload Your First Book</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListFooterComponent={isLoadingMore ? <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 16 }}>Loading more...</Text> : <View style={{ height: 40 }} />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <TouchableOpacity style={styles.floatingButton} onPress={() => router.push('/chat')}>
        <MaterialCommunityIcons name="robot" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  )
}

export default LibraryScreen
