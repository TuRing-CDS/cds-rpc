/**
 * Created by Z on 2017-03-04.
 */
const Client = require('../lib/Client');

const client = new Client();

client.on('error',(err)=>{
    console.log('==>',err);
});

var fn = function(){
    client.invoke('GET', '/user/home', 'queryxxx', 'bodyxxx', 'extxxx').then((result)=>{
        console.log(result);
        client.close();
        // fn();
    }, function(err){
        console.log(err.message,err.stack,err.status);
    });
}

fn();