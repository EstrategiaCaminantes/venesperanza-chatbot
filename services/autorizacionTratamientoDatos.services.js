var db = require('../db');

function errorLog(title,msg) {
  if(process.env.ENV === 'test') {
      console.log(title,msg);
  }
}

exports.crearAutorizacionTratamientoDatos = async function (query, params) {

    try {
       var autorizacion =  await db.query(query, params, (error, results) => {

            if (error) {errorLog('dbquery.error',error);
            throw error;
          }else{
            //console.log(':::NO HUBO ERROR EN QUERY AUTORIZACION', results);
          }
            //if (error) {errorLog('dbquery.error',error);throw error;}
            /*  if(error){
                mensajeRespuesta = "Su Nombre de perfil de Whatsapp contiene emoticones, por favor quitelos momentaneamente para interactuar con nuestro chat e intente nuevamente";
        
                sendMessageWhatsapp({
                  'to': req.body['message.from'],
                    'conversationId': req.body.conversationId,
                  'type': 'text',
                  'content': {
                          'text': mensajeRespuesta,
                        }
                });
              }else{
                //console.log('RESULTS QUERY NUEVO: ', results);
                consultaConversacion(nuevaconversacion.waId);
              }
            */
           //return results
        });
       // console.log(':::AUTORIZACION:::', autorizacion);
      //return autorizacion;
    } catch (e) {

      //console.log('\n:::ERROR EN CATCH Y VUELVE ERROR e:::\n', e);
        return e;
        // Log Errors
        //throw Error('Error while Paginating Users')
    }
}

