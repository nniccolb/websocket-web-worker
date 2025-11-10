import express from 'express';
import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http'; 
import { Socket } from 'net';        
import http from 'http';            

const app = express();

const server = http.createServer(app); 
const port = 3000;

const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  console.log('New WebSocket connection established');
  
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
    ws.send(`Echo: ${data}`);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.send('Echo: Connected to WebSocket server!');
});

server.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  console.log(`WebSocket server ready on ws://localhost:${port}`);
});
