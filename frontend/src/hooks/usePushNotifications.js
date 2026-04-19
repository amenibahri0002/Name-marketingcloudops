import { useState, useEffect } from 'react'

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000'

export function usePushNotifications() {
  const [supported, setSupported]   = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading]       = useState(false)

  useEffect(function() {
    setSupported('serviceWorker' in navigator && 'PushManager' in window)
  }, [])

  async function subscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const keyRes = await fetch(API + '/api/notifications/vapid-key')
      const { publicKey } = await keyRes.json()

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      })

      const token = localStorage.getItem('token')
      await fetch(API + '/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ subscription })
      })

      setSubscribed(true)
      alert('Notifications activees avec succes !')
    } catch (err) {
      console.error('Erreur push:', err)
      alert('Erreur activation notifications')
    }
    setLoading(false)
  }

  return { supported, subscribed, loading, subscribe }
}