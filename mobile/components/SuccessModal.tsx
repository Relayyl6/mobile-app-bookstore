import { View, Text, Modal, Pressable } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
import { useAppContext } from '@/context/useAppContext'
import createStyles from '@/constants/create.styles'

const SuccessModal = ({
    showSuccessModal,
    setShowSuccessModal
}: {
    showSuccessModal: boolean,
    setShowSuccessModal: Dispatch<SetStateAction<boolean>>
}) => {
    const { colors } = useAppContext()
    const styles = createStyles(colors)
  return (
    <Modal
          transparent
          animationType="fade"
          visible={showSuccessModal}
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>

              {/* Title */}
              <Text style={styles.modalTitle}>
                Action Completed
              </Text>

              {/* Subtitle */}
              <Text style={styles.modalSubtitle}>
                This book has been successfully created
              </Text>

              {/* Actions */}
              <Pressable
                style={styles.modalButton}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </Pressable>

            </View>
          </View>
        </Modal>
  )
}

export default SuccessModal