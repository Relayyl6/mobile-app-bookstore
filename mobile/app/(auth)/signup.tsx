import { View, Text, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAppContext } from '@/context/useAppContext'
import signupStyles from '@/constants/signup.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore.js'

const SignUp = () => {
  const { colors } = useAppContext();
  const styles = signupStyles(colors)
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter()
  // useEffect(() => setInterval() => )
  const names = ['Alice White', 'Bob Brown', 'Charlie Gale', 'David Sawettie', 'John Doe'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentName, setCurrentName] = useState(names[currentIndex]);
  useEffect(() => {
    const interval = setInterval(() => {
      // Use the functional update to get the latest index
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % names.length;
        // console.log(nextIndex)
        setCurrentName(names[nextIndex]);
        return nextIndex;
      });
    }, 2000); // 2000 milliseconds = 2 seconds
    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const { user, isLoading, register } = useAuthStore()
  
  const handleSignUp = async () => {
    const result = await register(username, email, password);

    console.log(result)
    if (!result.success) {
      Alert.alert("Error", result.error)
    }

    router.push('/(auth)')
  }
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/* // header */}
          <View style={styles.header}>
            <Text style={styles.header}>Vein Library</Text>
            <Text style={styles.subtitle}>Share your favorite reads</Text>
          </View>

          <View style={styles.formContainer}>
            {/* // username input  */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  style={styles.inputIcon}
                  color={colors.primary}
                />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder={currentName}
                  style={styles.input}
                  autoCapitalize='none'
                  placeholderTextColor={colors.placeholderText}
                />
              </View>
            </View>
          </View>

          {/* // email */}
          <View style={styles.formContainer}>
            {/* // username input  */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  style={styles.inputIcon}
                  color={colors.primary}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={`${currentName.replace(" ", '').toLowerCase()}24@gmail.com`}
                  style={styles.input}
                  autoCapitalize='none'
                  placeholderTextColor={colors.placeholderText}
                />
              </View>
            </View>
          </View>

          {/* // password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.primary}
              />
              <TextInput
                style={styles.input}
                placeholder='Enter your password'
                placeholderTextColor={colors.placeholderText}
                value={password}
                onChangeText={setPassword}
                autoCapitalize='none'
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  siz={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>


          {/* // signup button */}
          <TouchableOpacity onPress={handleSignUp} style={styles.button} disabled={isLoading}>
            {isLoading ? (
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 6 }}>Loading </Text>
                <ActivityIndicator color={colors.primary }/>
              </View>
            ): (
              <Text style={styles.buttonText}>Sign In</Text>
            )} 
          </TouchableOpacity>
          {/* // footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an Account?</Text>     
              <TouchableOpacity onPress={() => router.back()}>
                {!isLoading ? <Text style={styles.link}>Log In</Text> : <View><Text>Loading </Text><ActivityIndicator color={colors.primary } size='small'/></View>}
              </TouchableOpacity>
            </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default SignUp