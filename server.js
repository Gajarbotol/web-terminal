// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pty = require('node-pty');
const path = require('path');

// Create an Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle socket connection
io.on('connection', (socket) => {
    const shell = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    // Send data from terminal to client
    shell.on('data', (data) => {
        socket.emit('output', data);
    });

    // Receive data from client and write it to the shell
    socket.on('input', (data) => {
        shell.write(data);
    });

    // Handle terminal resizing
    socket.on('resize', (size) => {
        shell.resize(size.cols, size.rows);
    });

    socket.on('disconnect', () => {
        shell.kill();
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
