-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 20 juin 2025 à 20:07
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_conge`
--

-- --------------------------------------------------------

--
-- Structure de la table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `leave_type` enum('annual','sick','personal','maternity','paternity') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `applied_date` date NOT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `manager_comment` text DEFAULT NULL,
  `days` int(11) DEFAULT NULL,
  `employee_mail` varchar(100) DEFAULT NULL,
  `employee_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type`, `start_date`, `end_date`, `reason`, `status`, `applied_date`, `manager_id`, `manager_comment`, `days`, `employee_mail`, `employee_name`) VALUES
(2, 1, 'sick', '2025-06-24', '2025-06-27', 'xxxx', 'approved', '2025-06-20', 2, 'test', 4, 'sarraahmed125@gmail.com', 'sarra ahmed'),
(3, 2, 'personal', '2025-06-24', '2025-06-30', 'vacances ', 'pending', '2025-06-20', NULL, NULL, 7, 'nadaa.mekni@sesame.com.tn', 'Nada Mekni');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `leave_annual` int(11) DEFAULT 25,
  `leave_sick` int(11) DEFAULT 10,
  `leave_personal` int(11) DEFAULT 5,
  `role` enum('employee','manager') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `department`, `leave_annual`, `leave_sick`, `leave_personal`, `role`) VALUES
(1, 'sarra ahmed', 'sarraahmed125@gmail.com', 'IxPYaSbB9R', 'Marketing', 30, 10, 5, 'employee'),
(2, 'Nada Mekni', 'nadaa.mekni@sesame.com.tn', 'I7I7qoFF1q', 'Ressource Humaine', 20, 10, 20, 'manager'),
(4, 'Dorsaf naffeti', 'dorsaf.naffeti@sesame.com.tn', 'zqJndkQUsA', 'developpement It', 10, 10, 10, 'employee');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
