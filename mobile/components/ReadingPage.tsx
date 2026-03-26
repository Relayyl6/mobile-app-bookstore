import readStyles from '@/constants/read.styles';
import { useAppContext } from '@/context/useAppContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { saveChapterOffline, isChapterOffline } from '@/utils/offlineBooks';

interface ReadingPageProps {
  onBack: () => void;
  onSettings: () => void;
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

type ReadingModal = 'none' | 'tools' | 'cast' | 'analyze' | 'notes' | 'saved' | 'toc';

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
  const [chapterInsights, setChapterInsights] = useState<string[]>([]);
  const [maxUnlockedChapter, setMaxUnlockedChapter] = useState(1);

  const [timeRemaining, setTimeRemaining] = useState('...');
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ReadingModal>('none');

  const [tocData, setTocData] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  const [savingOffline, setSavingOffline] = useState(false);
  const [isOfflineDownloaded, setIsOfflineDownloaded] = useState(false);

  const paragraphs = useMemo(() => {
    const rawText = pages[currentPageNumber - 1]?.text || '';

    const cleaned = rawText
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const sentences = cleaned.match(/[^.!?\"]+[.!?\"]+[\s]*/g) || [cleaned];

    const result: string[] = [];
    const chunkSize = 3;
    for (let i = 0; i < sentences.length; i += chunkSize) {
      const chunk = sentences.slice(i, i + chunkSize).join('').trim();
      if (chunk.length > 0) result.push(chunk);
    }
    return result;
  }, [pages, currentPageNumber]);

  const closeAllModals = () => setActiveModal('none');

  const openTools = () => setActiveModal('tools');

  const openToolModal = (type: Exclude<ReadingModal, 'none' | 'tools'>) => {
    if (type === 'toc') {
      openTableOfContents();
      return;
    }
    setActiveModal(type);
  };

  const estimateReadingTime = (pageText: string) => {
    if (!pageText) return setTimeRemaining('0 min left');
    const words = pageText.split(/\s+/).length;
    const minutes = Math.ceil(words / 100);
    setTimeRemaining(`${minutes} min left`);
  };

  const fetchUserAnnotations = async () => {
    try {
      const [notesRes, bookmarksRes] = await Promise.all([
        api.getNotes(bookId as string),
        api.getBookmarks(bookId as string),
      ]);

      if (notesRes && notesRes.success) {
        setNotes(notesRes.data?.notes || []);
      }

      if (bookmarksRes && bookmarksRes.success) {
        setBookmarks(bookmarksRes.data?.bookmarks || []);
      }
    } catch (err) {
      console.log('Failed to fetch notes and bookmarks:', err);
    }
  };

  const openTableOfContents = async () => {
    setActiveModal('toc');
    try {
      const res = await api.getTableOfContents(bookId as string);
      if (res.success) {
        setTocData(res.data?.tableOfContents || []);
      }
    } catch (err) {
      console.log('Failed to fetch TOC', err);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;

    try {
      const res = await api.addNote(bookId as string, {
        note: newNoteText,
        chapterNumber,
        pageNumber: currentPageNumber,
      });

      if (res.success) {
        setNotes(res.data?.notes || []);
      }
      setNewNoteText('');
    } catch (err) {
      console.log('Failed to add note', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await api.deleteNote(bookId as string, noteId);
      if (res.success) {
        setNotes(res.data?.notes || []);
      }
    } catch (err) {
      console.log('Failed to delete note', err);
    }
  };

  const handleAddBookmark = async () => {
    try {
      const res = await api.addBookmark(bookId as string, {
        chapterNumber,
        pageNumber: currentPageNumber,
      });

      if (res.success) {
        setBookmarks((res.data as any)?.bookmarks || []);
        setActiveModal('saved');
      }
    } catch (err) {
      console.log('Failed to add bookmark', err);
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      const res = await api.removeBookmark(bookId as string, bookmarkId);
      if (res.success) {
        setBookmarks((res.data as any)?.bookmarks || []);
      }
    } catch (err) {
      console.log('Failed to remove bookmark', err);
    }
  };

  const handleSaveOffline = async () => {
    try {
      setSavingOffline(true);
      const chapterText = pages.map((page) => page.text || '').join('\n\n');
      await saveChapterOffline(bookId, chapterNumber, chapterText);
      setIsOfflineDownloaded(true);
    } catch (err) {
      console.log('Failed to save offline', err);
    } finally {
      setSavingOffline(false);
    }
  };

  const fetchChapter = async (chapter: number, targetPage: number | 'last' = 1) => {
    try {
      setLoading(true);
      const res = await api.getChapterContent(bookId as string, chapter);
      if (!res.success) throw new Error(res.error);

      const chapterData = res.data?.chapter;
      const progressData = res.data?.userProgress;

      setChapterTitle(chapterData?.title || `Chapter ${chapter}`);
      setPages(chapterData?.pages || []);
      setSummary(chapterData?.summary || '');
      setThemes(chapterData?.themes || []);
      setTone(chapterData?.tone || '');
      setCharacters(chapterData?.characters || []);
      setChapterInsights(chapterData?.insights || []);

      if (progressData) {
        setMaxUnlockedChapter(progressData.maxUnlockedChapter || 1);
      }

      const totalPages = chapterData?.pages?.length || 1;
      const startingPage = targetPage === 'last' ? totalPages : targetPage;
      setCurrentPageNumber(startingPage);

      const initialPageText = chapterData?.pages?.[startingPage - 1]?.text || '';
      estimateReadingTime(initialPageText);
      setIsOfflineDownloaded(await isChapterOffline(bookId, chapter));
    } catch (err) {
      console.log('Chapter load error:', err);
    } finally {
      setLoading(false);
    }
  };

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
    if (bookId) fetchUserAnnotations();
  }, [bookId, chapterNumber]);

  useEffect(() => {
    if (bookId) fetchChapter(chapterNumber);
  }, [bookId]);

  useEffect(() => {
    const updateProgress = async () => {
      try {
        await api.updateReadingProgress(bookId as string, {
          currentChapter: chapterNumber,
          currentPage: currentPageNumber,
          progressPercentage: pages.length > 0 ? Math.round((currentPageNumber / pages.length) * 100) : 0,
        });
      } catch {
        console.log('Progress update failed');
      }
    };

    if (!loading && pages.length > 0) {
      updateProgress();
    }
  }, [chapterNumber, currentPageNumber, loading, pages.length]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ReadingPageSkeleton />
      </SafeAreaView>
    );
  }

  const tools = [
    { key: 'cast', label: 'Cast', icon: '👥' },
    { key: 'analyze', label: 'Analyze', icon: '📊' },
    { key: 'notes', label: 'Notes', icon: '📝' },
    { key: 'saved', label: 'Saved', icon: '🔖' },
    { key: 'toc', label: 'Contents', icon: '📚' },
  ] as const;

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

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navArrow, chapterNumber === 1 && currentPageNumber === 1 && { opacity: 0.5 }]}
          onPress={handlePrevious}
          disabled={chapterNumber === 1 && currentPageNumber === 1}
        >
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.readerToolsButton} onPress={openTools}>
          <Text style={styles.readerToolsLabel}>Reading Tools</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.aiAssistantButton}
          onPress={() =>
            router.push({
              pathname: '/chat',
              params: { bookId },
            })
          }
        >
          <Text style={styles.aiAssistantIcon}>✨</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navArrow} onPress={handleNext}>
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={activeModal !== 'none'} animationType="slide" transparent onRequestClose={closeAllModals}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            {activeModal === 'tools' && (
              <View>
                <Text style={styles.modalTitle}>Reading Tools</Text>
                {tools.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.toolRow}
                    onPress={() => openToolModal(item.key as Exclude<ReadingModal, 'none' | 'tools'>)}
                  >
                    <Text style={styles.toolIcon}>{item.icon}</Text>
                    <Text style={styles.toolText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.primaryButton, styles.downloadButton]}
                  onPress={handleSaveOffline}
                  disabled={savingOffline || isOfflineDownloaded}
                >
                  {savingOffline ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {isOfflineDownloaded ? 'Downloaded for Offline' : 'Download Chapter'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {activeModal !== 'tools' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{activeModal.toUpperCase()}</Text>
                  <TouchableOpacity onPress={closeAllModals} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {activeModal === 'analyze' && (
                    <View>
                      <Text style={styles.sectionTitle}>Summary</Text>
                      <Text style={styles.modalText}>{summary || 'No summary available.'}</Text>

                      <Text style={styles.sectionTitle}>Tone</Text>
                      <Text style={styles.modalText}>{tone || 'Unknown tone.'}</Text>

                      <Text style={styles.sectionTitle}>Themes</Text>
                      {themes.length > 0 ? themes.map((theme) => <Text key={theme} style={styles.bulletItem}>• {theme}</Text>) : <Text style={styles.modalText}>No themes identified.</Text>}

                      <Text style={styles.sectionTitle}>Deep Insights</Text>
                      {chapterInsights.length > 0 ? (
                        chapterInsights.map((insight, idx) => (
                          <View key={idx} style={styles.insightCard}>
                            <Text style={styles.modalText}>{insight}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.modalText}>No deep insights for this chapter yet.</Text>
                      )}
                    </View>
                  )}

                  {activeModal === 'cast' && (
                    <View>
                      {characters.length > 0 ? (
                        characters.map((char, idx) => (
                          <View key={idx} style={styles.characterCard}>
                            <Text style={styles.characterName}>{char.name || 'Unknown'}</Text>
                            {!!char.description && <Text style={styles.modalText}>{char.description}</Text>}
                            {!!char.relationship && <Text style={styles.characterRelationship}>{char.relationship}</Text>}
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
                      {notes.length === 0 && <Text style={styles.modalText}>No notes yet.</Text>}
                      {notes.map((note, idx) => (
                        <View key={note.id || note._id || idx} style={styles.noteItem}>
                          <View style={styles.noteTextWrap}>
                            <Text style={styles.modalText}>{note.note || note.text}</Text>
                            <Text style={styles.mutedMeta}>Chapter {note.chapterNumber} • Page {note.pageNumber || '-'}</Text>
                          </View>
                          <TouchableOpacity onPress={() => handleDeleteNote(note.id || note._id)}>
                            <Text style={styles.deleteText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {activeModal === 'saved' && (
                    <View>
                      <TouchableOpacity style={styles.primaryButton} onPress={handleAddBookmark}>
                        <Text style={styles.primaryButtonText}>Save Current Page</Text>
                      </TouchableOpacity>

                      <Text style={styles.sectionTitle}>Bookmarks</Text>
                      {bookmarks.length === 0 && <Text style={styles.modalText}>No bookmarks yet.</Text>}
                      {bookmarks.map((bm, idx) => (
                        <View key={bm.id || bm._id || idx} style={styles.noteItem}>
                          <Text style={styles.modalText}>Chapter {bm.chapterNumber} • Page {bm.pageNumber}</Text>
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
                            style={styles.tocItem}
                            onPress={() => {
                              if (!chap.isUnlocked) return;
                              setChapterNumber(chap.chapterNumber);
                              fetchChapter(chap.chapterNumber, 1);
                              closeAllModals();
                            }}
                          >
                            <Text style={[styles.tocItemText, !chap.isUnlocked && styles.lockedToc]}>
                              Chapter {chap.chapterNumber}: {chap.title}
                            </Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={styles.modalText}>Loading Table of Contents...</Text>
                      )}
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ReadingPage;
