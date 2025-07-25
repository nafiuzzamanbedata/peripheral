import './App.css';
import USBDashboard from './components/USBDashboard';

function App() {

	return (
		// <div>
		// 	{/* <NavBar />
		// 	<Routes>
		// 		<Route path="/" element={<DeviceChecker />} />
		// 		<Route path="/monitor" element={<LiveMonitor />} />
		// 		<Route path="/websocket" element={<WebSocket />} />
		// 	</Routes> */}
		// 	<SocketTest />
		// </div>
		<div className="App">
			<USBDashboard />
		</div>
	);
}

export default App
