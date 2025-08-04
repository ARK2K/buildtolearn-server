let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('🟢 Client connected:', socket.id);

      socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Client ${socket.id} joined room ${roomId}`);
      });

      socket.on('code-change', ({ roomId, html, css, js }) => {
        socket.to(roomId).emit('code-update', { html, css, js });
      });

      socket.on('disconnect', () => {
        console.log('🔴 Client disconnected:', socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
  },
};