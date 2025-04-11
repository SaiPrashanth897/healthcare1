import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDbuYEkjKDbA0MhJiBkByaFJVTS44ieNSY",
  authDomain: "heathcare-ab5aa.firebaseapp.com",
  projectId: "heathcare-ab5aa",
  storageBucket: "heathcare-ab5aa.appspot.com", // ✅ fixed domain
  messagingSenderId: "160649667093",
  appId: "1:160649667093:web:ad42dbaa790d9c0cc2641c",
  measurementId: "G-M3ZSFT8XQH"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Handle Signup Form
document.getElementById("signupForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const phone = document.getElementById("signupPhone").value;
  const address = document.getElementById("signupAddress").value;
  const role = document.getElementById("signupRole").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const userDoc = {
      uid,
      username,
      email,
      phone,
      address,
      role,
      approved: role === "doctor" ? false : true,
      createdAt: new Date()
    };

    await setDoc(doc(db, "users", uid), userDoc);
    alert("Signup successful! Login after approval (if doctor).");
    window.location.href = "login.html";
  } catch (err) {
    alert("Signup failed: " + err.message);
  }
});
