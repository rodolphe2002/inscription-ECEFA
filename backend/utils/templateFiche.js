// utils/templateFiche.js

module.exports = function generateFicheHTML(etudiant) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          margin: 40px;
          background: #f7f7f7;
          color: #2c3e50;
        }
        .fiche-container {
          background: #fff;
          border-radius: 10px;
          padding: 40px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #3498db;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 26px;
          color: #3498db;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
          border-left: 4px solid #3498db;
          padding-left: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 200px 1fr;
          row-gap: 10px;
        }
        .label { font-weight: bold; color: #555; }
        .value { color: #000; }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          margin-top: 40px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="fiche-container">
        <div class="header">
          <h1>Fiche d’inscription</h1>
        </div>
        <div>
          <div class="section-title">Informations de l'étudiant</div>
          <div class="info-grid">
            <div class="label">Nom et Prénom :</div><div class="value">${etudiant.nom_prenom}</div>
            <div class="label">Date de naissance :</div><div class="value">${etudiant.date_naissance || '—'}</div>
            <div class="label">Formation :</div><div class="value">${etudiant.formation || '—'}</div>
            <div class="label">Date de formation :</div><div class="value">${etudiant.date_formation || '—'}</div>
            <div class="label">Activité :</div><div class="value">${etudiant.activite || '—'}</div>
            <div class="label">Téléphone :</div><div class="value">${etudiant.telephone}</div>
            <div class="label">WhatsApp :</div><div class="value">${etudiant.whatsapp || '—'}</div>
            <div class="label">Statut :</div><div class="value">${etudiant.statut || 'En attente'}</div>
            <div class="label">Date d’inscription :</div><div class="value">${new Date(etudiant.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <div class="footer">
          Document généré automatiquement – Merci de vérifier les informations.
        </div>
      </div>
    </body>
    </html>
  `;
}
