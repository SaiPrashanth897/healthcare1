import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDbuYEkjKDbA0MhJiBkByaFJVTS44ieNSY",
  authDomain: "heathcare-ab5aa.firebaseapp.com",
  projectId: "heathcare-ab5aa",
  storageBucket: "heathcare-ab5aa.appspot.com",
  messagingSenderId: "160649667093",
  appId: "1:160649667093:web:ad42dbaa790d9c0cc2641"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Handle form submit
document.getElementById("addPatientForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const age = parseInt(document.getElementById("age").value);
  const condition = document.getElementById("condition").value;
  const contact = document.getElementById("contact").value;

  try {
    // Optional: get current user if you want to track doctor who added
    const user = auth.currentUser;
    const doctorId = user ? user.uid : "unknown";

    await addDoc(collection(db, "patients"), {
      name,
      age,
      condition,
      contact,
      doctorId,
      createdAt: Timestamp.now()
    });

    document.getElementById("statusMsg").textContent = "✅ Patient added successfully!";
    e.target.reset();
  } catch (err) {
    document.getElementById("statusMsg").textContent = "❌ Error: " + err.message;
  }
});
