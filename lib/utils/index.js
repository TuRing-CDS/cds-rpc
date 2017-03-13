/**
 * Created by Z on 2017-03-06.
 */

const crypto = require('crypto');
const debug = require('debug')('cds-rpc-crypto');
const algorithm = 'aes-128-ecb';
const clearEncoding = 'utf8';
const cipherEncoding = 'base64';
const Types = require('../resources/gen-nodejs/rpc_types');
const iv = '';

const AES = {
    //加密
    encrypt(input, key){
        if (!key) {
            return input;
        }
        if ('string' !== typeof(input)) {
            input = String(input);
        }
        let cipherChunks = [];
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        cipherChunks.push(cipher.update(input, clearEncoding, cipherEncoding));
        cipherChunks.push(cipher.final(cipherEncoding));
        return cipherChunks.join('');
    },
    //解密
    decrypt(input, key){
        if (!key) {
            return input;
        }
        if ('string' !== typeof(input)) {
            input = String(input);
        }
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        return decipher.update(input, cipherEncoding, clearEncoding) + decipher.final(clearEncoding);
    }
}

function MD5(input) {
    return crypto.createHash('md5').update(input, 'utf8').digest('hex').substr(8, 16);
}


function SIGN(host, port, sha) {
    return [[host, port].join('::'), sha].join('--');
}

function HandShake(handShake, key) {
    let host = handShake.host;
    let port = handShake.port;
    let sha = handShake.sha;
    let sign = handShake.sign;
    let input = SIGN(host, port, sha);
    let output = AES.encrypt(input, key);
    if (sign === output) {
        return true;
    } else {
        return false;
    }
}

function createHandShakeStruct(host, port, key) {
    const sha = SHA(host, port);
    const sign = AES.encrypt(SIGN(host, port, sha), key);
    return new Types.HandShake({
        host,
        port,
        sha,
        sign
    })
}

HandShake.create = createHandShakeStruct;

function SHA(host, port) {
    return module.exports.MD5([host, port, Date.now()].join('::'));
}

function getJSON(str) {
    try {
        return JSON.parse(str);
    } catch (ex) {
        return str;
    }
}

function getRequest(request, key) {
    try {
        request.query = getJSON(AES.decrypt(request.query || '', key));
        request.body = getJSON(AES.decrypt(request.body || '', key));
        request.ext = getJSON(AES.decrypt(request.ext || '', key));
    } catch (ex) {
        throw new Error(`小样,本接口是加密了的~发送过来的数据请加密好吗？`);
    }

    return request;
}

function getResponse(response, key) {
    try {
        if (null != response.ext) {
            response.ext = getJSON(AES.decrypt(response.ext || '', key));
        }
        if (null != response.result) {
            response.result = getJSON(AES.decrypt(response.result || '', key));
        }
        return response
    } catch (ex) {
        throw ex;
    }
}

function createResponse(status, result, ext, key) {
    let response = new Types.Response();
    response.status = status || 200;
    if (result != null) {
        response.result = AES.encrypt(result && typeof(result) === 'object' ? JSON.stringify(result) : result || '', key);
    }
    if (ext != null) {
        response.ext = AES.encrypt(ext && typeof(ext) === 'object' ? JSON.stringify(ext) : ext || '', key);
    }
    return response;
}

function createRequest(method, uri, query, body, ext, key) {
    query = AES.encrypt(query, key);
    body = AES.encrypt(body, key);
    ext = AES.encrypt(ext, key);
    return new Types.Request({
        method,
        uri,
        ext,
        query,
        body
    })
}

module.exports.SIGN = SIGN;

module.exports.HandShake = HandShake;

module.exports.SHA = SHA;

module.exports.MD5 = MD5;

module.exports.AES = AES;

module.exports.createResponse = createResponse;

module.exports.getRequest = getRequest;

module.exports.getResponse = getResponse;

module.exports.createRequest = createRequest;
