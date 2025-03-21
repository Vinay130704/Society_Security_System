// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

// 🔹 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuZA3xFzsuHU1saqPTwz_PZ50jkLCSf08",
  authDomain: "society-security-system-ea11c.firebaseapp.com",
  projectId: "society-security-system-ea11c",
  storageBucket: "society-security-system-ea11c.appspot.com", // Fixed `firebasestorage.app` typo
  messagingSenderId: "948210305457",
  appId: "1:948210305457:web:379989f8843e958401d590",
  measurementId: "G-6F38QSFVWW",
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

// 🔹 Function to Request Notification Permission and Get Token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");

      // Get FCM Token
      const token = await getToken(messaging, {
        vapidKey: "tvoxS8oXblxLD7S3A-U3HQwCQKlwzlMzI-oqkDeD0Ks",
      });

      console.log("FCM Token:", token);
      return token; // Use this token to send notifications from the backend
    } else {
      console.log("Notification permission denied.");
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
  }
};

// 🔹 Listen for Incoming Messages (Foreground Notifications)
onMessage(messaging, (payload) => {
  console.log("Foreground Notification Received:", payload);
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.image || "/default-icon.png",
  });
});

export { messaging };
