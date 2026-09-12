import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/');
  }

  return (
    <div className="navbar">
      <h1>Splitzy</h1>
      {isLoggedIn && (
        <div>
          <Link to="/groups">Groups</Link>
          <button onClick={handleLogout} style={{ marginLeft: 12 }}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default Navbar;