import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import userRoutes from './users.js';
import authRoutes from './auth.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: false, allowedHeaders:['Content-Type','X-User-Id','X-User-Role'] }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((req,res)=>{ res.status(404).json({ error:'Not found' }); });
app.use((err,req,res,next)=>{
  console.error(err);
  res.status(err.status||500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=> console.log('API listening on '+PORT));
