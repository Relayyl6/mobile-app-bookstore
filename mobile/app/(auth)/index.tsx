import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useAppContext } from '@/context/useAppContext'
// import createStyles from '@/constants/create.styles';
import loginStyles from '@/constants/login.styles';
import { Image } from 'expo-image';
// import icons from '@/constants/data'
import {Ionicons} from '@expo/vector-icons'
import { Link } from 'expo-router';

const SignIn = () => {
  const { colors, iconsuse } = useAppContext();
  const styles = loginStyles(colors);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = () => {}

  return (
    <View style={styles.container}>
      <View style={styles.topIllustration}>
        <Image source={iconsuse.themeIcon} style={styles.illustrationImage} />
      </View>

      <View style={styles.card}>
        <View style={styles.formContainer}>
          {/* // Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder='Please Enter your email'
                placeholderTextColor={colors.placeholderText}
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>
          </View>


          {/* // Password */}
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
                placeholder='Please Enter your password'
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

          {/* // login button */}
          <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={isLoading}>
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
            <Text style={styles.footerText}>Dont have an Account?</Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </View>
  )
}

export default SignIn