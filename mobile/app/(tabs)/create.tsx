import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Pressable,
  Modal,
  ActivityIndicator
} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'expo-router';
import createStyles from '@/constants/create.styles';
import { useAppContext } from '@/context/useAppContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { formatISBN13, generateISBN13, GENRES } from '@/constants/data';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/store/authStore';
// import { GoogleGenAI } from "@google/genai";


const Create = () => {
  const [ title, setTitle ] = useState("");
  const [ subTitle, setSubTitle ] = useState("");
  const [ author, setAuthor ] = useState("");
  const [ caption, setCaption ] = useState("");
  const [ description, setDescription ] = useState<string | undefined>("");
  const [ genres, setGenres ] = useState<string[]>([]);
  const [ price, setPrice ] = useState("");
  const [ image, setImage ] = useState<string | null>(null); // to display the selected image
  const [ rating, setRating ] = useState(3);
  const [ isbn, setIsbn ] = useState("");
  const [ publishedYear, setPublishedYear ] = useState("");
  const [ imageBase64, setImageBase64 ] = useState<string | null>(null);

  // helper states
  const [ isLoading, setIsLoading ] = useState(false);
  const [ displayedGenresCount, setDisplayedGenresCount ] = useState(5);
  const [ showPicker, setShowPicker ] = useState(false);
  const [ showIsbnModal, setShowIsbnModal ] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore()
  const { colors } = useAppContext()
  const styles = createStyles(colors)

  const CURRENT_YEAR = new Date().getFullYear().toString();
  // const ai = new GoogleGenAI({})

  const autoFillTimer = useRef(null);
  
  useEffect(() => {
    // Only auto-fill if empty
    if (!publishedYear) {
      //@ts-ignore  
      autoFillTimer.current = setTimeout(() => {
        setPublishedYear(CURRENT_YEAR);
      }, 10000); // ⏱ 10 seconds
    }
  
    return () => {
      if (autoFillTimer.current) {
        clearTimeout(autoFillTimer.current);
      }
    };
  }, [publishedYear]);

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
          Alert.alert('Permission required', 'Permission to access the media library is required.');
         return;
        }
      }

      // launch the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);

        // if base64 is provided, use it
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64)
        } else { // otherwise convert to base 64 
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64
          })
          setImageBase64(base64)
        }
      }
    } catch {
      Alert.alert("Error", "An Unknown Error Occured when trying to pick an image")
    }
  }

  const handleSubmit = async () => {
    if (!title || !author || !caption || !genres || !image || !price || !rating) {
      Alert.alert("Error", "Please fill in teh empty fields")
    }

    try {
      setIsLoading(true)

      // const res = await fetch("https://your-api.com/describe-image", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ imageBase64 }),
      //   });


      // const data = await res.json();
      // setDescription(data.description);

      const uriParts = image?.split(".");
      const fileType = uriParts?.[uriParts?.length - 1]
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg"
    } catch (error) {
      console.error("an error occured", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : colors.textSecondary}
          />
        </TouchableOpacity>
      )
    }

    return <View style={styles.ratingContainer}>{stars}</View>
  } 


      
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>
          {/* // header */}
          <View style={styles.header}>
            <Text style={[styles.title, { textAlign: "center" }]}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}>Share your favorite reads with others</Text>
          </View>

            {/* // body  */}
          <View style={styles.form}>
            {/* // book title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Enter book title'
                  placeholderTextColor={colors.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>SubTitle</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons
                    name="bookmarks-sharp"
                    size={20}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter subtitle"
                    placeholderTextColor={colors.placeholderText}
                    value={subTitle}
                    onChangeText={setSubTitle}
                    multiline={false}
                    numberOfLines={1}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons
                    name="calendar-number-sharp"
                    size={20}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <Pressable
                    style={[ styles.generateButton, { flexShrink: 1} ]}
                    onPress={() => setIsbn(generateISBN13(setShowIsbnModal))}
                    >     
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        >
                          {isbn ? formatISBN13(isbn) : "Gen ISBN"}
                      </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Author</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Enter Author name'
                  placeholderTextColor={colors.placeholderText}
                  value={author}
                  onChangeText={setAuthor}
                />
              </View>
            </View>


            {/* // book rating */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Rating</Text>
              {renderRatingPicker()}
            </View>

            {/* // image */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {
                  image ? (
                    <Image source={{ uri: image }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="images-sharp" size={40} color={colors.textSecondary}/>
                      <Text style={styles.placeholderText}>Tap to select image</Text>
                    </View>
                  )
                }
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                style={styles.textArea}
                multiline
                placeholder='Write your review or thoughts about this book ...'
                placeholderTextColor={colors.placeholderText}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Genres</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {
                GENRES.slice(0, displayedGenresCount).map((genre, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => { if (genres.includes(genre)) {
                        setGenres(genres.filter(g => g !== genre))
                      } else {
                        setGenres([...genres, genre])
                      }
                    }}
                    style={styles.categoryGrid}
                    >
                    <View style={[styles.categoryItem, genres.includes(genre) && styles.categoryButtonActive ]}>
                      <Text style={styles.categoryButton}>{genre}</Text>
                    </View>
                  </TouchableOpacity>
                )) 
              }
              </View>
              {displayedGenresCount < GENRES.length && (
                <TouchableOpacity onPress={() => setDisplayedGenresCount(displayedGenresCount + 5)} style={{ marginTop: 10, alignSelf: 'center' }}>
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>...</Text>
                </TouchableOpacity>
              )}
              {displayedGenresCount > 5 && (
                <TouchableOpacity onPress={() => setDisplayedGenresCount(Math.max(5, displayedGenresCount - 5))} style={{ marginTop: 10, alignSelf: 'center' }}>
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>Show less</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Price</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons
                    name="pricetag-sharp"
                    size={20}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. $19.99"
                    placeholderTextColor={colors.placeholderText}
                    value={price}
                    onChangeText={setPrice}
                    multiline={false}
                    numberOfLines={1}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <Pressable onPress={() => setShowPicker(true)}>
                    <Text>
                      {publishedYear || new Date().getFullYear()}
                    </Text>
                  </Pressable>

                  {showPicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        setShowPicker(false);
                      
                        if (selectedDate) {
                          const year = selectedDate.getFullYear().toString();
                          setPublishedYear(year);
                        }
                      }}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>  
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator
              color={colors.white}
              animating
              size="small"
            />
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color={colors.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Share</Text>
            </>
          )}
        </TouchableOpacity>

 
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
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Create