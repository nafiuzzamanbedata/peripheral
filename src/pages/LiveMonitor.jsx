import { useEffect, useState } from 'react';

function LiveMonitor() {

    const [usbDevices, setUsbDevices] = useState([]);
    const [log, setLog] = useState([]);

    const fetchConnectedUsbDevices = async () => {
        const devices = await navigator.usb.getDevices();
        setUsbDevices(devices);
    };

    useEffect(() => {
        fetchConnectedUsbDevices();

        const handleConnect = (event) => {
            setUsbDevices(prev => [...prev, event.device]);
            setLog(prev => [...prev, `✅ USB Connected: ${event.device.productName}`]);
        };

        const handleDisconnect = (event) => {
            setUsbDevices(prev => prev.filter(d => d !== event.device));
            setLog(prev => [...prev, `❌ USB Disconnected: ${event.device.productName}`]);
        };

        navigator.usb.addEventListener('connect', handleConnect);
        navigator.usb.addEventListener('disconnect', handleDisconnect);

        return () => {
            navigator.usb.removeEventListener('connect', handleConnect);
            navigator.usb.removeEventListener('disconnect', handleDisconnect);
        };
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Live USB Monitor</h1>

            <h2>Connected Devices:</h2>
            <ul>
                {usbDevices.map((device, idx) => (
                    <li key={idx}>{device.productName} ({device.manufacturerName})</li>
                ))}
            </ul>

            <h2>Connection Log:</h2>
            <pre>{log.join('\n')}</pre>
        </div>
    );
}

export default LiveMonitor