var ActualizarDatosContactoService = require('../services/actualizarDatos.services');
var whatsappMessageController = require('./whatsappMessage.controller');

var conversacionController = require('./conversacion.controller');

var db = require('../db');

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.actualizarDatosContacto = async function($datosContactoActualizados){

    try {
        $datosContactoActualizados.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

    const sqlActualizarDatos = `UPDATE datos_actualizados SET pregunta = ${$datosContactoActualizados.pregunta},
    tipo_documento = '${$datosContactoActualizados.tipo_documento}', numero_documento = '${$datosContactoActualizados.numero_documento}',
    telefono = ${$datosContactoActualizados.telefono}, correo_electronico = '${$datosContactoActualizados.correo_electronico}',
     id_encuesta = ${$datosContactoActualizados.id_encuesta},  updated_at = '${$datosContactoActualizados.updated_at}'
     WHERE waId = ${$datosContactoActualizados.waId}`;

     /*
    //connection.query(sqlActualizarDatos, (error, res) => {
    db.query(sqlActualizarDatos, (error, res) => {
      if (error) {errorLog('dbquery.error',error);throw error;}

      //return callback(true);

    });*/

    var actualizarDatos = await ActualizarDatosContactoService.actualizarDatosContacto(sqlActualizarDatos);
        //errorLog('::creaConversacion::',res.status(200).json({ status: 200, data: conversacion, message: 'Creo bien' }));
        //consultaConversacion(nuevaconversacion.waId);
        errorLog('::actualizaDatos::'/*,llegada*/);
        
    } catch (error) {
        errorLog(':::Error en actualizaDatos::', error);

    }

}

exports.actualizarDatosContactoEncuesta = async function($datosContactoEncuesta){

    try {
        //console.log('ENTRA A ACTUALIZAR DATOS CONTACTOENCUESTA!!!');
        //consulta encuesta con $llegadaEncuesta waId, toma id_encuesta y se lo asigna a llegadas where waid = encuesta.waId;
        const sqlConsultaEncuesta = `SELECT id FROM encuesta WHERE waId = '${$datosContactoEncuesta.waId}' AND tipo_documento = '${$datosContactoEncuesta.tipo_documento}' AND numero_documento = '${$datosContactoEncuesta.numero_documento}'`;

        //connection.query(sqlConsultaEncuesta, (error, encuesta) => {
        db.query(sqlConsultaEncuesta, (error, encuesta) => {
            //mensajeRespuesta = '';
            if (error) console.log('ERROR EN ACTUALIZAR DATOS CONTACTO ENCUESTA:: ', error);

            if (encuesta.length > 0) {
                //console.log('SI ENCONTRO UNA ENCUESTA CON EL WAID EN ACTUALIZAR DATOS CONTACTO::');
                $datosContactoEncuesta.id_encuesta = encuesta[0]['id'];
                //actualizarDatosContacto($datosContactoEncuesta); //llama a funcion en app.js
                //actualizarDatosContactoController.actualizarDatosContacto($datosContactoEncuesta);//llama a funcion en actualizarDAtosContacto.controller
                this.actualizarDatosContacto($datosContactoEncuesta);

            }else{
                $datosContactoEncuesta.id_encuesta = null;
                //actualizarDatosContacto($datosContactoEncuesta); //llama a funcion en app.js
                //actualizarDatosContactoController.actualizarDatosContacto($datosContactoEncuesta);//llama a funcion en actualizarDAtosContacto.controller
                this.actualizarDatosContacto($datosContactoEncuesta);
            }
        });
        
    } catch (error) {
        errorLog(':::Error en actualizarDatosContactoEncuesta::', error);

    }
    
  }

  exports.crearDatosActualizados = async function ($conversation, req) {

    try {
        const sqlnuevoDatosActualizados = 'INSERT INTO datos_actualizados SET ?';

        const params = req.body;
        //var newprofile = params.ProfileName.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');
        var newprofile = params['contact.firstName'].replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');
    //console.log('REEMPLAZO: ', newprofile);

        const nuevoDatosActualizados = {
        waId: $conversation.waId,
        pregunta: 1,
        created_at: new Date(),
        }

        //connection.query(sqlnuevoDatosActualizados, nuevoDatosActualizados, (error, results) => {
        db.query(sqlnuevoDatosActualizados, nuevoDatosActualizados, (error, results) => {
        if (error){
            mensajeRespuesta = `Disculpa tuvimos un problema. Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
    1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
    2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
    3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
        } else{

            $conversation.tipo_formulario = 3;
            
            //actualizarConversacion($conversation); //llamada a funcion en app.js
            conversacionController.actualizarConversacion($conversation); //llamada a conversacionController


            mensajeRespuesta = `A continuación responde a las preguntas para actualizar tus datos de contacto como teléfono u otros:
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
                    },
             'reportUrl': process.env.WP_REPORT_URL
            });

        });

        
    } catch (error) {
        errorLog(':::Error en crearDatosActualizados::', error);

    }

}

exports.consultaExisteDatosActualizados = async function(conversacion,req){
    
    const sqlConsultarDatosActualizados = `SELECT * FROM datos_actualizados where waId = '${conversacion.waId}'`;

    //connection.query(sqlConsultarDatosActualizados, (error, existeDatosActualizados) => {
    db.query(sqlConsultarDatosActualizados, (error, existeDatosActualizados) => {
      mensajeRespuesta = '';
      if (error) {errorLog('dbquery.error',error);throw error;}

      if (existeDatosActualizados.length > 0) {

        conversacion.tipo_formulario = 3;

        conversacionController.actualizarConversacion(conversacion)//llama a funcion en conversacion.controller.js

        existeDatosActualizados[0].pregunta = 1;

        //actualizarDatosContacto(existeDatosActualizados[0]); //llama a funcion en app.js
        //actualizarDatosContactoController.actualizarDatosContacto(existeDatosActualizados[0]);//llama a funcion en actualizarDAtosContacto.controller
        this.actualizarDatosContacto(existeDatosActualizados[0]);

        mensajeRespuesta = `A continuación responde a las preguntas para actualizar tus datos de contacto como teléfono u otros:
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
                },
            'reportUrl': process.env.WP_REPORT_URL
        });

      }else{
        
        //crearDatosActualizados(conversacion); //llama a funcion en app.js
        //actualizarDatosContactoController.crearDatosActualizados(conversacion,req); //llama a funcion en actualizarDatosController
        this.crearDatosActualizados(conversacion,req);
      }

    });


  }