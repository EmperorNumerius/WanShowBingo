const fs = require('fs');
const https = require('https');
const cors = require('cors');
const { Server } = require('socket.io');

const privateKey = fs.readFileSync('/your/host/here/domain.tld/certs/key.pem', 'utf8');
const certificate = fs.readFileSync('/your/host/here/domain.tld/certs/crt.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials);
const port = 3000;

const io = new Server(httpsServer, {
  cors: {
    origin: 'https://your.tld',
    methods: ['GET', 'POST'],
  },
});

let liveUsers = new Set();
let maxUsersLog = {};

try {
  maxUsersLog = JSON.parse(fs.readFileSync('maxUsersLog.json', 'utf8'));
} catch (err) {
  console.log('Failed to read maxUsersLog.json, starting a new log.');
}
const today = new Date().toISOString().split('T')[0];
let maxUsers = maxUsersLog[today] || 0;

function updateMaxUsers() {
  maxUsers = Math.max(maxUsers, liveUsers.size);
  maxUsersLog[today] = maxUsers;
  maxUsersLog['highestEver'] = maxUsersLog['highestEver'] ? Math.max(maxUsersLog['highestEver'], maxUsers) : maxUsers;
  fs.writeFileSync('maxUsersLog.json', JSON.stringify(maxUsersLog, null, 2));
}

io.on('connection', (socket) => {
  const ipAddress = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  if (!liveUsers.has(ipAddress)) {
    liveUsers.add(ipAddress);
    updateMaxUsers();
    io.sockets.emit('liveUsers', { liveUsers: liveUsers.size, maxUsers });
  }

  socket.on('disconnect', () => {
    liveUsers.delete(ipAddress);
    updateMaxUsers();
    io.sockets.emit('liveUsers', { liveUsers: liveUsers.size, maxUsers });
  });
});

httpsServer.listen(port, () => {
  console.log(`Socket.io server running on port ${port}`);
});



const path = require('path');
const express = require('express');


const app = express();
app.get('/', (request, response) => {
	return response.sendFile('bread.html', { root: '.' });
});

app.get('/auth/discord', (request, response) => {
	return response.sendFile('bread_login.html', { root: '.' });
});
app.listen(port, () => console.log(`App listening at ${port}`));

window.onload = () => {
const fragment = new URLSearchParams(window.location.hash.slice(1));
const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

if (!accessToken) {
    window.location.href('/')
    return (document.getElementById('login').style.display = 'block');
}


};
fetch('https://discord.com/api/users/@me', {
    headers: {
        authorization: `${tokenType} ${accessToken}`,
    },
})
.then(result => result.json())
.then(response => {

})
.catch(console.error);
const { username, discriminator, avatar, id} = response;
document.getElementById('name').innerText = ` ${username}#${discriminator}`;

document.getElementById("avatar").src = `https://cdn.discordapp.com/avatars/${id}/${avatar}.jpg`;
