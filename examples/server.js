/**
 * Created by Z on 2017-03-04.
 */
const Thrift = require('thrift');

const DoRequest = require('../lib/resources/gen-nodejs/doRequest');

const Types = require('../lib/resources/gen-nodejs/rpc_types');

const server = Thrift.createServer(DoRequest, {
    doRequest: (request, callback) => {
        console.log(request);
        let response = new Types.Response();
        response.result = 'result';
        callback(null, response)
    }
});

server.on('error', (err) => {
    console.log('err', err)
})
server.on('close', () => {
    console.log('close');
})

server.listen(9000);