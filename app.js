require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemon = require('nodemon');
const app = express();

var conversacionController = require('./controllers/conversacion.controller');
var notificacionesController = require('./controllers/notificaciones.controller');
var whatsappMessageController = require('./controllers/whatsappMessage.controller');
var messagebird = require('messagebird')(process.env.MB_KEY, 50000);

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

    //if(req.body.incomingMessage === 'No, en camino'){
     //   console.log('::ENTRA A NO EN CAMINO::');
        /*
        whatsappMessageController.sendMessageWhatsapp({
            'to': req.body['message.from'],
              'conversationId': req.body.conversationId,
            'type': 'text',
            'content': {
                    'text': 'Ok, no hay problema. Guarda mi número como Esperanza 👩🏻 y recuerda escribirme cuando llegues a destino final 📍',
                  },
            'reportUrl': 'https://webhook.site/681229d0-1961-4b03-b9f7-113b37636538'
          });*/

          /*
          var params = {
            'to': req.body['message.from'],
            'from': req.body.channelId,
            'type': 'text',
            'content': {
                'text': 'Ok, no hay problema. Guarda mi número como Esperanza 👩🏻 y recuerda escribirme cuando llegues a destino final 📍',
                  },
            'reportUrl': 'https://webhook.site/681229d0-1961-4b03-b9f7-113b37636538'
          };
          
          messagebird.conversations.send(params, function (err, response) {
            if (err) {
                errorLog('sendNotificationWhatsapp-err',err);
            }
            errorLog('sendNotificationWhatsapp-response',response);
            //db.end();
            //console.log('::CIERRO CONEXION DB EN SENDMESSAGEWHATSAPP:::');
            
          });*/


    //}else{
        conversacionController.consultaConversacion(req.body.contactPhoneNumber,req);
   // }
    

});
/*
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
*/


app.listen(process.env.APP_PORT, function () {
});
