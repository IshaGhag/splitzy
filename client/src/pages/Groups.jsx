import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  function loadGroups() {
    api.get('/groups').then((res) => setGroups(res.data));
  }

  async function handleCreate(e) {
    e.preventDefault();
    await api.post('/groups', { name, members: [] });
    setName('');
    loadGroups();
  }

    return (
    <div className="container">
      <h2>Your Groups</h2>
      <ul>
        {groups.map((g) => (
          <li key={g._id} className="card">
            <Link to={`/groups/${g._id}`}>{g.name}</Link>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
}

export default Groups;