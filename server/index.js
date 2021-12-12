const JSON5 = require('json5');
const mysql = require("mysql");
const express = require("express");
const path = require("path");
const helper = require("./src/helper");
const bodyParser = require("body-parser");
const app = express();
const port = 5000;

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "127.0.0.1",
  user: "elee",
  password: "password",

  database: "MAINDB",
  multipleStatements: true,
});

app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/helloworld", (req, res) => {
  res.send("Hello from the Express Server!");
});

/* All endpoints will perform type checking for :
 * 	input parameters that are of primitive type
 * 	ensure that date is a valid date
 *
 * */

function defError(response, error) {
  response.json({ Error: error.code });
  return;
}
function InvOrMissingParams(response) {
  response.json({ Error: "Missing or Invalid Parameters" });
  return;
}

app.post("/api/graphDates", (req, res) => {
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
	  pool.getConnection((err, connection) => {
		if (err) {
			defError(res, err);
			return;
		}
		connection.query(
		"SELECT DISTINCT Date FROM nodes",
		(errQ, result, fields) => {
			connection.release();

			if (errQ) {
				  defError(res, errQ);
				  return;
			} else {
				  let json_object = {};
				  const field1 = "Date";
				  json_object[field1] = [];

				  for (const tuple of result) {
				    json_object[field1].push(tuple.Date);
				  }

				  res.json(json_object);
			}
		});
	});
});

app.post("/api/staticGraphs", (req, res)=>{
/* Find nodes and links attached to the given graph_id
 *
 * input:{
 *	graphID: int
 * }
 *
 * output:{
 *	nodes:[node objects],
 *	links:[link objects]
 * }
 *
 * */
 //check for presence of required params
  if (
    req.body.input == undefined ||
    req.body.input.graphID == undefined
  ) {
    InvOrMissingParams(res);
    return;
  }

  //check for correct types
  let node_date = new Date(req.body.input.date);
  if (typeof req.body.input.graphID != "number") {
    InvOrMissingParams(res);
    return;
  }
  if(req.body.input.graphID > -1){
	InvOrMissingParams(res);
	return;
  }
  pool.getConnection((err, connection) => {
    if (err) {
      defError(res, err);
      return;
    }
    const graph_id_esc = connection.escape(req.body.input.graphID);
    connection.query(
		"SELECT " + 
	    	"Date, " +
	    	"node_id, " + 
	    	"node, " + 
	    	"community, " + 
	    	"graph_id" +
	    	" FROM nodes WHERE graph_id = " + graph_id_esc + ";" +
	    	"SELECT * FROM relationships WHERE graph_id = " + graph_id_esc ,
		(errQ, result, fields) => {
			const graph_id_esc = connection.escape(req.body.input.graphID);
			connection.release();

			if (errQ) {
				defError(res, errQ);
				return;
			} else {
				let json_object = {};
			
				json_object["nodes"] = [];
				json_object["links"] = [];
				if (result[0] != undefined) {
				  for (const tuple of result[0]) {
				    console.log(tuple);
				    json_object["nodes"].push(tuple);
				  }
				}
				//relationships
				json_object["links"] = [];
				if (result[1] != undefined) {
				  for (const tuple of result[1]) {
					if(tuple["meta"] != null && tuple["meta"] != "") {
				
					console.log(`unfiltered meta: ${tuple["meta"]}`);

					// let metaString = String(tuple["meta"]).replaceAll("'", "\"");
					let metaString = tuple["meta"];
					metaString = metaString.replaceAll(/[^\u000A\u0020-\u007E]/g, " ");
					
					console.log(`metaString: ${metaString}`);

					let p = JSON5.parse(metaString);
				    // var p = JSON.parse(tuple["meta"].replace(/'/g, '"'));
				    // temp = tuple["meta"];
					temp = metaString;
				    delete tuple["meta"];

				    var obj = JSON.parse(JSON.stringify(tuple));
				    var keys = Object.keys(p);

				    for (var i = 0; i < keys.length; i++) {
				      obj[keys[i]] = p[keys[i]];
				    }
				    json_object["links"].push(obj);
					}
				  }
				}
				res.json(json_object);
			}
  		});
  	});
});

app.post("/api/findObject", (req, res) => {
  /*
   * Find nodes and links/rels matching keywords and communities
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
  if (
    req.body.input == undefined ||
    req.body.input.communities == undefined ||
    req.body.input.keywords == undefined
  ) {
    InvOrMissingParams(res);
    return;
  }
  //check parameters are of correct type

  for (const communityID of req.body.input.communities) {
    if (typeof communityID != "number") {
      InvOrMissingParams(res);
      return;
    }
  }
  for (const keyword of req.body.input.keywords) {
    if (typeof keyword != "string") {
      InvOrMissingParams(res);
      return;
    }
  }

  pool.getConnection((err, connection) => {
    if (err) {
      defError(res, err);
      return;
    }

    //create node query
    let node_query =
      "SELECT" +
      " nodes.Date," +
      " nodes.node_id," +
      " nodes.node," +
      " nodes.community," +
      " nodes.graph_id" +
      " FROM nodes" +
      " INNER JOIN node_rating ON" +
      " node_rating.node_id = nodes.node_id AND" +
      " node_rating.Date = nodes.Date";
    let rel_query =
      ";SELECT" +
      " relationships.Date," +
      " relationships.obj1," +
      " relationships.obj2," +
      " relationships.relation," +
      " relationships.rel_id," +
      " relationships.graph_id," +
      " relationships.meta" +
      " FROM relationships" +
      " INNER JOIN rel_rating ON" +
      " rel_rating.Date = relationships.Date AND" +
      " rel_rating.obj1 = relationships.obj1 AND" +
      " rel_rating.obj2 = relationships.obj2 AND" +
      " rel_rating.rel_id = relationships.rel_id";
    //adding constraints

    if (req.body.input.communities != "" || req.body.input.keywords != "") {
      node_query += " WHERE";
      if (req.body.input.communities != "") {
        const communities = req.body.input.communities;

        for (let i = 0; i < communities.length - 1; i++) {
          node_query +=
            " community = " + connection.escape(communities[i]) + " OR";
        }

        node_query +=
          " community = " +
          connection.escape(communities[communities.length - 1]);
      }
      if (req.body.input.keywords != "") {
        rel_query += " WHERE";

	console.log(`keywords: ${req.body.input.keywords}`);

        const keywords = String(req.body.input.keywords).split(";");

	console.log(`split keywords: ${keywords}`);

        if (req.body.input.communities != "") {
          node_query += " OR";
        }

        for (let i = 0; i < keywords.length - 1; i++) {
          node_query +=
            " node LIKE " + connection.escape("%" + keywords[i] + "%") + " OR";
          rel_query +=
            " relation LIKE " +
            connection.escape("%" + keywords[i] + "%") +
            " OR";
        }
        node_query +=
          " node LIKE " +
          connection.escape("%" + keywords[keywords.length - 1] + "%");
        rel_query +=
          " relation LIKE " +
          connection.escape("%" + keywords[keywords.length - 1] + "%");
      }
    }
    //order by the votes
    node_query += "ORDER BY votes DESC";
    rel_query += "ORDER BY votes DESC";
    console.log(node_query.concat(rel_query));
    connection.query(node_query.concat(rel_query), (errQ, result, fields) => {
      connection.release();

      if (errQ) {
        res.json({ Error: errQ.code });
      } else {
        let json_object = {};
        const fields = ["nodes", "links"];
        //nodes
        json_object["nodes"] = [];
        if (result[0] != undefined) {
          for (const tuple of result[0]) {
            console.log(tuple);
            json_object["nodes"].push(tuple);
          }
        }
        //relationships
        json_object["links"] = [];
        if (result[1] != undefined) {
          for (const tuple of result[1]) {
		if(tuple["meta"] != null && tuple["meta"] != "") {
	
		console.log(`unfiltered meta: ${tuple["meta"]}`);

		// let metaString = String(tuple["meta"]).replaceAll("'", "\"");
		let metaString = tuple["meta"];
		metaString = metaString.replaceAll(/[^\u000A\u0020-\u007E]/g, " ");
		
		console.log(`metaString: ${metaString}`);

		let p = JSON5.parse(metaString);
            // var p = JSON.parse(tuple["meta"].replace(/'/g, '"'));
            // temp = tuple["meta"];
		temp = metaString;
            delete tuple["meta"];

            var obj = JSON.parse(JSON.stringify(tuple));
            var keys = Object.keys(p);

            for (var i = 0; i < keys.length; i++) {
              obj[keys[i]] = p[keys[i]];
            }
            json_object["links"].push(obj);
		}
          }
        }
        res.json(json_object);
      }
    });
  });
});

app.post("/api/neighborhood", (req, res) => {
  /*
   * returns subgraph centered at
   * 	with node with id 'id'
   * 	with date on 'date'
   * 	with depth 'depth
   *
   * input:
   * {
   *	id: int, 	//node id, -1 for the entire graph
   *	date: 'date', 	//has to be in the format that is
   *		      	//acceptable for Date.parse()
   *	depth: int	//-1 for the entire connected Component
   * }
   * output:
   * {
   *	nodes: [],
   *	links: []
   * }
   *
   *
   * */

  console.log(req.body);

  //check for presence of required params
  if (
    req.body.input == undefined ||
    req.body.input.id == undefined ||
    req.body.input.date == undefined ||
    req.body.input.depth == undefined
  ) {
    InvOrMissingParams(res);
    return;
  }

  //check for correct types
  let node_date = new Date(req.body.input.date);
  if (
    typeof req.body.input.id != "number" ||
    node_date == "Invalid Date" ||
    typeof req.body.input.depth != "number"
  ) {
    InvOrMissingParams(res);
    return;
  }

  let prev_date = new Date(req.body.input.date);
  prev_date.setDate(prev_date.getDate() - 1);

  pool.getConnection((err, connection) => {
    if (err) {
      defError(res, err);
      return;
    }
    let depth = req.body.input.depth;
    if ((depth = -1)) {
      depth = 100;
    } else if (depth < -1) {
      InvOrMissingParams(res);
      return;
    }
    const id_esc = connection.escape(req.body.input.id);
    const depth_esc = connection.escape(depth);
    const date_esc = connection.escape(node_date);
    const prev_date_esc = connection.escape(prev_date);

    let query;
    let offset;
    if (req.body.input.id == -1) {
      query =
        "SELECT * FROM nodes WHERE" +
        " Date > " +
        prev_date_esc +
        " AND" +
        " Date <= " +
        date_esc +
        ";SELECT * FROM relationships WHERE" +
        " Date > " +
        prev_date_esc +
        " AND" +
        " Date <= " +
        date_esc;
      offset = 0;
    } else {
      query =
        " CREATE TEMPORARY TABLE rel_recurse" + //create temp table, result 0
        " (rel_id INT," +
        " obj1 INT," +
        " obj2 INT," +
        " Date date);";
      query +=
        " SET SESSION cte_max_recursion_depth = " +
        depth_esc +
        ";" + //set max depth
        " INSERT INTO rel_recurse" + //insert the values
        " WITH RECURSIVE CN(rel_id, obj1, obj2, Date) AS" +
        " ((SELECT -1 AS rel_id, " +
        id_esc +
        " AS obj1, " +
        id_esc +
        " AS obj2, " +
        "20200101 AS Date)" +
        " UNION" +
        "(SELECT R.rel_id, R.obj1, R.obj2, R.Date" +
        " FROM relationships R, CN " +
        " WHERE" +
        " (CN.obj1 = R.obj1 OR" +
        " CN.obj2 = R.obj1 OR" +
        " CN.obj1 = R.obj2 OR" +
        " CN.obj2 = R.obj2) AND" +
        " R.Date > " +
        prev_date_esc +
        " AND" +
        " R.Date <= " +
        date_esc +
        " )) SELECT * FROM CN" +
        " ;SELECT DISTINCT node_id, node, community, nodes.Date , nodes.meta FROM nodes" + //obtain nodes
        " INNER JOIN rel_recurse on node_id = obj1 OR node_id = obj2" +
        " WHERE nodes.Date >" +
        prev_date_esc +
        " AND" +
        " nodes.Date <=" +
        date_esc +
        ";" +
        " SELECT " +
        " DISTINCT relationships.Date," +
        " relationships.obj1," +
        " relationships.obj2," +
        " relationships.relation," +
        " relationships.rel_id," +
        " relationships.graph_id," +
        " relationships.meta" +
        " FROM relationships" + //obtain relationships
        " INNER JOIN rel_recurse ON" +
        " rel_recurse.rel_id = relationships.rel_id AND" +
        " rel_recurse.obj1 = relationships.obj1 AND" +
        " rel_recurse.obj2 = relationships.obj2" +
        " WHERE relationships.Date > " +
        prev_date_esc +
        " AND" +
        " relationships.Date <= " +
        date_esc;
      offset = 3;
    }
    console.log(query);
    connection.query(query, (errQ, result, fields) => {
      connection.destroy();

      if (errQ) {
        defError(res, errQ);
        return;
      } else {
        let json_object = {};
        const fields = ["nodes", "links"];

        for (let i = 0; i < 2; i++) {
          if (result[offset + i] != undefined) {
            json_object[fields[i]] = [];
            for (const tuple of result[offset + i]) {
              if (i == 1) {
                //relationships

                let formatted = tuple["meta"].replace("'", "''");

                // Replace strange ascii characters
                formatted = formatted.replace(/[^\u000A\u0020-\u007E]/g, " ");

                var p = JSON.parse(formatted);
                temp = tuple["meta"];
                delete tuple["meta"];

                var obj = JSON.parse(JSON.stringify(tuple));
                var keys = Object.keys(p);

                for (var j = 0; j < keys.length; j++) {
                  obj[keys[j]] = p[keys[j]];
                }
                json_object["links"].push(obj);
              } else {
                json_object[fields[i]].push(tuple);
              }
            }
          }
        }

        console.log(json_object);

        res.json(json_object);
      }
    });
  });
});

app.post("/api/voteNode", (req, res) => {
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
  if (
    req.body.input == undefined ||
    req.body.input.id == undefined ||
    req.body.input.date == undefined ||
    req.body.input.vote == undefined
  ) {
    InvOrMissingParams(res);
    return;
  }

  //check for correct types
  let node_date = new Date(req.body.input.date);
  if (
    typeof req.body.input.id != "number" ||
    node_date == "Invalid Date" ||
    typeof req.body.input.vote != "boolean"
  ) {
    InvOrMissingParams(res);
    return;
  }

  let prev_date = new Date(req.body.input.date);
  prev_date.setDate(prev_date.getDate() - 1);

  pool.getConnection((err, connection) => {
    if (err) {
      defError(res, err);
      return;
    }

    const id_esc = connection.escape(req.body.input.id);
    const date_esc = connection.escape(node_date);
    const prev_date_esc = connection.escape(prev_date);
    let upOrDown = "";
    if (req.body.input.vote == true) {
      upOrDown = "votes = votes + 1";
    } else {
      upOrDown = "votes = votes - 1";
    }
    let query =
      "UPDATE node_rating" +
      " SET " +
      upOrDown +
      " WHERE " +
      " Date > " +
      prev_date_esc +
      " AND" +
      " Date <= " +
      date_esc +
      " AND" +
      " node_id = " +
      id_esc;
    connection.query(query, (errQ, result, fields) => {
      connection.release();

      if (errQ) {
        defError(res, errQ);
        return;
      } else {
        res.sendStatus(200); //send status OK
      }
    });
  });
});

app.post("/api/voteRel", (req, res) => {
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
  if (
    req.body.input == undefined ||
    req.body.input.id == undefined ||
    req.body.input.date == undefined ||
    req.body.input.sourceId == undefined ||
    req.body.input.targetId == undefined ||
    req.body.input.vote == undefined
  ) {
    InvOrMissingParams(res);
    return;
  }

  //check for correct types
  let node_date = new Date(req.body.input.date);
  if (
    typeof req.body.input.id != "number" ||
    node_date == "Invalid Date" ||
    typeof req.body.input.sourceId != "number" ||
    typeof req.body.input.targetId != "number" ||
    typeof req.body.input.vote != "boolean"
  ) {
    InvOrMissingParams(res);
    return;
  }

  let prev_date = new Date(req.body.input.date);
  prev_date.setDate(prev_date.getDate() - 1);

  pool.getConnection((err, connection) => {
    if (err) {
      defError(res, err);
      return;
    }

    const id_esc = connection.escape(req.body.input.id);
    const date_esc = connection.escape(node_date);
    const prev_date_esc = connection.escape(prev_date);
    const sourceId_esc = connection.escape(req.body.input.sourceId);
    const targetId_esc = connection.escape(req.body.input.targetId);

    let upOrDown = "";
    if (req.body.input.vote == true) {
      upOrDown = "votes = votes + 1";
    } else {
      upOrDown = "votes = votes - 1";
    }
    let query =
      "UPDATE rel_rating" +
      " SET " +
      upOrDown +
      " WHERE" +
      " Date > " +
      prev_date_esc +
      " AND" +
      " Date <= " +
      date_esc +
      " AND" +
      " obj1 = " +
      sourceId_esc +
      " AND" +
      " obj2 = " +
      targetId_esc +
      " AND" +
      " rel_id = " +
      id_esc;
    connection.query(query, (errQ, result, fields) => {
      connection.release();

      if (errQ) {
        defError(res, errQ);
        return;
      } else {
        res.sendStatus(200); //send status OK
      }
    });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const server = app.listen(port, () =>
  console.log(`Listening at http://localhost:${port}`)
);

process.on("SIGINT", () => {
  console.log("Closing Pool.");
  pool.end((err) => {
    if (err) {
      console.log(err);
    }
    console.log("Pool Closed.");
  });
  console.log("Closing Server.");
  server.close((err) => {
    if (err) {
      console.log(err);
    }
    console.log("Server Closed.");
  });
  process.exitCode = 0;
});

/*
CREATE TEMPORARY TABLE rel_recurse (rel_id INT, obj1 INT, obj2 INT, Date date); SET SESSION cte_max_recursion_depth = 100; INSERT INTO rel_recurse WITH RECURSIVE CN(rel_id, obj1, obj2, Date) AS ((SELECT -1 AS rel_id, 1 AS obj1, 1 AS obj2, 20200101 AS Date) UNION(SELECT R.rel_id, R.obj1, R.obj2, R.Date FROM relationships R, CN  WHERE (CN.obj1 = R.obj1 OR CN.obj2 = R.obj1 OR CN.obj1 = R.obj2 OR CN.obj2 = R.obj2) AND R.Date > '2021-10-23 00:00:00.000' AND R.Date <= '2021-10-24 00:00:00.000' )) SELECT * FROM CN ;SELECT DISTINCT node_id, node, community, nodes.Date , nodes.meta FROM nodes INNER JOIN rel_recurse on node_id = obj1 OR node_id = obj2 WHERE nodes.Date >'2021-10-23 00:00:00.000' AND nodes.Date <='2021-10-24 00:00:00.000'; SELECT  DISTINCT relationships.Date, relationships.obj1, relationships.obj2, relationships.relation, relationships.rel_id, relationships.graph_id, relationships.meta FROM relationships INNER JOIN rel_recurse ON rel_recurse.rel_id = relationships.rel_id AND rel_recurse.obj1 = relationships.obj1 AND rel_recurse.obj2 = relationships.obj2 WHERE relationships.Date > '2021-10-23 00:00:00.000' AND relationships.Date <= '2021-10-24 00:00:00.000'
*/
