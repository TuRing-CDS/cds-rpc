/**
 * Created by Z on 2017-03-04.
 */

const Thrift = require('thrift');

const DoRequest = require('./resources/gen-nodejs/doRequest');

const Types = require('./resources/gen-nodejs/rpc_types');

const AES = require('./utils').AES;

const SHA = require('./utils').SHA;

const SIGN = require('./utils').SIGN;

const EventEmitter = require('events').EventEmitter;

const debug = require('debug')('cds-rpc');

class Server extends EventEmitter {
    constructor(port, host, options) {
        super();
        this.port = port || 9000;
        this.host = host || 'localhost';
        this.options = options || {isEncrypt: false}
        if (this.options.isEncrypt && (!this.options.aesKey || (this.options.aesKey && this.options.aesKey.length != 16))) {
            throw new Error(`如果你需要加密,请提供 options.aesKey , 需要长度为 16`)
        }
    }

    getAES() {
        if (!this.aes) {
            this.aes = new AES(this.options.aesKey);
        }
        return this.aes;
    }

    encrypt(input) {
        if (this.options.isEncrypt) {
            input = this.getAES().encrypt(input);
        }
        return input;
    }

    decrypt(input) {
        if (this.options.isEncrypt) {
            input = this.getAES().decrypt(input);
        }
        return input;
    }

    start(listenFn) {
        let self = this;
        debug('injecting server function...');
        this.server = Thrift.createServer(DoRequest, {
            doRequest: async(request, callback) => {
                let response = new Types.Response();
                let exception = null;
                request.query = this.decrypt(request.query || '');
                request.body = this.decrypt(request.body || '');
                debug('invoke', request);
                try {
                    let result = await listenFn(request);
                    response.status = result.status || 200;
                    response.result = result
                    && result.result
                    && typeof(result.result) === 'object' ? JSON.stringify(result.result) : result.result
                        || (typeof(result) === 'object') ? JSON.stringify(result.result) : result;
                    response.result = this.encrypt(response.result);
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
                let host = handShake.host;
                let port = handShake.port;
                let sha = handShake.sha;
                let sign = handShake.sign;
                let input = SIGN(host, port, sha);
                let output = this.encrypt(input);
                if (sign === output) {
                    let sha = SHA(this.address.address, this.address.port);
                    let temp = new Types.HandShake({
                        host: this.address.address,
                        port: this.address.port,
                        sha: sha,
                        sign: SIGN(this.address.address, this.address.port, sha)
                    });
                    callback(null, temp);
                } else {
                    callback(new Types.HandShakeException({message: '消息验证不通过，即使获取数据，也解密不出来'}));
                }
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