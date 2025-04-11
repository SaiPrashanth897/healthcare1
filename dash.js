import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDbuYEkjKDbA0MhJiBkByaFJVTS44ieNSY",
  authDomain: "heathcare-ab5aa.firebaseapp.com",
  projectId: "heathcare-ab5aa",
  storageBucket: "heathcare-ab5aa.appspot.com",
  messagingSenderId: "160649667093",
  appId: "1:160649667093:web:ad42dbaa790d9c0cc2641c",
  measurementId: "G-M3ZSFT8XQH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility to convert timestamp to readable format
function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("User not logged in!");
    window.location.href = "login.html";
    return;
  }

  try {
    const doctorId = user.uid;

    // Load Doctor Name
    const userDocRef = doc(db, "users", doctorId);
    const userSnap = await getDoc(userDocRef);
    const doctorName = userSnap.exists() ? userSnap.data().username : "Doctor";
    document.getElementById("welcomeText").innerText = `Welcome, Dr. ${doctorName} 👩‍⚕️`;

    // PATIENTS
    const patientsQuery = query(collection(db, "patients"), where("doctorId", "==", doctorId));
    const patientsSnapshot = await getDocs(patientsQuery);
    const patients = patientsSnapshot.docs.map(doc => doc.data());
    document.getElementById("patientCount").innerText = patients.length;

    const patientList = document.getElementById("patientList");
    patientList.innerHTML = "";
    if (patients.length === 0) {
      patientList.innerHTML = `<tr><td colspan="4">No patients assigned.</td></tr>`;
    } else {
      patients.forEach(p => {
        const row = `<tr>
          <td>${p.name}</td>
          <td>${p.age}</td>
          <td>${p.condition}</td>
          <td>${formatDate(p.lastVisit)}</td>
        </tr>`;
        patientList.innerHTML += row;
      });
    }

    // ROUNDS
    const roundsQuery = query(
      collection(db, "rounds"),
      where("doctorId", "==", doctorId),
      where("status", "==", "pending")
    );
    const roundsSnapshot = await getDocs(roundsQuery);
    document.getElementById("pendingCount").innerText = roundsSnapshot.size;

    // ADR ALERTS
    const adrQuery = query(collection(db, "adrAlerts"), where("doctorId", "==", doctorId));
    const adrSnapshot = await getDocs(adrQuery);
    document.getElementById("adrCount").innerText = adrSnapshot.size;

    // LAST LOGIN
    if (userSnap.exists()) {
      const lastLogin = userSnap.data().lastLogin;
      if (lastLogin) {
        const hoursAgo = Math.floor((Date.now() - new Date(lastLogin.seconds * 1000)) / 3600000);
        document.getElementById("lastLogin").innerText = `${hoursAgo} hours ago`;
      } else {
        document.getElementById("lastLogin").innerText = "Unknown";
      }
    }

  } catch (error) {
    console.error("Error loading dashboard data:", error);
    document.getElementById("patientList").innerHTML = `<tr><td colspan="4">Failed to load patients.</td></tr>`;
  }
});
