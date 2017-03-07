/**
 * Created by Z on 2017-03-04.
 */
const Client = require('../lib/Client');

const client = new Client(9000,'localhost',{
    isEncrypt: true,
    // aesKey:'1jhcueygghxahgio'
});

client.on('error',(err)=>{
    console.log('==>',err);
});

setInterval(()=>{
    console.log('---')
},1000);

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