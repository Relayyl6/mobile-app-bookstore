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
} from 'react-native'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import createStyles from '@/constants/create.styles'
import { useAppContext } from '@/context/useAppContext'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import AttachmentPopup from '@/components/PopUp'
import { pickFile, pickImage, uploadFile } from '@/constants/utils'
import * as DocumentPicker from 'expo-document-picker'
import { useAuthStore } from '@/store/authStore'


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
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const { userId: contextUserId, bookId: contextBookId, setUserId } = useAppContext()
  const { user } = useAuthStore()

  useEffect(() => {
    setUserId(user.id)
  }, [])

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
  }, [])

  // -----------------------------------------------------------------------
  // Send logic  (replace the body of simulateAIResponse with real
  // MCP / API call later — the shape stays the same)
  // -----------------------------------------------------------------------
  const simulateAIResponse = async (userText: string): Promise<string> => {
    // TODO: swap this out for your actual MCP endpoint / Anthropic API call
    // that receives the uploaded book context + userText and returns an answer.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `Here's what I found based on your book context regarding "${userText}". ` +
          `(This is a placeholder — wire up your MCP call here.)`
        )
      }, 1200)
    })
  }

  const hanbleFileUpload = async () => {
    
  }

  const handleAttachmentConfirm = async (selectedItems: {
    fileTypes: FileType[]
    contexts: AIContext[]
  }) => {
    // Store the selected items for when we send the message
    setPendingAttachments(selectedItems)
    
    // Close the popup first
    setShowAttachmentPopup(false)

    // Now trigger the appropriate pickers based on selected file types
    try {
      if (selectedItems.fileTypes.includes('photo')) {
        await pickImage(imageBase64, setImage, setImageBase64)
      }
      if (selectedItems.fileTypes.includes('video')) {
        // Alert.alert('Video picker', 'Wire up expo-image-picker for videos here')
        await pickImage(imageBase64, setImage, setImageBase64)
      }
      if (selectedItems.fileTypes.includes('document')) {
        // Alert.alert('Document picker', 'Wire up expo-document-picker here')
        await pickFile(setFile);
      }
      if (selectedItems.fileTypes.includes('audio')) {
        Alert.alert('Audio picker', 'Wire up expo-document-picker for audio here')
      }
      
      // If no file types selected, just store the contexts
      if (selectedItems.fileTypes.length === 0 && selectedItems.contexts.length > 0) {
        // Just context, no files - that's fine
      }
    } catch (error) {
      console.error('File picker error:', error)
      Alert.alert('Error', 'Failed to pick file')
      setPendingAttachments(null)
    }
  }

  const handleSend = async () => {
    const trimmed = inputText.trim()
    if (!trimmed || isLoading) return
    // console.log(pendingAttachments)
    // 1. Append user message
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
    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsLoading(true)
    scrollToBottom()

    try {
      // 2. Get AI response
      // @ts-ignore
      let finalUserId = contextUserId;
      let finalBookId = contextBookId;
          
      if (pendingAttachments?.fileTypes.length !== 0) {
        const result = await uploadFile(file, userMsg, image);
        console.log(result)
        // 2. Only override if result exists (isn't null/void)
        if (result) {
          finalUserId = result.userId;
          finalBookId = result.bookId;
        }
      }
      
      // 3. Use the "final" variables in your next request
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/books/chat`, { 
        method: 'POST', 
        body: JSON.stringify({ 
          userId: finalUserId, 
          bookId: finalBookId, 
          message: userMsg?.text  
        }) 
      });
      if (!response.ok) {
        console.error("An error occured while getting the cht result")
      }
      const { result: aiText } = await response.json()
      // const aiText = await simulateAIResponse(trimmed)

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: aiText,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      scrollToBottom()
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
      {/* Outer card wrapper */}
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
        {/* ----------------------------------------------------------- */}
        {/* Header                                                       */}
        {/* ----------------------------------------------------------- */}
        <View style={[styles.header, { paddingTop: 12, marginBottom: 12 }]}>
          <Text style={[styles.title, { textAlign: 'center' }]}>Yemeul Chat</Text>
          <Text style={[styles.subtitle, { textAlign: 'center' }]}>
            Chat with your book, Literally
          </Text>
        </View>

        {/* Thin divider under header */}
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginHorizontal: 12,
            marginBottom: 4,
          }}
        />

        {/* ----------------------------------------------------------- */}
        {/* Message list                                                 */}
        {/* ----------------------------------------------------------- */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          keyboardDismissMode='on-drag'
          showsVerticalScrollIndicator={false}
        >
          {/* Empty state */}
          {messages.length === 0 && (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
              <Ionicons
                name='book-outline'
                size={40}
                color={colors.placeholderText}
              />
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
                Upload a book (text, image, or file) and ask anything about it.
              </Text>
            </View>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user'
            return (
              <View
                key={msg.id}
                style={{
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Bubble */}
                <View
                  style={{
                    maxWidth: '85%',
                    backgroundColor: isUser ? colors.primary : colors.cardBackground,
                    borderRadius: 16,
                    borderBottomRightRadius: isUser ? 4 : 16,
                    borderBottomLeftRadius: isUser ? 16 : 4,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    ...(isUser
                      ? {}
                      : {
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

                {/* Timestamp */}
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
                <ActivityIndicator size='small' color={colors.primary} />
                <Text style={{ color: colors.placeholderText, fontSize: 13 }}>
                  Thinking…
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* // input */}
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
              gap: 8,
            }}
          >
          {/* Upload button with badge indicator */}
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
              <Ionicons 
                name='attach-outline' 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
            {pendingAttachments && 
             (pendingAttachments.fileTypes.length > 0 || pendingAttachments.contexts.length > 0) && (
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
            placeholder='Ask anything about your book…'
            placeholderTextColor={colors.placeholderText}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            multiline
            returnKeyType='send'
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
                inputText.trim() && !isLoading
                  ? colors.primary
                  : colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name='send-outline'
              size={18}
              color={inputText.trim() && !isLoading ? '#FFFFFF' : colors.placeholderText}
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