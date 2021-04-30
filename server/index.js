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
	user:'nodeApp',
	password: '18dkniuiaookjs',
	database:'MAINDB',
	multipleStatements:true
}); 

app.use(express.static(path.join(__dirname , 'build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/api/helloworld' , (req , res) => {
    res.send('Hello from the Express Server!');
});

/* All endpoints will perform type checking for :
 * 	input parameters that are of primitive type
 * 	ensure that date is a valid date
 *
 * */

function defError(response, error){
	res.json({'Error': error.code});
	return;
}
function InvOrMissingParams(response){
	res.json({'Error': "Missing or Invalid Parameters"});
	return;
}

app.post('/api/graphDates' , (req , res) => {
	
	/*
	 * Get every possible graph date, return array
	 * 
	 * input: 
	 * 	none
	 * output: 
	 * {
	 *	dates:[]
	 * }
	 * 
	 * 
	 * */
	pool.getConnection( (err,connection)=>{
		if(err) {
			defError(res, err);
			return;
		}

		connection.query("SELECT DISTINCT Date FROM nodes", (errQ,result,fields)=>{
			connection.release();
		
			if(errQ){
				defError(res,errQ);
				return;
			}
			else{
				let json_object = {};
				const field1 = "Date";	
				json_object[field1] = [];

				for(const tuple of result){
					json_object[field1].push(tuple.Date);
				}

				res.json(json_object);
			}	
		});
	});
});


app.post('/api/findObject' , (req , res) => {
	
	/*
	 * Find nodes and links/reks matching keywords and communities
	 * 
	 * input: 
	 * 	{
	 *		communities:string //'1;2;3;4;5...'
	 *		keywords:'string'  //'trump;biden;covid;'
	 * 	}
	 * output: 
	 * {
	 *	nodes: [(Node Objects)],
	 *	links: [(Link Objects)]
	 * }
	 * 
	 * 
	 * */
	
	//check for all parameters
	if(req.body.input == undefined || req.body.input.communities == undefined || req.body.input.keywords == undefined){
		InvOrMissingParams(res);
		return;
	}
	//check parameters are of correct type
	
	for(const communityID of req.body.input.communities){
		if(typeof communityID != "number"){
			InvOrMissingParams(res);
			return;
		}
	}
	for(const keyword of req.body.input.keywords){
		if(typeof keyword != "string"){
			InvOrMissingParams(res);
			return;
		}
	}
	
	pool.getConnection( (err,connection)=>{
		if(err) {
			defError(res, err);
			return;
		}
		
		//create node query
		let node_query = 'SELECT * FROM nodes';
		let rel_query = ';SELECT * FROM relationships';	
		//adding constraints

		if(req.body.input.communities != '' || req.body.input.keywords != ''){	
			node_query += " WHERE";	
			if(req.body.input.communities != ''){	
				const communities = req.body.input.communities.split(';');
				
				for(let i = 0; i < (communities.length - 1); i++){
					node_query += " community = " + connection.escape(communities[i]) + " OR"; 	
				}

				node_query += " community = " + connection.escape(communities[communities.length - 1]);
			}
			if(req.body.input.keywords != ''){
				rel_query += " WHERE";	
				const keywords = req.body.input.keywords.split(';');
				
				if(req.body.input.communities != ''){
					node_query += " OR";
				}

				for(let i = 0; i < keywords.length - 1; i++){
					node_query += " node LIKE " + connection.escape("%" + keywords[i] + "%") + " OR";
					rel_query += " relation LIKE " + connection.escape("%" + keywords[i] + "%") + " OR";
				}		
				node_query += " node LIKE " + connection.escape("%" + keywords[keywords.length - 1] + "%") ;
				rel_query += " relation LIKE " + connection.escape("%" + keywords[keywords.length - 1] + "%") ;
			}

		}
		console.log(node_query.concat(rel_query));
		connection.query(node_query.concat(rel_query), (errQ,result,fields)=>{
			connection.release();
			
			if(errQ){
				res.json({'Error':errQ.code});
			}
			else{
				let json_object = {};
				const fields = ["nodes", "links"];	
				for(let i = 0; i < fields.length; i++){
					json_object[fields[i]] = [];	
			
					if(result[i] != undefined){
						for(const tuple of result[i]){
							json_object[fields[i]].push(tuple);
						}
					}
				}
				res.json(json_object);
			}	
		});
	});
});


app.post('/api/neighborhood' , (req , res) => {
	
	/*
	 * returns subgraph centered at 
	 * 	with node with id 'id' 
	 * 	with date on 'date'
	 * 	with depth 'depth
	 * 
	 * input: 
	 * {
	 *	id: int, //node id
	 *	date: 'date', //has to be in the format that is 
	 *		      //acceptable for Date.parse()
	 *	depth: int
	 * }
	 * output: 
	 * {
	 *	nodes: [],
	 *	links: []
	 * }
	 * 
	 * 
	 * */
	//check for presence of required params
	if(req.body.input == undefined || 
	   req.body.input.id == undefined || 
	   req.body.input.date == undefined ||
	   req.body.input.depth == undefined){
		InvOrMissingParams(res);
		return;
	}
	
	//check for correct types
	let node_date = new Date(req.body.input.date);
	if((typeof req.body.input.id != "number") ||
	   (node_date == "Invalid Date") ||
	   (typeof req.body.input.depth != "number")){
		InvOrMissingParams(res);
		return;
	}

	let prev_date = new Date(req.body.input.date);
	prev_date.setDate(prev_date.getDate() - 1);
		
	pool.getConnection( (err,connection)=>{
		if(err) {
			defError(res,err);
			return;
		}
		
		const id_esc = connection.escape(req.body.input.id);
		const depth_esc = connection.escape(req.body.input.depth);
		const date_esc = connection.escape(node_date);
		const prev_date_esc = connection.escape(prev_date);
		let query = 
			" CREATE TEMPORARY TABLE rel_recurse" + //create temp table, result 0
                                " (rel_id INT," +
                                " obj1 INT," +
                                " obj2 INT," +
                                " Date date);" +
                        " INSERT INTO rel_recurse VALUES" + //insert initial nodeID, result 1
                                " (-1," +
                                id_esc + "," +
                                id_esc + "," +
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
                                " R.Date > " + prev_date_esc +" AND" +
                                " R.Date <= " + date_esc + " " +
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
                                " R.Date > " + prev_date_esc +" AND" +
                                " R.Date <= " + date_esc + " " +
                                " );" +
                                " DROP TABLE rel_rec_copy;" //drop sec table
                }

		query += " SELECT DISTINCT node_id, node, community, nodes.Date FROM nodes" + //obtain nodes
                                " INNER JOIN rel_recurse on node_id = obj1 OR node_id = obj2;" +
                        " SELECT * FROM relationships" + //obtain relationships
                        " WHERE rel_id = ANY(SELECT rel_id FROM rel_recurse)";

		connection.query(query, (errQ,result,fields)=>{
			connection.destroy();
		
			if(errQ){
				defError(res,errQ);
				return;
			}
			else{
				let json_object = {};
				const fields = ["nodes", "links"];	

				const depthOffset = 5 + depth * 4 + 1 + 2;
				const depthOffsetNodes = 5 + depth * 4 + 1;

				for(let i = 0; i < 2; i++){
					if(results[depthOffsetNodes + i] != undefined){
						for(const tuple of results[depthOffsetNodes + i]){
							json_object[fields[i]].push(tuple);
						}
					}
				}
				for(const tuple of result){
					json_object[field1].push(tuple.Date);
				}
				res.json(json_object);
			}	
		});
	});
});



app.post('/api/voteNode' , (req , res) => {
	
	/*
	 * vote up or down a node
	 * 
	 * input: 
	 * {
	 *	id: int 
	 *	date: date 	// has to be of the format
	 *		  	// acceptable by Date.parse
	 *	vote: boolean	//true for upvote, false for downvote
	 * }
	 * output: 
	 * 	none
	 * 
	 * */
	//check for presence of required params
	if(req.body.input == undefined ||
	   req.body.input.id == undefined ||
	   req.body.input.date == undefined ||
	   req.body.input.vote == undefined){
		InvOrMissingParams(res);
		return;	
	}
	
	//check for correct types
	let node_date = new Date(req.body.input.date);
	if((typeof req.body.input.id != "number") ||
	   (node_date == "Invalid Date") ||
	   (typeof req.body.input.vote != "boolean")){
		InvOrMissingParams(res);
		return;
	}

	let prev_date = new Date(req.body.input.date);
	prev_date.setDate(prev_date.getDate() - 1);



	pool.getConnection( (err,connection)=>{
		if(err) {
			defError(res, err);
			return;
		}
		
		const id_esc = connection.escape(req.body.input.id);
		const date_esc = connection.escape(node_date);
		const prev_date_esc = connection.escape(prev_date);
		let upOrDown = "";
		if(req.body.input.vote == true){
			upOrDown = "thumbs = thumbs + 1";	
		}
		else{
			upOrDown = "thumbs = thumbs - 1";
		}
		let query =

 			"UPDATE node_rating" +
                        " SET " + upOrDown +
                        " WHERE " +
                        " Date > \"" +  prev_date_esc + "\" AND" +
                        " Date <= \"" +  date_esc + "\" AND" +
                        " node_id = " + id_esc;
		connection.query(query, (errQ,result,fields)=>{
			connection.release();
		
			if(errQ){
				defError(res,errQ);
				return;
			}
			else{
				res.sendStatus(200);//send status OK
			}	
		});
	});
});

app.post('/api/voteRel' , (req , res) => {
	
	/*
	 * vote up or down a rel
	 * 
	 * input: 
	 * {
	 *	id: int		//relID 
	 *	date: date 	// has to be of the format
	 *		  	// acceptable by Date.parse
	 *	sourceId: int
	 *	targetId: int
	 * 	vote: boolean	//true for upvote, false for downvote
	 * }
	 * output: 
	 * 	none
	 * 
	 * */
	//check for presence of required params
	if(req.body.input == undefined ||
	   req.body.input.id == undefined ||
	   req.body.input.date == undefined ||
	   req.body.input.sourceId == undefined ||
	   req.body.input.targetId == undefined ||
	   req.body.input.vote == undefined){
		InvOrMissingParams(res);
		return;	
	}
	
	//check for correct types
	let node_date = new Date(req.body.input.date);
	if((typeof req.body.input.id != "number") ||
	   (node_date == "Invalid Date") ||
	   (typeof req.body.input.sourceId != "number") ||
	   (typeof req.body.input.targetId != "number") ||
	   (typeof req.body.input.vote != "boolean")){
		InvOrMissingParams(res);
		return;
	}

	let prev_date = new Date(req.body.input.date);
	prev_date.setDate(prev_date.getDate() - 1);

	pool.getConnection( (err,connection)=>{
		if(err) {
			defError(res, err);
			return;
		}
		
		const id_esc = connection.escape(req.body.input.id);
		const date_esc = connection.escape(node_date);
		const prev_date_esc = connection.escape(prev_date);
	   	const sourceId_esc = connection.escape(req.body.input.sourceId);
		const targetId_esc = connection.escape(req.body.input.targetId);

		let upOrDown = "";
		if(req.body.input.vote == true){
			upOrDown = "thumbs = thumbs + 1";	
		}
		else{
			upOrDown = "thumbs = thumbs - 1";
		}
		let query =
			"UPDATE rel_rating" +
                        " SET " + upOrDown +
                        " WHERE" +
                        " Date > " +  prev_date_esc + "\" AND" +
                        " Date <= \"" +  date_esc + "\" AND" +
                        " obj1 = " + sourceId_esc + " AND" +
                        " obj2 = " + targetId_esc + " AND" +
                        " rel_id = " + id_esc;
		connection.query(query, (errQ,result,fields)=>{
			connection.release();
		
			if(errQ){
				defError(res,errQ);
				return;
			}
			else{
				res.sendStatus(200);//send status OK
			}	
		});
	});
});


/*-------------------------------------------------------------------------------------------------------------------*/


app.get('/api/graph([\?]){0,}' , (req , res) => {
	/* Get entire graph given date, return JSON:
	 *
	 * GET Parameters: accessed through req.query.paramter:
	 * date:date of graph desired
	 *
	 * {
	 *	nodes:[
	 *		{
	 *			node_id: #,
	 *			...
	 *		},
	 *		...
	 *	],
	 *	links: [
	 *		{
	 *			obj1:'obj1',
	 *			obj2:'obj2',
	 *			...
	 *		},
	 *		...
	 *	]
	 * }
	 * if SQL query fails returns: 
	 * {
	 *	nodes: "failed_query",
	 *	links: []
	 * }
	 *
	 * */
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
			if(errQ){
				json_object[field1] = "failed_query";
			}
			else{
					
				for(const tuple of result[0]){
					json_object[field1].push(JSON.parse(JSON.stringify(tuple)));
				}
				
				for(const tuple of result[1]){
					json_object[field2].push(JSON.parse(JSON.stringify(tuple)));
				}
			}	
			res.json(json_object);
		});
	});
});



app.get('/api/query/connectedComponent([\?]){0,}', (req,res)=>{
	/* Get the nodes and edges that make up the largest connected subgraph
	 * containing the specified node(s) ,return JSON:
	 *
	 * GET Parameters: accessed through the req.query.parameter:
	 * date: date of sub-graph
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
	 * 
	 * If SQL statement fails sends back 
	 * {
	 *	nodes: "failed_query",
	 *	links: []
	 * }
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
			if(errQ){
				json_object[field1] = "failed_query";
			}
			else{
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
			}
			res.json(json_object);
		});
	});
});

//MATT TODO: rename the path as you like
app.get('/api/query/connectedWithDepth([\?]){0,}', (req,res)=>{
	/* Get the nodes and edges that are n edges away from the specified node
	 * containing the specified node ,return JSON:
	 *
	 * GET Parameters: accessed through req.query.parameter
	 * nodeID: id of specified node
	 * date: date of specified node
	 * depth: how far look for edges and nodes
	 * Returns:
	 * 	{
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

	 * If SQL query fails returns:
	 * { 
	 * 	nodes:"failed_query",
	 * 	links:[]
	 * }
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
			if(errQ){
				json_object[field1] = "failed_query";	
			}
			else{
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
			}
			res.json(json_object);
		});
	});
});

//MATT TODO: change the path as you wish
app.get('/api/query/nodeSearch([\?]){0,}', (req,res)=>{
	/* Get the corresponding possible nodes given string(node name)
	 * The other queries take in a nodeID. This endpoint should be used to 
	 * find which node that we actually want to do the more complicated queries for
	 *
	 * GET Parameter:
	 * searchNode: given search string
	 * 
	 * On Success Returns:
	 * {
	 *	nodes: [ARRAY OF TUPLES WITH NODE DETAILS]
	 * }
	 * On FAILURE Returns:
	 * {
	 *	nodes: 'failed_query'
	 * }
	 * */
	pool.getConnection((err,connection)=>{
		var json_object = {};
		var field1 = "nodes";
		json_object[field1] = [];
		
		var query = "SELECT * FROM nodes WHERE node LIKE '%" + req.query.searchNode + "%'";
		connection.query(query, (errQ, results, fields)=>{
			connection.release();
			if(errQ){
				console.log(errQ);
				json_object[field1] = "failed_query";	
			}
			else if(results != undefined){
				if(results.length == 0){
					json_object[field1] = [];
				}
				else{
					for(const tuple of results){
						json_object[field1].push(JSON.parse(JSON.stringify(tuple)));
					}
				}
			}
			else{
				json_object[field1] = "failed_query";
			}	
			res.json(json_object);
		});
	});
});

//MATT TODO: replace the path as you wish
app.get('/api/query/relationshipSearh([\?]){0,}', (req,res)=>{
	/* Get the corresponding possible relationships given string(node name)
	 * The other queries take in a nodeID. This endpoint should be used to 
	 * find which node that we actually want to do the more complicated queries for
	 *
	 * GET Parameter:
	 * searchRel: given search string
	 * 
	 * On Success Returns:
	 * {
	 *	relationships: [ARRAY OF TUPLES WITH NODE DETAILS]
	 * }
	 * On FAILURE Returns:
	 * {
	 *	relationships: 'failed_query'
	 * }
	 * */
	pool.getConnection((err,connection)=>{
		var json_object = {};
		var field1 = "relationships";
		json_object[field1] = [];
		
		var query = "SELECT * FROM relationships WHERE relation LIKE '%" + req.query.searchNode + "%'";
		connection.query(query, (errQ, results, fields)=>{
			connection.release();
			if(errQ){
				console.log(errQ);
				json_object[field1] = "failed_query";	
			}
			else if(results != undefined){
				if(results.length == 0){
					json_object[field1] = [];
				}
				else{
					for(const tuple of results){
						json_object[field1].push(JSON.parse(JSON.stringify(tuple)));
					}
				}
			}
			else{
				json_object[field1] = "failed_query";
			}	
			res.json(json_object);
		});
	});
});



//MATT TODO: change the path as you wish
app.post('/api/update/nodeRating([\?]){0,}',(req,res)=>{
	/* Update the thumbs up/down for nodes
	 * Returns updated thumbs up/down
	 *
	 * POST parameters: accessed by req.body.parameter
	 * date: date of node to update
	 * nodeID: ID of node to update
	 * upDown: 0 if want to decrement rating, 1 if want to increment rating
	 * 
	 * Sends Back JSON object:
	 * {
	 *	thumbs: [amount of thumbs]
	 * }
	 * If SQL query failed returns:
	 * {
	 *	thumbs: "failed_query"
	 * }
	 * If SQL query does not find any relationship with 
	 * given details returns:
	 * {
	 *	thumbs: []
	 * }
	 * */
	pool.getConnection((err, connection)=>{
		var json_object = {};
		var field1 = 'thumbs';
		var current = new Date(req.body.date);
		current.setDate(current.getDate() - 1);
		var next_day = new Date(req.body.date);
		current = helper.formattedDateString(current);
		next_day = helper.formattedDateString(next_day);
		var upOrDown;

		if(req.body.upDown=="1"){
			upOrDown = "thumbs = thumbs + 1"; 
		}
		else if(req.body.upDown == "0"){
			upOrDown = "thumbs = thumbs - 1"
		}
		else {
			upOrDown = "thumbs = thumbs";
		}
		var query = 
			"UPDATE node_rating" + 
			" SET " + upOrDown + 
			" WHERE " + 
			" Date > \"" +  current + "\" AND" + 
			" Date <= \"" +  next_day + "\" AND" +
			" node_id = " + req.body.nodeID + ";" +
			" SELECT * FROM node_rating " + //second query
			" WHERE " + 
			" Date > \"" +  current + "\" AND" + 
			" Date <= \"" +  next_day + "\" AND" +
			" node_id = " + req.body.nodeID;	
		connection.query(query, (errQ, results, fields)=> {
			connection.release();
			if(errQ){
				console.log(errQ);
				json_object[field1] = "failed_query";
			}	
			else if(results[1] != undefined){
				if(results[1].length == 0){
					json_object[field1] = [];
				}
				else{
					json_object[field1] = results[1][0].thumbs;
				}
			}
			else{
				json_object[field1] = "failed_query";
			}
			res.json(json_object);
		});
	});
});
/**-----------BIG TO-DOs-------------
 * 1. create the second endpoint for updating the rel Rating
 * 2. alter the tables on SPADE, remove the thumbs down
 * 3. Escape all input strings
 * 4. Create endpoint to obtain all relationships and nodes with 
 * 	rating above a given number
 * 5. Create tests for each endpoint
 *
 * WHICH are done:
 * 1,2
 * */
//MATT TODO: change the path as you wish
app.post('/api/update/relRating([\?]){0,}',(req,res)=>{
	/* Update the thumbs up/down for relationships
	 * Returns updated thumbs up/down
	 * 
	 *
	 * POST Parameters: accessed through req.body.parameter:
	 * date : date of node to update
	 * obj1 : node_id of source of relationship
	 * obj2 : node_id of sink of relationship
	 * relID : id of relationship between source and sink
	 * upDown: 0 to decrement rating, 1 to increment rating
	 *
	 * Sends Back JSON object:
	 * {
	 *	thumbs: [amount of thumbs]
	 * }
	 * If SQL query failed returns:
	 * {
	 *	thumbs: "failed_query"
	 * }
	 * If SQL query does not find any relationship with 
	 * given details returns:
	 * {
	 *	thumbs: []
	 * }
	 * */
	pool.getConnection((err, connection)=>{
		var json_object = {};
		var field1 = 'thumbs';

		var current = new Date(req.body.date);
		current.setDate(current.getDate() - 1);
		var next_day = new Date(req.body.date);

		current = helper.formattedDateString(current);
		next_day = helper.formattedDateString(next_day);
		
		var upOrDown;
		
		if(req.body.upDown == "1"){
			upOrDown = "thumbs = thumbs + 1";
		}
		else if(req.body.upDown == "0"){
			upOrDown = "thumbs = thumbs - 1";
		}
		else {
			upOrDown = "thumbs = thumbs";
		}
		
		var query = 
			"UPDATE rel_rating" + 
			" SET " + upOrDown + 
			" WHERE" + 
			" Date > \"" +  current + "\" AND" + 
			" Date <= \"" +  next_day + "\" AND" +
			" obj1 = " + req.body.obj1 + " AND" + 
			" obj2 = " + req.body.obj2 + " AND" + 
			" rel_id = " + req.body.relID+";" +
			" SELECT * FROM rel_rating " + //second query
			" WHERE " +
			" Date > \"" +  current + "\" AND" + 
			" Date <= \"" +  next_day + "\" AND" +
			" obj1 = " + req.body.obj1 + " AND" + 
			" obj2 = " + req.body.obj2 + " AND" + 
			" rel_id = " + req.body.relID;
		connection.query(query, (errQ, results, fields)=> {
			connection.release();
			if(errQ) {
				console.log(errQ);
				json_object[field1] = "failed_query";
			}
			else if(results[1] != undefined){
				if(results[1].length == 0){
					json_object[field1] = [];
				}
				else{
					json_object[field1] = results[1][0].thumbs;
				}
			}
			else{
				json_object[field1] = "failed_query";
			}
			res.json(json_object);
		});
	});
});


app.get('/' , (req , res) => {
    res.sendFile(path.join(__dirname , 'build' , 'index.html'));
});

const server = app.listen(port , () => console.log(`Listening at http://localhost:${port}`));

process.on('SIGINT', ()=>{
	console.log("Closing Pool.");
	pool.end((err)=>{
		if(err){
			console.log(err);
		}
		console.log("Pool Closed.");
	});
	console.log("Closing Server.");
	server.close((err)=>{
		if(err){
			console.log(err);
		}
		console.log("Server Closed.")
	})
	process.exitCode = 0;
});
