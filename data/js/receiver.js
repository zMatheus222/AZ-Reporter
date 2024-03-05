const express = require('express');
const cors = require('cors');
const fs = require('fs');
const http = require('http');

const app = express ();

app.use(express.json());
app.use(cors());

const PORT = 8083;

// Função para salvar a imagem em disco
function saveImage(base64Data, fileName) {

    console.log("entered on saveImage\n");

    // Remove o prefixo "data:image/png;base64,"
    const base64Image = base64Data.split(';base64,').pop();

    // Cria um buffer a partir dos dados base64
    const buffer = Buffer.from(base64Image, 'base64');

    // Salva o buffer como um arquivo .png
    fs.writeFile(fileName, buffer, (err) => {
        if (err) {
            console.error('Erro ao salvar a imagem:', err);
        } else {
            console.log(`Imagem salva como ${fileName}`);
        }
    });

}

//função que recebe a imagem
app.post('/save-image', (req, res) =>{

    const data = req.body;

    const imageDate = Object.keys(data);
    const imageBase64 = data[imageDate]["image"];

    //console.log("called /save-image endpoint, req: ", data[imageDate]["image"]);

    //console.log("item_name......: ", item_name);
    //console.log("actual_img_data: ", actual_img_data);
    
    saveImage(imageBase64, "./reports/brk/report_brk_" + imageDate + ".png");
    sendToMattermost("mensagem com imagem", imageBase64);

    console.log("ended!");

});

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