import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Pressable,
  ActivityIndicator,
  Switch,
} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { resolveBookImage } from '@/utils/bookImageLookup'
import { useRouter } from 'expo-router'
import createStyles from '@/constants/create.styles'
import { useAppContext } from '@/context/useAppContext'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { formatISBN13, generateISBN13, GENRES } from '@/constants/data'
import DateTimePicker from '@react-native-community/datetimepicker'
import { api } from '@/components/ApiHandler'
import ISBNModal from '@/components/IsbnModal'
import SuccessModal from '@/components/SuccessModal'

const Create = () => {
  const router = useRouter()
  const { colors, setBookId } = useAppContext()
  const styles = createStyles(colors)

  const [title, setTitle] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [caption, setCaption] = useState('')
  const [description, setDescription] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [price, setPrice] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [rating, setRating] = useState(3)
  const [isbn, setIsbn] = useState('')
  const [publishedYear, setPublishedYear] = useState('')
  const [file, setFile] = useState<any>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [displayedGenresCount, setDisplayedGenresCount] = useState(5)
  const [showPicker, setShowPicker] = useState(false)
  const [showIsbnModal, setShowIsbnModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [mode, setMode] = useState<'Recommendation' | 'Upload'>('Recommendation')
  const [enableRecommendations, setEnableRecommendations] = useState(true)
  const [allowAIUploadAssist, setAllowAIUploadAssist] = useState(true)

  const CURRENT_YEAR = new Date().getFullYear().toString()
  const autoFillTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!publishedYear) {
      autoFillTimer.current = setTimeout(() => {
        setPublishedYear(CURRENT_YEAR)
      }, 8000)
    }
    return () => {
      if (autoFillTimer.current) clearTimeout(autoFillTimer.current)
    }
  }, [publishedYear, CURRENT_YEAR])

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      })

      if (!result.canceled) {
        setFile(result.assets[0])
        setFileName(result.assets[0].name)
      }
    } catch {
      Alert.alert('Error', 'File selection failed')
    }
  }

  const resetForm = () => {
    setTitle('')
    setSubTitle('')
    setAuthor('')
    setCaption('')
    setDescription('')
    setGenres([])
    setPrice('')
    setVisibility('public')
    setFile(null)
    setFileName(null)
    setRating(3)
    setIsbn('')
    setPublishedYear('')
    setEnableRecommendations(true)
    setAllowAIUploadAssist(true)
  }

  const handleSubmit = async () => {
    if (!title || !author || !caption || genres.length === 0 || !price) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }

    if (mode === 'Upload' && !file) {
      Alert.alert('Error', 'Please select a PDF/EPUB file to upload')
      return
    }

    try {
      setIsLoading(true)

      const suggestedImage = await resolveBookImage(title, author)

      const createRes = await api.createBook({
        title,
        subTitle,
        author,
        caption,
        description: description || caption,
        genres,
        price,
        isbn,
        publishedYear,
        visibility,
        image: suggestedImage || undefined,
      })

      if (!createRes.success) throw new Error(createRes.error || 'Book creation failed')

      // @ts-ignore
      const bookId = createRes?.data?.book?.id
      if (!bookId) throw new Error('Book ID missing')
      setBookId(bookId)

      if (mode === 'Upload' && file) {
        const formData = new FormData()
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        } as any)
        formData.append('bookId', bookId)
        await api.uploadBookContent(bookId, formData)
      }

      await api.addOrUpdateRating({ bookId, rating, review: caption })

      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 2500)
      resetForm()
      router.push('/')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderRatingPicker = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color={i <= rating ? '#f4b400' : colors.textSecondary}
          />
        </TouchableOpacity>
      )
    }

    return <View style={styles.ratingContainer}>{stars}</View>
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={[styles.title, { textAlign: 'center', width: '100%' }]}>Add Book{"\n"}{mode}</Text>
            <Text style={styles.subtitle}>Cover image is auto-suggested from Open Library/Unsplash with smart fallback.</Text>
          </View>

          <View style={styles.segmentContainer}>
            <View style={[styles.segmentedControl, { backgroundColor: colors.border + '30', borderColor: colors.border }]}>
              <View style={[styles.segment, { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' }]}>
                <Text style={[styles.segmentText, { color: colors.textPrimary }]}>Recommendation mode</Text>
                <Switch value={mode === 'Recommendation'} onValueChange={(value) => setMode(value ? 'Recommendation' : 'Upload')} trackColor={{ false: colors.border, true: colors.primary + '80' }} thumbColor={mode === 'Recommendation' ? colors.primary : colors.textSecondary} />
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons name='book-outline' size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder='Enter book title' placeholderTextColor={colors.placeholderText} value={title} onChangeText={setTitle} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>SubTitle</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons name='bookmarks-sharp' size={20} color={colors.primary} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder='Enter subtitle' placeholderTextColor={colors.placeholderText} value={subTitle} onChangeText={setSubTitle} />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons name='calendar-number-sharp' size={20} color={colors.primary} style={styles.inputIcon} />
                  <Pressable style={[styles.generateButton, { flexShrink: 1 }]} onPress={() => setIsbn(generateISBN13(setShowIsbnModal))}>
                    <Text numberOfLines={1} ellipsizeMode='tail'>{isbn ? formatISBN13(isbn) : 'Gen ISBN'}</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Author</Text>
              <View style={styles.inputContainer}>
                <Ionicons name='person-circle-outline' size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder='Enter author name' placeholderTextColor={colors.placeholderText} value={author} onChangeText={setAuthor} />
              </View>
            </View>


            <View style={styles.formGroup}>
              <Text style={styles.label}>Smart Options</Text>
              <View style={[styles.segmentedControl, { backgroundColor: colors.inputBackground, borderColor: colors.border, padding: 10, flexDirection: 'column', gap: 12 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.textPrimary, flex: 1 }}>Personalized recommendations after publish</Text>
                  <Switch
                    value={enableRecommendations}
                    onValueChange={setEnableRecommendations}
                    trackColor={{ false: colors.border, true: colors.primary + '80' }}
                    thumbColor={enableRecommendations ? colors.primary : colors.textSecondary}
                  />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.textPrimary, flex: 1 }}>Use AI assist during upload</Text>
                  <Switch
                    value={allowAIUploadAssist}
                    onValueChange={setAllowAIUploadAssist}
                    trackColor={{ false: colors.border, true: colors.primary + '80' }}
                    thumbColor={allowAIUploadAssist ? colors.primary : colors.textSecondary}
                  />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.textPrimary, flex: 1 }}>Visibility: {visibility === 'public' ? 'Public' : 'Private'}</Text>
                  <Switch
                    value={visibility === 'public'}
                    onValueChange={(value) => setVisibility(value ? 'public' : 'private')}
                    trackColor={{ false: colors.border, true: colors.primary + '80' }}
                    thumbColor={visibility === 'public' ? colors.primary : colors.textSecondary}
                  />
                </View>
              </View>
            </View>


            <View style={styles.formGroup}>
              <Text style={styles.label}>Rating</Text>
              {renderRatingPicker()}
            </View>

            {mode === 'Upload' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>File</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickFile}>
                  <View style={styles.placeholderContainer}>
                    <Ionicons name='file-tray-stacked-outline' size={40} color={colors.textSecondary} />
                    <Text style={styles.placeholderText}>{fileName || 'Upload PDF / EPUB'}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>
              <TextInput value={caption} onChangeText={setCaption} style={styles.textArea} multiline placeholder='Write your review or thoughts about this book ...' placeholderTextColor={colors.placeholderText} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput value={description} onChangeText={setDescription} style={styles.textArea} multiline placeholder='Optional short description. If empty, caption will be used.' placeholderTextColor={colors.placeholderText} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Genres</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {GENRES.slice(0, displayedGenresCount).map((genre, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))}
                    style={styles.categoryGrid}
                  >
                    <View style={[styles.categoryItem, genres.includes(genre) && styles.categoryButtonActive]}>
                      <Text style={styles.categoryButton}>{genre}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 16 }}>
                {displayedGenresCount < GENRES.length && (
                  <TouchableOpacity onPress={() => setDisplayedGenresCount((count) => Math.min(count + 5, GENRES.length))}>
                    <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>Show more</Text>
                  </TouchableOpacity>
                )}
                {displayedGenresCount > 5 && (
                  <TouchableOpacity onPress={() => setDisplayedGenresCount(5)}>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '700' }}>Show less</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Price</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons name='pricetag-sharp' size={20} color={colors.primary} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder='e.g. 19.99' placeholderTextColor={colors.placeholderText} value={price} onChangeText={setPrice} />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons name='time-outline' size={20} color={colors.primary} style={styles.inputIcon} />
                  <Pressable onPress={() => setShowPicker(true)}>
                    <Text>{publishedYear || new Date().getFullYear()}</Text>
                  </Pressable>
                  {showPicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode='date'
                      display='spinner'
                      onChange={(_, selectedDate) => {
                        setShowPicker(false)
                        if (selectedDate) setPublishedYear(selectedDate.getFullYear().toString())
                      }}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={colors.white} animating size='small' />
          ) : (
            <>
              <Ionicons name='cloud-upload-outline' size={20} color={colors.white} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Share</Text>
            </>
          )}
        </TouchableOpacity>

        <ISBNModal isbn={isbn} showIsbnModal={showIsbnModal} setShowIsbnModal={setShowIsbnModal} />
        <SuccessModal showSuccessModal={showSuccessModal} setShowSuccessModal={setShowSuccessModal} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Create
