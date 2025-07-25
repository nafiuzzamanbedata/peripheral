import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
            <Link to="/" style={{ marginRight: '1rem' }}>Device Checker</Link>
            <Link to="/monitor" style={{ marginRight: '1rem' }}>Live Monitor</Link>
            <Link to="/websocket" >WebSocket</Link>
        </nav>
    );
}

export default NavBar;