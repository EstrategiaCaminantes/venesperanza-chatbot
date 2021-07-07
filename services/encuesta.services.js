var db = require('../db');

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.actualizarEncuesta = async function (query) {

    try {
        await db.query(query, (error, results) => {
            if (error) {errorLog('dbquery.error',error);throw error;}
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
           return results
        });
        //return users;
    } catch (e) {
        return e;
        // Log Errors
        //throw Error('Error while Paginating Users')
    }
}

