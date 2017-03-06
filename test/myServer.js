/**
 * Created by Z on 2017-03-04.
 */
const Server = require('../lib/Server');

const server = new Server(9000, 'localhost', {
    isEncrypt: true,
    aesKey: '87xhguyjikl092jh'
});

server.on('error', console.error)

server.start(async function (request) {
    // return {
    //     error:null,
    //     result:request
    // }
    // return 'HELLO'
    throw new Error('xxxx');
});

