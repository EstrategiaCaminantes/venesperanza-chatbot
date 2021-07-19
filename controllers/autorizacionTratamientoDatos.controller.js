var TratamientoDatosService = require('../services/autorizacionTratamientoDatos.services')  

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.autorizacionTratamientoDatos = async function($conversa) {

    try {
        const sqlAutorizacion = 'INSERT INTO autorizaciones SET ?';

        const nuevaAutorizacion = {
        //id_encuesta: $conversa.id,
        id_encuesta: null,
        tratamiento_datos: true,
        terminos_condiciones: true,
        condiciones: true,
        created_at: new Date(),
        waId: $conversa.waId
        }

        //connection.query(sqlAutorizacion, nuevaAutorizacion, (error, results) => {
        /*db.query(sqlAutorizacion, nuevaAutorizacion, (error, results) => {
        if (error) {errorLog('dbquery.error',error);throw error;}

        });*/
        var tratamientoDatos = await TratamientoDatosService.crearAutorizacionTratamientoDatos(sqlAutorizacion, nuevaAutorizacion);
        errorLog('\n\n::--CREA TratamientoDatos::---\n\n'/*,tratamientoDatos*/);

    } catch (error) {
        errorLog(':::Error en autorizacionTratamientoDatos::', error);
    }
    
  }