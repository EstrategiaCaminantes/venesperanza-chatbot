var EncuestaService = require('../services/encuesta.services')  
var conversacionController = require('./conversacion.controller');
var whatsappMessageController = require('./whatsappMessage.controller');
var db = require('../db');

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.consultaExisteEncuesta = async function(conversacion, req){
    const sqlConsultarEncuesta = `SELECT * FROM encuesta where waId = '${conversacion.waId}'`;

    //connection.query(sqlConsultarEncuesta, (error, existeEncuesta) => {
    db.query(sqlConsultarEncuesta, (error, existeEncuesta) => {
      mensajeRespuesta = '';
      if (error) {errorLog('dbquery.error',error);throw error;}

      if (existeEncuesta.length > 0) {

        mensajeRespuesta = `Ya has respondido el formulario. Gracias!
Ahora por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
whatsappMessageController.sendMessageWhatsapp({
            'to': req.body['message.from'],
            'conversationId': req.body.conversationId,
            'type': 'text',
            'content': {
                    'text': mensajeRespuesta,
                  },
                  //'reportUrl': process.env.reportUrl_CHATBOT
          });
      }else{

        this.crearEncuesta(conversacion,req);//llama a funcion en app.js
        //encuestaController.crearEncuesta(conversacion, req); //envia conversacion y req a funcion crearEncuesta en encuesta.controller
      }

    });
}

exports.crearEncuesta = async function($conversation, req) {

    const sqlnuevaencuesta = 'INSERT INTO encuesta SET ?';

    /*
    //reemplazo de emoticones en el nombre de perfil de whatsapp
    //var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    var newprofile = params['contact.firstName'].replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');
    */

    const nuevaencuesta = {
      waId: $conversation.waId,
      //profileName: newprofile,
      profileName: $conversation.profileName,
      created_at: new Date(),
      pregunta: 1,
      fuente: 1
    }
    //console.log('NUEVA CONVERSACION: ', nuevaconversacion);

    //connection.query(sqlnuevaencuesta, nuevaencuesta, (error, results) => {
    db.query(sqlnuevaencuesta, nuevaencuesta, (error, results) => {
      if (error){
        mensajeRespuesta = `Disculpa tuvimos un problema en crear la encuesta. Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;


      }else{
        $conversation.tipo_formulario = 1;
        //actualizarConversacion($conversation); //llamado en app.js
        conversacionController.actualizarConversacion($conversation);

        mensajeRespuesta = `Por favor escribe tu primer nombre. Sólo puedo leer texto, no utilices audio, imágenes o emojis.`;

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

}

exports.actualizarEncuesta = async function ($encuesta) {

    try {
        $encuesta.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;
    
        //campos finales
        const sqlCreaEncuesta = `UPDATE encuesta SET pregunta = ${$encuesta.pregunta},
        primer_nombre = '${$encuesta.primer_nombre}', segundo_nombre = '${$encuesta.segundo_nombre}', primer_apellido = '${$encuesta.primer_apellido}', segundo_apellido = '${$encuesta.segundo_apellido}',
        codigo_encuesta = '${$encuesta.codigo_encuesta}',
        tipo_documento = '${$encuesta.tipo_documento}', cual_otro_tipo_documento = '${$encuesta.cual_otro_tipo_documento}', numero_documento = '${$encuesta.numero_documento}',
        como_llego_al_formulario = '${$encuesta.como_llego_al_formulario}', fecha_llegada_pais = '${$encuesta.fecha_llegada_pais}',
        nombre_municipio_destino_final = '${$encuesta.nombre_municipio_destino_final}',
        numero_entregado_venesperanza = ${$encuesta.numero_entregado_venesperanza},
        numero_contacto = '${$encuesta.numero_contacto}', linea_contacto_propia = ${$encuesta.linea_contacto_propia},
        linea_asociada_whatsapp = ${$encuesta.linea_asociada_whatsapp},
        correo_electronico = '${$encuesta.correo_electronico}',
        telefono_conocido_destino = '${$encuesta.telefono_conocido_destino}',
        parentesco_conocido_destino = '${$encuesta.parentesco_conocido_destino}',
        otro_parentesco_conocido_destino = '${$encuesta.otro_parentesco_conocido_destino}',
        updated_at = '${$encuesta.updated_at}'
        WHERE id = ${$encuesta.id}`;

        /*
        db.query(sqlCreaEncuesta, (error, res) => {
        if (error) {errorLog('dbquery.error',error);throw error;}

        //return callback(true);

        });*/

        
        var encuesta = await EncuestaService.actualizarEncuesta(sqlCreaEncuesta);
        //errorLog('::creaConversacion::',res.status(200).json({ status: 200, data: conversacion, message: 'Creo bien' }));
        //consultaConversacion(nuevaconversacion.waId);
        errorLog('::creaConversacion::'/*,encuesta*/);
        
    } catch (error) {
        errorLog(':::Error en actualizaencuesta::', error);

    }

  }