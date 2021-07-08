var EncuestaService = require('../services/encuesta.services')  

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.actualizarEncuesta = async function ($encuesta) {

    try {
        $encuesta.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;
    
        //campos finales
        const sqlCreaEncuesta = `UPDATE encuesta SET pregunta = ${$encuesta.pregunta},
        primer_nombre = '${$encuesta.primer_nombre}', segundo_nombre = '${$encuesta.segundo_nombre}', primer_apellido = '${$encuesta.primer_apellido}', segundo_apellido = '${$encuesta.segundo_apellido}',
        codigo_encuesta = '${$encuesta.codigo_encuesta}',
        tipo_documento = '${$encuesta.tipo_documento}', cual_otro_tipo_documento = '${$encuesta.cual_otro_tipo_documento}', numero_documento = '${$encuesta.numero_documento}',
        como_llego_al_formulario = '${$encuesta.como_llego_al_formulario}', fecha_llegada_pais = '${$encuesta.fecha_llegada_pais}',
        nombre_municipio_destino_final = '${$encuesta.nombre_municipio_destino_final}',
        numero_entregado_venesperanza = ${$encuesta.numero_entregado_venesperanza},
        numero_contacto = '${$encuesta.numero_contacto}', linea_contacto_propia = ${$encuesta.linea_contacto_propia},
        linea_asociada_whatsapp = ${$encuesta.linea_asociada_whatsapp},
        correo_electronico = '${$encuesta.correo_electronico}',
        updated_at = '${$encuesta.updated_at}'
        WHERE id = ${$encuesta.id}`;

        /*
        db.query(sqlCreaEncuesta, (error, res) => {
        if (error) {errorLog('dbquery.error',error);throw error;}

        //return callback(true);

        });*/

        
        var encuesta = await EncuestaService.actualizarEncuesta(sqlCreaEncuesta);
        //errorLog('::creaConversacion::',res.status(200).json({ status: 200, data: conversacion, message: 'Creo bien' }));
        //consultaConversacion(nuevaconversacion.waId);
        errorLog('::creaConversacion::'/*,encuesta*/);
        
    } catch (error) {
        errorLog(':::Error en actualizaencuesta::', error);

    }




  }