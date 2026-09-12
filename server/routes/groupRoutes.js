const express = require('express');
const Group = require('../models/Group');
const protect = require('../middleware/authMiddleware');
const Expense = require('../models/Expense');
const settleBalances = require('../utils/settle');
const User = require('../models/User');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { name, members } = req.body;
    const group = await Group.create({
      name,
      members: [...members, req.userId],
      createdBy: req.userId,
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  const groups = await Group.find({ members: req.userId }).populate('members', 'name email');
  res.json(groups);
});

router.get('/:groupId/balances', protect, async (req, res) => {
  const expenses = await Expense.find({ group: req.params.groupId });

  const balances = {};

  expenses.forEach((exp) => {
    const share = exp.amount / exp.splitAmong.length;

    const payer = exp.paidBy.toString();
    balances[payer] = (balances[payer] || 0) + exp.amount;

    exp.splitAmong.forEach((userId) => {
      const id = userId.toString();
      balances[id] = (balances[id] || 0) - share;
    });
  });

  const transactions = settleBalances(balances);

const userIds = [...new Set(transactions.flatMap((t) => [t.from, t.to]))];
const users = await User.find({ _id: { $in: userIds } }).select('name');
const nameMap = {};
users.forEach((u) => { nameMap[u._id.toString()] = u.name; });

const namedTransactions = transactions.map((t) => ({
  from: nameMap[t.from],
  to: nameMap[t.to],
  amount: t.amount,
}));

res.json({ balances, transactions: namedTransactions });
});

router.put('/:groupId/add-members', protect, async (req, res) => {
  try {
    const { memberIds } = req.body;
    const group = await Group.findById(req.params.groupId);
    memberIds.forEach((id) => {
      if (!group.members.includes(id)) group.members.push(id);
    });
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:groupId', protect, async (req, res) => {
  try {
    const { name } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group || !group.members.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    group.name = name;
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:groupId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group || group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the creator can delete this group' });
    }
    await group.deleteOne();
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;