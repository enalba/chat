import {networkInterfaces} from 'os';
import express from 'express';
import {createServer} from 'http';
import {Server as SocketIOServer} from 'socket.io';
import {existsSync, readFileSync, writeFileSync, writeSync} from 'fs';

const port = 3000;
const address = networkInterfaces()['en1'][1].address;

//Serveurs
const serverExpress = express();
const httpServer = createServer(serverExpress);
const socketServer = new SocketIOServer(httpServer);

serverExpress.use(express.static('public'));

if (!existsSync('./messages.json')) {
    writeFileSync('./messages.json', '[]');
};

const messages = JSON.parse(readFileSync('./messages.json'));

function sendMessage(socket, message) {
    socket.emit('message', {
        ...message,
        isMine: (socket.conn.remoteAddress == message.author)
    });
};

async function broadcastMessage(message) {
    const sockets = await socketServer.fetchSockets();

    for (let sock of  sockets) {
        sendMessage(sock, message);
    };
};

function prettyTime() {
    const time = new Date();
    const days = time.getDay().toString().padStart(2, '0');
    const months = time.getMonth().toString().padStart(2, '0');
    const years = time.getFullYear().toString().padStart(2, '0');
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    return `${days}/${months}/${years} ${hours}:${minutes}:${seconds}`;
};

socketServer.on('connection', (socket) => {
    console.log('Nouvel arrivant sur le chat : ' + socket.conn.remoteAddress);

    for (let msg of messages) {
        sendMessage(socket, msg);
    }

    socket.on('message', (msg) => {
        console.log('Nouveau message : ' + msg + ' de ' + socket.conn.remoteAddress);

        let message = {
            content: msg,
            time: prettyTime(),
            author: socket.conn.remoteAddress,
        };
        messages.push(message);
        broadcastMessage(message);
    });
});

httpServer.listen(port, () => {
    console.log(`Listen on ${address}:${port}`);
});

process.on('SIGINT', () => {
    socketServer.disconnectSockets();
    socketServer.close();
    writeFileSync('./messages.json', JSON.stringify(messages));
    process.exit();
});