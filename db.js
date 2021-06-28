const mysql = require('mysql');


const connection = mysql.createConnection({
    //host: 'localhost',
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    //user: 'root',
    password:process.env.DB_PASSWORD,
    //password: 'root',
    database: process.env.DB_NAME,
    //database : 'venesperanzaCHATBOT',
    port: process.env.DB_PORT
    //port:'8889'
  });

  connection.connect(error => {
    if (error) throw error;
    //console.log('Database server running OK');
  });

  module.exports = connection;