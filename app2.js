require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemon = require('nodemon');
const moment = require('moment');
const mysql = require('mysql');
const { defaultWorkerPolicies } = require('twilio/lib/jwt/taskrouter/util');
const extName = require('ext-name');
const fs = require('fs');
const urlUtil = require('url');
const path = require('path');
const fetch = require('node-fetch');
var dateFormat = require('dateformat');


const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

const TWILIO_ID = process.env.TWILIO_ID
//const TWILIO_ID = 'AC45d7e7b6bc51bd018559b47dc64886d5'
const TWILIO_SK = process.env.TWILIO_SK
//const TWILIO_SK = '030d962958b770a00ea62252966ddeac'

const client = require('twilio')(TWILIO_ID, TWILIO_SK);

//NuevoMessageBird
var messagebird = require('messagebird')("x0fdqCXzhkFWNOVQlIh1t7wKs", null, ["ENABLE_CONVERSATIONSAPI_WHATSAPP_SANDBOX"]);

const connection = mysql.createConnection({
  //host: 'localhost',
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  //user: 'root',
  password:process.env.DB_PASSWORD,
  //password: 'root',
  database: process.env.DB_NAME,
  //database : 'venesperanzaCHATBOT',
  port: process.env.DB_PORT
  //port:'8889'
});

$preguntaEncuesta = 0;
$miembrosFamilia = 0;

app.post('/whatsapp', async (req, res) => {
//app.post('/webhooks', async (req, res) => {

  console.log("MENSAJE MESSAGEBIRD:: ", req.body);

  //consultaConversacion(req.body.WaId, 0);
  consultaConversacion(req.body.contact.msisdn,0);
  
  
  //Consulta conversacion para seguir respondiendo o crear una nueva
  function consultaConversacion(whatsappID, $bandera) {

    //const sql = `SELECT * FROM encuesta where waId = '${whatsappID}'`;
    const sql = `SELECT * FROM conversacion_chatbot where waId = '${whatsappID}'`;

    connection.query(sql, (error, results) => {

      if (error) throw error;

      if (results.length > 0) { 

        var $conversation = results[0];
        if(!$conversation.conversation_start){

          //$conversation.conversation_start = 1;
          //actualizarConversacion($conversation);
          conversacion($conversation);


        }else if(!$conversation.autorizacion){

          conversacion($conversation);

          //$conversation.autorizacion = 1;
          //actualizarConversacion($conversation);
          //autorizacionTratamientoDatos($conversation)
        }else if(!$conversation.tipo_formulario){

          seleccionarFormulario($conversation);
        
        }else if($conversation.tipo_formulario == 1){
          const sqlencuesta = `SELECT * FROM encuesta where waId = '${whatsappID}'`;

          connection.query(sqlencuesta, (error, encuesta) => {
            if (error) throw error;

            if (encuesta.length > 0) { 
              
              //console.log('ENCUESTA ES: ', encuesta[0]);
              conversacion($conversation,encuesta[0]);
            }

          });
        }else if($conversation.tipo_formulario == 2){
          const sqllegadas = `SELECT * FROM llegadas where waId = '${whatsappID}'`;

          connection.query(sqllegadas, (error, llegadas) => {
            if (error) throw error;

            if (llegadas.length > 0) { 
              //console.log('LLEGADA ES: ', llegadas[0]);
              conversacion($conversation , llegadas[0]);
            }

          });
        }else if($conversation.tipo_formulario == 3){
          
          const sqlactualizardatos = `SELECT * FROM datos_actualizados where waId = '${whatsappID}'`;

          connection.query(sqlactualizardatos, (error, actualizardatos) => {
            if (error) throw error;

            if (actualizardatos.length > 0) { 
              //console.log('ENCUESTA ES: ', actualizardatos[0]);
              conversacion($conversation , actualizardatos[0]);
            }

          });
        }
        
      } else {

        nuevaConversacion();

      }
    });
  }

  //funcion para consultar si existe una encuesta con el numero de whatsapp del usuario
  async function consultaExisteEncuesta(conversacion){
    const sqlConsultarEncuesta = `SELECT * FROM encuesta where waId = '${conversacion.waId}'`;

    connection.query(sqlConsultarEncuesta, (error, existeEncuesta) => {
      mensajeRespuesta = '';
      if (error) throw error;

      if (existeEncuesta.length > 0) { 

        mensajeRespuesta = `Ya has respondido el formulario. Gracias!
        Ahora por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
              1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
              2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
              3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;

        client.messages
          .create({
            //from: 'whatsapp:+14155238886',
            from: 'whatsapp:'+process.env.TWILIO_WHATSAPP,
            body: mensajeRespuesta,
            to: req.body.From
          })
          .then(message => console.log(message.body))
          .catch(e => { console.error('Got an error:', e.code, e.message); });

         
        
      }else{
        //conversacion.tipo_formulario = 1;
        //actualizarConversacion(conversacion);
        crearEncuesta(conversacion);
        //mensajeRespuesta = `Por favor escribe tu primer nombre. Sólo puedo leer texto, no utilices audio, imágenes o emojis.`;

      }
      
    });
  }

  async function consultaExisteDatosActualizados(conversacion){
    const sqlConsultarDatosActualizados = `SELECT * FROM datos_actualizados where waId = '${conversacion.waId}'`;

    connection.query(sqlConsultarDatosActualizados, (error, existeDatosActualizados) => {
      mensajeRespuesta = '';
      if (error) throw error;

      if (existeDatosActualizados.length > 0) { 

        conversacion.tipo_formulario = 3;
        actualizarConversacion(conversacion);

        existeDatosActualizados[0].pregunta = 1;
        actualizarDatosContacto(existeDatosActualizados[0]);
        mensajeRespuesta = `A continuación responde a las preguntas para actualizar tus datos de contacto como teléfono u otros:
        Tipo de documento 📇 Responde con el número de acuerdo a la opción correspondiente:
        1️⃣ Acta de Nacimiento
        2️⃣ Cédula de Identidad (venezolana)
        3️⃣ Cédula de Ciudadanía (colombiana)
        4️⃣ Pasaporte
        5️⃣ Cédula de Extranjería
        6️⃣ Indocumentado
        7️⃣ Otro`;

        client.messages
          .create({
            //from: 'whatsapp:+14155238886',
            from: 'whatsapp:'+process.env.TWILIO_WHATSAPP,
            body: mensajeRespuesta,
            to: req.body.From
          })
          .then(message => console.log(message.body))
          .catch(e => { console.error('Got an error:', e.code, e.message); });
        
      }else{
        //conversacion.tipo_formulario = 1;
        //actualizarConversacion(conversacion);
        crearDatosActualizados(conversacion);
        //mensajeRespuesta = `Por favor escribe tu primer nombre. Sólo puedo leer texto, no utilices audio, imágenes o emojis.`;

      }
      
    });
    

  }

  

  //funcion seleccion de formulario a responder
  async function seleccionarFormulario(conversation){
 
    mensajeRespuesta = ``;
    //console.log('req.body.Body en seleccionar form:', req.body.Body);

    try {
        switch (req.body.Body) {

            //selecciona llenar nuevo form
            case '1':
             
                consultaExisteEncuesta(conversation);
             
            break;
            
            case '2':
              //crea actualizar datos
              crearLlegadaADestino(conversation);

            break;

            case '3':
              //crea reporte llegada
              consultaExisteDatosActualizados(conversation);
              //crearDatosActualizados(conversation);

            break;

          default:
            /*
            mensajeRespuesta = `Ahora por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
            1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
            2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
            3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `*/
            mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta. 
            
            Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
            1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
            2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
            3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;

            //console.log('MENSAJE A ENVIAR::', mensajeRespuesta);
      client.messages
          .create({
            //from: 'whatsapp:+14155238886',
            from: 'whatsapp:'+process.env.TWILIO_WHATSAPP,
            body: mensajeRespuesta,
            to: req.body.From
          })
          .then(message => console.log(message.body))
          .catch(e => { console.error('Got an error:', e.code, e.message); });
          break;
        }
    } catch (error) {
      //console.log(error);
      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta. 
      
      Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
            1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
            2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
            3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
            //console.log('MENSAJE A ENVIAR::', mensajeRespuesta);
      client.messages
          .create({
            //from: 'whatsapp:+14155238886',
            from: 'whatsapp:'+process.env.TWILIO_WHATSAPP,
            body: mensajeRespuesta,
            to: req.body.From
          })
          .then(message => console.log(message.body))
          .catch(e => { console.error('Got an error:', e.code, e.message); });
    }
    
  }

 

  //crea nueva 'conversacion_chatbot'
  function nuevaConversacion() {
    //const sqlnuevo = 'INSERT INTO encuesta SET ?';
    const sqlnuevo = 'INSERT INTO conversacion_chatbot SET ?';

    //console.log('PARAMS NUEVA CONVERSA: ', req.body);
    const params = req.body;
    //console.log('PARAMS SON: ', params);

    //console.log('ANTES DE REEMPLAZAR EMOTICONES:: ', params.ProfileName);
    //reemplazo de emoticones en el nombre de perfil de whatsapp
    //var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

    //var newprofile = params.ProfileName.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');
    var newprofile = params.contact.displayName.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');
   //console.log('REEMPLAZO: ', newprofile);

    const nuevaconversacion = {
      //waId: params.WaId,
      waId: params.contact.msisdn, //messagebird
      profileName: newprofile,
      conversation_start: false,
      autorizacion: false,
      tipo_formulario: null,
      created_at: new Date(),
      //encuesta: true,
      //encuesta_chatbot: false,
      //fecha_nacimiento: new Date("1900-01-01"),
      //actualizar: false,
      //reportar: false 
      //paso_chatbot: null,
      //pregunta: null,
      //fuente: 1
    }
    //console.log('NUEVA CONVERSACION: ', nuevaconversacion);

    connection.query(sqlnuevo, nuevaconversacion, (error, results) => {
      //if (error) throw error;
      if(error){
        mensajeRespuesta = "Su Nombre de perfil de Whatsapp contiene emoticones, por favor quitelos momentaneamente para interactuar con nuestro chat e intente nuevamente";

        client.messages
        .create({
          from: 'whatsapp:+14155238886',
          body: mensajeRespuesta,
          to: req.body.From
        })
        .then(message => console.log(message.body))
        .catch(e => { console.error('Got an error:', e.code, e.message); });
      }else{
        //console.log('RESULTS QUERY NUEVO: ', results);
        consultaConversacion(nuevaconversacion.waId);
      }

    });
  }

  //funcion que actualiza conversacion tabla 'conversacion_chatbot'
  function actualizarConversacion($conversa){
    
    $conversa.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

    //console.log('UPDATED: ', $conversa.updated_at);
    //$conversa.updated_at = dateFormat($conversa.updated_at, "yyyy-mm-dd hh");

    const sqlConversacion = `UPDATE conversacion_chatbot SET conversation_start = ${$conversa.conversation_start}, 
    autorizacion = ${$conversa.autorizacion}, tipo_formulario = ${$conversa.tipo_formulario}, updated_at = '${$conversa.updated_at}'
     where id = ${$conversa.id}`;
     //console.log('VALOR SQL', sqlCreaEncuesta);

    connection.query(sqlConversacion, (error, res) => {
      if (error) console.log('ERROR: ', error);
      
    });
  }


  /*
  function deleteMediaItem(mediaItem) {
    const client = getTwilioClient();

    return client
      .api.accounts(twilioAccountSid)
      .messages(mediaItem.MessageSid)
      .media(mediaItem.mediaSid).remove();
  }*/

  //guardar imagenes
  async function SaveMedia(mediaItem) {
    //console.log('LLEGA A SAVEMEDIA::', mediaItem);
    const { mediaUrl, filename } = mediaItem;
    //if (NODE_ENV !== 'test') {
    //const fullPath = path.resolve(`${PUBLIC_DIR}/${filename}`);
    const fullPath = path.resolve(`documentos/${filename}`);
    if (!fs.existsSync(fullPath)) {
      const response = await fetch(mediaUrl);
      const fileStream = fs.createWriteStream(fullPath);

      response.body.pipe(fileStream);

      //deleteMediaItem(mediaItem);
    }
  }


  function autorizacionTratamientoDatos($conversa) {

    const sqlAutorizacion = 'INSERT INTO autorizaciones SET ?';

    //console.log('NUEVA AUTORIZACION: ', $conversa);
    //console.log('PARAMS SON: ', params);

    const nuevaAutorizacion = {
      //id_encuesta: $conversa.id,
      id_encuesta: null,
      tratamiento_datos: true,
      terminos_condiciones: true,
      condiciones: true,
      created_at: new Date(),
      waId: $conversa.waId
    }

    connection.query(sqlAutorizacion, nuevaAutorizacion, (error, results) => {
      if (error) throw error;

    });
  }

  

  //funcion crear encuesta
  function crearEncuesta($conversation) {

    const sqlnuevaencuesta = 'INSERT INTO encuesta SET ?';

    //console.log('PARAMS NUEVA CONVERSA: ', req.body);
    const params = req.body;
    //console.log('PARAMS SON: ', params);

    //console.log('ANTES DE REEMPLAZAR EMOTICONES:: ', params.ProfileName);
    //reemplazo de emoticones en el nombre de perfil de whatsapp
    //var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

    var newprofile = params.ProfileName.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');

   //console.log('REEMPLAZO: ', newprofile);

    const nuevaencuesta = {
      waId: $conversation.waId,
      //profileName: newprofile,
      profileName: $conversation.profileName,
      
      //encuesta: true,
      //encuesta_chatbot: false,
      //fecha_nacimiento: new Date("1900-01-01"),
      //paso_chatbot: null,
      created_at: new Date(),
      pregunta: 1,
      fuente: 1
    }
    //console.log('NUEVA CONVERSACION: ', nuevaconversacion);

    connection.query(sqlnuevaencuesta, nuevaencuesta, (error, results) => {
      if (error){
        mensajeRespuesta = `Disculpa tuvimos un problema en crear Encuesta. Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
        1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
        2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
        3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;

        
      }else{
        $conversation.tipo_formulario = 1;
        actualizarConversacion($conversation);
        mensajeRespuesta = `Por favor escribe tu primer nombre. Sólo puedo leer texto, no utilices audio, imágenes o emojis.`;

      }

      client.messages
        .create({
          from: 'whatsapp:+14155238886',
          body: mensajeRespuesta,
          to: req.body.From
        })
        .then(message => console.log(message.body))
        .catch(e => { console.error('Got an error:', e.code, e.message); });

    });

  }

  //funcion registro llegada
  function crearLlegadaADestino($conversation){
    const sqlnuevaLlegada = 'INSERT INTO llegadas SET ?';

    const params = req.body;
    var newprofile = params.ProfileName.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');

   //console.log('REEMPLAZO: ', newprofile);

    const nuevaLlegada = {
      waId: $conversation.waId,
      pregunta: 1,
      created_at: new Date(),
    }

    connection.query(sqlnuevaLlegada, nuevaLlegada, (error, results) => {
      if (error){
        mensajeRespuesta = `Disculpa tuvimos un problema. Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
        1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
        2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
        3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
      } else{
        $conversation.tipo_formulario = 2;
        actualizarConversacion($conversation);
          
        mensajeRespuesta = `A continuación responde a las preguntas para informar de tu llegada a destino como teléfono u otros:
        Tipo de documento 📇 Responde con el número de acuerdo a la opción correspondiente:
        1️⃣ Acta de Nacimiento
        2️⃣ Cédula de Identidad (venezolana)
        3️⃣ Cédula de Ciudadanía (colombiana)
        4️⃣ Pasaporte
        5️⃣ Cédula de Extranjería
        6️⃣ Indocumentado
        7️⃣ Otro`;
      }

      client.messages
        .create({
          from: 'whatsapp:+14155238886',
          body: mensajeRespuesta,
          to: req.body.From
        })
        .then(message => console.log(message.body))
        .catch(e => { console.error('Got an error:', e.code, e.message); });

    });
  }

  //funcion actualizar datos
  function crearDatosActualizados($conversation) {

    const sqlnuevoDatosActualizados = 'INSERT INTO datos_actualizados SET ?';

    const params = req.body;
    var newprofile = params.ProfileName.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');

   //console.log('REEMPLAZO: ', newprofile);

    const nuevoDatosActualizados = {
      waId: $conversation.waId,
      pregunta: 1,
      created_at: new Date(),
    }

    connection.query(sqlnuevoDatosActualizados, nuevoDatosActualizados, (error, results) => {
      if (error){
        mensajeRespuesta = `Disculpa tuvimos un problema. Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
        1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
        2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
        3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
      } else{

        $conversation.tipo_formulario = 3;
        actualizarConversacion($conversation);
          
        mensajeRespuesta = `A continuación responde a las preguntas para actualizar tus datos de contacto como teléfono u otros:
        Tipo de documento 📇 Responde con el número de acuerdo a la opción correspondiente:
        1️⃣ Acta de Nacimiento
        2️⃣ Cédula de Identidad (venezolana)
        3️⃣ Cédula de Ciudadanía (colombiana)
        4️⃣ Pasaporte
        5️⃣ Cédula de Extranjería
        6️⃣ Indocumentado
        7️⃣ Otro`;
      }
      
      client.messages
        .create({
          from: 'whatsapp:+14155238886',
          body: mensajeRespuesta,
          to: req.body.From
        })
        .then(message => console.log(message.body))
        .catch(e => { console.error('Got an error:', e.code, e.message); });

    });

  }

  function actualizarEncuesta($encuesta) {
    //console.log('CONVERSA EN CREAR ENCUESTA: ', $conversa);
   
    //console.log('CREAR ENCUESTA CONVERSA::', $conversa);
    //console.log('CREAR ENCUESTA FECHA::', $conversa.fecha_nacimiento);
   
    /*
    if(!$encuesta.fecha_nacimiento){
      //$conversa.fecha_nacimiento = NULL;
      //console.log('CONVERSA NULL::', $conversa.fecha_nacimiento);
      $encuesta.fecha_nacimiento = "1900-01-01";
    }else if(typeof($encuesta.fecha_nacimiento) != 'string'){
      //console.log('CONVERSA NO ES NULL');
      $encuesta.fecha_nacimiento = $encuesta.fecha_nacimiento.toISOString();
      $encuesta.fecha_nacimiento = $encuesta.fecha_nacimiento.substring(0,10);
    }*/
    
    /*$conversa.fecha_nacimiento = dateFormat($conversa.fecha_nacimiento, "yyyy-mm-dd");
    console.log('NUEVO FORMATO FECHA: ', $conversa.fecha_nacimiento);*/

    $encuesta.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;
    //campos finales
    const sqlCreaEncuesta = `UPDATE encuesta SET pregunta = ${$encuesta.pregunta},
    primer_nombre = '${$encuesta.primer_nombre}', segundo_nombre = '${$encuesta.segundo_nombre}', primer_apellido = '${$encuesta.primer_apellido}', segundo_apellido = '${$encuesta.segundo_apellido}',
    sexo = '${$encuesta.sexo}', codigo_encuesta = '${$encuesta.codigo_encuesta}',
    nacionalidad = '${$encuesta.nacionalidad}', cual_otro_nacionalidad = '${$encuesta.cual_otro_nacionalidad}', tipo_documento = '${$encuesta.tipo_documento}',
    cual_otro_tipo_documento = '${$encuesta.cual_otro_tipo_documento}', numero_documento = '${$encuesta.numero_documento}',
    compartir_foto_documento_encuestado = ${$encuesta.compartir_foto_documento_encuestado}, url_foto_documento_encuestado = '${$encuesta.url_foto_documento_encuestado}',
    como_llego_al_formulario = '${$encuesta.como_llego_al_formulario}', donde_encontro_formulario = '${$encuesta.donde_encontro_formulario}', fecha_llegada_pais = '${$encuesta.fecha_llegada_pais}',
    estar_dentro_colombia = ${$encuesta.estar_dentro_colombia}, id_departamento_destino_final = ${$encuesta.id_departamento_destino_final},
    id_municipio_destino_final = ${$encuesta.id_municipio_destino_final}, 
    nombre_municipio_destino_final = '${$encuesta.nombre_municipio_destino_final}',
     razon_elegir_destino_final = '${$encuesta.razon_elegir_destino_final}', otra_razon_elegir_destino_final = '${$encuesta.otra_razon_elegir_destino_final}',
     recibe_transporte_humanitario = ${$encuesta.recibe_transporte_humanitario},
     pais_destino_final = '${$encuesta.pais_destino_final}',
     total_miembros_hogar = ${$encuesta.total_miembros_hogar}, miembro_hogar_preguntando = ${$encuesta.miembro_hogar_preguntando},
     id_departamento = ${$encuesta.id_departamento}, ubicacion = '${$encuesta.ubicacion}', numero_entregado_venesperanza = ${$encuesta.numero_entregado_venesperanza},
     numero_contacto = '${$encuesta.numero_contacto}', linea_contacto_propia = ${$encuesta.linea_contacto_propia},
     linea_asociada_whatsapp = ${$encuesta.linea_asociada_whatsapp}, numero_whatsapp_principal = '${$encuesta.numero_whatsapp_principal}',
     numero_alternativo = '${$encuesta.numero_alternativo}', linea_contacto_alternativo = ${$encuesta.linea_contacto_alternativo},
     linea_alternativa_asociada_whatsapp = ${$encuesta.linea_alternativa_asociada_whatsapp}, correo_electronico = '${$encuesta.correo_electronico}',
     tiene_cuenta_facebook = ${$encuesta.tiene_cuenta_facebook}, cuenta_facebook = '${$encuesta.cuenta_facebook}',
     podemos_contactarte = ${$encuesta.podemos_contactarte}, forma_contactarte = '${$encuesta.forma_contactarte}',
     otra_forma_contactarte = '${$encuesta.otra_forma_contactarte}', comentario = '${$encuesta.comentario}',
     updated_at = '${$encuesta.updated_at}'
     WHERE id = ${$encuesta.id}`;

    //version anterior
    /*const sqlCreaEncuesta = `UPDATE encuesta SET conversation_start = ${$conversa.conversation_start}, 
    encuesta_chatbot = ${$conversa.encuesta_chatbot}, paso_chatbot = ${$conversa.paso_chatbot}, pregunta = ${$conversa.pregunta},
    primer_nombre = '${$conversa.primer_nombre}', segundo_nombre = '${$conversa.segundo_nombre}', primer_apellido = '${$conversa.primer_apellido}', segundo_apellido = '${$conversa.segundo_apellido}',
    sexo = '${$conversa.sexo}', fecha_nacimiento = '${$conversa.fecha_nacimiento}', codigo_encuesta = '${$conversa.codigo_encuesta}',
    nacionalidad = '${$conversa.nacionalidad}', cual_otro_nacionalidad = '${$conversa.cual_otro_nacionalidad}', tipo_documento = '${$conversa.tipo_documento}',
    cual_otro_tipo_documento = '${$conversa.cual_otro_tipo_documento}', numero_documento = '${$conversa.numero_documento}',
    compartir_foto_documento_encuestado = ${$conversa.compartir_foto_documento_encuestado}, url_foto_documento_encuestado = '${$conversa.url_foto_documento_encuestado}',
    como_llego_al_formulario = '${$conversa.como_llego_al_formulario}', donde_encontro_formulario = '${$conversa.donde_encontro_formulario}', fecha_llegada_pais = '${$conversa.fecha_llegada_pais}',
    estar_dentro_colombia = ${$conversa.estar_dentro_colombia}, id_departamento_destino_final = ${$conversa.id_departamento_destino_final},
    id_municipio_destino_final = ${$conversa.id_municipio_destino_final}, 
    nombre_municipio_destino_final = '${$conversa.nombre_municipio_destino_final}',
     razon_elegir_destino_final = '${$conversa.razon_elegir_destino_final}', otra_razon_elegir_destino_final = '${$conversa.otra_razon_elegir_destino_final}',
     recibe_transporte_humanitario = ${$conversa.recibe_transporte_humanitario},
     pais_destino_final = '${$conversa.pais_destino_final}',
     total_miembros_hogar = ${$conversa.total_miembros_hogar}, miembro_hogar_preguntando = ${$conversa.miembro_hogar_preguntando},
     id_departamento = ${$conversa.id_departamento}, ubicacion = '${$conversa.ubicacion}', numero_entregado_venesperanza = ${$conversa.numero_entregado_venesperanza},
     numero_contacto = '${$conversa.numero_contacto}', linea_contacto_propia = ${$conversa.linea_contacto_propia},
     linea_asociada_whatsapp = ${$conversa.linea_asociada_whatsapp}, numero_whatsapp_principal = '${$conversa.numero_whatsapp_principal}',
     numero_alternativo = '${$conversa.numero_alternativo}', linea_contacto_alternativo = ${$conversa.linea_contacto_alternativo},
     linea_alternativa_asociada_whatsapp = ${$conversa.linea_alternativa_asociada_whatsapp}, correo_electronico = '${$conversa.correo_electronico}',
     tiene_cuenta_facebook = ${$conversa.tiene_cuenta_facebook}, cuenta_facebook = '${$conversa.cuenta_facebook}',
     podemos_contactarte = ${$conversa.podemos_contactarte}, forma_contactarte = '${$conversa.forma_contactarte}',
     otra_forma_contactarte = '${$conversa.otra_forma_contactarte}', comentario = '${$conversa.comentario}'
     where id = ${$conversa.id}`;*/
     //console.log('VALOR SQL', sqlCreaEncuesta);

    connection.query(sqlCreaEncuesta, (error, res) => {
      if (error) throw error;

      //return callback(true);

    });
  }

  function actualizarLlegada($llegada) {

    //console.log('DATOS QUE LLEGAN A ACTUALIZAR LLEGADA::: ', $llegada)
    //campos finales
    console.log('ESTOY EN ACTUALIZAR LLEGADA', $llegada);
    $llegada.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

    const sqlLlegada = `UPDATE llegadas SET pregunta = ${$llegada.pregunta},
    tipo_documento = '${$llegada.tipo_documento}', numero_documento = '${$llegada.numero_documento}',
    telefono = ${$llegada.telefono}, id_departamento = ${$llegada.id_departamento},
    id_municipio = ${$llegada.id_municipio}, 
     id_encuesta = ${$llegada.id_encuesta}, updated_at = '${$llegada.updated_at}'
     WHERE waId = ${$llegada.waId}`;

   

    connection.query(sqlLlegada, (error, res) => {
      if (error) console.log('ERRROR ACTUALIZAR LLEGADA', error);

      //return callback(true);

    });
  }

  function actualizarLlegadaEncuesta($llegadaEncuesta){

    //consulta encuesta con $llegadaEncuesta waId, toma id_encuesta y se lo asigna a llegadas where waid = encuesta.waId;
    const sqlConsultaEncuesta = `SELECT id FROM encuesta WHERE waId = '${$llegadaEncuesta.waId}' AND tipo_documento = '${$llegadaEncuesta.tipo_documento}' AND numero_documento = '${$llegadaEncuesta.numero_documento}'`;

    connection.query(sqlConsultaEncuesta, (error, encuesta) => {
      //mensajeRespuesta = '';
      if (error) console.log('ERROR EN ACTUALIZAR LLEGADA ENCUESTA:: ', error);

      if (encuesta.length > 0) { 
        console.log('SI ENCONTRO UNA ENCUESTA CON EL WAID::');
        $llegadaEncuesta.id_encuesta = encuesta[0]['id'];
        actualizarLlegada($llegadaEncuesta);
        //mensajeRespuesta = `Ya has respondido el formulario. Gracias`;
        /*client.messages
          .create({
            //from: 'whatsapp:+14155238886',
            from: 'whatsapp:'+process.env.TWILIO_WHATSAPP,
            body: mensajeRespuesta,
            to: req.body.From
          })
          .then(message => console.log(message.body))
          .catch(e => { console.error('Got an error:', e.code, e.message); });*/
        
      }else{
        actualizarLlegada($llegadaEncuesta);
      }
    });
  }


  function actualizarDatosContacto($datosContactoActualizados){

    $datosContactoActualizados.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

    const sqlActualizarDatos = `UPDATE datos_actualizados SET pregunta = ${$datosContactoActualizados.pregunta},
    tipo_documento = '${$datosContactoActualizados.tipo_documento}', numero_documento = '${$datosContactoActualizados.numero_documento}',
    telefono = ${$datosContactoActualizados.telefono}, correo_electronico = '${$datosContactoActualizados.correo_electronico}',
     id_encuesta = ${$datosContactoActualizados.id_encuesta},  updated_at = '${$datosContactoActualizados.updated_at}'
     WHERE waId = ${$datosContactoActualizados.waId}`;

    connection.query(sqlActualizarDatos, (error, res) => {
      if (error) throw error;

      //return callback(true);

    });
  }

  function actualizarDatosContactoEncuesta($datosContactoEncuesta){

    console.log('ENTRA A ACTUALIZAR DATOS CONTACTOENCUESTA!!!');
    //consulta encuesta con $llegadaEncuesta waId, toma id_encuesta y se lo asigna a llegadas where waid = encuesta.waId;
    const sqlConsultaEncuesta = `SELECT id FROM encuesta WHERE waId = '${$datosContactoEncuesta.waId}' AND tipo_documento = '${$datosContactoEncuesta.tipo_documento}' AND numero_documento = '${$datosContactoEncuesta.numero_documento}'`;

    connection.query(sqlConsultaEncuesta, (error, encuesta) => {
      //mensajeRespuesta = '';
      if (error) console.log('ERROR EN ACTUALIZAR DATOS CONTACTO ENCUESTA:: ', error);

      if (encuesta.length > 0) { 
        console.log('SI ENCONTRO UNA ENCUESTA CON EL WAID EN ACTUALIZAR DATOS CONTACTO::');
        $datosContactoEncuesta.id_encuesta = encuesta[0]['id'];
        actualizarDatosContacto($datosContactoEncuesta);
       
      }else{
        $datosContactoEncuesta.id_encuesta = null;
        actualizarDatosContacto($datosContactoEncuesta);
      }
    });
  }


  //Conversacion del chatbot general, valida el estado de la conversacion y entra a cada uno de los formulario o de las preguntas generales del saludo inicial 
  async function conversacion(conversation, $formulario) {

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
                    $formulario.primer_nombre = req.body.Body;//.replace(/[^\aA-zZ\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú]/gi, '');

                    const pattern = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ]+$', 'i');

                    if(pattern.test($formulario.primer_nombre)){
                    //console.log('primer nombre:: ', $formulario.primer_nombre);
                    //if($formulario.primer_nombre.length>0){
                      $formulario.pregunta += 1; //pregunta 12

                      //crearEncuesta(conversation);
                      //console.log('LLAMARE A ACTUALZIAR ENCUESTA:: \n', $formulario );
                      actualizarEncuesta($formulario);
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
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

                    Por favor escribe tu primer nombre. Sólo puedo leer texto, no utilices audio, imágenes o emojis.`;
              
                  }
                break;

                case 2: //guardo respuesta pregunta 2

                  try {
                    $formulario.segundo_nombre = req.body.Body;//.replace(/[^\aA-zZ\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú]/gi, '');
                    //console.log('primer nombre:: ', conversation.primer_nombre);
                    //if($formulario.segundo_nombre.length>0){
                    const pattern = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ]+$', 'i');

                    if(pattern.test($formulario.segundo_nombre)){
                      $formulario.pregunta += 1; //pregunta 2

                      //crearEncuesta(conversation);
                      actualizarEncuesta($formulario);
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
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

                    Por favor escribe tu segundo nombre, si no tienes segundo nombre escribe NO.`;
              
                    
                  }
                break;
                
                case 3:
                  try {
                      $formulario.primer_apellido = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');
                    
                      //if($formulario.primer_apellido.length>0){
                      const pattern = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ ]+$', 'i');
                      //console.log('PATTERN::: ', pattern);

                      if(pattern.test($formulario.primer_apellido)){
                        $formulario.pregunta += 1; //pregunta 14
  
                        actualizarEncuesta($formulario);
                        mensajeRespuesta = `Por favor escribe tu segundo apellido, si no tienes segundo apellido escribe NO`;
                        
                      }else{
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

                        Por favor escribe tu primer apellido`;
                      }
                      
                    
  
                  } catch (error) {
                    $formulario.pregunta = 3;
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

                        Por favor escribe tu primer apellido`;
                  }
                break;

                case 4:
                  try {
                      $formulario.segundo_apellido = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');

                      //if($formulario.segundo_apellido.length>0){

                        const patternsegundoapellido = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ ]+$', 'i');
                        if(patternsegundoapellido.test($formulario.segundo_apellido)){
                        $formulario.pregunta += 1; //pregunta 14
  
                        actualizarEncuesta($formulario);
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
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                    Por favor escribe tu segundo apellido, si no tienes segundo apellido escribe NO`;
                  }
                break;

                case 5:
                  //cual otro tipo de documento
                  try {
  
                      switch (req.body.Body) {
                        case '1':
                          $formulario.tipo_documento = "Acta de Nacimiento";
                          $formulario.pregunta += 2;// pregunta 7
                          actualizarEncuesta($formulario);
                          mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
  
  
                          break;
                        case '2':
                          $formulario.tipo_documento = "Cédula de Identidad (venezonala)";
  
                          $formulario.pregunta += 2;// pregunta 7
                          actualizarEncuesta($formulario);
                          mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                          break;
  
                        case '3':
                          $formulario.tipo_documento = "Cédula de ciudadania (colombiana)";
  
                          $formulario.pregunta += 2;// pregunta 21
                          actualizarEncuesta($formulario);
                          mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                          break;
  
                        case '4':
                          $formulario.tipo_documento = "Pasaporte";
  
                          $formulario.pregunta += 2;// pregunta 7
                          actualizarEncuesta($formulario);
                          mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                          break;
  
                        case '5':
                          $formulario.tipo_documento = "Cédula de Extranjería";
  
                          $formulario.pregunta += 2;// pregunta 21
                          actualizarEncuesta($formulario);
                          mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                          break;
  
                        case '6':
                          $formulario.tipo_documento = "Indocumentado";
  
                          $formulario.pregunta += 3;// pregunta 8. Indocumentado no se muestra numero documento
                          actualizarEncuesta($formulario);
                          mensajeRespuesta = `¿Cómo encontraste mi número de WhatsApp? Responde con el número de acuerdo a la opción correspondiente:
                          1️⃣ Ví un pendón en un albergue
                          2️⃣ Recibí un volante en el albergue
                          3️⃣ Recibí una foto con la información
                          4️⃣ Lo recibí por chat
                          5️⃣ Lo encontré en Facebook
                          6️⃣ Una persona conocida me lo envió para que lo llenara
                          7️⃣ Otro`;;
                        break;

                        case '7':
                          $formulario.tipo_documento = "Otro";
                          $formulario.pregunta += 1; // pregunta 6
                          actualizarEncuesta($formulario);
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
                    actualizarEncuesta($formulario);
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
                    $formulario.cual_otro_tipo_documento = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, '');
                    
                    //if($formulario.cual_otro_tipo_documento.length>0){

                    const pattern = new RegExp('^[aA-zZñÑüÜáÁéÉíÍóÓúÚ ]+$', 'i');

                    if(pattern.test($formulario.cual_otro_tipo_documento)){
                    
                      $formulario.pregunta += 1;// pregunta 7. 
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
    

                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                       ¿Cuál otro tipo de documento? (Indicar tipo, ejemplo: pasaporte)`;
                    }
                    
                  } catch (error) {
                    $formulario.pregunta = 6; //vuelve a entrar a paso 6
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                    ¿Cuál otro tipo de documento? (Indicar tipo, ejemplo: pasaporte)`;
  
                  }

                break;

                case 7:
                  try {
                    $formulario.numero_documento = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\-\w]/gi, '');

                    const pattern = new RegExp('^[0-9]+$', 'i');

                    if(pattern.test($formulario.numero_documento)){
                    //if($formulario.numero_documento.length>0){
                    
                    $formulario.pregunta += 1;// pregunta 8. 
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `¿Cómo encontraste mi número de WhatsApp? Responde con el número de acuerdo a la opción correspondiente:
                      1️⃣ Ví un pendón en un albergue
                      2️⃣ Recibí un volante en el albergue
                      3️⃣ Recibí una foto con la información
                      4️⃣ Lo recibí por chat
                      5️⃣ Lo encontré en Facebook
                      6️⃣ Una persona conocida me lo envió para que lo llenara
                      7️⃣ Otro`;
                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                      Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;

                    }
  
                  } catch (error) {
                    $formulario.pregunta = 7; //vuelve a entrar a paso 7
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                    Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                }
                break;

                case 8:
                  try {
                    switch (req.body.Body) {
                    case '1':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Ví un pendón en un albergue";
                      $formulario.donde_encontro_formulario = null;
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '2':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recibí un volante en el albergue";
                      $formulario.donde_encontro_formulario = null;
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '3':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recibí una foto con la información";
                      $formulario.donde_encontro_formulario = null;
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '4':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Recibí el enlache por chat";
                      $formulario.donde_encontro_formulario = null;
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '5':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Encontré el enlace en Facebook";
                      $formulario.donde_encontro_formulario = null;
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '6':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Una persona conocida me lo envió para que lo llenara";
                      $formulario.donde_encontro_formulario = null;
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;

                      break;

                    case '7':
                      $formulario.pregunta += 1; //va a pregunta 9
                      $formulario.como_llego_al_formulario = "Otro";
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;
                      break;

                    default:
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n

                      ¿Cómo encontraste este formulario? - Selecciona entre las siguientes opciones enviando el número de la opción correspondente:\n" +
                        "*1*: Ví un pendón en un albergue\n" +
                        "*2*: Recibí un volante en el albergue\n" +
                        "*3*: Recibí una foto con la información\n" +
                        "*4*: Recibí el enlache por chat\n" +
                        "*5*: Encontré el enlace en Facebook\n" +
                        "*6*: Una persona conocida me lo envió para que lo llenara\n" +
                        "*7*: Otro\n`;
                      break;
                    }
                
                    
                  } catch (error) {
                    $formulario.pregunta = 8; //vuelve a entrar a paso 8
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                    ¿Cómo encontraste mi número de WhatsApp? Responde con el número de acuerdo a la opción correspondiente:
                      1️⃣ Ví un pendón en un albergue
                      2️⃣ Recibí un volante en el albergue
                      3️⃣ Recibí una foto con la información
                      4️⃣ Lo recibí por chat
                      5️⃣ Lo encontré en Facebook
                      6️⃣ Una persona conocida me lo envió para que lo llenara
                      7️⃣ Otro`;
                  }
                break;

                case 9:
                  try {


                    patternfecha = /^[0-9]{4}[\-][0-9]{2}[\-][0-9]{2}$/g;
                
                    //if(patternfecha.test(req.body.Body)){
                    if(patternfecha.test(req.body.Body)){
                      //console.log('ES TRUEEE');
                    //if(req.body.Body.match(pattern)){

                      //$fechaSinEmoticones = req.body.Body.replace(/[^\-\w\s]/gi, '');
                      //console.log('FECHA SIN EMOTICONES: ', $fechaSinEmoticones);
                      //$fechavalidar = $fechaSinEmoticones.split('-');
                      $fechavalidar = req.body.Body.split('-');
                      //console.log('FECHA VALIDAR:', $fechavalidar);
    
                      //if ($fechavalidar.length === 3 && $fechavalidar[0].length === 4 && $fechavalidar[1].length === 2 && $fechavalidar[2].length === 2) {
    
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
                          $formulario.fecha_llegada_pais = req.body.Body;//.replace(/[^\-\w]/gi, '');
                          
                          actualizarEncuesta($formulario);
                          mensajeRespuesta = `¿Cuál es tu destino final dentro de Colombia? Envía el número del Departamento correspondiente ó el número *1* en caso de que no tengas definido el Departamento de destino. 1: No sé 
                          2:	Antioquia
                          3:	Atlántico
                          4:	Bogotá D.C.
                          5:	Bolívar
                          6:	Boyaca
                          7:	Caldas
                          8:	Caqueta
                          9:	Cauca
                          10:	Cesar
                          11:	Córdoba
                          12:	Cundinamarca
                          13:	Choco
                          14:	Huila
                          15:	La Guajira
                          16:	Magdalena
                          17:	Meta
                          18:	Nariño
                          19:	Norte de Santander
                          20:	Quindio
                          21:	Risaralda
                          22:	Santander
                          23:	Sucre
                          24:	Tolima
                          25:	Valle del Cauca
                          26:	Arauca
                          27:	Casanare
                          28:	Putumayo
                          29:	San Andres
                          30:	Isla de Providencia y Santa Catalina
                          31:	Amazonas
                          32:	Guainia
                          33:	Guaviare
                          34:	Vaupes
                          35:	Vichada`;
    
                        } else {
                          mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                          ¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;
    
                        }
    
                      /*} else {
                        mensajeRespuesta = `SEGUNDOGracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                          ¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;
    
                      }*/
                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                          ¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;
    
                    }
  
                } catch (error) {
                  $formulario.pregunta = 9; //vuelve a 9
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                          ¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)`;
    
                }
                break;

                case 10:
                  try {

                    //console.log('LO QUE HAY EN BODY 28: ', req.body.Body);
                    const opcionesDepartamento = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16',
                      '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'];
  
                    if (req.body.Body === '1') {
                      $formulario.pregunta += 1; //va a pregunta 31
                      $formulario.id_departamento_destino_final = null;
                      //$formulario.id_municipio_destino_final = null;
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `Escribe tu número de contacto en números 📞 `;
  
  
                    } else if (opcionesDepartamento.includes(req.body.Body)) {
                      //conversation.pregunta += 1; //va a pregunta 29
                      //conversation.id_departamento_destino_final =  parseInt(req.body.Body);
                      //crearEncuesta(conversation);
                      //mensajeRespuesta = "Escriba en mayúscula el nombre del Municipio ó la palabra *NO SE* en caso de que no tenta definido el Municipio de destino.\n"+
                      //"En el siguiente link puede consultar el nombre de los Municipios: https://docs.google.com/spreadsheets/d/1AwkvC905X-yddB_FB526e-_2f3CIOYdQF7TUfDYjvWk/edit#gid=1717145484";
                      $idDepartamentoRecibido = parseInt(req.body.Body);
                  
                      $formulario.pregunta += 1;
                      $formulario.id_departamento_destino_final = $idDepartamentoRecibido;
  
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `Escribe tu número de contacto en números 📞` ;
                      
                    } else {
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Cuál es tu destino final dentro de Colombia? Envía el número del Departamento correspondiente ó el número *1* en caso de que no tengas definido el Departamento de destino. 1: No sé 
                      2:	Antioquia
                      3:	Atlántico
                      4:	Bogotá D.C.
                      5:	Bolívar
                      6:	Boyaca
                      7:	Caldas
                      8:	Caqueta
                      9:	Cauca
                      10:	Cesar
                      11:	Córdoba
                      12:	Cundinamarca
                      13:	Choco
                      14:	Huila
                      15:	La Guajira
                      16:	Magdalena
                      17:	Meta
                      18:	Nariño
                      19:	Norte de Santander
                      20:	Quindio
                      21:	Risaralda
                      22:	Santander
                      23:	Sucre
                      24:	Tolima
                      25:	Valle del Cauca
                      26:	Arauca
                      27:	Casanare
                      28:	Putumayo
                      29:	San Andres
                      30:	Isla de Providencia y Santa Catalina
                      31:	Amazonas
                      32:	Guainia
                      33:	Guaviare
                      34:	Vaupes
                      35:	Vichada`;
                    }
  
                  } catch (error) {
                    //console.log('ERROR EN 28__ ', error);
                    $formulario.pregunta = 10; //vuelve a 11
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                    ¿Cuál es tu destino final dentro de Colombia? Envía el número del Departamento correspondiente ó el número *1* en caso de que no tengas definido el Departamento de destino. 1: No sé 
                    2:	Antioquia
                    3:	Atlántico
                    4:	Bogotá D.C.
                    5:	Bolívar
                    6:	Boyaca
                    7:	Caldas
                    8:	Caqueta
                    9:	Cauca
                    10:	Cesar
                    11:	Córdoba
                    12:	Cundinamarca
                    13:	Choco
                    14:	Huila
                    15:	La Guajira
                    16:	Magdalena
                    17:	Meta
                    18:	Nariño
                    19:	Norte de Santander
                    20:	Quindio
                    21:	Risaralda
                    22:	Santander
                    23:	Sucre
                    24:	Tolima
                    25:	Valle del Cauca
                    26:	Arauca
                    27:	Casanare
                    28:	Putumayo
                    29:	San Andres
                    30:	Isla de Providencia y Santa Catalina
                    31:	Amazonas
                    32:	Guainia
                    33:	Guaviare
                    34:	Vaupes
                    35:	Vichada`;
  
                  }
                break;

                case 11:
                  try {

                    const pattern = new RegExp('^[0-9]+$', 'i');

                    if(pattern.test(req.body.Body)){
                      $formulario.numero_contacto = req.body.Body;
                      $formulario.pregunta += 1; //va a 12
                      actualizarEncuesta($formulario);
                      mensajeRespuesta = `¿Este número de contacto fue entregado por el programa VenEsperanza? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;
                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                      Escribe tu número de contacto en números 📞` ;

                    }
                    
                  } catch (error) {
                    $formulario.pregunta = 11; //vuelve a 11
                      actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                      Escribe tu número de contacto en números 📞` ;
                  }
                
                break;

                case 12:
                  try {
                    
                    switch(req.body.Body){
                      case '1':
                        $formulario.numero_entregado_venesperanza = true;
                        $formulario.pregunta += 1; //Va a pregunta 13

                        actualizarEncuesta($formulario);
                        mensajeRespuesta = `¿Este número de contacto es tuyo? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;

                      break;

                      case '2':
                        $formulario.numero_entregado_venesperanza = false;
                        $formulario.pregunta += 1; //Va a pregunta 13

                        actualizarEncuesta($formulario);
                        mensajeRespuesta = `¿Este número de contacto es tuyo? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;
                        
                      break;

                      default:
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                        ¿Este número de contacto fue entregado por el programa VenEsperanza? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;
    
                      break;
                    }
                    
                  } catch (error) {
                    $formulario.pregunta = 12; //vuelve a 12
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                    ¿Este número de contacto fue entregado por el programa VenEsperanza? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;

                  }
                break;
                

                case 13:
                  try {
                    switch(req.body.Body){
                      case '1':
                        $formulario.linea_contacto_propia = true;
                        $formulario.pregunta += 1; //Va a pregunta 14
                        actualizarEncuesta($formulario);
                        mensajeRespuesta = `¿Este número de contacto tiene WhatsApp? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;
                      break;

                      case '2':
                        $formulario.linea_contacto_propia = false;
                        $formulario.pregunta += 1; //Va a pregunta 14
                        actualizarEncuesta($formulario);
                        mensajeRespuesta = `¿Este número de contacto tiene WhatsApp? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                        ¿Este número de contacto es tuyo? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`
                    
                      break;
                    }
                    
                  } catch (error) {
                    $formulario.pregunta = 13; //vuelve a 13
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                    ¿Este número de contacto es tuyo? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`
                    
                  }
                
                break;

                case 14:
                  try {
                    switch(req.body.Body){
                      case '1':
                        $formulario.linea_asociada_whatsapp = true;
                        $formulario.pregunta += 1; //Va a pregunta 15
                        actualizarEncuesta($formulario);
                        mensajeRespuesta = `¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar?  (si no tienes, ¡no te preocupes! escribe NO`;
                      break;

                      case '2':
                        $formulario.linea_asociada_whatsapp = false;
                        $formulario.pregunta += 1; //Va a pregunta 15
                        actualizarEncuesta($formulario);
                        mensajeRespuesta = `¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar?  (si no tienes, ¡no te preocupes! escribe NO`;
                      break;

                      default:
                        mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                     ¿Este número de contacto tiene WhatsApp? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;
                    
                    
                      break;
                    }
                    
                  } catch (error) {
                    $formulario.pregunta = 14; //vuelve a 14
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                    ¿Este número de contacto tiene WhatsApp? Responde con el número según la opción: 1️⃣ Sí 2️⃣ No`;
                    
                  }
                
                break;

                case 15:
                  try {

                    emailregex = /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i;
                    //console.log('TEST EMAIL:: ', emailregex.test(req.body.Body));
                    if(req.body.Body === 'NO'){
                      $formulario.pregunta += 1;
                      actualizarEncuesta($formulario);
                      conversation.tipo_formulario = null;
                      actualizarConversacion(conversation);
                      mensajeRespuesta = `¡Gracias por participar!
                      Si eres preseleccionado/a el programa #VenEsperanza se comunicará contigo
                      Recuerda:
                      En el programa #VenEsperanza no cobramos ni pedimos remuneración por ningún servicio a la comunidad, no tenemos intermediarios.
                      
                      Ahora por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
                      1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
                      2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
                      3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
                    

                    }else if(emailregex.test(req.body.Body)) {
                      //console.log('TEST SI');
                      $formulario.pregunta += 1;
                      $formulario.correo_electronico = req.body.Body;
                      actualizarEncuesta($formulario);
                      conversation.tipo_formulario = null;
                      //console.log('CONVERSACION ACTUALIZAR:: ', conversation);
                      actualizarConversacion(conversation);
                      mensajeRespuesta = `¡Gracias por participar!
                      Si eres preseleccionado/a el programa #VenEsperanza se comunicará contigo
                      Recuerda:
                      En el programa #VenEsperanza no cobramos ni pedimos remuneración por ningún servicio a la comunidad, no tenemos intermediarios.
                      
                      Ahora por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
                      1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
                      2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
                      3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
                    
                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                    ¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar?  (si no tienes, ¡no te preocupes! escribe NO`;

                    }
                    
                  } catch (error) {
                    $formulario.pregunta = 15; //vuelve a 15
                    actualizarEncuesta($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                    ¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar?  (si no tienes, ¡no te preocupes! escribe NO`;

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
      
                    switch (req.body.Body) {
                      case '1':
                        $formulario.tipo_documento = "Acta de Nacimiento";
                        $formulario.pregunta += 1;// pregunta 2
                        actualizarLlegada($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;


                        break;
                      case '2':
                        $formulario.tipo_documento = "Cédula de Identidad (venezonala)";

                        $formulario.pregunta += 1;// pregunta 2
                        actualizarLlegada($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '3':
                        $formulario.tipo_documento = "Cédula de ciudadania (colombiana)";

                        $formulario.pregunta += 1;// pregunta 2
                        actualizarLlegada($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '4':
                        $formulario.tipo_documento = "Pasaporte";

                        $formulario.pregunta += 1;// pregunta 2
                        actualizarLlegada($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '5':
                        $formulario.tipo_documento = "Cédula de Extranjería";

                        $formulario.pregunta += 1;// pregunta 2
                        actualizarLlegada($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '6':
                        $formulario.tipo_documento = "Indocumentado";

                        $formulario.pregunta += 1;// pregunta 2
                        actualizarLlegada($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;

                      break;

                      case '7':
                        $formulario.tipo_documento = "Otro";
                        $formulario.pregunta += 1;// pregunta 2
                        actualizarLlegada($formulario);
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
                          6️⃣ Indocumentado
                          7️⃣ Otro`;
                        break;
                    

                      }

                  } catch (error) {
                    $formulario.pregunta = 1; //vuelve a entrar a pregunta 1
                    actualizarLlegada($formulario);
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

              case 2: //guardo respuesta pregunta 2

                try {
                  $formulario.numero_documento = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\-\w]/gi, '');

                  const pattern = new RegExp('^[0-9]+$', 'i');

                  if(pattern.test($formulario.numero_documento)){
                    console.log('CUMPLE CON PATTERN EN REPORTELLEGADA');
                  //if($formulario.numero_documento.length>0){
                  
                    $formulario.pregunta += 1;// pregunta 3. 
                    //actualizarLlegada($formulario);

                    //consulta encuesta por waId, tipo_documento, numero_documento, entonces toma el id_encuesta y lo asigna a 
                    //llegada.
                    actualizarLlegadaEncuesta($formulario);
                    
                    mensajeRespuesta = `Escribe tu número de teléfono en números 📞` ;

                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                      Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;

                    }

                } catch (error) {
                  console.log('EL ERROR EN PASO 2 REPORTE LLEGADA: : ', error);
                    $formulario.pregunta = 2; //vuelve a entrar a paso 2
                    actualizarLlegada($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                    Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                }

              break;

              case 3:
                try {

                  const pattern = new RegExp('^[0-9]+$', 'i');

                  if(pattern.test(req.body.Body)){
                    $formulario.telefono = req.body.Body;
                    $formulario.pregunta += 1; //va a 4
                    actualizarLlegada($formulario);

                    mensajeRespuesta = `Envía el número del Departamento al que llegaste ó el número *1* en caso de que no sepas a qué Departamento llegaste. 1: No sé 
                          2:	Antioquia
                          3:	Atlántico
                          4:	Bogotá D.C.
                          5:	Bolívar
                          6:	Boyaca
                          7:	Caldas
                          8:	Caqueta
                          9:	Cauca
                          10:	Cesar
                          11:	Córdoba
                          12:	Cundinamarca
                          13:	Choco
                          14:	Huila
                          15:	La Guajira
                          16:	Magdalena
                          17:	Meta
                          18:	Nariño
                          19:	Norte de Santander
                          20:	Quindio
                          21:	Risaralda
                          22:	Santander
                          23:	Sucre
                          24:	Tolima
                          25:	Valle del Cauca
                          26:	Arauca
                          27:	Casanare
                          28:	Putumayo
                          29:	San Andres
                          30:	Isla de Providencia y Santa Catalina
                          31:	Amazonas
                          32:	Guainia
                          33:	Guaviare
                          34:	Vaupes
                          35:	Vichada`;
                  }else{
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                    Escribe tu número de teléfono en números 📞` ;

                  }
                  
                } catch (error) {
                  $formulario.pregunta = 3; //vuelve a 3
                    actualizarEncuesta($formulario);
                  mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                  Escribe tu número de teléfono en números 📞` ;
                }
              break;

              case 4:
                try {

                  //console.log('LO QUE HAY EN BODY 28: ', req.body.Body);
                  const opcionesDepartamento = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16',
                    '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'];

                  if (req.body.Body === '1') {
                    //$formulario.pregunta += 1; //va a pregunta 5
                    $formulario.id_departamento = null;
                    //$formulario.id_municipio_destino_final = null;
                    actualizarLlegada($formulario);

                    conversation.tipo_formulario = null;
                    actualizarConversacion(conversation);

                    mensajeRespuesta = `Gracias por informar de tu llegada a destino!
                    Ahora por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
                    1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
                    2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
                    3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;


                  } else if (opcionesDepartamento.includes(req.body.Body)) {
                    //conversation.pregunta += 1; //va a pregunta 29
                    //conversation.id_departamento_destino_final =  parseInt(req.body.Body);
                    //crearEncuesta(conversation);
                    //mensajeRespuesta = "Escriba en mayúscula el nombre del Municipio ó la palabra *NO SE* en caso de que no tenta definido el Municipio de destino.\n"+
                    //"En el siguiente link puede consultar el nombre de los Municipios: https://docs.google.com/spreadsheets/d/1AwkvC905X-yddB_FB526e-_2f3CIOYdQF7TUfDYjvWk/edit#gid=1717145484";
                    $idDepartamentoRecibido = parseInt(req.body.Body);
                
                    $formulario.pregunta += 1;
                    $formulario.id_departamento = $idDepartamentoRecibido;

                    actualizarLlegada($formulario);
                    mensajeRespuesta = `Envía el Municipio ` ;
                    
                  } else {
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
¿Cuál es tu destino final dentro de Colombia? Envía el número del Departamento correspondiente ó el número *1* en caso de que no tengas definido el Departamento de destino. 1: No sé 
                    2:	Antioquia
                    3:	Atlántico
                    4:	Bogotá D.C.
                    5:	Bolívar
                    6:	Boyaca
                    7:	Caldas
                    8:	Caqueta
                    9:	Cauca
                    10:	Cesar
                    11:	Córdoba
                    12:	Cundinamarca
                    13:	Choco
                    14:	Huila
                    15:	La Guajira
                    16:	Magdalena
                    17:	Meta
                    18:	Nariño
                    19:	Norte de Santander
                    20:	Quindio
                    21:	Risaralda
                    22:	Santander
                    23:	Sucre
                    24:	Tolima
                    25:	Valle del Cauca
                    26:	Arauca
                    27:	Casanare
                    28:	Putumayo
                    29:	San Andres
                    30:	Isla de Providencia y Santa Catalina
                    31:	Amazonas
                    32:	Guainia
                    33:	Guaviare
                    34:	Vaupes
                    35:	Vichada`;
                  }

                } catch (error) {
                  //console.log('ERROR EN 28__ ', error);
                  $formulario.pregunta = 10; //vuelve a 11
                  actualizarEncuesta($formulario);
                  mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                  ¿Cuál es tu destino final dentro de Colombia? Envía el número del Departamento correspondiente ó el número *1* en caso de que no tengas definido el Departamento de destino. 1: No sé 
                  2:	Antioquia
                  3:	Atlántico
                  4:	Bogotá D.C.
                  5:	Bolívar
                  6:	Boyaca
                  7:	Caldas
                  8:	Caqueta
                  9:	Cauca
                  10:	Cesar
                  11:	Córdoba
                  12:	Cundinamarca
                  13:	Choco
                  14:	Huila
                  15:	La Guajira
                  16:	Magdalena
                  17:	Meta
                  18:	Nariño
                  19:	Norte de Santander
                  20:	Quindio
                  21:	Risaralda
                  22:	Santander
                  23:	Sucre
                  24:	Tolima
                  25:	Valle del Cauca
                  26:	Arauca
                  27:	Casanare
                  28:	Putumayo
                  29:	San Andres
                  30:	Isla de Providencia y Santa Catalina
                  31:	Amazonas
                  32:	Guainia
                  33:	Guaviare
                  34:	Vaupes
                  35:	Vichada`;

                }
              break;

              
              case 5:
                try{
                  mensajeRespuesta = `Ya reportaste tu llegada a destino Gracias!`;
                }catch{

                }
              break;

              default:
              break;
            }

          }else if(conversation.tipo_formulario == 3){
            //$formulario es actualizar datos
            switch ($formulario.pregunta) {

              //selecciona actualizar datos
              case 1: //guardo respuesta pregunta 1
                  try {
      
                    switch (req.body.Body) {
                      case '1':
                        $formulario.tipo_documento = "Acta de Nacimiento";
                        $formulario.pregunta += 1;// pregunta 2
                        actualizarDatosContacto($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;


                        break;
                      case '2':
                        $formulario.tipo_documento = "Cédula de Identidad (venezonala)";

                        $formulario.pregunta += 1;// pregunta 2
                        actualizarDatosContacto($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '3':
                        $formulario.tipo_documento = "Cédula de ciudadania (colombiana)";

                        $formulario.pregunta += 1;// pregunta 2
                        actualizarDatosContacto($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '4':
                        $formulario.tipo_documento = "Pasaporte";

                        $formulario.pregunta += 1;// pregunta 2
                        actualizarDatosContacto($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '5':
                        $formulario.tipo_documento = "Cédula de Extranjería";

                        $formulario.pregunta += 1;// pregunta 2
                        actualizarDatosContacto($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                        break;

                      case '6':
                        $formulario.tipo_documento = "Indocumentado";

                        $formulario.pregunta += 1;// pregunta 2
                        actualizarDatosContacto($formulario);
                        mensajeRespuesta = `Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;

                      break;

                      case '7':
                        $formulario.tipo_documento = "Otro";
                        $formulario.pregunta += 1;// pregunta 2
                        actualizarDatosContacto($formulario);
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
                          6️⃣ Indocumentado
                          7️⃣ Otro`;
                        break;
                    

                      }

                  } catch (error) {
                    $formulario.pregunta = 1; //vuelve a entrar a pregunta 1
                    actualizarDatosContacto($formulario);
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

              case 2: //guardo respuesta pregunta 2

                try {
                  $formulario.numero_documento = req.body.Body;//.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\-\w]/gi, '');

                  const pattern = new RegExp('^[0-9]+$', 'i');

                  if(pattern.test($formulario.numero_documento)){
                    console.log('CUMPLE CON PATTERN EN REPORTELLEGADA');
                  //if($formulario.numero_documento.length>0){
                  
                    $formulario.pregunta += 1;// pregunta 3. 
                    //actualizarLlegada($formulario);

                    //consulta encuesta por waId, tipo_documento, numero_documento, entonces toma el id_encuesta y lo asigna a 
                    //llegada.
                    actualizarDatosContactoEncuesta($formulario);
                    
                    mensajeRespuesta = `Escribe tu número de teléfono en números 📞` ;

                    }else{
                      mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                      Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;

                    }

                } catch (error) {
                  console.log('EL ERROR EN PASO 2 REPORTE LLEGADA: : ', error);
                    $formulario.pregunta = 2; //vuelve a entrar a paso 2
                    actualizarDatosContacto($formulario);
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                    Escribe por favor tu número de documento 📇 (no utilices símbolos, solo números) Ejemplo: 123456789`;
                }

              break;

              case 3:
                try {

                  const pattern = new RegExp('^[0-9]+$', 'i');

                  if(pattern.test(req.body.Body)){
                    $formulario.telefono = req.body.Body;
                    $formulario.pregunta += 1; //va a 4
                    actualizarDatosContacto($formulario);

                    mensajeRespuesta = `¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar?  (si no tienes, ¡no te preocupes! escribe NO`;
                  }else{
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                    Escribe tu número de teléfono en números 📞` ;

                  }
                  
                } catch (error) {
                  $formulario.pregunta = 3; //vuelve a 3
                  actualizarDatosContacto($formulario);
                  mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.\n
                  Escribe tu número de teléfono en números 📞` ;
                }
              
              break;

              case 4:
                try {

                  emailregex = /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i;
                  //console.log('TEST EMAIL:: ', emailregex.test(req.body.Body));
                  if(req.body.Body === 'NO'){
                    $formulario.pregunta = null;
                    actualizarDatosContacto($formulario);
                    conversation.tipo_formulario = null;
                    actualizarConversacion(conversation);
                    mensajeRespuesta = `¡Gracias por actualizar tus Datos!
                    Ahora por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
                    1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
                    2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
                    3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
                  

                  }else if(emailregex.test(req.body.Body)) {
                    //console.log('TEST SI');
                    $formulario.pregunta = null;
                    
                    $formulario.correo_electronico = req.body.Body;
                    console.log('correo a guardar: ', $formulario.correo_electronico);
                    actualizarDatosContacto($formulario);
                    conversation.tipo_formulario = null;
                    //console.log('CONVERSACION ACTUALIZAR:: ', conversation);
                    actualizarConversacion(conversation);
                    mensajeRespuesta = `¡Gracias por actualizar tus datos!
                    Por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
                    1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
                    2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
                    3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `;
                  
                  }else{
                    mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                  ¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar?  (si no tienes, ¡no te preocupes! escribe NO`;

                  }
                  
                } catch (error) {
                  $formulario.pregunta = 4; //vuelve a 4
                  actualizarDatosContacto($formulario);
                  mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
                  ¿Podrías compartirme un correo electrónico 📧 en el que te podamos contactar?  (si no tienes, ¡no te preocupes! escribe NO`;

                }

              default:
                break;
              }


            
          }

        }else{
          switch (req.body.Body) {

              //selecciona llenar nuevo form
              case '1':

                try {
                  //crea nuevo encuesta
                  $conversation.tipo_formulario = 1;
                  actualizarConversacion($conversation);
                  crearEncuesta($conversation);
                  mensajeRespuesta = 'Empieza Llenar nuevo formulario';
                  
                } catch (error) {
                  
                }
              break;
              
              case '2':
                //crea actualizar datos
                  $conversation.tipo_formulario = 2;
                  actualizarConversacion($conversation);
                  //crearActualizarDatos($conversation);
                  mensajeRespuesta = 'Empieza Actualizar Datos';
              break;

              case '3':
                //crea reporte llegada
                  $conversation.tipo_formulario = 3;
                  actualizarConversacion($conversation);
                  //crearReporteLlegada($conversation);
                  mensajeRespuesta = 'Empieza Actualizar Datos';
              break;

            default:
              mensajeRespuesta = `Ahora por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
              1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
              2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
              3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `
            break;
          }
        }
      }else{
        try {
          
          switch(req.body.message.content.text){
          
            case '1':
              conversation.autorizacion = true;
              actualizarConversacion(conversation);
              autorizacionTratamientoDatos(conversation);

              mensajeRespuesta = `Ahora por favor respóndeme con el número correspondiente a lo que quieres hacer:\n
              1️⃣ Quieres diligenciar el formulario de registro ✍🏻\n
              2️⃣ Quieres informar de tu llegada a destino ☝🏻\n
              3️⃣ Ya te registraste antes y quieres actualizar tus datos de contacto  🙌🏻 `
            break;
  
            case '2':
              mensajeRespuesta = `¡Gracias por contactarnos! 👋🏻`;
            break;
  
            default:
              mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
              Para iniciar este chat 💬 debes autorizar el uso de tus datos. ✅ 
              Responde:
              1️⃣ Si, para aceptar los términos y condiciones del programa #VenEsperanza
              2️⃣ No, no autorizo`;
            break;
          }

          
        } catch (error) {
          mensajeRespuesta = `Gracias 🙂, ten presente que no puedo reconocer imágenes, audios, ni emojis. Nos podemos comunicar por medio de texto o digitando el número de las opciones que te indico en mi pregunta.
          Para iniciar este chat 💬 debes autorizar el uso de tus datos. ✅ 
          Responde:
          1️⃣ Si, para aceptar los términos y condiciones del programa #VenEsperanza
          2️⃣ No, no autorizo`;
        }
      }
    }else {

      try {
        conversation.conversation_start = true;
        //console.log('IDNECUESTA: ', idencuesta);             
        //crearEncuesta(conversation);
        //console.log('CONVERSATION EN START FALSE:', conversation);
        actualizarConversacion(conversation);
        mensajeRespuesta = `Hola, soy Esperanza 👩🏻, la asistente virtual del programa VenEsperanza. ¡Es un gusto  atenderte! 😊
        Tus datos personales recolectados serán tratados para gestionar nuestros servicios 🤝, conoce nuestra Política de Tratamiento de Datos 🗒️ en este enlace https://bit.ly/3uftBaQ en el que encontrarás tus derechos.
        Para iniciar este chat 💬 debes autorizar el uso de tus datos. ✅ 
        Responde:
        1️⃣ Si, para aceptar los términos y condiciones del programa #VenEsperanza
        2️⃣ No, no autorizo`;


      } catch (error) {
        //console.log('ERROR::', error);
        mensajeRespuesta = `Disculpe tenemos problemas con el sistema. Intente nuevamente!`;
      }

    }
    /*client.messages
      .create({
        //from: 'whatsapp:+14155238886',
        from: 'whatsapp:'+process.env.TWILIO_WHATSAPP,
        body: mensajeRespuesta,
        to: req.body.From
      })
      .then(message => console.log(message.body))
      .catch(e => { console.error('Got an error:', e.code, e.message); });*/
      

      //NUEVO MESASGE BIRD
      //LO QUE VOY A RESPONDER::
      console.log('TO::: ', '+'+req.body.contact.msisdn);
      console.log('CHANNELID:: ', req.body.message.channelId);
      console.log('CONTENT TEXT:: ', mensajeRespuesta);
      console.log('CONVERSATION ID:: ', req.body.conversation.id)
    
      /*
      messagebird.conversations.reply(req.body.conversation.id,
        {
          type: 'text',
          content: {
            text: mensajeRespuesta,
          },
        },
        function(err, response) {
          if (err) {
            return console.log(err);
          }
          console.log(response);
        },
      );*/
        var toNumber = '+'+req.body.contact.msisdn;

        /*
        messagebird.conversations.start({
          'to': req.body.contact.msisdn,
          'channelId': req.body.message.channelId,
          'type': 'hsm',
          'type':'text',
            'content': {
              'text': mensajeRespuesta,
              'hsm': {
                'namespace': '5f62b497_b385_47b5_956e_b86523ea56dd',
                'templateName': 'support',
                'language': {
                  'policy': 'deterministic',
                  'code': 'en'
                },
                'params': [
                  {"default": "Roberto"},
                  {"default": "123"},
                  {"default": "new coffee machine"},
                  {"default": "MessageBird, Trompenburgstraat 2C, 1079TX Amsterdam"}
                ]
              }
            }
          }, function (err, response) {
            if (err) {
              return console.log(err);
            }
            console.log(response);
          });*/
      
      
      var params = {
        'to':  '+573229562177',
        'type': 'text',
        'from': '3fb8e8175c8d4220b5b38224631fb0c1',
        'content': {
                'text': mensajeRespuesta,
              }
      }

      messagebird.conversations.send(params, function (err, response) {
        if (err) {
        return console.log(err);
        }
        console.log(response);
      });
    
      /*
      messagebird.conversations.start({
        'to': '573229562177',
        'channelId': '3fb8e8175c8d4220b5b38224631fb0c1' ,
        'type': 'text',
        'content': { 'text': mensajeRespuesta }
      }, function (err, response) {
        if (err) {
          return console.log(err);
        }
        console.log(response);
      });
      */

      /*
      

      messagebird.conversations.reply('d9d8a497b6ff4f4498bc9503aaae3886',{
        //'to': '573229562177',
        //'channelId': '3fb8e8175c8d4220b5b38224631fb0c1' ,
        'type': 'text',
        'content': { 'text': mensajeRespuesta }
      }, function (err, response) {
        if (err) {
          return console.log(err);
        }
        console.log(response);
      });*/
  }


});

connection.connect(error => {
  if (error) throw error;
  console.log('Database server running OK');
});

//puerto de despliegue
//app.listen(3000, function () {
app.listen(process.env.APP_PORT, function(){
  console.log('Example app listening on port '+process.env.APP_PORT+'!');
  //console.log('Example app listening on port 3000!');
});