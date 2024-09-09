const express = require('express');
const app = express();
app.use(express.json());
const mysql = require('mysql');
;    
var server = app.listen(3000, ()=>{
    console.log('App running at http://127.0.0.1:3000');
    var db_conn = {       
        host: 'localhost',
        user: 'rteren',
        password: 'rteren',
        database: 'dt_full',
    };//replace these
    connex = mysql.createConnection(db_conn);
    connex.connect(function(err) {
        if (err) throw err;
        console.log("MySQL Connected!");
    });
})


app.post('/image-list/:ct', async function (req, res) {
    //Create an endpoint that gets a number and returns a list of random photo URLs.
    // Post since it is creating something
    let ct = req.params.ct;
    if (!parseInt(ct)) return res.send([]);
       
    let pixKey = '45640711-3b2c9c3e0dd9ac6e6a5b798be';
    let perPage=ct; // I asked about limits and non positive integer being sent but got no response - i am assuming 0<= ct <= 200
    
    let pixURL = 'https://pixabay.com/api/?image_type=photo&key='+pixKey+'&per_page='+ perPage;
    let pixRet= await fetch(pixURL);
    
    let pixJSON = await pixRet.json();
    let pixList = pixJSON.hits.map(p=> p.pageURL);

    res.send(pixList);}
)
app.post('/order', async function(req, res){   
    // i asked questions about sent data and got no answer, i am assuming all data other than URLs are string, URLs is in array
    var data = req.body;
    if(Array.isArray(data.imagesURLs)) data.imagesURLs = data.imagesURLs.join(',');
        
    let sql = 'insert into orders set ';
    sql += Object.entries(data).map(([key, value]) => key +'='+ mysql.escape(value)).join(',');
   
    connex.query(sql, function (err, result) {
        if (err) throw err;
        data.id = result.insertId;
        res.send(JSON.stringify(data));
      });
})

app.get('/orders/:user', async function(req, res){
    // i asked questions about 'user' and got no response. I am assuming user is uniquely identifyable string to user in orders table
    
    let sql = 'select * from orders where user = ' + mysql.escape(req.params.user)
   
    connex.query(sql, function (err, result) {
        if (err) {res.send("error");
            throw err;
            }
        
        res.send(result);
      });
    
    
})
