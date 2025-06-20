import express from 'express';
import db from '../db.js';
import nodemailer from 'nodemailer';
import util from 'util';
const queryAsync = util.promisify(db.query).bind(db); // Ajoute ça en haut, après `db`

const router = express.Router();
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR'); // Format JJ/MM/AAAA français
};

// Obtenir toutes les demandes de congé
router.get('/', (req, res) => {
  db.query('SELECT * FROM leave_requests', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json(results);
  });
});

// Obtenir les demandes d'un utilisateur spécifique
router.get('/user/:employeeId', (req, res) => {
  const { employeeId } = req.params;

  db.query(
    'SELECT * FROM leave_requests WHERE employee_id = ?',
    [employeeId],
    (err, results) => {
      if (err) {
        console.error('Erreur récupération employé :', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json(results);
    }
  );
});

// Créer une nouvelle demande de congé
router.post('/', (req, res) => {
  const {
    employee_id,
    employee_mail,
    employee_name,
    leave_type,
    start_date,
    end_date,
    reason,
    days
  } = req.body;

  const applied_date = new Date().toISOString().split('T')[0]; // Date du jour
  const status = 'pending';

  const query = `
    INSERT INTO leave_requests 
    (employee_id,employee_mail, employee_name, leave_type, start_date, end_date, reason, status, applied_date, days) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
  `;

  db.query(
    query,
    [employee_id,employee_mail, employee_name, leave_type, start_date, end_date, reason, status, applied_date, days],
    (err, result) => {
      if (err) {
        console.error('Erreur création :', err);
        return res.status(500).json({ message: 'Erreur lors de la création de la demande' });
      }

      res.status(201).json({ message: 'Demande créée', id: result.insertId });
    }
  );
});

// Mettre à jour le statut (approbation ou rejet)
router.put('/:id/status', async(req, res) => {
  const requestId = req.params.id;
  const { status,manager_comment,manager_id} = req.body;

 const query = `
    UPDATE leave_requests 
    SET status = ?, manager_comment = ?, manager_id = ? 
    WHERE id = ?
  `;
  try {
    await queryAsync(query, [status, manager_comment, manager_id, requestId]);

    const [leave] = await queryAsync('SELECT * FROM leave_requests WHERE id = ?', [requestId]);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nada.mekni@sesame.com.tn',
        pass: 'tolj bipm lqua nteu'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: 'nada.mekni@sesame.com.tn',
      to: leave.employee_mail,
      subject: 'Approbation de la demande de congé',
      text: `Bonjour ${leave.employee_name},\n Votre demande de congé a été approuvée avec succès.\n 🗓 Type de congé : ${leave.leave_type} \n 📅 Du ${formatDate(leave.start_date)} au ${formatDate(leave.end_date)} (${leave.days} jours) \n 📝 Motif : ${leave.reason} \n Commentaire du responsable : ${leave.manager_comment} \n Merci de prendre les dispositions nécessaires. \n Cordialement, \n L’équipe RH`
    };
    if (status ==='approved'){
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Statut mis à jour et email envoyé.' });
    }
  } catch (err) {
    console.error('Erreur mise à jour ou email :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }

});

// Supprimer une demande si son statut est "pending"
router.delete('/:id', (req, res) => {
  const requestId = req.params.id;

  // Vérifie d'abord si la demande est en statut "pending"
  db.query('SELECT status FROM leave_requests WHERE id = ?', [requestId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification du statut :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    const status = results[0].status;

    if (status !== 'pending') {
      return res.status(400).json({ message: 'Seules les demandes en attente peuvent être supprimées' });
    }

    // Supprimer la demande
    db.query('DELETE FROM leave_requests WHERE id = ?', [requestId], (err2, result) => {
      if (err2) {
        console.error('Erreur lors de la suppression :', err2);
        return res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
      }

      res.json({ message: 'Demande supprimée avec succès' });
    });
  });
});


export default router;