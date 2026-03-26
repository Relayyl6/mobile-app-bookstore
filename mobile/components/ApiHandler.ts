import { EXPO_PUBLIC_API_URL } from '../store/api'
import { useAuthStore } from '../store/authStore'

/* ======================================================
   API HANDLER
====================================================== */

class ApiHandler {
  private getToken(): string | null {
    const { token } = useAuthStore.getState()
    return token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = this.getToken()
      const url = `${EXPO_PUBLIC_API_URL}${endpoint}`

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })
      // console.log("URL:", url, "STATUS:", response.status)
      let data: any = {}
      try {
        data = await response.json()
      } catch {
        // server returned HTML (like a 403 page)
        data = { error: `Server error: ${response.status}` }
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${response.status}`)
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /* ======================================================
     PART 1: BOOK CATALOG
  ====================================================== */

  async createBook(data: any) {
    return this.request('/api/v1/books', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getBooks(page = 1, limit = 10) {
    return this.request(`/api/v1/books?page=${page}&limit=${limit}`)
  }

  async getBookById(bookId: string) {
    return this.request(`/api/v1/books/${bookId}`)
  }

  async updateBook(bookId: string, updates: any) {
    return this.request(`/api/v1/books/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteBook(bookId: string) {
    return this.request(`/api/v1/books/${bookId}`, {
      method: 'DELETE',
    })
  }

  async toggleVisibility(bookId: string) {
    return this.request(`/api/v1/books/${bookId}/visibility`, {
      method: 'PATCH',
    })
  }

  async searchBooks(bookId: string, query: string) {
    return this.request(`/api/v1/books/search?question=${query}&id=${bookId}`)
  }

  /* ======================================================
     PART 2: CONTENT MANAGEMENT
  ====================================================== */

  async uploadBookContent(bookId: string, formData: FormData) {
    const token = this.getToken()
    const url = `${EXPO_PUBLIC_API_URL}/api/v1/books/${bookId}/content`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.error || 'Upload failed')
    }

    return { success: true, data }
  }

  async deleteBookContent(bookId: string) {
    return this.request(`/api/v1/books/${bookId}/content`, {
      method: 'DELETE',
    })
  }

  async getReadingLibrary(page = 1): Promise<ApiResponse<ReadingLibraryResponse>> {
    return this.request(`/api/v1/books/reading/library?page=${page}`)
  }

  /* ======================================================
     PART 3: USER INTERACTIONS
  ====================================================== */

  async trackBookView(bookId: string) {
    return this.request(`/api/v1/books/${bookId}/view`, {
      method: 'POST',
    })
  }

  async trackBookPurchase(bookId: string) {
    return this.request(`/api/v1/books/${bookId}/purchase`, {
      method: 'POST',
    })
  }

  async addOrUpdateRating(data: {
    bookId: string
    rating: number
    review?: string
  }) {
    return this.request(`/api/v1/books/ratings`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteRating(bookId: string) {
    return this.request(`/api/v1/books/${bookId}/ratings`, {
      method: 'DELETE',
    })
  }

  /* ======================================================
     PART 4: RECOMMENDATIONS
  ====================================================== */

  async getPersonalizedRecommendations(limit = 10): Promise<ApiResponse<RecommendationResponse>> {
    return this.request(
      `/api/v1/books/recommendations/personalized?limit=${limit}`
    )
  }

  async getSimilarBooks(bookId: string, limit = 5): Promise<ApiResponse<SimilarBooksResponse>> {
    return this.request(
      `/api/v1/books/${bookId}/similar?limit=${limit}`
    )
  }

  async getPopularBooks(limit = 10): Promise<ApiResponse<PopularBooksResponse>> {
    return this.request(
      `/api/v1/books/recommendations/popular?limit=${limit}`
    )
  }

  async getNewBooks(limit = 10): Promise<ApiResponse<NewBooksResponse>> {
    return this.request(
      `/api/v1/books/recommendations/new?limit=${limit}`
    )
  }

  /* ======================================================
     PART 5: AI FEATURES
  ====================================================== */

  async describeImage<T>(data: {
    imageBase64: string
    title?: string
    caption?: string
    author?: string
  }): Promise<ApiResponse<T>> {
    return this.request(`/api/v1/books/ai/describe-image`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async sendChatMessage<T>(
    userId: string,
    bookId: string | null,
    message: string,
    systemInstruction?: string
  ): Promise<ApiResponse<T>> {
    return this.request('/api/v1/books/chat', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        bookId,
        message,
        systemInstruction,
      }),
    })
  }

  async getChatHistory(userId: string, bookId: string) {
    return this.request(`/api/v1/books/chat/${userId}/${bookId}`)
  }

  async clearChatHistory(userId: string, bookId: string) {
    return this.request(`/api/v1/books/chat/${userId}/${bookId}`, {
      method: 'DELETE',
    })
  }

  async updateAIPreferences(
    userId: string,
    bookId: string,
    preferences: {
      tonePreference?: string
      maxSpoilerChapterAllowed?: number
    }
  ) {
    return this.request(
      `/api/v1/books/ai/preferences/${userId}/${bookId}`,
      {
        method: 'PUT',
        body: JSON.stringify(preferences),
      }
    )
  }

  /* ======================================================
     PART 6: READING PROGRESS
  ====================================================== */

  async getReadingState(bookId: string) {
    return this.request(`/api/v1/books/${bookId}/reading/state`)
  }

  async updateReadingProgress(
    bookId: string,
    data: {
      currentChapter: number
      currentPage: number
      progressPercentage: number
    }
  ) {
    return this.request(`/api/v1/books/${bookId}/reading/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getChapterContent(bookId: string, chapterNumber: number): Promise<ApiResponse<ChapterContentResponse>> {
    return this.request(
      `/api/v1/books/${bookId}/chapters/${chapterNumber}`
    )
  }

  async getPageContent(
    bookId: string,
    chapterNumber: number,
    pageNumber: number
  ) {
    return this.request(
      `/api/v1/books/${bookId}/chapters/${chapterNumber}/pages/${pageNumber}`
    )
  }

  async getTableOfContents(bookId: string): Promise<ApiResponse<TableOfContentsResponse>> {
    return this.request(`/api/v1/books/${bookId}/table-of-contents`)
  }

  /* ======================================================
     PART 7: BOOKMARKS & NOTES
  ====================================================== */

  async addBookmark(bookId: string, data: any) {
    return this.request(`/api/v1/books/${bookId}/bookmarks`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async removeBookmark(bookId: string, bookmarkId: string) {
    return this.request(
      `/api/v1/books/${bookId}/bookmarks/${bookmarkId}`,
      { method: 'DELETE' }
    )
  }

  async addNote(bookId: string, data: any): Promise<ApiResponse<AddNoteResponse>> {
    return this.request(`/api/v1/books/${bookId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateNote(bookId: string, noteId: string, note: string) {
    return this.request(
      `/api/v1/books/${bookId}/notes/${noteId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ note }),
      }
    )
  }

  async deleteNote(bookId: string, noteId: string): Promise<ApiResponse<AddNoteResponse>> {
    return this.request(
      `/api/v1/books/${bookId}/notes/${noteId}`,
      { method: 'DELETE' }
    )
  }

  async getBookmarks(bookId: string): Promise<ApiResponse<BookmarksResponse>> {
    return this.request(`/api/v1/books/${bookId}/bookmarks`, {
      method: 'GET',
    })
  }

  async getNotes(bookId: string): Promise<ApiResponse<NotesResponse>> {
    return this.request(`/api/v1/books/${bookId}/notes`, {
      method: 'GET',
    })
  }

  /* ======================================================
     PART 8: CHARACTERS & STATISTICS
  ====================================================== */

  async getCharacters(bookId: string) {
    return this.request(`/api/v1/books/${bookId}/characters`)
  }

  async trackCharacterView(bookId: string, characterName: string) {
    return this.request(
      `/api/v1/books/${bookId}/characters/track-view`,
      {
        method: 'POST',
        body: JSON.stringify({ characterName }),
      }
    )
  }

  async getReadingStatistics() {
    return this.request(`/api/v1/books/reading/statistics`)
  }
}

export const api = new ApiHandler()