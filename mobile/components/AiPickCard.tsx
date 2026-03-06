import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useAppContext } from '@/context/useAppContext'
import homePageStyle from '@/constants/homepage.styles'
import { Image } from 'expo-image'
import { Feather } from '@expo/vector-icons'

const AiPickCard = ({
    uri,
    interest,
    title,
    description,
    cta
}: {
    uri: string,
    interest: string,
    title: string,
    description: string,
    cta: string
}) => {
    const { colors } = useAppContext()
    const styles = homePageStyle(colors)
  return (
    <View style={styles.aiPickCard}>
      <View style={styles.aiPickContent}>
        <Image
          source={{ uri: uri }}
          style={styles.aiPickCover}
        />
        <View style={styles.aiPickInfo}>
          <Text style={[styles.aiPickBadge, styles.aiPickBadgeOrange]}>{interest}</Text>
          <Text style={styles.aiPickTitle}>{title}</Text>
          <Text 
            style={styles.aiPickDescription}
            numberOfLines={2}
            ellipsizeMode="tail">
            {description}
          </Text>
          <TouchableOpacity style={styles.startReadingButton}>
            <Text style={styles.startReadingText}>{cta}</Text>
            <Feather name="arrow-right" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default AiPickCard