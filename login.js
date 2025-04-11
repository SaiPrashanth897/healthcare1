import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDbuYEkjKDbA0MhJiBkByaFJVTS44ieNSY",
    authDomain: "heathcare-ab5aa.firebaseapp.com",
    projectId: "heathcare-ab5aa",
    storageBucket: "heathcare-ab5aa.firebasestorage.app",
    messagingSenderId: "160649667093",
    appId: "1:160649667093:web:ad42dbaa790d9c0cc2641c",
    measurementId: "G-M3ZSFT8XQH"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("loginForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, username, password);
    const uid = userCred.user.uid;

    const userSnap = await getDoc(doc(db, "users", uid));
    const userData = userSnap.data();

    if (userData.role === "doctor" && !userData.approved) {
      alert("Doctor approval pending. Please wait for admin approval.");
      return;
    }

    if (userData.role === "doctor") {
      window.location.href = "doctor-dashboar.html";
    } else {
      window.location.href = "patient-dashboard.html";
    }
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});
