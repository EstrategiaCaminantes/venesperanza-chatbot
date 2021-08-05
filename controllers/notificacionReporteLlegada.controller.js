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
        WHERE waId = ${$respuestaDatos.waId} AND activo = 1`;
    
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

exports.crearEstadoNotificaciones = async (req) => {
    try {
        //console.log('::REPORT URL ENTRA AL TRY::',req.body);
        if(req.body.error && req.body.message.status === 'rejected'){
            nuevo_error = req.body.error;
            mensaje = req.body.message;

            const sqlEstadoWhatsapp = `SELECT *
                FROM estado_whatsapp
                WHERE message_id = '${mensaje.id}'`;

                db.query(sqlEstadoWhatsapp, (errorEstadoWhatsapp, resultEstadoWhatsapp) => {
                if (errorEstadoWhatsapp) {errorLog('dbquery.error',errorEstadoWhatsapp);throw errorEstadoWhatsapp;}
                if(resultEstadoWhatsapp.length == 0) {
                    //console.log('::estadoWhatsapp NO EXISTE, VOY A CREARLO::');
                    const sqlEstadoWhatsappInsert = 'INSERT INTO estado_whatsapp SET ?';

                    const nuevoEstadoWhatsapp = {
                        message_id: mensaje.id,
                        message_status: mensaje.status,
                        error_code: nuevo_error.code,
                        error_description: nuevo_error.description,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                    //console.log('::NUEVO ESTADO WHATSAPP QUE VOY A CREAR::', nuevoEstadoWhatsapp);
                    //console.log('NUEVA CONVERSACION: ', nuevaconversacion);

                    //connection.query(sqlRequestInsert, nuevoRequest, (error, results) => {
                    db.query(sqlEstadoWhatsappInsert, nuevoEstadoWhatsapp, (error, results) => {
                        if (error) {errorLog('dbquery.error',error);throw error;};
                        //console.log('::YA CREE EL NUEVO estadoWhatsapp::', results);
                        
                   });
                    
                }
            });
        }   
    } catch (error) {
        errorLog(':::Error en crear estado Notificaciones no enviadas::', error);
    }
}