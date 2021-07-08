var LlegadasService = require('../services/llegadas.services')  

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.actualizarLlegada = async function ($llegada) {

    try {
        $llegada.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

        const sqlLlegada = `UPDATE llegadas SET pregunta = ${$llegada.pregunta},
        tipo_documento = '${$llegada.tipo_documento}', numero_documento = '${$llegada.numero_documento}',
        numero_contacto = ${$llegada.numero_contacto}, 
         id_encuesta = ${$llegada.id_encuesta}, updated_at = '${$llegada.updated_at}',
         nombre_jefe_hogar = '${$llegada.nombre_jefe_hogar}', numero_contacto_asociado_whatsapp = ${$llegada.numero_contacto_asociado_whatsapp},
         donde_te_encuentras = '${$llegada.donde_te_encuentras}', otro_donde_te_encuentras = '${$llegada.otro_donde_te_encuentras}'
         WHERE waId = ${$llegada.waId}`;
    
        /*
        db.query(sqlLlegada, (error, res) => {
          if (error) console.log('ERRROR ACTUALIZAR LLEGADA', error);
    
          //return callback(true);
    
        });*/

        var llegada = await LlegadasService.actualizarLlegada(sqlLlegada);
        //errorLog('::creaConversacion::',res.status(200).json({ status: 200, data: conversacion, message: 'Creo bien' }));
        //consultaConversacion(nuevaconversacion.waId);
        errorLog('::actualizaLlegada::'/*,llegada*/);
        
    } catch (error) {
        errorLog(':::Error en actualizaLlegada::', error);

    }




  }