import { signAdminToken } from '../middleware/auth.js';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kitaberaofficial';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ':)65&tk$|';

export function login(req, res) {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ message: 'Invalid admin credentials.' });
    return;
  }

  res.json({
    token: signAdminToken(),
    admin: { username: ADMIN_USERNAME }
  });
}
