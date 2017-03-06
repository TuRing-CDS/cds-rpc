/**
 * Created by Z on 2017-03-06.
 */

const crypto = require('crypto');
const debug = require('debug')('cds-rpc-crypto');
const algorithm = 'aes-128-ecb';
const clearEncoding = 'utf8';
const cipherEncoding = 'base64';
const iv = '';
class AES {
    constructor(key) {
        this.cipher = crypto.createCipheriv(algorithm, key, iv);
        this.decipher = crypto.createDecipheriv(algorithm, key, iv);
    }

    encryption(input) {
        let cipherChunks = [];
        cipherChunks.push(this.cipher.update(input, clearEncoding, cipherEncoding));
        cipherChunks.push(this.cipher.final(cipherEncoding));
        return cipherChunks.join('');
    }

    decrypt(input) {
        return this.decipher.update(input, cipherEncoding, clearEncoding) + this.decipher.final(clearEncoding);
    }
}

module.exports = AES;