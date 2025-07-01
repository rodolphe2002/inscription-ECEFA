// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://inscription-ecefa.onrender.com";

let idEtudiantSelectionne = null;


function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/connectAdmin.html";
    return null;
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

async function fetchWithAuth(url, options = {}) {
  const headers = getAuthHeaders();
  if (!headers) return;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/connectAdmin.html";
      return;
    }

    return res;
  } catch (err) {
    console.error("Erreur fetch sécurisée :", err);
    throw err;
  }
}


// ------------------ Animation de fond ------------------
const bgAnimation = document.getElementById('bgAnimation');
for (let i = 0; i < 15; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    const size = Math.random() * 120 + 30;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.animationDelay = `${Math.random() * 20}s`;
    bubble.style.animationDuration = `${15 + Math.random() * 25}s`;

    bgAnimation.appendChild(bubble);
}

// ------------------ Hover Cards ------------------
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const x = e.pageX - card.offsetLeft;
        const y = e.pageY - card.offsetTop;
        const centerX = card.offsetWidth / 2;
        const centerY = card.offsetHeight / 2;

        const angleY = (x - centerX) / 25;
        const angleX = (centerY - y) / 25;

        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.05)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// ------------------ Hover sur tableau ------------------
document.querySelectorAll('tbody').forEach(tbody => {
    tbody.addEventListener('mouseover', e => {
        const row = e.target.closest('tr');
        if (row) row.style.transform = 'translateX(10px)';
    });

    tbody.addEventListener('mouseout', e => {
        const row = e.target.closest('tr');
        if (row) row.style.transform = 'translateX(0)';
    });
});

// ------------------ Graphiques ------------------
// ------------------ Graphique Formations ------------------
const formationsCtx = document.getElementById('formationsChart').getContext('2d');
const formationsChart = new Chart(formationsCtx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: "Nombre d'inscriptions",
            data: [],
            backgroundColor: [
                'rgba(67, 97, 238, 0.7)',
                'rgba(58, 12, 163, 0.7)',
                'rgba(76, 201, 240, 0.7)',
                'rgba(46, 196, 182, 0.7)',
                'rgba(255, 158, 0, 0.7)'
            ],
            borderColor: [
                'rgb(67, 97, 238)',
                'rgb(58, 12, 163)',
                'rgb(76, 201, 240)',
                'rgb(46, 196, 182)',
                'rgb(255, 158, 0)'
            ],
            borderWidth: 1,
            borderRadius: 10,
            borderSkipped: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true },
            x: { grid: { display: false } }
        }
    }
});

// ------------------ Graphique Statuts (doughnut) ------------------
const statusCtx = document.getElementById('statusChart').getContext('2d');
const statusChart = new Chart(statusCtx, {
    type: 'doughnut',
    data: {
        labels: ['Confirmées', 'En attente'],
        datasets: [{
            data: [0, 0],
            backgroundColor: [
                'rgba(46, 196, 182, 0.8)',
                'rgba(255, 158, 0, 0.8)'
            ],
            borderColor: [
                'rgb(46, 196, 182)',
                'rgb(255, 158, 0)'
            ],
            borderWidth: 1,
            hoverOffset: 15
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        }
    }
});

// ------------------ Mise à jour du graphique doughnut ------------------
async function majStatusChart(chart) {
    try {
        const res = await fetchWithAuth(`${BASE_URL}/api/inscription/stats`);
        const data = await res.json();
        const { confirmees, enAttente } = data;

        chart.data.labels = ['Confirmées', 'En attente'];
        chart.data.datasets[0].data = [confirmees, enAttente];
        chart.update();
    } catch (err) {
        console.error("Erreur maj graphique doughnut", err);
    }
}


async function majFormationsChart(chart) {
    try {
        const res = await fetchWithAuth(`${BASE_URL}/api/inscription/stats/formations`);
        const data = await res.json();
        chart.data.labels = data.map(item => item._id || "Inconnue");
        chart.data.datasets[0].data = data.map(item => item.count);
        chart.update();
    } catch (err) {
        console.error("Erreur maj graphique formations", err);
    }
}

// ------------------ Charger les inscriptions ------------------
async function chargerInscriptions(filtre = "") {
    const tbody = document.getElementById("inscriptionsBody");
    tbody.innerHTML = "";

    try {
        const res = await fetchWithAuth(`${BASE_URL}/api/inscription`);
        const inscrits = await res.json();

        const resultat = inscrits.filter(inscrit =>
            inscrit.nom_prenom.toLowerCase().includes(filtre.toLowerCase()) ||
            inscrit.telephone.toLowerCase().includes(filtre.toLowerCase())
        );

        resultat.forEach(inscrit => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${inscrit.nom_prenom}</td>
                <td>${inscrit.formation || ''}</td>
                <td>${new Date(inscrit.createdAt).toLocaleDateString()}</td>
                <td>${inscrit.telephone}</td>
                <td><span class="status ${inscrit.statut === 'Confirmée' ? 'confirmed' : 'pending'}">${inscrit.statut}</span></td>
                <td class="actions">
                    <button class="action-btn view" data-id="${inscrit._id}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" data-id="${inscrit._id}"><i class="fas fa-edit"></i></button>
                </td>
            `;

            // ✅ Double-clic pour sélectionner et activer PDF
            tr.addEventListener('dblclick', () => {
                idEtudiantSelectionne = inscrit._id;
                document.querySelectorAll('tbody tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
                window.open(`${BASE_URL}/api/inscription/fiche/${idEtudiantSelectionne}`, "_blank");
            });

            // Sélectionner une ligne et activer le bouton PDF
tr.addEventListener('dblclick', () => {
    idEtudiantSelectionne = inscrit._id;
    activerBoutonPDF(inscrit._id);
    
    document.querySelectorAll('tbody tr').forEach(r => r.classList.remove('selected'));
    tr.classList.add('selected');
});


            tbody.appendChild(tr);
        });

        // Actions : confirmer
        document.querySelectorAll('.view').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                await fetchWithAuth(`${BASE_URL}/api/inscription/confirmer/${id}`, { method: "PATCH" });
                chargerInscriptions(document.getElementById("searchInput").value);
            });
        });

        // Actions : modifier
        // document.querySelectorAll('.edit').forEach(btn => {
        //     btn.addEventListener('click', async () => {
        //         const id = btn.dataset.id;
        //         const nouveauNom = prompt("Modifier le nom et prénom :");
        //         if (nouveauNom) {
        //             await fetch(`http://localhost:3000/api/inscription/${id}`, {
        //                 method: "PUT",
        //                 headers: { "Content-Type": "application/json" },
        //                 body: JSON.stringify({ nom_prenom: nouveauNom })
        //             });
        //             chargerInscriptions(document.getElementById("searchInput").value);
        //         }
        //     });
        // });

    } catch (err) {
        console.error("Erreur chargement des inscriptions", err);
    }
}

// ------------------ Statistiques ------------------
async function chargerStatistiques() {
    try {
        const res = await fetchWithAuth(`${BASE_URL}/api/inscription/stats`);
        const data = await res.json();

        const {
            total, confirmees, enAttente,
            totalCeMois, confirmeesCeMois, enAttenteCeMois,
            tauxConfirmation, variationTaux
        } = data;

        document.getElementById("stat-total").textContent = total;
        document.getElementById("stat-confirmees").textContent = confirmees;
        document.getElementById("stat-attente").textContent = enAttente;

        document.getElementById("var-total").textContent = `${Math.round((totalCeMois / total) * 100 || 0)}% ce mois`;
        document.getElementById("var-confirmees").textContent = `${Math.round((confirmeesCeMois / confirmees) * 100 || 0)}% ce mois`;
        document.getElementById("var-attente").textContent = `${Math.round((enAttenteCeMois / enAttente) * 100 || 0)}% ce mois`;

        document.getElementById("taux-confirmation").textContent = `${tauxConfirmation}%`;
        document.getElementById("var-confirmation").textContent = `${variationTaux >= 0 ? '+' : ''}${variationTaux}% ce mois`;
    } catch (err) {
        console.error("Erreur chargement stats", err);
    }
}

// ------------------ Initialisation ------------------
document.addEventListener("DOMContentLoaded", () => {
    chargerInscriptions();
    chargerStatistiques();
    majStatusChart(statusChart);
    majFormationsChart(formationsChart);
});

// ------------------ Barre de recherche ------------------
document.getElementById("searchInput").addEventListener("input", (e) => {
    const filtre = e.target.value;
    chargerInscriptions(filtre);
});




// ------------------ Bouton PDF ------------------
const btnDownloadPDF = document.getElementById("btnDownloadPDF");

// Activer le bouton dès qu’un étudiant est sélectionné
function activerBoutonPDF(id) {
    idEtudiantSelectionne = id;
    btnDownloadPDF.disabled = false;
}

// Téléchargement au clic
btnDownloadPDF.addEventListener("click", () => {
    if (idEtudiantSelectionne) {
        window.open(`${BASE_URL}/api/inscription/fiche/${idEtudiantSelectionne}`, "_blank");
    }
});




document.addEventListener("DOMContentLoaded", () => {
  const profile = document.querySelector(".user-profile");
  const dropdown = document.getElementById("adminDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle menu on click
  profile.addEventListener("click", () => {
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
  });

  // Cacher le menu si on clique ailleurs
  document.addEventListener("click", (e) => {
    if (!profile.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  // Déconnexion
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/connectAdmin.html"; 
  });
});




// ------------------ MODAL EDITION ------------------
const modal = document.getElementById('editModal');
const closeModal = document.getElementById('closeEditModal');
const editForm = document.getElementById('editForm');
let currentEditId = null;

closeModal.addEventListener('click', () => modal.style.display = 'none');

// Sur clic "edit", ouvrir modale et charger les données
document.addEventListener('click', async (e) => {
  if (e.target.closest('.action-btn.edit')) {
    const btn = e.target.closest('.action-btn.edit');
    currentEditId = btn.dataset.id;

    try {
      const res = await fetchWithAuth(`${BASE_URL}/api/inscription/${currentEditId}`);
      if (!res.ok) throw new Error("Étudiant introuvable");
      const data = await res.json();

      // Remplir les champs du formulaire
      editForm.nom_prenom.value = data.nom_prenom || '';
      editForm.formation.value = data.formation || '';
      editForm.createdAt.value = data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '';

      modal.style.display = 'block';
    } catch (err) {
      console.error("Erreur chargement étudiant", err);
      alert("Impossible de charger les données.");
    }
  }
});

// Soumission du formulaire d’édition
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    nom_prenom: editForm.nom_prenom.value,
    formation: editForm.formation.value,
    createdAt: editForm.createdAt.value
  };

  try {
    await fetchWithAuth(`${BASE_URL}/api/inscription/${currentEditId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    modal.style.display = 'none';
    chargerInscriptions(document.getElementById("searchInput").value);
  } catch (err) {
    console.error("Erreur mise à jour", err);
    alert("Erreur lors de la mise à jour.");
  }
});
