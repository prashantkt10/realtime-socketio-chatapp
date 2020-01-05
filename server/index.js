const express = require('express'), cors = require('cors'), socketio = require('socket.io'), http = require('http'), router = require('./router');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const app = express(), server = http.createServer(app), io = socketio(server);

io.on('connect', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.client.id, name, room });
        if (error) return callback({ error: err });
        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
        socket.join(user.room);
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        callback();
    });
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        if (!user) return;
        io.to(user.room).emit('message', { user: user.name, text: message });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        callback();
    });
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left` });
    });
});
app.use(router);
app.use(cors());

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));