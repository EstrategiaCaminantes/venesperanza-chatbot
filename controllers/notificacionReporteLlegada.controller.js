var NotificacionRespuestaLlegadaService = require('../services/notificacionRespuestaLlegada.services')  

var db = require('../db');

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.actualizarNotificacionLlegada = async function ($respuestaDatos) {

    try {
        $respuestaDatos.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

        const sqlNotificacionReporteLlegada = `UPDATE notificacion_reporte_llegada SET respuesta = '${$respuestaDatos.respuesta}',
        reenviar = ${$respuestaDatos.reenviar}, updated_at = '${$respuestaDatos.updated_at}' 
        WHERE waId = ${$respuestaDatos.waId}`;
    
        /*
        db.query(sqlLlegada, (error, res) => {
          if (error) console.log('ERRROR ACTUALIZAR LLEGADA', error);
    
          //return callback(true);
    
        });*/

        var notificacionRespuesta = await NotificacionRespuestaLlegadaService.actualizarNotificacion(sqlNotificacionReporteLlegada);
        //errorLog('::creaConversacion::',res.status(200).json({ status: 200, data: conversacion, message: 'Creo bien' }));
        //consultaConversacion(nuevaconversacion.waId);
        errorLog('::actualizaLlegada::'/*,llegada*/);
        
    } catch (error) {
        errorLog(':::Error en actualizaLlegada::', error);

    }

}