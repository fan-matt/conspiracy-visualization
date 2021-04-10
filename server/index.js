const mysql = require('mysql');
const express = require('express');
const path = require('path');
const helper = require('./src/helper');
const bodyParser = require('body-parser');
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/api/helloworld' , (req , res) => {
    res.send('Hello from the Express Server!');
});


app.get('/api/graphDates' , (req , res) => {
	/*
		Get every possible graph date, return array
	*/
	pool.getConnection( (err,connection)=>{
		if(err) {
			console.log(err);
			return;
		}

		connection.query("SELECT DISTINCT Date FROM nodes", (errQ,result,fields)=>{
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
		connection.query(query, (errQ, result, fields)=>{
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



app.get('/api/query/connectedComponent([\?]){0,}', (req,res)=>{
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
		connection.query(query, (errQ, results, fields)=>{
			connection.destroy();
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

//MATT TODO: rename the path as you like
app.get('/api/query/connectedWithDepth([\?]){0,}', (req,res)=>{
	/* Get the nodes and edges that are n edges away from the specified node
	 * containing the specified node ,return JSON:

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
	 * fine depth in req.query.depth , depth must be greater than or equal to 1
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
		var depth = parseInt(req.query.depth) - 1;
		var query = 
			" CREATE TEMPORARY TABLE rel_recurse" + //create temp table, result 0
				" (rel_id INT," +
				" obj1 INT," + 
				" obj2 INT," +
				" Date date);" +
			" INSERT INTO rel_recurse VALUES" + //insert initial nodeID, result 1
				" (-1," +
				req.query.nodeID + "," +
				req.query.nodeID + "," + 
				"20200101);" + 
			" CREATE TEMPORARY TABLE rel_rec_copy LIKE rel_recurse;" + //create secondary temp table, result 2
			" INSERT INTO rel_rec_copy (SELECT * FROM rel_recurse);" + //fill sec table, result 3
			" INSERT INTO rel_recurse (" +  //add to rel_recurse result 4
				" SELECT R.rel_id, R.obj1, R.obj2, R.Date" + 
				" FROM relationships R, rel_rec_copy Copy" +
				" WHERE" + 
				" (R.obj1 = Copy.obj1 OR" +
				" R.obj2 = Copy.obj1 OR" +
				" R.obj1 = Copy.obj2 OR" +
				" R.obj2 = Copy.obj2) AND" +
				" R.Date > \"" + helper.formattedDateString(current) +"\" AND" +
				" R.Date <= \"" + helper.formattedDateString(next_day) + "\" " +
			" );" +
			" DROP TABLE rel_rec_copy;"; //drop sec table, result 5
		for(i = 0; i < depth; i++){
			query +=
				" CREATE TEMPORARY TABLE rel_rec_copy LIKE rel_recurse;" + //create secondary temp table
				" INSERT INTO rel_rec_copy (SELECT * FROM rel_recurse);" + //fill sec table
				" INSERT INTO rel_recurse (" + //add to rel_recurse
					" SELECT R.rel_id, R.obj1, R.obj2, R.Date" +
					" FROM relationships R, rel_rec_copy Copy" + 
					" WHERE" + 
					" (R.obj1 = Copy.obj1 OR" +
					" R.obj2 = Copy.obj1 OR" + 
					" R.obj1 = Copy.obj2 OR" +
					" R.obj2 = Copy.obj2) AND" +
    				" R.Date > \"" + helper.formattedDateString(current) +"\" AND" +
				" R.Date <= \"" + helper.formattedDateString(next_day) + "\" " +
				" );" +
				" DROP TABLE rel_rec_copy;" //drop sec table
		}	
		query += " SELECT DISTINCT node_id, node, community, nodes.Date FROM nodes" + //obtain nodes
				" INNER JOIN rel_recurse on node_id = obj1 OR node_id = obj2;" + 
			" SELECT * FROM relationships" + //obtain relationships
			" WHERE rel_id = ANY(SELECT rel_id FROM rel_recurse)";
		connection.query(query, (errQ, results, fields)=>{
			connection.destroy();
			const depthOffset = 5 + depth * 4 + 1 + 2; 
			const depthOffsetNodes = 5 + depth * 4 + 1;
			if(results[depthOffsetNodes] != undefined){
				for(const tuple of results[depthOffsetNodes]){
					json_object[field1].push(JSON.parse(JSON.stringify(tuple)));
				}
			}
			if(results[depthOffsetNodes + 1] != undefined) {
				for(const tuple of results[depthOffsetNodes + 1]){
					json_object[field2].push(JSON.parse(JSON.stringify(tuple)));
				}
			}
			res.json(json_object);
		});
	});
});
//MATT TODO: change the path as you wish
app.get('/api/query/nodeID([\?]){0,}', (req,res)=>{
	/* Get the corresponding possible nodes given string(node name)
	 * The other queries take in a nodeID. This endpoint should be used to 
	 * find which node that we actually want to do the more complicated queries for
	 *
	 * find the string in req.query.searchNode
	 * */
	pool.getConnection((err,connection)=>{
		var json_object = {};
		var field1 = "nodes";
		json_object[field1] = [];
		
		var query = "SELECT * FROM nodes WHERE node LIKE '%" + req.query.searchNode + "%'";
		console.log(query);
		connection.query(query, (errQ, results, fields)=>{
			connection.release();
			console.log(results);
			if(results != undefined){
				for(const tuple of results){
					json_object[field1].push(JSON.parse(JSON.stringify(tuple)));
				}
			}
			else{
				json_object[field1].push("undefined");
			}	
			res.json(json_object);
		});
	});
});

app.get('/' , (req , res) => {
    res.sendFile(path.join(__dirname , 'build' , 'index.html'));
});

app.listen(port , () => console.log(`Listening at http://localhost:${port}`));

process.on('SIGINT', ()=>{
	console.log("Closing Pool");
	pool.end((err)=>{
		if(err){
			console.log(err);
		}
	});
});
