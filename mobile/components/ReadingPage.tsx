import readStyles from '@/constants/read.styles'
import { useAppContext } from '@/context/useAppContext'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '@/components/ApiHandler'
import { ReadingPageSkeleton } from '@/components/SkeletonLoaders'
import { BookCover } from '@/components/BookCover'
import { getOfflineBook, isChapterDownloaded, saveBookOffline } from '@/utils/offlineBooks'

interface ReadingPageProps {
  onBack: () => void
  onSettings: () => void
  onSaved: () => void
  onAnalyze: () => void
  onNotes: () => void
  onCast: () => void
  initialChapter: number
  bookId: string
}

type Page = {
  text?: string | null
  pageNumber?: number | null
}

type Character = {
  name?: string | null
  description?: string | null
  relationship?: string | null
}

const ReadingPage: React.FC<ReadingPageProps> = ({
  onBack,
  onSettings,
  initialChapter,
  bookId,
}) => {
  const { colors } = useAppContext()
  const styles = readStyles(colors)
  const router = useRouter()

  const [chapterNumber, setChapterNumber] = useState(initialChapter)
  const [chapterTitle, setChapterTitle] = useState('')
  const [pages, setPages] = useState<Page[]>([])
  const [currentPageNumber, setCurrentPageNumber] = useState(1)

  const [summary, setSummary] = useState('')
  const [themes, setThemes] = useState<string[]>([])
  const [tone, setTone] = useState('')
  const [characters, setCharacters] = useState<Character[]>([])
  const [maxUnlockedChapter, setMaxUnlockedChapter] = useState(1)

  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')
  const [bookCover, setBookCover] = useState<string | null>(null)

  const [timeRemaining, setTimeRemaining] = useState('...')
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [chapterDownloaded, setChapterDownloaded] = useState(false)

  const [activeModal, setActiveModal] = useState<'none' | 'cast' | 'analyze' | 'notes' | 'saved' | 'toc' | 'tools'>('none')

  const [tocData, setTocData] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [newNoteText, setNewNoteText] = useState('')

  const paragraphs = useMemo(() => {
    const rawText = pages[currentPageNumber - 1]?.text || ''
    const cleaned = rawText
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()

    const sentences = cleaned.match(/[^.!?\"]+[.!?\"]+[\s]*/g) || [cleaned]
    const result: string[] = []

    for (let i = 0; i < sentences.length; i += 3) {
      const chunk = sentences.slice(i, i + 3).join('').trim()
      if (chunk.length > 0) result.push(chunk)
    }

    return result
  }, [pages, currentPageNumber])

  const fetchBookMeta = async () => {
    try {
      const res = await api.getBookById(bookId as string)
      if (res.success && res.data?.book) {
        setBookTitle(res.data.book.title || '')
        setBookAuthor(res.data.book.author || '')
        setBookCover(res.data.book.coverImage || null)
      }
    } catch (err) {
      console.log('Failed to fetch book metadata', err)
    }
  }

  const fetchUserAnnotations = async () => {
    try {
      const [notesRes, bookmarksRes] = await Promise.all([
        api.getNotes(bookId as string),
        api.getBookmarks(bookId as string),
      ])

      if (notesRes && notesRes.success) setNotes(notesRes.data?.notes || [])
      if (bookmarksRes && bookmarksRes.success) setBookmarks(bookmarksRes.data?.bookmarks || [])
    } catch (err) {
      console.log('Failed to fetch notes and bookmarks:', err)
    }
  }

  useEffect(() => {
    if (bookId) {
      fetchUserAnnotations()
      fetchBookMeta()
    }
  }, [bookId, chapterNumber])

  const openTableOfContents = async () => {
    setActiveModal('toc')
    try {
      const res = await api.getTableOfContents(bookId as string)
      if (res.success) {
        setTocData(res.data?.tableOfContents || [])
      }
    } catch (err) {
      console.log('Failed to fetch TOC', err)
    }
  }

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return
    try {
      const res = await api.addNote(bookId as string, {
        note: newNoteText,
        chapterNumber,
        pageNumber: currentPageNumber,
      })
      if (res.success) {
        setNotes(res.data?.notes || [])
      }
      setNewNoteText('')
    } catch (err) {
      console.log('Failed to add note', err)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await api.deleteNote(bookId as string, noteId)
      if (res.success) setNotes(res.data?.notes || [])
    } catch (err) {
      console.log('Failed to delete note', err)
    }
  }

  const handleAddBookmark = async () => {
    try {
      const res = await api.addBookmark(bookId as string, {
        chapterNumber,
        pageNumber: currentPageNumber,
      })
      if (res.success) {
        setBookmarks(res.data?.bookmarks || [])
      }
    } catch (err) {
      console.log('Failed to add bookmark', err)
    }
  }

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      const res = await api.removeBookmark(bookId as string, bookmarkId)
      if (res.success) {
        setBookmarks(res.data?.bookmarks || [])
      }
    } catch (err) {
      console.log('Failed to remove bookmark', err)
    }
  }

  const fetchChapter = async (chapter: number, targetPage: number | 'last' = 1) => {
    try {
      setLoading(true)
      const offlineChapter = await getOfflineBook(bookId, chapter)
      if (offlineChapter) {
        const offlinePages = offlineChapter.split('\n\n').map((text, index) => ({ pageNumber: index + 1, text }))
        setChapterTitle(`Chapter ${chapter}`)
        setPages(offlinePages)
        setSummary('Loaded from offline download.')
        setThemes([])
        setTone('')
        setCharacters([])
        setChapterDownloaded(true)

        const totalPages = offlinePages.length || 1
        const startingPage = targetPage === 'last' ? totalPages : targetPage
        setCurrentPageNumber(startingPage)
        estimateReadingTime(offlinePages[startingPage - 1]?.text || '')
        return
      }

      const res = await api.getChapterContent(bookId as string, chapter)
      if (!res.success) throw new Error(res.error)

      const chapterData = res.data?.chapter
      const progressData = res.data?.userProgress

      setChapterTitle(chapterData?.title || `Chapter ${chapter}`)
      setPages(chapterData?.pages || [])
      setSummary(chapterData?.summary || '')
      setThemes(chapterData?.themes || [])
      setTone(chapterData?.tone || '')
      setCharacters(chapterData?.characters || [])

      if (progressData) setMaxUnlockedChapter(progressData.maxUnlockedChapter || 1)

      const totalPages = chapterData?.pages?.length || 1
      const startingPage = targetPage === 'last' ? totalPages : targetPage
      setCurrentPageNumber(startingPage)

      const initialPageText = chapterData?.pages?.[startingPage - 1]?.text || ''
      estimateReadingTime(initialPageText)

      const downloaded = await isChapterDownloaded(bookId, chapter)
      setChapterDownloaded(downloaded)
    } catch (err) {
      console.log('Chapter load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadChapter = async () => {
    try {
      setDownloading(true)
      const chapterContent = pages.map((page) => page.text || '').join('\n\n')
      await saveBookOffline(bookId, chapterNumber, chapterContent)
      setChapterDownloaded(true)
    } catch (err) {
      console.log('Failed to save chapter offline', err)
    } finally {
      setDownloading(false)
    }
  }

  const estimateReadingTime = (pageText: string) => {
    if (!pageText) return setTimeRemaining('0 min left')
    const words = pageText.split(/\s+/).length
    const wordsPerMinute = 100
    const minutes = Math.ceil(words / wordsPerMinute)
    setTimeRemaining(`${minutes} min left`)
  }

  useEffect(() => {
    const updateProgress = async () => {
      try {
        await api.updateReadingProgress(bookId as string, {
          currentChapter: chapterNumber,
          currentPage: currentPageNumber,
          progressPercentage: pages.length > 0 ? Math.round((currentPageNumber / pages.length) * 100) : 0,
        })
      } catch (err) {
        console.log('Progress update failed')
      }
    }

    if (!loading && pages.length > 0) {
      updateProgress()
    }
  }, [chapterNumber, currentPageNumber, loading, pages.length])

  const handleNext = () => {
    if (currentPageNumber < pages.length) {
      const nextPg = currentPageNumber + 1
      setCurrentPageNumber(nextPg)
      estimateReadingTime(pages[nextPg - 1]?.text || '')
      return
    }

    const nextChap = chapterNumber + 1
    if (nextChap > maxUnlockedChapter + 1) return
    setChapterNumber(nextChap)
    fetchChapter(nextChap, 1)
  }

  const handlePrevious = () => {
    if (currentPageNumber > 1) {
      const prevPg = currentPageNumber - 1
      setCurrentPageNumber(prevPg)
      estimateReadingTime(pages[prevPg - 1]?.text || '')
      return
    }

    if (chapterNumber === 1) return
    const prevChap = chapterNumber - 1
    setChapterNumber(prevChap)
    fetchChapter(prevChap, 'last')
  }

  useEffect(() => {
    if (bookId) fetchChapter(chapterNumber)
  }, [bookId])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ReadingPageSkeleton />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.chapterNumber}>CHAPTER {chapterNumber}</Text>
          <Text style={styles.timeRemaining}>{timeRemaining}</Text>
        </View>

        <TouchableOpacity onPress={onSettings} style={styles.headerButton}>
          <Text style={styles.headerIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        key={`${chapterNumber}-${currentPageNumber}`}
        style={styles.contentContainer}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.chapterTitle}>{chapterTitle}</Text>
        {paragraphs.map((paragraph, index) => (
          <View key={`${chapterNumber}-${currentPageNumber}-${index}`}>
            {index === 0 ? (
              <Text style={styles.paragraph}>
                <Text style={styles.dropCap}>{paragraph.charAt(0)}</Text>
                {paragraph.slice(1)}
              </Text>
            ) : (
              <Text style={styles.paragraph}>{paragraph}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.toolsFab} onPress={() => setActiveModal('tools')}>
        <Text style={styles.toolsFabText}>Reading Tools</Text>
      </TouchableOpacity>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navArrow, chapterNumber === 1 && currentPageNumber === 1 && { opacity: 0.5 }]}
          onPress={handlePrevious}
          disabled={chapterNumber === 1 && currentPageNumber === 1}
        >
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.aiAssistantButton}
          onPress={() => router.push({ pathname: '/chat', params: { bookId } })}
        >
          <Text style={styles.aiAssistantIcon}>✨</Text>
          <Text style={styles.aiAssistantText}>AI Assistant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navArrow} onPress={handleNext}>
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={activeModal !== 'none'}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveModal('none')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeModal === 'tools' ? 'Reading Tools' : activeModal.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {activeModal === 'tools' && (
                <View style={styles.toolsList}>
                  <TouchableOpacity style={styles.toolRow} onPress={() => setActiveModal('analyze')}>
                    <Text style={styles.toolIcon}>📊</Text>
                    <Text style={styles.toolText}>Analyze</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.toolRow} onPress={() => setActiveModal('notes')}>
                    <Text style={styles.toolIcon}>📝</Text>
                    <Text style={styles.toolText}>Notes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.toolRow} onPress={() => setActiveModal('saved')}>
                    <Text style={styles.toolIcon}>🔖</Text>
                    <Text style={styles.toolText}>Saved</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.toolRow} onPress={() => setActiveModal('cast')}>
                    <Text style={styles.toolIcon}>👥</Text>
                    <Text style={styles.toolText}>Cast</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.toolRow} onPress={openTableOfContents}>
                    <Text style={styles.toolIcon}>📚</Text>
                    <Text style={styles.toolText}>Table of Contents</Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeModal === 'analyze' && (
                <View>
                  <View style={styles.summaryCard}>
                    <BookCover title={bookTitle || chapterTitle} author={bookAuthor} coverUrl={bookCover} />
                    <View style={styles.summaryTextWrap}>
                      <Text style={styles.sectionTitle}>Chapter Summary</Text>
                      <Text style={styles.modalText}>{summary || 'No summary available.'}</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Tone</Text>
                  <Text style={styles.modalText}>{tone || 'Unknown tone.'}</Text>

                  <Text style={styles.sectionTitle}>Themes</Text>
                  {themes.length > 0 ? themes.map((t, idx) => <Text key={idx} style={styles.bulletItem}>• {t}</Text>) : <Text style={styles.modalText}>No themes identified.</Text>}
                </View>
              )}

              {activeModal === 'cast' && (
                <View>
                  {characters.length > 0 ? (
                    characters.map((char, idx) => (
                      <View key={idx} style={styles.characterCard}>
                        <Text style={styles.characterName}>{char.name}</Text>
                        {char.description ? <Text style={styles.modalText}>{char.description}</Text> : null}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.modalText}>No characters listed for this chapter.</Text>
                  )}
                </View>
              )}

              {activeModal === 'notes' && (
                <View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Write a new note..."
                    value={newNoteText}
                    onChangeText={setNewNoteText}
                    multiline
                  />
                  <TouchableOpacity style={styles.primaryButton} onPress={handleAddNote}>
                    <Text style={styles.primaryButtonText}>Add Note</Text>
                  </TouchableOpacity>

                  <Text style={styles.sectionTitle}>Your Notes</Text>
                  {notes.map((note, idx) => (
                    <View key={idx} style={styles.noteItem}>
                      <Text style={styles.modalText}>{note.note}</Text>
                      <TouchableOpacity onPress={() => handleDeleteNote(note.id || note._id)}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {activeModal === 'saved' && (
                <View>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleAddBookmark}
                  >
                    <Text style={styles.secondaryButtonText}>Save current page</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleDownloadChapter}
                    disabled={downloading || chapterDownloaded}
                  >
                    <Text style={styles.primaryButtonText}>
                      {chapterDownloaded ? 'Downloaded for offline' : downloading ? 'Downloading...' : 'Download chapter offline'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.sectionTitle}>Bookmarks</Text>
                  {bookmarks.map((bm, idx) => (
                    <View key={idx} style={styles.noteItem}>
                      <Text style={styles.modalText}>Chapter {bm.chapterNumber || bm.chapter} - Page {bm.pageNumber || bm.page}</Text>
                      <TouchableOpacity onPress={() => handleRemoveBookmark(bm.id || bm._id)}>
                        <Text style={styles.deleteText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {activeModal === 'toc' && (
                <View>
                  {tocData.length > 0 ? (
                    tocData.map((chap, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.tocItem, !chap.isUnlocked && styles.tocLockedItem]}
                        disabled={!chap.isUnlocked}
                        onPress={() => {
                          setChapterNumber(chap.chapterNumber)
                          fetchChapter(chap.chapterNumber, 1)
                          setActiveModal('none')
                        }}
                      >
                        <Text style={styles.tocItemText}>
                          Chapter {chap.chapterNumber}: {chap.title} {!chap.isUnlocked ? '(Locked)' : ''}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.modalText}>Loading Table of Contents...</Text>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default ReadingPage
