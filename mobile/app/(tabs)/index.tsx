import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

const Index = () => {
  const { token, logout } = useAuthStore()
  const [ books, setBooks ] = useState([])
  const [ isLoading, setIsLoading ] = useState(true);
  const [ refreshing, setRefreshing ] = useState(false);
  const [ page, setPage ] = useState(1);
  const [ hasMore, setHasMore ] = useState(true)
  return (
    <View>
      <TouchableOpacity onPress={logout}>
        <Text>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default Index