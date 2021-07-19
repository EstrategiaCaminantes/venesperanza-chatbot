var messagebird = require('messagebird')(process.env.MB_KEY, 50000);

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.sendMessageWhatsapp = async function(params, res, next){
    errorLog('sendMessageWhatsapp-Params',params);
      //params.from = '9673e34a-1c1e-4a61-be4d-0432abd4a98f';
      if (process.env.ENV === 'test' || process.env.ENV === 'prodr') {
        params.reportUrl = process.env.WP_REPORT_URL;
        }
        
      try {
        messagebird.conversations.reply(params.conversationId, params, function (err, response) {
            if (err) {
                errorLog('sendMessageWhatsapp-err',err);
            }
            errorLog('sendMessageWhatsapp-response',response);
            //db.end();
            console.log('::CIERRO CONEXION DB EN SENDMESSAGEWHATSAPP:::');
            
        });
    } catch (e) {
        errorLog('sendMessageWhatsapp-err',e);
    }
     
      
}