// import { View, Text, TouchableOpacity, FlatList } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { useAuthStore } from '@/store/authStore'
// import homeStyles from '@/constants/home.styles'
// import { useAppContext } from '@/context/useAppContext'
// import { Image } from 'expo-image'
// import { EXPO_PUBLIC_API_URL } from '../../store/api'

// const Index = () => {
//   const { token, logout } = useAuthStore()
//   const [ books, setBooks ] = useState([])
//   const [ isLoading, setIsLoading ] = useState(true);
//   const [ refreshing, setRefreshing ] = useState(false);
//   const [ page, setPage ] = useState(1);
//   const [ hasMore, setHasMore ] = useState(true)

//   const fetchBooks = async (pageNum = 1, refresh: boolean = false) => {
//     try {
//       if (refresh) setRefreshing(true)
//       else if (pageNum === 1) setIsLoading(true)

//       const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/v1/books?page=${pageNum}&limit=5`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       if (!response.ok) {
//         throw new Error("An error occured when getting the books")
//       }

//       const data = await response.json()

//       // @ts-ignore
//       setBooks((prevBooks) => [...prevBooks, data.books])

//       setHasMore(pageNum < data.totalPages)

//       setPage(pageNum)
//     } catch (error) {
//       console.error("Error fetching books", error)
//     } finally {
//       if (refresh) setRefreshing(false)
//         else setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchBooks()
//   }, [])

//   const renderItem = ({ item }: { item: any }) => (
//     <View style={styles.bookCard}>
//       <View style={styles.bookHeader}>
//         <View style={styles.userInfo}>
//           <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
//           <Text style={styles.username}>{item.user.username}</Text>
//         </View>
//       </View>

//       <View style={styles.bookImageContainer}>
//         <Image source={{ uri: item.image }} style={styles.bookImage} contentFit='contain'/>
//       </View>
//     </View>
//   )

//   const handleLoadMore = async () => {}

//   const { colors } = useAppContext()
//   const styles = homeStyles(colors)

//   return (
//     <View style={styles.container }>
//       <FlatList
//         data={books}
//         renderItem={renderItem}
//         keyExtractor={(item) => item._id}
//         contentContainerStyle={styles.listContainer}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   )
// }

// export default Index

import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import homeStyles from '@/constants/home.styles'
import { useAppContext } from '@/context/useAppContext'
import { Image } from 'expo-image'
import { EXPO_PUBLIC_API_URL } from '../../store/api'
import { Ionicons } from '@expo/vector-icons'

const Index = () => {
  console.log("📍 Index screen function executing")

  const { token, logout } = useAuthStore()
  const { colors } = useAppContext()
  const styles = homeStyles(colors)

  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  /* ================= TOKEN DEBUG ================= */
  useEffect(() => {
    console.log("🔐 Auth token state changed:", token ? "TOKEN EXISTS" : "TOKEN MISSING")
  }, [token])

  /* ================= FETCH FUNCTION ================= */
  const fetchBooks = async (pageNum = 1, refresh: boolean = false) => {
    console.log("\n📚 fetchBooks CALLED")
    console.log("➡️ pageNum:", pageNum, "| refresh:", refresh)

    try {
      if (refresh) {
        console.log("🔄 Pull-to-refresh triggered")
        setRefreshing(true)
      } else if (pageNum === 1) {
        console.log("⏳ Initial loading triggered")
        setIsLoading(true)
      }

      const url = `${EXPO_PUBLIC_API_URL}/api/v1/books?page=${pageNum}&limit=5`
      console.log("🌍 Fetch URL:", url)
      console.log("🪪 Sending token?", token ? "YES" : "NO")

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      console.log("📥 Response received. Status:", response.status)

      const rawText = await response.text()
      console.log("📦 Raw response body:", rawText)

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = JSON.parse(rawText)
      console.log("✅ Parsed JSON:", data)
      console.log("📘 Books returned from API:", data.books?.length)

      setBooks(prevBooks => {
        const updatedBooks = pageNum === 1 ? data.books : [...prevBooks, ...data.books]
        console.log("🧠 Updating bookas state. New length:", updatedBooks.length)
        return updatedBooks
      })

      console.log("📄 totalPages from server:", data.totalPages)
      console.log("📌 Setting hasMore:", pageNum < data.totalPages)

      setHasMore(pageNum < data.totalPages)
      setPage(pageNum)

    } catch (error) {
      console.error("❌ Error inside fetchBooks:", error)
    } finally {
      console.log("🏁 fetchBooks finished")

      if (refresh) {
        console.log("🔄 Refreshing ended")
        setRefreshing(false)
      } else {
        console.log("⏳ Loading ended")
        setIsLoading(false)
      }
    }
  }

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    console.log("🏠 Screen mounted — calling initial fetch")
    fetchBooks()
  }, [])

  /* ================= BOOKS STATE WATCH ================= */
  useEffect(() => {
    console.log("📚 Books state changed. Count:", books.length)
  }, [books])

  /* ================= PAGINATION ================= */
  const handleLoadMore = async () => {
    console.log("⬇️ handleLoadMore triggered")
    console.log("📄 Current page:", page, "| hasMore:", hasMore, "| isLoading:", isLoading)

    if (!hasMore) {
      console.log("🚫 No more pages to load")
      return
    }

    if (isLoading) {
      console.log("⏳ Already loading, skipping...")
      return
    }

    const nextPage = page + 1
    console.log("➡️ Loading next page:", nextPage)
    fetchBooks(nextPage)
  }

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }: { item: any }) => {
    console.log("🖼 Rendering book item:", item?._id)

    return (
      <View style={styles.bookCard}>
        <View style={styles.bookHeader}>
          <View style={styles.userInfo}>
            <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
            <Text style={styles.username}>{item.user.username}</Text>
          </View>
        </View>

        <View style={styles.bookImageContainer}>
          <Image source={{ uri: item.image }} style={styles.bookImage} contentFit='cover' />
        </View>
      </View>
    )
  }

  /* ================= LIST EMPTY DEBUG ================= */
  const ListEmpty = () => {
    console.log("📭 FlatList empty state rendered")
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>No books found.</Text>
  }

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < rating ? 'star' : "star-outline"}
          size={16}
          color={i < rating ? "#F4B400" : colors.textSecondary}
        />
      )
    }
  }

  return (
    <View style={styles.container}>

      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => {
          console.log("🔑 Extracting key for:", item?._id)
          return item._id
        }}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={() => {
          console.log("🔄 Pull-to-refresh gesture detected")
          fetchBooks(1, true)
        }}
        ListEmptyComponent={ListEmpty}
      />
    </View>
  )
}

export default Index
