var LlegadasService = require('../services/llegadas.services')
var whatsappMessageController = require('./whatsappMessage.controller');
var conversacionController = require('./conversacion.controller');

var db = require('../db');

function errorLog(title, msg) {
    if (process.env.ENV === 'test') {
        console.log(title, msg);
    }
}

exports.crearLlegadaADestino = async function (conversation, req) {

    try {
        const sqlnuevaLlegada = 'INSERT INTO llegadas SET ?';

        const nuevaLlegada = {
            waId: conversation.waId,
            pregunta: 1,
            created_at: new Date(),
        }

        //connection.query(sqlnuevaLlegada, nuevaLlegada, (error, results) => {
        db.query(sqlnuevaLlegada, nuevaLlegada, (error, results) => {
            if (error) {
                mensajeRespuesta = `Disculpa tuvimos un problema. Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
1️⃣ Quieres informar de tu llegada a destino ☝🏻\n
2️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
            } else {
                conversation.tipo_formulario = 2;

                //actualizarConversacion($conversation); //llamada a funcion en app.js
                conversacionController.actualizarConversacion(conversation); //llamada a conversacionController

                mensajeRespuesta = `A continuación responde a las preguntas para informar de tu llegada a destino como teléfono u otros:
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
        errorLog(':::Error en crearLlegada::', error);

    }

}

exports.actualizarLlegada = async function (llegada) {

    try {
        llegada.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

        let sqlLlegada = `UPDATE llegadas SET pregunta = ${llegada.pregunta},
        numero_contacto = ${llegada.numero_contacto}, 
        id_encuesta = ${llegada.id_encuesta},
        numero_contacto_asociado_whatsapp = ${llegada.numero_contacto_asociado_whatsapp}`;

        if (llegada.tipo_documento){
          sqlLlegada += `, tipo_documento = '${llegada.tipo_documento}'`;
        }

        if (llegada.numero_documento) {
            sqlLlegada += `, numero_documento = '${llegada.numero_documento}'`;
        }

        if (llegada.nombre_jefe_hogar) {
            sqlLlegada += `, nombre_jefe_hogar = '${llegada.nombre_jefe_hogar}'`;
        }

        if (llegada.donde_te_encuentras) {
            sqlLlegada += `, donde_te_encuentras = '${llegada.donde_te_encuentras}'`;
        }

        if (llegada.otro_donde_te_encuentras) {
          sqlLlegada += `, otro_donde_te_encuentras = '${llegada.otro_donde_te_encuentras}'`;
        }

        sqlLlegada += `, updated_at = '${llegada.updated_at}' WHERE waId = ${llegada.waId} 
        AND id = ${llegada.id}`; //ahora actualiza por waId y id del registro

        /*
        db.query(sqlLlegada, (error, res) => {
          if (error) console.log('ERRROR ACTUALIZAR LLEGADA', error);
    
          //return callback(true);
    
        });*/

        var llegada = await LlegadasService.actualizarLlegada(sqlLlegada);
        //errorLog('::creaConversacion::',res.status(200).json({ status: 200, data: conversacion, message: 'Creo bien' }));
        //consultaConversacion(nuevaconversacion.waId);
        errorLog('::actualizaLlegada::'/*,llegada*/);

    } catch (error) {
        errorLog(':::Error en actualizaLlegada::', error);

    }

}

/*
//Anterior
exports.actualizarLlegadaEncuesta = async function($llegadaEncuesta){

    try {
        //consulta encuesta con $llegadaEncuesta waId, toma id_encuesta y se lo asigna a llegadas where waid = encuesta.waId;
    const sqlConsultaEncuesta = `SELECT id FROM encuesta WHERE waId = '${$llegadaEncuesta.waId}' AND tipo_documento = '${$llegadaEncuesta.tipo_documento}' AND numero_documento = '${$llegadaEncuesta.numero_documento}'`;
    //const sqlConsultaEncuesta = `SELECT id FROM encuesta WHERE tipo_documento = '${$llegadaEncuesta.tipo_documento}' AND numero_documento = '${$llegadaEncuesta.numero_documento}'`;

    //connection.query(sqlConsultaEncuesta, (error, encuesta) => {
    db.query(sqlConsultaEncuesta, (error, encuesta) => {
      //mensajeRespuesta = '';
      if (error) console.log('ERROR EN ACTUALIZAR LLEGADA ENCUESTA:: ', error);

      if (encuesta.length > 0) {
        //console.log('SI ENCONTRO UNA ENCUESTA CON EL WAID::');
        $llegadaEncuesta.id_encuesta = encuesta[0]['id'];
        
        //actualizarLlegada($llegadaEncuesta); //llama a funcion en app.js
        //llegadasController.actualizarLlegada($llegadaEncuesta); //llama a funcion en llegadas.controller.js
        this.actualizarLlegada($llegadaEncuesta);

      }else{
        //actualizarLlegada($llegadaEncuesta); //llama a funcion en app.js
        //llegadasController.actualizarLlegada($llegadaEncuesta); //llama a funcion en llegadas.controller.js
        this.actualizarLlegada($llegadaEncuesta);

      }
    });
        
    } catch (error) {
        errorLog(':::Error en actualizarLlegadaEncuesta::', error);

    }

    
  }
  */

exports.actualizarLlegadaEncuesta = async function (llegadaEncuesta) {

    try {
        //console.log('::entra a actualizarLlegada::',$llegadaEncuesta);
        if (llegadaEncuesta.pregunta == 3) {
            //console.log('::VA A BUSCAR POR tipo y numero documento::');
            sqlConsultaEncuesta = `SELECT id FROM encuesta WHERE tipo_documento = '${llegadaEncuesta.tipo_documento}' 
         AND numero_documento = '${llegadaEncuesta.numero_documento}'`;

        } else if (llegadaEncuesta.pregunta == 5 && !llegadaEncuesta.id_encuesta) {
            //console.log('::VA A BUSCAR POR numero_contacto=numero_conto o =whatsapp o waid=waid::');
            whatsappLlegada = llegadaEncuesta.waId.substring(2, 12); //quita prefijos de whatsapp
            sqlConsultaEncuesta = `SELECT id FROM encuesta WHERE numero_contacto = '${llegadaEncuesta.numero_contacto}' 
         OR numero_contacto = '${whatsappLlegada}' OR waId = '${llegadaEncuesta.waId}'`;

        }else{
            sqlConsultaEncuesta = null;
        }

        if (sqlConsultaEncuesta) {
            //console.log('::EXISTE SQLCONSULTA??:::');
            db.query(sqlConsultaEncuesta, (error, encuesta) => {
                if (error) console.log('ERROR EN ACTUALIZAR LLEGADA ENCUESTA:: ', error);

                if (encuesta.length > 0) {
                    llegadaEncuesta.id_encuesta = encuesta[0]['id'];
                    this.actualizarLlegada(llegadaEncuesta);

                } else {

                    this.actualizarLlegada(llegadaEncuesta);

                }
            });
        } else {
            //console.log('::NO HAY SQLQUERY::');
            this.actualizarLlegada(llegadaEncuesta);
        }


    } catch (error) {
        errorLog(':::Error en actualizarLlegadaEncuesta::', error);

    }


}

exports.consultaExisteLlegadaADestino = async function (conversacion, req) {

    try {
        const sqlConsultarLlegadaDestino = `SELECT * FROM llegadas where waId = '${conversacion.waId}'`;

        //connection.query(sqlConsultarLlegadaDestino, (error, existeLlegadaADestino) => {
        db.query(sqlConsultarLlegadaDestino, (error, existeLlegadaADestino) => {
            mensajeRespuesta = '';
            if (error) {
                errorLog('dbquery.error', error);
                throw error;
            }

            if (existeLlegadaADestino.length > 0) {

                conversacion.tipo_formulario = 2;

                conversacionController.conversacion(conversacion,existeLlegadaADestino[0],req);
                /*
                conversacionController.actualizarConversacion(conversacion)//llama a funcion en conversacion.controller.js

                existeLlegadaADestino[0].pregunta = 1;

                //actualizarLlegadaEncuesta(existeLlegadaADestino[0]); //llama a funcion en app.js
                //llegadasController.actualizarLlegadaEncuesta(existeLlegadaADestino[0]); //llamada a funcion en llegadasController
                this.actualizarLlegadaEncuesta(existeLlegadaADestino[0]);

                mensajeRespuesta = `A continuación responde a las preguntas para registrar tu llegada a destino como teléfono u otros:
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
                });*/

            } else {
                //conversacion.tipo_formulario = 1;
                //actualizarConversacion(conversacion);
                //crearDatosActualizados(conversacion);

                //crearLlegadaADestino(conversacion); //llamada afuncion en app.js
                //llegadasController.crearLlegadaADestino(conversacion,req);//envio conversacion y req a funcion en llegadasController
                this.crearLlegadaADestino(conversacion, req);

                //mensajeRespuesta = `Por favor escribe tu primer nombre. Sólo puedo leer texto, no utilices audio, imágenes o emojis.`;

            }

        });

    } catch (error) {
        errorLog(':::Error en consultaExisteLlegadaADestino::', error);

    }


}
