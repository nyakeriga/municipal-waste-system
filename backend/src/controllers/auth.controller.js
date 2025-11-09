const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const config = require('../config/default.json');

class AuthController {
  async login(req, res) {
    const { username, password } = req.body;

    try {
      const result = await db.query(
        'SELECT id, username, password_hash, role_id FROM users WHERE username = $1 AND is_active = true',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, roleId: user.role_id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({ token, userId: user.id, username: user.username });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async register(req, res) {
    const { username, email, password, fullName, roleId } = req.body;

    try {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await db.query(
        `INSERT INTO users (username, email, password_hash, full_name, role_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, email, full_name`,
        [username, email, passwordHash, fullName, roleId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.constraint === 'users_username_key') {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (error.constraint === 'users_email_key') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
      const userResult = await db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      const validPassword = await bcrypt.compare(
        currentPassword,
        userResult.rows[0].password_hash
      );

      if (!validPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(12);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      await db.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, userId]
      );

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();
