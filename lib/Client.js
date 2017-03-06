/**
 * Created by Z on 2017-03-04.
 */

const Thrift = require('thrift');

const DoRequest = require('./resources/gen-nodejs/doRequest');

const Types = require('./resources/gen-nodejs/rpc_types');

const debug = require('debug')('cds-rpc:Client')

const transport = Thrift.TBufferedTransport;

const protocol = Thrift.TBinaryProtocol;

const AES = require('./utils').AES;

const SHA = require('./utils').SHA;

const SIGN = require('./utils').SIGN;

const EventEmitter = require('events').EventEmitter;

class Client extends EventEmitter {
    constructor(port, host, options) {
        super();
        this.port = port || 9000;
        this.host = host || 'localhost';
        this.options = options || {isEncrypt: false};
        if (this.options.isEncrypt && (!this.options.aesKey || (this.options.aesKey && this.options.aesKey.length != 16))) {
            throw new Error(`如果你需要加密,请提供 options.aesKey , 需要长度为 16`)
        }
        this.init();
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

    init() {
        this.connect();
        let sha = SHA(this.host, this.port);
        this.client.doHandShake(new Types.HandShake({
            host: this.host,
            port: this.port,
            sha: sha,
            sign: this.encrypt(SIGN(this.host, this.port, sha))
        })).then((handShake) => {
            let host = handShake.host;
            let port = handShake.port;
            let sha = handShake.sha;
            let sign = handShake.sign;
            let input = SIGN(host, port, sha);
            let output = this.encrypt(input);
            if (sign === output) {
                debug('HandShake:Success', sign, output);
            }
        }).catch((err) => {
            debug('HandShake:Error', err);
            this.emit('error', err);
        })
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
        throw new Error('服务器未连接~~')
    }

    close() {
        this.connection.end();
        delete this.client;
    }
}

module.exports = Client;