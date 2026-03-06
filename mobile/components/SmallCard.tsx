import { View, Text } from 'react-native'
import React from 'react'
import { useAppContext } from '@/context/useAppContext'
import libraryStyles from '@/constants/library.style'
import { Feather } from '@expo/vector-icons'

const SmallCard = ({
    title,
    author,
    toptext,
    pageCount, 
    rating
}: {
    title: string,
    author: string,
    toptext: string,
    pageCount: number,
    rating: number
}) => {
    const { colors } = useAppContext()
    const styles = libraryStyles(colors)
  return (
    <View style={styles.listInfo}>
      <Text style={styles.listTitle}>{title}</Text>
      <Text style={styles.listAuthor}>{author}</Text>
      <View style={styles.listFooter}>
        <View style={styles.aiSummaryBadgeSmall}>
          <Text style={styles.aiSummaryTextSmall}>{toptext}</Text>
        </View>
        <Text style={styles.listPages}>{pageCount} pages</Text>
        <View style={styles.rating}>
          <Feather name="star" size={14} color="#ffa500" fill="#ffa500" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
    </View>
  )
}

export default SmallCard