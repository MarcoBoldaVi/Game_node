var express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    multiparty = require('connect-multiparty'),
    mongodb = require('mongodb'),
    objectId = require('mongodb').ObjectId,
    fs = require('fs');
const { isBuffer } = require('util');


var app = express();

// body-parser
app.use(cors())
app.use(bodyParser.urlencoded({ extended:true}));
app.use(bodyParser.json());
app.use(multiparty());

var port = 8080;

app.listen(port);

var db = new mongodb.Db(
    'game_db',
    new mongodb.Server('localhost', 27017, {}),
    {}
)
console.log('Servidor Http online porta ' + port);

app.get('/', function(req, res){
    res.send({msg: 'olá'});
});

// POST
app.post('/api', function(req, res){
    res.setHeader("Access-Control-Allow-Origin", "*");

    var date = new Date();
    time_stamp = date.getTime();
    
    var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename;
    var path_origem = req.files.arquivo.path;
    var path_destino = './uploads/' + url_imagem;

    fs.rename(path_origem, path_destino, function(err){
        if(err){
            res.status(500).json({error: err});
            return; 
        }

        var dados = {
            url_imagem: url_imagem,
            name: req.body.name,
            damage: req.body.damage,
            defence: req.body.defence,
            hp: req.body.hp
        }
        db.open( function(err, mongoclient ){
            mongoclient.collection('champions', function(err, collection){
                collection.insert(dados, function(err, records){
                    if(err){
                        res.json(err);
                    } else {
                        res.json('Inclusão realizado com sucesso');
                    }
                    mongoclient.close();
                })        
            })
        }); 
    });
    
    
});

// GET All
app.get('/api', function(req, res){

    res.setHeader("Access-Control-Allow-Origin", "*");

    db.open( function(err, mongoclient ){
        mongoclient.collection('champions', function(err, collection){
            collection.find().toArray(function(err, results){
                if(err){
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            })        
        })
    }); 
});

// GET Unique
app.get('/api/:id', function(req, res){

    res.setHeader("Access-Control-Allow-Origin", "*");
    db.open( function(err, mongoclient ){
        mongoclient.collection('champions', function(err, collection){
            collection.find(objectId(req.params.id)).toArray(function(err, results){
                if(err){
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            })        
        })
    }); 
});

// GET image
app.get('/uploads/:imagem', function(req, res){

    var img = req.params.imagem;

    fs.readFile('./uploads/'+img, function(err, content){
        if(err){
            res.status(400).json(err);
            return;
        } 
        res.writeHead(200, {'content-type' : 'image/jpg'});
        res.end(content);
        
    })
});

// PUT
app.put('/api/:id', function(req, res){

    res.setHeader("Access-Control-Allow-Origin", "*");
    db.open( function(err, mongoclient ){
        mongoclient.collection('champions', function(err, collection){
            collection.update(
                { _id : objectId(req.params.id)},
                { $set : { name : req.body.name,
                           damage: req.body.damage,
                           defence: req.body.defence,
                           hp: req.body.hp
                         }
                },
                {},
                function(err, records){
                    if(err){
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close();
                }
            )
        })
    }); 
});

// DELETE
app.delete('/api/:id', function(req, res){
    res.setHeader("Access-Control-Allow-Origin", "*");
   
    db.open( function(err, mongoclient ){
        mongoclient.collection('champions', function(err, collection){
            collection.remove({ _id : objectId(req.params.id) },function(err, records){
                if(err){
                    res.json(err)
                } else {
                    res.json(records)
                }
                mongoclient.close();
            })
        })
    }); 
    
});