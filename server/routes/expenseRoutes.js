const express = require('express');
const Expense = require('../models/Expense');
const protect = require('../middleware/authMiddleware');
const Group = require('../models/Group');
const Comment = require('../models/Comment');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { group, description, amount, splitAmong } = req.body;

    const groupDoc = await Group.findById(group);
    if (!groupDoc || !groupDoc.members.includes(req.userId)) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const expense = await Expense.create({
      group,
      description,
      amount,
      paidBy: req.userId,
      splitAmong,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:groupId', protect, async (req, res) => {
  const expenses = await Expense.find({ group: req.params.groupId }).populate('paidBy', 'name');
  res.json(expenses);
});

router.post('/:expenseId/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.create({
      expense: req.params.expenseId,
      user: req.userId,
      text,
    });
    const populated = await comment.populate('user', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:expenseId/comments', protect, async (req, res) => {
  const comments = await Comment.find({ expense: req.params.expenseId }).populate('user', 'name');
  res.json(comments);
});

module.exports = router;