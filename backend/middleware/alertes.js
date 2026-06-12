// middleware/alertes.js
const { verifierAlertesAutomatiques } = require('../services/notificationService');

// Middleware qui vérifie les alertes après chaque inscription
function alertesMiddleware(req, res, next) {
  // Sauvegarder la fonction json originale
  const originalJson = res.json;

  res.json = function(data) {
    // Restaurer la fonction originale
    res.json = originalJson;

    // Si c'est une inscription réussie, vérifier les alertes
    if (req.path.includes('/inscrire') && data.inscription) {
      const campagneId = data.inscription.campagneId;
      // Vérifier async sans bloquer la réponse
      verifierAlertesAutomatiques(campagneId).catch(err => {
        console.error('[ALERTES MIDDLEWARE ERROR]', err);
      });
    }

    return res.json(data);
  };

  next();
}

module.exports = { alertesMiddleware };