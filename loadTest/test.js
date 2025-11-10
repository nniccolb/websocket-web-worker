import ws from 'k6/ws';
import { check, sleep } from 'k6';

export const options = {
  vus: 8000,           // concurrent virtual users (connections)
  duration: '60s',    // total test duration
};

/**
 * Each VU:
 * - Opens 1 WebSocket
 * - Sends multiple messages with async delays
 * - Keeps socket alive
 */
export default function () {
  const url = 'ws://localhost:3000';

  const params = {
    tags: { test_type: 'ws-load' },
  };

  ws.connect(url, params, function (socket) {
    let msgCount = 0;
    const maxMessages = 20;

    socket.on('open', () => {
      socket.send(`init hello from vu ${__VU}`);
    });

    socket.on('message', (data) => {
      check(data, {
        'echo received': (msg) => msg.includes('Echo'),
      });
    });

    // Simulate async worker results arriving over time
    socket.setInterval(() => {
      if (msgCount >= maxMessages) {
        socket.close();
        return;
      }

      msgCount++;

      socket.send(
        JSON.stringify({
          vu: __VU,
          seq: msgCount,
          payload: `worker-result-${msgCount}`,
          ts: Date.now(),
        })
      );
    }, randomDelay(100, 700)); // async, non-uniform delays

    socket.on('close', () => {
      // connection closed normally
    });

    socket.on('error', (e) => {
      console.error('WS error', e);
    });
  });

  // Prevent the VU from exiting immediately
  sleep(1);
}

/**
 * Random delay helper
 * (k6 doesn't have setTimeout randomness built in)
 */
function randomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
