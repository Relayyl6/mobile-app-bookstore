import readStyles from '@/constants/read.styles';
import { useAppContext } from '@/context/useAppContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/components/ApiHandler';
import { ReadingPageSkeleton } from '@/components/SkeletonLoaders';
import BookCover from '@/components/BookCover';
import { getOfflineBook, saveBookOffline } from '@/utils/offlineBookStorage';

interface ReadingPageProps {
  onBack: () => void;
  onSettings: () => void;
  onSaved: () => void;
  onAnalyze: () => void;
  onNotes: () => void;
  onCast: () => void;
  initialChapter: number;
  bookId: string;
}

type Page = {
  text?: string | null;
  pageNumber?: number | null;
};

type Character = {
  name?: string | null;
  description?: string | null;
  relationship?: string | null;
};

const ReadingPage: React.FC<ReadingPageProps> = ({ onBack, onSettings, initialChapter, bookId }) => {
  const { colors } = useAppContext();
  const styles = readStyles(colors);
  const router = useRouter();

  const [chapterNumber, setChapterNumber] = useState(initialChapter);
  const [chapterTitle, setChapterTitle] = useState('');
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [summary, setSummary] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [tone, setTone] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [maxUnlockedChapter, setMaxUnlockedChapter] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState('...');
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'none' | 'cast' | 'analyze' | 'notes' | 'saved' | 'toc'>('none');
  const [toolsVisible, setToolsVisible] = useState(false);
  const [tocData, setTocData] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [bookMeta, setBookMeta] = useState<{ title: string; author: string; coverImage?: string }>({ title: '', author: '' });
  const [annotationStats, setAnnotationStats] = useState({ noteCount: 0, bookmarkCount: 0, chapterCompletion: 0 });

  const paragraphs = useMemo(() => {
    const rawText = pages[currentPageNumber - 1]?.text || '';
    const cleaned = rawText.replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();
    const sentences = cleaned.match(/[^.!?\"]+[.!?\"]+[\s]*/g) || [cleaned];
    const result: string[] = [];

    for (let i = 0; i < sentences.length; i += 3) {
      const chunk = sentences.slice(i, i + 3).join('').trim();
      if (chunk.length > 0) result.push(chunk);
    }

    return result;
  }, [pages, currentPageNumber]);

  const fetchBookMeta = async () => {
    try {
      const res = await api.getBookById(bookId);
      if (res.success && res.data?.book) {
        setBookMeta({
          title: res.data.book.title,
          author: res.data.book.author,
          coverImage: res.data.book.coverImage,
        });
      }
    } catch (err) {
      console.log('Failed to fetch metadata', err);
    }
  };

  const fetchUserAnnotations = async () => {
    try {
      const [notesRes, bookmarksRes] = await Promise.all([api.getNotes(bookId), api.getBookmarks(bookId)]);
      if (notesRes?.success) setNotes(notesRes.data?.notes || []);
      if (bookmarksRes?.success) setBookmarks(bookmarksRes.data?.bookmarks || []);
    } catch (err) {
      console.log('Failed to fetch notes and bookmarks:', err);
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchBookMeta();
      fetchUserAnnotations();
    }
  }, [bookId, chapterNumber]);

  const openTableOfContents = async () => {
    setActiveModal('toc');
    try {
      const res = await api.getTableOfContents(bookId);
      if (res.success) setTocData(res.data?.tableOfContents || []);
    } catch (err) {
      console.log('Failed to fetch TOC', err);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      const res = await api.addNote(bookId, {
        note: newNoteText,
        chapterNumber,
        pageNumber: currentPageNumber,
      });
      if (res.success) {
        setNotes(res.data?.notes || []);
        setNewNoteText('');
      }
    } catch (err) {
      console.log('Failed to add note', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await api.deleteNote(bookId, noteId);
      if (res.success) setNotes(res.data?.notes || []);
    } catch (err) {
      console.log('Failed to delete note', err);
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      const res = await api.removeBookmark(bookId, bookmarkId);
      if (res.success) setBookmarks(res.data?.bookmarks || []);
    } catch (err) {
      console.log('Failed to remove bookmark', err);
    }
  };

  const estimateReadingTime = (pageText: string) => {
    if (!pageText) return setTimeRemaining('0 min left');
    const words = pageText.split(/\s+/).length;
    const minutes = Math.ceil(words / 100);
    setTimeRemaining(`${minutes} min left`);
  };

  const fetchChapter = async (chapter: number, targetPage: number | 'last' = 1) => {
    try {
      setLoading(true);
      const res = await api.getChapterContent(bookId, chapter);
      if (!res.success) throw new Error(res.error);

      const chapterData = res.data?.chapter;
      const progressData = res.data?.userProgress;
      const toolsData = res.data?.readingTools;

      setChapterTitle(chapterData?.title || `Chapter ${chapter}`);
      setPages(chapterData?.pages || []);
      setSummary(chapterData?.summary || '');
      setThemes(chapterData?.themes || []);
      setTone(chapterData?.tone || '');
      setCharacters(chapterData?.characters || []);
      setMaxUnlockedChapter(progressData?.maxUnlockedChapter || 1);
      setAnnotationStats({
        noteCount: toolsData?.noteCount || 0,
        bookmarkCount: toolsData?.bookmarkCount || 0,
        chapterCompletion: toolsData?.chapterCompletion || 0,
      });

      if (chapterData?.content) {
        await saveBookOffline(bookId, chapter, chapterData.content);
        await api.markBookOffline(bookId, chapter);
      }

      const totalPages = chapterData?.pages?.length || 1;
      const startingPage = targetPage === 'last' ? totalPages : targetPage;
      setCurrentPageNumber(startingPage);
      estimateReadingTime(chapterData?.pages?.[startingPage - 1]?.text || '');
    } catch (err) {
      const offlineText = await getOfflineBook(bookId, chapter);
      if (offlineText) {
        setChapterTitle(`Chapter ${chapter} (Offline)`);
        setPages([{ pageNumber: 1, text: offlineText }]);
        setCurrentPageNumber(1);
        estimateReadingTime(offlineText);
      } else {
        console.log('Chapter load error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateProgress = async () => {
      try {
        await api.updateReadingProgress(bookId, {
          currentChapter: chapterNumber,
          currentPage: currentPageNumber,
          progressPercentage: pages.length > 0 ? Math.round((currentPageNumber / pages.length) * 100) : 0,
        });
      } catch {
        console.log('Progress update failed');
      }
    };

    if (!loading && pages.length > 0) updateProgress();
  }, [chapterNumber, currentPageNumber, loading, pages.length]);

  const handleNext = () => {
    if (currentPageNumber < pages.length) {
      const nextPg = currentPageNumber + 1;
      setCurrentPageNumber(nextPg);
      estimateReadingTime(pages[nextPg - 1]?.text || '');
      return;
    }

    const nextChap = chapterNumber + 1;
    setChapterNumber(nextChap);
    fetchChapter(nextChap, 1);
  };

  const handlePrevious = () => {
    if (currentPageNumber > 1) {
      const prevPg = currentPageNumber - 1;
      setCurrentPageNumber(prevPg);
      estimateReadingTime(pages[prevPg - 1]?.text || '');
      return;
    }

    if (chapterNumber === 1) return;
    const prevChap = chapterNumber - 1;
    setChapterNumber(prevChap);
    fetchChapter(prevChap, 'last');
  };

  useEffect(() => {
    if (bookId) fetchChapter(chapterNumber);
  }, [bookId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ReadingPageSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}><Text style={styles.headerIcon}>←</Text></TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.chapterNumber}>CHAPTER {chapterNumber}</Text>
          <Text style={styles.timeRemaining}>{timeRemaining}</Text>
        </View>
        <TouchableOpacity onPress={onSettings} style={styles.headerButton}><Text style={styles.headerIcon}>⚙</Text></TouchableOpacity>
      </View>

      <ScrollView key={`${chapterNumber}-${currentPageNumber}`} style={styles.contentContainer} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
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

      <View style={styles.navigationContainer}>
        <TouchableOpacity style={[styles.navArrow, chapterNumber === 1 && currentPageNumber === 1 && { opacity: 0.5 }]} onPress={handlePrevious} disabled={chapterNumber === 1 && currentPageNumber === 1}>
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.readingToolsButton} onPress={() => setToolsVisible(true)}>
          <Text style={styles.aiAssistantIcon}>☰</Text>
          <Text style={styles.aiAssistantText}>Reading Tools</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.aiAssistantButton} onPress={() => router.push({ pathname: '/chat', params: { bookId } })}>
          <Text style={styles.aiAssistantIcon}>✨</Text>
          <Text style={styles.aiAssistantText}>AI Assistant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navArrow} onPress={handleNext}><Text style={styles.navArrowText}>›</Text></TouchableOpacity>
      </View>

      <Modal visible={toolsVisible} animationType="slide" transparent onRequestClose={() => setToolsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.toolsModalContent}>
            <Text style={styles.modalTitle}>Reading Tools</Text>
            <TouchableOpacity style={[styles.toolsItem, styles.toolsSelected]} onPress={() => { setToolsVisible(false); setActiveModal('analyze'); }}><Text style={styles.toolsItemTextSelected}>Analyze</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toolsItem} onPress={() => { setToolsVisible(false); setActiveModal('notes'); }}><Text style={styles.toolsItemText}>Notes</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toolsItem} onPress={() => { setToolsVisible(false); setActiveModal('saved'); }}><Text style={styles.toolsItemText}>Saved</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toolsItem} onPress={() => { setToolsVisible(false); setActiveModal('cast'); }}><Text style={styles.toolsItemText}>Cast</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toolsItem} onPress={() => { setToolsVisible(false); openTableOfContents(); }}><Text style={styles.toolsItemText}>Table of Contents</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal !== 'none'} animationType="slide" transparent onRequestClose={() => setActiveModal('none')}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeModal.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')} style={styles.closeButton}><Text style={styles.closeButtonText}>✕</Text></TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {activeModal === 'analyze' && (
                <View>
                  <View style={styles.heroCard}>
                    <BookCover title={bookMeta.title || chapterTitle} author={bookMeta.author} coverUrl={bookMeta.coverImage} />
                    <View style={styles.heroTextWrap}>
                      <Text style={styles.heroTitle}>{bookMeta.title || chapterTitle}</Text>
                      <Text style={styles.heroSubtitle}>Chapter {chapterNumber}</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionTitle}>Chapter Summary</Text>
                  <Text style={styles.modalText}>{summary || 'No summary available.'}</Text>
                  <Text style={styles.sectionTitle}>Tone</Text>
                  <Text style={styles.modalText}>{tone || 'Unknown tone.'}</Text>
                  <Text style={styles.sectionTitle}>Themes</Text>
                  <View style={styles.chipRow}>
                    {themes.length > 0 ? themes.map((t, idx) => <Text key={`${t}-${idx}`} style={styles.chip}>#{t}</Text>) : <Text style={styles.modalText}>No themes identified.</Text>}
                  </View>
                  <View style={styles.statsCard}>
                    <Text style={styles.statsBig}>{annotationStats.noteCount + annotationStats.bookmarkCount}</Text>
                    <Text style={styles.statsLabel}>Total annotations</Text>
                    <Text style={styles.modalText}>Completion: {annotationStats.chapterCompletion}%</Text>
                  </View>
                </View>
              )}

              {activeModal === 'cast' && (
                <View>
                  {characters.length > 0 ? characters.map((char, idx) => (
                    <View key={`${char.name}-${idx}`} style={styles.characterCard}>
                      <Text style={styles.characterName}>{char.name}</Text>
                      <Text style={styles.modalText}>{char.description || 'No description yet.'}</Text>
                    </View>
                  )) : <Text style={styles.modalText}>No characters listed for this chapter.</Text>}
                </View>
              )}

              {activeModal === 'notes' && (
                <View>
                  <TextInput style={styles.textInput} placeholder="Write a new note..." value={newNoteText} onChangeText={setNewNoteText} multiline />
                  <TouchableOpacity style={styles.primaryButton} onPress={handleAddNote}><Text style={styles.primaryButtonText}>Add Note</Text></TouchableOpacity>
                  <Text style={styles.sectionTitle}>Your Notes</Text>
                  {notes.length > 0 ? notes.map((note, idx) => (
                    <View key={`${note._id || idx}`} style={styles.noteItem}>
                      <View style={styles.noteTextWrap}>
                        <Text style={styles.modalText}>{note.note || note.text}</Text>
                        <Text style={styles.captionText}>Chapter {note.chapterNumber} • Page {note.pageNumber || 1}</Text>
                      </View>
                      {note._id ? <TouchableOpacity onPress={() => handleDeleteNote(note._id)}><Text style={styles.deleteText}>Delete</Text></TouchableOpacity> : null}
                    </View>
                  )) : <Text style={styles.modalText}>No notes yet.</Text>}
                </View>
              )}

              {activeModal === 'saved' && (
                <View>
                  <Text style={styles.sectionTitle}>Bookmarks</Text>
                  {bookmarks.length > 0 ? bookmarks.map((bm, idx) => (
                    <View key={`${bm._id || idx}`} style={styles.noteItem}>
                      <View style={styles.noteTextWrap}>
                        <Text style={styles.modalText}>Chapter {bm.chapterNumber} - Page {bm.pageNumber}</Text>
                        {bm.note ? <Text style={styles.captionText}>{bm.note}</Text> : null}
                      </View>
                      {bm._id ? <TouchableOpacity onPress={() => handleRemoveBookmark(bm._id)}><Text style={styles.deleteText}>Remove</Text></TouchableOpacity> : null}
                    </View>
                  )) : <Text style={styles.modalText}>No bookmarks yet.</Text>}
                </View>
              )}

              {activeModal === 'toc' && (
                <View>
                  {tocData.length > 0 ? tocData.map((chap, idx) => (
                    <TouchableOpacity key={`${chap.chapterNumber}-${idx}`} style={styles.tocItem} onPress={() => { setChapterNumber(chap.chapterNumber); fetchChapter(chap.chapterNumber, 1); setActiveModal('none'); }}>
                      <Text style={styles.tocItemText}>Chapter {chap.chapterNumber}: {chap.title}</Text>
                    </TouchableOpacity>
                  )) : <Text style={styles.modalText}>Loading Table of Contents...</Text>}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ReadingPage;
