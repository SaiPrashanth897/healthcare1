import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase Config
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
  const snapshot = await getDocs(collection(db, "patients"));
  snapshot.forEach((doc) => {
    const data = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = data.name;
    patientSelect.appendChild(option);
  });
}
loadPatients();

// Fetch rounds & show chart
patientSelect.addEventListener("change", async (e) => {
  const patientId = e.target.value;
  const q = query(collection(db, "rounds"), where("patientId", "==", patientId));
  const snapshot = await getDocs(q);

  const labels = [];
  const symptomCounts = [];
  const bpList = [];
  const hrList = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const date = new Date(data.timestamp?.toDate()).toLocaleDateString();
    labels.push(date);
    symptomCounts.push(data.symptoms?.length || 0);
    bpList.push(parseInt(data.vitals?.bp) || 0);
    hrList.push(parseInt(data.vitals?.hr) || 0);
  });

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: "Symptom Count",
          data: symptomCounts,
          borderColor: "rgba(255, 99, 132, 1)",
          fill: false,
          tension: 0.3
        },
        {
          label: "Blood Pressure (systolic)",
          data: bpList,
          borderColor: "rgba(54, 162, 235, 1)",
          fill: false,
          tension: 0.3
        },
        {
          label: "Heart Rate",
          data: hrList,
          borderColor: "rgba(255, 206, 86, 1)",
          fill: false,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Patient Symptom & Vitals Trend Over Time'
        }
      },
      scales: {
        y: { beginAtZero: true },
        x: { title: { display: true, text: 'Date' } }
      }
    }
  });
});
