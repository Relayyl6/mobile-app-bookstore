import { View, Text } from 'react-native'
import React from 'react'
import { useAppContext } from '@/context/useAppContext'
import libraryStyles from '../constants/library.style'
import { Image } from 'expo-image'
import { Feather } from '@expo/vector-icons'

const BigCard = ({
    toptext,
    title,
    author,
    rating,
    genre
}: { 
    toptext: string,
    title: string,
    author: string,
    rating: number,
    genre: string
 }) => {
    const { colors } = useAppContext()
    const styles = libraryStyles(colors)
  return (
    <View style={styles.recommendedCard}>
      <View style={styles.recommendedCover}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300' }}
          style={styles.coverImage}
          contentFit='cover'
        />
        <View style={styles.aiSummaryBadge}>
          <Feather name="zap" size={12} color={colors.white} />
          <Text style={styles.aiSummaryText}>{toptext}</Text>
        </View>
      </View>
      <Text
        style={styles.cardTitle}
        numberOfLines={1}
        ellipsizeMode="tail">
          {title}
      </Text>
      <Text
        style={styles.cardAuthor}
        numberOfLines={1}
        ellipsizeMode="tail">{author}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.rating}>
          <Feather name="star" size={14} color="#ffa500" fill="#ffa500" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
        <Text style={styles.genre}>{genre}</Text>
      </View>
    </View>
  )
}

export default BigCard