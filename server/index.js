const mysql = require('mysql');
const express = require('express');
const path = require('path');
const uniqid = require('uniqid');
const helper = require('./src/helper');
const app = express();
const port  = 5000;


const pool = mysql.createPool({
	connectionLimit: 10,
	host:'127.0.0.1',
	user:'elee',
	password: 'password',
	database:'MAINDB',
	multipleStatements:true
}); 

app.use(express.static(path.join(__dirname , 'build')));

app.get('/api/helloworld' , (req , res) => {
    res.send('Hello from the Express Server!');
});


app.get('/api/graphDates' , (req , res) => {
	/*
		Get every possible graph date, return array
	*/
	pool.getConnection( (err,connection)=>{
		connection.query("SELECT DISTINCT Date FROM nodes", (err,result,fields)=>{
			connection.release();
			var json_object = {};
			var date = "Date";
			json_object[date] = [];
			for(const tuple of result){
				json_object[date].push(tuple.Date);
			}
			res.json(json_object);
		});
	});
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

	pool.getConnection((err,connection)=>{
		var json_object = {};
		var field1 = "nodes";
		var field2 = "links";
		json_object[field1] = [];
		json_object[field2] = [];
		var current = new Date(req.query.date);
		current.setDate(current.getDate() - 1)
		var next_day = new Date(req.query.date);
		
		var query = "SELECT * FROM nodes"+
				" WHERE Date > \"" + current.toISOString() +"\"" + 
				" AND Date <= \"" + next_day.toISOString() + "\";";
		query += " SELECT * FROM relationships" + 
				" WHERE Date > \"" + current.toISOString() +"\"" + 
				" AND Date <= \"" + next_day.toISOString() + "\"";
		connection.query(query, (err, result, fields)=>{
			connection.release();
			for(const tuple of result[0]){
				json_object[field1].push(JSON.parse(JSON.stringify(tuple)));
			}
			
			for(const tuple of result[1]){
				json_object[field2].push(JSON.parse(JSON.stringify(tuple)));
			}
			
			res.json(json_object);
		});
	});
});
//MATT TODO: please replace this endpoint path with the one you want
app.get('/api/query/connectedComponent', (req,res)=>{
	/* Get the nodes and edges that make up the largest connected subgraph
	 * containing the specified node(s) ,return JSON:

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
	 * find nodeID in req.query.nodeID 
	 * find date in req.query.date
	 * */
	pool.getConnection((err,connection)=>{
		var json_object = {};
		var field1 = "nodes";
		var field2 = "links";
		json_object[field1] = [];
		json_object[field2] = [];
		var current = new Date(req.query.date);
		current.setDate(current.getDate() - 1);
		var next_day = new Date(req.query.date);
		var query = 
			"CREATE TEMPORARY TABLE rel_recurse" + //create temp table
				" (rel_id INT," +
				" obj1 INT," + 
				" obj2 INT," +
				" Date date);" + 
			" INSERT INTO rel_recurse" + //insert the values
			" WITH RECURSIVE CN(rel_id, obj1, obj2, Date) AS" +
				" ((SELECT -1 AS rel_id, " + 
					req.query.nodeID + " AS obj1, " +
					req.query.nodeID + " AS obj2, " +
					"20200101 AS Date)" +
				" UNION" +
				"(SELECT R.rel_id, R.obj1, R.obj2, R.Date" + 
				" FROM relationships R, CN " + 
				" WHERE" + 
				" (CN.obj1 = R.obj1 OR" + 
				" CN.obj2 = R.obj1 OR" +
				" CN.obj1 = R.obj2 OR" +
				" CN.obj2 = R.obj2) AND" + 
				" R.Date > \"" + helper.formattedDateString(current) +"\" AND" +
				" R.Date <= \"" + helper.formattedDateString(next_day) + "\" ))" + 
			" SELECT * FROM CN;" +
			" SELECT DISTINCT node_id, node, community, nodes.Date FROM nodes" + //obtain nodes
				" INNER JOIN rel_recurse ON node_id = obj1 OR node_id = obj2;"  
			" SELECT * FROM relationships " + //obtain relationships
				" WHERE rel_id = ANY (SELECT rel_id FROM rel_recurse)";
		connection.query(query, (err, results, fields)=>{
			connection.release();
			if(results[2] != undefined){
				for(const tuple of results[2]){
					json_object[field1].push(JSON.parse(JSON.stringify(tuple)));
				}
			}
			if(results[3] != undefined) {
				for(const tuple of results[3]){
					json_object[field2].push(JSON.parse(JSON.stringify(tuple)));
				}
			}
			res.json(json_object);
		});
	});
});

/**

	ALL these responses to GET requests are obsolete due to
	the changing of the way we connect to the database
	MATT TODO: uncomment the ones that you want to use

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

**/


app.get('/' , (req , res) => {
    res.sendFile(path.join(__dirname , 'build' , 'index.html'));
});

app.listen(port , () => console.log(`Listening at http://localhost:${port}`));


