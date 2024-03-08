const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const database = require('./data/json/database.json');
const path = require('path');
const puppeteer = require('puppeteer');
const UpdateDOM = require('./data/js/DOM_updater');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('reports/brk')); 

const PORT = 8083;

let to_html_commands = 'Esperando comando';
const report_img_dir = './reports/brk/report_brk.png';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function saveImage() {
  try {
    console.log("[Puppeteer] tirando screenshot da pagina");

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8083'); // URL do seu servidor local
    await sleep(3000);

    // let imageExists = false;
    // while(!imageExists){
    //     if(fs.existsSync(report_img_dir)){
    //         imageExists = true;
    //     }
    //     else{
    //         console.log("[Puppeteer] Aguardando carregamento da imagem para realizar a screenshot...");
    //         await sleep(1000);
    //     }
    // }

    await page.screenshot({ path: report_img_dir });
    console.log("screenshot salva em: ", report_img_dir);
    await browser.close();
  }
  catch (error) {
    console.error('Ocorreu um erro:', error);
  }
};

/*
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
*/

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

// app.post('/save-image', (req, res) => {
//     const data = req.body;
//     const imageDate = Object.keys(data)[0];
//     const imageBase64 = data[imageDate]["image"];

    
//     saveImage(imageBase64, `./reports/brk/report_brk.png`);

//     console.log("Imagem salva!");

//     res.sendStatus(200);
// });

app.get('/commands', (req, res) => {
    res.send(to_html_commands);
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/checklist', (req, res) => {

    if (req.body.token !== 'u5s3ewim5t8i5g7wc8urd8zhjo') {
        return res.status(403).send('Token inválido');
    }

    const response = `Aqui está o checklist: '${req.body.command}'`;
    to_html_commands = CommandReader(req.body.command + " " + req.body.text);

    //deletar diretorio para depois escrever novamente
    fs.unlink(report_img_dir,(err) =>{
        if(err){ console.error('Erro ao deletar o arquivo:', err); return; }
        console.log("diretorio " + report_img_dir + " apagado com sucesso.");
    });

    UpdateDOM();
    saveImage();

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

// Servindo o arquivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`AZ-Reporter iniciado na porta: ${PORT}`);
});