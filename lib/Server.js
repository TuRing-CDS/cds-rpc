/**
 * Created by Z on 2017-03-04.
 */

const Thrift = require('thrift');

const DoRequest = require('./resources/gen-nodejs/doRequest');

const Types = require('./resources/gen-nodejs/rcp_types');

const EventEmitter = require('events').EventEmitter;

class Server extends EventEmitter {
    constructor(port, host) {
        super();
        this.port = port || 9000;
        this.host = host || 'localhost';
    }

    start(listenFn) {
        let self = this;
        this.server = Thrift.createServer(DoRequest, {
            doRequest: (request, callback) => {
                listenFn(request).then((result) => {
                    let type = typeof(result);
                    if ('object' === type) {
                        result = JSON.stringify(result);
                    }
                    callback(null, result);
                }, (err) => {
                    callback(new Error(err.stack || err.message));
                });
            }
        });
        this.server.on('error', function () {
            self.emit.apply(self, ['error'].concat([].slice.apply(arguments)));
        })
        this.server.listen(this.port, this.host);
    }
}

module.exports = Server;