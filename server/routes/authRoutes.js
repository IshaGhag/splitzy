const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

module.exports = router;