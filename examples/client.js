/**
 * Created by Z on 2017-03-04.
 */
const Thrift = require('thrift');

const DoRequest = require('../lib/resources/gen-nodejs/doRequest');

const Types = require('../lib/resources/gen-nodejs/rcp_types');

const transport = Thrift.TBufferedTransport;

const protocol = Thrift.TBinaryProtocol;

const connection = Thrift.createConnection('localhost', 9000, {
    transport,
    protocol,
});

connection.on('error', (err) => {
    console.log(err);
});

const client = Thrift.createClient(DoRequest, connection);

let request = new Types.Request();
request.method = 'GET';
client.doRequest(request).then((result) => {
    console.log(result)
    connection.end();
}, (err) => {
    console.error(err)
})