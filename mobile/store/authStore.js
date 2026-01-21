import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAuthStore = create((set) => ({
//   bears: 0,
    user: null,
    token: null,
    isLoading: false,
    // setUser: (user) => set({ user })
    register: async (username, email, password) => {
        set({isloading: true})
        try {
            const response = await fetch(`${process.env.API_URL}/api/v1/auth`, {
                method: "POST",
                Headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            })
            const result = response.json()
            
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
    }
}))
