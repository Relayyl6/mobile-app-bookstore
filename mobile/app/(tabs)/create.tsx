import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import createStyles from '@/constants/create.styles';
import { useAppContext } from '@/context/useAppContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

const Create = () => {
  const [ title, setTitle ] = useState("");
  const [ subTitle, setSubTitle ] = useState("");
  const [ author, setAuthor ] = useState("");
  const [ caption, setCaption ] = useState("");
  const [ description, setDescription ] = useState("");
  const [ genres, setGenres ] = useState([]);
  const [ price, setPrice ] = useState("");
  const [ image, setImage ] = useState<string | null>(null); // to display the selected image
  const [ rating, setRating ] = useState(3);
  const [ isbn, setIsbn ] = useState("");
  const [ publishedYear, setPublishedYear ] = useState("");
  const [ imageBase64, setImageBase64 ] = useState(null);
  const [ isLoading, setIsLoading ] = useState(false);

  const router = useRouter();
  const { colors } = useAppContext()
  const styles = createStyles(colors)

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
          Alert.alert('Permission required', 'Permission to access the media library is required.');
         return;
        }
      }

      // launh th eimage library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error")
    }
  }

  const handleSubmit = () => {}

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
        </View>

        
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Create