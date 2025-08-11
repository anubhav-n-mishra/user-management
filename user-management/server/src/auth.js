import { Router } from 'express';
import { connection } from './db.js';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/signup', async (req,res,next)=>{
  try {
    const { name, email, password, profile = {} } = req.body;
    if(!name || !email || !password) return res.status(400).json({ error:'Name, email and password are required' });
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?',[email]);
    if(existing.length) return res.status(409).json({ error:'User already exists' });
    const hash = await bcrypt.hash(password,10);
    await connection.execute('INSERT INTO users (name,email,password,role,bio,phone,address) VALUES (?,?,?,?,?,?,?)',[
      name,email,hash,'user',profile.bio||'',profile.phone||'',profile.address||''
    ]);
    const [rows] = await connection.execute('SELECT id,name,email,role,bio,phone,address,created_at FROM users WHERE email=?',[email]);
    const u = rows[0];
    res.json(formatUser(u));
  } catch(e){ next(e); }
});

router.post('/signin', async (req,res,next)=>{
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error:'Email and password are required' });
    const [rows] = await connection.execute('SELECT * FROM users WHERE email=?',[email]);
    if(!rows.length) return res.status(401).json({ error:'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(401).json({ error:'Invalid credentials' });
    res.json(formatUser(user));
  } catch(e){ next(e); }
});

function formatUser(u){
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    profile: { bio: u.bio, phone: u.phone, address: u.address },
    createdAt: u.created_at
  };
}

export default router;
