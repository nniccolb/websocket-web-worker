import { useState, useEffect, useRef } from 'react';
import * as Comlink from 'comlink';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

type WorkerAPI = {
  processData(task: string): Promise<string>;
};

function App() {
  const [_message, setMessage] = useState<string>('Hello from React!');
  const [serverMessage, setServerMessage] = useState<string>('');
  const [workerResult, setWorkerResult] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
      socket.send('Hello from client');
    };

    socket.onmessage = (event) => {
      console.log('From server:', event.data);
      setServerMessage(`${event.data}`);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };
    

    return () => {
      socket.close();
    };
  }, []);

  const handleClick = async () => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    });

    const api = Comlink.wrap<WorkerAPI>(worker);
    const msg = `Hello from React! @ ${Date.now()}`;
    setMessage(msg);

    const result = await api.processData(msg);
    setWorkerResult(result);

    if (socketRef.current) {
      socketRef.current.send(result);
    }

    worker.terminate();
  };

  return (
    <>
      <div className="card">
        <button onClick={handleClick}>Run Worker</button>
        {workerResult && <p>Worker result: {workerResult}</p>}
        {serverMessage && <p>Message from server: {serverMessage}</p>}
      </div>
    
    </>
  );
}

export default App;
