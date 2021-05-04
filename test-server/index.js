const axios = require('axios');

axios.post('http://localhost:5000/api/findObject', {
	input:{
		communities: [1],
		keywords: ['1']
	}
})
.then(res =>{
	console.log("---------------------------Response----------------------")
	console.log(res.data);
})
.catch(error=>{

	console.log("----------------------------Error-------------------------")
	console.error(error);
});

/*
const noOp =  new Promise((resolve,reject)=>{
	axios.post('http://localhost:5000/api/update/nodeRating', {
		date: '2020-01-01T08:00:00.000Z',	
		nodeID: '1',
		upDown: 'noOp'
	})
	.then(res =>{
		console.log("resolve1");
		resolve(res.data.thumbs);
	})
	.catch(error=>{
		reject(error);
	});
});
const increment = new Promise((resolve,reject)=>{
	axios.post('http://localhost:5000/api/update/nodeRating', {
		date: '2020-01-01T08:00:00.000Z',	
		nodeID: '1',
		upDown: '1'
	})
	.then(res =>{
		console.log("resolve2");
		resolve(res.data.thumbs);
	})
	.catch(error=>{
		reject(error);
	});
});
const decrement =  new Promise((resolve,reject)=>{
	axios.post('http://localhost:5000/api/update/nodeRating', {
		date: '2020-01-01T08:00:00.000Z',	
		nodeID: '1',
		upDown: '0'
	})
	.then(res =>{
		console.log("resolve3");
		resolve(res.data.thumbs);
	})
	.catch(error=>{
		reject(error);
	});
});

Promise.all([noOp,increment,decrement])
.then(([res1,res2,res3])=>{
	console.log("res1 " + res1);
	console.log("res2 " + res2);
	console.log("res3 " + res3);
	console.log((res1 == res3));
})
.catch(([err1,err2,err3])=>{
	if(err1){
		console.log("------------------------------------------------------test1")
		//console.log(err1);
	}if(err2){
		console.log("------------------------------------------------------test2")
		//console.log(err2);
	}
	if(err3){		
		console.log("------------------------------------------------------test3")
		//console.log(err3);
	}
});

*/
