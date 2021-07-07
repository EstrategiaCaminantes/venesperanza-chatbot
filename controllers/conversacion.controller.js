var ConversacionService = require('../services/conversacion.services')  

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}


exports.nuevaConversacion = async function(req, res, next){
  
    try {
        const sqlnuevo = 'INSERT INTO conversacion_chatbot SET ?';

        //console.log('PARAMS NUEVA CONVERSA: ', req.body);
        const params = req;
        //console.log(':::PARAMS:::', params);
    //var newprofile = params.ProfileName.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, ''); //version twilio
        //var newprofile = params.conversationContactId.replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, ''); //version messagebird
        var newprofile = params['contact.displayName'].replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, ''); //version messagebird
    //var newprofile = params['contact.firstName'].replace(/[^\ñ\Ñ\ü\Ü\á\Á\é\É\í\Í\ó\Ó\ú\Ú\w\s]/gi, ''); //version messagebird

        const nuevaconversacion = {
        //waId: params.WaId,
        //waId: params.contact.msisdn, //messagebird
        waId: params.contactPhoneNumber,
        profileName: newprofile,
        conversation_start: false,
        autorizacion: false,
        tipo_formulario: null,
        created_at: new Date()

        }

        var conversacion = await ConversacionService.crearConversacion(sqlnuevo, nuevaconversacion);
        //errorLog('::creaConversacion::',res.status(200).json({ status: 200, data: conversacion, message: 'Creo bien' }));
        //consultaConversacion(nuevaconversacion.waId);
        errorLog('::creaConversacion::'/*,conversacion*/);


    } catch (error) {
        //errorLog(':::Error en crearConversacion::', res.status(400).json({ status: 400, message: e.message }));
        errorLog(':::Error en crearConversacion::', error);
    }
  
}


exports.actualizarConversacion = async function($conversa){

    try {
        $conversa.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;

        //$conversa.updated_at = dateFormat($conversa.updated_at, "yyyy-mm-dd hh");

        const sqlConversacion = `UPDATE conversacion_chatbot SET conversation_start = ${$conversa.conversation_start}, 
        autorizacion = ${$conversa.autorizacion}, tipo_formulario = ${$conversa.tipo_formulario}, updated_at = '${$conversa.updated_at}'
        where id = ${$conversa.id}`;
        //console.log('VALOR SQL', sqlCreaEncuesta);

        //connection.query(sqlConversacion, (error, res) => {
        /*
        db.query(sqlConversacion, (error, res) => {
        if (error) console.log('ERROR: ', error);

        });
        */

        var conversacion = await ConversacionService.actualizarConversacion(sqlConversacion);

        
    } catch (error) {
        errorLog(':::Error en actualizarConversacion::', error);

    }
    
}