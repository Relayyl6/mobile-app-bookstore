// import { View, Text, FlatList } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { useAuthStore } from '@/store/authStore'
// import homeStyles from '@/constants/home.styles'
// import { useAppContext } from '@/context/useAppContext'
// import { Image } from 'expo-image'
// import { EXPO_PUBLIC_API_URL } from '../../store/api'
// import { Ionicons } from '@expo/vector-icons'

// const Index = () => {
//   console.log("📍 Index screen function executing")

//   const { token, logout } = useAuthStore()
//   const { colors } = useAppContext()
//   const styles = homeStyles(colors)

//   const [books, setBooks] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [refreshing, setRefreshing] = useState(false)
//   const [page, setPage] = useState(1)
//   const [hasMore, setHasMore] = useState(true)

//   /* ================= TOKEN DEBUG ================= */
//   useEffect(() => {
//     console.log("🔐 Auth token state changed:", token ? "TOKEN EXISTS" : "TOKEN MISSING")
//   }, [token])

//   /* ================= FETCH FUNCTION ================= */
//   const fetchBooks = async (pageNum = 1, refresh: boolean = false) => {
//     console.log("\n📚 fetchBooks CALLED")
//     console.log("➡️ pageNum:", pageNum, "| refresh:", refresh)

//     try {
//       if (refresh) {
//         console.log("🔄 Pull-to-refresh triggered")
//         setRefreshing(true)
//       } else if (pageNum === 1) {
//         console.log("⏳ Initial loading triggered")
//         setIsLoading(true)
//       }

//       const url = `${EXPO_PUBLIC_API_URL}/api/v1/books?page=${pageNum}&limit=5`
//       console.log("🌍 Fetch URL:", url)
//       console.log("🪪 Sending token?", token ? "YES" : "NO")

//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//       })

//       console.log("📥 Response received. Status:", response.status)

//       const rawText = await response.text()
//       console.log("📦 Raw response body:", rawText)

//       if (!response.ok) {
//         throw new Error(`Server responded with ${response.status}`)
//       }

//       const data = JSON.parse(rawText)
//       console.log("✅ Parsed JSON:", data)
//       console.log("📘 Books returned from API:", data.books?.length)

//       setBooks(prevBooks => {
//         const updatedBooks = pageNum === 1 ? data.books : [...prevBooks, ...data.books]
//         console.log("🧠 Updating bookas state. New length:", updatedBooks.length)
//         return updatedBooks
//       })

//       console.log("📄 totalPages from server:", data.totalPages)
//       console.log("📌 Setting hasMore:", pageNum < data.totalPages)

//       setHasMore(pageNum < data.totalPages)
//       setPage(pageNum)

//     } catch (error) {
//       console.error("❌ Error inside fetchBooks:", error)
//     } finally {
//       console.log("🏁 fetchBooks finished")

//       if (refresh) {
//         console.log("🔄 Refreshing ended")
//         setRefreshing(false)
//       } else {
//         console.log("⏳ Loading ended")
//         setIsLoading(false)
//       }
//     }
//   }

//   /* ================= INITIAL LOAD ================= */
//   useEffect(() => {
//     console.log("🏠 Screen mounted — calling initial fetch")
//     fetchBooks()
//   }, [])

//   /* ================= BOOKS STATE WATCH ================= */
//   useEffect(() => {
//     console.log("📚 Books state changed. Count:", books.length)
//   }, [books])

//   /* ================= PAGINATION ================= */
//   const handleLoadMore = async () => {
//     console.log("⬇️ handleLoadMore triggered")
//     console.log("📄 Current page:", page, "| hasMore:", hasMore, "| isLoading:", isLoading)

//     if (!hasMore) {
//       console.log("🚫 No more pages to load")
//       return
//     }

//     if (isLoading) {
//       console.log("⏳ Already loading, skipping...")
//       return
//     }

//     const nextPage = page + 1
//     console.log("➡️ Loading next page:", nextPage)
//     fetchBooks(nextPage)
//   }

//   /* ================= RENDER ITEM ================= */
//   const renderItem = ({ item }: { item: any }) => {
//     console.log("🖼 Rendering book item:", item?._id)

//     return (
//       <View style={styles.bookCard}>
//         <View style={styles.bookHeader}>
//           <View style={styles.userInfo}>
//             <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
//             <Text style={styles.username}>{item.user.username}</Text>
//           </View>
//         </View>

//         <View style={styles.bookImageContainer}>
//           <Image source={{ uri: item.image }} style={styles.bookImage} contentFit='cover' />
//         </View>

//         <View style={styles.bookDetails}>

//         </View>
//       </View>
//     )
//   }

//   /* ================= LIST EMPTY DEBUG ================= */
//   const ListEmpty = () => {
//     console.log("📭 FlatList empty state rendered")
//     return <Text style={{ textAlign: 'center', marginTop: 20 }}>No books found.</Text>
//   }

//   const renderRatingStars = (rating: number) => {
//     const stars = [];
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <Ionicons
//           key={i}
//           name={i < rating ? 'star' : "star-outline"}
//           size={16}
//           color={i < rating ? "#F4B400" : colors.textSecondary}
//           style={{ marginRight: 2 }}
//         />
//       )
//     }
//   }

//   return (
//     <View style={styles.container}>

//       <FlatList
//         data={books}
//         renderItem={renderItem}
//         keyExtractor={(item) => {
//           return item._id
//         }}
//         contentContainerStyle={styles.listContainer}
//         showsVerticalScrollIndicator={false}
//         onEndReached={handleLoadMore}
//         onEndReachedThreshold={0.5}
//         refreshing={refreshing}
//         onRefresh={() => {
//           console.log("🔄 Pull-to-refresh gesture detected")
//           fetchBooks(1, true)
//         }}
//         ListEmptyComponent={ListEmpty}
//       />
//     </View>
//   )
// }

// export default Index


// homeColors
// profileColors
// libraryColors
// greenTheme
// purpleTheme
// sunsetTheme
// grayTheme
// cyberpunkTheme

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  TextInput,
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/context/useAppContext';
import homePageStyle from '@/constants/homepage.styles';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const HomeScreen = () => {
  const { colors } = useAppContext()
  const styles = homePageStyle(colors) 
  const router = useRouter()
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>Leonard</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Feather name="bell" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="star" size={20} color={colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ask AI about your next book..."
            placeholderTextColor={colors.placeholderText}
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
      >
        {/* Continue Reading */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Reading</Text>
            <TouchableOpacity onPress={() => router.push('/books')}>
              <Text style={styles.seeAllButton}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            <TouchableOpacity style={styles.bookCard} onPress={() => router.push('/details?bookId=24')}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?w=400' }}
                style={styles.bookCover}
              />
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
              <Text style={styles.progressText}>75% complete</Text>
              <Text style={styles.bookTitle}>Project Hail Mary</Text>
              <Text style={styles.bookAuthor}>Andy Weir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bookCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?w=400' }}
                style={styles.bookCover}
              />
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '50%' }]} />
              </View>
              <Text style={styles.progressText}>30% complete</Text>
              <Text style={styles.bookTitle}>The Midnight Library</Text>
              <Text style={styles.bookAuthor}>Matt Haig</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* AI Picks for You */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithIcon}>
            <MaterialCommunityIcons name="robot" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>AI Picks for You</Text>
          </View>

          <View style={styles.aiPickCard}>
            <View style={styles.aiPickContent}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200' }}
                style={styles.aiPickCover}
              />
              <View style={styles.aiPickInfo}>
                <Text style={styles.aiPickBadge}>BECAUSE YOU LIKED SCI-FI</Text>
                <Text style={styles.aiPickTitle}>Foundation</Text>
                <Text style={styles.aiPickDescription}>
                  "A masterpiece of galactic empires and psychohistory that matches...
                </Text>
                <TouchableOpacity style={styles.startReadingButton}>
                  <Text style={styles.startReadingText}>Start Reading</Text>
                  <Feather name="arrow-right" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.aiPickCard}>
            <View style={styles.aiPickContent}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200' }}
                style={styles.aiPickCover}
              />
              <View style={styles.aiPickInfo}>
                <Text style={[styles.aiPickBadge, styles.aiPickBadgeOrange]}>
                  TRENDING IN THRILLER
                </Text>
                <Text style={styles.aiPickTitle}>Dark Matter</Text>
                <Text style={styles.aiPickDescription}>
                  "Blake Crouch's reality-bending thriller is perfect for fans of your...
                </Text>
                <TouchableOpacity style={styles.startReadingButton}>
                  <Text style={styles.startReadingText}>Start Reading</Text>
                  <Feather name="arrow-right" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Trending Now */}
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            <TouchableOpacity style={styles.trendingCard} onPress={() => router.push(`/details?bookId=${24}`)}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#1</Text>
              </View>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300' }}
                style={styles.trendingCover}
              />
              <Text style={styles.trendingTitle}>The Great Gatsby</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trendingCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#2</Text>
              </View>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300' }}
                style={styles.trendingCover}
              />
              <Text style={styles.trendingTitle}>Circe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trendingCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#3</Text>
              </View>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=300' }}
                style={styles.trendingCover}
              />
              <Text style={styles.trendingTitle}>Klara and the Sun</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>      
    </View>
  );
};



export default HomeScreen;