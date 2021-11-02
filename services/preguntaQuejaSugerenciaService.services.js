var db = require('../db');

function errorLog(title,msg) {
    if(process.env.ENV === 'test') {
        console.log(title,msg);
    }
}

exports.actualizarPQS = async function (query) {

    try {
        await db.query(query, (error, results) => {
            if (error) {errorLog('dbquery.error',error);throw error;}
        
           return results
        });
        //return users;
    } catch (e) {
        return e;
        // Log Errors
        //throw Error('Error while Paginating Users')
    }
}
