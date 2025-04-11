import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore, collection, getDocs, addDoc, query, where, Timestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbuYEkjKDbA0MhJiBkByaFJVTS44ieNSY",
  authDomain: "heathcare-ab5aa.firebaseapp.com",
  projectId: "heathcare-ab5aa",
  storageBucket: "heathcare-ab5aa.appspot.com",
  messagingSenderId: "160649667093",
  appId: "1:160649667093:web:ad42dbaa790d9c0cc2641"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const patientSelect = document.getElementById("patientSelect");
const roundNoteForm = document.getElementById("roundNoteForm");
const noteText = document.getElementById("noteText");
const symptoms = document.getElementById("symptoms");
const statusMessage = document.getElementById("statusMessage");

const bp = document.getElementById("bp");
const hr = document.getElementById("hr");
const spo2 = document.getElementById("spo2");
const temp = document.getElementById("temp");
const rr = document.getElementById("rr");

let currentDoctorId = null;

const loadPatients = async (doctorId) => {
  const q = query(collection(db, "patients"), where("doctorId", "==", doctorId));
  const snapshot = await getDocs(q);
  patientSelect.innerHTML = '<option value="">Select Patient</option>';
  snapshot.forEach(doc => {
    const data = doc.data();
    patientSelect.innerHTML += `<option value="${doc.id}">${data.name}</option>`;
  });
};

const checkForADR = (symptomList, vitalSigns) => {
  const redFlags = ["rash", "vomiting", "dizziness", "shortness of breath"];
  const alerts = redFlags.filter(flag => symptomList.toLowerCase().includes(flag));
  const spo2Val = parseInt(vitalSigns.spo2);
  if (!isNaN(spo2Val) && spo2Val < 92) alerts.push("Low SpO2");
  return alerts;
};

roundNoteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const patientId = patientSelect.value;

  const vitals = {
    bp: bp.value,
    hr: hr.value,
    spo2: spo2.value,
    temp: temp.value,
    rr: rr.value
  };

  const data = {
    doctorId: currentDoctorId,
    patientId,
    symptoms: symptoms.value,
    note: noteText.value,
    vitals,
    timestamp: Timestamp.now()
  };

  const adrAlerts = checkForADR(symptoms.value, vitals);
  if (adrAlerts.length > 0) {
    data.adrAlerts = adrAlerts;
    alert("⚠️ Possible ADRs detected:\n" + adrAlerts.join(", "));
  }

  try {
    await addDoc(collection(db, "rounds"), data);
    statusMessage.textContent = "Note saved successfully!";
    roundNoteForm.reset();
  } catch (err) {
    statusMessage.textContent = "Error saving note: " + err.message;
  }
});

// Load patients after login
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentDoctorId = user.uid;
    await loadPatients(currentDoctorId);
  } else {
    window.location.href = "login.html";
  }
});

// Add common symptom template
document.getElementById("addTemplate").addEventListener("click", () => {
  symptoms.value += "Fatigue, Nausea, Mild Headache";
});

// Voice-to-text
document.getElementById("voiceBtn").addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.onresult = (e) => {
    noteText.value += e.results[0][0].transcript;
  };
  recognition.start();
});
