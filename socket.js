// ===== socket.js =====
export function setupSocket(io) {
  const players = {};

  io.on('connection', (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);

    // Default new player structure
    players[socket.id] = {
      id: socket.id,
      name: null,
      role: null,
      room: null,
    };

    // Register player name
    socket.on('registerUser', (name) => {
      if (players[socket.id]) {
        players[socket.id].name = name;
        console.log(`🧍 Registered: ${name}`);
      }
    });

    // Create Room
    socket.on('createRoom', (roomCode) => {
      socket.join(roomCode);
      players[socket.id].room = roomCode;
      console.log(`🛠️ Room created: ${roomCode}`);
      socket.emit('roomCreated', roomCode);
    });

    // Join Room
    socket.on('joinRoom', (roomCode) => {
      const room = io.sockets.adapter.rooms.get(roomCode);
      if (!room || room.size >= 3) {
        socket.emit('roomJoinError', 'Room full or not found');
        return;
      }
      socket.join(roomCode);
      players[socket.id].room = roomCode;
      console.log(`✅ ${players[socket.id].name || socket.id} joined room ${roomCode}`);
      socket.emit('roomJoined', roomCode);
      io.to(roomCode).emit('playerJoined', {
        playerId: socket.id,
        name: players[socket.id].name
      });
    });

    // Set Role
    socket.on('setRole', (role) => {
      players[socket.id].role = role;
      const room = players[socket.id].room;
      console.log(`🎭 ${players[socket.id].name || 'Unknown'} is now a ${typeof role === 'object' ? JSON.stringify(role) : role}`);
      if (room) {
        io.to(room).emit('roleUpdated', {
          playerId: socket.id,
          role,
          name: players[socket.id].name
        });
      }
    });

    // Start Game
    socket.on('startGame', () => {
      const room = players[socket.id].room;
      if (!room) return;
      console.log(`🎮 Game started in room ${room}`);
      io.to(room).emit('gameStarted');
    });

    // Keyword & Hint Logic
    socket.on('newKeyword', (keywordData) => {
      const room = players[socket.id].room;
      if (!room) return;
      io.to(room).emit('keywordForGuesser', keywordData);
    });

    socket.on('sendHint', (hint) => {
      const room = players[socket.id].room;
      if (!room) return;
      io.to(room).emit('hintUsed', hint);
    });

    socket.on('submitAnswer', (result) => {
      const room = players[socket.id].room;
      if (!room) return;
      io.to(room).emit('answerSubmitted', {
        playerId: socket.id,
        result,
      });
    });

    socket.on('updateScore', (score) => {
      const room = players[socket.id].room;
      if (!room) return;
      io.to(room).emit('scoreUpdated', {
        playerId: socket.id,
        score,
      });
    });

    socket.on('gameOver', () => {
      const room = players[socket.id].room;
      if (!room) return;
      io.to(room).emit('gameEnded');
    });

    socket.on('start-game', ({ roomCode }) => {
      const room = io.sockets.adapter.rooms.get(roomCode);
      if (!room) return;

      // Find all players in the room and their roles
      const playerIds = Array.from(room);
      const roles = playerIds.map(id => players[id]?.role);
      const hasGuesser = roles.includes('guesser');
      const hasHinter = roles.includes('hinter');
      const hostId = playerIds[0]; // First joined is host

      // Only host can start, and both roles must be filled
      if (socket.id === hostId && hasGuesser && hasHinter) {
          io.to(roomCode).emit('game-started');
          console.log(`✅ Game started in room ${roomCode}`);
      }
    });

    socket.on('disconnect', () => {
      const room = players[socket.id]?.room;
      console.log(`❌ Player disconnected: ${socket.id}`);
      if (room) {
        io.to(room).emit('playerDisconnected', socket.id);
      }
      delete players[socket.id];
    });
  });
}

