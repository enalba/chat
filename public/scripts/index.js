const socket = io();

const messageFeed = document.getElementById("message-feed");

function addMessage(content, time, isMine, author) {
    const messageElement = document.createElement('div');
    messageElement.setAttribute('class', isMine ? 'message message-me': 'message');

    const messageTime = document.createElement('p');
    messageTime.setAttribute('class', 'message-time');
    messageTime.innerText = `${time} ${author}`;

    const messageContent = document.createElement('p');
    messageContent.setAttribute('class', 'message-content');
    messageContent.innerText = content;

    messageElement.appendChild(messageTime);
    messageElement.appendChild(messageContent);

    messageFeed.appendChild(messageElement);
    messageFeed.scrollTo(0, messageFeed.scrollHeight);
};

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const msg = messageInput.value;
    if (msg != '') {
        socket.emit('message', msg);
        messageInput.value = '';
    };
});

socket.on('message', (msg) => {
    console.log(msg);
    addMessage(msg.content, msg.time, msg.isMine, msg.author);
});
