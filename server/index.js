const mysql = require('mysql');
const express = require('express');
const path = require('path')
const app = express();
const port  = 5000;

const connection = mysql.createConnection({
	host:'127.0.0.1',
	user:'std2',
	password: 'pass1234',
	database:'test'
});


app.use(express.static(path.join(__dirname , 'build')));

app.get('/api/helloworld' , (req , res) => {
    res.send('Hello from the Express Server!');
});


app.get('/api/test/:id' , (req , res) => {
    res.send(`Request for id ${req.params.id}`);
});

//search for a particular node
app.get('/api/query/nodeSearch', (req, res)=>{
	connection.query("SELECT * FROM Nodes WHERE node LIKE '%" + req.query.searchItem + "%'", (err,result,fields)=>{
		res.json(result);
	});
});
//search for a particular relationship
app.get('/api/query/relationSearch', (req, res)=>{
	connection.query("SELECT * FROM Relationships WHERE relation LIKE '%" + req.query.searchItem + "%'", (err,result,fields)=>{
		res.json(result);
	});
});

//search for all outgoing edges
app.get('/api/query/outgoing', (req,res)=>{
	connection.query("SELECT * FROM Nodes WHERE node IN (SELECT obj2 FROM Relationships WHERE obj1='"+ req.query.node +"')",(err,result,fields)=>{
		res.json(result);
	});
});

//search for all incoming edges
app.get('/api/query/incoming', (req,res)=>{
	connection.query("SELECT * FROM Nodes WHERE node IN (SELECT obj1 FROM Relationships WHERE obj2='"+ req.query.node +"')",(err,result,fields)=>{
		res.json(result);
	});
});



app.get('/' , (req , res) => {
    res.sendFile(path.join(__dirname , 'build' , 'index.html'));
});

connection.connect((err)=>{
	if(err)
		console.log("Error");
	else
		console.log("Connected to DB!");
});
app.listen(port , () => console.log(`Listening at http://localhost:${port}`));
