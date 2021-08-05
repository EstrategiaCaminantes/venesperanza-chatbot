var ConversacionService = require('../services/conversacion.services')  
var whatsappMessageController = require('./whatsappMessage.controller');
var autorizacionTratamientoDatosController = require('./autorizacionTratamientoDatos.controller');
var encuestaController = require('./encuesta.controller');
var llegadasController = require('./llegadas.controller');
var actualizarDatosContactoController = require('./actualizarDatosContacto.controller');
var notificacionReporteLlegadaController = require('./notificacionReporteLlegada.controller');

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
                    //$formulario.primer_nombre = req.body.Body;//.replace(/[^\aA-zZ\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú]/gi, '');
                    $formulario.primer_nombre = req.body.incomingMessage;

                    const pattern = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ]+$', 'i');

                    if(pattern.test($formulario.primer_nombre)){
                    //console.log('primer nombre:: ', $formulario.primer_nombre);
                    //if($formulario.primer_nombre.length>0){
                      $formulario.pregunta += 1; //pregunta 12

                      //crearEncuesta(conversation);
                      //console.log('LLAMARE A ACTUALZIAR ENCUESTA:: \n', $formulario );
                      //actualizarEncuesta($formulario); //llama a funcion en archivo app.js
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuesta.controller.js
                      /*mensajeRespuesta = "*Segundo Nombre:* " +
                        "(En caso de que no tenga envía un '.' (punto))";*/
                      mensajeRespuesta = `Por favor escribe tu segundo nombre, si no tienes segundo nombre escribe NO.`

                    }else{
                      //mensajeRespuesta = "*Primer Nombre:* (Ingrese solamente letras, sin emoticones ni caracteres especiales)"
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

Por favor escribe tu primer nombre. Sólo puedo leer texto, no utilices audio, imágenes o emojis.`;

                    }

                  } catch (error) {
                    //console.log(error);
                    $formulario.pregunta = 1;
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

Por favor escribe tu primer nombre. Sólo puedo leer texto, no utilices audio, imágenes o emojis.`;

                  }
                break;

                case 2: //guardo respuesta pregunta 2

                  try {
                    //$formulario.segundo_nombre = req.body.Body;//.replace(/[^\aA-zZ\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú]/gi, '');
                    $formulario.segundo_nombre = req.body.incomingMessage;
                    //console.log('primer nombre:: ', conversation.primer_nombre);
                    //if($formulario.segundo_nombre.length>0){
                    const pattern = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ]+$', 'i');

                    if(pattern.test($formulario.segundo_nombre)){
                      $formulario.pregunta += 1; //pregunta 2

                      //crearEncuesta(conversation);
                      //actualizarEncuesta($formulario); //llama a funcion en app.js
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController
                      /*mensajeRespuesta = "*Segundo Nombre:* " +
                        "(En caso de que no tenga envía un '.' (punto))";*/
                      mensajeRespuesta = `Por favor escribe tu primer apellido`;

                    }else{
                      //mensajeRespuesta = "*Primer Nombre:* (Ingrese solamente letras, sin emoticones ni caracteres especiales)"
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

Por favor escribe tu segundo nombre, si no tienes segundo nombre escribe NO.`;

                    }

                  } catch (error) {
                    //console.log('ERROR EN 2:', error);
                    $formulario.pregunta = 2;
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

Por favor escribe tu segundo nombre, si no tienes segundo nombre escribe NO.`;


                  }
                break;

                case 3:
                  try {
                      //$formulario.primer_apellido = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');
                    $formulario.primer_apellido = req.body.incomingMessage;
                      //if($formulario.primer_apellido.length>0){
                      const pattern = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ ]+$', 'i');
                      //console.log('PATTERN::: ', pattern);

                      if(pattern.test($formulario.primer_apellido)){
                        $formulario.pregunta += 1; //pregunta 14

                        //actualizarEncuesta($formulario); //llama a funcion en app.js
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `Por favor escribe tu segundo apellido, si no tienes segundo apellido escribe NO`;

                      }else{
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

Por favor escribe tu primer apellido`;
                      }



                  } catch (error) {
                    $formulario.pregunta = 3;
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

Por favor escribe tu primer apellido`;
                  }
                break;

                case 4:
                  try {
                      //$formulario.segundo_apellido = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');
                      $formulario.segundo_apellido = req.body.incomingMessage;
                      //if($formulario.segundo_apellido.length>0){

                        const patternsegundoapellido = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ ]+$', 'i');
                        if(patternsegundoapellido.test($formulario.segundo_apellido)){
                        $formulario.pregunta += 1; //pregunta 14

                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `¿Cuál es tu tipo de documento? 📇 Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Acta de Nacimiento
2️⃣ Cédula de Identidad (venezolana)
3️⃣ Cédula de Ciudadanía (colombiana)
4️⃣ Pasaporte
5️⃣ Cédula de Extranjería
6️⃣ Indocumentado
7️⃣ Otro`;
                      }else{
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Por favor escribe tu segundo apellido, si no tienes segundo apellido escribe NO`;

                      }

                  } catch (error) {
                    $formulario.pregunta = 4;
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
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

                          mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;


                          break;
                        case '2':
                          $formulario.tipo_documento = "Cédula de Identidad (venezonala)";

                          $formulario.pregunta += 2;// pregunta 7
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                          break;

                        case '3':
                          $formulario.tipo_documento = "Cédula de ciudadania (colombiana)";

                          $formulario.pregunta += 2;// pregunta 21
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                          break;

                        case '4':
                          $formulario.tipo_documento = "Pasaporte";

                          $formulario.pregunta += 2;// pregunta 7
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                          break;

                        case '5':
                          $formulario.tipo_documento = "Cédula de Extranjería";

                          $formulario.pregunta += 2;// pregunta 21
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                          break;

                        case '6':
                          $formulario.tipo_documento = "Indocumentado";

                          $formulario.pregunta += 3;// pregunta 8. Indocumentado no se muestra numero documento
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `¿Cómo encontraste mi número de WhatsApp? Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Ví un pendón en un albergue
2️⃣ Recibí un volante en el albergue
3️⃣ Recibí una foto con la información
4️⃣ Lo recibí por chat
5️⃣ Lo encontré en Facebook
6️⃣ Una persona conocida me lo envió para que lo llenara
7️⃣ Recibí una manilla con el número
8️⃣ Otro`;
                        break;

                        case '7':
                          $formulario.tipo_documento = "Otro";
                          $formulario.pregunta += 1; // pregunta 6
                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                          mensajeRespuesta = `¿Cuál? (Indicar tipo, ejemplo: pasaporte)`;
                        break;

                        default:
                          mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿Cuál es tu tipo de documento? 📇 Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Acta de Nacimiento
2️⃣ Cédula de Identidad (venezolana)
3️⃣ Cédula de Ciudadanía (colombiana)
4️⃣ Pasaporte
5️⃣ Cédula de Extranjería
6️⃣ Indocumentado
7️⃣ Otro`;
                          break;


                    }

                  } catch (error) {
                    $formulario.pregunta = 5; //vuelve a entrar a pregunta 5
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿Cuál es tu tipo de documento? 📇 Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Acta de Nacimiento
2️⃣ Cédula de Identidad (venezolana)
3️⃣ Cédula de Ciudadanía (colombiana)
4️⃣ Pasaporte
5️⃣ Cédula de Extranjería
6️⃣ Indocumentado
7️⃣ Otro`;
                  }
                break;

                case 6:
                  try {
                    //$formulario.cual_otro_tipo_documento = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');
                    $formulario.cual_otro_tipo_documento = req.body.incomingMessage;
                    //if($formulario.cual_otro_tipo_documento.length>0){

                    const pattern = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ ]+$', 'i');

                    if(pattern.test($formulario.cual_otro_tipo_documento)){

                      $formulario.pregunta += 1;// pregunta 7.
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;


                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿Cuál otro tipo de documento? (Indicar tipo, ejemplo: pasaporte)`;
                    }

                  } catch (error) {
                    $formulario.pregunta = 6; //vuelve a entrar a paso 6
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿Cuál otro tipo de documento? (Indicar tipo, ejemplo: pasaporte)`;

                  }

                break;

                case 7:
                  try {
                    //$formulario.numero_documento = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\-\w]/gi, '');
                    $formulario.numero_documento = req.body.incomingMessage;

                    const pattern = new RegExp('^[0-9]+$', 'i');

                    if(pattern.test($formulario.numero_documento)){
                    //if($formulario.numero_documento.length>0){

                    $formulario.pregunta += 1;// pregunta 8.
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `¿Cómo encontraste mi número de WhatsApp? Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Ví un pendón en un albergue
2️⃣ Recibí un volante en el albergue
3️⃣ Recibí una foto con la información
4️⃣ Lo recibí por chat
5️⃣ Lo encontré en Facebook
6️⃣ Una persona conocida me lo envió para que lo llenara
7️⃣ Recibí una manilla con el número
8️⃣ Otro`;
                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;

                    }

                  } catch (error) {
                    $formulario.pregunta = 7; //vuelve a entrar a paso 7
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                }
                break;

                case 8:
                  try {
                    //switch (req.body.Body) {
                    switch (req.body.incomingMessage){
                    case '1':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Ví un pendón en un albergue";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `¿En qué fecha tú y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '2':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recibí un volante en el albergue";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `¿En qué fecha tú y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '3':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recibí una foto con la información";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `¿En qué fecha tú y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '4':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recibí el enlache por chat";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `¿En qué fecha tú y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '5':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Encontré el enlace en Facebook";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `¿En qué fecha tú y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '6':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Una persona conocida me lo envió para que lo llenara";
                      //$formulario.donde_encontro_formulario = null;
                      //actualizarEncuesta($formulario);

                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `¿En qué fecha tú y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;
                    
                    case '7':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recibí una manilla con el número";
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `¿En qué fecha tú y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;
                      break;

                    case '8':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Otro";
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      mensajeRespuesta = `¿En qué fecha tú y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;
                      break;

                    default:
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

¿Cómo encontraste mi número de WhatsApp? Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Ví un pendón en un albergue
2️⃣ Recibí un volante en el albergue
3️⃣ Recibí una foto con la información
4️⃣ Lo recibí por chat
5️⃣ Lo encontré en Facebook
6️⃣ Una persona conocida me lo envió para que lo llenara
7️⃣ Recibí una manilla con el número
8️⃣ Otro`;
                      break;
                    }


                  } catch (error) {
                    $formulario.pregunta = 8; //vuelve a entrar a paso 8
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

¿Cómo encontraste mi número de WhatsApp? Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Ví un pendón en un albergue
2️⃣ Recibí un volante en el albergue
3️⃣ Recibí una foto con la información
4️⃣ Lo recibí por chat
5️⃣ Lo encontré en Facebook
6️⃣ Una persona conocida me lo envió para que lo llenara
7️⃣ Recibí una manilla con el número
8️⃣ Otro`;
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

                        $validarAño = parseInt($fechavalidar[0]);
                        $validarMes = parseInt($fechavalidar[1]);
                        $validarDia = parseInt($fechavalidar[2]);


                        $fechaActual = new Date();
                        $añoActual = $fechaActual.getFullYear();
                        $añoActualInteger = parseInt($añoActual);



                        if (($validarDia > 0 && $validarDia <= 31) && ($validarMes > 0 && $validarMes <= 12) && ($validarAño >= 2010 && $validarAño <= $añoActualInteger)) {
                          //console.log('FECHA VALIDA!!');
                          //console.log('TAMAÑO SI ES TRES: ', $fechavalidar.length);
                          $formulario.pregunta += 1; //va a pregunta 10
                          $formulario.fecha_llegada_pais = req.body.incomingMessage;//.replace(/[^\-\w]/gi, '');

                          //actualizarEncuesta($formulario);
                          encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController


                          mensajeRespuesta = `¿Cuál es tu destino final dentro de Colombia? Envía el número de la opción correspondiente:
1️⃣ No estoy seguro/a
2️⃣ Otro
3️⃣ Arauca
4️⃣ Barranquilla
5️⃣ Bogotá
6️⃣ Bucaramanga
7️⃣ Cali
8️⃣ Cartagena
9️⃣ Cúcuta
🔟 Medellín
1️⃣1️⃣ Riohacha
1️⃣2️⃣ Pasto
1️⃣3️⃣ Valledupar`;

                        } else {
                          mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿En qué fecha tú y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                        }
                      
                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿En qué fecha tú y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                    }

                } catch (error) {
                  $formulario.pregunta = 9; //vuelve a 9
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿En qué fecha tÚ y tu grupo familiar llegaron al país🇨🇴?. Envía la fecha de esta manera AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

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
                          $formulario.nombre_municipio_destino_final = 'Bogotá';
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
                          $formulario.nombre_municipio_destino_final = 'Cúcuta';
                        break;

                        case '10':
                          $formulario.pregunta += 1; //va a pregunta 11
                          $formulario.nombre_municipio_destino_final = 'Medellín';
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

                      mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;


                    } else {

                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Cuál es tu destino final dentro de Colombia? Envía el número de la opción correspondiente:
1️⃣ No estoy seguro/a
2️⃣ Otro
3️⃣ Arauca
4️⃣ Barranquilla
5️⃣ Bogotá
6️⃣ Bucaramanga
7️⃣ Cali
8️⃣ Cartagena
9️⃣ Cúcuta
🔟 Medellín
1️⃣1️⃣ Riohacha
1️⃣2️⃣ Pasto
1️⃣3️⃣ Valledupar`;

                    }

                  } catch (error) {
                    //console.log('ERROR EN 28__ ', error);
                    $formulario.pregunta = 10; //vuelve a 11
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController


                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Cuál es tu destino final dentro de Colombia? Envía el número de la opción correspondiente:
1️⃣ No estoy seguro/a
2️⃣ Otro
3️⃣ Arauca
4️⃣ Barranquilla
5️⃣ Bogotá
6️⃣ Bucaramanga
7️⃣ Cali
8️⃣ Cartagena
9️⃣ Cúcuta
🔟 Medellín
1️⃣1️⃣ Riohacha
1️⃣2️⃣ Pasto
1️⃣3️⃣ Valledupar`;

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

                      mensajeRespuesta = `¿Este número de contacto fue entregado por el programa VenEsperanza? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;
                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe tu número de contacto en números 📞` ;

                    }

                  } catch (error) {
                    $formulario.pregunta = 11; //vuelve a 11
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe tu número de contacto en números 📞` ;
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

                        mensajeRespuesta = `¿Este número de contacto es tuyo? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;

                      break;

                      case '2':
                        $formulario.numero_entregado_venesperanza = false;
                        $formulario.pregunta += 1; //Va a pregunta 13

                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `¿Este número de contacto es tuyo? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;

                      break;

                      default:
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Este número de contacto fue entregado por el programa VenEsperanza? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;

                      break;
                    }

                  } catch (error) {
                    $formulario.pregunta = 12; //vuelve a 12
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Este número de contacto fue entregado por el programa VenEsperanza? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;

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

                        mensajeRespuesta = `¿Este número de contacto tiene WhatsApp? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;
                      break;

                      case '2':
                        $formulario.linea_contacto_propia = false;
                        $formulario.pregunta += 1; //Va a pregunta 14
                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `¿Este número de contacto tiene WhatsApp? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Este número de contacto es tuyo? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`

                      break;
                    }

                  } catch (error) {
                    $formulario.pregunta = 13; //vuelve a 13
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Este número de contacto es tuyo? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`

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

                        mensajeRespuesta = `¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar? Si no ❌ tienes, ¡no te preocupes! escribe NO`;
                      break;

                      case '2':
                        $formulario.linea_asociada_whatsapp = false;
                        $formulario.pregunta += 1; //Va a pregunta 15
                        //actualizarEncuesta($formulario);
                        encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                        mensajeRespuesta = `¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar? Si no ❌ tienes, ¡no te preocupes! escribe NO`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Este número de contacto tiene WhatsApp? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;


                      break;
                    }

                  } catch (error) {
                    $formulario.pregunta = 14; //vuelve a 14
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Este número de contacto tiene WhatsApp? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;

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
                      $formulario.pregunta += 1;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      conversation.tipo_formulario = null;
                      //conversacionController.actualizarConversacion(conversation); //llama a funcion en conversacionController
                      this.actualizarConversacion(conversation);
                      mensajeRespuesta = 'final_form_registro';

                    //}else if(emailregex.test(req.body.Body)) {
                    }else if(emailregex.test(req.body.incomingMessage)){
                      //console.log('TEST SI');
                      $formulario.pregunta += 1;
                      //$formulario.correo_electronico = req.body.Body;
                      $formulario.correo_electronico = req.body.incomingMessage;
                      //actualizarEncuesta($formulario);
                      encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                      conversation.tipo_formulario = null;
                      //console.log('CONVERSACION ACTUALIZAR:: ', conversation);

                      //actualizarConversacion(conversation); //llamado a funcion en app.js
                      //conversacionController.actualizarConversacion(conversation);
                      this.actualizarConversacion(conversation);

                      mensajeRespuesta = 'final_form_registro'

                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar? Si no ❌ tienes, ¡no te preocupes! escribe NO`;

                    }

                  } catch (error) {
                    $formulario.pregunta = 15; //vuelve a 15
                    //actualizarEncuesta($formulario);
                    encuestaController.actualizarEncuesta($formulario); //llama a funcion en encuestaController

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar? Si no ❌ tienes, ¡no te preocupes! escribe NO`;

                  }

                break;

                case 16:
                  mensajeRespuesta = `Ya has respondido el formulario. Gracias`
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

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;


                        break;
                      case '2':
                        $formulario.tipo_documento = "Cédula de Identidad (venezonala)";

                        $formulario.pregunta += 1;// pregunta 2

                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '3':
                        $formulario.tipo_documento = "Cédula de ciudadania (colombiana)";

                        $formulario.pregunta += 1;// pregunta 2
                        
                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '4':
                        $formulario.tipo_documento = "Pasaporte";

                        $formulario.pregunta += 1;// pregunta 2
                        
                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '5':
                        $formulario.tipo_documento = "Cédula de Extranjería";

                        $formulario.pregunta += 1;// pregunta 2
                        
                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '6':
                        $formulario.tipo_documento = "Otro";
                        $formulario.pregunta += 1;// pregunta 2
                        
                        //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿Cuál es tu tipo de documento? 📇 Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Acta de Nacimiento
2️⃣ Cédula de Identidad (venezolana)
3️⃣ Cédula de Ciudadanía (colombiana)
4️⃣ Pasaporte
5️⃣ Cédula de Extranjería
6️⃣ Otro`;
                        break;


                      }

                  } catch (error) {
                    $formulario.pregunta = 1; //vuelve a entrar a pregunta 1
                    
                    //actualizarLlegada($formulario); //llama a funcion en app.js
                    llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿Cuál es tu tipo de documento? 📇 Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Acta de Nacimiento
2️⃣ Cédula de Identidad (venezolana)
3️⃣ Cédula de Ciudadanía (colombiana)
4️⃣ Pasaporte
5️⃣ Cédula de Extranjería
6️⃣ Otro`;
                  }
              break;

              case 2: //guardo respuesta pregunta 2

                try {
                  //$formulario.numero_documento = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\-\w]/gi, '');
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
                    //mensajeRespuesta = `Escribe tu número de teléfono en números 📞` ;

                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;

                    }

                } catch (error) {
                  //console.log('EL ERROR EN PASO 2 REPORTE LLEGADA: : ', error);
                    $formulario.pregunta = 2; //vuelve a entrar a paso 2
                    
                    //actualizarLlegada($formulario); //llama a funcion en app.js
                    llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                }

              break;

              case 3:
                try {

                  //const pattern = new RegExp('^[0-9]+$', 'i');
                  //$formulario.nombre_jefe_hogar = req.body.Body;
                  $formulario.nombre_jefe_hogar = req.body.incomingMessage;
                  const pattern = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ ]+$', 'i');

                  if(pattern.test($formulario.nombre_jefe_hogar)){
                  //if(pattern.test(req.body.Body)){

                    //$formulario.nombre_jefe_hogar = req.body.Body;
                    $formulario.nombre_jefe_hogar = req.body.incomingMessage;
                    //$formulario.telefono = req.body.Body;
                    $formulario.pregunta += 1; //va a 4
                    
                    //actualizarLlegada($formulario); //llama a funcion en app.js
                    llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js


                    mensajeRespuesta = `Escribe tu número de teléfono en números 📞`;
                    
                  }else{
                    //mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                    //Escribe tu número de teléfono en números 📞` ;
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe el nombre del jefe de hogar`;

                  }

                } catch (error) {
                  $formulario.pregunta = 3; //vuelve a 3
                  
                  //actualizarLlegada($formulario); //llama a funcion en app.js
                  llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                  //mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                  //Escribe tu número de teléfono en números 📞` ;
                  mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe el nombre del jefe de hogar`;
                }
              break;

              case 4:
                  try {
                      const pattern = new RegExp('^[0-9]+$', 'i');

                      //if(pattern.test(req.body.Body)){
                      if(pattern.test(req.body.incomingMessage)){

                        //$formulario.telefono = req.body.Body;
                        $formulario.numero_contacto = req.body.incomingMessage;
                            $formulario.pregunta += 1; //va a pregunta 5

                            
                            //actualizarLlegada($formulario); //llama a funcion en app.js
                        llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                            mensajeRespuesta = `¿Esta línea de contacto está asociada a WhatsApp? Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Sí
2️⃣ No`;

                          }else{
                            mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

Escribe tu número de teléfono en números 📞`;
                          }

                  } catch (error) {
                    $formulario.pregunta = 4;
                    
                    //actualizarLlegada($formulario); //llama a funcion en app.js
                    llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

Escribe tu número de teléfono en números 📞`;
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
                      
                      mensajeRespuesta = `Dónde te encuentras?. Envía el número de la opción correspondiente
1️⃣ Otro
2️⃣ Arauca
3️⃣ Barranquilla
4️⃣ Bogotá
5️⃣ Bucaramanga
6️⃣ Cali
7️⃣ Cartagena
8️⃣ Cúcuta
9️⃣ Medellín
🔟 Riohacha
1️⃣1️⃣ Pasto
1️⃣2️⃣ Valledupar`;

                    break;


                    case '2':
                      $formulario.numero_contacto_asociado_whatsapp = '2';
                      $formulario.pregunta += 1; //va a pregunta 6

                      //actualizarLlegada($formulario); //llama a funcion en app.js
                      llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                      mensajeRespuesta = `Dónde te encuentras?. Envía el número de la opción correspondiente
1️⃣ Otro
2️⃣ Arauca
3️⃣ Barranquilla
4️⃣ Bogotá
5️⃣ Bucaramanga
6️⃣ Cali
7️⃣ Cartagena
8️⃣ Cúcuta
9️⃣ Medellín
🔟 Riohacha
1️⃣1️⃣ Pasto
1️⃣2️⃣ Valledupar`;
                    break;

                    default:
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿Esta línea de contacto está asociada a WhatsApp? Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Sí
2️⃣ No`;
                      break;
                  }

                } catch (error) {
                    $formulario.pregunta = 5;
                    
                    //actualizarLlegada($formulario); //llama a funcion en app.js
                    llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿Esta línea de contacto está asociada a WhatsApp? Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Sí
2️⃣ No`;
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

                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
                          mensajeRespuesta = `En cuál otro lugar te encuentras?`;
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
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
                          
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
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
                          
                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '4':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Bogotá';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;

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
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
                          
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
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
                        
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
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
                          
                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '8':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Cúcuta';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
                        
                          mensajeRespuesta = 'final_form_llegada';

                        break;

                        case '9':
                          $formulario.pregunta += 2; //va a pregunta 11
                          $formulario.donde_te_encuentras = 'Medellín';
                          $formulario.otro_donde_te_encuentras = null;
                          //actualizarLlegada($formulario); //llama a funcion en app.js
                          llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                          conversation.tipo_formulario = null;
                          
                          //actualizarConversacion(conversation); //llama a funcion en app.js
                          //conversacionController.actualizarConversacion(conversation)//llama a funcion en conversacion.controller.js
                          this.actualizarConversacion(conversation);
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
                          
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
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
                          
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
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
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
                          //mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
                         
                          mensajeRespuesta = 'final_form_llegada';

                        default:
                          break;

                      }

                  } else {

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Dónde te encuentras?
1️⃣ Otro
2️⃣ Arauca
3️⃣ Barranquilla
4️⃣ Bogotá
5️⃣ Bucaramanga
6️⃣ Cali
7️⃣ Cartagena
8️⃣ Cúcuta
9️⃣ Medellín
🔟 Riohacha
1️⃣1️⃣ Pasto
1️⃣2️⃣ Valledupar`;
                
                  }

                } catch (error) {
                  //console.log('ERROR EN 28__ ', error);
                  $formulario.pregunta = 6; //vuelve a 6
                  
                  //actualizarLlegada($formulario); //llama a funcion en app.js
                  llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                  mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Dónde te encuentras?
1️⃣ Otro
2️⃣ Arauca
3️⃣ Barranquilla
4️⃣ Bogotá
5️⃣ Bucaramanga
6️⃣ Cali
7️⃣ Cartagena
8️⃣ Cúcuta
9️⃣ Medellín
🔟 Riohacha
1️⃣1️⃣ Pasto
1️⃣2️⃣ Valledupar`;

                }
              break;

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
                  mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
En cuál otro lugar te encuentras?`;
                }
              break;

              default:
                $formulario.pregunta = 7; //vuelve a
                
                //actualizarLlegada($formulario); //llama a funcion en app.js
                llegadasController.actualizarLlegada($formulario); //llama a funcion en llegadas.controller.js

                mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
En cuál otro lugar te encuentras?`;
              break;

              case 8:
                try{
                  mensajeRespuesta = `Ya reportaste tu llegada a destino gracias!`;
                }catch{

                }
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

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;


                        break;
                      case '2':
                        $formulario.tipo_documento = "Cédula de Identidad (venezonala)";

                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '3':
                        $formulario.tipo_documento = "Cédula de ciudadania (colombiana)";

                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '4':
                        $formulario.tipo_documento = "Pasaporte";

                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '5':
                        $formulario.tipo_documento = "Cédula de Extranjería";

                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '6':
                        $formulario.tipo_documento = "Otro";
                        $formulario.pregunta += 1;// pregunta 2
                        //actualizarDatosContacto($formulario);//llama a funcion en app.js
                        actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿Cuál es tu tipo de documento? 📇 Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Acta de Nacimiento
2️⃣ Cédula de Identidad (venezolana)
3️⃣ Cédula de Ciudadanía (colombiana)
4️⃣ Pasaporte
5️⃣ Cédula de Extranjería
6️⃣ Otro`;
                        break;
                      }

                  } catch (error) {
                    $formulario.pregunta = 1; //vuelve a entrar a pregunta 1
                    //actualizarDatosContacto($formulario);//llama a funcion en app.js
                    actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
¿Cuál es tu tipo de documento? 📇 Responde con el número de acuerdo a la opción correspondiente:
1️⃣ Acta de Nacimiento
2️⃣ Cédula de Identidad (venezolana)
3️⃣ Cédula de Ciudadanía (colombiana)
4️⃣ Pasaporte
5️⃣ Cédula de Extranjería
6️⃣ Otro`;
                  }
              break;

              case 2: //guardo respuesta pregunta 2

                try {
                  //$formulario.numero_documento = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\-\w]/gi, '');
                  $formulario.numero_documento = req.body.incomingMessage;

                  const pattern = new RegExp('^[0-9]+$', 'i');

                  if(pattern.test($formulario.numero_documento)){
                    //console.log('CUMPLE CON PATTERN EN REPORTELLEGADA');
                  //if($formulario.numero_documento.length>0){

                    $formulario.pregunta += 1;// pregunta 3.
                    //actualizarDatosContactoEncuesta($formulario); //llama a funcion en app.js
                    actualizarDatosContactoController.actualizarDatosContactoEncuesta($formulario);

                    mensajeRespuesta = `Escribe tu número de teléfono en números 📞` ;

                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;

                    }

                } catch (error) {
                  //console.log('EL ERROR EN PASO 2 REPORTE LLEGADA: : ', error);
                    $formulario.pregunta = 2; //vuelve a entrar a paso 2
                    //actualizarDatosContacto($formulario);//llama a funcion en app.js
                    actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
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
                    actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller


                    mensajeRespuesta = `¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar? Si no ❌ tienes, ¡no te preocupes! escribe NO`;
                  }else{
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe tu número de teléfono en números 📞` ;

                  }

                } catch (error) {
                  $formulario.pregunta = 3; //vuelve a 3
                  
                  //actualizarDatosContacto($formulario);//llama a funcion en app.js
                  actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller

                  mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
Escribe tu número de teléfono en números 📞` ;
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
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar? Si no ❌ tienes, ¡no te preocupes! escribe NO`;

                  }

                } catch (error) {
                  $formulario.pregunta = 4; //vuelve a 4

                  //actualizarDatosContacto($formulario);//llama a funcion en app.js
                  actualizarDatosContactoController.actualizarDatosContacto($formulario);//llama a funcion en actualizarDAtosContacto.controller


                  mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar? Si no ❌ tienes, ¡no te preocupes! escribe NO`;

                }

              default:
                break;
              }

          }

        }else{
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

            default:
             
              mensajeRespuesta = 'seleccionar_formulario';

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

              mensajeRespuesta = 'seleccionar_formulario';
            break;

            case '2':
              //mensajeRespuesta = `¡Gracias por contactarnos! 👋🏻 `;
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
    //if(conversation.conversation_start == true && !conversation.tipo_formulario && req.body.incomingMessage !== 'Si, ya llegué' ){
    if(conversation.conversation_start == true && !conversation.tipo_formulario ){
  
        whatsappMessageController.sendMessageWhatsapp({
            'to': req.body['message.from'],
            'conversationId': req.body.conversationId,
            //'to': '573885049604',
            //'conversationId': '2335435432432423458096840935802849023890834508884584423483294',
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
                //'reportUrl': process.env.reportUrl_CHATBOT
        });

    }else{
        whatsappMessageController.sendMessageWhatsapp({
          //'to': '573885049604',
          'to': req.body['message.from'],
          'conversationId': req.body.conversationId,
          //'conversationId': '2335435432432423458096840935802849023890834508884584423483294',
          'type': 'text',
          'content': {
                  'text': mensajeRespuesta,
                },
          //'reportUrl': process.env.reportUrl_CHATBOT
        });
      }

  }


   //funcion seleccion de formulario a responder
exports.seleccionarFormulario = async function (conversation, req){

    mensajeRespuesta = ``;
    //console.log('req.body.Body en seleccionar form:', req.body.Body);

    try {
        //switch (req.body.message.content.text) {
        //switch (req.body.Body){
        switch(req.body.incomingMessage){

            //selecciona llenar nuevo form
            case '1':

                //consultaExisteEncuesta(conversation); //llama a funcion en app.js
                encuestaController.consultaExisteEncuesta(conversation, req);

            break;

            case '2':
              //crea actualizar datos
              //consultaExisteLlegadaADestino(conversation); //llamo a funcion en app.js
              llegadasController.consultaExisteLlegadaADestino(conversation,req); //envio converation y req a la funcion en llegadasController

            break;

            case '3':
              //crea reporte llegada
              //consultaExisteDatosActualizados(conversation);//llama a funcion en app.js
              actualizarDatosContactoController.consultaExisteDatosActualizados(conversation,req); //llama a funcion en actualizarDatosContacto.controller
              //crearDatosActualizados(conversation);

            break;

          default:

            mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta. 
  
Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
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

        }
    } catch (error) {
      //console.log(error);
      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta. 
      
Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
            //console.log('MENSAJE A ENVIAR::', mensajeRespuesta);

            whatsappMessageController.sendMessageWhatsapp({
              'to': req.body['message.from'],
                'conversationId': req.body.conversationId,
              'type': 'text',
              'content': {
                      'text': mensajeRespuesta,
                    },
              //'reportUrl': process.env.reportUrl_CHATBOT
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
      //var newprofile = params.conversationContactId.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, ''); //version messagebird
      var newprofile = params['contact.displayName'].replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, ''); //version messagebird
    
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

          sendMessageWhatsapp({
            'to': req.body['message.from'],
              'conversationId': req.body.conversationId,
            'type': 'text',
            'content': {
                    'text': mensajeRespuesta,
                  },
            //'reportUrl': process.env.reportUrl_CHATBOT
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

              if(req.body.incomingMessage == 'Si, ya llegué'){

                //ac
                $conversation.tipo_formulario = 2;
                this.actualizarConversacion($conversation);
                llegadasController.consultaExisteLlegadaADestino($conversation,req);
                respuesta = {
                  waId: req.body.contactPhoneNumber,
                  respuesta: 'Si, ya llegué',
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
                        },
                    //'reportUrl': process.env.reportUrl_CHATBOT
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

              if(req.body.incomingMessage == 'Si, ya llegué'){

                //ac
                $conversation.tipo_formulario = 2;
                this.actualizarConversacion($conversation);
                llegadasController.consultaExisteLlegadaADestino($conversation,req);
                respuesta = {
                  waId: req.body.contactPhoneNumber,
                  respuesta: 'Si, ya llegué',
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
                        },
                        //'reportUrl': process.env.reportUrl_CHATBOT
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