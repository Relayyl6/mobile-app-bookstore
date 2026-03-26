import React, { useMemo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

type BookCoverProps = {
  title: string
  author?: string
  coverUrl?: string | null
  width?: number
  height?: number
}

const COVER_PALETTES: [string, string][] = [
  ['#0B3A3A', '#2D5B4F'],
  ['#4A2A6A', '#1B4D89'],
  ['#7A4B1D', '#B67D3A'],
  ['#213A74', '#3E7CB1'],
  ['#3E4C35', '#7D9D63'],
]

const getPalette = (title: string): [string, string] => {
  let hash = 0
  for (let i = 0; i < title.length; i += 1) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }

  return COVER_PALETTES[Math.abs(hash) % COVER_PALETTES.length]
}

export const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  coverUrl,
  width = 94,
  height = 132,
}) => {
  const initials = useMemo(
    () =>
      title
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [title]
  )

  if (coverUrl) {
    return (
      <Image
        source={{ uri: coverUrl }}
        style={[styles.image, { width, height }]}
        resizeMode="cover"
      />
    )
  }

  const [topColor, bottomColor] = getPalette(title)

  return (
    <View style={[styles.container, { width, height, backgroundColor: topColor }]}> 
      <View style={[styles.bottomLayer, { backgroundColor: bottomColor }]} />
      <Text style={styles.initials}>{initials || 'BK'}</Text>
      <Text numberOfLines={3} style={styles.titleText}>{title}</Text>
      {author ? <Text numberOfLines={1} style={styles.authorText}>{author}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bottomLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '38%',
    opacity: 0.65,
  },
  initials: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    zIndex: 1,
  },
  titleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    zIndex: 1,
  },
  authorText: {
    color: '#E7F0EC',
    fontSize: 9,
    zIndex: 1,
  },
  image: {
    borderRadius: 14,
  },
})
