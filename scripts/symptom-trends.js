import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
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

const patientSelect = document.getElementById("patientSelect");
const ctx = document.getElementById("symptomChart").getContext("2d");
let chartInstance = null;

// Load patients into dropdown
async function loadPatients() {
  const patientsSnap = await getDocs(collection(db, "patients"));
  patientsSnap.forEach((doc) => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = doc.data().name;
    patientSelect.appendChild(option);
  });
}
loadPatients();

// Fetch and render chart on patient change
patientSelect.addEventListener("change", async (e) => {
  const patientId = e.target.value;
  const roundsRef = collection(db, "rounds");
  const q = query(roundsRef, where("patientId", "==", patientId));
  const roundSnap = await getDocs(q);

  const labels = [];
  const symptomScores = []; // Use a symptom severity score or just count

  roundSnap.forEach((doc) => {
    const data = doc.data();
    labels.push(new Date(data.timestamp?.toDate()).toLocaleDateString());
    symptomScores.push(data.symptoms?.length || 0); // Customize if you have scores
  });

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: 'Number of Symptoms',
        data: symptomScores,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Symptom Count'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    }
  });
});
