var ActualizarDatosContactoService = require('../services/actualizarDatos.services')  

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.actualizarDatosContacto = async function($datosContactoActualizados){

    try {
        $datosContactoActualizados.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

    const sqlActualizarDatos = `UPDATE datos_actualizados SET pregunta = ${$datosContactoActualizados.pregunta},
    tipo_documento = '${$datosContactoActualizados.tipo_documento}', numero_documento = '${$datosContactoActualizados.numero_documento}',
    telefono = ${$datosContactoActualizados.telefono}, correo_electronico = '${$datosContactoActualizados.correo_electronico}',
     id_encuesta = ${$datosContactoActualizados.id_encuesta},  updated_at = '${$datosContactoActualizados.updated_at}'
     WHERE waId = ${$datosContactoActualizados.waId}`;

     /*
    //connection.query(sqlActualizarDatos, (error, res) => {
    db.query(sqlActualizarDatos, (error, res) => {
      if (error) {errorLog('dbquery.error',error);throw error;}

      //return callback(true);

    });*/

    var actualizarDatos = await ActualizarDatosContactoService.actualizarDatosContacto(sqlActualizarDatos);
        //errorLog('::creaConversacion::',res.status(200).json({ status: 200, data: conversacion, message: 'Creo bien' }));
        //consultaConversacion(nuevaconversacion.waId);
        errorLog('::actualizaDatos::'/*,llegada*/);
        
    } catch (error) {
        errorLog(':::Error en actualizaDatos::', error);

    }
    
  }