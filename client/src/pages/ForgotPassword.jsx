import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      setMessage('Password updated. You can log in now.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password');
    }
  }

  return (
    <div className="container">
      <h2>Reset password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: '#6d9773' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit">Reset password</button>
        <p><Link to="/">Back to login</Link></p>
      </form>
    </div>
  );
}

export default ForgotPassword;