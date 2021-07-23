var messagebird = require('messagebird')(process.env.MB_KEY, 50000);

var whatsappMessageController = require('./whatsappMessage.controller');
var db = require('../db');

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.notificacionReportarLlegada = async function (req,res) {
    try {

        mensajesEnviados = 0;
        //mensajesArray = [];
        req.body.forEach(usuario => {
            
              var params = {
                'to': usuario.numero_whatsapp,
                'from': process.env.MB_CHANEL_ID,
                'type': 'hsm',
                  'content': {
                    'hsm': {
                      'namespace': 'e3e14847_97d6_4731_a155_2a089c961b5d',
                      //'templateName': 'welcome',
                      'templateName': 'arrival_report',
                      'language': {
                        'policy': 'deterministic',
                        'code': 'es',
                      },
                      //params: [{ default: 'Bob' }, { default: 'tomorrow!' }],
                    }
                      },
                  'reportUrl': 'https://webhook.site/681229d0-1961-4b03-b9f7-113b37636538'
              };
              
              messagebird.conversations.send(params, function (err, response) {
                if (err) {
                  
                    errorLog('sendNotificationArrivalReportWhatsapp-err',err); 
                    res.status(400);
                      res.send({
                          status: "error",
                          message: "Error al enviar Mensajes"
                      });
                }else{

                  mensajesEnviados += 1;
                  //mensajesArray.push(usuario);
                  
                  errorLog('sendNotificationArrivalReportWhatsapp-response',response);
                  //console.log('USUARIO ACTUAL: ', usuario);
                  if(mensajesEnviados == req.body.length - 1){
                    //console.log('TOTAL MENSAJES ENVIADOS',mensajesEnviados);
                    
                    //console.log('USUARIO ULTIMO: ',req.body[req.body.length - 1]);
                      res.status(200);
                      res.send({
                          status: "success",
                          //message: mensajesArray
                          message: "Se enviaron "+mensajesEnviados+" notificaciones de "+req.body.length
                      });
                    
                  }
                  
                }

              });

        });
        
        
    } catch (error) {
      res.status(400);
        res.send({
        status: "error",
        message: "ERROR EN FUNCION Chatbot!!"
        });
      errorLog('sendNotificationArrivalReportWhatsapp-err',e);
    }
}

