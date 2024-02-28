const express = require('express');
const cors = require('cors');

const app = express ();

app.use(express.json());
app.use(cors());

const PORT = 8083;

let commands;

app.get('/commands', (req, res) =>{
    res.send(commands);
});

app.post('/command_input', (req, res) => {

    console.log("req: x: \n", req.body);
    //console.log("command_input: res: ", res);
    console.log("command_input    xxx");

    commands = req.body;

    res.send('Post requested');
});

app.listen(PORT, () => {
    console.log(`Server Listening on PORT:" + ${PORT}`);
});