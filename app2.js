const express = require('express');
const bodyParser = require('body-parser');
const nodemon = require('nodemon');
const moment = require('moment');
const mysql = require('mysql');
const { defaultWorkerPolicies } = require('twilio/lib/jwt/taskrouter/util');

const app = express();

app.use(bodyParser.urlencoded({
  extended:true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

const TWILIO_ID = 'ACb4ee49c4ecdf005c1ef4b63215c71b15'
const TWILIO_SK = '9bcfbaf8c33f103cb8e63d9c4ffb1eca'

const client = require('twilio')(TWILIO_ID, TWILIO_SK);

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'chatBotWhatsapp1',
  port: '8889'
});

  $preguntaEncuesta = 0;
  $miembrosFamilia = 0;

app.post('/whatsapp', async (req, res) => {
 
  console.log('TODA INFO: ',req.body);


  consultaConversacion(req.body.WaId);
    

  function consultaConversacion(whatsappID){ 

    const sql = `SELECT * FROM encuesta where waId = '${whatsappID}'`;

    
  connection.query(sql, (error,results)=>{

      if (error) throw error;

      if (results.length > 0){

        console.log('CONVERSACION EXISTE: ', results[0]);
        var $conversation = results[0];

        conversacion($conversation);
      }else{
        console.log('CONVERSACION NO EXISTE: ');
        //console.log('RESULTS QUERY SELECT: ', results);
        nuevaConversacion();

      }
    });
  }

  function nuevaConversacion(){
    const sqlnuevo = 'INSERT INTO encuesta SET ?';

    console.log('PARAMS NUEVA CONVERSA: ', req.body);
    const params = req.body;
    //console.log('PARAMS SON: ', params);
    
    const nuevaconversacion = {
      waId: params.WaId,
      profileName: params.ProfileName,
      conversation_start: false,
      //encuesta: true,
      encuesta_chatbot: false,
      //actualizar: false,
      //reportar: false 
      paso: null,
      pregunta: null,
      fuente: 1
    }

    connection.query(sqlnuevo, nuevaconversacion, (error,results)=>{
      if (error) throw error;

      console.log('RESULTS QUERY NUEVO: ', results);
      //conversacion(nuevaconversacion,results.insertId);
      consultaConversacion(nuevaconversacion.waId);

    });
  }

  function consultarMiembroHogar($numero_miembro_hogar, $conversacion_id, call_back){
    const sqlConsultaMiembro = `SELECT * FROM miembros_hogar where id_encuesta = ${$conversacion_id} AND numero_miembro = ${$numero_miembro_hogar} `;

    
    connection.query(sqlConsultaMiembro, (error,results)=>{

        console.log('ERROR EN LLAMADOA  BD MIEMBRO: ', error);

        if (error) return call_back(error);

        if (results.length > 0){

          console.log('MIEMRO EXISTE: ', results[0]);
          var $miembro = results[0];

          return call_back($miembro)
          //conversacion($conversation);
        }else{
          console.log('MIEMBRO NO EXISTE: ');
          //console.log('RESULTS QUERY SELECT: ', results);
          return call_back(error)
        }
      });
  }

  /*
  function asignarCoordenadas($editconversacion){
    const sql = `UPDATE conversacion SET longitud = '${$editconversacion.longitud}', latitud = '${$editconversacion.latitud}' where id = ${$editconversacion.id}`;

   connection.query(sql, (error,res)=>{
    if (error) throw error;

    });

  }*/
  
  function autorizacionTratamientoDatos($conversa){

    const sqlAutorizacion = 'INSERT INTO autorizaciones SET ?';

    console.log('NUEVA AUTORIZACION: ', $conversa);
   
    //console.log('PARAMS SON: ', params);
    
    const nuevaAutorizacion = {
      id_encuesta: $conversa.id,
      tratamiento_datos : true,
      terminos_condiciones : true,
      condiciones : true
    }

    connection.query(sqlAutorizacion, nuevaAutorizacion, (error,results)=>{
      if (error) throw error;

      console.log('RESULTS QUERY NUEVO: ', results);
      //conversacion(nuevaconversacion,results.insertId);
      //return callback(true);
      

    });
  }

  function autorizacionAsignarCoordenadasUbicacion($longitud, $latitud, $conversacion){
    const sqlUpdateAutorizacionCoordenadas = `UPDATE autorizaciones SET longitud = ${$longitud}, latitud = ${$latitud}
     WHERE id_encuesta =  ${$conversacion}`;

    connection.query(sqlUpdateAutorizacionCoordenadas, (error,res)=>{
      if (error) throw error;
  
      //return callback(true);
  
      });

  }

  function eliminarAutorizacion($conversa){
    const sqlEliminarAutorizacion = `DELETE autorizaciones WHERE id_encuesta = ${$conversa.id_encuesta}`;
    
    connection.query(sqlEliminarAutorizacion, (error,results)=>{
      if (error) throw error;

      console.log('RESULTS QUERY NUEVO: ', results);
      //conversacion(nuevaconversacion,results.insertId);
      

    });

  }

  function crearEncuesta($conversa){
    console.log('CONVERSA EN CREAR ENCUESTA: ', $conversa);

  
    const sqlCreaEncuesta = `UPDATE encuesta SET conversation_start = ${$conversa.conversation_start}, 
    encuesta_chatbot = ${$conversa.encuesta_chatbot}, paso = ${$conversa.paso}, pregunta = ${$conversa.pregunta},
    primer_nombre = '${$conversa.primer_nombre}', segundo_nombre = '${$conversa.segundo_nombre}', primer_apellido = '${$conversa.primer_apellido}', segundo_apellido = '${$conversa.segundo_apellido}',
    sexo = '${$conversa.sexo}', fecha_nacimiento = '${$conversa.fecha_nacimiento}', codigo_encuesta = '${$conversa.codigo_encuesta}',
    nacionalidad = '${$conversa.nacionalidad}', cual_otro_nacionalidad = '${$conversa.cual_otro_nacionalidad}', tipo_documento = '${$conversa.tipo_documento}',
    cual_otro_tipo_documento = '${$conversa.cual_otro_tipo_documento}', numero_documento = '${$conversa.numero_documento}',
    compartir_foto_documento_encuestado = ${$conversa.compartir_foto_documento_encuestado}, url_foto_documento_encuestado = '${$conversa.url_foto_documento_encuestado}',
    como_llego_al_formulario = '${$conversa.como_llego_al_formulario}', donde_encontro_formulario = '${$conversa.donde_encontro_formulario}', fecha_llegada = '${$conversa.fecha_llegada}',
    estar_dentro_colombia = ${$conversa.estar_dentro_colombia}, id_departamento_destino_final = ${$conversa.id_departamento_destino_final},
    id_municipio_destino_final = ${$conversa.id_municipio_destino_final},
     razon_elegir_destino_final = '${$conversa.razon_elegir_destino_final}', otra_razon_elegir_destino_final = '${$conversa.otra_razon_elegir_destino_final}',
     recibe_transporte_humanitario = '${$conversa.recibe_transporte_humanitario}',
     pais_destino_fuera_colombia = '${$conversa.pais_destino_fuera_colombia}',
     total_miembros_hogar = ${$conversa.total_miembros_hogar}, miembro_hogar_preguntando = ${$conversa.miembro_hogar_preguntando},
     ubicacion = '${$conversa.ubicacion}', numero_entregado_venesperanza = ${$conversa.numero_entregado_venesperanza},
     numero_contacto = '${$conversa.numero_contacto}', linea_contacto_propia = ${$conversa.linea_contacto_propia},
     linea_asociada_whatsapp = ${$conversa.linea_asociada_whatsapp}, numero_whatsapp_principal = '${$conversa.numero_whatsapp_principal}',
     numero_alternativo = '${$conversa.numero_alternativo}', linea_contacto_alternativo = ${$conversa.linea_contacto_alternativo},
     linea_alternativa_asociada_whatsapp = ${$conversa.linea_alternativa_asociada_whatsapp}, correo_electronico = '${$conversa.correo_electronico}',
     tiene_cuenta_facebook = ${$conversa.tiene_cuenta_facebook}, cuenta_facebook = '${$conversa.cuenta_facebook}',
     podemos_contactarte = ${$conversa.podemos_contactarte}, forma_contactarte = '${$conversa.forma_contactarte}',
     otra_forma_contactarte = '${$conversa.otra_forma_contactarte}', comentario = '${$conversa.comentario}'
     where id = ${$conversa.id}`;

   connection.query(sqlCreaEncuesta, (error,res)=>{
    if (error) throw error;

    //return callback(true);

    });
  }

  function guardarInfoMiembro($valor, $campo, $numero_miembro, $id_encuesta){

    if($campo == 'primer_nombre_miembro'){
      const sqlNuevoMiembro = `INSERT INTO miembros_hogar (id, numero_miembro, id_encuesta, primer_nombre_miembro) VALUES 
      (NULL, ${$numero_miembro}, ${$id_encuesta}, '${$valor}')`;

      connection.query(sqlNuevoMiembro, (error,res)=>{
        if (error) throw error;
    
        });

    }else{

      
      //console.log('DATOS ACTUALIZAR MIEMBRO :');
      //console.log('CAMPO: ', $campo);
      //console.log('VALOR: ', $valor);
      //console.log('ID ENCUESTA: ', $id_encuesta);
      //console.log('NUMERO MIEMBRO: ', $numero_miembro);
      const sqlUpdateMiembro = `UPDATE miembros_hogar SET ${$campo} = '${$valor}' WHERE id_encuesta = ${$id_encuesta} AND numero_miembro = ${$numero_miembro} `
      connection.query(sqlUpdateMiembro, (error,res)=>{
        if (error) throw error;
    
        });

    }
    

  }

  /*
  function is_in_polygon($points_polygon, $vertices_x, $vertices_y, $latitude_y, $longitude_x)
    {
        $i = $j = $c = $point = 0;
        for ($i = 0, $j = $points_polygon; $i < $points_polygon; $j = $i++) {
            $point = $i;
            if ($point == $points_polygon)
                $point = 0;
            if ((($vertices_y[$point] > $latitude_y != ($vertices_y[$j] > $latitude_y)) && ($longitude_x < ($vertices_x[$j] - $vertices_x[$point]) * ($latitude_y - $vertices_y[$point]) / ($vertices_y[$j] - $vertices_y[$point]) + $vertices_x[$point])))
                $c = !$c;
        }
        //console.log('EN FUNCION POLIGONO: ', $c);
        return $c;
    }*/


  function conversacion(conversation, idencuesta){

    mensajeRespuesta = '';

    if(conversation.conversation_start == true){

      console.log('ENTRA A cONVERSATION START == TRUE');

      if(conversation.encuesta_chatbot == true){

        if(conversation.pregunta == null ){
          switch(req.body.Body){

            case '1':

              try {
                autorizacionTratamientoDatos(conversation);
                conversation.pregunta = 11;
                    conversation.paso = 1;
                crearEncuesta(conversation);
                mensajeRespuesta = "*PASO 1 - DATOS DEL ENCUESTADO, DATOS DE LLEGADA Y DESTINO:* \n\n"+
                                            "*Primer Nombre:*";
              } catch (error) {
                      conversation.pregunta = null;
                        conversation.paso = null;
                        crearEncuesta(conversation);
                        eliminarAutorizacion(conversation);
                        mensajeRespuesta =  'Envía el número *1* sí:\n'+
                        '- Aceptas el tratamiento de tus datos personales al programa #VenEsperanza, como responsable de tu información y para autorizar el tratamiento de tus datos personales, conforme a lo informado previamente.\n'+
                        '- Entiendes y aceptas los términos y condiciones establecidos para participar en el programa.\n\n'+
                        'Envía el número *2* sí NO estás de acuerdo';
              }
                
                break;

            case '2':
                //Rechazaron
                conversation.encuesta_chatbot = false;
                //conversation.conversation_start = false;
                mensajeRespuesta = 'Gracias por participar';
                crearEncuesta(conversation);

                break;

            default:

              mensajeRespuesta =  'Envía el número *1* sí:\n'+
              '- Aceptas el tratamiento de tus datos personales al programa #VenEsperanza, como responsable de tu información y para autorizar el tratamiento de tus datos personales, conforme a lo informado previamente.\n'+
              '- Entiendes y aceptas los términos y condiciones establecidos para participar en el programa.\n\n'+
              'Envía el número *2* sí NO estás de acuerdo';
          }

        }else if(conversation.pregunta <= 64){  //limite de preguntas
          //Entra a preguntar cuando el numero de la pregunta sea menor que el numero de la ultima pregunta del formulario.
          //cuando llega a la ultima pregunta ya no puede volver a preguntar y encuesta se hace false.

          switch(conversation.pregunta){
            case 11:
                console.log('RESPUESTA PREGUNTA 1: ', req.body.Body);

                try {
                  conversation.primer_nombre = req.body.Body;
                  conversation.pregunta += 1; //pregunta 12
                  
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Segundo Nombre:* "+
                  "(En caso de que no tenga envíe un '.' (punto))";
                  
                } catch (error) {
                  conversation.pregunta = 11;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Primer Nombre*";
                }
                
              
              break;

            case 12:

                try {
                  conversation.segundo_nombre = req.body.Body;
                  conversation.pregunta += 1; //pregunta 13
                  
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Primer Apellido:* ";
                  
                } catch (error) {
                  conversation.pregunta = 12; //vuelve a entrar a paso 12
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Segundo Nombre:* "+
                  "(En caso de que no tenga envíe un '.' (punto))";
                }
            break;

            case 13:

                try {
                  conversation.primer_apellido = req.body.Body;
                  conversation.pregunta += 1; //pregunta 14
                  
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Segundo Apellido:* "+
                  "(En caso de que no tenga envíe un '.' (punto))";
                  
                } catch (error) {
                  conversation.pregunta = 13; //vuelve a entrar a paso 13
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Primer Apellido:* "+
                  "(En caso de que no tenga envíe un '.' (punto))";
                }
            break;

            case 14:

                try {
                  console.log('PREGUNTA 14, BODY: ', req.body.Body);
                  conversation.segundo_apellido = req.body.Body;
                  conversation.pregunta += 1; //pregunta 15
                  
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Sexo:* "+
                  "Envía el número correspondiente a la opción\n"+
                  "*1*: Mujer\n"+
                  "*2*: Hombre";
                  
                } catch (error) {
                  conversation.pregunta = 14; //vuelve a entrar a paso 14
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Segundo Apellido:* "+
                  "(En caso de que no tenga envíe un '.' (punto))";
                }
            break;

            case 15:

                try {

                  switch(req.body.Body){
                    case '1':
                      conversation.sexo = 'mujer';
                      conversation.pregunta += 1; //pregunta 16
                      crearEncuesta(conversation);
                      mensajeRespuesta = "*Fecha de Nacimiento:* Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                      break;
                    
                    case '2':
                      conversation.sexo = 'hombre';
                      conversation.pregunta += 1; //pregunta 16
                      crearEncuesta(conversation);
                      mensajeRespuesta = "*Fecha de Nacimiento:* Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                      break;
                    
                    default:
                      mensajeRespuesta = "*Sexo:* "+
                      "Envía el número correspondiente a la opción\n"+
                      "*1*: Mujer\n"+
                      "*2*: Hombre";
                    break;
                  }
                
                  
                } catch (error) {
                  conversation.pregunta = 15; //vuelve a entrar a paso 15
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Sexo:* "+
                  "Envía el número correspondiente a la opción\n"+
                  "*1*: Mujer\n"+
                  "*2*: Hombre";
                }
            break;

            case 16:
                
                try {
                      $fechavalidar = req.body.Body.split('-');
                      if($fechavalidar.length === 3 && $fechavalidar[0].length === 4 && $fechavalidar[1].length === 2 && $fechavalidar[2].length === 2){
                          
                        $validarAño = parseInt($fechavalidar[0]); //Año
                        $validarMes = parseInt($fechavalidar[1]); //Mes
                        $validarDia = parseInt($fechavalidar[2]); //dia
                        
      
                        $fechaActual = new Date();
                        $añoActual = $fechaActual.getFullYear(); //Año actual
                        $añoActualInteger = parseInt($añoActual);

                        //console.log('AÑO ACTUAL: ', $añoActualInteger);
                        
                        //Valido si el valor de dia es mayor que 0 hasta 31
                        //valido si mes es mayor que 0 hasta 12
                        //Valido si año es mayor que 1920 y menor o igual a 2003
                        //Debe ser mas inteligente para que haya un año limite y minimo
                        if(($validarDia > 0 && $validarDia <=31) && ($validarMes > 0 && $validarMes <= 12) && ($validarAño >= 1920 && $validarAño <= 2003 )){
                          //console.log('FECHA VALIDA!!');
                          //console.log('TAMAÑO SI ES TRES: ', $fechavalidar.length);
                          conversation.pregunta += 1; //va a pregunta 17
                          conversation.fecha_nacimiento = $fechavalidar[0]+'-'+$fechavalidar[1]+'-'+$fechavalidar[2];

                          //console.log('CONVERSATION FECHA NACIMIENTO: ', conversation.fecha_nacimiento);

                           //codigo_encuesta
                           $nombreinicial = conversation.primer_nombre.substring(0, 2); //toma 2 primeras letras de primer nombre
                           $nombreinicial = $nombreinicial.toLocaleUpperCase(); //lo vuelve mayuscula
                          //console.log('NOMBRE INICIAL: ', $nombreinicial);

                          //reemplaza tildes para el nombre
                          $nombreiniciales = $nombreinicial.replace("Á","A").replace("É","E").replace("Í","I").replace("Ó","O").replace("Ú","U").replace("Ñ","N").replace('Ü','U');
                      


                          $apellidoinicial = conversation.primer_apellido.substring(0, 2); //toma 2 primeras letras de primer apellido
                          $apellidoinicial = $apellidoinicial.toLocaleUpperCase(); //vuelve mayuscula

                          //reemplaza tildes para apellido
                          $apellidoiniciales = $apellidoinicial.replace("Á","A").replace("É","E").replace("Í","I").replace("Ó","O").replace("Ú","U").replace("Ñ","N").replace('Ü','U');
                    
                        
                          $fecha1900 = new Date('1900-01-01'); //fecha referente para calcular dias
                          //console.log('FECHA 1900', $fecha1900);

                          $fecha2 = new Date(conversation.fecha_nacimiento);

                          $diff= $fecha2.getTime()-$fecha1900.getTime(); //diferencia entre fecha nacimiento y inicial de sistemas
                          $contdiasCalculo = Math.round($diff/(1000*60*60*24)); //calculo dias

                          $contdias = $contdiasCalculo + 2; //suma 2 para adaptarlo a formato EXCEL
    
                          //console.log('DIFERENCIA: ', $diff);
                          //console.log('DIF DIAS: ', $contdiasCalculo);
                          //console.log('DIF DIAS EXACTO EXCEL: ', $contdias);

                          $diferenciaDias = $contdias;

                          $sexoinicial = conversation.sexo.substring(0, 1); //primera letra sexo
                          $sexoinicial = $sexoinicial.toLocaleUpperCase(); //sexo mayuscula

                          conversation.codigo_encuesta = $nombreiniciales+$apellidoiniciales+$diferenciaDias+$sexoinicial; //concateno para formar codigo_encuesta
                          crearEncuesta(conversation);
                           
                          mensajeRespuesta = "*Nacionalidad*. Envía el número de acuerdo a la opción correspondiente:\n"+
                          
                          "*1*: Colombiana\n"+
                          "*2*: Venezolana\n"+
                          "*3*: Colombo-venezolana\n"+
                          "*4*: Otro";

                          
                        }else{
                          mensajeRespuesta = "*Fecha de Nacimiento:* Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";
      
                        }
      
                      }else{
                        mensajeRespuesta = "*Fecha de Nacimiento:* Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";
      
                      }
                  
                } catch (error) {
                  conversation.pregunta = 16; //vuelve a entrar a paso 16
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Fecha de Nacimiento:* Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                }
                 
              break;
            
            case 17:

                try {

                  switch(req.body.Body){

                    case '4':
                      conversation.nacionalidad = "Otro";
                      conversation.pregunta += 1; //va a pregunta 18
                      crearEncuesta(conversation);

                      mensajeRespuesta = "¿Cuál? (Indicar nacionalidad, ejemplo: Peruana)";
                    
                    break;

                    case '1':
                      conversation.nacionalidad = "Colombiana";
                      conversation.pregunta += 2; //va a pregunta 19
                      crearEncuesta(conversation);
                      mensajeRespuesta = "*Tipo de Documento*. "+
                      "Envía el número de acuerdo a la opción correspondiente:\n"+
                      "*1*: Acta de Nacimiento\n"+
                      "*2*: Cédula de Identidad (venezonala)\n"+
                      "*3*: Cédula de ciudadania (colombiana)\n"+
                      "*4*: Pasaporte\n"+
                      "*5*: Cédula de Extranjería\n"+
                      "*6*: Indocumentado\n"+
                      "*7*: Otro\n";
                    break;

                    case '2':
                      conversation.nacionalidad = "Venezolana";
                      conversation.pregunta += 2; //va a pregunta 19
                      crearEncuesta(conversation);
                      mensajeRespuesta = "*Tipo de Documento*. "+
                      "Envía el número de acuerdo a la opción correspondiente:\n"+
                      "*1*: Acta de Nacimiento\n"+
                      "*2*: Cédula de Identidad (venezonala)\n"+
                      "*3*: Cédula de ciudadania (colombiana)\n"+
                      "*4*: Pasaporte\n"+
                      "*5*: Cédula de Extranjería\n"+
                      "*6*: Indocumentado\n"+
                      "*7*: Otro\n";
                      break;

                    case '3':
                        conversation.nacionalidad = "Colombo-venezolana";
                        conversation.pregunta += 2; //va a pregunta 19
                        crearEncuesta(conversation);
                        mensajeRespuesta = "*Tipo de Documento*. "+
                        "Envía el número de acuerdo a la opción correspondiente:\n"+
                        "*1*: Acta de Nacimiento\n"+
                        "*2*: Cédula de Identidad (venezonala)\n"+
                        "*3*: Cédula de ciudadania (colombiana)\n"+
                        "*4*: Pasaporte\n"+
                        "*5*: Cédula de Extranjería\n"+
                        "*6*: Indocumentado\n"+
                        "*7*: Otro\n";
                        break;


                    default:
                      mensajeRespuesta = "*Nacionalidad*. Envía el número de acuerdo a la opción correspondiente:\n"+
                          
                          "*1*: Colombiana\n"+
                          "*2*: Venezolana\n"+
                          "*3*: Colombo-venezolana\n"+
                          "*4*: Otro";
                      break;
                  }
                  
                } catch (error) {
                  conversation.pregunta = 17; //vuelve a entrar a paso 17
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Nacionalidad*. Envía el número de acuerdo a la opción correspondiente:\n"+
                          
                          "*2*: Colombiana\n"+
                          "*2*: Venezolana\n"+
                          "*3*: Colombo-venezolana\n"+
                          "*4*: Otro";
                }

            break;
            
            case 18:

                try {
                  conversation.cual_otro_nacionalidad = req.body.Body;
                  conversation.pregunta += 1; //va a pregunta 19
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Tipo de Documento*. "+
                  "Envía el número de acuerdo a la opción correspondiente:\n"+
                  "*1*: Acta de Nacimiento\n"+
                  "*2*: Cédula de Identidad (venezonala)\n"+
                  "*3*: Cédula de ciudadania (colombiana)\n"+
                  "*4*: Pasaporte\n"+
                  "*5*: Cédula de Extranjería\n"+
                  "*6*: Indocumentado\n"+
                  "*7*: Otro\n";
                  
                } catch (error) {
                  conversation.pregunta = 18; //vuelve a entrar a paso 18
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Cuál? (Indicar nacionalidad, ejemplo: Peruana)";
                }
                

            break;


            case 19:

              try {

                if(req.body.Body === '7'){
                  conversation.tipo_documento = "Otro";
                  conversation.pregunta += 1; // pregunta 20
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Cuál? (Indicar tipo, ejemplo: pasaporte)";

                }else{
                  
                  switch(req.body.Body){
                    case '1':
                      conversation.tipo_documento = "Acta de Nacimiento";
                      conversation.pregunta += 2;// pregunta 21
                      crearEncuesta(conversation);
                      mensajeRespuesta = '*Número de Documento:*. Sí no sabe el númeor de documento, envíe "." (punto)';


                      break;
                    case '2':
                      conversation.tipo_documento = "Cédula de Identidad (venezonala)";
                    
                      conversation.pregunta += 2;// pregunta 21
                      crearEncuesta(conversation);
                      mensajeRespuesta = '*Número de Documento:*. Sí no sabe el númeor de documento, envíe "." (punto)';
                      break;

                    case '3':
                        conversation.tipo_documento = "Cédula de ciudadania (colombiana)";
                      
                        conversation.pregunta += 2;// pregunta 21
                        crearEncuesta(conversation);
                        mensajeRespuesta = '*Número de Documento:*. Sí no sabe el númeor de documento, envíe "." (punto)';
                      break;

                    case '4':
                        conversation.tipo_documento = "Pasaporte";
                      
                        conversation.pregunta += 2;// pregunta 21
                        crearEncuesta(conversation);
                        mensajeRespuesta = '*Número de Documento:*. Sí no sabe el númeor de documento, envíe "." (punto)';
                    break;

                    case '5':
                        conversation.tipo_documento = "Cédula de Extranjería";
                      
                        conversation.pregunta += 2;// pregunta 21
                        crearEncuesta(conversation);
                        mensajeRespuesta = '*Número de Documento:*. Sí no sabe el númeor de documento, envíe "." (punto)';
                    break;

                  case '6':
                        conversation.tipo_documento = "Indocumentado";
                      
                        conversation.pregunta += 3;// pregunta 22. Indocumentado no se muestra numero documento
                        crearEncuesta(conversation);
                        mensajeRespuesta = "*¿Podrías compartir una fotografía de tu documento de identidad?*\n"+
                        "Envía el número de acuerdo a la opción correspondiente\n"+
                        "*1*: Sí\n"+
                        "*2*: No";
                  break;

                    default:
                        mensajeRespuesta = "*Tipo de Documento*. "+
                    "Envía el número de acuerdo a la opción correspondiente:\n"+
                    "*1*: Acta de Nacimiento\n"+
                    "*2*: Cédula de Identidad (venezonala)\n"+
                    "*3*: Cédula de ciudadania (colombiana)\n"+
                    "*4*: Pasaporte\n"+
                    "*5*: Cédula de Extranjería\n"+
                    "*6*: Indocumentado\n"+
                    "*7*: Otro\n";
                      break;
                  }
                 
                }
                
              } catch (error) {
                conversation.pregunta = 19; //vuelve a entrar a paso 19
                crearEncuesta(conversation);
                mensajeRespuesta = "*Tipo de Documento*. "+
                  "Envía el número de acuerdo a la opción correspondiente:\n"+
                  "*1*: Acta de Nacimiento\n"+
                  "*2*: Cédula de Identidad (venezonala)\n"+
                  "*3*: Cédula de ciudadania (colombiana)\n"+
                  "*4*: Pasaporte\n"+
                  "*5*: Cédula de Extranjería\n"+
                  "*6*: Indocumentado\n"+
                  "*7*: Otro\n";
              }
                

            break;

            case 20:
              try {
                conversation.cual_otro_tipo_documento = req.body.Body;
                conversation.pregunta += 1;// pregunta 21. 
                crearEncuesta(conversation);
                mensajeRespuesta = '*Número de Documento:*. Sí no sabes el número de documento, envía "." (punto)';
                
              } catch (error) {
                conversation.pregunta = 20; //vuelve a entrar a paso 20
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Cuál? (Indicar tipo, ejemplo: pasaporte)";

              }
            
            break;

          case 21:
            try {
              conversation.numero_documento = req.body.Body;
                conversation.pregunta += 1;// pregunta 22. 
                crearEncuesta(conversation);
                mensajeRespuesta = "*¿Podrías compartir una fotografía de tu documento de identidad?*\n"+
                        "Envía el número de acuerdo a la opción correspondiente\n"+
                        "*1*: Sí\n"+
                        "*2*: No";
              
            } catch (error) {
              conversation.pregunta = 21; //vuelve a entrar a paso 21
                crearEncuesta(conversation);
              mensajeRespuesta = '*Número de Documento:*. Sí no sabes el número de documento, envía "." (punto)';
            }
          
          break;

          case 22:
            try {
              switch(req.body.Body){
                case '1':
                  conversation.compartir_foto_documento_encuestado = true;
                  conversation.pregunta += 1; //pregunta 23
                    crearEncuesta(conversation);
                    mensajeRespuesta = "Envianos la foto de tu documento";
                  break;

                case '2':
                    conversation.compartir_foto_documento_encuestado = false;
                    conversation.pregunta += 2; //pregunta 24
                    crearEncuesta(conversation);
                        mensajeRespuesta = "¿Cómo encontraste este formulario? - Envía el número de acuerdo a la opción correspondiente:\n"+
                    "*1*: Ví un pendón en un albergue\n"+
                    "*2*: Recibí un volante en el albergue\n"+
                    "*3*: Recibí una foto con la información\n"+
                    "*4*: Recibí el enlache por chat\n"+
                    "*5*: Encontré el enlace en Facebook\n"+
                    "*6*: Una persona conocida me lo envió para que lo llenara\n"+
                    "*7*: Otro\n";
                  break;
                
                default:
                  mensajeRespuesta = "*¿Podrías compartir una fotografía de tu documento de identidad?*\n"+
                        "Envía el número de acuerdo a la opción correspondiente\n"+
                        "*1*: Sí\n"+
                        "*2*: No";
                break;
              }
              
            } catch (error) {
              conversation.pregunta = 22; //vuelve a entrar a paso 21
                crearEncuesta(conversation);
                mensajeRespuesta = "*¿Podrías compartir una fotografía de tu documento de identidad?*\n"+
                "Envía el número de acuerdo a la opción correspondiente\n"+
                "*1*: Sí\n"+
                "*2*: No";            }
          
          break;

          case 23:

              try {

                conversation.url_foto_documento_encuestado = 
                conversation.url_foto_documento_encuestado = req.body.Body;
                conversation.pregunta += 1; //pregunta 24
                crearEncuesta(conversation);
                    mensajeRespuesta = "¿Cómo encontraste este formulario? - Envía el número de acuerdo a la opción correspondiente:\n"+
                "*1*: Ví un pendón en un albergue\n"+
                "*2*: Recibí un volante en el albergue\n"+
                "*3*: Recibí una foto con la información\n"+
                "*4*: Recibí el enlache por chat\n"+
                "*5*: Encontré el enlace en Facebook\n"+
                "*6*: Una persona conocida me lo envió para que lo llenara\n"+
                "*7*: Otro\n";
                
              } catch (error) {

                conversation.pregunta = 23; //vuelve a entrar a paso 23
                crearEncuesta(conversation);
                mensajeRespuesta = "Envianos la foto de tu documento";
                
              }

          break;

          case 24:

              try {
                switch(req.body.Body){
                  case '1':
                      conversation.pregunta += 2; //va a pregunta 26
                      conversation.como_llego_al_formulario = "Ví un pendón en un albergue";
                      conversation.donde_encontro_formulario = null;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                    break;

                  case '2':
                    conversation.pregunta += 2; //va a pregunta 26
                    conversation.como_llego_al_formulario = "Recibí un volante en el albergue";
                    conversation.donde_encontro_formulario = null;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                    break;
                  
                  case '3':
                    conversation.pregunta += 2; //va a pregunta 26
                    conversation.como_llego_al_formulario = "Recibí una foto con la información";
                    conversation.donde_encontro_formulario = null;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                    break;

                  case '4':
                    conversation.pregunta += 2; //va a pregunta 26
                    conversation.como_llego_al_formulario = "Recibí el enlache por chat";
                    conversation.donde_encontro_formulario = null;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                    break;

                  case '5':
                    conversation.pregunta += 2; //va a pregunta 26
                    conversation.como_llego_al_formulario = "Encontré el enlace en Facebook";
                    conversation.donde_encontro_formulario = null;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                    break;

                    case '6':
                      conversation.pregunta += 2; //va a pregunta 26
                      conversation.como_llego_al_formulario = "Una persona conocida me lo envió para que lo llenara";
                      conversation.donde_encontro_formulario = null;
                        crearEncuesta(conversation);
                        mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                      break;
                  
                    case '7':
                        conversation.pregunta += 1; //va a pregunta 25
                        conversation.como_llego_al_formulario = "Otro";
                          crearEncuesta(conversation);
                          mensajeRespuesta = "Sí tu respuesta fue otro, ¿Dónde encontraste este formulario?";
                        break;
                  
                  default:
                    mensajeRespuesta = "¿Cómo encontraste este formulario? - Selecciona entre las siguientes opciones enviando el número de la opción correspondente:\n"+
                      "*1*: Ví un pendón en un albergue\n"+
                      "*2*: Recibí un volante en el albergue\n"+
                      "*3*: Recibí una foto con la información\n"+
                      "*4*: Recibí el enlache por chat\n"+
                      "*5*: Encontré el enlace en Facebook\n"+
                      "*6*: Una persona conocida me lo envió para que lo llenara\n"+
                      "*7*: Otro\n";
                    break;
                }
                
              } catch (error) {
                conversation.pregunta = 24; //vuelve a entrar a paso 24
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Cómo encontraste este formulario? - Selecciona entre las siguientes opciones enviando el número de la opción correspondente:\n"+
                      "*1*: Ví un pendón en un albergue\n"+
                      "*2*: Recibí un volante en el albergue\n"+
                      "*3*: Recibí una foto con la información\n"+
                      "*4*: Recibí el enlache por chat\n"+
                      "*5*: Encontré el enlace en Facebook\n"+
                      "*6*: Una persona conocida me lo envió para que lo llenara\n"+
                      "*7*: Otro\n";
                
              }

          
          break;

          case 25:

              try {
                conversation.donde_encontro_formulario = req.body.Body;
                conversation.pregunta += 1; //va a pregunta 26
                crearEncuesta(conversation);
                mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                
              } catch (error) {
                conversation.pregunta = 25; //vuelve a 25
                crearEncuesta(conversation);
                mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";
              }
              
              

          break;

        
          case 26:

              try {
                $fechavalidar = req.body.Body.split('-');

                if($fechavalidar.length === 3 && $fechavalidar[0].length === 4 && $fechavalidar[1].length === 2 && $fechavalidar[2].length === 2){
                    
                    $validarAño = parseInt($fechavalidar[0]);
                    $validarMes = parseInt($fechavalidar[1]);
                    $validarDia = parseInt($fechavalidar[2]);
                    

                    $fechaActual = new Date();
                    $añoActual = $fechaActual.getFullYear();
                    $añoActualInteger = parseInt($añoActual);

               

                    if(($validarDia > 0 && $validarDia <=31) && ($validarMes > 0 && $validarMes <= 12) && ($validarAño >= 2010 && $validarAño <= $añoActualInteger )){
                      console.log('FECHA VALIDA!!');
                      console.log('TAMAÑO SI ES TRES: ', $fechavalidar.length);
                      conversation.pregunta += 1; //va a pregunta 27
                      conversation.fecha_llegada = req.body.Body;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿En los próximos seis meses planeas estar dentro de Colombia?"+
                      "Selecciona una de las siguientes opciones escribiendo el número correspondiente de la opción:\n"+
                      "*1*: Sí\n"+
                      "*2*: No\n"+
                      "*3*: No estoy seguro";
                      
                    }else{
                      mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                    }

                }else{
                  mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

                }
                
              } catch (error) {
                conversation.pregunta = 26; //vuelve a 25
                crearEncuesta(conversation);
                mensajeRespuesta = "¿En qué fecha tu y tu grupo familiar llegaron al país?. Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día. Ejemplo: 2000-10-26)";

              }
              
              
            break;

            case 27:

                try {
                  switch (req.body.Body){
                    case '1':
                      conversation.pregunta += 1; //va a pregunta 28
                      conversation.estar_dentro_colombia = 1;
                      conversation.pais_destino_fuera_colombia = null;
                      mensajeRespuesta = "¿Cuál es tu destino final dentro de Colombia?\n"+
                      "Envíe el número de acuerdo al Departamento correspondiente ó el número *1* en caso de que no tenga definido el Departamento de destino.\n"+
                      "*1*: No sé\n"+
                      "*2*:	Antioquia\n"+
                      "*3*:	Atlántico\n"+
                      "*4*:	Bogotá D.C.\n"+
                      "*5*:	Bolívar\n"+
                      "*6*:	Boyaca\n"+
                      "*7*:	Caldas\n"+
                      "*8*:	Caqueta\n"+
                      "*9*:	Cauca\n"+
                      "*10*:	Cesar\n"+
                      "*11*:	Córdoba\n"+
                      "*12*:	Cundinamarca\n"+
                      "*13*:	Chocó\n"+
                      "*14*:	Huila\n"+
                      "*15*:	La Guajira\n"+
                      "*16*:	Magdalena\n"+
                      "*17*:	Meta\n"+
                      "*18*:	Nariño\n"+
                      "*19*:	Norte de Santander\n"+
                      "*20*:	Quindio\n"+
                      "*21*:	Risaralda\n"+
                      "*22*:	Santander\n"+
                      "*23*:	Sucre\n"+
                      "*24*:	Tolima\n"+
                      "*25*:	Valle del Cauca\n"+
                      "*26*:	Arauca\n"+
                      "*27*:	Casanare\n"+
                      "*28*:	Putumayo\n"+
                      "*29*:	San Andres\n"+
                      "*30*:	Isla de Providencia y Santa Catalina\n"+
                      "*31*:	Amazonas\n"+
                      "*32*:	Guainia\n"+
                      "*33*:	Guaviare\n"+
                      "*34*:	Vaupes\n"+
                      "*35*:	Vichada\n";
                      crearEncuesta(conversation);
                      
                      break;
                    case '2':
                      conversation.pregunta += 3; //va a pregunta 30
                      conversation.estar_dentro_colombia = 0;
                      conversation.id_departamento_destino_final = null;
                      conversation.id_municipio_destino_final = null;
                      crearEncuesta(conversation);

                      mensajeRespuesta = "¿Cuál es tu destino final?. Envíe el número de acuerdo al país correspondiente:\n"+
                      "*1*: Antigua y Barbuda\n"+
                      "*2*: Argentina\n"+
                      "*3*: Bahamas\n"+
                      "*4*: Barbados\n"+
                      "*5*: Bolivia\n"+
                      "*6*: Brasil\n"+
                      "*7*: Chile\n"+
                      "*8*: Colombia\n"+
                      "*9*: Costa Rica\n"+
                      "*10*: Cuba\n"+
                      "*11*: Dominica\n"+
                      "*12*: Ecuador\n"+
                      "*13*: Granada\n"+
                      "*14*: Guyana\n"+
                      "*15*: Jamaica\n"+
                      "*16*: México\n"+
                      "*17*: Panamá\n"+
                      "*18*: Perú\n"+
                      "*19*: República Dominicana\n"+
                      "*20*: Surinam\n"+
                      "*21*: Trinidad y Tobago\n"+
                      "*22*: Uruguay\n"+
                      "*23*: Venezuela\n";
                      break;
  
                    case '3':
                      conversation.pregunta += 1; //va a pregunta 28
                      conversation.estar_dentro_colombia = 2;
                      conversation.pais_destino_fuera_colombia = null;
                      mensajeRespuesta = "¿Cuál es tu destino final dentro de Colombia?\n"+
                      "Envíe el número de acuerdo al Departamento correspondiente ó el número *1* en caso de que no tenga definido el Departamento de destino.\n"+
                      "*1*: No sé\n"+
                      "*2*:	Antioquia\n"+
                      "*3*:	Atlántico\n"+
                      "*4*:	Bogotá D.C.\n"+
                      "*5*:	Bolívar\n"+
                      "*6*:	Boyaca\n"+
                      "*7*:	Caldas\n"+
                      "*8*:	Caqueta\n"+
                      "*9*:	Cauca\n"+
                      "*10*:	Cesar\n"+
                      "*11*:	Córdoba\n"+
                      "*12*:	Cundinamarca\n"+
                      "*13*:	Chocó\n"+
                      "*14*:	Huila\n"+
                      "*15*:	La Guajira\n"+
                      "*16*:	Magdalena\n"+
                      "*17*:	Meta\n"+
                      "*18*:	Nariño\n"+
                      "*19*:	Norte de Santander\n"+
                      "*20*:	Quindio\n"+
                      "*21*:	Risaralda\n"+
                      "*22*:	Santander\n"+
                      "*23*:	Sucre\n"+
                      "*24*:	Tolima\n"+
                      "*25*:	Valle del Cauca\n"+
                      "*26*:	Arauca\n"+
                      "*27*:	Casanare\n"+
                      "*28*:	Putumayo\n"+
                      "*29*:	San Andres\n"+
                      "*30*:	Isla de Providencia y Santa Catalina\n"+
                      "*31*:	Amazonas\n"+
                      "*32*:	Guainia\n"+
                      "*33*:	Guaviare\n"+
                      "*34*:	Vaupes\n"+
                      "*35*:	Vichada\n";

                      crearEncuesta(conversation);
                      break;
  
                    default:
                      mensajeRespuesta = "¿En los próximos seis meses planeas estar dentro de Colombia?"+
                        "Selecciona una de las siguientes opciones escribiendo el número correspondiente de la opción:\n"+
                        "*1*: Sí\n"+
                        "*2*: No\n"+
                        "*3*: No estoy seguro";
                      break;
                  }
                  
                } catch (error) {
                  conversation.pregunta = 27;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿En los próximos seis meses planeas estar dentro de Colombia?"+
                      "Selecciona una de las siguientes opciones escribiendo el número correspondiente de la opción:\n"+
                      "*1*: Sí\n"+
                      "*2*: No\n"+
                      "*3*: No estoy seguro";
                }

                
            break;

            case 28:
              console.log('ANTES TRY BODY 28: ', req.body.Body);
                try {

                  console.log('LO QUE HAY EN BODY 28: ', req.body.Body);
                  const opcionesDepartamento = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', 
                  '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'];
                  
                  if(req.body.Body === '1'){
                    conversation.pregunta += 3; //va a pregunta 31
                    conversation.id_departamento_destino_final = null;
                    conversation.id_municipio_destino_final = null;
                    crearEncuesta(conversation);
                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                    "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                    "*1*: Algún amigo o familiar me espera.\n"+
                    "*2*: Conozco personas que me pueden dar trabajo\n"+
                    "*3*: He escuchado que puedo tener trabajo allá\n"+
                    "*4*: Otra";
    
                    
                  }else if(opcionesDepartamento.includes(req.body.Body)){
                    conversation.pregunta += 1; //va a pregunta 29
                    conversation.id_departamento_destino_final =  parseInt(req.body.Body);
                    crearEncuesta(conversation);
                    mensajeRespuesta = "Escriba en mayúscula el nombre del Municipio ó la palabra *NO SE* en caso de que no tenta definido el Municipio de destino";
                    
                  }else{
                    mensajeRespuesta = "¿Cuál es tu destino final dentro de Colombia?\n"+
                      "Envíe el número de acuerdo al Departamento correspondiente ó el número *1* en caso de que no tenga definido el Departamento de destino.\n"+
                      "*1*: No sé\n"+
                      "*2*:	Antioquia\n"+
                      "*3*:	Atlántico\n"+
                      "*4*:	Bogotá D.C.\n"+
                      "*5*:	Bolívar\n"+
                      "*6*:	Boyaca\n"+
                      "*7*:	Caldas\n"+
                      "*8*:	Caqueta\n"+
                      "*9*:	Cauca\n"+
                      "*10*:	Cesar\n"+
                      "*11*:	Córdoba\n"+
                      "*12*:	Cundinamarca\n"+
                      "*13*:	Choco\n"+
                      "*14*:	Huila\n"+
                      "*15*:	La Guajira\n"+
                      "*16*:	Magdalena\n"+
                      "*17*:	Meta\n"+
                      "*18*:	Nariño\n"+
                      "*19*:	Norte de Santander\n"+
                      "*20*:	Quindio\n"+
                      "*21*:	Risaralda\n"+
                      "*22*:	Santander\n"+
                      "*23*:	Sucre\n"+
                      "*24*:	Tolima\n"+
                      "*25*:	Valle del Cauca\n"+
                      "*26*:	Arauca\n"+
                      "*27*:	Casanare\n"+
                      "*28*:	Putumayo\n"+
                      "*29*:	San Andres\n"+
                      "*30*:	Isla de Providencia y Santa Catalina\n"+
                      "*31*:	Amazonas\n"+
                      "*32*:	Guainia\n"+
                      "*33*:	Guaviare\n"+
                      "*34*:	Vaupes\n"+
                      "*35*:	Vichada\n";
                  }
                  
                } catch (error) {
                  console.log('ERROR EN 28');
                  console.log('EL ERROR ES: ', error);
                  conversation.pregunta = 28; //vuelve a 28
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Cuál es tu destino final dentro de Colombia?\n"+
                      "Envíe el número de acuerdo al Departamento correspondiente ó el número *1* en caso de que no tenga definido el Departamento de destino.\n"+
                      "*1*: No sé\n"+
                      "*2*:	Antioquia\n"+
                      "*3*:	Atlántico\n"+
                      "*4*:	Bogotá D.C.\n"+
                      "*5*:	Bolívar\n"+
                      "*6*:	Boyaca\n"+
                      "*7*:	Caldas\n"+
                      "*8*:	Caqueta\n"+
                      "*9*:	Cauca\n"+
                      "*10*:	Cesar\n"+
                      "*11*:	Córdoba\n"+
                      "*12*:	Cundinamarca\n"+
                      "*13*:	Chocó\n"+
                      "*14*:	Huila\n"+
                      "*15*:	La Guajira\n"+
                      "*16*:	Magdalena\n"+
                      "*17*:	Meta\n"+
                      "*18*:	Nariño\n"+
                      "*19*:	Norte de Santander\n"+
                      "*20*:	Quindio\n"+
                      "*21*:	Risaralda\n"+
                      "*22*:	Santander\n"+
                      "*23*:	Sucre\n"+
                      "*24*:	Tolima\n"+
                      "*25*:	Valle del Cauca\n"+
                      "*26*:	Arauca\n"+
                      "*27*:	Casanare\n"+
                      "*28*:	Putumayo\n"+
                      "*29*:	San Andres\n"+
                      "*30*:	Isla de Providencia y Santa Catalina\n"+
                      "*31*:	Amazonas\n"+
                      "*32*:	Guainia\n"+
                      "*33*:	Guaviare\n"+
                      "*34*:	Vaupes\n"+
                      "*35*:	Vichada\n";
                  
                }

            break;


            case 29:

                try {
                  if(req.body.Body === 'NO SE' || req.body.Body === 'No sé' || req.body.Body === 'No se' || req.body.Body === 'no sé' || req.body.Body === 'No se'){
                    conversation.id_municipio_destino_final = null;
                    conversation.pregunta += 2;//va a pregunta 31
                    crearEncuesta(conversation);
                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                    "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                    "*1*: Algún amigo o familiar me espera.\n"+
                    "*2*: Conozco personas que me pueden dar trabajo\n"+
                    "*3*: He escuchado que puedo tener trabajo allá\n"+
                    "*4*: Otra";
                  }else{
                    
                    //conversation.id_municipio_destino_final =  req.body.Body;
                    $sqlConsultaMunicipio = `SELECT nombre FROM municipio where nombre = '${req.body.Body}'`;

                          connection.query($sqlConsultaMunicipio, (error,res)=>{
                              if (error) throw error;
                              console.log('CONSULTA MUNICIPIO: ', res);
                              console.log('TAMAÑO: ', res.length);
                              if(res.length == 1){

                                conversation.pregunta += 2; //va a pregunta 31
                                conversation.id_municipio_destino_final =  res[0].id;
                                crearEncuesta(conversation);
                                mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                "*1*: Algún amigo o familiar me espera.\n"+
                                "*2*: Conozco personas que me pueden dar trabajo\n"+
                                "*3*: He escuchado que puedo tener trabajo allá\n"+
                                "*4*: Otra";                         
                                

                              }
                    
                          });
    
                  }
                } catch (error) {
                  conversation.pregunta = 29;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "Escriba en mayúscula el nombre del Municipio ó la palabra *NO SE* en caso de que no tenta definido el Municipio de destino";

                }
            
            break;

            case 30:

                try {
                  switch(req.body.Body){
                    case '1':
  
                      conversation.pais_destino_fuera_colombia = "Antigua y Barbuda";
                      
                      conversation.pregunta += 1;//va a pregunta 31
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                      "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                
                    break;
  
                    case '2':
  
                      conversation.pais_destino_fuera_colombia = "Argentina";
                    
                      conversation.pregunta += 1;//va a pregunta 31
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                      "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                      break;
                      case '3':
  
                        conversation.pais_destino_fuera_colombia = "Bahamas";
                       
                        conversation.pregunta += 1;//va a pregunta 31
                        crearEncuesta(conversation);
                        mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                        "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                        break;
                      
                        case '4':
  
                        conversation.pais_destino_fuera_colombia = "Barbados";
                       
                        conversation.pregunta += 1;//va a pregunta 31
                        crearEncuesta(conversation);
                        mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                        "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                        break;
  
                        case '5':
  
                          conversation.pais_destino_fuera_colombia = "Bolivia";
                          
                          conversation.pregunta += 1;//va a pregunta 31
                          crearEncuesta(conversation);
                          mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                          "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                          break;
  
                          case '6':
  
                          conversation.pais_destino_fuera_colombia = "Brasil";
                          conversation.pregunta += 1;//va a pregunta 31
                          crearEncuesta(conversation);
                          mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                          "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                          break;
  
                        
                          case '7':
  
                          conversation.pais_destino_fuera_colombia = "Chile";
                          conversation.pregunta += 1;//va a pregunta 31
                          crearEncuesta(conversation);
                          mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                          "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                          break;
  
                          case '8':
  
                          conversation.pais_destino_fuera_colombia = "Colombia";
                          
                          conversation.pregunta += 1;//va a pregunta 31
                          crearEncuesta(conversation);
                          mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                          "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                          break;
  
                        
                          case '9':
  
                            conversation.pais_destino_fuera_colombia = "Costa Rica";
                            
                            conversation.pregunta += 1;//va a pregunta 31
                            crearEncuesta(conversation);
                            mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                            "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                            break;
  
  
                            case '10':
  
                              conversation.pais_destino_fuera_colombia = "Cuba";
                              
                              conversation.pregunta += 1;//va a pregunta 31
                              crearEncuesta(conversation);
                              mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                              "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                              break;
  
                              case '11':
  
                                conversation.pais_destino_fuera_colombia = "Dominica";
                                
                                conversation.pregunta += 1;//va a pregunta 31
                                crearEncuesta(conversation);
                                mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                break;
  
                                case '12':
  
                                  conversation.pais_destino_fuera_colombia = "Ecuador";
                                  
                                  conversation.pregunta += 1;//va a pregunta 31
                                  crearEncuesta(conversation);
                                  mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                  "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                  break;
  
                                  case '13':
  
                                    conversation.pais_destino_fuera_colombia = "Granada";
                                    
                                    conversation.pregunta += 1;//va a pregunta 31
                                    crearEncuesta(conversation);
                                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                    "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                    break;
  
  
                                    case '14':
  
                                    conversation.pais_destino_fuera_colombia = "Guyana";
                                  
                                    conversation.pregunta += 1;//va a pregunta 31
                                    crearEncuesta(conversation);
                                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                    "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                    break;
  
  
                                    case '15':
  
                                    conversation.pais_destino_fuera_colombia = "Jamaica";
                                   
                                    conversation.pregunta += 1;//va a pregunta 31
                                    crearEncuesta(conversation);
                                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                    "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                    break;
  
                                    case '16':
  
                                    conversation.pais_destino_fuera_colombia = "México";
                                    
                                    conversation.pregunta += 1;//va a pregunta 31
                                    crearEncuesta(conversation);
                                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                    "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                    break;
  
                                    case '17':
  
                                    conversation.pais_destino_fuera_colombia = "Panamá";
                                    
                                    conversation.pregunta += 1;//va a pregunta 31
                                    crearEncuesta(conversation);
                                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                    "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                    break;
  
  
                                    case '18':
  
                                    conversation.pais_destino_fuera_colombia = "Perú";
                                    
                                    conversation.pregunta += 1;//va a pregunta 31
                                    crearEncuesta(conversation);
                                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                    "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                    break;
  
  
                                    case '19':
  
                                    conversation.pais_destino_fuera_colombia = "República Dominicana";
                                    
                                    conversation.pregunta += 1;//va a pregunta 31
                                    crearEncuesta(conversation);
                                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                    "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                    break;
  
                                    case '20':
  
                                    conversation.pais_destino_fuera_colombia = "Surinam";
                                    
                                    conversation.pregunta += 1;//va a pregunta 31
                                    crearEncuesta(conversation);
                                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                    "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                    break;
  
  
                                    case '21':
  
                                      conversation.pais_destino_fuera_colombia = "Trinidad y Tobago";
                                      
                                      conversation.pregunta += 1;//va a pregunta 31
                                      crearEncuesta(conversation);
                                      mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                      break;
  
  
  
                                      case '22':
  
                                        conversation.pais_destino_fuera_colombia = "Uruguay";
                                       
                                        conversation.pregunta += 1;//va a pregunta 31
                                        crearEncuesta(conversation);
                                        mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                        "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                        break;
  
  
                                        case '23':
  
                                        conversation.pais_destino_fuera_colombia = "Venezuela";
                                       
                                        conversation.pregunta += 1;//va a pregunta 31
                                        crearEncuesta(conversation);
                                        mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                        "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                                        break;
  
                                        default:
  
                                          mensajeRespuesta = "¿Cuál es tu destino final? Seleccione uno de los siguientes países."+
                                          "Envíe el número correspondiente de la opción:\n"+
                                          "*1*: Antigua y Barbuda\n"+
                                          "*2*: Argentina\n"+
                                          "*3*: Bahamas\n"+
                                          "*4*: Barbados\n"+
                                          "*5*: Bolivia\n"+
                                          "*6*: Brasil\n"+
                                          "*7*: Chile\n"+
                                          "*8*: Colombia\n"+
                                          "*9*: Costa Rica\n"+
                                          "*10*: Cuba\n"+
                                          "*11*: Dominica\n"+
                                          "*12*: Ecuador\n"+
                                          "*13*: Granada\n"+
                                          "*14*: Guyana\n"+
                                          "*15*: Jamaica\n"+
                                          "*16*: México\n"+
                                          "*17*: Panamá\n"+
                                          "*18*: Perú\n"+
                                          "*19*: República Dominicana\n"+
                                          "*20*: Surinam\n"+
                                          "*21*: Trinidad y Tobago\n"+
                                          "*22*: Uruguay\n"+
                                          "*23*: Venezuela\n";
  
                    break;
                  };
                  
                } catch (error) {

                    mensajeRespuesta = "¿Cuál es tu destino final? Seleccione uno de los siguientes países."+
                                          "Envíe el número correspondiente de la opción:\n"+
                                          "*1*: Antigua y Barbuda\n"+
                                          "*2*: Argentina\n"+
                                          "*3*: Bahamas\n"+
                                          "*4*: Barbados\n"+
                                          "*5*: Bolivia\n"+
                                          "*6*: Brasil\n"+
                                          "*7*: Chile\n"+
                                          "*8*: Colombia\n"+
                                          "*9*: Costa Rica\n"+
                                          "*10*: Cuba\n"+
                                          "*11*: Dominica\n"+
                                          "*12*: Ecuador\n"+
                                          "*13*: Granada\n"+
                                          "*14*: Guyana\n"+
                                          "*15*: Jamaica\n"+
                                          "*16*: México\n"+
                                          "*17*: Panamá\n"+
                                          "*18*: Perú\n"+
                                          "*19*: República Dominicana\n"+
                                          "*20*: Surinam\n"+
                                          "*21*: Trinidad y Tobago\n"+
                                          "*22*: Uruguay\n"+
                                          "*23*: Venezuela\n";
                    conversation.pregunta = 31;//vuelve a pregunta 31
                    crearEncuesta(conversation);
                  
                }
            
            break;

            case 31:
              try {
                switch(req.body.Body){
                  case '1':
                    conversation.pregunta += 2;//va a pregunta 33
                    
                    conversation.razon_elegir_destino_final =  "Algún amigo o familiar me espera";
                    conversation.otra_razon_elegir_destino_final = null;
                    crearEncuesta(conversation);
                    mensajeRespuesta = "¿Tu hogar está recibiendo transporte humanitario? Selecciona la opción enviando el número correspondiente:\n"+
                    "*1*: Sí\n"+
                    "*2*: No\n";
                    
  
                    break;
                    
                    case '2':
                    conversation.pregunta += 2;//va a pregunta 33
                    
                    conversation.razon_elegir_destino_final =  "Conozco personas que me pueden dar trabajo";
                    conversation.otra_razon_elegir_destino_final = null;
                    crearEncuesta(conversation);
                    mensajeRespuesta = "¿Tu hogar está recibiendo transporte humanitario? Selecciona la opción enviando el número correspondiente:\n"+
                    "*1*: Sí\n"+
                    "*2*: No\n";
  
                    break;
                    
                    case '3':
                    conversation.pregunta += 2;//va a pregunta 33
                    conversation.razon_elegir_destino_final =  "He escuchado que puedo tener trabajo allá";
                    conversation.otra_razon_elegir_destino_final = null;
                    crearEncuesta(conversation);
                    mensajeRespuesta = "¿Tu hogar está recibiendo transporte humanitario? Selecciona la opción enviando el número correspondiente:\n"+
                    "*1*: Sí\n"+
                    "*2*: No\n";
  
                    break;
  
                  case '4':
                    conversation.pregunta += 1;//va a pregunta 32
                    
                    conversation.razon_elegir_destino_final = "Otra";
                    crearEncuesta(conversation);
                    mensajeRespuesta = "¿Cuál otra razón?";
  
                    break;
  
                    default:
                      mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                        "Envíe el número de la opción correspondiente:\n"+
                                        "*1*: Algún amigo o familiar me espera.\n"+
                                        "*2*: Conozco personas que me pueden dar trabajo\n"+
                                        "*3*: He escuchado que puedo tener trabajo allá\n"+
                                        "*4*: Otra";
                      break;
                }
                
              } catch (error) {
                conversation.pregunta = 31;// vuelve a pregunta 31
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                    "Envíe el número de la opción correspondiente:\n"+
                    "*1*: Algún amigo o familiar me espera.\n"+
                    "*2*: Conozco personas que me pueden dar trabajo\n"+
                    "*3*: He escuchado que puedo tener trabajo allá\n"+
                    "*4*: Otra";
              }
            break;

            case 32:
              try {
                conversation.pregunta += 1; //va a pregunta 33
                conversation.otra_razon_elegir_destino_final = req.body.Body;
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Tu hogar está recibiendo transporte humanitario? Selecciona la opción enviando el número correspondiente:\n"+
                "*1*: Sí\n"+
                "*2*: No\n";
                
              } catch (error) {
                conversation.pregunta = 32;//vuelve a pregunta 32
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Cuál otra razón?";
              }
            
            break;

            case 33:
              try {
                switch (req.body.Body) {

                    case '1':
                          
                      conversation.recibe_transporte_humanitario =  1;
    
                      if(conversation.estar_dentro_colombia == 0){
                          conversation.encuesta_chatbot = false;
                            
                            crearEncuesta(conversation);
                            mensajeRespuesta = "Gracias la encuesta ha terminado, hasta una próxima ocasión!";
                         
    
                      }else{
                          conversation.paso = 2;
                          conversation.pregunta = 34;//va a pregunta 34 donde empieza paso 2
                          crearEncuesta(conversation);
                          mensajeRespuesta = "*PASO 2 - DATOS DE LOS MIEMBROS DEL HOGAR*\n"+
                          "Cuántas personas de tu familia están contigo en este momento?";
    
                      }
                          
                      break;
    
                    case '2':
    
                         conversation.recibe_transporte_humanitario =  0;
                          if(conversation.estar_dentro_colombia == 0){
                            conversation.encuesta_chatbot = false;
                              
                              crearEncuesta(conversation);
                              mensajeRespuesta = "Gracias la encuesta ha terminado, hasta una próxima ocasión!";
                       
      
                        }else{
                            conversation.paso = 2;
                            conversation.pregunta = 34;//va a pregunta 34 donde empieza paso 2
                            crearEncuesta(conversation);
                            mensajeRespuesta = "*PASO 2 - DATOS DE LOS MIEMBROS DEL HOGAR*\n"+
                            "Cuántas personas de tu familia están contigo en este momento?";
      
                        }
                      break;
    
                  default:
                    mensajeRespuesta = "¿Tu hogar está recibiendo transporte humanitario? Selecciona la opción enviando el número correspondiente:\n"+
                    "*1*: Sí\n"+
                    "*2*: No\n";
                  break;
                }
                
              } catch (error) {

                conversation.pregunta = 33;//vuelve a pregunta 33
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Tu hogar está recibiendo transporte humanitario? Selecciona la opción enviando el número correspondiente:\n"+
                "*1*: Sí\n"+
                "*2*: No\n";
              }
            
            break;

            //EMPEZAMOS CON PASO 2

            case 34:
              try {
                var valoresAceptados = /^[0-9]/;
                if((req.body.Body.length >= 1 && req.body.Body <=2) && (req.body.Body.match(valoresAceptados))){
                  //al valor ingresado de miembros que acompañan al encuestado le sumo 1 que corresponde al encuestado
                  console.log('PARSE INT BODY: ', parseInt(req.body.Body));
                  conversation.total_miembros_hogar = parseInt(req.body.Body) + 1; 
                  console.log('TOTAL MIEMBROS HOGAR: ',conversation.total_miembros_hogar );
                  conversation.miembro_hogar_preguntando = 1;
                  conversation.pregunta += 1; //va a pregunta 35
                  crearEncuesta(conversation);
                  mensajeRespuesta = "Envie la palabra *CONTINUAR* para responder información sobre los miembros de su hogar";
                  
                }else{
                  mensajeRespuesta = "*PASO 2 - DATOS DE LOS MIEMBROS DEL HOGAR*\n"+
                            "Cuántas personas de tu familia están contigo en este momento?";
                }
                
  
                
              } catch (error) {
                conversation.pregunta = 34;
                crearEncuesta(conversation);
                mensajeRespuesta = "*PASO 2 - DATOS DE LOS MIEMBROS DEL HOGAR*\n"+
                            "Cuántas personas de tu familia están contigo en este momento?";
              }
            break;

            case 35:

                try {
                  if(req.body.Body === 'CONTINUAR'){
                    //valida continuar
                    conversation.pregunta += 1; //va a pregunta 36
                   
                    crearEncuesta(conversation);
                    mensajeRespuesta = "A continuación responda las preguntas para miembro #"+conversation.miembro_hogar_preguntando+"\n"+
                    "*Primer Nombre*";
                  }else{
                    mensajeRespuesta = "Envie la palabra *CONTINUAR* para responder información sobre los miembros de su hogar";

                  }
                  
                } catch (error) {
                  conversation.pregunta = 35;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "Envie la palabra *CONTINUAR* para responder información sobre los miembros de su hogar";

                }
                
  
              break;

            case 36:
              try {
                
                guardarInfoMiembro(req.body.Body, 'primer_nombre_miembro', conversation.miembro_hogar_preguntando, conversation.id);
                guardarInfoMiembro(1, 'fuente', conversation.miembro_hogar_preguntando, conversation.id);

                conversation.pregunta += 1; //va a pregunta 36
                crearEncuesta(conversation);
                
                mensajeRespuesta = "*Segundo Nombre* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                "En caso de que no tenga Segundo Nombre, envíe un '.' (punto)";
  
              } catch (error) {
                conversation.pregunta = 36;
                crearEncuesta(conversation);
                mensajeRespuesta = "A continuación responda las preguntas para miembro #"+conversation.miembro_hogar_preguntando+"\n"+
                "*Primer Nombre*";
              }
            
            break;

            case 37:

                try {
                  guardarInfoMiembro(req.body.Body, 'segundo_nombre_miembro', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 1; //va a pregunta 38
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Primer Apellido* (miembro #"+conversation.miembro_hogar_preguntando+").";
                  
                  
                } catch (error) {
                  conversation.pregunta = 37;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Segundo Nombre* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                  "En caso de que no tenga Segundo Nombre, envíe un '.' (punto)";
                }
                
              break;

            
            case 38:
                
                try {
                  guardarInfoMiembro(req.body.Body, 'primer_apellido_miembro', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 1; //va a pregunta 39
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Segundo Apellido* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                  "En caso de que no tenga Segundo Nombre, envíe un '.' (punto)";
                  
                } catch (error) {
                  conversation.pregunta = 38;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Primer Apellido* (miembro #"+conversation.miembro_hogar_preguntando+").";

                }
                
  
              break;

              case 39:

                try {
                  guardarInfoMiembro(req.body.Body, 'segundo_apellido_miembro', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 1; //va a pregunta 40
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Sexo:* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                  "Envíe el número de acuerdo a la opción:\n"+
                  "*1*: Mujer\n"+
                  "*2*: Hombre";
                  
                } catch (error) {
                  conversation.pregunta = 39;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Segundo Apellido* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                  "En caso de que no tenga Segundo Nombre, envíe un '.' (punto)";
                }

              break;
            
            case 40:
                
                try {

                  switch(req.body.Body){
                    case '1':
                      conversation.pregunta += 1; //pregunta 41
                      guardarInfoMiembro('mujer', 'sexo_miembro', conversation.miembro_hogar_preguntando, conversation.id);
                      crearEncuesta(conversation);
                      mensajeRespuesta = "*Fecha de Nacimiento*: (miembro #"+conversation.miembro_hogar_preguntando+")."+
                      "(Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día)";

                    break;
                    case '2':
                      conversation.pregunta += 1; //pregunta 41
                      guardarInfoMiembro('hombre', 'sexo_miembro', conversation.miembro_hogar_preguntando, conversation.id);
                      crearEncuesta(conversation);
                      mensajeRespuesta = "*Fecha de Nacimiento*: (miembro #"+conversation.miembro_hogar_preguntando+")."+
                      "(Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día)";

                    break;

                    default:
                      mensajeRespuesta = "*Sexo:* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                       "Envíe el número de acuerdo a la opción:\n"+
                       "*1*: Mujer\n"+
                       "*2*: Hombre";
                    break;
                  }
                  
                  
                } catch (error) {
                  conversation.pregunta = 40;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Sexo:* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                  "Envíe el número de acuerdo a la opción:\n"+
                  "*1*: Mujer\n"+
                  "*2*: Hombre";
                }
                

          
              break;

          case 41:

                try {
                  //validacion fecha nacimiento
                      $fechavalidarMiembro = req.body.Body.split('-');
                      if($fechavalidarMiembro.length === 3 && $fechavalidarMiembro[0].length === 4 && $fechavalidarMiembro[1].length === 2 && $fechavalidarMiembro[2].length === 2){
                          
                        $validarAño = parseInt($fechavalidarMiembro[0]); //Año
                        $validarMes = parseInt($fechavalidarMiembro[1]); //Mes
                        $validarDia = parseInt($fechavalidarMiembro[2]); //dia
                        
      
                        $fechaActual = new Date();
                        $añoActual = $fechaActual.getFullYear(); //Año actual
                        $añoActualInteger = parseInt($añoActual);

                        //console.log('AÑO ACTUAL: ', typeof($añoActualInteger));
                        //console.log('VALIDAR AÑO: ', typeof($validarAño));
                        //console.log('VALIDAR MES: ', typeof($validarMes));
                        //console.log('VALIDAR DIA: ', typeof($validarDia));

                        //Valido si el valor de dia es mayor que 0 hasta 31
                        //valido si mes es mayor que 0 hasta 12
                        //Valido si año es mayor que 1920 y menor o igual a 2003
                        //Debe ser mas inteligente para que haya un año limite y minimo
                        if(($validarDia > 0 && $validarDia <=31) && ($validarMes > 0 && $validarMes <= 12) && ($validarAño >= 1920 && $validarAño <= $añoActualInteger )){
                          
                         // console.log('ENTRA A FORMAR FECHA DESPUES DE IF EN 2051!');

                          
                          //console.log('FECHA VALIDA!!');
                          //console.log('TAMAÑO SI ES TRES: ', $fechavalidar.length);
                          $fecha_nacimiento_miembro = $fechavalidarMiembro[0]+'-'+$fechavalidarMiembro[1]+'-'+$fechavalidarMiembro[2];
                          console.log('FECHA NACIMIENTO MIEMBRO en 2054:: ',$fecha_nacimiento_miembro );
                          guardarInfoMiembro($fecha_nacimiento_miembro, 'fecha_nacimiento', conversation.miembro_hogar_preguntando, conversation.id);
                          
                          
                          consultarMiembroHogar( conversation.miembro_hogar_preguntando, conversation.id, function(response) {
                              if(response){
                                console.log('RESPONSE AL LLAMAR A MIEMBRO: ', response);
                                
                                  $miembro_hogar = response;
                                //codigo_encuesta
                                  $nombreinicial_miembro = $miembro_hogar.primer_nombre_miembro.substring(0, 2); //toma 2 primeras letras de primer nombre
                                  $nombreinicial_miembro = $nombreinicial_miembro.toLocaleUpperCase(); //lo vuelve mayuscula
                                  //console.log('NOMBRE INICIAL: ', $nombreinicial);
  
                                  //reemplaza tildes para el nombre
                                  $nombreiniciales = $nombreinicial_miembro.replace("Á","A").replace("É","E").replace("Í","I").replace("Ó","O").replace("Ú","U").replace("Ñ","N").replace('Ü','U');
                              
  
  
                                  $apellidoinicial_miembro = $miembro_hogar.primer_apellido_miembro.substring(0, 2); //toma 2 primeras letras de primer apellido
                                  $apellidoinicial_miembro = $apellidoinicial_miembro.toLocaleUpperCase(); //vuelve mayuscula
  
                                  //reemplaza tildes para apellido
                                  $apellidoiniciales = $apellidoinicial_miembro.replace("Á","A").replace("É","E").replace("Í","I").replace("Ó","O").replace("Ú","U").replace("Ñ","N").replace('Ü','U');
                            
                                
                                  $fecha1900 = new Date('1900-01-01'); //fecha referente para calcular dias
                                  //console.log('FECHA 1900', $fecha1900);
  
                                  $fecha2 = new Date($miembro_hogar.fecha_nacimiento);
  
                                  $diff= $fecha2.getTime()-$fecha1900.getTime(); //diferencia entre fecha nacimiento y inicial de sistemas
                                  $contdiasCalculo = Math.round($diff/(1000*60*60*24)); //calculo dias
  
                                  $contdias = $contdiasCalculo + 2; //suma 2 para adaptarlo a formato EXCEL
            
                                  //console.log('DIFERENCIA: ', $diff);
                                  //console.log('DIF DIAS: ', $contdiasCalculo);
                                  //console.log('DIF DIAS EXACTO EXCEL: ', $contdias);
  
                                  $diferenciaDias = $contdias;
  
                                  $sexoinicial_miembro = $miembro_hogar.sexo_miembro.substring(0, 1); //primera letra sexo
                                  $sexoinicial_miembro = $sexoinicial_miembro.toLocaleUpperCase(); //sexo mayuscula
  
                                  $codigo_encuesta_miembro = $nombreiniciales+$apellidoiniciales+$diferenciaDias+$sexoinicial_miembro; //concateno para formar codigo_encuesta
                                  guardarInfoMiembro($codigo_encuesta_miembro, 'codigo_encuesta', conversation.miembro_hogar_preguntando, conversation.id);
                                  
                                  
                                  //conversation.pregunta += 1; //va a pregunta 42
                                  //crearEncuesta(conversation);
                                  /*return "*Nacionalidad:* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                                  "Envíe el número de acuerdo a la opción correspondiente:\n"+
                                  "*1*: Colombiana\n"+
                                  "*2*: Venezolana\n"+
                                  "*3*: Colombo-venezolana\n"+
                                  "*4*: Otro";*/
                                // This is where the magic will happen
  
                              } else {
                          
                              }
                            });

                          
                          
                          conversation.pregunta += 1; //va a pregunta 42
                          crearEncuesta(conversation);
                          mensajeRespuesta = "*Nacionalidad:* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                          "Envíe el número de acuerdo a la opción correspondiente:\n"+
                          "*1*: Colombiana\n"+
                          "*2*: Venezolana\n"+
                          "*3*: Colombo-venezolana\n"+
                          "*4*: Otro";
                        }
                      }else{
                        mensajeRespuesta = "*Fecha de Nacimiento*: (miembro #"+conversation.miembro_hogar_preguntando+")."+
                          "(Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día)";
                      }
                  
                  
                } catch (error) {
                  conversation.pregunta = 41;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Fecha de Nacimiento*: (miembro #"+conversation.miembro_hogar_preguntando+")."+
                      "(Envía la fecha en formato AAAA-MM-DD para (Año-Mes-Día)";
                }
                
              break;

          case 42:

              try {
                  switch(req.body.Body){
                   case '4':
                    guardarInfoMiembro('Otro', 'nacionalidad', conversation.miembro_hogar_preguntando, conversation.id);
                    conversation.pregunta += 1; //va a pregunta 43
                    crearEncuesta(conversation);

                    mensajeRespuesta = "¿Cuál? (Indicar nacionalidad, ejemplo: Peruana)"+ "(miembro #"+conversation.miembro_hogar_preguntando+").";
                  break;

                  case '1':
                    guardarInfoMiembro('Colombiana', 'nacionalidad', conversation.miembro_hogar_preguntando, conversation.id);
                    conversation.pregunta += 2; //va a pregunta 44
                    crearEncuesta(conversation);
                    mensajeRespuesta = "*Tipo de Documento*: (miembro #"+conversation.miembro_hogar_preguntando+")."+
                    "Envie el número de acuerdo a la opción correspondiente:\n"+
                    "*1*: Acta de Nacimiento\n"+
                    "*2*: Cédula de Identidad (venezonala)\n"+
                    "*3*: Cédula de ciudadania (colombiana)\n"+
                    "*4*: Pasaporte\n"+
                    "*5*: Cédula de Extranjería\n"+
                    "*6*: Indocumentado\n"+
                    "*7*: Otro\n";
                  break;
                  
                  case '2':
                    guardarInfoMiembro('Venezolana', 'nacionalidad', conversation.miembro_hogar_preguntando, conversation.id);
                    conversation.pregunta += 2; //va a pregunta 44
                    crearEncuesta(conversation);
                    mensajeRespuesta = "*Tipo de Documento*: (miembro #"+conversation.miembro_hogar_preguntando+")."+
                    "Envie el número de acuerdo a la opción correspondiente:\n"+
                    "*1*: Acta de Nacimiento\n"+
                    "*2*: Cédula de Identidad (venezonala)\n"+
                    "*3*: Cédula de ciudadania (colombiana)\n"+
                    "*4*: Pasaporte\n"+
                    "*5*: Cédula de Extranjería\n"+
                    "*6*: Indocumentado\n"+
                    "*7*: Otro\n";
                  break;

                  case '3':
                    guardarInfoMiembro('Colombo-venezolana', 'nacionalidad', conversation.miembro_hogar_preguntando, conversation.id);
                    conversation.pregunta += 2; //va a pregunta 44
                    crearEncuesta(conversation);
                    mensajeRespuesta = "*Tipo de Documento*: (miembro #"+conversation.miembro_hogar_preguntando+")."+
                    "Envie el número de acuerdo a la opción correspondiente:\n"+
                    "*1*: Acta de Nacimiento\n"+
                    "*2*: Cédula de Identidad (venezonala)\n"+
                    "*3*: Cédula de ciudadania (colombiana)\n"+
                    "*4*: Pasaporte\n"+
                    "*5*: Cédula de Extranjería\n"+
                    "*6*: Indocumentado\n"+
                    "*7*: Otro\n";
                    
                  break;

                  default:
                    mensajeRespuesta = "*Nacionalidad:* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                    "Envíe el número de acuerdo a la opción correspondiente:\n"+
                    "*1*: Colombiana\n"+
                    "*2*: Venezolana\n"+
                    "*3*: Colombo-venezolana\n"+
                    "*4*: Otro";

                  break;
                }
                
              } catch (error) {
                  conversation.pregunta = 42;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Nacionalidad:* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                  "Envíe el número de acuerdo a la opción correspondiente:\n"+
                  "*1*: Colombiana\n"+
                  "*2*: Venezolana\n"+
                  "*3*: Colombo-venezolana\n"+
                  "*4*: Otro";
              }

          break;

          case 43:

              try {
                guardarInfoMiembro(req.body.Body, 'cual_otro_nacionalidad', conversation.miembro_hogar_preguntando, conversation.id);
                conversation.pregunta += 1; //va a pregunta 44
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Tipo de Documento*: (miembro #"+conversation.miembro_hogar_preguntando+")."+
                  "Envie el número de acuerdo a la opción correspondiente:\n"+
                  "*1*: Acta de Nacimiento\n"+
                  "*2*: Cédula de Identidad (venezonala)\n"+
                  "*3*: Cédula de ciudadania (colombiana)\n"+
                  "*4*: Pasaporte\n"+
                  "*5*: Cédula de Extranjería\n"+
                  "*6*: Indocumentado\n"+
                  "*7*: Otro\n";
                
              } catch (error) {
                conversation.pregunta = 43;
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Cuál? (Indicar nacionalidad, ejemplo: Peruana)"+ "(miembro #"+conversation.miembro_hogar_preguntando+").";

              }

            

            break;

          case 44:

              try {
                if(req.body.Body === '7'){
                  guardarInfoMiembro(req.body.Body, 'tipo_documento', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 1; // pregunta 45
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Cuál? (Indicar tipo, ejemplo: pasaporte)";

                }else{
                  
                  switch(req.body.Body){
                    case '1':
                      guardarInfoMiembro("Acta de Nacimiento", 'tipo_documento', conversation.miembro_hogar_preguntando, conversation.id);

                      conversation.pregunta += 2;// pregunta 46
                      crearEncuesta(conversation);
                      mensajeRespuesta = '*Número de Documento:*. (miembro #'+conversation.miembro_hogar_preguntando+'). Sí no sabe el número de Documento, envíe "." (punto)';


                      break;
                    case '2':
                      guardarInfoMiembro("Cédula de Identidad (venezonala)", 'tipo_documento', conversation.miembro_hogar_preguntando, conversation.id);
                      conversation.pregunta += 2;// pregunta 46
                      crearEncuesta(conversation);
                      mensajeRespuesta = '*Número de Documento:*. (miembro #'+conversation.miembro_hogar_preguntando+'). Sí no sabe el número de Documento, envíe "." (punto)';
                      break;

                    case '3':
                        guardarInfoMiembro("Cédula de ciudadania (colombiana)", 'tipo_documento', conversation.miembro_hogar_preguntando, conversation.id);

                        conversation.pregunta += 2;// pregunta 46
                        crearEncuesta(conversation);
                        mensajeRespuesta = '*Número de Documento:*. (miembro #'+conversation.miembro_hogar_preguntando+'). Sí no sabe el número de Documento, envíe "." (punto)';
                        break;

                    case '4':
                        guardarInfoMiembro("Pasaporte", 'tipo_documento', conversation.miembro_hogar_preguntando, conversation.id);
                        conversation.pregunta += 2;// pregunta 46
                        crearEncuesta(conversation);
                        mensajeRespuesta = '*Número de Documento:*.  (miembro #'+conversation.miembro_hogar_preguntando+').Sí no sabe el número de documento, envíe "." (punto)';
                    break;

                    case '5':
                        guardarInfoMiembro("Cédula de Extranjería", 'tipo_documento', conversation.miembro_hogar_preguntando, conversation.id);

                        conversation.pregunta += 2;// pregunta 46
                        crearEncuesta(conversation);
                        mensajeRespuesta = '*Número de Documento:*. (miembro #'+conversation.miembro_hogar_preguntando+'). Sí no sabe el número de documento, envíe "." (punto)';
                    break;

                  case '6':
                        guardarInfoMiembro("Indocumentado", 'tipo_documento', conversation.miembro_hogar_preguntando, conversation.id);

                        $contadorMiembrosHogar = conversation.miembro_hogar_preguntando +1; //siguiente miembro hogar
    
                        if($contadorMiembrosHogar <= conversation.total_miembros_hogar-1){
                          conversation.miembro_hogar_preguntando +=1;
                          conversation.pregunta = 36; //empieza a preguntar a siguiente miembro hogar
                          mensajeRespuesta = "A continuación responda las preguntas para miembro #"+conversation.miembro_hogar_preguntando+"\n"+
                        "*Primer Nombre*";
                          crearEncuesta(conversation);
                        }else{
                          conversation.pregunta += 5; //Va a pregunta 49
                          crearEncuesta(conversation);
                          mensajeRespuesta = "*PASO 3 - DATOS DE CONTACTO*. "+
                          "Recuerda: es muy importante que proporciones TODOS tus datos personales de contacto, para poder localizarte en caso de resultar elegido para el programa.\n"+
                          "Por favor compartenos tu ubicación para poder localizarte de una forma más fácil";
                          //"¿En qué Municipio te encuentras en este momento?. Envía el nombre del municipio:\n"+
                          //"BOCHALEMA, BERLÍN, BUCARAMANGA, CÚCUTA, PAMPLONA, BOGOTÁ, CALI, PASTO, MEDELLÍN"*/
                         
                        }
                  break;

                    default:
                        mensajeRespuesta = "*Tipo de Documento*. (miembro #"+conversation.miembro_hogar_preguntando+")."+
                    "Envía el número de acuerdo a la opción correspondiente:\n"+
                    "*1*: Acta de Nacimiento\n"+
                    "*2*: Cédula de Identidad (venezonala)\n"+
                    "*3*: Cédula de ciudadania (colombiana)\n"+
                    "*4*: Pasaporte\n"+
                    "*5*: Cédula de Extranjería\n"+
                    "*6*: Indocumentado\n"+
                    "*7*: Otro\n";
                      break;
                  }
                 
                }
                
                
              } catch (error) {
                conversation.pregunta = 44;
                crearEncuesta(conversation);
                mensajeRespuesta = "*Tipo de Documento*: (miembro #"+conversation.miembro_hogar_preguntando+")."+
                  "Envie el número de acuerdo a la opción correspondiente:\n"+
                  "*1*: Acta de Nacimiento\n"+
                  "*2*: Cédula de Identidad (venezonala)\n"+
                  "*3*: Cédula de ciudadania (colombiana)\n"+
                  "*4*: Pasaporte\n"+
                  "*5*: Cédula de Extranjería\n"+
                  "*6*: Indocumentado\n"+
                  "*7*: Otro\n";
              }
           

          break;

          case 45:
                try {
                  guardarInfoMiembro(req.body.Body, 'cual_otro_tipo_documento', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 1; // pregunta 46
                  crearEncuesta(conversation);
                  mensajeRespuesta = '*Número de Documento:*. (miembro #'+conversation.miembro_hogar_preguntando+'). Sí no sabe el número de Documento, envíe "." (punto)';

                } catch (error) {
                  conversation.pregunta = 45;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Cuál? (Indicar tipo, ejemplo: pasaporte)";

                }
                  
          break;

          case 46:

                try {
                  guardarInfoMiembro(req.body.Body, 'numero_documento', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 1; // pregunta 47
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías compartir una fotografía del documento de identidad de este miembro del hogar? (miembro #"+conversation.miembro_hogar_preguntando+"). "+
                  "Responde con el número correspondiente:\n"+
                  "*1*: Sí\n"+
                  "*2*: No\n";
                  
                } catch (error) {
                  conversation.pregunta = 46; // pregunta 46
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Número de documento* (miembro #"+conversation.miembro_hogar_preguntando+").";

                }
                   
        
              break;

              case 47:

                  try {

                    switch(req.body.Body){
                      case '1':
                        guardarInfoMiembro('1', 'compartir_foto_documento', conversation.miembro_hogar_preguntando, conversation.id);
                        conversation.pregunta += 1; // pregunta 48
                        crearEncuesta(conversation);
                        mensajeRespuesta = "Por favor carga una fotografía del documento del miembro #"+conversation.miembro_hogar_preguntando+") aquí:";
                      break;
                      
                      case '2':
                        guardarInfoMiembro('0', 'compartir_foto_documento', conversation.miembro_hogar_preguntando, conversation.id);
                        
                        $contadorMiembrosHogar = conversation.miembro_hogar_preguntando + 1;

                        if($contadorMiembrosHogar <= conversation.total_miembros_hogar-1){
                          conversation.miembro_hogar_preguntando +=1;
                          conversation.pregunta = 36; //empieza a preguntar a siguiente miembro hogar
                          crearEncuesta(conversation);
                          mensajeRespuesta = "A continuación responda las preguntas para miembro #"+conversation.miembro_hogar_preguntando+"\n"+
                        "*Primer Nombre*";
                          
                        }else{
                          conversation.pregunta += 2; //Va a pregunta 49
                          crearEncuesta(conversation);
                          mensajeRespuesta = "*PASO 3 - DATOS DE CONTACTO*. "+
                          "Recuerda: es muy importante que proporciones TODOS tus datos personales de contacto, para poder localizarte en caso de resultar elegido para el programa.\n"+
                          "Por favor compartenos tu ubicación para poder localizarte de una forma más fácil";
                          //"¿En qué Municipio te encuentras en este momento?. Envía el nombre del municipio:\n"+
                          //"BOCHALEMA, BERLÍN, BUCARAMANGA, CÚCUTA, PAMPLONA, BOGOTÁ, CALI, PASTO, MEDELLÍN"*/
                        }
                      break;

                      default:
                        mensajeRespuesta = "¿Podrías compartir una fotografía del documento de identidad de este miembro del hogar? (miembro #"+conversation.miembro_hogar_preguntando+"). "+
                        "Responde con el número correspondiente:\n"+
                        "*1*: Sí\n"+
                        "*2*: No\n";

                      break;
                    }
                  } catch (error) {
                    conversation.pregunta = 47; // pregunta 47
                    crearEncuesta(conversation);
                    mensajeRespuesta = "¿Podrías compartir una fotografía del documento de identidad de este miembro del hogar? (miembro #"+conversation.miembro_hogar_preguntando+"). "+
                    "Responde con el número correspondiente:\n"+
                    "*1*: Sí\n"+
                    "*2*: No\n";
                  }
                  

              break;


              case 48:

                  try {
                    guardarInfoMiembro(req.body.Body, 'url_foto_documento', conversation.miembro_hogar_preguntando, conversation.id);
                
                    $contadorMiembrosHogar = conversation.miembro_hogar_preguntando +1; //siguiente miembro hogar
    
                        if($contadorMiembrosHogar <= conversation.total_miembros_hogar-1){
                          conversation.miembro_hogar_preguntando +=1;
                          conversation.pregunta = 36; //empieza a preguntar a siguiente miembro hogar
                          mensajeRespuesta = "A continuación responda las preguntas para miembro #"+conversation.miembro_hogar_preguntando+"\n"+
                        "*Primer Nombre*";
                          crearEncuesta(conversation);
                          
                        }else{
                          conversation.pregunta += 1; //Va a pregunta 49
                          crearEncuesta(conversation);
                          mensajeRespuesta = "*PASO 3 - DATOS DE CONTACTO*. "+
                          "Recuerda: es muy importante que proporciones TODOS tus datos personales de contacto, para poder localizarte en caso de resultar elegido para el programa.\n"+
                          "Por favor compartenos tu ubicación para poder localizarte de una forma más fácil";
                          //"¿En qué Municipio te encuentras en este momento?. Envía el nombre del municipio:\n"+
                          //"BOCHALEMA, BERLÍN, BUCARAMANGA, CÚCUTA, PAMPLONA, BOGOTÁ, CALI, PASTO, MEDELLÍN"*/
                         
    
                        }
                    
                  } catch (error) {
                    conversation.pregunta = 48; // pregunta 48
                    crearEncuesta(conversation);
                    mensajeRespuesta = "Por favor carga una fotografía de tu documento aquí";
                  }
               
  
              break;


              case 49:
                
                  try {
                    
                      if(req.body.Latitude && req.body.Longitude){
                          
                          autorizacionAsignarCoordenadasUbicacion(req.body.Longitude, req.body.Latitude, conversation.id);
                          conversation.pregunta +=1; //va a pregunta 50
                          crearEncuesta(conversation);
                          mensajeRespuesta = "¿El número de contacto ha sido entregado por VenEsperanza?. Responda con el número según la opción:\n"+
                          "*1*: Sí\n"+
                          "*2*: No";
                      }else{
                        mensajeRespuesta = "Por favor compartenos tu ubicación para poder localizarte de una forma más fácil";

                      }
                  } catch (error) {
                    conversation.pregunta = 49; // pregunta 48
                    crearEncuesta(conversation);
                    mensajeRespuesta = "Por favor compartenos tu ubicación para poder localizarte de una forma más fácil";
                  }

                
                /*
                    if(req.body.Body === "BOCHALEMA" || req.body.Body === "BERLÍN" || req.body.Body === "BUCARAMANGA" || req.body.Body === "CÚCUTA" || req.body.Body === "PAMPLONA" ||
                     req.body.Body === "BOGOTÁ" || req.body.Body === "CALI" || req.body.Body === "PASTO" || req.body.Body === "MEDELLÍN"){
                          conversation.pregunta += 1; //Va a pregunta 37 paso 3
                          conversation.ubicacion = req.body.Body; 
                          crearEncuesta(conversation);
                          mensajeRespuesta = "¿El número de contacto ha sido entregado por VenEsperanza?. Responda con el número según la opción:\n"+
                          "*1*: Sí\n"+
                          "*2*: No";
                     }*/
                  
                
  
              break;

              case 50:
                
                try {
                  switch(req.body.Body){
                    case '1':
                        conversation.numero_entregado_venesperanza = true;
                        conversation.pregunta += 1; //Va a pregunta 51
                      
                        crearEncuesta(conversation);
                        mensajeRespuesta = "Ingresa el Número de Contacto VenEsperanza:";
                    break;

                    case '2':
                        conversation.numero_entregado_venesperanza = false;
                        conversation.pregunta += 1; //Va a pregunta 51

                        crearEncuesta(conversation);
                        mensajeRespuesta = "Ingresa el Número de Contacto principal:";
                    break;

                    default:
                      mensajeRespuesta = "¿El número de contacto ha sido entregado por VenEsperanza?. Responda con el número según la opción:\n"+
                          "*1*: Sí\n"+
                          "*2*: No";
                    break;
                  }
                } catch (error) {
                  mensajeRespuesta = "¿El número de contacto ha sido entregado por VenEsperanza?. Responda con el número según la opción:\n"+
                          "*1*: Sí\n"+
                          "*2*: No";
                  
                }
               
              break;

            case 51:

                try {
                  
                    var valoresAceptados = /^[0-9]/;
                    if(req.body.Body.match(valoresAceptados)){
                      conversation.numero_contacto = req.body.Body;
                      conversation.pregunta += 1; //Va a pregunta 52

                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿Esta línea de contacto es propia?. Responda con el número según la opción:\n"+
                    "*1*: Sí\n"+
                    "*2*: No";

                    }else{
                      if(conversation.numero_entregado_venesperanza == true){
    
                        mensajeRespuesta = "Ingresa el Número de Contacto VenEsperanza:";
    
                      }else if(conversation.numero_entregado_venesperanza == false){
        
                        mensajeRespuesta = "Ingresa el Número de Contacto principal:";
    
                      }
                    }
                } catch (error) {
                  if(conversation.numero_entregado_venesperanza == true){
                    conversation.pregunta = 51; //Vuelve a preguntar 51

                    crearEncuesta(conversation);
                    mensajeRespuesta = "Ingresa el Número de Contacto VenEsperanza:";

                  }else if(conversation.numero_entregado_venesperanza == false){

                    conversation.pregunta = 51; //Vuelve a preguntar 51

                    crearEncuesta(conversation);
                    mensajeRespuesta = "Ingresa el Número de Contacto principal:";

                  }
                  
                }

            break;

            case 52:

                try {
                  switch(req.body.Body){
                    case '1':
                        conversation.linea_contacto_propia = true;
                        conversation.pregunta += 1; //Va a pregunta 53
                        crearEncuesta(conversation);
                        mensajeRespuesta = "¿Esta línea de contacto está asociada a WhatsApp?. Responda con el número según la opción:\n"+
                        "*1*: Sí\n"+
                        "*2*: No";
                    
                        break;

                    case '2':

                      conversation.linea_contacto_propia = false;
                      conversation.pregunta += 1; //Va a pregunta 53
                      //conversation.encuesta = false;
                          
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿Esta línea de contacto está asociada a WhatsApp?. Responda con el número según la opción:\n"+
                      "*1*: Sí\n"+
                      "*2*: No";


                        break;

                    default:
                      mensajeRespuesta = "¿Esta línea de contacto es propia?. Responda con el número según la opción:\n"+
                    "*1*: Sí\n"+
                    "*2*: No";
                      break;
                  }
                  
                } catch (error) {
                  conversation.pregunta = 52; //Vuelve a preguntar 52

                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿Esta línea de contacto es propia?. Responda con el número según la opción:\n"+
                      "*1*: Sí\n"+
                      "*2*: No";
                        break;
                }

            break;

            case 53:
              try {

                  switch(req.body.Body){
                    case '1':

                      conversation.pregunta += 2; //Va a pregunta 55 paso 3
                      conversation.linea_asociada_whatsapp = true;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "Número de contacto alternativo:";
                    break;

                    case '2':
                      conversation.pregunta += 1; //Va a pregunta 54 paso 3
                      conversation.linea_asociada_whatsapp = false;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "Por favor agrega tu número de Whatsapp:";
                      break;

                  default:

                    mensajeRespuesta = "¿Esta línea de contacto está asociada a WhatsApp?. Responda con el número según la opción:\n"+
                    "*1*: Sí\n"+
                    "*2*: No";

                    break;
                }
                
              } catch (error) {
                conversation.pregunta = 53; //Vuelve a preguntar 53

                      crearEncuesta(conversation);
                mensajeRespuesta = "¿Esta línea de contacto está asociada a WhatsApp?. Responda con el número según la opción:\n"+
                      "*1*: Sí\n"+
                      "*2*: No";
              }
            
            break;


            case 54:

              conversation.pregunta += 1; //Va a pregunta 55 paso 3
              conversation.numero_whatsapp_principal = req.body.Body;
              crearEncuesta(conversation);
              mensajeRespuesta = "Número de contacto alternativo:";

            break;

            case 55:

              conversation.pregunta += 1; //Va a pregunta 56 paso 3
              conversation.numero_alternativo = req.body.Body;
              crearEncuesta(conversation);
              mensajeRespuesta = "¿Esta línea de contacto es propia?. Responda con el número según la opción:\n"+
                    "*1*: Sí\n"+
                    "*2*: No";

            break;

            case 56:

              if(req.body.Body === '1'){
                
                conversation.pregunta += 1; //Va a pregunta 57 paso 3
                conversation.linea_contacto_alternativo = true;
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Esta línea de contacto está asociada a WhatsApp?. Responda con el número según la opción:\n"+
                "*1*: Sí\n"+
                      "*2*: No";

              }else if(req.body.Body === '2'){

                conversation.pregunta += 1; //Va a pregunta 57 paso 3
                conversation.linea_contacto_alternativo = false;
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Esta línea de contacto está asociada a WhatsApp?. Responda con el número según la opción:\n"+
                "*1*: Sí\n"+
                      "*2*: No";;

              }else{
                mensajeRespuesta = "¿Esta línea de contacto es propia?. Responda con el número según la opción:\n"+
                    "*1*: Sí\n"+
                    "*2*: No";
              }
            
            break;


            case 57:

              switch(req.body.Body){
                case '1':

                  conversation.pregunta += 1; //Va a pregunta 58 paso 3
                  conversation.linea_alternativa_asociada_whatsapp = true;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "Escribe un correo electrónico donde te podamos contactar";
                break;

                case '2':
                  conversation.pregunta += 1; //Va a pregunta 58 paso 3
                  conversation.linea_alternativa_asociada_whatsapp = false;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "Escribe un correo electrónico donde te podamos contactar";
                  break;

              default:

                mensajeRespuesta = "¿Esta línea de contacto está asociada a WhatsApp?. Responda con el número según la opción:\n"+
                "*1*: Sí\n"+
                      "*2*: No";

                break;
            }

            break;


            case 58:

              conversation.pregunta += 1; //Va a pregunta 59 paso 3
              conversation.correo_electronico = req.body.Body;
              crearEncuesta(conversation);
              mensajeRespuesta = "¿Tienes cuenta en Facebook?. Responde con el número según la opción:\n"+
              "*1*: Sí\n"+
                      "*2*: No";

            break;

            case 59:

              switch(req.body.Body){

                case '1':

                  conversation.pregunta += 1; //Va a pregunta 60 paso 3
                  conversation.tiene_cuenta_facebook = true;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Cuál es la cuenta?";
                  break;

                case '2':

                  conversation.pregunta += 2; //Va a pregunta 61 paso 3
                  conversation.tiene_cuenta_facebook = false;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podemos contactarte el momento en el que llegues a tu destino final?"+
                  "Responde con el númeor según la opción correspondiente:\n"+
                  "*1*: Sí\n"+
                      "*2*: No";
                  break;

                default:
                  mensajeRespuesta = "¿Tienes cuenta en Facebook?. Responde con el número según la opción:\n"+
              "*1*: Sí\n"+
                      "*2*: No";
                  break;
              }

            break;

            case 60:

              conversation.pregunta += 1; //Va a pregunta 62 paso 3
              conversation.cuenta_facebook = req.body.Body;
              crearEncuesta(conversation);
              mensajeRespuesta = "¿Podemos contactarte el momento en el que llegues a tu destino final?"+
              "Responde con el númeor según la opción correspondiente:\n"+
              "*1*: Sí\n"+
                  "*2*: No";

            break;

            case 61:

              switch(req.body.Body){

                case '1':

                  conversation.pregunta += 1; //Va a pregunta 62 paso 3
                  conversation.podemos_contactarte = true;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Cuál sería la mejor forma para contactarte?. Responde con el número según la opción:\n"+
                  "*1*: Por llamada\n"+
                  "*2*: WhatsApp\n"+
                  "*3*: Facebook\n"+
                  "*4*: Correo electrónico\n"+
                  "*5*: Otro";
                  break;

                case '2':

                  conversation.pregunta += 3; //Va a pregunta 64 paso 3
                  conversation.podemos_contactarte = false;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                  
                  break;

                default:
                  mensajeRespuesta = "¿Podemos contactarte el momento en el que llegues a tu destino final?"+
              "Responde con el númeor según la opción correspondiente:\n"+
              "*1*: Sí\n"+
                  "*2*: No";
                  break;
              }

            break;

            case 62:

              switch(req.body.Body){
                
                case '1':
                  conversation.forma_contactarte = "Por llamada";
                  conversation.pregunta += 2; //pasa a pregunta 64
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                  break;
                
                case '2':

                  conversation.forma_contactarte = "WhatsApp";
                  conversation.pregunta += 2; //pasa a pregunta 64
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                  break;
                
                case '3':
                  conversation.forma_contactarte = "Facebook";
                  conversation.pregunta += 2; //pasa a pregunta 64
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                break;

                case '4':
                  conversation.forma_contactarte = "Correo electrónico";
                  conversation.pregunta += 2; //pasa a pregunta 64
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                break;

                case '5':

                  conversation.forma_contactarte = "Otro";
                  conversation.pregunta += 1; //pasa a pregunta 63
                  crearEncuesta(conversation);
                  mensajeRespuesta = "Envía otra opción para contactarte";

                break;

                default:
                  mensajeRespuesta = "¿Cuál sería la mejor forma para contactarte?. Responde con el número según la opción:\n"+
                  "*1*: Por llamada\n"+
                  "*2*: WhatsApp\n"+
                  "*3*: Facebook\n"+
                  "*4*: Correo electrónico\n"+
                  "*5*: Otro";
                  break;

              }
              

            break;

            case 63:
              conversation.otra_forma_contactarte = req.body.Body;
                  conversation.pregunta += 1; //pasa a pregunta 64
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                
            break;

            case 64:
                  conversation.comentario = req.body.Body;
                  conversation.encuesta_chatbot = false;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¡Gracias por participar!\n"+
                  "Si eres preseleccionado/a el programa #VenEsperanza se comunicará contigo\n"+
                  "Recuerda:\n"+
                  "En el programa #VenEsperanza no cobramos ni pedimos remuneración por ningún servicio a la comunidad, no tenemos intermediarios."
            break;

            
          }
            
            
        }

        

      }else if(conversation.actualizar == true){

      }else if(conversation.reportar == true){

      //}else if(conversation.encuesta == false //&& conversation.actualizar == false && conversation.reportar == false*/
       //   && (req.body.Body === '1' /*|| req.body.Body === '2' || req.body.Body === '3'*/)){
      }else if(conversation.encuesta_chatbot == false && req.body.Body === '1'){
  
        console.log('ENCUESTA FALSE Y BODY 1', req.body.Body);
          switch (req.body.Body) {
              case '1':
  
                      if(conversation.pregunta == null){

                        try {
                          conversation.encuesta_chatbot = true;
                          crearEncuesta(conversation);
                          console.log('ENTRA A TRUE EN LINEA 540???');
                              mensajeRespuesta = 'Términos de participación\n'+
                              'El objetivo de esta encuesta es valorar si es posible que seas elegido/a para ingresar a programas de asistencia humanitaria en el momento en que llegas a tu destino.\n'+
                              'Este proceso es gratuito.\n'+
                              
                              'Somos un programa de atención humanitaria y no compartiremos tus datos personales con el Gobierno Colombiano, por lo que completar este formulario no tiene ningún efecto legal sobre tu condición migratoria o tu estatus legal en Colombia.\n'+
                              
                              'Ten presente que solo te puedes registrar una única vez en este proceso.'+
                              'Hacer registros múltiples podría ponerte en riesgo de quedar descalificado del programa #VenEsperanza. Por favor registra en este mismo formulario a todos los miembros de tu familia que actualmente te acompañan, no hagas registros individuales pues podría resultar en registros duplicados que serían descalificados.\n'+
                              
                              'Tu participación es voluntaria.'+
                              'Puedes decidir no participar o retirarte en cualquier momento del proceso.\n'+
                              //'Diligenciar este formulario te tomará aproximadamente 10 minutos.'+
                              
                              //'Responder a estas preguntas no quiere decir que tú y tu familia serán automáticamente seleccionados. Si eres preseleccionado, serás contactado por la organización que represente el programa #VenEsperanza para continuar con el proceso, por eso es muy importante que proporciones en este formulario todos tus datos personales de contacto, para poder localizarte en caso de resultar elegido para el programa.'+
                              
                              //'Tu información es confidencial, sin embargo, el programa #VenEsperanza podría tener que compartir parte de tus datos de manera segura con otras organizaciones humanitarias, nuestro donante, las Naciones Unidas y otras ONG’s nacionales e internacionales, para evitar posibles casos de atención duplicada o fraude, para referir tu hogar a servicios adicionales y para contribuir en iniciativas de investigación conjuntas de carácter humanitario.'+
                              
                              //'Este proceso de identificación de datos incluye preguntas sobre tu situación actual. La información que entregues será verificada por la organización.\n\n'+
                              
                              'Por favor responde con tus datos reales'+
                              '\nPara conocer la política de tratamiento de datos personales visita el enlace: https://venesperanza.immap.org/assets/politica_tratamiento_informacion_personal.pdf.\n\n'+
                              
                              'Envía el número *1* sí:\n'+
                              '- Aceptas el tratamiento de tus datos personales al programa #VenEsperanza, como responsable de tu información y para autorizar el tratamiento de tus datos personales, conforme a lo informado previamente.\n'+
                              '- Entiendes y aceptas los términos y condiciones establecidos para participar en el programa.\n\n'+
                              'Envía el número *2* sí NO estás de acuerdo';

                          
                        } catch (error) {
                          mensajeRespuesta = 'Venesperanza es un programa de asistencia humanitaria financiado por USAID.\n\n'+
                                'Esta plataforma, es un mecanismo de registro para hogares de personas que recién llegan a Colombia como migrantes. Este proceso es gratuito.'+
                                'Por favor, continúa sólo si:'+
                                '- Eres parte de una familia migrante venezolana o colombiano retornado que llegó a Colombia.'+
                                '- Llevas tres meses o menos en Colombia.'+
                                '- No te has registrado previamente ni tu, ni ningún miembro de tu familia.'+
                                'Tu participación es voluntaria. Puedes decidir no participar o retirarte en cualquier momento del proceso.\n\n'+
                                //'\n\nPara continuar envía el número *1* para responder a las preguntas.';
                                'Para continuar envía el número correspondiente a una de las siguientes opciones:\n'+
                                '*1*: Llenar formulario\n'/*+
                                '*2*: Actualizar datos\n'+
                                '*3*: Reportar llegada\n'*/;
                          
                        }
                      
                      }else{
                        mensajeRespuesta = 'Ya has respondido el formulario. Gracias';
                      }
  
                break;
              
              case '2':
  
                      mensajeRespuesta = 'Vas a actualizar tus datos';
                      conversation.actualizar = true;
              break;
  
              case '3':
  
                      mensajeRespuesta = 'Vas a reportar llegada';
                      conversation.reportar = true;
              break;

              default:
                mensajeRespuesta = 'Venesperanza es un programa de asistencia humanitaria financiado por USAID.\n\n'+
                'Esta plataforma, es un mecanismo de registro para hogares de personas que recién llegan a Colombia como migrantes. Este proceso es gratuito.'+
                                'Por favor, continúa sólo si:'+
                                '- Eres parte de una familia migrante venezolana o colombiano retornado que llegó a Colombia.'+
                                '- Llevas tres meses o menos en Colombia.'+
                                '- No te has registrado previamente ni tu, ni ningún miembro de tu familia.'+
                                'Tu participación es voluntaria. Puedes decidir no participar o retirarte en cualquier momento del proceso.\n\n'+
                                //'\n\nPara continuar envía el número *1* para responder a las preguntas.';
                                'Para continuar envía el número correspondiente a una de las siguientes opciones:\n'+
                                '*1*: Llenar formulario\n'/*+
                                '*2*: Actualizar datos\n'+
                                '*3*: Reportar llegada\n'*/;
  
          }
  
      }else{
        mensajeRespuesta = 'Venesperanza es un programa de asistencia humanitaria financiado por USAID.\n'+
        'Esta plataforma, es un mecanismo de registro para hogares de personas que recién llegan a Colombia como migrantes. Este proceso es gratuito.'+
                        'Por favor, continúa sólo si:\n'+
                        '- Eres parte de una familia migrante venezolana o colombiano retornado que llegó a Colombia.\n'+
                        '- Llevas tres meses o menos en Colombia.\n'+
                        '- No te has registrado previamente ni tu, ni ningún miembro de tu familia.\n'+
                        'Tu participación es voluntaria. Puedes decidir no participar o retirarte en cualquier momento del proceso.\n\n'+
                                //'\n\nPara continuar envía el número *1* para responder a las preguntas.';
                                'Para continuar envía el número correspondiente a una de las siguientes opciones:\n'+
                                '*1*: Llenar formulario\n'/*+
                                '*2*: Actualizar datos\n'+
                                '*3*: Reportar llegada\n'*/;
                        

      }
      
  }else{

    try {
      conversation.conversation_start = true;
                        //console.log('IDNECUESTA: ', idencuesta);             
     crearEncuesta(conversation);

      mensajeRespuesta = 'Venesperanza es un programa de asistencia humanitaria financiado por USAID. Esta plataforma, es un mecanismo de registro para hogares de personas que recién llegan a Colombia como migrantes. Este proceso es gratuito.'+
      'Por favor, continúa sólo si:\n'+
      '- Eres parte de una familia migrante venezolana o colombiano retornado que llegó a Colombia.\n'+
      '- Llevas tres meses o menos en Colombia.\n'+
      '- No te has registrado previamente ni tu, ni ningún miembro de tu familia.\n'+
      'Tu participación es voluntaria. Puedes decidir no participar o retirarte en cualquier momento del proceso.\n\n'+
      //'\n\nPara continuar envía el número *1* para responder a las preguntas.';
      'Para continuar envía el número correspondiente a una de las siguientes opciones:\n'+
      '*1*: Llenar formulario\n'/*+
      '*2*: Actualizar datos\n'+
      '*3*: Reportar llegada\n'*/;
      
    } catch (error) {
      
    }
    
  }

        client.messages
      .create({
         from: 'whatsapp:+14155238886',
         body: mensajeRespuesta,
         to: req.body.From
       })
      .then(message => console.log(message.body));

  }
  
});

connection.connect(error => {
  if (error) throw error;
  console.log('Database server running OK');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
/*
const TWILIO_ID = 'ACb4ee49c4ecdf005c1ef4b63215c71b15'
const TWILIO_SK = '9bcfbaf8c33f103cb8e63d9c4ffb1eca'

const client = require('twilio')(TWILIO_ID, TWILIO_SK);

client.messages
      .create({
         from: 'whatsapp:+14155238886',
         body: 'Hello mensaje desde Twilio prueba!',
         to: 'whatsapp:+573229562177'
       })
      .then(message => console.log(message.sid));
*/
      //client.initialize();