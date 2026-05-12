import detailStyles from '@/constants/details.style'
import { useAppContext } from '@/context/useAppContext'
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '@/components/ApiHandler'
import { useRouter, useLocalSearchParams, Stack } from 'expo-router'
import BookDetails from '@/components/BookDetails'
import { BookDetailsSkeleton } from '@/components/SkeletonLoaders'
import { GUEST_BOOKS, GUEST_BOOKS_DETAILS } from '@/components/data'
import { loadGuestBookProgress } from '@/utils/load'
// import { GUEST_BOOKS } from '../(tabs)'

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
  const [ currentProgress, setCurrentProgress ] = useState(0)
  
  useEffect(() => {
    loadBookDetails()
  }, [bookId])

  useEffect(() => {
    const loadBookProgress = async () => {
      if (bookId?.startsWith('guest-')) {
        const progress = await loadGuestBookProgress(bookId);
        if (progress) {
          // Update the displayed reading progress
          setCurrentProgress(progress.progressPercentage);
        }
      }
    };
    
    loadBookProgress();
  }, [bookId]);

 const loadBookDetails = async () => {
    console.log("🔍 [1] loadBookDetails triggered with bookId:", bookId);

    if (!bookId || bookId === 'undefined') {
        console.error("❌ [Error] Invalid Book ID passed to details page.");
        return; 
    }

    // 3. Catch the Guest Books before they hit the backend
    if (bookId.startsWith('guest-')) {
        console.log("🏠 [2] Loading guest book locally, skipping backend.");
        const localBook = GUEST_BOOKS_DETAILS.find(b => b._id === bookId);
        console.log("📍 Local book found:", localBook ? "Yes" : "No");
        if (localBook) setBook(localBook);
        // console.log(localBook)
        setIsLoading(false);
        return; 
    }

    try {
        setIsLoading(true);
        console.log("📡 [3] Fetching from API: getBookById(", bookId, ")");
        
        const response = await api.getBookById(bookId);
        
        console.log("📩 [4] API Response received:", JSON.stringify(response, null, 2));

        if (response.success && response.data) {
            // 1. Fallback to response.data if response.data.book is undefined
            const rawBook = response.data.book;
            
            console.log("📦 [5] Raw Book extracted:", rawBook);

            if (!rawBook || Object.keys(rawBook).length === 0) {
                console.warn("⚠️ [6] Raw Book is empty or null!");
                setBook(null);
                throw new Error("Book data is missing from the response");
            }

            console.log("⚙️ [7] Starting normalization for:", rawBook.title || "Unknown Title");

            const normalizeDecimal = (value: any) => {
                if (value && typeof value === "object" && value.$numberDecimal) {
                    return Number(value.$numberDecimal);
                }
                return value;
            };

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
            };

            console.log("✅ [8] Normalization complete. Setting book state.");
            setBook(normalizedBook);

        } else {
            console.error("❌ [9] API Success was false or data missing. Error:", response.error);
            throw new Error(response.error || 'Failed to load book');
        }
    } catch (error: any) {
        console.error('🔴 [CRITICAL] Error in loadBookDetails:', error);
        // If it's a TypeError, this log will show you exactly which property failed
        if (error instanceof TypeError) {
            console.error('📝 TypeError Details:', error.message);
        }
        Alert.alert('Error', error.message || 'Failed to load book details');
        router.back();
    } finally {
        console.log("🏁 [10] loadBookDetails finished execution.");
        setIsLoading(false);
    }
};

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
    <View style={{ flex: 1, alignContent: "flex-start"}}>
      <Stack.Screen options={{headerShown: false}} />
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
        currentProgress={currentProgress || book.readingProgress?.progressPercentage || 0}
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
    </View>
  )
}

export default Details
