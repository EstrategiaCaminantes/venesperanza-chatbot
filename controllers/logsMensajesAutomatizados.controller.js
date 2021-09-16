var db = require('../db');

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.crearLogMensajesAutomatizados = async function (datosNotificacionReporteLlegada) {

    try {
        
        nuevoLogMensajeAutomatizado = {
            waId: datosNotificacionReporteLlegada.waId,
            tipo_mensaje : 2,
            created_at : datosNotificacionReporteLlegada.updated_at,
            updated_at : datosNotificacionReporteLlegada.updated_at
        }

        if(datosNotificacionReporteLlegada.respuesta === "Si, ya llegué"){
        
            nuevoLogMensajeAutomatizado.mensaje = "confirma_llegada";
        
        }else if(datosNotificacionReporteLlegada.respuesta === "No, en camino"){
        
            nuevoLogMensajeAutomatizado.mensaje = "en_camino";

        }

        const sqlLogMensajeAutomatizado = 'INSERT INTO log_mensajes SET ?';

        if(sqlLogMensajeAutomatizado && nuevoLogMensajeAutomatizado.mensaje){
            
            db.query(sqlLogMensajeAutomatizado, nuevoLogMensajeAutomatizado, (error, resultadoLog) => {
                if (error) {errorLog('dbquery.error-crear log mensaje automatizado::',error);throw error;}
                
                //console.log('::LOG MENSAJE AUTOMATIZADO CREADO:: ', resultadoLog);
            });
        }
        
    } catch (error) {
        errorLog(':::Error en crear log mensaje automatizado::', error);

    }

}