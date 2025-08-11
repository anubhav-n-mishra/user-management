import 'dotenv/config';
import { connection } from '../src/db.js';

async function migrate() {
  await connection.execute(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','user') DEFAULT 'user',
    bio TEXT,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?',[ 'admin@example.com']);
  if(rows.length === 0){
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.default.hash('admin123',10);
    await connection.execute('INSERT INTO users (name,email,password,role,bio,phone,address,created_by) VALUES (?,?,?,?,?,?,?,?)',[
      'Admin User','admin@example.com',hash,'admin','System Administrator','+91 98765 43210','Admin Office','seed'
    ]);
    console.log('Seeded admin user.');
  } else {
    console.log('Admin user already present.');
  }
  await connection.end();
  console.log('Migration complete.');
}

migrate().catch(err=>{ console.error(err); process.exit(1); });
