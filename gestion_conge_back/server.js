import express from 'express';
import cors from 'cors';
import userRoutes from './routes/users.js'; // <- note le ".js" obligatoire
import leavesRouter from './routes/leaves.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/leaves', leavesRouter);

const PORT = 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
