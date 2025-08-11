import { Router } from 'express';
import { connection } from './db.js';

const router = Router();

// Auth middleware using headers
router.use((req,res,next)=>{
  const userId = req.header('X-User-Id');
  const role = req.header('X-User-Role');
  if(!userId || !role) return res.status(401).json({ error:'Authentication required' });
  req.auth = { userId: Number(userId), role };
  next();
});

router.get('/', async (req,res,next)=>{
  try {
    if(req.auth.role === 'admin'){
      const [rows] = await connection.execute('SELECT id,name,email,role,bio,phone,address,created_at,created_by FROM users ORDER BY created_at DESC');
      return res.json(rows.map(formatUser));
    } else {
      const [rows] = await connection.execute('SELECT id,name,email,role,bio,phone,address,created_at,created_by FROM users WHERE id=?',[req.auth.userId]);
      return res.json(rows.map(formatUser));
    }
  } catch(e){ next(e); }
});

router.get('/:id', async (req,res,next)=>{
  try {
    const id = Number(req.params.id);
    if(req.auth.role !== 'admin' && id !== req.auth.userId) return res.status(403).json({ error:'Access denied' });
    const [rows] = await connection.execute('SELECT id,name,email,role,bio,phone,address,created_at,created_by FROM users WHERE id=?',[id]);
    if(!rows.length) return res.status(404).json({ error:'User not found' });
    res.json(formatUser(rows[0]));
  } catch(e){ next(e); }
});

router.post('/', async (req,res,next)=>{
  try {
    if(req.auth.role !== 'admin') return res.status(403).json({ error:'Only administrators can create users' });
    const { name, email, profile = {}, role = 'user', createdBy } = req.body;
    if(!name || !email) return res.status(400).json({ error:'Name and email are required' });
    const [dup] = await connection.execute('SELECT id FROM users WHERE email=?',[email]);
    if(dup.length) return res.status(409).json({ error:'User already exists' });
    const hash = await (await import('bcrypt')).default.hash('user123',10);
    const newRole = ['admin','user'].includes(role) ? role : 'user';
    await connection.execute('INSERT INTO users (name,email,password,role,bio,phone,address,created_by) VALUES (?,?,?,?,?,?,?,?)',[
      name,email,hash,newRole,profile.bio||'',profile.phone||'',profile.address||'',createdBy||null
    ]);
    const [rows] = await connection.execute('SELECT id,name,email,role,bio,phone,address,created_at,created_by FROM users WHERE email=?',[email]);
    res.json(formatUser(rows[0]));
  } catch(e){ next(e); }
});

router.put('/:id', async (req,res,next)=>{
  try {
    const id = Number(req.params.id);
    if(req.auth.role !== 'admin' && id !== req.auth.userId) return res.status(403).json({ error:'Access denied' });
    const { name, email, profile = {}, role } = req.body;
    const [exists] = await connection.execute('SELECT id,role FROM users WHERE id=?',[id]);
    if(!exists.length) return res.status(404).json({ error:'User not found' });
    const fields = ['name = ?','email = ?','bio = ?','phone = ?','address = ?'];
    const params = [name,email,profile.bio||'',profile.phone||'',profile.address||''];
    if(req.auth.role === 'admin' && role && ['admin','user'].includes(role)) {
      if(id === req.auth.userId && role !== 'admin') return res.status(400).json({ error:'You cannot remove your own admin role' });
      fields.push('role = ?');
      params.push(role);
    }
    params.push(id);
    await connection.execute(`UPDATE users SET ${fields.join(', ')} WHERE id=?`, params);
    const [rows] = await connection.execute('SELECT id,name,email,role,bio,phone,address,created_at,created_by FROM users WHERE id=?',[id]);
    res.json(formatUser(rows[0]));
  } catch(e){ next(e); }
});

router.delete('/:id', async (req,res,next)=>{
  try {
    const id = Number(req.params.id);
    if(req.auth.role !== 'admin') return res.status(403).json({ error:'Only administrators can delete users' });
    if(id === req.auth.userId) return res.status(403).json({ error:'You cannot delete your own account' });
    const [exists] = await connection.execute('SELECT id FROM users WHERE id=?',[id]);
    if(!exists.length) return res.status(404).json({ error:'User not found' });
    await connection.execute('DELETE FROM users WHERE id=?',[id]);
    res.json({ message:'User deleted successfully' });
  } catch(e){ next(e); }
});

function formatUser(u){
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    profile: { bio: u.bio, phone: u.phone, address: u.address },
    createdAt: u.created_at,
    createdBy: u.created_by || null
  };
}

export default router;
