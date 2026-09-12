import { useState } from 'react';
import api from '../api';

function ExpenseItem({ expense }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState('');

  function loadComments() {
    api.get(`/expenses/${expense._id}/comments`).then((res) => setComments(res.data));
  }

  function toggleComments() {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  }

  async function handleAddComment(e) {
    e.preventDefault();
    await api.post(`/expenses/${expense._id}/comments`, { text });
    setText('');
    loadComments();
  }

  return (
    <li className="card">
      <div>{expense.description} — ₹{expense.amount} (paid by {expense.paidBy.name})</div>
      <button onClick={toggleComments} style={{ marginTop: 8 }}>
        {showComments ? 'Hide comments' : 'Comments'}
      </button>

      {showComments && (
        <div style={{ marginTop: 10 }}>
          {comments.map((c) => (
            <p key={c._id}><strong>{c.user.name}:</strong> {c.text}</p>
          ))}
          <form onSubmit={handleAddComment}>
            <input
              type="text"
              placeholder="Add a comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </li>
  );
}

export default ExpenseItem;