/**
 * Created by Z on 2017-03-04.
 */
const Server = require('../lib/Server');

const server = new Server();

server.on('error',console.error)

server.start(async(request) => {
    console.log(request)
    return request;
})