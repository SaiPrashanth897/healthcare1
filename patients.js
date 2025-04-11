import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDbuYEkjKDbA0MhJiBkByaFJVTS44ieNSY",
  authDomain: "heathcare-ab5aa.firebaseapp.com",
  projectId: "heathcare-ab5aa",
  storageBucket: "heathcare-ab5aa.appspot.com",
  messagingSenderId: "160649667093",
  appId: "1:160649667093:web:ad42dbaa790d9c0cc2641c",
  measurementId: "G-M3ZSFT8XQH"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const tableBody = document.querySelector("#patientsTable tbody");
const searchInput = document.getElementById("searchName");
const dateInput = document.getElementById("searchDate");

// Load patients
const loadPatients = async () => {
  tableBody.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "patients"));

  querySnapshot.forEach(docSnap => {
    const patient = docSnap.data();
    const lastSeenDate = patient.lastSeen?.toDate
      ? patient.lastSeen.toDate().toLocaleDateString()
      : "N/A";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${patient.name}</td>
      <td>${patient.age}</td>
      <td>${patient.condition}</td>
      <td>${lastSeenDate}</td>
      <td>
        <button onclick="viewPatient('${docSnap.id}')">View</button>
        <button onclick="updatePatient('${docSnap.id}')">Update</button>
        <button onclick="deletePatient('${docSnap.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
};

// View Patient (placeholder)
window.viewPatient = (id) => {
  alert("View patient " + id);
  // window.location.href = `view-patient.html?id=${id}`;
};

// Update Patient (placeholder)
window.updatePatient = (id) => {
  alert("Update patient " + id);
  // window.location.href = `edit-patient.html?id=${id}`;
};

// Delete Patient
window.deletePatient = async (id) => {
  if (confirm("Are you sure you want to delete this patient?")) {
    await deleteDoc(doc(db, "patients", id));
    alert("Patient deleted");
    loadPatients();
  }
};

// Filter
searchInput.addEventListener("input", () => filterTable());
dateInput.addEventListener("change", () => filterTable());

function filterTable() {
  const nameFilter = searchInput.value.toLowerCase();
  const dateFilter = dateInput.value;

  const rows = document.querySelectorAll("#patientsTable tbody tr");
  rows.forEach(row => {
    const name = row.cells[0].textContent.toLowerCase();
    const date = row.cells[3].textContent;

    const nameMatch = name.includes(nameFilter);
    const dateMatch = !dateFilter || date.includes(new Date(dateFilter).toLocaleDateString());

    row.style.display = nameMatch && dateMatch ? "" : "none";
  });
}

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});

// Auth check
onAuthStateChanged(auth, user => {
  if (user) {
    loadPatients();
  } else {
    window.location.href = "login.html";
  }
});
