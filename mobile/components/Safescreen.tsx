import { View, StyleSheet } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppContext } from '@/context/useAppContext';

const Safescreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useAppContext()

  return (
    <View style={[
      styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: colors.background
        }
      ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})

export default Safescreen
