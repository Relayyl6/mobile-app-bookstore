import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useAppContext } from '@/context/useAppContext'
import styles from '@/constants/popup.style'
import { contextOptions, fileTypes } from '@/constants/data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface AttachmentPopupProps {
  visible: boolean
  onClose: () => void
  onConfirm: (selectedItems: { fileTypes: FileType[]; contexts: AIContext[] }) => void
  // Position of the attach button (pass this from the chat screen)
  buttonPosition?: { x: number; y: number }
}

const AttachmentPopup = ({ 
  visible, 
  onClose, 
  onConfirm,
  buttonPosition = { x: 20, y: 600 } // Default fallback position
}: AttachmentPopupProps) => {
  const { colors } = useAppContext()
  const [selectedFileTypes, setSelectedFileTypes] = useState<FileType[]>([])
  const [selectedContexts, setSelectedContexts] = useState<AIContext[]>([])
  const scaleAnim = useRef(new Animated.Value(0)).current

  // -----------------------------------------------------------------------
  // Animation
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start()
    } else {
      scaleAnim.setValue(0)
    }
  }, [visible])


  

  

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------
  const toggleFileType = (type: FileType) => {
    setSelectedFileTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    )
  }

  const toggleContext = (context: AIContext) => {
    setSelectedContexts((prev) =>
      prev.includes(context)
        ? prev.filter((c) => c !== context)
        : [...prev, context]
    )
  }

  const handleConfirm = () => {
    if (selectedFileTypes.length === 0 && selectedContexts.length === 0) {
      onClose()
      return
    }

    // Pass selections to parent
    onConfirm({
      fileTypes: selectedFileTypes,
      contexts: selectedContexts,
    })
    
    // Don't reset here - let parent decide when to reset
    // The parent will call onClose after handling the selections
  }

  const handleClose = () => {
    setSelectedFileTypes([])
    setSelectedContexts([])
    onClose()
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={handleClose}
      >
        {/* Popup anchored near button */}
        <Animated.View
            style={[
              styles.popupContainer,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                position: 'absolute',
                bottom: 0, // Fixed position above the input bar
                left: 16,
                right: 16,
                marginBottom: 150,
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Add Context
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={22} color={colors.placeholderText} />
            </TouchableOpacity>
          </View>

          {/* File Types Row */}
          <View style={styles.fileTypesRow}>
            {fileTypes.map((type) => {
              const isSelected = selectedFileTypes.includes(type.id)
              return (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => toggleFileType(type.id)}
                  style={[
                    styles.fileTypeButton,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={type.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={isSelected ? '#FFFFFF' : colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.fileTypeLabel,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isSelected ? '600' : '400',
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Selected Items Display */}
          {(selectedFileTypes.length > 0 || selectedContexts.length > 0) && (
            <View style={styles.selectedItemsContainer}>
              <View style={styles.selectedItemsWrapper}>
                {/* File types badges */}
                {selectedFileTypes.map((type) => (
                  <View
                    key={type}
                    style={[
                      styles.selectedBadge,
                      { backgroundColor: colors.primary + '20' }
                    ]}
                  >
                    <Ionicons 
                      name={
                        type === 'photo' ? 'image' :
                        type === 'video' ? 'videocam' :
                        type === 'document' ? 'document-text' :
                        'musical-notes'
                      } 
                      size={12} 
                      color={colors.primary} 
                    />
                    <Text style={[styles.selectedBadgeText, { color: colors.primary }]}>
                      {type}
                    </Text>
                  </View>
                ))}
                
                {/* Context badges */}
                {selectedContexts.map((context) => (
                  <View
                    key={context}
                    style={[
                      styles.selectedBadge,
                      { backgroundColor: colors.primary + '15' }
                    ]}
                  >
                    <Ionicons name='settings-outline' size={12} color={colors.primary} />
                    <Text style={[styles.selectedBadgeText, { color: colors.primary }]}>
                      {context.replace('-', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* AI Context Options - Scrollable */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            AI Processing
          </Text>
          <ScrollView
            style={styles.contextScrollView}
            showsVerticalScrollIndicator={false}
          >
            {contextOptions.map((option) => {
              const isSelected = selectedContexts.includes(option.id)
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => toggleContext(option.id)}
                  style={[
                    styles.contextItem,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + '15'
                        : 'transparent',
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={styles.contextLeft}>
                    <View
                      style={[
                        styles.contextIcon,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.border + '40',
                        },
                      ]}
                    >
                      <Ionicons
                        name={option.icon as keyof typeof Ionicons.glyphMap}
                        size={16}
                        color={isSelected ? '#FFFFFF' : colors.primary}
                      />
                    </View>
                    <View style={styles.contextTextContainer}>
                      <Text
                        style={[
                          styles.contextLabel,
                          {
                            color: isSelected ? colors.primary : colors.textPrimary,
                            fontWeight: isSelected ? '600' : '500',
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[
                          styles.contextDescription,
                          { color: colors.placeholderText },
                        ]}
                      >
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {/* Footer with selection count and confirm */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <View style={styles.selectionSummary}>
              {selectedFileTypes.length > 0 && (
                <View
                  style={[
                    styles.summaryBadge,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Text
                    style={[styles.summaryText, { color: colors.primary }]}
                  >
                    {selectedFileTypes.length} file type{selectedFileTypes.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {selectedContexts.length > 0 && (
                <View
                  style={[
                    styles.summaryBadge,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Text
                    style={[styles.summaryText, { color: colors.primary }]}
                  >
                    {selectedContexts.length} context{selectedContexts.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                {
                  backgroundColor:
                    selectedFileTypes.length > 0 || selectedContexts.length > 0
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.confirmText,
                  {
                    color:
                      selectedFileTypes.length > 0 || selectedContexts.length > 0
                        ? '#FFFFFF'
                        : colors.placeholderText,
                  },
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pointer triangle */}
          <View
            style={[
              styles.pointer,
              {
                borderTopColor: colors.cardBackground,
                left: 24, // Align with attach button
              },
            ]}
          />
        </Animated.View>
      </Pressable>
    </Modal>
  )
}



export default AttachmentPopup