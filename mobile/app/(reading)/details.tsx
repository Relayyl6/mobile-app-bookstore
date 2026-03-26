import detailStyles from '@/constants/details.style'
import { useAppContext } from '@/context/useAppContext'
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '@/components/ApiHandler'
import { useRouter, useLocalSearchParams } from 'expo-router'
import BookDetails from '@/components/BookDetails'
import Skeleton, { BookDetailsSkeleton } from '@/components/SkeletonLoaders'

// Wrapper component that fetches data from API
export const BookDetailsExample = () => {
  
}

// Default component
const Details = () => {
  const router = useRouter()
  const { bookId: contextBookId } = useAppContext()
  const params = useLocalSearchParams()
  const bookId = (params.bookId as string) || contextBookId
  
  const [book, setBook] = useState<SingleBook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadBookDetails()
  }, [bookId])

  const loadBookDetails = async () => {
    if (!bookId) {
      Alert.alert('Error', 'No book ID provided')
      router.back()
      return
    }
  
    try {
      setIsLoading(true)
      const response = await api.getBookById(bookId)
    
      if (response.success && response.data) {
        //@ts-ignore
        const rawBook = response.data?.book

        const normalizeDecimal = (value: any) => {
          if (value && typeof value === "object" && value.$numberDecimal) {
            return Number(value.$numberDecimal)
          }
          return value
        }

        const normalizedBook = {
          ...rawBook,
          price: normalizeDecimal(rawBook.price),
          totalPages: normalizeDecimal(rawBook.totalPages),
          totalRatings: normalizeDecimal(rawBook.totalRatings),
          readingProgress: rawBook.readingProgress
            ? {
                ...rawBook.readingProgress,
                progressPercentage: normalizeDecimal(
                  rawBook.readingProgress.progressPercentage
                ),
              }
            : undefined,
        }

        setBook(normalizedBook)

      } else {
        throw new Error(response.error || 'Failed to load book')
      }
    } catch (error: any) {
      console.error('Error loading book details:', error)
      Alert.alert('Error', error.message || 'Failed to load book details')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProgress = async (newProgress: number) => {
    if (!bookId) return
  
    try {
      await api.updateReadingProgress(bookId, { currentChapter: 1, currentPage: 1, progressPercentage: newProgress})
    } catch (error: any) {
      console.error('Error updating progress:', error)
      Alert.alert('Error', 'Failed to update progress')
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <BookDetailsSkeleton />
      </SafeAreaView>
    )
  }

  if (!book) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#666' }}>Book not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: '#3B82F6',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Mock characters for demonstration (you can enhance this with AI-generated data)
  const characters: Character[] | undefined = [
    {
      name: 'Main Character',
      description: 'The protagonist of the story',
      role: 'user'
    },
  ]
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
        <BookDetails
          coverImage={{ uri: book.coverImage }}
          title={book.title}
          subtitle={book.subTitle}
          author={book.author || 'Unknown Author'}
          authorColor="#3B82F6"
          //@ts-ignore
          price={
            //@ts-ignore
            typeof book.price === "object" && book.price?.$numberDecimal
              //@ts-ignore
              ? `$${book.price.$numberDecimal}`
              : book.price || "$14.99"
          }
          pages={book.totalPages || 0}
          rating={book.totalRatings || 0}
          currentProgress={book.readingProgress?.progressPercentage || 0}
          lastRead={book.readingProgress?.lastReadAt || 'Never'}
          genres={book.genres ? book.genres : ['Fiction']}
          plotSummary={
            book.aiKnowledge?.summary ? book.aiKnowledge.summary : book.description ||
            'This is an engaging story that will captivate readers from start to finish.'
          }
          characters={book.aiKnowledge?.characters ?? characters}
          theme={book.aiKnowledge?.majorThemes?.[0]}
          themeDescription={book.aiKnowledge?.majorThemes?.join(', ') || "Really Exciting"}
          tone={book.aiKnowledge?.tone || "Exciting"}
          toneDescription="Fast-paced and thrilling"
          pacing="Fast-paced"
          isbn={book.isbn || 'N/A'}
          onBack={() => router.back()}
          onShare={() => Alert.alert('Share', 'Share functionality coming soon')}
          onMore={() =>
            Alert.alert('Book settings', 'Manage this book', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: book.visibility === 'private' ? 'Make Public' : 'Make Private',
                onPress: async () => {
                  const nextVisibility = book.visibility === 'private' ? 'public' : 'private'
                  const response = await api.toggleVisibility(bookId as string, nextVisibility)
                  if (response.success) {
                    setBook((prev) => (prev ? { ...prev, visibility: nextVisibility } : prev))
                    Alert.alert('Updated', `Visibility set to ${nextVisibility}`)
                  } else {
                    Alert.alert('Error', response.error || 'Failed to update visibility')
                  }
                },
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  const response = await api.deleteBook(bookId as string)
                  if (response.success) {
                    Alert.alert('Success', 'Book deleted')
                    router.back()
                  } else {
                    Alert.alert('Error', response.error || 'Failed to delete book')
                  }
                },
              },
            ])
          }
          onReadNow={() => router.push(`/reading?bookId=${bookId}&chapter=1`)}
          onAIAnalysis={() => router.push(`/chat?bookId=${bookId}`)}
        />
      )
    </View>
  )
}

export default Details
