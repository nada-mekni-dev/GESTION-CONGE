import express from 'express';
import db from '../db.js';
import generatePassword from 'generate-password';
import nodemailer from 'nodemailer';


const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    
    if (err) {
      console.log(err)
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (results.length === 0) return res.status(401).json({ message: 'Email introuvable' });

    const user = results[0];
    if (user.password !== password) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    res.json(user);
  });
});

router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const {
    name,
    email,
    department,
    leave_annual,
    leave_sick,
    leave_personal,
    password
  } = req.body;

  const query = `
    UPDATE users
    SET name = ?, email = ?, department = ?, leave_annual = ?, leave_sick = ?, leave_personal = ?, password = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [name, email, department, leave_annual, leave_sick, leave_personal, password, userId],
    (err, result) => {
      if (err) {
        console.error('Erreur de mise à jour :', err);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
      }

      // Renvoie les nouvelles infos
      db.query('SELECT * FROM users WHERE id = ?', [userId], (err2, rows) => {
        if (err2) return res.status(500).json({ message: 'Erreur lors du rechargement des données' });
        res.json(rows[0]);
      });
    }
  );
});

router.post('/employees', async (req, res) => {
  const {
    name,
    email,
    department,
    leave_annual = 0,
    leave_sick = 0,
    leave_personal = 0
  } = req.body;

  const role = 'employee';

  // Générer un mot de passe aléatoire
  const password = generatePassword.generate({
    length: 10,
    numbers: true,
    uppercase: true,
    lowercase: true
  });

  const query = `
    INSERT INTO users (name, email, password, department, leave_annual, leave_sick, leave_personal, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, email, password, department, leave_annual, leave_sick, leave_personal, role],
    async (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'ajout de l\'employé :', err);
        return res.status(500).json({ message: 'Erreur serveur lors de l\'ajout' });
      }

      // Envoyer le mot de passe par email
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'nada.mekni@sesame.com.tn',         // 🔐 à remplacer
            pass: 'tolj bipm lqua nteu' // 🔐 mot de passe d'application
          },
          tls:{
            rejectUnauthorized : false
          }
        });

        const mailOptions = {
          from: 'nada.mekni@sesame.com.tn',
          to: email,
          subject: 'Votre compte a été créé',
          text: `Bonjour ${name},\n\nVotre compte a été créé avec succès.\nVoici votre mot de passe : ${password}\n\nVeuillez le changer après connexion.`
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email :', emailError);
        return res.status(500).json({ message: 'Employé ajouté mais échec d\'envoi de l\'email.' });
      }

      res.status(201).json({ message: 'Employé ajouté et email envoyé avec succès', id: result.insertId });
    }
  );
});



router.get('/employees', (req, res) => {
  db.query('SELECT * FROM users WHERE role = ?', ['employee'], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des employés :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json(results);
  });
});

router.get('/employees/:id', (req, res) => {
  const userId = req.params.id;
  db.query('SELECT * FROM users WHERE role = ? and id = ?', ['employee',userId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des employés :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json(results);
  });
});


export default router;

