/**
 * Created by Z on 2017-03-04.
 */

const Thrift = require('thrift');

const DoRequest = require('./resources/gen-nodejs/doRequest');

const Types = require('./resources/gen-nodejs/rpc_types');

const debug = require('debug')('cds-rpc:Client')

const transport = Thrift.TBufferedTransport;

const protocol = Thrift.TBinaryProtocol;

const HandShake = require('./utils').HandShake;

const createRequest = require('./utils').createRequest;

const getResponse = require('./utils').getResponse;

const EventEmitter = require('events').EventEmitter;

class Client extends EventEmitter {
    constructor(port, host, options) {
        super();
        this.port = port || 9000;
        this.host = host || 'localhost';
        this.options = options || {};
        if (this.options.aesKey && this.options.aesKey.length != 16) {
            throw new Error(`如果你需要加密,请提供 options.aesKey , 需要长度为 16`)
        }
        this.init();
    }

    init() {
        this.connect();
        this.client.doHandShake(HandShake.create(this.host, this.port, this.options.aesKey)).then((handShake) => {
            const flag = HandShake(handShake, this.options.aesKey);
            if (flag) {
                debug('握手成功')
            } else {
                throw new Error('HandShake Fail, 主要问题是本地问题');
            }
        }).catch((err) => {
            throw err;
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
        query = 'object' === typeof(query) ? JSON.stringify(query) : query;
        body = 'object' === typeof(body) ? JSON.stringify(body) : body;
        ext = 'object' === typeof(ext) ? JSON.stringify(ext) : ext;
        let request = createRequest(method, uri, query, body, ext, this.options.aesKey);
        if (this.client) {
            return this.client.doRequest(request).then((response) => {
                return getResponse(response, this.options.aesKey);
            });
        }
        throw new Error('服务器未连接~~')
    }

    close() {
        this.connection.end();
        delete this.client;
    }
}

module.exports = Client;