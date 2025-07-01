        const BASE_URL = "http://localhost:3000";
        
        
        // Création des bulles d'animation de fond
        const bgAnimation = document.getElementById('bgAnimation');
        for (let i = 0; i < 20; i++) {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            
            // Taille aléatoire
            const size = Math.random() * 100 + 20;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            // Position aléatoire
            bubble.style.left = `${Math.random() * 100}%`;
            
            // Délai d'animation aléatoire
            bubble.style.animationDelay = `${Math.random() * 15}s`;
            
            // Durée d'animation aléatoire
            bubble.style.animationDuration = `${10 + Math.random() * 20}s`;
            
            bgAnimation.appendChild(bubble);
        }

        // Animation au focus des champs
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.parentElement.style.transform = 'translateZ(30px)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.parentElement.style.transform = 'translateZ(0)';
            });
        });

        // Animation du bouton
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.addEventListener('mouseenter', () => {
            submitBtn.querySelector('i').style.transform = 'translateX(5px)';
        });
        
        submitBtn.addEventListener('mouseleave', () => {
            submitBtn.querySelector('i').style.transform = 'translateX(0)';
        });

        // Animation de la carte au mouvement de la souris
        const card = document.querySelector('.card');
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        // Réinitialiser la rotation quand la souris quitte la carte
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateY(0deg) rotateX(0deg)';
            card.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                card.style.transition = '';
            }, 500);
        });

        // Animation d'entrée
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });








// Fonction pour créer une clé unique locale (navigateur)
function generateLocalKey(nom, telephone) {
    return `ecefa_${nom.trim().toLowerCase().replace(/\s+/g, '_')}_${telephone.trim()}`;
}

// Ciblage du formulaire
const form = document.querySelector("form");

// Attente du DOM chargé pour bloquer si déjà inscrit
document.addEventListener("DOMContentLoaded", () => {
    const nom = localStorage.getItem('nom_inscrit');
    const tel = localStorage.getItem('tel_inscrit');

    if (nom && tel) {
        const localKey = generateLocalKey(nom, tel);
        if (localStorage.getItem(localKey) === '1') {
            // ✅ Personnalisation du message
            const presentationText = document.getElementById("presentationText");
            if (presentationText) {
                presentationText.textContent = `Bonjour Monsieur ${nom}, vous êtes déjà inscrit pour votre formation. Nous vous attendons dans nos locaux pour la prochaine étape du processus.`;
            }

            // Cacher le formulaire
            form.style.display = "none";
        }
    }
});


// Soumission du formulaire
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        nom_prenom: document.getElementById("nom_prenom").value,
        date_naissance: document.getElementById("date_naissance").value,
        formation: document.getElementById("formation").value,
        date_formation: document.getElementById("date_formation").value,
        activite: document.getElementById("activite").value,
        telephone: document.getElementById("telephone").value,
        whatsapp: document.getElementById("whatsapp").value,
    };

    const localKey = generateLocalKey(data.nom_prenom, data.telephone);

    // Vérifie si déjà inscrit en local
    if (localStorage.getItem(localKey) === '1') {
        alert("⚠️ Vous êtes déjà inscrit depuis ce navigateur.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/inscription`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            alert(result.message);
            localStorage.setItem(localKey, '1');
            localStorage.setItem('nom_inscrit', data.nom_prenom);
            localStorage.setItem('tel_inscrit', data.telephone);
            form.reset();
            form.style.display = "none";
        } else {
            alert(result.message);
        }

    } catch (err) {
        alert("❌ Erreur de connexion au serveur.");
    }
});




function verifierInscriptionAuto() {
    const nom = document.getElementById("nom_prenom").value.trim();
    const naissance = document.getElementById("date_naissance").value;
    const tel = document.getElementById("telephone").value.trim();

    // Vérifie uniquement si au moins 2 champs sont remplis
    let count = [nom, naissance, tel].filter(Boolean).length;
    if (count < 2) return;

    const url = `${BASE_URL}/api/inscription/verifier?` +
                `nom_prenom=${encodeURIComponent(nom)}&` +
                `date_naissance=${encodeURIComponent(naissance)}&` +
                `telephone=${encodeURIComponent(tel)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.inscrit) {
                const presentationText = document.getElementById("presentationText");
                if (presentationText) {
                    presentationText.textContent = `Bonjour Monsieur ${data.nom}, vous êtes déjà inscrit pour votre formation. Nous vous attendons dans nos locaux pour la prochaine étape du processus.`;
                }

                form.style.display = "none";
                localStorage.setItem(generateLocalKey(nom, tel), '1');
                localStorage.setItem('nom_inscrit', nom);
                localStorage.setItem('tel_inscrit', tel);
            }
        })
        .catch(err => console.error("Erreur vérification auto :", err));
}

// Lancer la vérification après avoir rempli les champs
["nom_prenom", "date_naissance", "telephone"].forEach(id => {
    document.getElementById(id).addEventListener("blur", verifierInscriptionAuto);
});





// Vérifier dans la base de données au chargement si données déjà stockées localement

document.addEventListener("DOMContentLoaded", () => {
    const nom = localStorage.getItem('nom_inscrit');
    const tel = localStorage.getItem('tel_inscrit');

    if (nom && tel) {
        const url = `${BASE_URL}/api/inscription/verifier?` +
                    `nom_prenom=${encodeURIComponent(nom)}&` +
                    `telephone=${encodeURIComponent(tel)}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.inscrit) {
                    const presentationText = document.getElementById("presentationText");
                    if (presentationText) {
                        presentationText.textContent = `Bonjour Monsieur ${data.nom}, vous êtes déjà inscrit pour votre formation. Nous vous attendons dans nos locaux pour la prochaine étape du processus.`;
                    }

                    form.style.display = "none";
                }
            })
            .catch(err => console.error("Erreur lors de la vérification automatique :", err));
    }
});




// cookies


document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('cookiePopup');
  const acceptBtn = popup.querySelector('.acceptButton');
  const declineBtn = popup.querySelector('.declineButton');

  // Affiche la popup avec animation fade-in après un délai
  setTimeout(() => {
    popup.style.display = 'block';  // <-- ici on force l'affichage
    popup.classList.add('show');
  }, 300);

  // Fonction pour cacher la popup avec animation fade-out
  function hidePopup() {
    popup.classList.remove('show');
    popup.classList.add('fade-out');

    setTimeout(() => {
      popup.style.display = 'none';
      popup.classList.remove('fade-out');
    }, 600);
  }

  acceptBtn.addEventListener('click', () => {
    console.log('Cookies accepted');
    hidePopup();
  });

  declineBtn.addEventListener('click', () => {
    console.log('Cookies declined');
    hidePopup();
  });
});
