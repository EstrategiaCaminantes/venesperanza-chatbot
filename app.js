require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemon = require('nodemon');
const app = express();

var conversacionController = require('./controllers/conversacion.controller');
var notificacionReporteLlegadaController = require('./controllers/notificacionReporteLlegada.controller');
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

//api conversacion chatbot whatsapp
app.post('/whatsapp', async (req, res) => {

    errorLog('::::API-req.body:::::',req.body);
    conversacionController.consultaConversacion(req.body.contactPhoneNumber,req);

});

//api estado de notificaciones de reporte de llegada no enviados
app.post('/estado_whatsapp', async (req, res) => {

    errorLog('::::API Notificaciones reporte llegada No enviados :::::',req);
    notificacionReporteLlegadaController.crearEstadoNotificaciones(req);


});

app.listen(process.env.APP_PORT, function () {
});
