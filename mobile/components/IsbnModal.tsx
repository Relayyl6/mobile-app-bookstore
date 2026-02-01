import { View, Text, Modal, Pressable } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
import createStyles from '@/constants/create.styles'
import { useAppContext } from '@/context/useAppContext'
import { formatISBN13 } from '@/constants/data'

const ISBNModal = ({
    isbn,
    showIsbnModal,
    setShowIsbnModal
}: {
    isbn: string
    showIsbnModal: boolean,
    setShowIsbnModal: Dispatch<SetStateAction<boolean>>
}) => {
    const { colors } = useAppContext()
    const styles = createStyles(colors)
  return (
    <Modal
          transparent
          animationType="fade"
          visible={showIsbnModal}
          onRequestClose={() => setShowIsbnModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>

              {/* Title */}
              <Text style={styles.modalTitle}>
                ISBN Registered
              </Text>

              {/* Subtitle */}
              <Text style={styles.modalSubtitle}>
                This book has been assigned the following ISBN
              </Text>

              {/* ISBN */}
              <View style={styles.isbnBox}>
                <Text
                  style={styles.isbnText}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {formatISBN13(isbn)}
                </Text>
              </View>

              {/* Actions */}
              <Pressable
                style={styles.modalButton}
                onPress={() => setShowIsbnModal(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </Pressable>

            </View>
          </View>
        </Modal>
  )
}

export default ISBNModal