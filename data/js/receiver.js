const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const database = require('./../json/database.json');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('reports/brk')); 

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

function CommandReader(command){

    //command = "/checklist report cartoes[nocol] msaf[httpversion] ordens[timepass]";

    //regex para separar os itens dos comandos
    const rgx_command = /(\w+)\[([^\]]+)\]/g;
    let command_matches = command.match(rgx_command);

    //verificar se existe ocorrencia da regex no comando e não 'null'
    if(command_matches){
        
        let parts, args, commands = {};

        //iterar sobre cada ocorrencia no comando
        command_matches.forEach(function(match){

            //variavel que salva o sistema, conteudo passado antes dos colchetes 'msaf'[...]
            let system = match.match(/^(\w+)\[/)[1];

            commands[system] = {
                titulo_desc: [],
                args: []
            }

            //Extraindo o tipo de comando e o argumento de cada correspondência
            parts = match.split("[");

            //Remove o colchete de fechamento "]" // argumentos tem os conteudos dentro dos colchetes sistema['conteudo1,conteudo2...']
            let argumentos = parts[1].slice(0, -1);

            //regex para separar os argumentos passados nos colchetes ['']
            const regex_argumentos = /([^\]]+)/;

            args = argumentos.match(regex_argumentos).input.split(',').map(arg => arg.trim());

            args.forEach(function (problema_recebido){

                //vetor que vai salvar o problema atual 'titulo' - 'descricao problema'
                let titulo_desc = [];

                //buscar o problema recebido no comando na lista de problemas
                if(system + "_" + problema_recebido in database["banco_problemas"]){

                    titulo_desc.push(database["banco_problemas"][system + "_" + problema_recebido][0]); //titulo
                    titulo_desc.push(database["banco_problemas"][system + "_" + problema_recebido][1]); //descricao

                    commands[system]["titulo_desc"] = titulo_desc; //adicionando titulo e descrição ao objeto

                }

            });

            commands[system]["args"] = args;

        });

        //console.log("\nCommands: ", commands);

        return {commands: commands};
    }

}

app.post('/save-image', (req, res) => {
    const data = req.body;
    const imageDate = Object.keys(data)[0];
    const imageBase64 = data[imageDate]["image"];

    saveImage(imageBase64, `./reports/brk/report_brk_${imageDate}.png`);

    console.log("Imagem salva!");

    res.sendStatus(200);
});

app.get('/commands', (req, res) => {
    res.send(to_html_commands);
});

let lastCommand;

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/checklist', (req, res) => {
    if (req.body.token !== 'i1r4zxb367n6tcyx8jsodkkmbr') {
        return res.status(403).send('Token inválido');
    }

    const response = `Aqui está o checklist: '${req.body.command}'`;
    lastCommand = req.body.command + " " + req.body.text;
    to_html_commands = CommandReader(lastCommand);

    const imageBuffer = fs.readFileSync(__dirname + '/reports/brk/report_brk.png');

    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    res.json({
        response_type: 'in_channel',
        text: response,
        attachments: [{
            image_url: `data:image/png;base64,${imageBase64}`,
            text: 'Aqui está o resumo em forma de imagem'
        }]
    });
});

app.listen(PORT, () => {
    console.log(`AZ-Reporter iniciado na porta: ${PORT}`);
});