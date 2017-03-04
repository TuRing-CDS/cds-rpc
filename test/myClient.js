/**
 * Created by Z on 2017-03-04.
 */
const Client = require('../lib/Client');

const client = new Client();

client.on('error',(err)=>{
    console.log('==>',err);
});

setInterval(()=>{console.log('xxx')},1000);

var fn = function(){
    client.invoke('GET', '/user/home', 'queryxxx', 'bodyxxx', 'extxxx').then((result)=>{
        console.log(result);
        client.close();
        fn();
    }, console.error);
}

fn();