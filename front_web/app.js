var express = require('express')
var cors = require('cors')
var app = express()

app.use(cors())


/* importar as configurações do servidor */
var app = require('./config/server');

/* parametrizar a porta de escuta */
app.listen(80, function(){
	console.log('Servidor online');
})
