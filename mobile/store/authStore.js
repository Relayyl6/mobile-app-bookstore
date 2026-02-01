import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from './api.ts'

export const useAuthStore = create((set) => ({
//   bears: 0,
    user: null,
    token: null,
    isLoading: false,
    // setUser: (user) => set({ user })
    register: async (username, email, password) => {
        set({isLoading: true})
        try {
            const response = await fetch(`${API_URL}/api/v1/store/register`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            })
            const result = await response.json()
            
            if (!response.ok) throw new Error(result.message || "Something went wrong")

            await AsyncStorage.setItem('user', JSON.stringify(result.data.user))
            await AsyncStorage.setItem('token', JSON.stringify(result.data.token))

            set({
                user: result.data.user,
                token: result.data.token,
                isLoading: false
            })

            return {
                success: true
            }
        } catch (error) {
            set({
                isLoading: false
            })

            return {
                success: false,
                error: error.message
            }
        }
    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userJson = await AsyncStorage.getItem('user');

            if (userJson) {
                set({
                    token: JSON.parse(token) || null,
                    user: userJson ? JSON.parse(userJson) : null
                })
            }
        } catch(error) {
            console.log("Auth check Failed", error)
        }
    },

    login: async (email, password) => {
        // Implement login logic here
        set({ isLoading: true })
        try {
            const response = await fetch(`https://store-backend-api-tj22.onrender.com/api/v1/store/log-in`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })
            const result = await response.json()

            if (!response.ok) throw new Error(result.message || "Something went wrong")

            await AsyncStorage.setItem('user', JSON.stringify(result.data.user))
            await AsyncStorage.setItem('token', JSON.stringify(result.data.token))

            set({
                user: result.data.user,
                token: result.data.token,
                isLoading: false
            })

            return {
                success: true
            }
        } catch (error) {
            set({
                isLoading: false
            })

            return {
                success: false,
                error: error.message
            }
        }
    },

    logout: async() => {
        try {
            await AsyncStorage.removeItem('token')
            await AsyncStorage.removeItem('user')
            set({
                user: null,
                token: null
            })
        } catch (error) {
            console.log("Error in logout", error)
        }
    }
}))
