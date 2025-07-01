const express = require('express');
const router = express.Router();
const Etudiant = require('../models/Etudiant');

const PDFDocument = require('pdfkit');

// Route POST d'inscription
router.post('/', async (req, res) => {
    const { nom_prenom, date_naissance, formation, date_formation, activite, telephone, whatsapp } = req.body;

    try {
        // Vérifier si une des combinaisons de 2 champs existe déjà
        const existing = await Etudiant.findOne({
            $or: [
                { nom_prenom, telephone },               // même nom + téléphone
                { nom_prenom, date_naissance },          // même nom + date naissance
                { date_naissance, telephone },           // même date naissance + téléphone
            ]
        });

        if (existing) {
            return res.status(400).json({ message: "⚠️ Une personne avec ces informations est déjà inscrite." });
        }

        // Enregistrement
        const etudiant = new Etudiant({
            nom_prenom,
            date_naissance,
            formation,
            date_formation,
            activite,
            telephone,
            whatsapp
        });

        await etudiant.save();

        res.status(201).json({ message: "✅ Inscription réussie !" });

    } catch (err) {
        res.status(500).json({ message: "❌ Erreur serveur", error: err.message });
    }
});




// routes/inscriptionRoute.js

router.get('/verifier', async (req, res) => {
    const { nom_prenom, date_naissance, telephone } = req.query;

    try {
        if (!telephone && !nom_prenom && !date_naissance) {
            return res.status(400).json({ message: "Paramètres insuffisants" });
        }

        const conditions = [];

        if (telephone) conditions.push({ telephone });
        if (telephone && nom_prenom) conditions.push({ telephone, nom_prenom });
        if (telephone && date_naissance) conditions.push({ telephone, date_naissance });
        if (nom_prenom && date_naissance) conditions.push({ nom_prenom, date_naissance });

        const exist = await Etudiant.findOne({
            $or: conditions
        });

        if (exist) {
            return res.status(200).json({ inscrit: true, nom: exist.nom_prenom });
        } else {
            return res.status(200).json({ inscrit: false });
        }

    } catch (err) {
        return res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});


// Obtenir tous les inscrits
router.get('/', async (req, res) => {
    try {
        const etudiants = await Etudiant.find().sort({ createdAt: -1 });
        res.json(etudiants);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});



// Confirmer un inscrit
router.patch('/confirmer/:id', async (req, res) => {
    try {
        const updated = await Etudiant.findByIdAndUpdate(
            req.params.id,
            { statut: 'Confirmée' },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

// Route pour modifier un inscrit

router.put('/:id', async (req, res) => {
    try {
        const updated = await Etudiant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});






router.get('/stats', async (req, res) => {
    try {
        const total = await Etudiant.countDocuments();
        const confirmees = await Etudiant.countDocuments({ statut: 'Confirmée' });
        const enAttente = await Etudiant.countDocuments({ statut: 'En attente' });

        const now = new Date();
        const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalCeMois = await Etudiant.countDocuments({
            createdAt: { $gte: debutMois }
        });

        const confirmeesCeMois = await Etudiant.countDocuments({
            statut: 'Confirmée',
            createdAt: { $gte: debutMois }
        });

        const enAttenteCeMois = await Etudiant.countDocuments({
            statut: 'En attente',
            createdAt: { $gte: debutMois }
        });

        // ✅ Calculs supplémentaires
        const tauxConfirmation = total > 0 ? Math.round((confirmees / total) * 100) : 0;
        const tauxConfirmationCeMois = totalCeMois > 0 ? Math.round((confirmeesCeMois / totalCeMois) * 100) : 0;
        const variationTaux = tauxConfirmationCeMois - tauxConfirmation;

        res.json({
            total,
            confirmees,
            enAttente,
            totalCeMois,
            confirmeesCeMois,
            enAttenteCeMois,
            tauxConfirmation,
            variationTaux
        });

    } catch (err) {
        res.status(500).json({ message: "Erreur stats", error: err.message });
    }
});




// Nombre d'inscriptions par formation
router.get('/stats/formations', async (req, res) => {
    try {
        const stats = await Etudiant.aggregate([
            { $group: { _id: "$formation", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Erreur stats formations", error: err.message });
    }
});






const puppeteer = require('puppeteer');
const generateFicheHTML = require('../utils/templateFiche');

router.get('/fiche/:id', async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.params.id);
    if (!etudiant) return res.status(404).send("Étudiant non trouvé");

    const html = generateFicheHTML(etudiant);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=fiche_etudiant.pdf');
    res.send(pdfBuffer);

  } catch (err) {
    console.error("Erreur génération PDF :", err);
    res.status(500).send("Erreur serveur lors de la génération du PDF.");
  }
});



// Obtenir un inscrit par ID
router.get('/:id', async (req, res) => {
    try {
        const etudiant = await Etudiant.findById(req.params.id);
        if (!etudiant) {
            return res.status(404).json({ message: "Inscription non trouvée" });
        }
        res.json(etudiant);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});




module.exports = router;
