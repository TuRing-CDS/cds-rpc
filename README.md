## TuRing-CDS

### cds-rpc

    npm install cds-rpc --save
    
### Server Example

    'use strict'
    const Server = require('cds-rpc').Server;
    
    const server = new Server(9000, 'localhost', {
        isEncrypt: true,
        aesKey: '1jhcueygghxahgio'
    });
    
    server.on('error', console.error)
    
    server.start(async function (request) {
        return [request];
    });
    
    
### Client Example

    'use strict'
    const Client = require('cds-rpc').Client;
    
    const client = new Client(9000, 'localhost', {
        isEncrypt: true,
        aesKey: '1jhcueygghxahgio'
    });
    
    client.on('error', (err) => {
        console.log('==>', err);
    });
    
    client.invoke('GET', '/user/home', {uname: 'hello'}, {body: 'bodyData'}, {ext: 'extData'}).then((result) => {
        console.log(result);
        client.close();
    }, function (err) {
        console.log(err.message, err.stack, err.status);
    });
