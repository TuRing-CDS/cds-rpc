/**
 * Created by Z on 2017-03-04.
 */
const Client = require('../lib/Client');

const client = new Client(9000, 'localhost', {
    isEncrypt: true,
    aesKey: '1jhcueygghxahgio'
});

client.on('error', (err) => {
    console.log('==>', err);
});


var fn = function () {
    client.invoke('GET', '/user/home', {uname: 'hello'}, {body: 'bodyData'}, {ext: 'extData'}).then((result) => {
        console.log(result);
        client.close();
        // fn();
    }, function (err) {
        console.log(err.message, err.stack, err.status);
    });
}

fn();