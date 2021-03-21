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



app.get('/api/graphDates' , (req , res) => {
	/*
		Get every possible graph date, return array
	*/
});


app.get('/api/graph([\?]){0,}' , (req , res) => {
	/*
		Get entire graph given date, return JSON:

		{
			nodes: [
				{
					id: 'id1' ,
					...
				}
			] ,
			links: [
				{
					source: 'id1' ,
					target: 'id2' ,
					...
				} ,
				...
			]
		}

		Find the date here:
		req.query.date
	*/
});





//search for a particular node
app.get('/api/query/nodeSearch', (req, res)=>{
	connection.query("SELECT * FROM nodes WHERE node LIKE '%" + req.query.searchItem + "%'", (err,result,fields)=>{
		res.json(result);
	});
});
//search for a particular relationship
app.get('/api/query/relationSearch', (req, res)=>{
	connection.query("SELECT * FROM relationships WHERE relation LIKE '%" + req.query.searchItem + "%'", (err,result,fields)=>{
		res.json(result);
	});
});

//search for all outgoing edges
app.get('/api/query/outgoing', (req,res)=>{
	connection.query("SELECT * FROM nodes WHERE node IN (SELECT obj2 FROM relationships WHERE obj1='"+ req.query.node +"')",(err,result,fields)=>{
		res.json(result);
	});
});

//search for all incoming edges
app.get('/api/query/incoming', (req,res)=>{
	connection.query("SELECT * FROM nodes WHERE node IN (SELECT obj1 FROM relationships WHERE obj2='"+ req.query.node +"')",(err,result,fields)=>{
		res.json(result);
	});
});

//search for all incoming edges
app.get('/api/query/incoming', (req,res)=>{
	connection.query("SELECT * FROM nodes WHERE node IN (SELECT obj1 FROM relationships WHERE obj2='"+ req.query.node +"')",(err,result,fields)=>{
		res.json(result);
	});
});

//search for all nodes with certain graph_id
app.get('/api/query/nodes_graph_id', (req,res)=>{
	console.log("SELECT * FROM nodes WHERE graph_id =" + req.query.graphId);
	connection.query("SELECT * FROM nodes WHERE graph_id =" + req.query.graphId,(err,result,fields)=>{
		res.json(result);
	});
});

//search for all relationships with certain graph_id
app.get('/api/query/relationships_graph_id', (req,res)=>{
	console.log("SELECT * FROM relationships WHERE graph_id =" + req.query.graphId);
	connection.query("SELECT * FROM relationships WHERE graph_id =" + req.query.graphId,(err,result,fields)=>{
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
