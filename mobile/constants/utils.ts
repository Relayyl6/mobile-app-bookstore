import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { Alert, Platform } from 'react-native';

export async function pickFile(setFile: (file: any) => void) {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled) {
      console.log("User canceled file pick");
      return null;
    }
    // result.assets is an array of picked assets
    const asset = result.assets[0];
    setFile(asset);
    console.log("Picked asset:", asset);
  } catch (error) {
    console.error("An error occured", error)
  }
}

export async function pickImage(
    imageBase64: string | null,
    setImage: (img: any) => void,
    setImageBase64: (img: any) => void
) {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert('Permission required', 'Permission to access the media library is required.');
       return;
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true
    });

    if (!result.canceled) {
        const image = result.assets[0].uri

        if (!result.canceled && result?.assets[0]?.uri) {
            setImageBase64(result?.assets[0].base64)
        } else if (!result.canceled && !result.assets[0]?.uri) {
            // @ts-ignore
            const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                // @ts-ignore
              encoding: FileSystem.EncodingType.Base64
            })
            setImageBase64(base64)
        }
        
        const uriParts = image?.split(".");
        const fileType = uriParts?.[uriParts?.length - 1]
        const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";

        const imageDataUrl = `data:${imageType};base64,${imageBase64}`
        setImage(imageDataUrl)
    } else {
        return null
    }
}

export async function uploadFile(
    file: any | null,
    userMsg: any,
    image: any | null,
): Promise<{ message: string; bookId: string; userId: string } | null | void> {
  if (!file) return;
  const formData = new FormData();

  // if a file was uploaded, then append it to the formData
  if (file) {
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.contentType ?? "application/octet-stream",
    } as any);
  }

  // always upload the user's message
  formData.append("prompt", userMsg)
  formData.append('text', userMsg.text)

  // if the image exists, upload it
  if (image) {
    formData.append('image', image)
  }
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.success) {
        return {
            message: data.message,
            bookId: data.bookId,
            userId: data.userId,
        }
    }
    return null
  } catch (error) {
    console.error("Upload error:", error);
  }
}