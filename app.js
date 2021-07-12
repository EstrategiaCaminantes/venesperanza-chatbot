require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemon = require('nodemon');
const app = express();

var conversacionController = require('./controllers/conversacion.controller');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('VenEsperanza');
});

$preguntaEncuesta = 0;
$miembrosFamilia = 0;

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

app.post('/whatsapp', async (req, res) => {

    errorLog('::::API-req.body:::::',req.body);
    conversacionController.consultaConversacion(req.body.contactPhoneNumber,req);

});

app.listen(process.env.APP_PORT, function(){
});