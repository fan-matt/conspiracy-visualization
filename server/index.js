const express = require('express');
const path = require('path')
const app = express();
const port  = 5000;

app.use(express.static(path.join(__dirname , 'build')));

app.get('/api/helloworld' , (req , res) => {
    res.send('Hello from the Express Server!');
});


app.get('/api/test/:id' , (req , res) => {
    res.send(`Request for id ${req.params.id}`);
});


app.get('/' , (req , res) => {
    res.sendFile(path.join(__dirname , 'build' , 'index.html'));
});

app.listen(port , () => console.log(`Listening at http://localhost:${port}`));