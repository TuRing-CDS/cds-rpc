/**
 * Created by Z on 2017-03-04.
 */
const Server = require('../lib').Server;

const server = new Server(9000, 'localhost', {
    isEncrypt: true,
    aesKey: '1jhcueygghxahgio'
});

server.on('error', console.error)

server.start(async function (request) {
    return [request];
});

