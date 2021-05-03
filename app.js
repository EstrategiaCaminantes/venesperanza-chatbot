const express = require('express');
const bodyParser = require('body-parser');
const nodemon = require('nodemon');
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
  //console.log('CLIENTE: ', client);
  //console.log(req.body.Body);
  //console.log(req.body.To);
  //console.log(req.body.ProfileName);
  console.log('TODA INFO: ',req.body);


 


  const sql = `SELECT * FROM conversacion where waId = '${req.body.WaId}'`;
  
    
  connection.query(sql, (error,results)=>{

    console.log('RESULTS DE BUSCAR CONVERSACION: ', results);
      if (error) throw error;

      if (results.length > 0){

        var $conversation = results[0];

        conversacion($conversation);
      }else{

        //console.log('RESULTS QUERY SELECT: ', results);
        nuevaConversacion();

      }
    });

  function nuevaConversacion(){
    //const sqlnuevo =  `INSERT INTO conversacion (id, waId, profileName, encuesta) VALUES (NULL, ${req.body.waId}, ${req.body.profileName},0)`;
    const sqlnuevo = 'INSERT INTO conversacion SET ?';

    console.log('PARAMS NUEVA CONVERSA: ', req.body);
    const params = req.body;
    //console.log('PARAMS SON: ', params);
    
    const nuevaconversacion = {
      waId: params.WaId,
      profileName: params.ProfileName,
      encuesta: false, 
      paso: null,
      pregunta: null
    }

    connection.query(sqlnuevo, nuevaconversacion, (error,results)=>{
      if (error) throw error;

      //console.log('RESULTS QUERY NUEVO: ', results);
      conversacion(nuevaconversacion);

    });
  }


  function asignarCoordenadas($editconversacion){
    const sql = `UPDATE conversacion SET longitud = '${$editconversacion.longitud}', latitud = '${$editconversacion.latitud}' where id = ${$editconversacion.id}`;

   connection.query(sql, (error,res)=>{
    if (error) throw error;

    });

  }

  function crearEncuesta($conversa){
    console.log('CONVERSA EN CREAR ENCUESTA: ', $conversa);

  
    const sqlCreaEncuesta = `UPDATE conversacion SET encuesta = ${$conversa.encuesta}, paso = ${$conversa.paso}, pregunta = ${$conversa.pregunta},
    como_llego_al_formulario = '${$conversa.como_llego_al_formulario}', donde_encontro_formulario = '${$conversa.donde_encontro_formulario}', fecha_llegada = '${$conversa.fecha_llegada}',
    estar_dentro_colombia = ${$conversa.estar_dentro_colombia}, id_departamento_destino_final = '${$conversa.id_departamento_destino_final}',
    id_municipio_destino_final = '${$conversa.id_municipio_destino_final}',
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

      
      console.log('DATOS ACTUALIZAR MIEMBRO :');
      //console.log('CAMPO: ', $campo);
      //console.log('VALOR: ', $valor);
      console.log('ID ENCUESTA: ', $id_encuesta);
      console.log('NUMERO MIEMBRO: ', $numero_miembro);
      const sqlUpdateMiembro = `UPDATE miembros_hogar SET ${$campo} = '${$valor}' WHERE id_encuesta = ${$id_encuesta} AND numero_miembro = ${$numero_miembro} `
      connection.query(sqlUpdateMiembro, (error,res)=>{
        if (error) throw error;
    
        });

    }
    

  }

  function is_in_polygon($points_polygon, $vertices_x, $vertices_y, $latitude_y, $longitude_x)
    {
      /*console.log('PUNTOS POLIGONO::: ', $points_polygon);
      console.log('LATITUDE Y::: ', $latitude_y);
      console.log('VERTICES Y:: ', $vertices_y);
      console.log('LONGITUDE X::: ', $latitude_y);
      console.log('VERTICES X:: ', $vertices_x);*/
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
    }


  function conversacion(conversation){

    var mensajeRespuesta = '';

  

        //Cuando no envia ubicacion.
        //Por defecto se muestra el saludo con las opciones para responder.
        //Cuando responde alguno de los numeros 1,2,3,4 o 5 se muestra mensaje correspondiente.
        if(req.body.Body !== '' && (req.body.Body !== "ENCUESTA" && req.body.Body !== "TERMINAR") && conversation.encuesta == false ){

          /*
          if(conversation.encuesta == false){
            console.log('EL FALSE SISRVE: ', conversation.encuesta);
          }else{
            console.log('EL FALSE NO SIRVE: ', conversation.encuesta);
          }*/
            switch (req.body.Body) {
              case '1':

                      mensajeRespuesta = 'Vas a crear nuevo pedido'
                break;
              
              case '2':

                      mensajeRespuesta = 'Vas a hacer un reclamo'
              break;

              case '3':

                      mensajeRespuesta = 'Quieres contactar a un agente de servicio al cliente'
              break;

              case '4':

                      mensajeRespuesta = 'Envianos tu ubicación'
              break;

              case '5':
                      
                      mensajeRespuesta = 'Quieres terminar el proceso. Hasta luego Gracias'
              break;
            
              default:
                      mensajeRespuesta = 'Hello *_'+ req.body.ProfileName+ '_*. Welcome to Tienda Online!\n'+
                      'Selecciona entre las siguientes opciones:\n'+
                      '*1*: Crear Nuevo Pedido.\n'+
                      '*2*: Hacer un reclamo.\n'+
                      '*3*: Contactar agente de servicio al cliente\n'+
                      '*4*: Quiero enviar mi ubicación para mejor servicio\n'+
                      '*5*: Terminar'
              
              break;

              }
        }else if(req.body.Latitude && req.body.Longitude){
          //Cuando se envia ubicacion
          //Se valida si la ubicacion esta dentro de la zona(poligono) de Villa del Rosario-Norte Santander (ejemplo)
          conversation.latitud = req.body.Latitude;
          conversation.longitud = req.body.Longitude;

          asignarCoordenadas(conversation);


          const jsonVilla = require('./villaDelRosarioGeoJSON.json'); //poligono villa del rosario

          var $arrayLatitudes = [];
          var $arrayLongitudes = [];
          
          jsonVilla.forEach( (element,index) => {

            $arrayLatitudes.push( element['geometry']['coordinates'][0]);
            $arrayLongitudes.push(element['geometry']['coordinates'][1]);
          
          });

          const $totalpuntos = $arrayLongitudes.length - 1; //numero de vertices

          //Valida si las coordenadas estan dentro del poligono 
          var $posicionEnPoligono = is_in_polygon($totalpuntos, $arrayLongitudes,
            //latitude: 7.833115,longitude:-72.4779557
            //7.864320, -72.465210
            $arrayLatitudes, /*-72.465210, 7.864320*/ req.body.Longitude,req.body.Latitude);

          console.log('POSICION EN POLIGONO::::: ', $posicionEnPoligono);

          //mensajeRespuesta = "Estás ubicado en Colombia";
          var newlat = parseFloat(req.body.Latitude);
          var prueba = 7.128

          //Si las coordenadas estan dentro de poligono hace nuevas preguntas
          //Si esta por fuera del poligono termina proceso
          switch (true) {
            /*case (newlat< prueba):
                    mensajeRespuesta= "Estás en tu casa! Tu ubicacion es: "+req.body.Latitude+ ","+req.body.Longitude

              break;*/
            case ($posicionEnPoligono == true):
              mensajeRespuesta = "Estás en villa del rosario Norte de Santander!\n"+
              "Responda con la palabra *_ENCUESTA_* para responder una encuesta sobre datos suyos y de sus familiares."+
              "De lo contraro responda *_TERMINAR_*"
            
              break;
            
            default:
                
              /*if(newlat<prueba){
                console.log('SI ES MENOR')
              }*/
              
                    mensajeRespuesta= "No sabemos dónde estás! Tu ubicación es: "+req.body.Latitude+ ","+req.body.Longitude+".\n"+
                    "Gracias hasta una próxima ocasión!";

              break;
          }
        }else if(req.body.Body === "ENCUESTA" || req.body.Body === "TERMINAR"){

          switch(req.body.Body){
            case "ENCUESTA":

              conversation.encuesta = true;
              conversation.paso = 1;
              conversation.pregunta = 11; //va a pregunta 11
              mensajeRespuesta = "*PASO 1 - DATOS DE LLEGADA Y DESTINO:* \n"+
              "¿Cómo encontraste este formulario? - Selecciona entre las siguientes opciones enviando el número de la opción correspondente:\n"+
              "*1*: Ví un pendón en un albergue\n"+
              "*2*: Recibí un volante en el albergue\n"+
              "*3*: Recibí una foto con la información\n"+
              "*4*: Recibí el enlache por chat\n"+
              "*5*: Encontré el enlace en Facebook\n"+
              "*6*: Una persona conocida me lo envió para que lo llenara\n"+
              "*7*: Otro\n";

              crearEncuesta(conversation);

              break;

            case "TERMINAR":
                conversation.encuesta = false;
                mensajeRespuesta = "Gracias hasta una próxima ocasión!"
                crearEncuesta(conversation);

            default:
              break;

          }
        }else if(conversation.encuesta == true){

          switch(conversation.pregunta){
            case 11:
              console.log('RESPUESTA PREGUNTA 1: ', req.body.Body);
              
                switch(req.body.Body){
                  case '1':
                      conversation.pregunta += 2; //va a pregunta 13
                      conversation.como_llego_al_formulario = "Ví un pendón en un albergue";
                      conversation.donde_encontro_formulario = null;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "Pregunta 3: ¿En qué fecha tu y tu grupo familiar llegaron al país? Escriba la fecha en formato DD-MM-AA para (Día-Mes-Año)";

                    break;

                  case '2':
                    conversation.pregunta += 2; //va a pregunta 13
                    conversation.como_llego_al_formulario = "Recibí un volante en el albergue";
                    conversation.donde_encontro_formulario = null;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "Pregunta 3: ¿En qué fecha tu y tu grupo familiar llegaron al país? Escriba la fecha en formato DD-MM-AA para (Día-Mes-Año)";

                    break;
                  
                  case '3':
                    conversation.pregunta += 2; //va a pregunta 13
                    conversation.como_llego_al_formulario = "Recibí una foto con la información";
                    conversation.donde_encontro_formulario = null;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "Pregunta 3: ¿En qué fecha tu y tu grupo familiar llegaron al país? Escriba la fecha en formato DD-MM-AA para (Día-Mes-Año)";

                    break;

                  case '4':
                    conversation.pregunta += 2; //va a pregunta 13
                    conversation.como_llego_al_formulario = "Recibí el enlache por chat";
                    conversation.donde_encontro_formulario = null;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "Pregunta 3: ¿En qué fecha tu y tu grupo familiar llegaron al país? Escriba la fecha en formato DD-MM-AA para (Día-Mes-Año)";

                    break;

                  case '5':
                    conversation.pregunta += 2; //va a pregunta 13
                    conversation.como_llego_al_formulario = "Encontré el enlace en Facebook";
                    conversation.donde_encontro_formulario = null;
                      crearEncuesta(conversation);
                      mensajeRespuesta = "Pregunta 3: ¿En qué fecha tu y tu grupo familiar llegaron al país? Escriba la fecha en formato DD-MM-AA para (Día-Mes-Año)";

                    break;

                    case '6':
                      conversation.pregunta += 2; //va a pregunta 13
                      conversation.como_llego_al_formulario = "Una persona conocida me lo envió para que lo llenara";
                      conversation.donde_encontro_formulario = null;
                        crearEncuesta(conversation);
                        mensajeRespuesta = "Pregunta 3: ¿En qué fecha tu y tu grupo familiar llegaron al país? Escriba la fecha en formato DD-MM-AA para (Día-Mes-Año)";

                      break;
                  
                    case '7':
                        conversation.pregunta += 1; //va a pregunta 12
                        conversation.encontro_formulario = "Otro";
                          crearEncuesta(conversation);
                          mensajeRespuesta = "Pregunta 2: Si tu respuesta fue otro, ¿Dónde encontraste este formulario?";
                        console.log("CONVERSATION EN 7: ", conversation);
                        break;
                  
                  default:
                    mensajeRespuesta = "*PASO 1 - DATOS DE LLEGADA Y DESTINO:* \n"+
                      "¿Cómo encontraste este formulario? - Selecciona entre las siguientes opciones enviando el número de la opción correspondente:\n"+
                      "*1*: Ví un pendón en un albergue\n"+
                      "*2*: Recibí un volante en el albergue\n"+
                      "*3*: Recibí una foto con la información\n"+
                      "*4*: Recibí el enlache por chat\n"+
                      "*5*: Encontré el enlace en Facebook\n"+
                      "*6*: Una persona conocida me lo envió para que lo llenara\n"+
                      "*7*: Otro\n";
                    break;
                }
              
            break;

            case 12:
              console.log('RESPUESTA PREGUNTA 2: ', req.body.Body);
              console.log('ORDEN DE PREGUNTA: ', conversation.pregunta);
              conversation.donde_encontro_formulario = req.body.Body;
              conversation.pregunta += 1; //va a pregunta 13
              mensajeRespuesta = "Pregunta 3: ¿En qué fecha tu y tu grupo familiar llegaron al país? Escriba la fecha en formato DD-MM-AAAA para (Día-Mes-Año. Ejemplo: 10-06-2020)";
              crearEncuesta(conversation);

              break;
            
            case 13:
              console.log('RESPUESTA PREGUNTA 3: ', req.body.Body);

              console.log('FECHA SEPARADA: ', req.body.Body.split('-'));
              $fechavalidar = req.body.Body.split('-');

              if($fechavalidar.length === 3 && $fechavalidar[0].length === 2 && $fechavalidar[1].length === 2 && $fechavalidar[2].length === 4){
                  
                  $validarDia = parseInt($fechavalidar[0]);
                  $validarMes = parseInt($fechavalidar[1]);
                  $validarAño = parseInt($fechavalidar[2]);

                  $fechaActual = new Date();
                  $añoActual = $fechaActual.getFullYear();
                  $añoActualInteger = parseInt($añoActual);

                  console.log('AÑO ACTUAL FULL YEAR: ', $añoActual = $fechaActual.getFullYear());
                  console.log('AÑO ACTUAL INTEGER: ', $añoActualInteger);


                  if(($validarDia > 0 && $validarDia <=31) && ($validarMes > 0 && $validarMes <= 12) && ($validarAño >= 2010 && $validarAño <= $añoActualInteger )){
                    console.log('FECHA VALIDA!!');
                    console.log('TAMAÑO SI ES TRES: ', $fechavalidar.length);
                    conversation.pregunta += 1; //va a pregunta 14
                    conversation.fecha_llegada = req.body.Body;
                      
                    mensajeRespuesta = "¿En los próximos seis meses planeas estar dentro de Colombia?"+
                    "Selecciona una de las siguientes opciones escribiendo el número correspondiente de la opción:\n"+
                    "*1*: Sí\n"+
                    "*2*: No\n"+
                    "*3*: No estoy seguro";
                    crearEncuesta(conversation);
                  }else{
                    mensajeRespuesta = "Pregunta 3: ¿En qué fecha tu y tu grupo familiar llegaron al país? Escriba la fecha en formato DD-MM-AAAA para (Día-Mes-Año. Ejemplo: 10-06-2020)";

                  }

              }else{
                mensajeRespuesta = "Pregunta 3: ¿En qué fecha tu y tu grupo familiar llegaron al país? Escriba la fecha en formato DD-MM-AAAA para (Día-Mes-Año. Ejemplo: 10-06-2020)";

              }

              
              
              break;

            case 14:
              console.log('RESPUESTA PREGUNTA 4: ', req.body.Body);
        
              
              switch (req.body.Body){
                case '1':
                  conversation.pregunta += 1; //va a pregunta 15
                  conversation.estar_dentro_colombia = 1;
                  conversation.pais_destino_fuera_colombia = null;
                  mensajeRespuesta = "¿Cuál es tu destino final dentro de Colombia?"+
                  "Escriba en mayúscula el nombre del Departamento ó la palabra *NO SE* en caso de que no tenta definido el Departamento de destino";
                  crearEncuesta(conversation);
                  
                  break;
                case '2':
                  conversation.pregunta += 2; //va a pregunta 16
                  conversation.estar_dentro_colombia = 0;
                  conversation.id_departamento_destino_final = null;
                  conversation.id_municipio_destino_final = null;
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
                  crearEncuesta(conversation);
                  break;

                case '3':
                  conversation.pregunta += 1; //va a pregunta 15
                  conversation.estar_dentro_colombia = 2;
                  conversation.pais_destino_fuera_colombia = null;
                  mensajeRespuesta = "¿Cuál es tu destino final dentro de Colombia?"+
                  "Escriba en mayúscula el nombre del Departamento ó la palabra *NO SE* en caso de que no tenta definido el Departamento de destino";

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
              
              

              break;

            case 15:
              

              if(req.body.Body === 'NO SE' || req.body.Body === 'No sé' || req.body.Body === 'No se' || req.body.Body === 'no sé' || req.body.Body === 'No se'){
                conversation.pregunta += 3; //va a pregunta 18
                conversation.id_departamento_destino_final = null;
                conversation.id_municipio_destino_final = null;
                mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                "*1*: Algún amigo o familiar me espera.\n"+
                "*2*: Conozco personas que me pueden dar trabajo\n"+
                "*3*: He escuchado que puedo tener trabajo allá\n"+
                "*4*: Otra";

                crearEncuesta(conversation);
              }else{

                $sqlConsultaDepartamento = `SELECT nombre FROM departamento where nombre = '${req.body.Body}'`;

                connection.query($sqlConsultaDepartamento, (error,res)=>{
                  if (error) throw error;
                  console.log('CONSULTA DEPARTAMENTO: ', res);
                  console.log('TAMAÑO: ', res.length);
                  if(res.length == 1){

                    conversation.pregunta += 2; //va a pregunta 17
                    conversation.id_departamento_destino_final =  req.body.Body;

                    mensajeRespuesta = "Escriba en mayúscula el nombre del Municipio ó la palabra *NO SE* en caso de que no tenta definido el Municipio de destino";
                    crearEncuesta(conversation);

                  }
              
                  });

                
                

              }
              
              
              
            break;

            case 16:

                switch(req.body.Body){
                  case '1':

                    conversation.pais_destino_fuera_colombia = "Antigua y Barbuda";
                    
                    conversation.pregunta += 2;//va a pregunta 18
                    crearEncuesta(conversation);
                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
              
                  break;

                  case '2':

                    conversation.pais_destino_fuera_colombia = "Argentina";
                  
                    conversation.pregunta += 2;//va a pregunta 18
                    crearEncuesta(conversation);
                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                    break;
                    case '3':

                      conversation.pais_destino_fuera_colombia = "Bahamas";
                     
                      conversation.pregunta += 2;//va a pregunta 18
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                      break;
                    
                      case '4':

                      conversation.pais_destino_fuera_colombia = "Barbados";
                     
                      conversation.pregunta += 2;//va a pregunta 18
                      crearEncuesta(conversation);
                      mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                      break;

                      case '5':

                        conversation.pais_destino_fuera_colombia = "Bolivia";
                        
                        conversation.pregunta += 2;//va a pregunta 18
                        crearEncuesta(conversation);
                        mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                        break;

                        case '6':

                        conversation.pais_destino_fuera_colombia = "Brasil";
                        conversation.pregunta += 2;//va a pregunta 18
                        crearEncuesta(conversation);
                        mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                        break;

                      
                        case '7':

                        conversation.pais_destino_fuera_colombia = "Chile";
                        conversation.pregunta += 2;//va a pregunta 18
                        crearEncuesta(conversation);
                        mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                        break;

                        case '8':

                        conversation.pais_destino_fuera_colombia = "Colombia";
                        
                        conversation.pregunta += 2;//va a pregunta 18
                        crearEncuesta(conversation);
                        mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                        break;

                      
                        case '9':

                          conversation.pais_destino_fuera_colombia = "Costa Rica";
                          
                          conversation.pregunta += 2;//va a pregunta 18
                          crearEncuesta(conversation);
                          mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                          break;


                          case '10':

                            conversation.pais_destino_fuera_colombia = "Cuba";
                            
                            conversation.pregunta += 2;//va a pregunta 18
                            crearEncuesta(conversation);
                            mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                            break;

                            case '11':

                              conversation.pais_destino_fuera_colombia = "Dominica";
                              
                              conversation.pregunta += 2;//va a pregunta 18
                              crearEncuesta(conversation);
                              mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                              break;

                              case '12':

                                conversation.pais_destino_fuera_colombia = "Ecuador";
                                
                                conversation.pregunta += 2;//va a pregunta 18
                                crearEncuesta(conversation);
                                mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                break;

                                case '13':

                                  conversation.pais_destino_fuera_colombia = "Granada";
                                  
                                  conversation.pregunta += 2;//va a pregunta 18
                                  crearEncuesta(conversation);
                                  mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                  break;


                                  case '14':

                                  conversation.pais_destino_fuera_colombia = "Guyana";
                                
                                  conversation.pregunta += 2;//va a pregunta 18
                                  crearEncuesta(conversation);
                                  mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                  break;


                                  case '15':

                                  conversation.pais_destino_fuera_colombia = "Jamaica";
                                 
                                  conversation.pregunta += 2;//va a pregunta 18
                                  crearEncuesta(conversation);
                                  mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                  break;

                                  case '16':

                                  conversation.pais_destino_fuera_colombia = "México";
                                  
                                  conversation.pregunta += 2;//va a pregunta 18
                                  crearEncuesta(conversation);
                                  mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                  break;

                                  case '17':

                                  conversation.pais_destino_fuera_colombia = "Panamá";
                                  
                                  conversation.pregunta += 2;//va a pregunta 18
                                  crearEncuesta(conversation);
                                  mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                  break;


                                  case '18':

                                  conversation.pais_destino_fuera_colombia = "Perú";
                                  
                                  conversation.pregunta += 2;//va a pregunta 18
                                  crearEncuesta(conversation);
                                  mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                  break;


                                  case '19':

                                  conversation.pais_destino_fuera_colombia = "República Dominicana";
                                  
                                  conversation.pregunta += 2;//va a pregunta 18
                                  crearEncuesta(conversation);
                                  mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                  break;

                                  case '20':

                                  conversation.pais_destino_fuera_colombia = "Surinam";
                                  
                                  conversation.pregunta += 2;//va a pregunta 18
                                  crearEncuesta(conversation);
                                  mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                  break;


                                  case '21':

                                    conversation.pais_destino_fuera_colombia = "Trinidad y Tobago";
                                    
                                    conversation.pregunta += 2;//va a pregunta 18
                                    crearEncuesta(conversation);
                                    mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                    break;



                                    case '22':

                                      conversation.pais_destino_fuera_colombia = "Uruguay";
                                     
                                      conversation.pregunta += 2;//va a pregunta 18
                                      crearEncuesta(conversation);
                                      mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                                      "*1*: Algún amigo o familiar me espera.\n"+
                                      "*2*: Conozco personas que me pueden dar trabajo\n"+
                                      "*3*: He escuchado que puedo tener trabajo allá\n"+
                                      "*4*: Otra";
                                      break;


                                      case '23':

                                      conversation.pais_destino_fuera_colombia = "Venezuela";
                                     
                                      conversation.pregunta += 2;//va a pregunta 18
                                      crearEncuesta(conversation);
                                      mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                                      "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
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
                
              


            break;

            case 17:

              console.log('RESPUESTA EN 17: ', req.body.Body);
              if(req.body.Body === 'NO SE' || req.body.Body === 'No sé' || req.body.Body === 'No se' || req.body.Body === 'no sé' || req.body.Body === 'No se'){
                conversation.id_municipio_destino_final = null;
                mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                "*1*: Algún amigo o familiar me espera.\n"+
                "*2*: Conozco personas que me pueden dar trabajo\n"+
                "*3*: He escuchado que puedo tener trabajo allá\n"+
                "*4*: Otra";
                conversation.pregunta += 1;//va a pregunta 18
                crearEncuesta(conversation);
              }else{
                
                conversation.id_municipio_destino_final =  req.body.Body;

                mensajeRespuesta = "¿Cuál es la razón para elegir este lugar como destino final?\n"+
                "Seleccione una de las opciones, enviando el número de la opción correspondiente:\n"+
                "*1*: Algún amigo o familiar me espera.\n"+
                "*2*: Conozco personas que me pueden dar trabajo\n"+
                "*3*: He escuchado que puedo tener trabajo allá\n"+
                "*4*: Otra";
                conversation.pregunta += 1;//va a pregunta 18
                crearEncuesta(conversation);

              }
              
              
            break;


            case 18:

            console.log('RESPUESTA EN 18: ', req.body.Body);
              
              switch(req.body.Body){
                case '1':
                  conversation.pregunta += 2;//va a pregunta 20
                  mensajeRespuesta = "¿Tu hogar está recibiendo transporte humanitario? Selecciona la opción enviando el número correspondiente:\n"+
                  "*1*: Sí\n"+
                  "*2*: No\n";
                  conversation.razon_elegir_destino_final =  req.body.Body;
                  conversation.otra_razon_elegir_destino_final = null;
                  crearEncuesta(conversation);

                  break;
                  
                  case '2':
                  conversation.pregunta += 2;//va a pregunta 20
                  mensajeRespuesta = "¿Tu hogar está recibiendo transporte humanitario? Selecciona la opción enviando el número correspondiente:\n"+
                  "*1*: Sí\n"+
                  "*2*: No\n";
                  conversation.razon_elegir_destino_final =  req.body.Body;
                  conversation.otra_razon_elegir_destino_final = null;
                  crearEncuesta(conversation);

                  break;
                  
                  case '3':
                  conversation.pregunta += 2;//va a pregunta 20
                  mensajeRespuesta = "¿Tu hogar está recibiendo transporte humanitario? Selecciona la opción enviando el número correspondiente:\n"+
                  "*1*: Sí\n"+
                  "*2*: No\n";
                  conversation.razon_elegir_destino_final =  req.body.Body;
                  conversation.otra_razon_elegir_destino_final = null;
                  crearEncuesta(conversation);

                  break;

                case '4':
                  conversation.pregunta += 1;//va a pregunta 19
                  mensajeRespuesta = "¿Cuál otra razón?";
                  conversation.razon_elegir_destino_final =  req.body.Body;
                  crearEncuesta(conversation);

                  break;

                  default:
                    break;
              }
              
            break;

            case 19:
              
              
                  conversation.pregunta += 1;//va a pregunta 20
                  mensajeRespuesta = "¿Tu hogar está recibiendo transporte humanitario? Selecciona la opción enviando el número correspondiente:\n"+
                  "*1*: Sí\n"+
                  "*2*: No\n";
                  conversation.otra_razon_elegir_destino_final =  req.body.Body;
                  crearEncuesta(conversation);

               
              
            break;

            case 20:

              switch(req.body.Body){

                case '1':
                      
                  conversation.recibe_transporte_humanitario =  1;

                  if(conversation.estar_dentro_colombia == 0){
                      conversation.encuesta = false;
                        
                        crearEncuesta(conversation);
                        mensajeRespuesta = "Gracias la encuesta ha terminado, hasta una próxima ocasión!";
                      /*mensajeRespuesta = "*PASO 2 - DATOS DE LOS MIEMBROS DEL HOGAR*\n"+
                      "Cuántas personas de tu famillia (incluyéndote) están contigo en este momento? Por ejemplo si vaiajas solo responte *1*";
                        */

                  }else{
                      conversation.pregunta = 21;//va a pregunta 20
                      crearEncuesta(conversation);
                      mensajeRespuesta = "*PASO 2 - DATOS DE LOS MIEMBROS DEL HOGAR*\n"+
                      "Cuántas personas de tu famillia (incluyéndote) están contigo en este momento? Por ejemplo si vaiajas solo responte *1*";

                  }
                      
                  break;

                case '2':

                     conversation.recibe_transporte_humanitario =  0;
                      if(conversation.estar_dentro_colombia == 0){
                        conversation.encuesta = false;
                          
                          crearEncuesta(conversation);
                          mensajeRespuesta = "Gracias la encuesta ha terminado, hasta una próxima ocasión!";
                        /*mensajeRespuesta = "*PASO 2 - DATOS DE LOS MIEMBROS DEL HOGAR*\n"+
                        "Cuántas personas de tu famillia (incluyéndote) están contigo en este momento? Por ejemplo si vaiajas solo responte *1*";
                          */
  
                    }else{
                        conversation.pregunta = 21;//va a pregunta 21 CONTINUAR
                        crearEncuesta(conversation);
                        mensajeRespuesta = "*PASO 2 - DATOS DE LOS MIEMBROS DEL HOGAR*\n"+
                        "Cuántas personas de tu famillia (incluyéndote) están contigo en este momento? Por ejemplo si vaiajas solo responte *1*";
  
                    }
                  break;

                default:
                  break
              }
              
              
            break;

            //EMPEZAMOS CON PASO 2
             case 21:
                
                conversation.total_miembros_hogar = parseInt(req.body.Body);
                conversation.miembro_hogar_preguntando = 1;
                conversation.pregunta += 1; //va a pregunta 22
                mensajeRespuesta = "Envie la palabra CONTINUAR para responder información sobre los miembros de su hogar";
                crearEncuesta(conversation);
  
              break;


              case 22:
                //valida continuar
                conversation.pregunta += 1; //va a pregunta 23
                mensajeRespuesta = "A continuación responda las preguntas para miembro #"+conversation.miembro_hogar_preguntando+"\n"+
                "*Primer Nombre*";
                crearEncuesta(conversation);
  
              break;

              case 23:
                
                
                guardarInfoMiembro(req.body.Body, 'primer_nombre_miembro', conversation.miembro_hogar_preguntando, conversation.id);
                conversation.pregunta += 1; //va a pregunta 24
                crearEncuesta(conversation);
                
                mensajeRespuesta = "*Segundo Nombre* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                "En caso de que no tenga Segundo Nombre, envíe un '.' (punto)";
  
              break;


              case 24:
                
                guardarInfoMiembro(req.body.Body, 'segundo_nombre_miembro', conversation.miembro_hogar_preguntando, conversation.id);
                conversation.pregunta += 1; //va a pregunta 25
                mensajeRespuesta = "*Primer Apellido* (miembro #"+conversation.miembro_hogar_preguntando+").";
                //guardarInfoMiembro(req.body.Body, 'primer_nombre', conversation.miembroHogarPreguntando, conversation.id);
                crearEncuesta(conversation);
  
              break;

            
              case 25:
                
                guardarInfoMiembro(req.body.Body, 'primer_apellido_miembro', conversation.miembro_hogar_preguntando, conversation.id);
                conversation.pregunta += 1; //va a pregunta 26
                mensajeRespuesta = "*Segundo Apellido* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                "En caso de que no tenga Segundo Nombre, envíe un '.' (punto)";
                //guardarInfoMiembro(req.body.Body, 'primer_nombre', conversation.miembroHogarPreguntando, conversation.id);
                crearEncuesta(conversation);
  
              break;

              case 26:
                
                guardarInfoMiembro(req.body.Body, 'segundo_apellido_miembro', conversation.miembro_hogar_preguntando, conversation.id);
                conversation.pregunta += 1; //va a pregunta 27
                mensajeRespuesta = "*Sexo:* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                "Envíe el número de acuerdo a la opción:\n"+
                "*1*: Mujer\n"+
                "*2*: Hombre";
                //guardarInfoMiembro(req.body.Body, 'primer_nombre', conversation.miembroHogarPreguntando, conversation.id);
                crearEncuesta(conversation);

              break;

              case 27:
                
                if(req.body.Body === '1'){
                  guardarInfoMiembro('mujer', 'sexo_miembro', conversation.miembro_hogar_preguntando, conversation.id);

                }else if(req.body.Body === '2'){
                  guardarInfoMiembro('hombre', 'sexo_miembro', conversation.miembro_hogar_preguntando, conversation.id);

                }
                conversation.pregunta += 1; //va a pregunta 28
                mensajeRespuesta = "*Fecha de Nacimiento*: (miembro #"+conversation.miembro_hogar_preguntando+")."+
                "(Escriba la fecha en formato DD-MM-AA para (Día-Mes-Año)";
                //guardarInfoMiembro(req.body.Body, 'primer_nombre', conversation.miembroHogarPreguntando, conversation.id);
                crearEncuesta(conversation);

          
              break;

              case 28:
                
                guardarInfoMiembro(req.body.Body, 'fecha_nacimiento', conversation.miembro_hogar_preguntando, conversation.id);
                conversation.pregunta += 1; //va a pregunta 29
                mensajeRespuesta = "*Nacionalidad:* (miembro #"+conversation.miembro_hogar_preguntando+")."+
                "Envíe el número de acuerdo a la opción correspondiente:\n"+
                "*2*: Colombiana\n"+
                "*2*: Venezolana\n"+
                "*3*: Colombo-venezolana\n"+
                "*4*: Otro";
                //guardarInfoMiembro(req.body.Body, 'primer_nombre', conversation.miembroHogarPreguntando, conversation.id);
                crearEncuesta(conversation);

              break;

              case 29:

                if(req.body.Body === '4'){
                  guardarInfoMiembro('Otro', 'nacionalidad', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 1; //va a pregunta 30
                  crearEncuesta(conversation);

                  mensajeRespuesta = "¿Cuál? (Indicar nacionalidad, ejemplo: Peruana)"+ "(miembro #"+conversation.miembro_hogar_preguntando+").";
                
                }else if(req.body.Body === '1'){
                  guardarInfoMiembro('Colombiana', 'nacionalidad', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 2; //va a pregunta 31
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
                  
                }else if(req.body.Body === '2'){
                  guardarInfoMiembro('Venezolana', 'nacionalidad', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 2; //va a pregunta 31
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
                  
                }else if(req.body.Body === '3'){
                  guardarInfoMiembro('Colombo-venezolana', 'nacionalidad', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 2; //va a pregunta 31
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

              case 30:

                guardarInfoMiembro(req.body.Body, 'cual_otro_nacionalidad', conversation.miembro_hogar_preguntando, conversation.id);
                conversation.pregunta += 1; //va a pregunta 31
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

              case 31:
                guardarInfoMiembro(req.body.Body, 'tipo_documento', conversation.miembro_hogar_preguntando, conversation.id);

                if(req.body.Body === '7'){
                  conversation.pregunta += 1; // pregunta 32
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Cuál? (Indicar tipo, ejemplo: pasaporte) (miembro #"+conversation.miembro_hogar_preguntando+").";

                }else{
                  conversation.pregunta += 2;// pregunta 33
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Número de documento* (miembro #"+conversation.miembro_hogar_preguntando+").";

                }

              break;

              case 32:
                   
                  guardarInfoMiembro(req.body.Body, 'cual_otro_tipo_documento', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 1; // pregunta 33
                  crearEncuesta(conversation);
                  mensajeRespuesta = "*Número de documento* (miembro #"+conversation.miembro_hogar_preguntando+").";

              break;

              case 33:
                   
                  guardarInfoMiembro(req.body.Body, 'numero_documento', conversation.miembro_hogar_preguntando, conversation.id);
                  conversation.pregunta += 1; // pregunta 34
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías compartir una fotografía del documento de identidad de este miembro del hogar? (miembro #"+conversation.miembro_hogar_preguntando+"). "+
                  "Responde con el número correspondiente:\n"+
                  "*1*: Sí\n"+
                  "*2*: No\n";

              break;

              case 34:
                   
                  if(req.body.Body === '1'){
                    guardarInfoMiembro('1', 'compartir_foto_documento', conversation.miembro_hogar_preguntando, conversation.id);
                    conversation.pregunta += 1; // pregunta 35
                    crearEncuesta(conversation);
                    mensajeRespuesta = "Por favor carga una fotografía de tu documento aquí";

                  }else if(req.body.Body === '2'){
                    guardarInfoMiembro('0', 'compartir_foto_documento', conversation.miembro_hogar_preguntando, conversation.id);
                    
                    $contadorMiembrosHogar = conversation.miembro_hogar_preguntando +1;

                    if($contadorMiembrosHogar <= conversation.total_miembros_hogar){
                      conversation.miembro_hogar_preguntando +=1;
                      conversation.pregunta = 23;
                      mensajeRespuesta = "A continuación responda las preguntas para miembro #"+conversation.miembro_hogar_preguntando+"\n"+
                    "*Primer Nombre*";
                      crearEncuesta(conversation);
                      
                    }else{
                      conversation.pregunta += 2; //Va a pregunta 36
                      crearEncuesta(conversation);
                      mensajeRespuesta = "*PASO 3 - DATOS DE CONTACTO*\n"+"¿En qué Municipio te encuentras en este momento?"

                    }
                  }

              break;

              //CUando termina las preguntas del miembro
              case 35:
                guardarInfoMiembro(req.body.Body, 'url_foto_documento', conversation.miembro_hogar_preguntando, conversation.id);
                
                $contadorMiembrosHogar = conversation.miembro_hogar_preguntando +1;

                    if($contadorMiembrosHogar <= conversation.total_miembros_hogar){
                      conversation.miembro_hogar_preguntando +=1;
                      conversation.pregunta = 23;
                      mensajeRespuesta = "A continuación responda las preguntas para miembro #"+conversation.miembro_hogar_preguntando+"\n"+
                    "*Primer Nombre*";
                      crearEncuesta(conversation);
                      
                    }else{
                      conversation.pregunta += 1; //Va a pregunta 36
                      crearEncuesta(conversation);
                      mensajeRespuesta = "*PASO 3 - DATOS DE CONTACTO*. "+
                      "Recuerda: es muy importante que proporciones TODOS tus datos personales de contacto, para poder localizarte en caso de resultar elegido para el programa.\n"+
                      "¿En qué Municipio te encuentras en este momento?. Envía el nombre del municipio:\n"+
                      "BOCHALEMA, BERLÍN, BUCARAMANGA, CÚCUTA, PAMPLONA, BOGOTÁ, CALI, PASTO, MEDELLÍN"
                     

                    }
  
              break;


              case 36:
                
                
                    if(req.body.Body === "BOCHALEMA" || req.body.Body === "BERLÍN" || req.body.Body === "BUCARAMANGA" || req.body.Body === "CÚCUTA" || req.body.Body === "PAMPLONA" ||
                     req.body.Body === "BOGOTÁ" || req.body.Body === "CALI" || req.body.Body === "PASTO" || req.body.Body === "MEDELLÍN"){
                          conversation.pregunta += 1; //Va a pregunta 37 paso 3
                          conversation.ubicacion = req.body.Body; 
                          crearEncuesta(conversation);
                          mensajeRespuesta = "¿El número de contacto ha sido entregado por VenEsperanza?. Responda con el número según la opción:\n"+
                          "*1*: Sí\n"+
                          "*2*: No";
                     }
                  
                
  
              break;

              case 37:
                
                
                conversation.pregunta += 1; //Va a pregunta 38 paso 3
              
                  if(req.body.Body === '1'){
                    conversation.numero_entregado_venesperanza = true;
                    
                    
                    crearEncuesta(conversation);
                    mensajeRespuesta = "Ingresa el Número de Contacto VenEsperanza:";
                  }else if(req.body.Body === '2'){
                    conversation.numero_entregado_venesperanza = false;
                    crearEncuesta(conversation);
                    mensajeRespuesta = "Ingresa el Número de Contacto principal:";
                  }
                  
  
              break;


              case 38:
                
                
                    conversation.pregunta += 1; //Va a pregunta 39 paso 3
                  
                    conversation.numero_contacto = req.body.Body;
                    
                    crearEncuesta(conversation);
                    mensajeRespuesta = "¿Esta línea de contacto es propia?. Responda con el número según la opción:\n"+
                    "*1*: Sí\n"+
                    "*2*: No";


              break;


              case 39:
                
                  switch(req.body.Body){

                    case '1':
                        conversation.linea_contacto_propia = true;
                        conversation.pregunta += 1; //Va a pregunta 40 paso 3
                        //conversation.encuesta = false;
                        crearEncuesta(conversation);
                        mensajeRespuesta = "¿Esta línea de contacto está asociada a WhatsApp?. Responda con el número según la opción:\n"+
                    "*1*: Sí\n"+
                    "*2*: No";
                    
                        break;

                    case '2':

                      conversation.linea_contacto_propia = false;
                      conversation.pregunta += 1; //Va a pregunta 40 paso 3
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
              break;

            case 40:

                  switch(req.body.Body){
                      case '1':

                        conversation.pregunta += 2; //Va a pregunta 42 paso 3
                        conversation.linea_asociada_whatsapp = true;
                        crearEncuesta(conversation);
                        mensajeRespuesta = "Número de contacto alternativo:";
                      break;

                      case '2':
                        conversation.pregunta += 1; //Va a pregunta 41 paso 3
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

            break;

            case 41:

              conversation.pregunta += 1; //Va a pregunta 42 paso 3
              conversation.numero_whatsapp_principal = req.body.Body;
              crearEncuesta(conversation);
              mensajeRespuesta = "Número de contacto alternativo:";

            break;

            case 42:

              conversation.pregunta += 1; //Va a pregunta 43 paso 3
              conversation.numero_alternativo = req.body.Body;
              crearEncuesta(conversation);
              mensajeRespuesta = "¿Esta línea de contacto es propia?";

            break;

            case 43:

              if(req.body.Body === '1'){
                
                conversation.pregunta += 1; //Va a pregunta 44 paso 3
                conversation.linea_contacto_alternativo = true;
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Esta línea de contacto está asociada a WhatsApp?. Responda con el número según la opción:\n"+
                "*1*: Sí\n"+
                      "*2*: No";

              }else if(req.body.Body === '2'){

                conversation.pregunta += 1; //Va a pregunta 44 paso 3
                conversation.linea_contacto_alternativo = false;
                crearEncuesta(conversation);
                mensajeRespuesta = "¿Esta línea de contacto está asociada a WhatsApp?. Responda con el número según la opción:\n"+
                "*1*: Sí\n"+
                      "*2*: No";;

              }else{
                mensajeRespuesta = "¿Esta línea de contacto es propia?";
              }
            
            break;

            case 44:

              switch(req.body.Body){
                case '1':

                  conversation.pregunta += 1; //Va a pregunta 46 paso 3
                  conversation.linea_alternativa_asociada_whatsapp = true;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "Escribe un correo electrónico donde te podamos contactar";
                break;

                case '2':
                  conversation.pregunta += 1; //Va a pregunta 45 paso 3
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


            case 45:

              conversation.pregunta += 1; //Va a pregunta 46 paso 3
              conversation.correo_electronico = req.body.Body;
              crearEncuesta(conversation);
              mensajeRespuesta = "¿Tienes cuenta en Facebook?. Responde con el número según la opción:\n"+
              "*1*: Sí\n"+
                      "*2*: No";

            break;

            case 46:

              switch(req.body.Body){

                case '1':

                  conversation.pregunta += 1; //Va a pregunta 47 paso 3
                  conversation.tiene_cuenta_facebook = true;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Cuál es la cuenta?";
                  break;

                case '2':

                  conversation.pregunta += 2; //Va a pregunta 48 paso 3
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

            case 47:

              conversation.pregunta += 1; //Va a pregunta 48 paso 3
              conversation.cuenta_facebook = req.body.Body;
              crearEncuesta(conversation);
              mensajeRespuesta = "¿Podemos contactarte el momento en el que llegues a tu destino final?"+
              "Responde con el númeor según la opción correspondiente:\n"+
              "*1*: Sí\n"+
                  "*2*: No";

            break;

            case 48:

              switch(req.body.Body){

                case '1':

                  conversation.pregunta += 1; //Va a pregunta 49 paso 3
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

                  conversation.pregunta += 3; //Va a pregunta 51 paso 3
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

            case 49:

              switch(req.body.Body){
                
                case '1':
                  conversation.forma_contactarte = "Por llamada";
                  conversation.pregunta += 2; //pasa a pregunta 51
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                  break;
                
                case '2':

                  conversation.forma_contactarte = "WhatsApp";
                  conversation.pregunta += 2; //pasa a pregunta 51
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                  break;
                
                case '3':
                  conversation.forma_contactarte = "Facebook";
                  conversation.pregunta += 2; //pasa a pregunta 51
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                break;

                case '4':
                  conversation.forma_contactarte = "Correo electrónico";
                  conversation.pregunta += 2; //pasa a pregunta 51
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                break;

                case '5':

                  conversation.forma_contactarte = "Otro";
                  conversation.pregunta += 1; //pasa a pregunta 50
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

            case 50:
              conversation.otra_forma_contactarte = req.body.Body;
                  conversation.pregunta += 1; //pasa a pregunta 51
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¿Podrías darnos alguna información adicional para contactarte?"+
                  "Por ejemplo, el teléfono de algún familiar o amigo y por quién preguntar, las horas más adecuadas para llamarte o los días de la semana en los que te podremos encontrar.";
                
            break;

            case 51:
                  conversation.comentario = req.body.Body;
                  conversation.encuesta = false;
                  crearEncuesta(conversation);
                  mensajeRespuesta = "¡Gracias por participar!\n"+
                  "Si eres preseleccionado/a el programa #VenEsperanza se comunicará contigo\n"+
                  "Recuerda:\n"+
                  "En el programa #VenEsperanza no cobramos ni pedimos remuneración por ningún servicio a la comunidad, no tenemos intermediarios."
            break;
            


            default:
              break;
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