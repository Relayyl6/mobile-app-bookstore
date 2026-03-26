import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { Alert, Platform } from 'react-native';
import {EXPO_PUBLIC_API_URL} from '../store/api'

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
        if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        const base64 =
        //@ts-ignore
          asset.base64 ?? (await FileSystem.readAsStringAsync(asset.uri, {
            //@ts-ignore
            encoding: FileSystem.EncodingType.Base64,
          }));
        
        setImageBase64(base64);
        
        const uriParts = asset.uri.split(".");
        const ext = uriParts[uriParts.length - 1]?.toLowerCase() || "jpeg";
        const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
        
        const dataUrl = `data:${mime};base64,${base64}`;
        setImage(dataUrl);
      }
    } else {
        return null
    }
}

// export async function uploadFile(
//     file: any | null,
//     userMsg: any,
//     imageBase64: any | null,
// ): Promise<{ message: string; bookId: string; userId: string } | null | void> {
//   if (!file) return;
//   const formData = new FormData();

//   const fileName = file.fileName ?? file.uri.split("/").pop() ?? "upload";
//   const ext = fileName.split(".").pop()?.toLowerCase();

//   let mime = "application/octet-stream";

//   if (file.name.endsWith(".epub")) {
//     mime = "application/epub+zip";
//   } else if (file.name.endsWith(".pdf")) {
//     mime = "application/pdf";
//   } else if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
//     mime = `image/${ext === "jpg" ? "jpeg" : ext}`;
//   }

//   // if a file was uploaded, then append it to the formData
//   if (file) {
//       formData.append("file", {
//       uri: file.uri,
//       name: file.name ?? "book.pdf",
//       type: file.contentType ?? mime,
//     } as any)
//   }

//   // always upload the user's message
//   formData.append('text', userMsg.text)
//   formData.append(
//     "aiContext",
//     JSON.stringify(userMsg.aiContexts ?? [])
//   );
//   // if the image exists, upload it
//   if (imageBase64) {
//     formData.append('image', imageBase64)
//   }
//   try {
//     const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/v1/books/upload`, {
//       method: "POST",
//       body: formData,
//     });
//     const data = await response.json();

//     if (!response.ok) {
//       console.error("Upload failed:", data);
//       return null;
//     }


//     return {
//       message: data.message,
//       bookId: data.bookId,
//       userId: data.userId,
//     };
//   } catch (error) {
//     console.error("Upload error:", error);
//   }
// }
export async function uploadFile(
  file: any | null,
  userMsg: any,
  imageBase64: any | null,
): Promise<{ message: string; bookId: string; userId: string } | null | void> {

  console.log("🟡 uploadFile called");
  console.log("📁 file:", file);
  console.log("📝 userMsg:", userMsg);
  console.log("🖼️ imageBase64 exists:", !!imageBase64);

  if (!file) {
    console.log("⛔ No file provided, exiting uploadFile early");
    return;
  }

  const formData = new FormData();

  const fileName = file.fileName ?? file.uri?.split("/").pop() ?? "upload";
  const ext = fileName.split(".").pop()?.toLowerCase();

  console.log("📄 fileName:", fileName);
  console.log("📄 ext:", ext);

  let mime = "application/octet-stream";

  if (file.name?.endsWith(".epub")) {
    mime = "application/epub+zip";
  } else if (file.name?.endsWith(".pdf")) {
    mime = "application/pdf";
  } else if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
    mime = `image/${ext === "jpg" ? "jpeg" : ext}`;
  }

  console.log("📦 resolved mime type:", mime);

  // Append file
  try {
    formData.append("file", {
      uri: file.uri,
      name: file.name ?? "book.pdf",
      type: file.contentType ?? mime,
    } as any);
    console.log("✅ File appended to formData");
  } catch (err) {
    console.error("❌ Failed to append file:", err);
  }

  // Append text
  console.log("📝 Appending text:", userMsg?.text);
  formData.append("text", userMsg.text);

  console.log("🧠 Appending aiContext:", userMsg?.aiContexts);
  formData.append(
    "aiContext",
    JSON.stringify(userMsg.aiContexts ?? [])
  );

  if (imageBase64) {
    console.log("🖼️ Appending imageBase64 (length):", imageBase64.length);
    formData.append("image", imageBase64);
  } else {
    console.log("ℹ️ No imageBase64 provided");
  }

  console.log("🚀 Sending request to:", `${EXPO_PUBLIC_API_URL}/api/v1/books/upload`);

  try {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/v1/books/upload`, {
      method: "POST",
      body: formData,
    });

    console.log("📥 Upload response status:", response.status);

    const rawText = await response.text();
    console.log("📥 Raw response text:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", err);
      return null;
    }

    console.log("📦 Parsed response JSON:", data);

    if (!response.ok) {
      console.error("❌ Upload failed:", data);
      return null;
    }

    console.log("✅ Upload success, returning data");
    return {
      message: data.message,
      bookId: data.bookId,
      userId: data.userId,
    };

  } catch (error) {
    console.error("❌ Upload fetch error:", error);
  }
}

export function buildSystemInstruction(aiContexts: string[] = []) {
  if (!aiContexts.length) return "";

  const rules = [];

  if (aiContexts.includes("quick-answer")) {
    rules.push("Respond briefly and directly. Avoid long explanations.");
  }

  if (aiContexts.includes("deep-research")) {
    rules.push("Provide a thorough, structured, and analytical response.");
  }

  if (aiContexts.includes("summarize")) {
    rules.push("Summarize key points concisely using bullet points.");
  }

  if (aiContexts.includes("book-depth")) {
    rules.push("Use all available book context to form the answer.");
  }

  return `
    RESPONSE MODE INSTRUCTIONS:
    ${rules.map(r => `- ${r}`).join("\n")}
  `;
}

