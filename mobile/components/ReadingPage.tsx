import readStyles from "@/constants/read.styles";
import { useAppContext } from "@/context/useAppContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/components/ApiHandler";
import Skeleton, { ReadingPageSkeleton } from '@/components/SkeletonLoaders'


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

const ReadingPage: React.FC<ReadingPageProps> = ({
  onBack,
  onSettings,
  onCast,
  onAnalyze,
  onNotes,
  onSaved,
  initialChapter,
  bookId
}) => {
  const { colors } = useAppContext();
  const styles = readStyles(colors);
  const router = useRouter();

  type Page = {
    text?: string | null;
    pageNumber?: number | null;
  };
  type Character = {
    name?: string | null;
    description?: string | null;
    relationship?: string | null;
  }

  // --- STATES ---
  const [chapterNumber, setChapterNumber] = useState(initialChapter);
  const [chapterTitle, setChapterTitle] = useState("");
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  // New states for the extra chapter data
  const [summary, setSummary] = useState("");
  const [themes, setThemes] = useState<string[]>([]);
  const [tone, setTone] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [maxUnlockedChapter, setMaxUnlockedChapter] = useState(1);

  const [timeRemaining, setTimeRemaining] = useState("...");
  const [loading, setLoading] = useState(true);

  // Tracks which modal content to show
  const [activeModal, setActiveModal] = useState<"none" | "cast" | "analyze" | "notes" | "saved" | "toc">("none");

  // Data states for API fetches
  const [tocData, setTocData] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState("");

    // Add this near your other state/hooks
  const paragraphs = useMemo(() => {
    const rawText = pages[currentPageNumber - 1]?.text || "";
    
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
}, [pages, currentPageNumber]); // ← recalculates when page changes


  // ================= FETCH USER ANNOTATIONS =================
  const fetchUserAnnotations = async () => {
    try {
      const [notesRes, bookmarksRes] = await Promise.all([
        api.getNotes(bookId as string),
        api.getBookmarks(bookId as string)
      ]);

      if (notesRes && notesRes.success) {
        setNotes(notesRes.data?.notes || []);
      }

      if (bookmarksRes && bookmarksRes.success) {
        setBookmarks(bookmarksRes.data?.bookmarks || []);
      }
    } catch (err) {
      console.log("Failed to fetch notes and bookmarks:", err);
    }
  };

  // ================= INITIAL LOAD EFFECT =================
  useEffect(() => {
    if (bookId) {
      fetchUserAnnotations();
    }
  }, [bookId, chapterNumber]);

  // ================= FETCH TOC =================
  const openTableOfContents = async () => {
    setActiveModal("toc");
    try {
      const res = await api.getTableOfContents(bookId as string);
      if (res.success) {
        setTocData(res.data?.tableOfContents || []);
      }
    } catch (err) {
      console.log("Failed to fetch TOC", err);
    }
  };

  // ================= NOTES API HANDLERS =================
  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      const res = await api.addNote(bookId as string, { text: newNoteText, chapterNumber: chapterNumber, pageNumber: currentPageNumber });
      if (res.success) {
        setNotes(prevNotes => [res.data?.notes?.[0], ...prevNotes]);
      }
      setNewNoteText("");
    } catch (err) {
      console.log("Failed to add note", err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await api.deleteNote(bookId as string, noteId);
      if (res.success) {
        setNotes(res.data?.notes || []);
      }
    } catch (err) {
      console.log("Failed to delete note", err);
    }
  };

  // ================= BOOKMARK API HANDLERS =================
  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      await api.removeBookmark(bookId as string, bookmarkId);
      setBookmarks(prev => prev.filter(bm => bm.id !== bookmarkId));
    } catch (err) {
      console.log("Failed to remove bookmark", err);
    }
  };

  // ================= FETCH CHAPTER =================
  const fetchChapter = async (chapter: number, targetPage: number | "last" = 1) => {
    try {
      setLoading(true);
      // console.log("FETCHING CHAPTER:", chapter, "for bookId:", bookId); 
      const res = await api.getChapterContent(bookId as string, chapter);
      // console.log("PAGES COUNT:", res.data?.chapter?.pages?.length);
      // console.log("PAGES:", res.data?.chapter?.pages?.map((p: any) => p.pageNumber));

      if (!res.success) throw new Error(res.error);

      const chapterData = res.data?.chapter;
      const progressData = res.data?.userProgress;

      // console.log(chapterData)

      // Set Chapter Data
      setChapterTitle(chapterData?.title || `Chapter ${chapter}`);
      setPages(chapterData?.pages || []);
      setSummary(chapterData?.summary || "");
      setThemes(chapterData?.themes || []);
      setTone(chapterData?.tone || "");
      setCharacters(chapterData?.characters || []);

      // Set User Progress Data
      if (progressData) {
        setMaxUnlockedChapter(progressData.maxUnlockedChapter || 1);
      }

      // Determine which page to show
      const totalPages = chapterData?.pages?.length || 1;
      const startingPage = targetPage === "last" ? totalPages : targetPage;
      
      setCurrentPageNumber(startingPage);

      // Estimate time for the currently viewed page
      const initialPageText = chapterData?.pages?.[startingPage - 1]?.text || "";
      estimateReadingTime(initialPageText);

    } catch (err) {
      console.log("Chapter load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= ESTIMATE TIME =================
  const estimateReadingTime = (pageText: string) => {
    if (!pageText) return setTimeRemaining("0 min left");
    const words = pageText.split(/\s+/).length;
    const wordsPerMinute = 100;
    const minutes = Math.ceil(words / wordsPerMinute);
    setTimeRemaining(`${minutes} min left`);
  };

  // ================= TRACK PROGRESS =================
  useEffect(() => {
    const updateProgress = async () => {
      try {
        await api.updateReadingProgress(bookId as string, {
          currentChapter: chapterNumber,
          currentPage: currentPageNumber,
          progressPercentage: pages.length > 0 
            ? Math.round((currentPageNumber / pages.length) * 100) 
            : 0, 
        });
      } catch (err) {
        console.log("Progress update failed");
      }
    };

    if (!loading && pages.length > 0) {
      updateProgress();
    }
  }, [chapterNumber, currentPageNumber, loading, pages.length]);

  // ================= NAVIGATION =================
  const handleNext = () => {
    if (currentPageNumber < pages.length) {
      const nextPg = currentPageNumber + 1;
      console.log("GOING TO PAGE:", nextPg, "TEXT:", pages[nextPg - 1]?.text?.slice(0, 50));
      setCurrentPageNumber(nextPg);
      const nextPageText = pages[nextPg - 1]?.text || "";
      estimateReadingTime(nextPageText);
    } else {
      const nextChap = chapterNumber + 1;
      setChapterNumber(nextChap);
      fetchChapter(nextChap, 1);
    }
  };

  const handlePrevious = () => {
    if (currentPageNumber > 1) {
      const prevPg = currentPageNumber - 1;
      console.log("GOING TO PAGE:", prevPg, "TEXT:", pages[prevPg - 1]?.text?.slice(0, 50));
      setCurrentPageNumber(prevPg);
      const prevPageText = pages[prevPg - 1]?.text || "";
      estimateReadingTime(prevPageText);
    } else {
      if (chapterNumber === 1) return;
      const prevChap = chapterNumber - 1;
      setChapterNumber(prevChap);
      fetchChapter(prevChap, "last");
    }
  };

  // ================= LOAD INITIAL =================
  useEffect(() => {
    if (bookId) fetchChapter(chapterNumber);
  }, [bookId]);

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
      
      {/* Header */}
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
        {/* //@ts-ignore */}
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

      {/* Action Menu */}
      <View style={styles.actionMenu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal("cast")}>
          <View style={styles.menuIconContainer}><Text style={styles.menuIcon}>👥</Text></View>
          <Text style={styles.menuLabel}>CAST</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.analyzeButton]} onPress={() => setActiveModal("analyze")}>
          <View style={styles.menuIconContainer}><Text style={styles.menuIcon}>✨</Text></View>
          <Text style={[styles.menuLabel, styles.analyzeLabelText]}>Analyze</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal("notes")}>
          <View style={styles.menuIconContainer}><Text style={styles.menuIcon}>📝</Text></View>
          <Text style={styles.menuLabel}>NOTES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveModal("saved")}>
          <View style={styles.menuIconContainer}><Text style={styles.menuIcon}>🔖</Text></View>
          <Text style={styles.menuLabel}>SAVED</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Arrows */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navArrow, (chapterNumber === 1 && currentPageNumber === 1) && { opacity: 0.5 }]} 
          onPress={handlePrevious}
          disabled={chapterNumber === 1 && currentPageNumber === 1}
        >
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.aiAssistantButton} onPress={() =>
            router.push({
              pathname: "/chat",
              params: { bookId },
            })
          }>
          <Text style={styles.aiAssistantIcon}>✨</Text>
          <Text style={styles.aiAssistantText}>AI Assistant</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navArrow} onPress={handleNext}>
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <Modal
          visible={activeModal !== "none"}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setActiveModal("none")}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              {/* Dynamic Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{activeModal.toUpperCase()}</Text>
                <TouchableOpacity onPress={() => setActiveModal("none")} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                
                {/* === ANALYZE VIEW === */}
                {activeModal === "analyze" && (
                  <View>
                    <Text style={styles.sectionTitle}>Summary</Text>
                    <Text style={styles.modalText}>{summary || "No summary available."}</Text>
                    
                    <Text style={styles.sectionTitle}>Tone</Text>
                    <Text style={styles.modalText}>{tone || "Unknown tone."}</Text>

                    <Text style={styles.sectionTitle}>Themes</Text>
                    {themes && themes.length > 0 ? (
                      themes.map((t, idx) => (
                        <Text key={idx} style={styles.bulletItem}>• {t}</Text>
                      ))
                    ) : (
                      <Text style={styles.modalText}>No themes identified.</Text>
                    )}
                  </View>
                )}

                {/* === CAST VIEW === */}
                {activeModal === "cast" && (
                  <View>
                    {characters && characters.length > 0 ? (
                      characters.map((char, idx) => (
                        <View key={idx} style={styles.characterCard}>
                          <Text style={styles.characterName}>{char.name}</Text>
                          {char.description && (
                            <Text style={styles.modalText}>{char.description}</Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={styles.modalText}>No characters listed for this chapter.</Text>
                    )}
                  </View>
                )}

                {/* === NOTES VIEW === */}
                {activeModal === "notes" && (
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
                        <Text style={styles.modalText}>{note.text}</Text>
                        <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* === SAVED VIEW === */}
                {activeModal === "saved" && (
                  <View>
                    <Text style={styles.sectionTitle}>Bookmarks</Text>
                    {bookmarks.map((bm, idx) => (
                      <View key={idx} style={styles.noteItem}>
                        <Text style={styles.modalText}>Chapter {bm.chapter} - Page {bm.page}</Text>
                        <TouchableOpacity onPress={() => handleRemoveBookmark(bm.id)}>
                          <Text style={styles.deleteText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* === TOC VIEW === */}
                {activeModal === "toc" && (
                  <View>
                    {tocData.length > 0 ? (
                      tocData.map((chap, idx) => (
                        <TouchableOpacity 
                          key={idx} 
                          style={styles.tocItem}
                          onPress={() => {
                            setChapterNumber(chap.chapterNumber);
                            fetchChapter(chap.chapterNumber, 1);
                            setActiveModal("none");
                          }}
                        >
                          <Text style={styles.tocItemText}>Chapter {chap.chapterNumber}: {chap.title}</Text>
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
  );
};

export default ReadingPage;