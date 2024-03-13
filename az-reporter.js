const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');

const database_dir = './data/json/database.json';

let database = require(database_dir);
const path = require('path');
const puppeteer = require('puppeteer'); //lib puppeteer semelhante aos sintéticos para tirar prints

const UpdateDOM = require('./data/js/DOM_updater'); //importando arquivo js 'DOM_updater.js'

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('reports/brk')); //rota que serve os arquivos estaticos no caso a imagem do report

const PORT = 8083;

let to_html_commands = 'Esperando comando';
const report_img_dir = './reports/brk/report_brk.png'; //diretorio da imagem do report

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

async function saveImage() {
  try {
    console.log("passo 3.5 [Puppeteer] tirando screenshot da pagina");

    const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser' });

    //const browser = await puppeteer.launch();
    
    console.log("passo 3.6 acessando page.goto('ip')");
    const page = await browser.newPage();
    await page.goto('http://localhost:8083');
    //await sleep(3000);
    if(!fs.existsSync(report_img_dir)) {
        await page.screenshot({ path: report_img_dir });
        console.log("passo 3.7 screenshot salva em: ", report_img_dir);
    }
    else{
        console.log("passo 3.7 imagem já existe no diretório, pulando screenshot");
    }
    await browser.close();
  }
  catch (error) {
    console.error('passo 3.7 Ocorreu um erro:', error);
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

function insertNewCommand(data){

    try{

        const titulo = data['titulo'];
        const descricao = data['descricao'];
        const sistema = data['sistema'];
        const arg = data['arg'];

        console.log("Adicionando novo comando ao database: ", sistema + '[' + arg + ']');

        database.banco_problemas[sistema + "_" + arg] = [titulo, descricao];

        const jsonDatabase = JSON.stringify(database, null, 2);

        fs.writeFileSync(database_dir, jsonDatabase);

        console.log("Comando adicionado com sucesso ao database!");
    }
    catch(error){
        console.log("Erro ao adicionar o comando: ", error);
    }

}

function CommandReader(command){

    //command = "/checklist report cartoes[nocollected] msaf[httpversion] ordens[timepass]";
    //command = "/checklist report vmwareSRVHVM004RMR[noui]";

    console.log("comando recebido: ", command);

    let identifier = command.match(/(?:vmware|unidade)(.+)\[/);

    if(identifier) {
        console.log("command identifier:", identifier[1]);
        const OriginalCommand = command.replace(identifier[1], '#ip#');
        console.log("comando depois:", OriginalCommand);
        command = OriginalCommand;
    }
    else {
        identifier = null;
    }

    //regex para separar os itens dos comandos
    const rgx_command = /([A-Za-z-0-9#]+)\[([^\]]+)\]/g;
    let command_matches = command.match(rgx_command);

    console.log("passo 1.1 command_matches: ", command_matches);

    //verificar se existe ocorrencia da regex no comando e não 'null'
    if(command_matches){
        
        let parts, args, commands = {};

        //iterar sobre cada ocorrencia no comando
        command_matches.forEach(function(match){

            console.log("passo 1.2: match:", match);

            //variavel que salva o sistema, conteudo passado antes dos colchetes 'msaf'[...]
            let system = match.match(/^([A-Za-z-0-9#]+)\[/)[1];

            commands[system] = {
                titulo_desc: [],
                identifier: (identifier != null) ? identifier[1] : "",
                args: []
            }

            //Extraindo o tipo de comando e o argumento de cada correspondência
            parts = match.split("[");

            //Remove o colchete de fechamento "]" // argumentos tem os conteudos dentro dos colchetes sistema['conteudo1,conteudo2...']
            let argumentos = parts[1].slice(0, -1);

            //regex para separar os argumentos passados nos colchetes ['']
            const regex_argumentos = /([^\]]+)/;

            args = argumentos.match(regex_argumentos).input.split(',').map(arg => arg.trim());

            console.log("passo 1.3 args: ", args);

            args.forEach(function (problema_recebido){

                //vetor que vai salvar o problema atual 'titulo' - 'descricao problema'
                let titulo_desc = [];

                //buscar o problema recebido no comando na lista de problemas
                if(system + "_" + problema_recebido in database["banco_problemas"]){

                    let titulo = database["banco_problemas"][system + "_" + problema_recebido][0];
                    let descricao = database["banco_problemas"][system + "_" + problema_recebido][1];

                    if(identifier != null){
                        titulo = titulo.replace('#vmware#', identifier[1]);
                        titulo = titulo.replace('#ip#', "192.168.0.4");
                        titulo = titulo.replace('#region#', "IGAOOESTEMAIS");
                        descricao = descricao.replace('#vmware#', identifier[1]);
                        descricao = descricao.replace('#ip#', "192.168.0.4");
                        descricao = descricao.replace('#region#', "IGAOOESTEMAIS");
                    }

                    titulo_desc.push(titulo); //titulo
                    titulo_desc.push(descricao); //descricao

                    commands[system]["titulo_desc"] = titulo_desc; //adicionando titulo e descrição ao objeto
                    //commands[system]["titulo_desc"].push(titulo_desc);
                }

            });

            commands[system]["args"] = args;

        });

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

app.post('/checklist', async (req, res) => {

    console.log("passo 1, entrou no /checklist");

    if (req.body.token !== 'u5s3ewim5t8i5g7wc8urd8zhjo') {
        return res.status(403).send('Token inválido');
    }

    const response = `Bom dia segue o report: '${req.body.command}'`;
    to_html_commands = CommandReader(req.body.command + " " + req.body.text);

    console.log("passo 2 apagando arquivo anterior");

    try{
        // deletar diretorio para depois escrever novamente
        if (fs.existsSync(report_img_dir)) {
            await fs.promises.unlink(report_img_dir);
            console.log("diretorio " + report_img_dir + " apagado com sucesso.");
        }
        else {
            console.log("Imagem não existe no diretório " + report_img_dir + " não foi necessário apaga-la");
        }

        console.log("passo 3.0, antes de chamar UpdateDOM();");

        await UpdateDOM();
        console.log("passo 3.4, passou do UpdateDOM(); antes de chamar await saveImage();");
        await saveImage();
        console.log("passo 4.0, passou do await saveImage();");

        const imageBuffer = fs.readFileSync(__dirname + '/reports/brk/report_brk.png');

        const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        console.log("passo final, enviando res.json({})");

        res.json({
            response_type: 'in_channel',
            text: response,
            attachments: [{
                image_url: `data:image/png;base64,${imageBase64}`,
                text: 'Aqui está o resumo em forma de imagem'
            }]
        });
    }
    catch{
        console.error('Ocorreu um erro:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Servindo o arquivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/newcommand', (req, res) =>{
    try {
        console.log("Novo comando recebido: ", req.body);
        insertNewCommand(req.body);

        res.send(200);
    }
    catch(error){
        console.log("Error: ", error);
        res.send(500);
    }
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`AZ-Reporter iniciado na porta: ${PORT}`);
});