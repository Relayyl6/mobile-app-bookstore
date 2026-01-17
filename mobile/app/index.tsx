import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href="/books">Go to Books</Link>

      <Link href="/(auth)/signup">Go to Settings</Link>
      <ThemeSwitcher />
      {/* <Link href="/(auth)/signup">Go to sign up page</Link> */}
    </View>
  );
}
