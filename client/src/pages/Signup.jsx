import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/auth/signup', { name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  }

    return (
    <div className="container">
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
        <p>Already have an account? <Link to="/">Login</Link></p>
      </form>
    </div>
  );
}

export default Signup;