/**
 * Created by Z on 2017-03-04.
 */

const Thrift = require('thrift');

const DoRequest = require('./resources/gen-nodejs/doRequest');

const Types = require('./resources/gen-nodejs/rpc_types');

const EventEmitter = require('events').EventEmitter;

const debug = require('debug')('cds-rpc');

class Server extends EventEmitter {
    constructor(port, host) {
        super();
        this.port = port || 9000;
        this.host = host || 'localhost';
    }

    start(listenFn) {
        let self = this;
        debug('injecting server function...');
        this.server = Thrift.createServer(DoRequest, {
            doRequest: async(request, callback) => {
                let response = new Types.Response();
                let exception = null;
                debug('invoke', request);
                try {
                    let result = await listenFn(request);
                    response.status = result.status || 200;
                    response.result = result
                    && result.result
                    && typeof(result.result) === 'object' ? JSON.stringify(result.result) : result.result
                        || (typeof(result) === 'object') ? JSON.stringify(result.result) : result;
                    debug('invoked', 'success', request, response);
                    return callback(null, response);
                } catch (ex) {
                    exception = new Types.IException();
                    exception.status = ex.status || 500;
                    exception.message = ex.message;
                    exception.stack = ex.stack;
                    debug('invoked', 'fail', request, exception);
                    return callback(exception);
                }
            },
            doHandShake: async(handShake, callback) => {

            }
        })
        ;
        this.server.on('error', function (err) {
            debug('error', err.stack);
            self.emit.apply(self, ['error'].concat([].slice.apply(arguments)));
        })
        this.server.listen(this.port, this.host, (err) => {
            !err || console.error(err);
            this.address = this.server.address();
            debug('listen', this.address.family, '::', this.address.address, ':', this.address.port)
        });
    }
}

module.exports = Server;