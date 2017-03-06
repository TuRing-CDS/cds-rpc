/**
 * Created by Z on 2017-03-04.
 */

const Thrift = require('thrift');

const DoRequest = require('./resources/gen-nodejs/doRequest');

const Types = require('./resources/gen-nodejs/rpc_types');

const transport = Thrift.TBufferedTransport;

const protocol = Thrift.TBinaryProtocol;

const EventEmitter = require('events').EventEmitter;

class Client extends EventEmitter {
    constructor(port, host) {
        super();
        this.port = port || 9000;
        this.host = host || 'localhost';
    }

    connect() {
        let self = this;
        this.connection = Thrift.createConnection(this.host, this.port, {
            transport,
            protocol
        });
        this.connection.on('error', function () {
            self.emit.apply(self, ['error'].concat([].slice.apply(arguments)));
        });

        this.client = Thrift.createClient(DoRequest, this.connection);
    }

    invoke(method, uri, query, body, ext) {
        let request = new Types.Request({method, uri, query, body, ext});
        if (this.client) {
            return this.client.doRequest(request);
        }
        this.connect();
        return this.invoke(method, uri, query, body, ext);
    }

    close() {
        this.connection.end();
        delete this.client;
    }
}

module.exports = Client;