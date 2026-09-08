/**
 * Innovic Solutions – Firebase Cloud Integration
 * Project ID: innovic-solutions
 */

const firebaseConfig = {
  apiKey: "AIzaSyDfMOXMBESl-zt4nIJY5kIiKYk3uUvi_F8",
  authDomain: "innovic-solutions.firebaseapp.com",
  projectId: "innovic-solutions",
  storageBucket: "innovic-solutions.firebasestorage.app",
  messagingSenderId: "868466629992",
  appId: "1:868466629992:web:bc37fb29d727d0f71c4add",
  measurementId: "G-LPFBHZNQ1E"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  window.firebaseApp = firebase.app();
  window.db = firebase.firestore();
  window.auth = firebase.auth();
  console.log("⚡ Firebase connected successfully to innovic-solutions");
}

/**
 * Save new student enquiry / demo class booking to Firestore
 */
window.submitInnovicEnquiry = async function(enquiryData) {
  if (!window.db) {
    console.warn("Firestore not initialized");
    return { success: false, fallback: true };
  }
  try {
    const docRef = await window.db.collection('enquiries').add({
      ...enquiryData,
      status: 'New Lead',
      source: 'Website Form',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      dateString: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    });
    console.log("Enquiry saved with ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving enquiry to Firebase:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Log Attendance punch to Firestore
 */
window.recordAttendanceLog = async function(punchData) {
  if (!window.db) {
    console.warn("Firestore not initialized");
    return { success: false, fallback: true };
  }
  try {
    const docRef = await window.db.collection('attendance_logs').add({
      ...punchData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      recordedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      dateString: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    });
    console.log("Attendance recorded with ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving attendance to Firebase:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Real-time listener for enquiries in Admin portal
 */
window.listenToEnquiries = function(callback) {
  if (!window.db) return;
  return window.db.collection('enquiries')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .onSnapshot((snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      callback(items);
    }, (err) => {
      console.warn("Enquiries listener fallback:", err);
    });
};

/**
 * Real-time listener for attendance in Admin portal
 */
window.listenToAttendance = function(callback) {
  if (!window.db) return;
  return window.db.collection('attendance_logs')
    .orderBy('timestamp', 'desc')
    .limit(20)
    .onSnapshot((snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      callback(items);
    }, (err) => {
      console.warn("Attendance listener fallback:", err);
    });
};
