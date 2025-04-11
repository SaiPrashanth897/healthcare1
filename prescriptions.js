import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const db = getFirestore(app);

// 🧑‍⚕️ Load patients from Firestore
async function loadPatients() {
  const patientSelect = document.getElementById("patientSelect");
  const snapshot = await getDocs(collection(db, "patients"));

  patientSelect.innerHTML = `<option value="">Select Patient</option>`;
  snapshot.forEach(doc => {
    const data = doc.data();
    patientSelect.innerHTML += `<option value="${doc.id}">${data.name}</option>`;
  });
}

// 💊 Add prescription with ADR check
async function addPrescription(e) {
  e.preventDefault();

  const patientId = document.getElementById("patientSelect").value;
  const drugName = document.getElementById("medicineSelect").value;

const rxcuiRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}`);
const rxcuiData = await rxcuiRes.json();
const rxcui = rxcuiData?.idGroup?.rxnormId?.[0];

if (!rxcui) {
  interactionDiv.innerHTML = `<p>❌ No valid rxcui found for drug: ${drugName}</p>`;
  return;
}

  const dosage = document.getElementById("dosageSelect").value;
  const interactionDiv = document.getElementById("interactionResult");

  try {
    // ✅ Fetch interactions (without "sources=DrugBank" to avoid 404)
    const res = await fetch(`https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${rxcui}`);
    if (!res.ok) throw new Error("RxNav API error");

    const data = await res.json();

    if (data.interactionTypeGroup) {
      let html = "";
      data.interactionTypeGroup.forEach(group => {
        group.interactionType.forEach(type => {
          type.interactionPair.forEach(pair => {
            html += `<p><strong>Interaction:</strong> ${pair.description}</p>`;
          });
        });
      });
      interactionDiv.innerHTML = html;
    } else {
      interactionDiv.innerHTML = "<p>No interactions found.</p>";
    }

    // ✅ Save to Firestore
    await addDoc(collection(db, "prescriptions"), {
      patientId,
      rxcui,
      dosage,
      status: "active",
      createdAt: serverTimestamp()
    });

    alert("Prescription added successfully!");
  } catch (err) {
    console.error("Error adding prescription:", err);
    interactionDiv.innerHTML = "<p>❌ Failed to fetch interactions or save data.</p>";
  }
}

document.getElementById("prescriptionForm").addEventListener("submit", addPrescription);
window.onload = loadPatients;
