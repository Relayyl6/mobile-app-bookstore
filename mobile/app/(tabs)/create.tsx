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
    ActivityIndicator,
  } from "react-native";
  import React, { useState, useEffect, useRef } from "react";
  import { useRouter } from "expo-router";
  import createStyles from "@/constants/create.styles";
  import { useAppContext } from "@/context/useAppContext";
  import { Ionicons } from "@expo/vector-icons";
  import { Image } from "expo-image";
  import * as ImagePicker from "expo-image-picker";
  import * as FileSystem from "expo-file-system/legacy";
  import * as DocumentPicker from "expo-document-picker";
  import { formatISBN13, generateISBN13, GENRES } from "@/constants/data";
  import DateTimePicker from "@react-native-community/datetimepicker";
  import { api } from "@/components/ApiHandler";
  import ISBNModal from "@/components/IsbnModal";
  import SuccessModal from "@/components/SuccessModal";

  const Create = () => {
    const router = useRouter();
    const { colors, setBookId } = useAppContext();
    const styles = createStyles(colors);

    // ================= STATE =================
    const [title, setTitle] = useState("");
    const [subTitle, setSubTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [caption, setCaption] = useState("");
    const [description, setDescription] = useState("");
    const [genres, setGenres] = useState<string[]>([]);
    const [price, setPrice] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [rating, setRating] = useState(3);
    const [isbn, setIsbn] = useState("");
    const [publishedYear, setPublishedYear] = useState("");
    const [file, setFile] = useState<any>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [displayedGenresCount, setDisplayedGenresCount] = useState(5);
    const [showPicker, setShowPicker] = useState(false);
    const [showIsbnModal, setShowIsbnModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [mode, setMode] = useState<"Recommendation" | "Upload">("Recommendation");

    const CURRENT_YEAR = new Date().getFullYear().toString();
    const autoFillTimer = useRef<NodeJS.Timeout | null>(null);

    // ================= AUTO YEAR =================
    useEffect(() => {
      if (!publishedYear) {
        //@ts-ignore
        autoFillTimer.current = setTimeout(() => {
          setPublishedYear(CURRENT_YEAR);
        }, 8000);
      }
      return () => {
        if (autoFillTimer.current) clearTimeout(autoFillTimer.current);
      };
    }, [publishedYear]);

    // ================= IMAGE PICKER =================
    const pickImage = async () => {
      try {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission required");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.6,
          base64: true,
        });

        if (!result.canceled) {
          const asset = result.assets[0];
          setImage(asset.uri);
          setImageBase64(asset.base64 || null);
        }
      } catch {
        Alert.alert("Error", "Image selection failed");
      }
    };

    // ================= FILE PICKER =================
    const pickFile = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          copyToCacheDirectory: true,
        });

        if (!result.canceled) {
          setFile(result.assets[0]);
          console.log(file)
          setFileName(result.assets[0].name);
        }
      } catch {
        Alert.alert("Error", "File selection failed");
      }
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {
      if (
        !title ||
        !author ||
        !caption ||
        genres.length === 0 ||
        !image ||
        !price
      ) {
        Alert.alert("Error", "Please fill all required fields");
        return;
      }

      try {
        setIsLoading(true);

        // Prepare image
        const fileType = image.split(".").pop();
        const imageType = `image/${fileType?.toLowerCase() || "jpeg"}`;
        const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

        // AI description
        const describeRes = await api.describeImage({
          imageBase64: imageBase64!,
          title,
          caption,
          author,
        });

        if (!describeRes.success)
          throw new Error(describeRes.error || "AI failed");

        const generatedDescription = describeRes?.description;
        setDescription(generatedDescription || "");

        // Create book
        const createRes = await api.createBook({
          title,
          subTitle,
          author,
          caption,
          description: generatedDescription,
          genres,
          image: imageDataUrl,
          price,
          isbn,
          publishedYear,
        });

        if (!createRes.success)
          throw new Error(createRes.error || "Book creation failed");

        const bookId = createRes?.book?.id;
        if (!bookId) throw new Error("Book ID missing");

        setBookId(bookId);

        // Upload content if needed
        if (mode === "Upload" && file) {
          const formData = new FormData();
          formData.append("file", {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "application/pdf",
          } as any);
          formData.append("bookId", bookId)

          await api.uploadBookContent(bookId, formData);
        }

        // Add rating
        await api.addOrUpdateRating({
          bookId,
          rating,
          review: caption,
        });

        setShowSuccessModal(true);
        const successTimer = setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);

        // Reset form
        setTitle("");
        setSubTitle("");
        setAuthor("");
        setCaption("");
        setDescription("");
        setGenres([]);
        setPrice("");
        setImage(null);
        setImageBase64(null);
        setFile(null);
        setFileName(null);
        setRating(3);
        setIsbn("");
        setPublishedYear("");

        
        clearTimeout(successTimer)

        router.push("/");
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setIsLoading(false);
        
      }
    };


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
              <Text style={[styles.title, { textAlign: "center", width: '100%' }]}>
                Add Book{"\n"}{mode}
              </Text>
              <Text style={styles.subtitle}>Share your favorite reads with others</Text>
            </View>

            <View style={styles.segmentContainer}>
              {/* Segmented control wrapper */}
              <View
                style={[
                  styles.segmentedControl,
                  {
                    backgroundColor: colors.border + '30', // subtle background tint
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Recommendation button */}
                <TouchableOpacity
                  onPress={() => setMode('Recommendation')}
                  activeOpacity={0.7}
                  style={[
                    styles.segment,
                    {
                      backgroundColor:
                        mode === 'Recommendation' ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: mode === 'Recommendation' ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: mode === 'Recommendation' ? '600' : '400',
                      },
                    ]}
                  >
                    Recommend
                  </Text>
                </TouchableOpacity>

                {/* Upload button */}
                <TouchableOpacity
                  onPress={() => setMode('Upload')}
                  activeOpacity={0.7}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: mode === 'Upload' ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: mode === 'Upload' ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: mode === 'Upload' ? '600' : '400',
                      },
                    ]}
                  >
                    Upload
                  </Text>
                </TouchableOpacity>
              </View>
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

              {mode === "Upload" && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>File</Text>
                  <TouchableOpacity
                    style={styles.imagePicker}
                    onPress={pickFile}
                  >
                    {fileName ? (
                      <View style={styles.placeholderContainer}>
                        <Ionicons name="file-tray-stacked-outline" size={40} color={colors.textSecondary}/>
                        <Text style={styles.placeholderText}>{fileName}</Text>
                      </View>
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <Ionicons name="file-tray-stacked-outline" size={40} color={colors.textSecondary}/>
                        <Text style={styles.placeholderText}>Upload PDF / EPUB</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View> 
              )}

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

          <ISBNModal
            isbn={isbn}
            showIsbnModal={showIsbnModal}
            setShowIsbnModal={setShowIsbnModal}
          />
          
          <SuccessModal
            showSuccessModal={showSuccessModal}
            setShowSuccessModal={setShowSuccessModal}
          />
          
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  export default Create