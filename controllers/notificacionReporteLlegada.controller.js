var NotificacionRespuestaLlegadaService = require('../services/notificacionRespuestaLlegada.services')  
var logsMensajesAutomatizadosController = require('./logsMensajesAutomatizados.controller');

var db = require('../db');

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.actualizarNotificacionLlegada = async function (respuestaDatos) {

    try {
        respuestaDatos.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

        const sqlNotificacionReporteLlegada = `UPDATE notificacion_reporte_llegada SET respuesta = '${respuestaDatos.respuesta}',
        reenviar = ${respuestaDatos.reenviar}, updated_at = '${respuestaDatos.updated_at}' 
        WHERE waId = ${respuestaDatos.waId} AND activo = 1`;

        //ya no llama al servicio, actualiza directamente en el controlador
        db.query(sqlNotificacionReporteLlegada, (error, notificacionReporteLlegada) => {
            if (error) {errorLog('dbquery.error',error);throw error;}

            //console.log('::NOTIFICA REPORTE CREADA:: ', notificacionReporteLlegada);
            //console.log('::RESPUESTA DATOS A LOG:: ', respuestaDatos)
            errorLog('::actualizaLlegada::');
            logsMensajesAutomatizadosController.crearLogMensajesAutomatizados(respuestaDatos);

        });

        //ya no llama al servicio
        //var notificacionRespuesta = await NotificacionRespuestaLlegadaService.actualizarNotificacion(sqlNotificacionReporteLlegada);
        //errorLog('::actualizaLlegada::');

        
    } catch (error) {
        errorLog(':::Error en actualizarNotificacionLlegada::', error);

    }

}

exports.crearEstadoNotificaciones = async (req) => {
    try {
        //console.log('::REPORT URL ENTRA AL TRY::',req.body);
        //if(req.body.error && req.body.message.status === 'rejected'){
            mensaje = req.body.message;

            const sqlEstadoWhatsapp = `SELECT *
                FROM estado_whatsapp
                WHERE message_id = '${mensaje.id}' AND message_status = '${mensaje.status}'`;

                db.query(sqlEstadoWhatsapp, (errorEstadoWhatsapp, resultEstadoWhatsapp) => {
                if (errorEstadoWhatsapp) {errorLog('dbquery.error',errorEstadoWhatsapp);throw errorEstadoWhatsapp;}
                if(resultEstadoWhatsapp.length == 0) {
                    //console.log('::estadoWhatsapp NO EXISTE, VOY A CREARLO::');
                    const sqlEstadoWhatsappInsert = 'INSERT INTO estado_whatsapp SET ?';

                    let nuevoEstadoWhatsapp = {
                        message_id: mensaje.id,
                        message_status: mensaje.status,
                        created_at: new Date(),
                        updated_at: new Date()
                    }

                    if(req.body.error){
                        nuevo_error = req.body.error;
                        nuevoEstadoWhatsapp.error_code = nuevo_error.code;
                        nuevoEstadoWhatsapp.error_description = nuevo_error.description;
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
        //}   
    } catch (error) {
        errorLog(':::Error en crear estado Notificaciones no enviadas::', error);
    }
}