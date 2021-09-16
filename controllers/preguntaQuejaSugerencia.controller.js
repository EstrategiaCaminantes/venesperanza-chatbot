var whatsappMessageController = require('./whatsappMessage.controller');
var conversacionController = require('./conversacion.controller');
var preguntaQuejaSugerenciaService = require('../services/preguntaQuejaSugerenciaService.services');

var db = require('../db');

function errorLog(title, msg) {
    if (process.env.ENV === 'test') {
        console.log(title, msg);
    }
}

exports.crearPQS = async function (conversation, req) {

    try {
        //console.log(':: VA A CREAR PQS EN LA FUNCION CREARPQS::', conversation);
        const sqlnuevaPQS = 'INSERT INTO pqs SET ?';

        const nuevaPQS = {
            waId: conversation.waId,
            pregunta: 1,
            created_at: new Date(),
        }

        db.query(sqlnuevaPQS, nuevaPQS, (error, results) => {
            if (error) {
                mensajeRespuesta = `Disculpa tuvimos un problema. Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
1️⃣ Quieres informar de tu llegada a destino ☝🏻\n
2️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻\n
3️⃣ Quieres hacer una pregunta, queja ó sugerencia 💬 `;
            } else {
                conversation.tipo_formulario = 4;

                //actualizarConversacion($conversation); //llamada a funcion en app.js
                conversacionController.actualizarConversacion(conversation); //llamada a conversacionController

                mensajeRespuesta = `A continuación responde las preguntas para registrar tu PQS como nombre u otros:
Tipo de documento 📇 Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Acta de Nacimiento
2️⃣ Cédula de Identidad (venezolana)
3️⃣ Cédula de Ciudadanía (colombiana)
4️⃣ Pasaporte
5️⃣ Cédula de Extranjería
6️⃣ Otro`;
            }

            whatsappMessageController.sendMessageWhatsapp({
                'to': req.body['message.from'],
                'conversationId': req.body.conversationId,
                'type': 'text',
                'content': {
                    'text': mensajeRespuesta,
                }
            });

        });

    } catch (error) {
        errorLog(':::Error en crearPQS::', error);

    }

}

exports.actualizarPQS = async function (datosPQS){
    try {
        datosPQS.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

        let sqlActualizarPQS = `UPDATE pqs SET pregunta = ${datosPQS.pregunta} `;

        if (datosPQS.tipo_documento) {
            sqlActualizarPQS += `, tipo_documento = '${datosPQS.tipo_documento}'`;
        }
        
        if (datosPQS.numero_documento) {
            sqlActualizarPQS += `, numero_documento = '${datosPQS.numero_documento}'`;
        }

        if (datosPQS.nombre) {
            sqlActualizarPQS += `, nombre = '${datosPQS.nombre}'`;
        }

        if (datosPQS.apellido) {
            sqlActualizarPQS += `, apellido = '${datosPQS.apellido}'`;
        }

        if (datosPQS.mensaje) {
            sqlActualizarPQS += `, mensaje = '${datosPQS.mensaje}'`;
        }

        sqlActualizarPQS += `, updated_at = '${datosPQS.updated_at}' WHERE waId = ${datosPQS.waId} AND id = ${datosPQS.id}`;



        /*
        //connection.query(sqlActualizarDatos, (error, res) => {
        db.query(sqlActualizarDatos, (error, res) => {
        if (error) {errorLog('dbquery.error',error);throw error;}

        //return callback(true);

        });*/

        var actualizarPQS = await preguntaQuejaSugerenciaService.actualizarPQS(sqlActualizarPQS);
            //errorLog('::creaConversacion::',res.status(200).json({ status: 200, data: conversacion, message: 'Creo bien' }));
            //consultaConversacion(nuevaconversacion.waId);
            errorLog('::actualizaPQS::'/*,llegada*/);
        
    } catch (error) {
        errorLog(':::Error en actualizarPQS::', error);

    }
}

//consultaExistePQRS
/*
exports.consultaExistePQRS = async function (conversacion, req) {

    try {
        const sqlConsultarPQRS = `SELECT * FROM pregunta_queja_sugerencia where waId = '${conversacion.waId}'`;

        //connection.query(sqlConsultarLlegadaDestino, (error, existeLlegadaADestino) => {
        db.query(sqlConsultarPQRS, (error, existePQRS) => {
            mensajeRespuesta = '';
            if (error) {
                errorLog('dbquery.error', error);
                throw error;
            }

            if (existePQRS.length > 0) {

                conversacion.tipo_formulario = 4;
                //actualizarConversacion(conversacion); //llama a funcion en app.js
                conversacionController.actualizarConversacion(conversacion)//llama a funcion en conversacion.controller.js

                existePQRS[0].pregunta = 1;

                //actualizarLlegadaEncuesta(existeLlegadaADestino[0]); //llama a funcion en app.js
                //llegadasController.actualizarLlegadaEncuesta(existeLlegadaADestino[0]); //llamada a funcion en llegadasController
                this.actualizarPQRS(existePQRS[0]);

                mensajeRespuesta = `A continuación responde a las preguntas para registrar tu PQR como nombre u otros:
Tipo de documento 📇 Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Acta de Nacimiento
2️⃣ Cédula de Identidad (venezolana)
3️⃣ Cédula de Ciudadanía (colombiana)
4️⃣ Pasaporte
5️⃣ Cédula de Extranjería
6️⃣ Otro`;

                whatsappMessageController.sendMessageWhatsapp({
                    'to': req.body['message.from'],
                    'conversationId': req.body.conversationId,
                    'type': 'text',
                    'content': {
                        'text': mensajeRespuesta,
                    }
                });

            } else {
                //conversacion.tipo_formulario = 1;
                //actualizarConversacion(conversacion);
                //crearDatosActualizados(conversacion);

                this.crearPQR(conversacion, req);

                //mensajeRespuesta = `Por favor escribe tu primer nombre. Sólo puedo leer texto, no utilices audio, imágenes o emojis.`;

            }

        });

    } catch (error) {
        errorLog(':::Error en consultaPQR::', error);

    }


}*/