import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ExpenseItem from '../components/ExpenseItem';

function GroupDetail() {
  const { groupId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [group, setGroup] = useState(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [addMemberError, setAddMemberError] = useState('');

  useEffect(() => {
    loadData();
  }, [groupId]);

  function loadData() {
    api.get(`/expenses/${groupId}`).then((res) => setExpenses(res.data));
    api.get(`/groups/${groupId}/balances`).then((res) => setBalances(res.data));
    api.get('/groups').then((res) => {
      const g = res.data.find((g) => g._id === groupId);
      setGroup(g);
    });
  }
    const navigate = useNavigate();

  async function handleRename() {
    const newName = prompt('New group name:', group.name);
    if (!newName) return;
    await api.put(`/groups/${groupId}`, { name: newName });
    loadData();
  }

  async function handleDelete() {
    if (!confirm('Delete this group? This cannot be undone.')) return;
    await api.delete(`/groups/${groupId}`);
    navigate('/groups');
  }

  async function handleAddMember(e) {
  e.preventDefault();
  setAddMemberError('');
  try {
    const res = await api.get(`/auth/find?email=${encodeURIComponent(memberEmail)}`);
    const userId = res.data._id;
    await api.put(`/groups/${groupId}/add-members`, { memberIds: [userId] });
    setMemberEmail('');
    loadData();
  } catch (err) {
    setAddMemberError(err.response?.data?.error || 'Could not add member');
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    const splitAmong = group.members.map((m) => m._id);
    await api.post('/expenses', { group: groupId, description, amount, splitAmong });
    setDescription('');
    setAmount('');
    loadData();
  }

    return (
    <div className="container">
      <h2>{group?.name}</h2>
      <button onClick={handleRename}>Rename</button>
      <button onClick={handleDelete}>Delete Group</button>
      <form onSubmit={handleAddMember}>
        <input
          type="email"
          placeholder="Add member by email"
          value={memberEmail}
          onChange={(e) => setMemberEmail(e.target.value)}
        />
        <button type="submit">Add Member</button>
      </form>
      {addMemberError && <p style={{ color: 'red' }}>{addMemberError}</p>}

      <h2>Group Expenses</h2>
            <ul>
        {expenses.map((e) => (
          <ExpenseItem key={e._id} expense={e} />
        ))}
      </ul>

      {group && (
        <form onSubmit={handleAddExpense}>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="submit">Add Expense</button>
        </form>
      )}

      <h2>Balances</h2>
      {balances && (
        <ul>
          {balances.transactions.map((t, i) => (
            <li key={i} className="card">
              <span className="balance-owe">{t.from}</span> owes{' '}
              <span className="balance-owed">{t.to}</span> ₹{t.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GroupDetail;