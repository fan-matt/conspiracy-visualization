const axios = require('axios');

axios.post('http://localhost:5000/api/query/connectedWithDepth', {
	nodeID: '1',
	depth: '9',
	date: '2020-01-01T08:00:00.000Z'
})
.then(res =>{
	console.log("---------------------------Response----------------------")
	console.log(res.data);
})
.catch(error=>{

	console.log("----------------------------Error-------------------------")
	console.error(error);
});
