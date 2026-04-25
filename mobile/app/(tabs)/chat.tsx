// import { router } from 'expo-router';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function chat() {
    const router = useRouter()
    useEffect(() => {
        router.push('/chatpage')
    }, [])
}