/**
 * Created by Z on 2017-03-04.
 */

const Thrift = require('thrift');

const DoRequest = require('./resources/gen-nodejs/doRequest');

const Types = require('./resources/gen-nodejs/rpc_types');

const HandShake = require('./utils').HandShake;

const getRequest = require('./utils').getRequest;

const createResponse = require('./utils').createResponse;

const EventEmitter = require('events').EventEmitter;

const debug = require('debug')('cds-rpc');

class Server extends EventEmitter {
    constructor(port, host, options) {
        super();
        this.port = port || 9000;
        this.host = host || 'localhost';
        this.options = options || {isEncrypt: false}
        if (this.options.aesKey && this.options.aesKey.length != 16) {
            throw new Error(`如果你需要加密,请提供 options.aesKey , 需要长度为 16`)
        }
    }

    start(listenFn) {
        let self = this;
        debug('injecting server function...');
        this.server = Thrift.createServer(DoRequest, {
            doRequest: async(request, callback) => {
                let exception = null;
                debug('invoke', request);
                try {
                    request = getRequest(request, this.options.aesKey);
                    let result = await listenFn(request);
                    let response = createResponse(result.status || 200, result.result || result, result.ext, this.options.aesKey);
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
                const flag = HandShake(handShake, this.options.aesKey);
                if (flag) {
                    return callback(null, HandShake.create(this.address.address, this.address.port, this.options.aesKey));
                }
                return callback(new Types.HandShakeException({
                    message: `密钥对不上~~你自裁吧!`
                }))
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