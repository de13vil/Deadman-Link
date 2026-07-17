const { io } = require('socket.io-client');

const URL = 'http://localhost:5050';

const client1 = io(URL, { autoConnect: false });
const client2 = io(URL, { autoConnect: false });

const testRoom = 'test-room-123';

const runTest = () => {
  return new Promise((resolve) => {
    
    client1.connect();
    
    client1.on('connect', () => {
      console.log('Client 1 connected:', client1.id);
      client1.emit('join-room', { roomCode: testRoom, userName: 'Alice' });
    });
    
    client1.on('user-joined', (data) => {
      console.log('Client 1 received user-joined:', data);
    });

    client2.connect();
    
    client2.on('connect', () => {
      console.log('Client 2 connected:', client2.id);
      setTimeout(() => {
        client2.emit('join-room', { roomCode: testRoom, userName: 'Bob' });
      }, 500); 
    });

    setTimeout(() => {
      console.log('Client 1 emitting player-action (PLAY)');
      client1.emit('player-action', { roomCode: testRoom, type: 'PLAY', time: 10 });
    }, 1500);

    client2.on('player-action', (data) => {
      console.log('Client 2 received player-action:', data);
      client1.disconnect();
      client2.disconnect();
      resolve();
    });

    setTimeout(() => {
      console.log('Test timed out!');
      client1.disconnect();
      client2.disconnect();
      resolve();
    }, 3000);
  });
};

runTest().then(() => console.log('Socket test finished.'));
