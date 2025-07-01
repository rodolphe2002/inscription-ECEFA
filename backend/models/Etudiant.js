const mongoose = require('mongoose');

const etudiantSchema = new mongoose.Schema({
  nom_prenom: { type: String, required: true },
  date_naissance: { type: String, required: true },
  formation: String,
  date_formation: String,
  activite: String,
  telephone: { type: String, required: true },
  whatsapp: String,
  statut: {
    type: String,
    enum: ['En attente', 'Confirmée'],
    default: 'En attente'
  }
}, { timestamps: true });

module.exports = mongoose.model('Etudiant', etudiantSchema);
