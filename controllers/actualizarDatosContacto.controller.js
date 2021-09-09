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

    let sqlActualizarDatos = `UPDATE datos_actualizados SET pregunta = ${$datosContactoActualizados.pregunta},
        telefono = ${$datosContactoActualizados.telefono}, 
        id_encuesta = ${$datosContactoActualizados.id_encuesta} `;

    if ($datosContactoActualizados.tipo_documento) {
        sqlActualizarDatos += `, tipo_documento = '${$datosContactoActualizados.tipo_documento}'`;
    }
    
    if ($datosContactoActualizados.numero_documento) {
        sqlActualizarDatos += `, numero_documento = '${$datosContactoActualizados.numero_documento}'`;
    }

    if ($datosContactoActualizados.correo_electronico) {
        sqlActualizarDatos += `, correo_electronico = '${$datosContactoActualizados.correo_electronico}'`;
    }

    sqlActualizarDatos += `, updated_at = '${$datosContactoActualizados.updated_at}' WHERE waId = ${$datosContactoActualizados.waId}`;



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

exports.actualizarDatosContactoEncuesta = async function(datosContactoEncuesta){

    try {
        //console.log('ENTRA A ACTUALIZAR DATOS CONTACTOENCUESTA!!!');

        if (datosContactoEncuesta.pregunta == 3) {
            console.log('SI ENTRA A PREGUNTA 3!!');
            sqlConsultaEncuesta = `SELECT id FROM encuesta WHERE tipo_documento = '${datosContactoEncuesta.tipo_documento}' AND numero_documento = '${datosContactoEncuesta.numero_documento}'`;

        } else if (datosContactoEncuesta.pregunta == 4 && !datosContactoEncuesta.id_encuesta) {
            //console.log('::VA A BUSCAR POR numero_contacto=numero_conto o =whatsapp o waid=waid::');
            whatsappActualizar = datosContactoEncuesta.waId.substring(2, 12); //quita prefijos de whatsapp
            sqlConsultaEncuesta = `SELECT id FROM encuesta WHERE numero_contacto = '${datosContactoEncuesta.telefono}' 
         OR numero_contacto = '${whatsappActualizar}'`;

        }
        //const sqlConsultaEncuesta = `SELECT id FROM encuesta WHERE waId = '${$datosContactoEncuesta.waId}' AND tipo_documento = '${$datosContactoEncuesta.tipo_documento}' AND numero_documento = '${$datosContactoEncuesta.numero_documento}'`;

        //connection.query(sqlConsultaEncuesta, (error, encuesta) => {

        if (sqlConsultaEncuesta) {
            //console.log('::EL SQCONSULTA ENCUESTA ES:: ', sqlConsultaEncuesta);
            db.query(sqlConsultaEncuesta, (error, encuesta) => {
                //mensajeRespuesta = '';
                if (error) console.log('ERROR EN ACTUALIZAR DATOS CONTACTO ENCUESTA:: ', error);
    
                if (encuesta.length > 0) {
                    //console.log('SI ENCONTRO UNA ENCUESTA CON EL WAID EN ACTUALIZAR DATOS CONTACTO::');
                    datosContactoEncuesta.id_encuesta = encuesta[0]['id'];
                    //actualizarDatosContacto($datosContactoEncuesta); //llama a funcion en app.js
                    //actualizarDatosContactoController.actualizarDatosContacto($datosContactoEncuesta);//llama a funcion en actualizarDAtosContacto.controller
                    this.actualizarDatosContacto(datosContactoEncuesta);
    
                }else{
                    datosContactoEncuesta.id_encuesta = null;
                    //actualizarDatosContacto($datosContactoEncuesta); //llama a funcion en app.js
                    //actualizarDatosContactoController.actualizarDatosContacto($datosContactoEncuesta);//llama a funcion en actualizarDAtosContacto.controller
                    this.actualizarDatosContacto(datosContactoEncuesta);
                }
            });
        }else{
            this.actualizarDatosContacto(datosContactoEncuesta);

        }
       
        
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
    1️⃣ Quieres informar de tu llegada a destino ☝🏻\n
    2️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
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
                    }
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
                }
        });

      }else{
        
        //crearDatosActualizados(conversacion); //llama a funcion en app.js
        //actualizarDatosContactoController.crearDatosActualizados(conversacion,req); //llama a funcion en actualizarDatosController
        this.crearDatosActualizados(conversacion,req);
      }

    });


  }