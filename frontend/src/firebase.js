// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuZA3xFzsuHU1saqPTwz_PZ50jkLCSf08",
  authDomain: "society-security-system-ea11c.firebaseapp.com",
  projectId: "society-security-system-ea11c",
  storageBucket: "society-security-system-ea11c.firebasestorage.app",
  messagingSenderId: "948210305457",
  appId: "1:948210305457:web:379989f8843e958401d590",
  measurementId: "G-6F38QSFVWW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 🔹 Function to Request Notification Permission
export const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        console.log("Notification permission granted.");

        // Get FCM Token
        const token = await getToken(messaging, { vapidKey: "tvoxS8oXblxLD7S3A-U3HQwCQKlwzlMzI-oqkDeD0Ks" });
        console.log("FCM Token:", token);
        
        return token; // Use this token to send notifications
    } else {
        console.log("Notification permission denied.");
    }
};

// 🔹 Listen for Incoming Messages
onMessage(messaging, (payload) => {
    console.log("Foreground Notification Received:", payload);
    new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.image
    });
});
