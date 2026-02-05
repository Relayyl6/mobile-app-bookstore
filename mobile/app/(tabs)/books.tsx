import { View, Text } from 'react-native'
import React from 'react'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

const Profile = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ThemeSwitcher/>
    </View>
  )
}

export default Profile