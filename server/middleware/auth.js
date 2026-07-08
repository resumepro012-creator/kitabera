import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kitab-era-secret';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kitaberaofficial';

export function signAdminToken() {
  return jwt.sign({ role: 'admin', username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '12h' });
}

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Admin token is required.' });
    return;
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Admin session expired.' });
  }
}
