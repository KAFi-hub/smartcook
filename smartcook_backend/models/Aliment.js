const db = require('../config/db'); // Votre connexion MySQL

const Aliment = {
  create: (data, callback) => {
    const query = `INSERT INTO aliment 
      (idInventaire, nom, quantite, unite, type, dateExpiration, calories, proteines, glucides, lipides, allergenes, marque, categorie, imageUrl, statut) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(query, [
      data.idInventaire, data.nom, data.quantite, data.unite, data.type, 
      data.dateExpiration, data.calories, data.proteines, data.glucides, data.lipides,
      data.allergenes, data.marque, data.categorie, data.imageUrl, 'disponible'
    ], callback);
  }
};

module.exports = Aliment;