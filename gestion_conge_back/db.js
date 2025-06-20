import mysql from 'mysql2';

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gestion_conge',
  port: 3306,
});

export default db;
