import { useState } from 'react';

function App() {

    const [usbDevice, setUSBDevices] = useState(null);
    const [bluetoothDevice, setBluetoothDevices] = useState(null);
    const [memory, setMemory] = useState(null);

    const handleUSBRequest = async () => {
        try {
            const device = await navigator.usb.requestDevice({ filters: [] });
            console.log('Selected USB Device:', device);
            setUSBDevices(device);
            console.log(JSON.stringify(device
                , (key, value) => {
                    if (typeof value === 'function' || value instanceof Node) return undefined;
                    return value;
                }
                , 2)
            );
        } catch (error) {
            console.error('USB Error:', error);
        }
    };

    const handleBluetoothRequest = async () => {
        try {
            const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
            console.log('Selected Bluetooth Device:', device);
            setBluetoothDevices(device);
        } catch (error) {
            console.error('Bluetooth Error:', error);
        }
    };


    const handleDeviceMemoryRequest = async () => {
        try {
            const device = await navigator.deviceMemory;
            console.log('Selected Device Memory:', device);
            setMemory(device);
        } catch (error) {
            console.error('Device Memory Error:', error);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Peripheral Device Checker</h1>

            <div style={{ marginBottom: '1rem' }}>
                <button onClick={handleUSBRequest}>Check USB Devices</button>
                <button onClick={handleBluetoothRequest} style={{ marginLeft: '1rem' }}>
                    Check Bluetooth Devices
                </button>
                <button onClick={handleDeviceMemoryRequest} style={{ marginLeft: '1rem' }}>
                    Check Device Memory
                </button>
            </div>

            {usbDevice && (
                <div>
                    <h3>USB Device:</h3>
                    <pre>{JSON.stringify(usbDevice, null, 2)}</pre>
                </div>
            )}

            {bluetoothDevice && (
                <div>
                    <h3>Bluetooth Device:</h3>
                    <pre>{JSON.stringify(bluetoothDevice, null, 2)}</pre>
                </div>
            )}

            {memory && (
                <div>
                    <h3>Device Memory:</h3>
                    <pre>{JSON.stringify(memory, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default App
