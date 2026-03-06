import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import createStyles from '@/constants/create.styles'
import { useAppContext } from '@/context/useAppContext'
import { Feather, Ionicons } from '@expo/vector-icons'
import AttachmentPopup from '@/components/PopUp'
import * as DocumentPicker from 'expo-document-picker'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/components/ApiHandler'
import {
  buildSystemInstruction,
  pickFile,
  pickImage,
  uploadFile,
  validateFile,
  validateImage,
  formatFileSize,
} from '@/constants/utils'

const Chat = () => {
  const { colors } = useAppContext()
  const styles = createStyles(colors)
  const scrollRef = useRef<ScrollView>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<{
    fileTypes: FileType[]
    contexts: AIContext[]
  } | null>(null)
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const { userId: contextUserId, bookId: contextBookId, setUserId, setBookId } = useAppContext()
  const { user } = useAuthStore()

  useEffect(() => {
    setUserId(user.id)
  }, [])

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
  }, [])

  const handleAttachmentConfirm = async (selectedItems: {
    fileTypes: FileType[]
    contexts: AIContext[]
  }) => {
    setPendingAttachments(selectedItems)
    setShowAttachmentPopup(false)

    try {
      if (selectedItems.fileTypes.includes('photo') || selectedItems.fileTypes.includes('video')) {
        const imageUrl = await pickImage(imageBase64, setImage, setImageBase64)
        if (imageUrl && imageBase64) {
          const validation = validateImage(imageBase64)
          if (!validation.valid) {
            Alert.alert('Invalid Image', validation.error || 'Image validation failed')
            setPendingAttachments(null)
            setImage(null)
            setImageBase64(null)
            return
          }
        }
      }
      
      if (selectedItems.fileTypes.includes('document')) {
        const pickedFile = await pickFile(setFile)
        if (pickedFile) {
          const validation = validateFile(pickedFile)
          if (!validation.valid) {
            Alert.alert('Invalid File', validation.error || 'File validation failed')
            setPendingAttachments(null)
            setFile(null)
            return
          }
          console.log(`✅ Valid file: ${pickedFile?.name} (${formatFileSize(pickedFile.size || 0)})`)
        }
      }
      
      if (selectedItems.fileTypes.includes('audio')) {
        Alert.alert('Audio picker', 'Audio upload feature coming soon!')
      }
    } catch (error) {
      console.error('File picker error:', error)
      Alert.alert('Error', 'Failed to pick file')
      setPendingAttachments(null)
      setFile(null)
      setImage(null)
      setImageBase64(null)
    }
  }

  const uploadFileToBackend = async (): Promise<{ userId: string; bookId: string } | null> => {
    if (!file && !imageBase64) return null

    console.log('📤 Starting file upload...')
    
    // Create a message object with contexts
    const messageData = {
      text: inputText.trim() || 'File upload',
      aiContexts: pendingAttachments?.contexts || [],
    }

    // Use the uploadFile utility
    const result = await uploadFile(file, messageData, imageBase64)

    if (result) {
      console.log('✅ Upload successful:', result)
      return {
        userId: result.userId,
        bookId: result.bookId,
      }
    } else {
      throw new Error('Upload failed - no result returned')
    }
  }

  const handleSend = async () => {
    const trimmed = inputText.trim()
    if (!trimmed || isLoading) return

    console.log('📤 Sending message:', trimmed)

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
      ...(pendingAttachments && {
        fileTypes: pendingAttachments.fileTypes,
        aiContexts: pendingAttachments.contexts,
      }),
    }

    const systemInstruction = buildSystemInstruction(userMsg?.aiContexts)

    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsLoading(true)
    scrollToBottom()

    try {
      let finalUserId = contextUserId
      let finalBookId = contextBookId

      console.log('👤 Initial IDs:', { finalUserId, finalBookId })

      // 📎 HANDLE FILE UPLOAD IF PRESENT
      if (pendingAttachments?.fileTypes?.length && (file || imageBase64)) {
        console.log('📎 Uploading attachment...')
        const uploadResult = await uploadFileToBackend()

        if (uploadResult) {
          finalUserId = uploadResult.userId
          finalBookId = uploadResult.bookId
          setBookId(uploadResult.bookId)
          console.log('📎 Upload complete:', uploadResult)
        }
      }

      // 💬 SEND CHAT MESSAGE
      console.log('💬 Sending chat request...')
      const chatResponse = await api.sendChatMessage(
        finalUserId as string,
        finalBookId,
        userMsg.text,
        systemInstruction
      )

      if (!chatResponse.success) {
        throw new Error(chatResponse.error || 'Chat request failed')
      }

      const aiText = chatResponse.data?.result || 'No response text returned.'
      console.log('🤖 AI reply:', aiText)

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: aiText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch (error: any) {
      console.error('🔥 CHAT SEND ERROR:', error)

      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: error.message || 'Something went wrong. Please try again.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      scrollToBottom()

      // Clear attachments
      setPendingAttachments(null)
      setFile(null)
      setImage(null)
      setImageBase64(null)
    }
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[
          {
            backgroundColor: colors.cardBackground,
            borderRadius: 8,
            margin: 8,
            flex: 1,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Header */}
        {/* <View style={[styles.header, { paddingTop: 12, marginBottom: 12 }]}>
          <Text style={[styles.title, { textAlign: 'center' }]}>Hello {user.username}</Text>
          <Text style={[styles.subtitle, { textAlign: 'center' }]}>
            Chat with your book, Literally
          </Text>
        </View> */}
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 10,
            margin: 8,
            backgroundColor: colors.cardBackground,
            borderRadius: 24,
          }}>
          <TouchableOpacity style={{ padding: 8 }}>
            <Feather name="settings" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Chat</Text>
          <TouchableOpacity style={{ padding: 8 }}>
            <Feather name="share-2" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginHorizontal: 12,
            marginBottom: 4,
          }}
        />

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Empty state */}
          {messages.length === 0 && (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
              <Ionicons name="book-outline" size={40} color={colors.placeholderText} />
              <Text
                style={{
                  color: colors.placeholderText,
                  marginTop: 10,
                  textAlign: 'center',
                  fontSize: 14,
                  lineHeight: 20,
                  paddingHorizontal: 24,
                }}
              >
                Upload a book (PDF, image, or document) and ask anything about it.
              </Text>
            </View>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user'
            return (
              <View key={msg.id} style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                <View
                  style={{
                    maxWidth: '85%',
                    backgroundColor: isUser ? colors.primary : colors.cardBackground,
                    borderRadius: 16,
                    borderBottomRightRadius: isUser ? 4 : 16,
                    borderBottomLeftRadius: isUser ? 16 : 4,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    ...(!isUser && {
                      shadowColor: colors.black,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }),
                  }}
                >
                  <Text
                    style={{
                      color: isUser ? '#FFFFFF' : colors.textDark,
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    {msg.text}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 11,
                    color: colors.placeholderText,
                    marginTop: 4,
                    paddingHorizontal: 4,
                  }}
                >
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            )
          })}

          {/* Typing indicator */}
          {isLoading && (
            <View style={{ alignItems: 'flex-start' }}>
              <View
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 16,
                  borderBottomLeftRadius: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ color: colors.placeholderText, fontSize: 13 }}>Thinking…</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          {/* Attachment preview */}
          {(file || image) && (
            <View
              style={{
                flexDirection: 'row',
                padding: 10,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                alignItems: 'center',
              }}
            >
              {image && (
                <Image
                  source={{ uri: image }}
                  style={{ width: 50, height: 50, borderRadius: 8, marginRight: 10 }}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 12 }}>
                  {file ? file.name : 'Image attached'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setFile(null)
                  setImage(null)
                  setImageBase64(null)
                  setPendingAttachments(null)
                }}
              >
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 }}>
            {/* Upload button */}
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                onPress={() => setShowAttachmentPopup(true)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: pendingAttachments
                    ? colors.primary + '20'
                    : colors.border + '40',
                }}
              >
                <Ionicons name="attach-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              {pendingAttachments &&
                (pendingAttachments.fileTypes.length > 0 ||
                  pendingAttachments.contexts.length > 0) && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: colors.primary,
                      borderWidth: 1.5,
                      borderColor: colors.cardBackground,
                    }}
                  />
                )}
            </View>

            {/* Text input */}
            <TextInput
              style={{
                flex: 1,
                minHeight: 40,
                maxHeight: 120,
                paddingHorizontal: 12,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.cardBackground,
                color: colors.textPrimary,
                fontSize: 14,
              }}
              placeholder="Ask about your book…"
              placeholderTextColor={colors.placeholderText}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              multiline
              returnKeyType="send"
              blurOnSubmit={false}
            />

            {/* Send button */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor:
                  inputText.trim() && !isLoading ? colors.primary : colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="send-outline"
                size={18}
                color={
                  inputText.trim() && !isLoading ? '#FFFFFF' : colors.placeholderText
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <AttachmentPopup
          visible={showAttachmentPopup}
          onClose={() => setShowAttachmentPopup(false)}
          onConfirm={handleAttachmentConfirm}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

export default Chat