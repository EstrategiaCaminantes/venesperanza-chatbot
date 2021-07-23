require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemon = require('nodemon');
const app = express();

var conversacionController = require('./controllers/conversacion.controller');
var notificacionesController = require('./controllers/notificaciones.controller');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Nothing here!');
});

$preguntaEncuesta = 0;
$miembrosFamilia = 0;

function errorLog(title, msg) {
    if (process.env.ENV === 'test') {
        console.log(title, msg);
    }
}

app.post('/whatsapp', async (req, res) => {

    errorLog('::::API-req.body:::::',req.body);
    conversacionController.consultaConversacion(req.body.contactPhoneNumber,req);

});

app.post('/notificacionwhatsapp', async (req, res) => {

    try {
    
        if(req.headers.auth === process.env.VE_LARAVEL_APP_KEY){
            //console.log('LLEGO MENSAJE!!', req.body);   
            notificacionesController.notificacionReportarLlegada(req, res);

        }else{
            res.status(400);
                res.send({
                    status: "error",
                    message: "SIN AUTORIZACIÓN!!"
                });
        }
        
        
    } catch (error) {
        res.status(400);
        res.send({
        status: "error",
        message: "ERROR EN SERVIDOR NodeJS Chatbot!!"
        });
    }

    
});


app.listen(process.env.APP_PORT, function () {
});
