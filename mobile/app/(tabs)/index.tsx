import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import homeStyles from '@/constants/home.styles'
import { useAppContext } from '@/context/useAppContext'
import { Image } from 'expo-image'

const Index = () => {
  const { token, logout } = useAuthStore()
  const [ books, setBooks ] = useState([])
  const [ isLoading, setIsLoading ] = useState(true);
  const [ refreshing, setRefreshing ] = useState(false);
  const [ page, setPage ] = useState(1);
  const [ hasMore, setHasMore ] = useState(true)

  const fetchBooks = async (pageNum=1, refresh: boolean) => {
    try {
      if (refresh) setRefreshing(true)
      else if (pageNum === 1) setIsLoading(true)

      const response = await fetch(`${process.env.API_URL}/api/v1/books?page=${pageNum}&limit=5`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("An error occured")
      }

      const data = response.json()
    } catch (error) {
      console.error("Someting", error)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>

      <View style={styles.bookImageContainer}>
        <Image source={{ uri: item.image }} style={styles.bookImage} contentFit='contain'/>
      </View>
    </View>
  )

  const handleLoadMore = async () => {}

  const { colors } = useAppContext()
  const styles = homeStyles(colors)

  return (
    <View style={styles.container }>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default Index