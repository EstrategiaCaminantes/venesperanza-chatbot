var ConversacionService = require('../services/conversacion.services')  
var whatsappMessageController = require('./whatsappMessage.controller');
var autorizacionTratamientoDatosController = require('./autorizacionTratamientoDatos.controller');
var encuestaController = require('./encuesta.controller');
var llegadasController = require('./llegadas.controller');
var actualizarDatosContactoController = require('./actualizarDatosContacto.controller');
var notificacionReporteLlegadaController = require('./notificacionReporteLlegada.controller');
var preguntaQuejaSugerenciaController = require('./preguntaQuejaSugerencia.controller');

var db = require('../db');

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.actualizarConversacion = async function($conversa){

    try {
        $conversa.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

        //$conversa.updated_at = dateFormat($conversa.updated_at, "yyyy-mm-dd hh");

        const sqlConversacion = `UPDATE conversacion_chatbot SET conversation_start = ${$conversa.conversation_start}, 
        autorizacion = ${$conversa.autorizacion}, tipo_formulario = ${$conversa.tipo_formulario}, updated_at = '${$conversa.updated_at}'
        where id = ${$conversa.id}`;
        //console.log('VALOR SQL', sqlCreaEncuesta);

        /*
        db.query(sqlConversacion, (error, res) => {
        if (error) console.log('ERROR: ', error);

        });
        */

        var conversacion = await ConversacionService.actualizarConversacion(sqlConversacion);

        
    } catch (error) {
        errorLog(':::Error en actualizarConversacion::', error);

    }
    
}


//funcion principal conversacion
 //Conversacion del chatbot general, valida el estado de la conversacion y entra a cada uno de los formulario o de las preguntas generales del saludo inicial
 exports.conversacion = async function (conversation, $formulario, req) {

    //console.log('ENTRO A CONVERSACION--', conversation);
    //console.log('FORMULARIO EN conversacion--', $formulario);

    mensajeRespuesta = '';

    if (conversation.conversation_start == true) {

      if (conversation.autorizacion == true){

        if(conversation.tipo_formulario){

          if(conversation.tipo_formulario == 1){
            //$formulario es la encuesta

              switch ($formulario.pregunta) {

                //selecciona llenar nuevo form
                case 1: //guardo respuesta pregunta 1
                  try {
                    //console.log('ENTRO A PREGUNTA 1 de nuevo formulario::', req.body.Body);
                    //console.log('body primer nombre:: ', req.body.Body);
                    //$formulario.primer_nombre = req.body.Body;//.replace(/[^\aA-zZ\??\??\??\??\??\??\??\??\??\??\??\??\??\??]/gi, '');
                    $formulario.primer_nombre = req.body.incomingMessage;

                    const pattern = new RegExp('^[aA-zZ????????????????????????????]+$', 'i');

                    if(pattern.test($formulario.primer_nombre)){
                    //console.log('primer nombre:: ', $formulario.primer_nombre);
                    //if($formulario.primer_nombre.length>0){
                      $formulario.pregunta += 1; //pregunta 12

                      //crearEncuesta(conversation);
                      //console.log('LLAMARE A ACTUALZIAR ENCUESTA:: \n', $formulario );
                      //actualizarEncuesta($formulario); //llama a funcion en archivo app.js
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuesta.controller.js
                      /*mensajeRespuesta = "*Segundo Nombre:* " +
                        "(En caso de que no tenga env??a un '.' (punto))";*/
                      mensajeRespuesta = `Por favor escribe tu segundo nombre, si no tienes segundo nombre escribe NO.`

                    }else{
                      //mensajeRespuesta = "*Primer Nombre:* (Ingrese solamente letras, sin emoticones ni caracteres especiales)"
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Por favor escribe tu primer nombre. S??lo puedo leer texto, no utilices audio, im??genes o emojis.`;

                    }

                  } catch (error) {
                    //console.log(error);
                    $formulario.pregunta = 1;
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Por favor escribe tu primer nombre. S??lo puedo leer texto, no utilices audio, im??genes o emojis.`;

                  }
                break;

                case 2: //guardo respuesta pregunta 2

                  try {
                    //$formulario.segundo_nombre = req.body.Body;//.replace(/[^\aA-zZ\??\??\??\??\??\??\??\??\??\??\??\??\??\??]/gi, '');
                    $formulario.segundo_nombre = req.body.incomingMessage;
                    //console.log('primer nombre:: ', conversation.primer_nombre);
                    //if($formulario.segundo_nombre.length>0){
                    const pattern = new RegExp('^[aA-zZ????????????????????????????]+$', 'i');

                    if(pattern.test($formulario.segundo_nombre)){
                      $formulario.pregunta += 1; //pregunta 2

                      //crearEncuesta(conversation);
                      //actualizarEncuesta($formulario); //llama a funcion en app.js
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController
                      /*mensajeRespuesta = "*Segundo Nombre:* " +
                        "(En caso de que no tenga env??a un '.' (punto))";*/
                      mensajeRespuesta = `Por favor escribe tu primer apellido`;

                    }else{
                      //mensajeRespuesta = "*Primer Nombre:* (Ingrese solamente letras, sin emoticones ni caracteres especiales)"
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Por favor escribe tu segundo nombre, si no tienes segundo nombre escribe NO.`;

                    }

                  } catch (error) {
                    //console.log('ERROR EN 2:', error);
                    $formulario.pregunta = 2;
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Por favor escribe tu segundo nombre, si no tienes segundo nombre escribe NO.`;


                  }
                break;

                case 3:
                  try {
                      //$formulario.primer_apellido = req.body.Body;//.replace(/[^\??\??\??\??\??\??\??\??\??\??\??\??\??\??\w\s]/gi, '');
                    $formulario.primer_apellido = req.body.incomingMessage;
                      //if($formulario.primer_apellido.length>0){
                      const pattern = new RegExp('^[aA-zZ???????????????????????????? ]+$', 'i');
                      //console.log('PATTERN::: ', pattern);

                      if(pattern.test($formulario.primer_apellido)){
                        $formulario.pregunta += 1; //pregunta 14

                        //actualizarEncuesta($formulario); //llama a funcion en app.js
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `Por favor escribe tu segundo apellido, si no tienes segundo apellido escribe NO`;

                      }else{
                        mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Por favor escribe tu primer apellido`;
                      }



                  } catch (error) {
                    $formulario.pregunta = 3;
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Por favor escribe tu primer apellido`;
                  }
                break;

                case 4:
                  try {
                      //$formulario.segundo_apellido = req.body.Body;//.replace(/[^\??\??\??\??\??\??\??\??\??\??\??\??\??\??\w\s]/gi, '');
                      $formulario.segundo_apellido = req.body.incomingMessage;
                      //if($formulario.segundo_apellido.length>0){

                        const patternsegundoapellido = new RegExp('^[aA-zZ???????????????????????????? ]+$', 'i');
                        if(patternsegundoapellido.test($formulario.segundo_apellido)){
                        $formulario.pregunta += 1; //pregunta 14

                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `??Cu??l es tu tipo de documento? ???? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? Acta de Nacimiento
2?????? C??dula de Identidad (venezolana)
3?????? C??dula de Ciudadan??a (colombiana)
4?????? Pasaporte
5?????? C??dula de Extranjer??a
6?????? Indocumentado
7?????? Otro`;
                      }else{
                        mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Por favor escribe tu segundo apellido, si no tienes segundo apellido escribe NO`;

                      }

                  } catch (error) {
                    $formulario.pregunta = 4;
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Por favor escribe tu segundo apellido, si no tienes segundo apellido escribe NO`;
                  }
                break;

                case 5:
                  //cual otro tipo de documento
                  try {

                      //switch (req.body.Body) {
                      switch (req.body.incomingMessage){
                        case '1':
                          $formulario.tipo_documento = "Acta de Nacimiento";
                          $formulario.pregunta += 2;// pregunta 7
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;


                          break;
                        case '2':
                          $formulario.tipo_documento = "C??dula de Identidad (venezolana)";

                          $formulario.pregunta += 2;// pregunta 7
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                          break;

                        case '3':
                          $formulario.tipo_documento = "C??dula de ciudadania (colombiana)";

                          $formulario.pregunta += 2;// pregunta 21
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                          break;

                        case '4':
                          $formulario.tipo_documento = "Pasaporte";

                          $formulario.pregunta += 2;// pregunta 7
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                          break;

                        case '5':
                          $formulario.tipo_documento = "C??dula de Extranjer??a";

                          $formulario.pregunta += 2;// pregunta 21
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                          break;

                        case '6':
                          $formulario.tipo_documento = "Indocumentado";

                          $formulario.pregunta += 3;// pregunta 8. Indocumentado no se muestra numero documento
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `??C??mo encontraste mi n??mero de WhatsApp? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? V?? un pend??n en un albergue
2?????? Recib?? un volante en el albergue
3?????? Recib?? una foto con la informaci??n
4?????? Lo recib?? por chat
5?????? Lo encontr?? en Facebook
6?????? Una persona conocida me lo envi?? para que lo llenara
7?????? Recib?? una manilla con el n??mero
8?????? Otro`;
                        break;

                        case '7':
                          $formulario.tipo_documento = "Otro";
                          $formulario.pregunta += 1; // pregunta 6
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `??Cu??l? (Indicar tipo, ejemplo: pasaporte)`;
                        break;

                        default:
                          mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l es tu tipo de documento? ???? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? Acta de Nacimiento
2?????? C??dula de Identidad (venezolana)
3?????? C??dula de Ciudadan??a (colombiana)
4?????? Pasaporte
5?????? C??dula de Extranjer??a
6?????? Indocumentado
7?????? Otro`;
                          break;


                    }

                  } catch (error) {
                    $formulario.pregunta = 5; //vuelve a entrar a pregunta 5
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l es tu tipo de documento? ???? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? Acta de Nacimiento
2?????? C??dula de Identidad (venezolana)
3?????? C??dula de Ciudadan??a (colombiana)
4?????? Pasaporte
5?????? C??dula de Extranjer??a
6?????? Indocumentado
7?????? Otro`;
                  }
                break;

                case 6:
                  try {
                    //$formulario.cual_otro_tipo_documento = req.body.Body;//.replace(/[^\??\??\??\??\??\??\??\??\??\??\??\??\??\??\w\s]/gi, '');
                    $formulario.cual_otro_tipo_documento = req.body.incomingMessage;
                    //if($formulario.cual_otro_tipo_documento.length>0){

                    const pattern = new RegExp('^[aA-zZ???????????????????????????? ]+$', 'i');

                    if(pattern.test($formulario.cual_otro_tipo_documento)){

                      $formulario.pregunta += 1;// pregunta 7.
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;


                    }else{
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l otro tipo de documento? (Indicar tipo, ejemplo: pasaporte)`;
                    }

                  } catch (error) {
                    $formulario.pregunta = 6; //vuelve a entrar a paso 6
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l otro tipo de documento? (Indicar tipo, ejemplo: pasaporte)`;

                  }

                break;

                case 7:
                  try {
                    //$formulario.numero_documento = req.body.Body;//.replace(/[^\??\??\??\??\??\??\??\??\??\??\??\??\??\??\-\w]/gi, '');
                    $formulario.numero_documento = req.body.incomingMessage;

                    const pattern = new RegExp('^[0-9]+$', 'i');

                    if(pattern.test($formulario.numero_documento)){
                    //if($formulario.numero_documento.length>0){

                    $formulario.pregunta += 1;// pregunta 8.
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `??C??mo encontraste mi n??mero de WhatsApp? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? V?? un pend??n en un albergue
2?????? Recib?? un volante en el albergue
3?????? Recib?? una foto con la informaci??n
4?????? Lo recib?? por chat
5?????? Lo encontr?? en Facebook
6?????? Una persona conocida me lo envi?? para que lo llenara
7?????? Recib?? una manilla con el n??mero
8?????? Otro`;
                    }else{
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;

                    }

                  } catch (error) {
                    $formulario.pregunta = 7; //vuelve a entrar a paso 7
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                }
                break;

                case 8:
                  try {
                    //switch (req.body.Body) {
                    switch (req.body.incomingMessage){
                    case '1':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "V?? un pend??n en un albergue";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;

                      break;

                    case '2':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recib?? un volante en el albergue";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;

                      break;

                    case '3':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recib?? una foto con la informaci??n";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;

                      break;

                    case '4':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recib?? el enlache por chat";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;

                      break;

                    case '5':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Encontr?? el enlace en Facebook";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;

                      break;

                    case '6':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Una persona conocida me lo envi?? para que lo llenara";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);

                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;

                      break;
                    
                    case '7':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recib?? una manilla con el n??mero";
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;
                      break;

                    case '8':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Otro";
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;
                      break;

                    default:
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

??C??mo encontraste mi n??mero de WhatsApp? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? V?? un pend??n en un albergue
2?????? Recib?? un volante en el albergue
3?????? Recib?? una foto con la informaci??n
4?????? Lo recib?? por chat
5?????? Lo encontr?? en Facebook
6?????? Una persona conocida me lo envi?? para que lo llenara
7?????? Recib?? una manilla con el n??mero
8?????? Otro`;
                      break;
                    }


                  } catch (error) {
                    $formulario.pregunta = 8; //vuelve a entrar a paso 8
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

??C??mo encontraste mi n??mero de WhatsApp? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? V?? un pend??n en un albergue
2?????? Recib?? un volante en el albergue
3?????? Recib?? una foto con la informaci??n
4?????? Lo recib?? por chat
5?????? Lo encontr?? en Facebook
6?????? Una persona conocida me lo envi?? para que lo llenara
7?????? Recib?? una manilla con el n??mero
8?????? Otro`;
                  }
                break;

                case 9:
                  try {


                    patternfecha = /^[0-9]{4}[\-][0-9]{2}[\-][0-9]{2}$/g;

                    //if(patternfecha.test(req.body.Body)){
                    //if(patternfecha.test(req.body.Body)){
                    if(patternfecha.test(req.body.incomingMessage)){
                     
                      //$fechavalidar = req.body.Body.split('-');
                      $fechavalidar = req.body.incomingMessage.split('-');
                      //console.log('FECHA VALIDAR:', $fechavalidar);

                        $validarA??o = parseInt($fechavalidar[0]);
                        $validarMes = parseInt($fechavalidar[1]);
                        $validarDia = parseInt($fechavalidar[2]);


                        $fechaActual = new Date();
                        $a??oActual = $fechaActual.getFullYear();
                        $a??oActualInteger = parseInt($a??oActual);



                        if (($validarDia > 0 && $validarDia <= 31) && ($validarMes > 0 && $validarMes <= 12) && ($validarA??o >= 2010 && $validarA??o <= $a??oActualInteger)) {
                          //console.log('FECHA VALIDA!!');
                          //console.log('TAMA??O SI ES TRES: ', $fechavalidar.length);
                          $formulario.pregunta += 1; //va a pregunta 10
                          $formulario.fecha_llegada_pais = req.body.incomingMessage;//.replace(/[^\-\w]/gi, '');

                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController


                          mensajeRespuesta = `??Cu??l es tu destino final dentro de Colombia? Env??a el n??mero de la opci??n correspondiente:
1?????? No estoy seguro/a
2?????? Otro
3?????? Arauca
4?????? Barranquilla
5?????? Bogot??
6?????? Bucaramanga
7?????? Cali
8?????? Cartagena
9?????? C??cuta
???? Medell??n
1??????1?????? Riohacha
1??????2?????? Pasto
1??????3?????? Valledupar`;

                        } else {
                          mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;

                        }
                      
                    }else{
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;

                    }

                } catch (error) {
                  $formulario.pregunta = 9; //vuelve a 9
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??En qu?? fecha t?? y tu grupo familiar llegaron al pa??s?????????. Env??a la fecha de esta manera AAAA-MM-DD para (A??o-Mes-D??a. Ejemplo: 2000-10-26)`;

                }
                break;

                case 10:
                  try {

                    const opcionesSeleccion = ['1','2','3','4','5','6','7','8','9','10','11','12','13'];

                    if (opcionesSeleccion.includes(req.body.incomingMessage)) {

                      switch (req.body.incomingMessage) {

                        case '1':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'No estoy seguro/a';

                        break;

                        case '2':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Otro';
                        break;

                        case '3':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Arauca';
                        break;

                        case '4':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Barranquilla';
                        break;

                        case '5':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Bogot??';
                        break;

                        case '6':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Bucaramanga';
                        break;

                        case '7':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Cali';
                        break;

                        case '8':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Cartagena';
                        break;

                        case '9':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'C??cuta';
                        break;

                        case '10':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Medell??n';
                        break;

                        case '11':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Riohacha';
                        break;

                        case '12':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Pasto';
                        break;

                        case '13':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Valledupar';
                        break;

                        default:
                          break;

                      }

                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;


                    } else {

                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Cu??l es tu destino final dentro de Colombia? Env??a el n??mero de la opci??n correspondiente:
1?????? No estoy seguro/a
2?????? Otro
3?????? Arauca
4?????? Barranquilla
5?????? Bogot??
6?????? Bucaramanga
7?????? Cali
8?????? Cartagena
9?????? C??cuta
???? Medell??n
1??????1?????? Riohacha
1??????2?????? Pasto
1??????3?????? Valledupar`;

                    }

                  } catch (error) {
                    //console.log('ERROR EN 28__ ', error);
                    $formulario.pregunta = 10; //vuelve a 11
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController


                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Cu??l es tu destino final dentro de Colombia? Env??a el n??mero de la opci??n correspondiente:
1?????? No estoy seguro/a
2?????? Otro
3?????? Arauca
4?????? Barranquilla
5?????? Bogot??
6?????? Bucaramanga
7?????? Cali
8?????? Cartagena
9?????? C??cuta
???? Medell??n
1??????1?????? Riohacha
1??????2?????? Pasto
1??????3?????? Valledupar`;

                  }
                break;

                case 11:
                  try {

                    const pattern = new RegExp('^[0-9]+$', 'i');

                    if(pattern.test(req.body.incomingMessage)){
                      $formulario.numero_contacto = req.body.incomingMessage;
                      $formulario.pregunta += 1; //va a 12
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `??Este n??mero de contacto fue entregado por el programa VenEsperanza? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`;
                    }else{
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe tu n??mero de contacto en n??meros ????` ;

                    }

                  } catch (error) {
                    $formulario.pregunta = 11; //vuelve a 11
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe tu n??mero de contacto en n??meros ????` ;
                  }

                break;

                case 12:
                  try {

                    //switch(req.body.Body){
                    switch(req.body.incomingMessage){
                      case '1':
                        $formulario.numero_entregado_venesperanza = true;
                        $formulario.pregunta += 1; //Va a pregunta 13

                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `??Este n??mero de contacto es tuyo? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`;

                      break;

                      case '2':
                        $formulario.numero_entregado_venesperanza = false;
                        $formulario.pregunta += 1; //Va a pregunta 13

                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `??Este n??mero de contacto es tuyo? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`;

                      break;

                      default:
                        mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Este n??mero de contacto fue entregado por el programa VenEsperanza? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`;

                      break;
                    }

                  } catch (error) {
                    $formulario.pregunta = 12; //vuelve a 12
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Este n??mero de contacto fue entregado por el programa VenEsperanza? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`;

                  }
                break;


                case 13:
                  try {
                    //switch(req.body.Body){
                    switch(req.body.incomingMessage){
                      case '1':
                        $formulario.linea_contacto_propia = true;
                        $formulario.pregunta += 1; //Va a pregunta 14
                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `??Este n??mero de contacto tiene WhatsApp? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`;
                      break;

                      case '2':
                        $formulario.linea_contacto_propia = false;
                        $formulario.pregunta += 1; //Va a pregunta 14
                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `??Este n??mero de contacto tiene WhatsApp? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Este n??mero de contacto es tuyo? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`

                      break;
                    }

                  } catch (error) {
                    $formulario.pregunta = 13; //vuelve a 13
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Este n??mero de contacto es tuyo? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`

                  }

                break;

                case 14:
                  try {
                    //switch(req.body.Body){
                    switch(req.body.incomingMessage){

                      case '1':
                        $formulario.linea_asociada_whatsapp = true;
                        $formulario.pregunta += 1; //Va a pregunta 15
                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `??Podr??as compartirme un correo electr??nico ???? en el que te podamos contactar? Si no ??? tienes, ??no te preocupes! escribe NO`;
                      break;

                      case '2':
                        $formulario.linea_asociada_whatsapp = false;
                        $formulario.pregunta += 1; //Va a pregunta 15
                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `??Podr??as compartirme un correo electr??nico ???? en el que te podamos contactar? Si no ??? tienes, ??no te preocupes! escribe NO`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Este n??mero de contacto tiene WhatsApp? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`;


                      break;
                    }

                  } catch (error) {
                    $formulario.pregunta = 14; //vuelve a 14
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Este n??mero de contacto tiene WhatsApp? Responde con el n??mero seg??n la opci??n: 1?????? S?? 2?????? No`;

                  }

                break;

                case 15:
                  try {

                    emailregex = /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i;
                    //console.log('TEST EMAIL:: ', emailregex.test(req.body.Body));
                    //if(req.body.Body === 'NO'){
                    newVariableIncomingMessage = req.body.incomingMessage.toLowerCase();

                    //if(req.body.incomingMessage === 'NO'){
                    if(newVariableIncomingMessage === 'no'){
                      $formulario.pregunta += 1; // va a 16
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      //version anterior terminaba formulario
                      //conversation.tipo_formulario = null;
                      //this.actualizarConversacion(conversation);
                      //mensajeRespuesta = 'final_form_registro';

                      //nueva version:
                      mensajeRespuesta = `??Puedes darme el n??mero de tel??fono de un familiar o alguien que conozcas y con quien est??s en contacto que viva en tu destino? \n
??? Si es posible av??sales que podremos contactarlos y preguntar por ti, en caso de que no logremos un contacto directo contigo. (Env??a el n??mero de tel??fono ?? la palabra NO).`;



                    //}else if(emailregex.test(req.body.Body)) {
                    }else if(emailregex.test(req.body.incomingMessage)){
                      //console.log('TEST SI');
                      $formulario.pregunta += 1; //va a 16
                      //$formulario.correo_electronico = req.body.Body;
                      $formulario.correo_electronico = req.body.incomingMessage;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      //anterior version:
                      //conversation.tipo_formulario = null;
                      //this.actualizarConversacion(conversation);
                      //mensajeRespuesta = 'final_form_registro'
                      mensajeRespuesta = `??Puedes darme el n??mero de tel??fono de un familiar o alguien que conozcas y con quien est??s en contacto que viva en tu destino? \n
??? Si es posible av??sales que podremos contactarlos y preguntar por ti, en caso de que no logremos un contacto directo contigo. (Env??a el n??mero de tel??fono ?? la palabra NO).`;


                    }else{
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Podr??as compartirme un correo electr??nico ???? en el que te podamos contactar? Si no ??? tienes, ??no te preocupes! escribe NO`;

                    }

                  } catch (error) {
                    $formulario.pregunta = 15; //vuelve a 15
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Podr??as compartirme un correo electr??nico ???? en el que te podamos contactar? Si no ??? tienes, ??no te preocupes! escribe NO`;

                  }

                break;

                case 16:
                  try {
                    variableIncomingMessage = req.body.incomingMessage.toLowerCase();
                    const pattern = new RegExp('^[0-9]+$', 'i');
                    //si la respuesta es NO-No-nO-no finaliza la encuesta
                    if(variableIncomingMessage === 'no'){

                      $formulario.pregunta = 19; //va a respuesta ya has respondido el formulario
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      conversation.tipo_formulario = null;
                      this.actualizarConversacion(conversation);
                      mensajeRespuesta = 'final_form_registro';

                    }else if(pattern.test(req.body.incomingMessage)){

                      $formulario.telefono_conocido_destino = req.body.incomingMessage;
                      $formulario.pregunta += 1; //va a 17
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `??Cu??l es tu parentesco con esta persona?. Env??a el n??mero de la opci??n correspondiente:\n
1?????? C??nyuge
2?????? Hijo/a
3?????? Padre/madre
4?????? Amigo
5?????? Conocido
6?????? Otro`;

                    }else{
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Puedes darme el n??mero de tel??fono de un familiar o alguien que conozcas y con quien est??s en contacto que viva en tu destino? \n
??? Si es posible av??sales que podremos contactarlos y preguntar por ti, en caso de que no logremos un contacto directo contigo. (Env??a el n??mero de tel??fono ?? la palabra NO).` ;

                    }
                  } catch (error) {
                    $formulario.pregunta = 16; //vuelve a 16

                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Puedes darme el n??mero de tel??fono de un familiar o alguien que conozcas y con quien est??s en contacto que viva en tu destino? \n
??? Si es posible av??sales que podremos contactarlos y preguntar por ti, en caso de que no logremos un contacto directo contigo. (Env??a el n??mero de tel??fono ?? la palabra NO).` ;

                  }
                break;

                case 17:
                  try {
                    switch (req.body.incomingMessage) {

                      case '1':
                        $formulario.pregunta += 2; //finaliza queda en pregunta 19
                        $formulario.parentesco_conocido_destino = 'C??nyuge';
                        
                        encuestaController.actualizarEncuesta($formulario);

                        conversation.tipo_formulario = null;
                        this.actualizarConversacion(conversation);
                        mensajeRespuesta = 'final_form_registro';

                      break;

                      case '2':
                        $formulario.pregunta += 2; //finaliza queda en pregunta 19
                        $formulario.parentesco_conocido_destino = 'Hijo/a';

                        encuestaController.actualizarEncuesta($formulario);

                        conversation.tipo_formulario = null;
                        this.actualizarConversacion(conversation);
                        mensajeRespuesta = 'final_form_registro';
                      break;

                      case '3':
                        $formulario.pregunta += 2; //finaliza queda en pregunta 19
                        $formulario.parentesco_conocido_destino = 'Padre/madre';

                        encuestaController.actualizarEncuesta($formulario);

                        conversation.tipo_formulario = null;
                        this.actualizarConversacion(conversation);
                        mensajeRespuesta = 'final_form_registro';

                      break;

                      case '4':
                        $formulario.pregunta += 2; //finaliza queda en pregunta 19
                        $formulario.parentesco_conocido_destino = 'Amigo';

                        encuestaController.actualizarEncuesta($formulario);

                        conversation.tipo_formulario = null;
                        this.actualizarConversacion(conversation);
                        mensajeRespuesta = 'final_form_registro';

                      break;

                      case '5':
                        $formulario.pregunta += 2; //finaliza queda en pregunta 19
                        $formulario.parentesco_conocido_destino = 'Conocido';

                        encuestaController.actualizarEncuesta($formulario);

                        conversation.tipo_formulario = null;
                        this.actualizarConversacion(conversation);
                        mensajeRespuesta = 'final_form_registro';

                      break;

                      case '6':
                        $formulario.pregunta += 1; //va a pregunta 19
                        $formulario.parentesco_conocido_destino = 'Otro';

                        encuestaController.actualizarEncuesta($formulario);

                        mensajeRespuesta = `Cu??l otro parentesco?`;

                      break;



                      default:
                        mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l es tu parentesco con esta persona?. Env??a el n??mero de la opci??n correspondiente:\n
1?????? C??nyuge
2?????? Hijo/a
3?????? Padre/madre
4?????? Amigo
5?????? Conocido
6?????? Otro`;
                      break;
                    }
                    
                  } catch (error) {
                    $formulario.pregunta = 17; //vuelve a 17
                    encuestaController.actualizarEncuesta($formulario); 
                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l es tu parentesco con esta persona?. Env??a el n??mero de la opci??n correspondiente:\n
1?????? C??nyuge
2?????? Hijo/a
3?????? Padre/madre
4?????? Amigo
5?????? Conocido
6?????? Otro`;
                  }
                break;


                case 18:
                  try {
                    $formulario.otro_parentesco_conocido_destino = req.body.incomingMessage;
                    const pattern = new RegExp('^[aA-zZ???????????????????????????? ]+$', 'i');

                    if(pattern.test($formulario.otro_parentesco_conocido_destino)){
                      //if(pattern.test(req.body.Body)){

                      //$formulario.nombre_jefe_hogar = req.body.Body;
                      $formulario.pregunta += 1; //finaliza encuesta pregunta=19
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario);

                      conversation.tipo_formulario = null;
                      this.actualizarConversacion(conversation);
                      mensajeRespuesta = 'final_form_registro';

                    }else{
mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Cu??l otro parentesco?`;
                    }
                    
                  } catch (error) {
                    $formulario.pregunta = 18; //vuelve a 18
                    encuestaController.actualizarEncuesta($formulario); 
                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Cu??l otro parentesco?`;

                  }
                break;

                case 19:
                  try {
                    mensajeRespuesta = `Ya has respondido el formulario. Gracias`

                  } catch (error) {
                    
                  }
                break;

                default:
                break;
              }

          }else if(conversation.tipo_formulario == 2){
            //$formulario es reportar llegada
            switch ($formulario.pregunta) {

              //selecciona reportar llegada
              case 1: //guardo respuesta pregunta 1
                  try {

                    //switch (req.body.Body) {
                    switch (req.body.incomingMessage){

                      case '1':
                        $formulario.tipo_documento = "Acta de Nacimiento";
                        $formulario.pregunta += 1;// pregunta 2
                        
                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;


                        break;
                      case '2':
                        $formulario.tipo_documento = "C??dula de Identidad (venezolana)";

                        $formulario.pregunta += 1;// pregunta 2

                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '3':
                        $formulario.tipo_documento = "C??dula de ciudadania (colombiana)";

                        $formulario.pregunta += 1;// pregunta 2
                        
                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '4':
                        $formulario.tipo_documento = "Pasaporte";

                        $formulario.pregunta += 1;// pregunta 2
                        
                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '5':
                        $formulario.tipo_documento = "C??dula de Extranjer??a";

                        $formulario.pregunta += 1;// pregunta 2
                        
                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '6':
                        $formulario.tipo_documento = "Otro";
                        $formulario.pregunta += 1;// pregunta 2
                        
                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l es tu tipo de documento? ???? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? Acta de Nacimiento
2?????? C??dula de Identidad (venezolana)
3?????? C??dula de Ciudadan??a (colombiana)
4?????? Pasaporte
5?????? C??dula de Extranjer??a
6?????? Otro`;
                        break;


                      }

                  } catch (error) {
                    $formulario.pregunta = 1; //vuelve a entrar a pregunta 1
                    
                    //actualizarLlegada($formulario); //llama a funcion en app.js
                    llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l es tu tipo de documento? ???? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? Acta de Nacimiento
2?????? C??dula de Identidad (venezolana)
3?????? C??dula de Ciudadan??a (colombiana)
4?????? Pasaporte
5?????? C??dula de Extranjer??a
6?????? Otro`;
                  }
              break;

              case 2: //guardo respuesta pregunta 2

                try {
                  //$formulario.numero_documento = req.body.Body;//.replace(/[^\??\??\??\??\??\??\??\??\??\??\??\??\??\??\-\w]/gi, '');
                  $formulario.numero_documento = req.body.incomingMessage;

                  const pattern = new RegExp('^[0-9]+$', 'i');

                  if(pattern.test($formulario.numero_documento)){
                    //console.log('CUMPLE CON PATTERN EN REPORTELLEGADA');
                  //if($formulario.numero_documento.length>0){

                    $formulario.pregunta += 1;// pregunta 3.
                    //actualizarLlegada($formulario);

                    //consulta encuesta por waId, tipo_documento, numero_documento, entonces toma el id_encuesta y lo asigna a
                    //llegada.
                    //actualizarLlegadaEncuesta($formulario); //llamada a funcion en app.js
                    llegadasController.actualizarLlegadaEncuesta($formulario); //llama a funcion en llegadasController


                    mensajeRespuesta = `Escribe el nombre del jefe de hogar`;
                    //mensajeRespuesta = `Escribe tu n??mero de tel??fono en n??meros ????` ;

                    }else{
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;

                    }

                } catch (error) {
                  //console.log('EL ERROR EN PASO 2 REPORTE LLEGADA: : ', error);
                    $formulario.pregunta = 2; //vuelve a entrar a paso 2
                    
                    //actualizarLlegada($formulario); //llama a funcion en app.js
                    llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                }

              break;

              case 3:
                try {

                  //const pattern = new RegExp('^[0-9]+$', 'i');
                  //$formulario.nombre_jefe_hogar = req.body.Body;
                  $formulario.nombre_jefe_hogar = req.body.incomingMessage;
                  const pattern = new RegExp('^[aA-zZ???????????????????????????? ]+$', 'i');

                  if($formulario.nombre_jefe_hogar && pattern.test($formulario.nombre_jefe_hogar)){
                  //if(pattern.test(req.body.Body)){

                    //$formulario.nombre_jefe_hogar = req.body.Body;
                    $formulario.nombre_jefe_hogar = req.body.incomingMessage;
                    //$formulario.telefono = req.body.Body;
                    $formulario.pregunta += 1; //va a 4
                    
                    //actualizarLlegada($formulario); //llama a funcion en app.js
                    llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js


                    mensajeRespuesta = `Escribe tu n??mero de tel??fono en n??meros ????`;
                    
                  }else{
                    //mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
                    //Escribe tu n??mero de tel??fono en n??meros ????` ;
                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe el nombre del jefe de hogar`;

                  }

                } catch (error) {
                  $formulario.pregunta = 3; //vuelve a 3
                  
                  //actualizarLlegada($formulario); //llama a funcion en app.js
                  llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                  //mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
                  //Escribe tu n??mero de tel??fono en n??meros ????` ;
                  mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe el nombre del jefe de hogar`;
                }
              break;

              case 4:
                  try {
                      const pattern = new RegExp('^[0-9]+$', 'i');

                      //if(pattern.test(req.body.Body)){
                      if(pattern.test(req.body.incomingMessage)){
                        //console.log('::CUMPLE CON PATTERN::');
                        //$formulario.telefono = req.body.Body;
                        $formulario.numero_contacto = req.body.incomingMessage;
                            $formulario.pregunta += 1; //va a pregunta 5

                            
                            //actualizarLlegada($formulario); //llama a funcion en app.js
                        ///llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js
                        llegadasController.actualizarLlegadaEncuesta($formulario);
                        
                            mensajeRespuesta = `??Esta l??nea de contacto est?? asociada a WhatsApp? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? S??
2?????? No`;

                          }else{
                            mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Escribe tu n??mero de tel??fono en n??meros ????`;
                          }

                  } catch (error) {
                    $formulario.pregunta = 4;
                    
                    //actualizarLlegada($formulario); //llama a funcion en app.js
                    llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Escribe tu n??mero de tel??fono en n??meros ????`;
                  }
                break;

              case 5:

                try {

                  //switch (req.body.Body) {
                  switch(req.body.incomingMessage){
                    case '1':
                      $formulario.numero_contacto_asociado_whatsapp = '1';
                      $formulario.pregunta += 1; //va a pregunta 6

                      //actualizarLlegada($formulario); //llama a funcion en app.js
                      llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js
                      
                      mensajeRespuesta = `D??nde te encuentras?. Env??a el n??mero de la opci??n correspondiente
1?????? Otro
2?????? Arauca
3?????? Barranquilla
4?????? Bogot??
5?????? Bucaramanga
6?????? Cali
7?????? Cartagena
8?????? C??cuta
9?????? Medell??n
???? Riohacha
1??????1?????? Pasto
1??????2?????? Valledupar`;

                    break;


                    case '2':
                      $formulario.numero_contacto_asociado_whatsapp = '2';
                      $formulario.pregunta += 1; //va a pregunta 6

                      //actualizarLlegada($formulario); //llama a funcion en app.js
                      llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                      mensajeRespuesta = `D??nde te encuentras?. Env??a el n??mero de la opci??n correspondiente
1?????? Otro
2?????? Arauca
3?????? Barranquilla
4?????? Bogot??
5?????? Bucaramanga
6?????? Cali
7?????? Cartagena
8?????? C??cuta
9?????? Medell??n
???? Riohacha
1??????1?????? Pasto
1??????2?????? Valledupar`;
                    break;

                    default:
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Esta l??nea de contacto est?? asociada a WhatsApp? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? S??
2?????? No`;
                      break;
                  }

                } catch (error) {
                    $formulario.pregunta = 5;
                    
                    //actualizarLlegada($formulario); //llama a funcion en app.js
                    llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Esta l??nea de contacto est?? asociada a WhatsApp? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? S??
2?????? No`;
                }

              break;

              case 6:

                try {

                  const opcionesSeleccion= ['1','2','3','4','5','6','7','8','9','10','11','12','13'];

                    if (opcionesSeleccion.includes(req.body.incomingMessage)) {

                      switch (req.body.incomingMessage) {


                        case '1':

                          $formulario.pregunta += 1; //va a pregunta 7
                          $formulario.donde_te_encuentras = 'Otro';
                          
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                          mensajeRespuesta = `En cu??l otro lugar te encuentras?`;
                        break;

                        case '2':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Arauca';
                          $formulario.otro_donde_te_encuentras = null;
                          
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                          
                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '3':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Barranquilla';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                          
                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '4':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Bogot??';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;

                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '5':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Bucaramanga';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                          
                        mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '6':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Cali';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                        
                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '7':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Cartagena';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                          
                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '8':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'C??cuta';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                        
                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '9':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Medell??n';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                          
                          mensajeRespuesta = 'final_form_llegada';  

                        break;

                        case '10':
                          //$formulario.pregunta += 2; //va pregunta 11
                          $formulario.donde_te_encuentras = 'Riohacha';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                          
                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '11':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Pasto';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '12':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Valledupar';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu n??mero de contacto en n??meros ???? `;
                         
                          mensajeRespuesta = 'final_form_llegada';

                        default:
                          break;

                      }

                  } else {

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??D??nde te encuentras?
1?????? Otro
2?????? Arauca
3?????? Barranquilla
4?????? Bogot??
5?????? Bucaramanga
6?????? Cali
7?????? Cartagena
8?????? C??cuta
9?????? Medell??n
???? Riohacha
1??????1?????? Pasto
1??????2?????? Valledupar`;
                
                  }

                } catch (error) {
                  //console.log('ERROR EN 28__ ', error);
                  $formulario.pregunta = 6; //vuelve a 6
                  
                  //actualizarLlegada($formulario); //llama a funcion en app.js
                  llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                  mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??D??nde te encuentras?
1?????? Otro
2?????? Arauca
3?????? Barranquilla
4?????? Bogot??
5?????? Bucaramanga
6?????? Cali
7?????? Cartagena
8?????? C??cuta
9?????? Medell??n
???? Riohacha
1??????1?????? Pasto
1??????2?????? Valledupar`;

                }
              break;
              
              /*
              //PASO 7 ANTERIOR
              case 7:

                try{

                  $formulario.pregunta = 1;
                          $formulario.otro_donde_te_encuentras = req.body.incomingMessage;
                          
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          mensajeRespuesta = 'final_form_llegada';

                }catch{
                  mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
En cu??l otro lugar te encuentras?`;
                }
              break;

              default:
                $formulario.pregunta = 7; //vuelve a
                
                //actualizarLlegada($formulario); //llama a funcion en app.js
                llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
En cu??l otro lugar te encuentras?`;
              break;

              */


              //PASO 7 AJUSTE
              case 7:

                try{

                      $formulario.otro_donde_te_encuentras = req.body.incomingMessage;
                          
                      const pattern = new RegExp('^[aA-zZ???????????????????????????? ]+$', 'i');
        
                      if($formulario.otro_donde_te_encuentras && pattern.test($formulario.otro_donde_te_encuentras)){

                        $formulario.pregunta += 1;// pregunta 8.
                              //actualizarEncuesta($formulario);
                        llegadasController.actualizarLlegada($formulario);
                              
                        conversation.tipo_formulario = null;
                        this.actualizarConversacion(conversation);
                        mensajeRespuesta = 'final_form_llegada';
        
                      }else{
                        mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
En cu??l otro lugar te encuentras?`;
                      }    

                }catch (error){
                  $formulario.pregunta = 7; //vuelve a entrar a paso 7
                  llegadasController.actualizarLlegada($formulario);
                  mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
En cu??l otro lugar te encuentras?`;
                }
              break;


              case 8:
                try{
                  mensajeRespuesta = `Ya reportaste tu llegada a destino gracias!`;
                }catch{

                }

              default:
              break;

            }

          }else if(conversation.tipo_formulario == 3){
            //$formulario es actualizar datos
            //console.log('ENTRA EN CONVERSA A TIPO FORMULARI == 3', $formulario.pregunta);

            switch ($formulario.pregunta) {
              //selecciona actualizar datos
              case 1: //guardo respuesta pregunta 1
                  try {

                    //switch (req.body.Body) {
                    switch (req.body.incomingMessage){
                      case '1':
                        $formulario.tipo_documento = "Acta de Nacimiento";
                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;


                        break;
                      case '2':
                        $formulario.tipo_documento = "C??dula de Identidad (venezolana)";

                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '3':
                        $formulario.tipo_documento = "C??dula de ciudadania (colombiana)";

                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '4':
                        $formulario.tipo_documento = "Pasaporte";

                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '5':
                        $formulario.tipo_documento = "C??dula de Extranjer??a";

                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '6':
                        $formulario.tipo_documento = "Otro";
                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l es tu tipo de documento? ???? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? Acta de Nacimiento
2?????? C??dula de Identidad (venezolana)
3?????? C??dula de Ciudadan??a (colombiana)
4?????? Pasaporte
5?????? C??dula de Extranjer??a
6?????? Otro`;
                        break;
                      }

                  } catch (error) {
                    $formulario.pregunta = 1; //vuelve a entrar a pregunta 1
                    //actualizarDatosContacto($formulario);//llama a funcion en app.js
                    actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l es tu tipo de documento? ???? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? Acta de Nacimiento
2?????? C??dula de Identidad (venezolana)
3?????? C??dula de Ciudadan??a (colombiana)
4?????? Pasaporte
5?????? C??dula de Extranjer??a
6?????? Otro`;
                  }
              break;

              case 2: //guardo respuesta pregunta 2

                try {
                  //$formulario.numero_documento = req.body.Body;//.replace(/[^\??\??\??\??\??\??\??\??\??\??\??\??\??\??\-\w]/gi, '');
                  $formulario.numero_documento = req.body.incomingMessage;

                  const pattern = new RegExp('^[0-9]+$', 'i');

                  if(pattern.test($formulario.numero_documento)){
                    //console.log('CUMPLE CON PATTERN EN REPORTELLEGADA');
                  //if($formulario.numero_documento.length>0){

                    $formulario.pregunta += 1;// pregunta 3.
                    //actualizarDatosContactoEncuesta($formulario); //llama a funcion en app.js
                    actualizarDatosContactoController.actualizarDatosContactoEncuesta($formulario);

                    mensajeRespuesta = `Escribe tu n??mero de tel??fono en n??meros ????` ;

                    }else{
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;

                    }

                } catch (error) {
                  //console.log('EL ERROR EN PASO 2 REPORTE LLEGADA: : ', error);
                    $formulario.pregunta = 2; //vuelve a entrar a paso 2
                    //actualizarDatosContacto($formulario);//llama a funcion en app.js
                    actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                }

              break;

              case 3:
                try {

                  const pattern = new RegExp('^[0-9]+$', 'i');

                  //if(pattern.test(req.body.Body)){
                  if(pattern.test(req.body.incomingMessage)){
                    //$formulario.telefono = req.body.Body;
                    $formulario.telefono = req.body.incomingMessage;
                    $formulario.pregunta += 1; //va a 4
                    //actualizarDatosContacto($formulario);//llama a funcion en app.js
                    actualizarDatosContactoController.actualizarDatosContactoEncuesta($formulario);

                    //actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller


                    mensajeRespuesta = `??Podr??as compartirme un correo electr??nico ???? en el que te podamos contactar? Si no ??? tienes, ??no te preocupes! escribe NO`;
                  }else{
                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe tu n??mero de tel??fono en n??meros ????` ;

                  }

                } catch (error) {
                  $formulario.pregunta = 3; //vuelve a 3
                  
                  //actualizarDatosContacto($formulario);//llama a funcion en app.js
                  actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                  mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe tu n??mero de tel??fono en n??meros ????` ;
                }

              break;

              case 4:
                try {

                  emailregex = /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i;
                  //console.log('TEST EMAIL:: ', emailregex.test(req.body.Body));
                  //if(req.body.Body === 'NO'){
                  newVariableIncomingMessage = req.body.incomingMessage.toLowerCase();

                    //if(req.body.incomingMessage === 'NO'){
                  if(newVariableIncomingMessage === 'no'){
                    $formulario.pregunta = null;
                    $formulario.correo_electronico = null;
                    //actualizarDatosContacto($formulario);//llama a funcion en app.js
                    actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                    conversation.tipo_formulario = null;
                    
                    //actualizarConversacion(conversation); //llama a funcion en app.js
                    //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                    this.actualizarConversacion(conversation);
                   
                  mensajeRespuesta = 'final_form_actualizar_datos';


                  //}else if(emailregex.test(req.body.Body)) {
                  }else if(emailregex.test(req.body.incomingMessage)){
                    //console.log('TEST SI');
                    $formulario.pregunta = null;
                    //$formulario.correo_electronico = req.body.Body;
                    $formulario.correo_electronico = req.body.incomingMessage;
              
                    actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller
                    conversation.tipo_formulario = null;
                    this.actualizarConversacion(conversation);
                    mensajeRespuesta = 'final_form_actualizar_datos';

                  }else{
                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Podr??as compartirme un correo electr??nico ???? en el que te podamos contactar? Si no ??? tienes, ??no te preocupes! escribe NO`;

                  }

                } catch (error) {
                  $formulario.pregunta = 4; //vuelve a 4

                  //actualizarDatosContacto($formulario);//llama a funcion en app.js
                  actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller


                  mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.
??Podr??as compartirme un correo electr??nico ???? en el que te podamos contactar? Si no ??? tienes, ??no te preocupes! escribe NO`;

                }

              default:
                break;
              }

          }else if(conversation.tipo_formulario == 4){
            //FORMULARIO PQR 

            switch ($formulario.pregunta) {
              //selecciona actualizar datos
              case 1: //guardo respuesta pregunta 1
                  try {

                    //switch (req.body.Body) {
                    switch (req.body.incomingMessage){
                      case '1':
                        $formulario.tipo_documento = "Acta de Nacimiento";
                        $formulario.pregunta += 1;// pregunta 2

                        preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;


                        break;
                      case '2':
                        $formulario.tipo_documento = "C??dula de Identidad (venezolana)";

                        $formulario.pregunta += 1;// pregunta 2

                        preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '3':
                        $formulario.tipo_documento = "C??dula de ciudadania (colombiana)";

                        $formulario.pregunta += 1;// pregunta 2
                        
                        preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '4':
                        $formulario.tipo_documento = "Pasaporte";

                        $formulario.pregunta += 1;// pregunta 2
                        
                        preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '5':
                        $formulario.tipo_documento = "C??dula de Extranjer??a";

                        $formulario.pregunta += 1;// pregunta 2
                        
                        preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                        break;

                      case '6':
                        $formulario.tipo_documento = "Otro";
                        $formulario.pregunta += 1;// pregunta 2
                        
                        preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                        mensajeRespuesta = `Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l es tu tipo de documento? ???? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? Acta de Nacimiento
2?????? C??dula de Identidad (venezolana)
3?????? C??dula de Ciudadan??a (colombiana)
4?????? Pasaporte
5?????? C??dula de Extranjer??a
6?????? Otro`;
                        break;
                      }

                  } catch (error) {
                    $formulario.pregunta = 1; //vuelve a entrar a pregunta 1
                    
                    preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
??Cu??l es tu tipo de documento? ???? Responde con el n??mero de acuerdo a la opci??n correspondiente:
1?????? Acta de Nacimiento
2?????? C??dula de Identidad (venezolana)
3?????? C??dula de Ciudadan??a (colombiana)
4?????? Pasaporte
5?????? C??dula de Extranjer??a
6?????? Otro`;
                  }
              break;

              case 2: //guardo respuesta pregunta 2

                try {
                  //$formulario.numero_documento = req.body.Body;//.replace(/[^\??\??\??\??\??\??\??\??\??\??\??\??\??\??\-\w]/gi, '');
                  $formulario.numero_documento = req.body.incomingMessage;

                  const pattern = new RegExp('^[0-9]+$', 'i');

                  if(pattern.test($formulario.numero_documento)){
                    //console.log('CUMPLE CON PATTERN EN REPORTELLEGADA');
                  //if($formulario.numero_documento.length>0){

                    $formulario.pregunta += 1;// pregunta 3.

                    //actualizarDatosContactoController.actualizarDatosContactoEncuesta($formulario);
                    preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                    mensajeRespuesta = `Por favor escribe tu nombre. S??lo puedo leer texto, no utilices audio, im??genes o emojis.` ;

                    }else{
                      mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;

                    }

                } catch (error) {
                  //console.log('EL ERROR EN PASO 2 REPORTE LLEGADA: : ', error);
                    $formulario.pregunta = 2; //vuelve a entrar a paso 2
                    //actualizarDatosContacto($formulario);//llama a funcion en app.js
                    preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
Escribe por favor tu n??mero de documento ???? (no utilices s??mbolos, solo n??meros) Ejemplo: 123456789`;
                }

              break;

              case 3:

                try {
                  //console.log('ENTRO A PREGUNTA 1 de nuevo formulario::', req.body.Body);
                  //console.log('body primer nombre:: ', req.body.Body);
                  //$formulario.primer_nombre = req.body.Body;//.replace(/[^\aA-zZ\??\??\??\??\??\??\??\??\??\??\??\??\??\??]/gi, '');
                  $formulario.nombre = req.body.incomingMessage;
                  //console.log('::AL ENVIAR FOTO::---', req.body.incomingMessage);
                  
                  const pattern = new RegExp('^[aA-zZ????????????????????????????]+$', 'i');

                  if($formulario.nombre && pattern.test($formulario.nombre)){
                    //console.log('::FORMULARIO _ NOMBRE::', $formulario.nombre);
                  //console.log('primer nombre:: ', $formulario.primer_nombre);
                  //if($formulario.primer_nombre.length>0){
                    $formulario.pregunta += 1; //pregunta 4

                    
                    preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller
                    
                    mensajeRespuesta = `Por favor escribe tu apellido. S??lo puedo leer texto, no utilices audio, im??genes o emojis.`

                  }else{
                    //mensajeRespuesta = "*Primer Nombre:* (Ingrese solamente letras, sin emoticones ni caracteres especiales)"
                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Por favor escribe tu nombre. S??lo puedo leer texto, no utilices audio, im??genes o emojis.`;

                  }

                } catch (error) {
                  //console.log(error);
                  $formulario.pregunta = 3;

                  preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                  mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Por favor escribe tu nombre. S??lo puedo leer texto, no utilices audio, im??genes o emojis.`;

                }

              break;

              case 4:
                try {
                  //console.log('ENTRO A PREGUNTA 1 de nuevo formulario::', req.body.Body);
                  //console.log('body primer nombre:: ', req.body.Body);
                  //$formulario.primer_nombre = req.body.Body;//.replace(/[^\aA-zZ\??\??\??\??\??\??\??\??\??\??\??\??\??\??]/gi, '');
                  $formulario.apellido = req.body.incomingMessage;

                  const pattern = new RegExp('^[aA-zZ????????????????????????????]+$', 'i');

                  if($formulario.apellido && pattern.test($formulario.apellido)){
              
                    $formulario.pregunta += 1; //pregunta 5

                    
                    preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller
                    
                    mensajeRespuesta = `Env??a tu pregunta, queja ?? sugerencia. S??lo puedo leer texto, no utilices audio, im??genes o emojis.`

                  }else{
                    //mensajeRespuesta = "*Primer Nombre:* (Ingrese solamente letras, sin emoticones ni caracteres especiales)"
                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Por favor escribe tu apellido. S??lo puedo leer texto, no utilices audio, im??genes o emojis.`;

                  }

                } catch (error) {
                  //console.log(error);
                  $formulario.pregunta = 4;

                  preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                  mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Por favor escribe tu apellido. S??lo puedo leer texto, no utilices audio, im??genes o emojis.`;

                }
              break;

              case 5:
              
                try {
                  
                  $formulario.mensaje = req.body.incomingMessage;

                  
                  //const pattern = new RegExp('^[aA-zZ????????????????????????????]+$', 'i'); //letras y espacios
                  
                  //const pattern = new RegExp('^[aA-zZ????????????????????????????0-9 \-\:\_\,\;\.\??\?\??\!\@\$\%\&\(\)\s]+$', 'i'); //letras y espacios
                  const pattern = new RegExp('^[aA-zZ????????????????????????????0-9 \-\:\_\,\;\.\??\?\??\!\@\$\%\(\)\n]+$', 'i'); //letras y espacios

                  
                  //admite letras, numeros, espacios y simbolos puntos comas pregunta admiracion
                  //'^[aA-zZ????????????????????????????0-9 \-\:\_\,\;\.\??\?\??\!\@\(\)]+$', 'i'
                  //console.log(':::MENSAJE PQS::--:: ', $formulario.mensaje);

                  if($formulario.mensaje && pattern.test($formulario.mensaje)){
              
                    $formulario.pregunta += 1; //pregunta 6

                    
                    preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller
                    
                    conversation.tipo_formulario = null;
                    this.actualizarConversacion(conversation);
                    //mensajeRespuesta = 'final_form_pqs';
                    mensajeRespuesta = 'final_pqs';

                  }else{
                    //mensajeRespuesta = "*Primer Nombre:* (Ingrese solamente letras, sin emoticones ni caracteres especiales)"
                    mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n
                    
Env??a tu pregunta, queja ?? sugerencia. S??lo puedo leer texto, no utilices audio, im??genes o emojis.`;

                  }

                } catch (error) {
                  //console.log(error);
                  $formulario.pregunta = 5;

                  preguntaQuejaSugerenciaController.actualizarPQS($formulario);//llama a funcion en preguntaQuejaSugerenciaController.controller

                  mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta.\n

Env??a tu pregunta, queja ?? sugerencia. S??lo puedo leer texto, no utilices audio, im??genes o emojis.`;

                }

              break;

              /*
              case 6:
                try{
                  mensajeRespuesta = `Ya enviaste PQS!`;
                }catch{

                }
              break*/

              default:
                break;
              } //fin formulario pqr

          }

        }else{
          //SIN TIPO FORMULARIO

          //switch (req.body.Body) {
          switch(req.body.incomingMessage){

              //selecciona llenar nuevo form
              case '1':

                try {
                  //crea nuevo encuesta
                  $conversation.tipo_formulario = 1;
                  //actualizarConversacion($conversation);
                  //conversacionController.actualizarConversacion($conversation);
                  this.actualizarConversacion($conversation);

                  encuestaController.crearEncuesta($conversation, req);
                  mensajeRespuesta = 'Empieza Llenar nuevo formulario';

                } catch (error) {

                }
              break;

              case '2':
                //crea actualizar datos
                  $conversation.tipo_formulario = 2;
                  
                  //conversacionController.actualizarConversacion($conversation)//llama a funcion en conversacion.controller.js
                  this.actualizarConversacion($conversation);

                  //crearActualizarDatos($conversation);
                  mensajeRespuesta = 'Empieza Actualizar Datos';
              break;

              case '3':
                //crea reporte llegada
                  $conversation.tipo_formulario = 3;
                  
                  //conversacionController.actualizarConversacion($conversation)//llama a funcion en conversacion.controller.js
                  this.actualizarConversacion($conversation);

                  //crearReporteLlegada($conversation);
                  mensajeRespuesta = 'Empieza Actualizar Datos';
              break;

              case '4':
                //crea reporte llegada
                  $conversation.tipo_formulario = 4;
                  
                  //conversacionController.actualizarConversacion($conversation)//llama a funcion en conversacion.controller.js
                  this.actualizarConversacion($conversation);

                  //crearReporteLlegada($conversation);
                  mensajeRespuesta = 'Empieza Envio PQR';
              break;

            default:
             
              mensajeRespuesta = 'seleccionar_formulario_actualizado_dos';

            break;
          }
        }
      }else{
        try {

          switch(req.body.incomingMessage){
          //switch(req.body.Body){
            case '1':
              conversation.autorizacion = true;
              //actualizarConversacion(conversation); //llama a funcion en app.js
              //conversacionController.actualizarConversacion(conversation);
              this.actualizarConversacion(conversation);

              //autorizacionTratamientoDatos(conversation); //llama a funcion de app.js
              autorizacionTratamientoDatosController.autorizacionTratamientoDatos(conversation); //llamado a autorizacionTratamientoDatos.controller.js

              mensajeRespuesta = 'seleccionar_formulario_actualizado_dos';
            break;

            case '2':
              //mensajeRespuesta = `??Gracias por contactarnos! ???????? `;
              mensajeRespuesta = 'no_autoriza';
            break;

            default:
            
                mensajeRespuesta = 'autorizacion_error';
            break;
          }


        } catch (error) {
         
            mensajeRespuesta = 'autorizacion_error';
        }
      }
    }else {

      try {
        conversation.conversation_start = true;
      
        this.actualizarConversacion(conversation);
       
        mensajeRespuesta = 'bienvenida_conversacion';
        //local 'bienvenida_conversacion_actualizado';

      } catch (error) {
        //console.log('ERROR::', error);
        if(conversation.conversation_start == true){
          mensajeRespuesta = 'problema_sistema';
        }else{
          mensajeRespuesta = `Disculpe tenemos problemas con el sistema. Intente nuevamente!`;

        }
      }

    }

    //Envia plantillas en mensaje inicial y seleccion de formulario
    //if(conversation.conversation_start == true && !conversation.tipo_formulario && req.body.incomingMessage !== 'Si, ya llegu??' ){
    if(conversation.conversation_start == true && !conversation.tipo_formulario ){
  
      
        whatsappMessageController.sendMessageWhatsapp({
            'to': req.body['message.from'],
            'conversationId': req.body.conversationId,
            'type': 'hsm',
            'content': {
              'hsm': {
                //'namespace': 'asfasdfwe23',
                'namespace': process.env.WHATSAPP_NAMESPACE,
                //'templateName': 'welcome',
                'templateName': mensajeRespuesta,
                'language': {
                  'policy': 'deterministic',
                  'code': 'es',
                },
                //params: [{ default: 'Bob' }, { default: 'tomorrow!' }],
              }
                }
        });


        //para send()
        /*
        whatsappMessageController.sendMessageWhatsapp({
          //'to': req.body['message.from'],
          //'conversationId': req.body.conversationId,
          'to': '573885049604',
          //'from': '2335435432432423458096840935802849023890834508884584423483294',
          'from': process.env.MB_CHANEL_ID,
          //'channelId': process.env.MB_CHANEL_ID,
          'type': 'hsm',
          'content': {
            'hsm': {
              //'namespace': '88fc3eef_c424_4998_bdc3_eddfb12c1283',
              'namespace': process.env.WHATSAPP_NAMESPACE,
              //'templateName': 'welcome',
              'templateName': mensajeRespuesta,
              'language': {
                'policy': 'deterministic',
                'code': 'es',
              },
              //params: [{ default: 'Bob' }, { default: 'tomorrow!' }],
            }
              }
      });*/

    }else{
      
        whatsappMessageController.sendMessageWhatsapp({
          //'to': '573885049604',
          'to': req.body['message.from'],
          'conversationId': req.body.conversationId,
          'namespace': process.env.WHATSAPP_NAMESPACE,
          //'conversationId': '2335435432432423458096840935802849023890834508884584423483294',
          'type': 'text',
          'content': {
                  'text': mensajeRespuesta,
                }
        });
        

        

        //para send()
        /*
        whatsappMessageController.sendMessageWhatsapp({
          //'to': req.body['message.from'],
          //'conversationId': req.body.conversationId,
          'to': '573885049604',
          //'from': '2335435432432423458096840935802849023890834508884584423483294',
          'from': process.env.MB_CHANEL_ID,

          'channelId': process.env.MB_CHANEL_ID,
          'type': 'hsm',
          'content': {
            'hsm': {
              //'namespace': '88fc3eef_c424_4998_bdc3_eddfb12c1283',
              'namespace': process.env.WHATSAPP_NAMESPACE,
              //'templateName': 'welcome',
              'templateName': mensajeRespuesta,
              'language': {
                'policy': 'deterministic',
                'code': 'es',
              },
              //params: [{ default: 'Bob' }, { default: 'tomorrow!' }],
            }
              },
              'reportUrl': process.env.reportUrl_CHATBOT
        });
        */
        
      }

  }


   //funcion seleccion de formulario a responder
exports.seleccionarFormulario = async function (conversation, req){

    mensajeRespuesta = ``;
    //console.log('req.body.Body en seleccionar form:', req.body.Body);

    try {
        //switch (req.body.message.content.text) {
        //switch (req.body.Body){
        
        if(req.body.incomingMessage === "1"){
          option = "2";
        }else if(req.body.incomingMessage === "2"){
          option = "3";
        }else if(req.body.incomingMessage === "3"){
          option = "4";
        }else {
          option = "0";
        }
        //switch(req.body.incomingMessage){
          switch(option){

            //selecciona llenar nuevo form
            case '1':

                //consultaExisteEncuesta(conversation); //llama a funcion en app.js
                encuestaController.consultaExisteEncuesta(conversation, req);

            break;

            case '2':
              //crea actualizar datos
              llegadasController.consultaExisteLlegadaADestino(conversation,req); //envio converation y req a la funcion en llegadasController

            break;

            case '3':
              //crea reporte llegada
              //consultaExisteDatosActualizados(conversation);//llama a funcion en app.js
              actualizarDatosContactoController.consultaExisteDatosActualizados(conversation,req); //llama a funcion en actualizarDatosContacto.controller
              //crearDatosActualizados(conversation);

            break;

            case '4':
              //crea pqr
              //preguntaQuejaSugerenciaController.consultaExistePQRS(conversation,req);
              preguntaQuejaSugerenciaController.crearPQS(conversation,req); 
              
            break;

          default:

            /*
            //ANTERIOR MENSAJE POR DEFECTO CUANDO FINALIZA FORMULARIO Y ESCRIBE MENSAJE
            mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta. 
  
Por favor resp??ndeme con el n??mero correspondiente a lo que quieres hacer:\n
1?????? Quieres informar de tu llegada a destino ???????\n
2?????? Ya te registraste antes y quieres actualizar tus datos de contacto  ???????? \n
3?????? Quieres hacer una pregunta, queja ?? sugerencia ????`;

        whatsappMessageController.sendMessageWhatsapp({
            'to': req.body['message.from'],
              'conversationId': req.body.conversationId,
            'type': 'text',
            'content': {
                    'text': mensajeRespuesta,
                  }
          });*/

          //NUEVO: envia plantilla de seleccionar_formulario_actualizado_dos
          whatsappMessageController.sendMessageWhatsapp({
            'to': req.body['message.from'],
            'conversationId': req.body.conversationId,
            'type': 'hsm',
            'content': {
              'hsm': {
                //'namespace': 'asfasdfwe23',
                'namespace': process.env.WHATSAPP_NAMESPACE,
                //'templateName': 'welcome',
                'templateName': 'seleccionar_formulario_actualizado_dos',
                'language': {
                  'policy': 'deterministic',
                  'code': 'es',
                },
                //params: [{ default: 'Bob' }, { default: 'tomorrow!' }],
              }
                }
            });

        }
    } catch (error) {
      //console.log(error);
    
            /*
            //ANTERIOR MENSAJE POR DEFECTO CUANDO FINALIZA FORMULARIO Y ESCRIBE MENSAJE
            mensajeRespuesta = `Gracias ????, ten presente que no puedo reconocer im??genes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el n??mero de las opciones que te indico en mi pregunta. 
  
Por favor resp??ndeme con el n??mero correspondiente a lo que quieres hacer:\n
1?????? Quieres informar de tu llegada a destino ???????\n
2?????? Ya te registraste antes y quieres actualizar tus datos de contacto  ???????? \n
3?????? Quieres hacer una pregunta, queja ?? sugerencia ????`;

        whatsappMessageController.sendMessageWhatsapp({
            'to': req.body['message.from'],
              'conversationId': req.body.conversationId,
            'type': 'text',
            'content': {
                    'text': mensajeRespuesta,
                  }
          });*/

          //NUEVO: envia plantilla de seleccionar_formulario_actualizado_dos
          whatsappMessageController.sendMessageWhatsapp({
            'to': req.body['message.from'],
            'conversationId': req.body.conversationId,
            'type': 'hsm',
            'content': {
              'hsm': {
                //'namespace': 'asfasdfwe23',
                'namespace': process.env.WHATSAPP_NAMESPACE,
                //'templateName': 'welcome',
                'templateName': 'seleccionar_formulario_actualizado_dos',
                'language': {
                  'policy': 'deterministic',
                  'code': 'es',
                },
                //params: [{ default: 'Bob' }, { default: 'tomorrow!' }],
              }
                }
            });

    }

}

//nuevaconversacion llamada por consultaConversacion
exports.nuevaConversacion = async function (req) {

  try {
    
      //const sqlnuevo = 'INSERT INTO encuesta SET ?';
      const sqlnuevo = 'INSERT INTO conversacion_chatbot SET ?';

      //console.log('PARAMS NUEVA CONVERSA: ', req.body);
      const params = req.body;
      //var newprofile = params.conversationContactId.replace(/[^\??\??\??\??\??\??\??\??\??\??\??\??\??\??\w\s]/gi, ''); //version messagebird
      var newprofile = params['contact.displayName'].replace(/[^\??\??\??\??\??\??\??\??\??\??\??\??\??\??\w\s]/gi, ''); //version messagebird
    
       nuevaconversacion = {
        //waId: params.WaId,
        //waId: params.contact.msisdn, //messagebird
        waId: params.contactPhoneNumber,
        profileName: newprofile,
        conversation_start: false,
        autorizacion: false,
        tipo_formulario: null,
        created_at: new Date()

      }
      
    
      db.query(sqlnuevo, nuevaconversacion, (error, results) => {
      //if (error) {errorLog('dbquery.error',error);throw error;}
        if(error){
          mensajeRespuesta = "Su Nombre de perfil de Whatsapp contiene emoticones, por favor quitelos momentaneamente para interactuar con nuestro chat e intente nuevamente";

          whatsappMessageController.sendMessageWhatsapp({
            'to': req.body['message.from'],
              'conversationId': req.body.conversationId,
            'type': 'text',
            'content': {
                    'text': mensajeRespuesta,
                  }
          });
        
        }else{
          //console.log('RESULTS QUERY NUEVO: ', results);
          //consultaConversacion(nuevaconversacion.waId);
          this.consultaConversacion(nuevaconversacion.waId, req);

        }

      });
  } catch (error) {
    errorLog(':::Error en crearConversacion::', error);
  }
}

//Consulta conversacion para seguir respondiendo o crear una nueva

exports.consultaConversacion = async function (whatsappID, req) {
  
  

  const sql = `SELECT conversacion_chatbot.*
  FROM conversacion_chatbot 
   WHERE waId = '${whatsappID}'`;
  //connection.query(sql, (error, results) => {
    db.query(sql, (error, results) => {
    if (error) {errorLog('dbquery.error',error);throw error;}
    if (results.length > 0) {
      var $conversation = results[0];
      //console.log('messageBirdRequestId:::::',req.body.messageBirdRequestId);
      //console.log('MESG:::::',req.body.incomingMessage);
      const sqlRequest = `SELECT request_id
        FROM conversacion_request
        WHERE id_conversacion = '${$conversation.id}' AND request_id = '${req.body.messageBirdRequestId}'`;
        //connection.query(sqlRequest, (errorResult, resultRequest) => {
        db.query(sqlRequest, (errorResult, resultRequest) => {
            if (errorResult) {errorLog('dbquery.error',errorResult);throw errorResult;}
          if(resultRequest.length == 0) {
            
            const sqlRequestInsert = 'INSERT INTO conversacion_request SET ?';

            const nuevoRequest = {
              id_conversacion: $conversation.id,
              request_id: req.body.messageBirdRequestId
            }
            //console.log('NUEVA CONVERSACION: ', nuevaconversacion);

            //connection.query(sqlRequestInsert, nuevoRequest, (error, results) => {
            db.query(sqlRequestInsert, nuevoRequest, (error, results) => {
                if (error) {errorLog('dbquery.error',error);throw error;}
            });

            if(!$conversation.conversation_start){

              this.conversacion($conversation, null, req); //llama a funcion en conversacionController

            }else if(!$conversation.autorizacion){

              //conversacion($conversation); llama a funcion en app.js
              this.conversacion($conversation, null, req); //llama a funcion en conversacionController

            }else if(!$conversation.tipo_formulario){

              if(req.body.incomingMessage == 'Si, ya llegu??'){

                //ac
                $conversation.tipo_formulario = 2;
                this.actualizarConversacion($conversation);
                llegadasController.consultaExisteLlegadaADestino($conversation,req);
                respuesta = {
                  waId: req.body.contactPhoneNumber,
                  respuesta: 'Si, ya llegu??',
                  reenviar: 0,
                  updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                }
                notificacionReporteLlegadaController.actualizarNotificacionLlegada(respuesta );

              }else if(req.body.incomingMessage == 'No, en camino'){

                respuesta = {
                  waId: req.body.contactPhoneNumber,
                  respuesta: 'No, en camino',
                  reenviar: 1,
                  updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                }
                notificacionReporteLlegadaController.actualizarNotificacionLlegada(respuesta );

                mensajeRespuesta = 'notificacion_llegada_no';

                whatsappMessageController.sendMessageWhatsapp({
                  'to': req.body['message.from'],
                    'conversationId': req.body.conversationId,
                    'type': 'hsm',
                    'content': {
                      'hsm': {
                        //'namespace': '88fc3eef_c424_4998_bdc3_eddfb12c1283',
                        'namespace': process.env.WHATSAPP_NAMESPACE,
                        //'templateName': 'welcome',
                        'templateName': mensajeRespuesta,
                        'language': {
                          'policy': 'deterministic',
                          'code': 'es',
                        },
                        //params: [{ default: 'Bob' }, { default: 'tomorrow!' }],
                      }
                    }
                });
              }else{
                //seleccionarFormulario($conversation); //llamado en app.js
                this.seleccionarFormulario($conversation, req);
              }
              

            }else if($conversation.tipo_formulario == 1){
              const sqlencuesta = `SELECT * FROM encuesta where waId = '${whatsappID}'`;

              //connection.query(sqlencuesta, (error, encuesta) => {
              db.query(sqlencuesta, (error, encuesta) => {
                if (error) {errorLog('dbquery.error',error);throw error;}

                if (encuesta.length > 0) {

                  //console.log('ENCUESTA ES: ', encuesta[0]);
                  //conversacion($conversation,encuesta[0]); //llama a la funcion en app.js
                  this.conversacion($conversation, encuesta[0], req); //llama a funcion en conversacionController

                }

              });
            }else if($conversation.tipo_formulario == 2){
              const sqllegadas = `SELECT * FROM llegadas where waId = '${whatsappID}'`;

              //connection.query(sqllegadas, (error, llegadas) => {
              db.query(sqllegadas, (error, llegadas) => {
                if (error) {errorLog('dbquery.error',error);throw error;}

                if (llegadas.length > 0) {
                  //console.log('LLEGADA ES: ', llegadas[0]);
                  //conversacion($conversation , llegadas[0]);
                  this.conversacion($conversation, llegadas[0], req); //llama a funcion en conversacionController

                }

              });
            }else if($conversation.tipo_formulario == 3){
              //console.log('::ENTRO A TIPO FORMULARIO 3');

              if(req.body.incomingMessage == 'Si, ya llegu??'){

                //ac
                $conversation.tipo_formulario = 2;
                this.actualizarConversacion($conversation);
                llegadasController.consultaExisteLlegadaADestino($conversation,req);
                respuesta = {
                  waId: req.body.contactPhoneNumber,
                  respuesta: 'Si, ya llegu??',
                  reenviar: 0,
                  updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                }
                notificacionReporteLlegadaController.actualizarNotificacionLlegada(respuesta );

              }else if(req.body.incomingMessage == 'No, en camino'){

                respuesta = {
                  waId: req.body.contactPhoneNumber,
                  respuesta: 'No, en camino',
                  reenviar: 1,
                  updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                }
                notificacionReporteLlegadaController.actualizarNotificacionLlegada(respuesta );

                mensajeRespuesta = 'notificacion_llegada_no';

                whatsappMessageController.sendMessageWhatsapp({
                  'to': req.body['message.from'],
                    'conversationId': req.body.conversationId,
                    'type': 'hsm',
                    'content': {
                      'hsm': {
                        //'namespace': '88fc3eef_c424_4998_bdc3_eddfb12c1283',
                        'namespace': process.env.WHATSAPP_NAMESPACE,
                        //'templateName': 'welcome',
                        'templateName': mensajeRespuesta,
                        'language': {
                          'policy': 'deterministic',
                          'code': 'es',
                        },
                        //params: [{ default: 'Bob' }, { default: 'tomorrow!' }],
                      }
                        }
                });
              }else{
                const sqlactualizardatos = `SELECT * FROM datos_actualizados where waId = '${whatsappID}'`;

                //connection.query(sqlactualizardatos, (error, actualizardatos) => {
                db.query(sqlactualizardatos, (error, actualizardatos) => {
                  if (error) {errorLog('dbquery.error',error);throw error;}

                  if (actualizardatos.length > 0) {
                    //console.log('ENCUESTA ES: ', actualizardatos[0]);
                    //conversacion($conversation , actualizardatos[0]); //llama a la funcion en app.js
                    this.conversacion($conversation, actualizardatos[0], req); //llama a funcion en conversacionController

                  }

                });
              }

              
            }else if($conversation.tipo_formulario == 4){
            //console.log('::ENTRO A TIPO FORMULARIO 3');

              if(req.body.incomingMessage == 'Si, ya llegu??'){

                //ac
                $conversation.tipo_formulario = 2;
                this.actualizarConversacion($conversation);
                llegadasController.consultaExisteLlegadaADestino($conversation,req);
                respuesta = {
                  waId: req.body.contactPhoneNumber,
                  respuesta: 'Si, ya llegu??',
                  reenviar: 0,
                  updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                }
                notificacionReporteLlegadaController.actualizarNotificacionLlegada(respuesta );

              }else if(req.body.incomingMessage == 'No, en camino'){

                respuesta = {
                  waId: req.body.contactPhoneNumber,
                  respuesta: 'No, en camino',
                  reenviar: 1,
                  updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                }
                notificacionReporteLlegadaController.actualizarNotificacionLlegada(respuesta );

                mensajeRespuesta = 'notificacion_llegada_no';

                whatsappMessageController.sendMessageWhatsapp({
                  'to': req.body['message.from'],
                    'conversationId': req.body.conversationId,
                    'type': 'hsm',
                    'content': {
                      'hsm': {
                        //'namespace': '88fc3eef_c424_4998_bdc3_eddfb12c1283',
                        'namespace': process.env.WHATSAPP_NAMESPACE,
                        //'templateName': 'welcome',
                        'templateName': mensajeRespuesta,
                        'language': {
                          'policy': 'deterministic',
                          'code': 'es',
                        },
                        //params: [{ default: 'Bob' }, { default: 'tomorrow!' }],
                      }
                        }
                });
              }else{

                //console.log('::SELECCIONO OPCION 4--Consulto PRQ para enviarlo a la conversacion ');
                
                //para seguir el flujo de enviar PQR, consulta la PQR por waId y que el campo 'pregunta'
                //sea menor a 6(ultima pregunta); ordena las PQR descendentemente por updated_at y 
                //toma el primer registro. Es decir sigue respondiendo la PQR actualizada mas recientemente.
                const sqlpqrs = `SELECT * FROM pqs where waId = '${whatsappID}'
                AND pregunta < 6 ORDER BY updated_at DESC
                LIMIT 1`;

                //connection.query(sqlactualizardatos, (error, actualizardatos) => {
                db.query(sqlpqrs, (error, pqrs) => {
                  if (error) {errorLog('dbquery.error',error);throw error;}

                  if (pqrs.length > 0) {

                    //console.log('::PQR QUE SIGUE RESPONDIENDO::', pqrs[0]);
                    //console.log('ENCUESTA ES: ', actualizardatos[0]);
                    //conversacion($conversation , actualizardatos[0]); //llama a la funcion en app.js
                    this.conversacion($conversation, pqrs[0], req); //llama a funcion en conversacion

                  }

                });
              }
            }
          }
        });

    } else {

      //nuevaConversacion(); //llamado a funcion en app.js
      this.nuevaConversacion(req); //llamado a funcion en app.js

      //conversacionController.nuevaConversacion(req.body); //llamado a conversacion.controller.js
    }
  });
}