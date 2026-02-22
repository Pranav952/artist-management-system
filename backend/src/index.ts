import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes';


dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);


app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
