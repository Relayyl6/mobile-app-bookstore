import readStyles from "@/constants/read.styles";
import { useAppContext } from "@/context/useAppContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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

interface ReadingPageProps {
  onBack: () => void
  onSettings: () => void
  onSaved: () => void
  onAnalyze: () => void
  onNotes: () => void
  onCast: () => void 
}

const ReadingPage: React.FC<ReadingPageProps> = ({
  onBack,
  onSettings,
  onCast,
  onAnalyze,
  onNotes,
  onSaved,
}) => {
  const { colors, bookId } = useAppContext();
  const styles = readStyles(colors);
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialChapter = Number(params.chapter) || 1;

    // Define the Page type based on your schema
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

  // --- NEW STATES ---
  // Tracks which modal content to show
  const [activeModal, setActiveModal] = useState<"none" | "cast" | "analyze" | "notes" | "saved" | "toc">("none");

  // Data states for API fetches
  const [tocData, setTocData] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]); // Populate this with actual notes data if available
  const [bookmarks, setBookmarks] = useState<any[]>([]); // Populate with actual bookmarks
  const [newNoteText, setNewNoteText] = useState("");


  // ================= FETCH USER ANNOTATIONS =================
  const fetchUserAnnotations = async () => {
    try {
      // Fetch both simultaneously to save time using Promise.all
      const [notesRes, bookmarksRes] = await Promise.all([
        api.getNotes(bookId as string),       // Assumes this endpoint exists
        api.getBookmarks(bookId as string)    // Assumes this endpoint exists
      ]);

      // Update Notes State
      if (notesRes && notesRes.success) {
        // If you only want to show notes for the CURRENT chapter, filter them here:
        // const chapterNotes = notesRes.data.filter(note => note.chapter === chapterNumber);
        // setNotes(chapterNotes);
        
        // Otherwise, set all notes:
        setNotes(notesRes.notes || []); 
      }

      // Update Bookmarks State
      if (bookmarksRes && bookmarksRes.success) {
        setBookmarks(bookmarksRes.bookmarks || []);
      }
    } catch (err) {
      console.log("Failed to fetch notes and bookmarks:", err);
    }
  };

  // ================= INITIAL LOAD EFFECT =================
  // Run this when the component mounts, or when the bookId/chapterNumber changes
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
        setTocData(res.tableOfContents);
      }
    } catch (err) {
      console.log("Failed to fetch TOC", err);
    }
  };

  // ================= NOTES API HANDLERS =================
  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      await api.addNote(bookId as string, { text: newNoteText, chapterNumber: chapterNumber, pageNumber: currentPageNumber });
      if (res.success && res.data) {
        setNotes(prevNotes => [res.notes[0], ...prevNotes]);
      }
      setNewNoteText("");
      // Refresh notes list here if your API returns it, or append locally
    } catch (err) {
      console.log("Failed to add note", err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.deleteNote(bookId as string, noteId);
      // Remove note from local state here
    } catch (err) {
      console.log("Failed to delete note", err);
    }
  };

  // ================= BOOKMARK API HANDLERS =================
  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      await api.removeBookmark(bookId as string, bookmarkId);
      // Remove bookmark from local state here
    } catch (err) {
      console.log("Failed to remove bookmark", err);
    }
  };

  // ================= FETCH CHAPTER =================
  // Note: Added `targetPage` so when navigating backward from Chapter 2 to 1, 
  // it starts you on the *last* page of Chapter 1 instead of page 1.
  const fetchChapter = async (chapter: number, targetPage: number | "last" = 1) => {
    try {
      setLoading(true);

      const res = await api.getChapterContent(bookId as string, chapter);

      if (!res.success) throw new Error(res.error);

      const chapterData = res.chapter;
      const progressData = res.userProgress;

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
  // Use a useEffect to trigger this whenever the chapter or page changes
  useEffect(() => {
    const updateProgress = async () => {
      try {
        await api.updateReadingProgress(bookId as string, {
          currentChapter: chapterNumber,
          currentPage: currentPageNumber,
          // Calculate progress based on page / total pages
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
      // 1. Next Page (Same Chapter)
      const nextPg = currentPageNumber + 1;
      setCurrentPageNumber(nextPg);
      
      const nextPageText = pages[nextPg - 1]?.text || "";
      estimateReadingTime(nextPageText);
    } else {
      // 2. Next Chapter (Starts at Page 1)
      const nextChap = chapterNumber + 1;
      setChapterNumber(nextChap);
      fetchChapter(nextChap, 1);
    }
  };

  const handlePrevious = () => {
    if (currentPageNumber > 1) {
      // 1. Previous Page (Same Chapter)
      const prevPg = currentPageNumber - 1;
      setCurrentPageNumber(prevPg);
      
      const prevPageText = pages[prevPg - 1]?.text || "";
      estimateReadingTime(prevPageText);
    } else {
      // 2. Previous Chapter (Starts at the Last Page)
      if (chapterNumber === 1) return; // Can't go back further than Ch 1 Pg 1
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
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
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

      {/* Reading Content */}
      {/* ---------------- GET CURRENT PAGE TEXT ---------------- */}
      {/* Safely get the text, split by newlines, and remove empty strings */}
      {(() => {
        const rawText = pages[currentPageNumber - 1]?.text || "";
        const currentParagraphs = rawText.split("\n").filter(p => p.trim() !== "");

        return (
          <>
            {/* ---------------- READING CONTENT ---------------- */}
            <ScrollView 
              style={styles.contentContainer}
              contentContainerStyle={styles.contentInner}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.chapterTitle}>{chapterTitle}</Text>
              
              {/* Render Paragraphs for the current page */}
              {currentParagraphs.map((paragraph, index) => (
                <Text key={index} style={styles.paragraph}>
                  {index === 0 && (
                    <Text style={styles.dropCap}>
                      {paragraph.charAt(0)}
                    </Text>
                  )}
                  {index === 0 ? paragraph.slice(1) : paragraph}
                </Text>
              ))}
            </ScrollView>
          </>
        );
      })()}

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
      {/* ---------------- NAVIGATION ARROWS ---------------- */}
      <View style={styles.navigationContainer}>
        {/* Disable previous button if on Chapter 1, Page 1 */}
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
                          <Text style={styles.characterName}>{char}</Text>
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
                    {/* Map over your 'notes' array here */}
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
                    {/* Map over your 'bookmarks' array here */}
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
