//const express = require('express');
import express from 'express';

//const cors = require('cors');
import cors from 'cors';

//const fs = require('fs');
import fs from 'fs';

//const bodyParser = require('body-parser');
import bodyParser from 'body-parser';

//const crypto = require('crypto');
import crypto from 'crypto';

//const path = require('path');
import path from 'path';

//const puppeteer = require('puppeteer'); //lib puppeteer semelhante aos sintéticos para tirar prints
import puppeteer from 'puppeteer';

//const database_dir = './data/json/database.json';
//let database = require(database_dir);

import database from "./data/json/reportsbase.json" assert { type: "json" };

//const UpdateDOM = require('./data/js/DOM_updater.mjs'); //importando arquivo js 'DOM_updater.js'
import UpdateDOM from './data/js/DOM_updater.mjs';

//const MakeReportObjects = require('./data/js/ReportMaker'); //importando arquivo js 'ReportMaker.js'
import MakeReportObjects from './data/js/ReportMaker.mjs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('reports/brk')); //rota que serve os arquivos estaticos no caso a imagem do report

const PORT = 8083;

let to_html_commands = 'Esperando comando';

function generateToken(length) {
    const randomBytes = crypto.randomBytes(length);
    return randomBytes.toString('hex');
}

function getCurrentDateTime() {
    const currentDate = new Date();

    const year = String(currentDate.getFullYear()).slice(-2);
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${day}_${month}_${year}_${hours}_${minutes}`;
    return formattedDateTime;
}

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

async function saveImage(img_name) {

    const report_img_dir = `./reports/brk/${img_name}`; //diretorio da imagem do report

    console.log("passo 3.5 report_img_dir: ", report_img_dir, " | img_name: ", img_name);

    try {
    
        console.log("passo 3.6 [Puppeteer] tirando screenshot da pagina");

        const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser' });

        //const browser = await puppeteer.launch();
        
        console.log("passo 3.7 acessando page.goto('ip')");
        const page = await browser.newPage();

        await page.goto('http://localhost:8083');

        // Obtenha as dimensões da página atual usando o page.evaluate()
        const dimensions = await page.evaluate(() => {
            const backgroundDiv = document.querySelector('.div_global');
            return {
                width: backgroundDiv.offsetWidth,
                height: backgroundDiv.offsetHeight,
            };
        });

        // Configurando a resolução da viewport
        await page.setViewport({
            width: dimensions.width, // largura desejada
            height: dimensions.height, // altura desejada
            deviceScaleFactor: 1,
        });

        console.log("dimensions: ", dimensions);

        // Defina a viewport para corresponder ao tamanho da página original
        //await page.setViewport(dimensions);

        if(!fs.existsSync(report_img_dir)) {
            await page.screenshot({ path: report_img_dir });
            console.log("passo 3.8 nova imagem salva em: ", report_img_dir);
        }
        else{
            console.log("passo 3.8.else imagem já existe no diretório, substituindo em: ", report_img_dir);
            await page.screenshot({ path: report_img_dir });
        }
        await browser.close();
    }
    catch (error) {
        console.error('passo 3.9 Ocorreu um erro:', error);
    }
};

function insertNewCommand(data){
    try{
        console.log("Inserindo novo comando:");

        const titulo = data['titulo'];
        const descricao = data['descricao'];
        const sistema = data['sistema'];
        const arg = data['arg'];

        console.log("Adicionando novo comando ao database: ", sistema + '[' + arg + ']', "titulo: ", titulo, "descricao: ", descricao);

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

    console.log("[CommandReader] passo 1.0 comando recebido: ", command);

    //command = "/checklist report brk unidade{172.128.5.4,112.122.10.2}[nossh] vmware{10.156.4.1,132.98.10.2}[noui,nologin,retorno:'Reportado ao Jere no grupo tal']";

    let dataReturn = {}, matchesGeral;

    const rgx_separate_commands = /(?:report\s)?(\w+)\s((?:[\w\{\}\.\,]+\[[\w,"':\s]+\]\s?)+)/g;
    
    //iterar sobre o comando "empresa" "comando1" "comando2"...
    while ((matchesGeral = rgx_separate_commands.exec(command)) !== null) {

        console.log("[CommandReader] passo 1.1 while ((matchesGeral: ", matchesGeral);

        let Empresa = matchesGeral[1];
        console.log("[CommandReader] passo 1.2 Empresa recebida no comando: ", Empresa);

        let commands = matchesGeral[2].match(/[\w\{\}\.\,]+\[[^\]]+\]/g); // dividir os comandos

        console.log("[CommandReader] passo 1.3 let commands", commands);

        //iterar sobre cada item que foi separado na regex "brk" "comando1" "comando2"...
        commands.forEach((separated_command) => {

            console.log("[CommandReader] passo 1.4 Comando separado: ", separated_command);

            const rgx_pick_ip = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
            const command_ips = separated_command.match(rgx_pick_ip);
            console.log("[CommandReader] passo 1.5 command_ips: ", command_ips);

            const rgx_separate_args = /(\w+)?\[((?:[\w+'"\s:]\,?)+)\]/g;

            //apos já ter pegado ips do comando remover eles
            if(command_ips) separated_command = separated_command.replace(/\{[^}]+\}/,''), console.log("[CommandReader] passo 1.0.6 pos-replace-separated_command: ", separated_command);

            //iterar sobre 'sistema' 'arg'
            let commandsGeral, Sistema, Argumentos;

            //salvar Sistema e Argumentos nas variáveis
            if ((commandsGeral = rgx_separate_args.exec(separated_command)) !== null) {

                console.log("[CommandReader] passo 1.7 if ((commandsGeral: ", commandsGeral);
                
                commandsGeral.forEach((args, i) => {
                    if(i == 1) Sistema = args;
                    if(i == 2) Argumentos = args;
                }); console.log("[CommandReader] passo 1.8 Sistema: " + Sistema + " | Argumentos: " + Argumentos);

                let commandData = {
                    "titulo": '',
                    "descricao": '',
                    "retorno": '',
                    "ips": command_ips
                };

                const rgx_sep_args = /((?:[\w'":\s])+)\,?/g;
                let separatedArgs;
                while(separatedArgs = rgx_sep_args.exec(Argumentos)){

                    console.log("[CommandReader] passo 1.9 while(separatedArgs: ", separatedArgs);

                    const Arg = separatedArgs[1];
                    console.log("[CommandReader] passo 1.10 Arg: ", Arg);

                    const rgx_retorno = /(?:retorno|ret):\W(.+)\W/g;

                    let Titulo, Descricao, Retorno;
                    
                    if(Retorno = rgx_retorno.exec(Arg)){
                        console.log("[CommandReader] passo 1.11 retorno encontrado: ", Retorno[1]);
                        commandData["retorno"] = Retorno[1];
                    }
                    else {

                        Titulo = database[Empresa][Sistema]["Args"][Arg]["titulo"];
                        Descricao = database[Empresa][Sistema]["Args"][Arg]["descricao"];

                        console.log("[CommandReader] passo 1.12 Titulo: " + Titulo + " | Descricao: " + Descricao);

                        commandData["titulo"] = Titulo;
                        commandData["descricao"] = Descricao;
                    }

                    console.log("[CommandReader] passo 1.13 commandData sendo adicionado: ", commandData);

                    dataReturn[Sistema] = commandData;
            
                }

            }
            
        });

    }

    //console.log('dataReturn: ', dataReturn);

    //dataReturn[Empresa] = Sys;


    //         let nome_sistema = match.match(/(.+)\[/)[1];
    //         console.log("passo 1.1.3 nome_sistema: ", nome_sistema);

    //         //salvar match em sistema_args 'msaf[args]'
    //         let sistema_args = match;
    //         console.log("passo 1.2: sistema_args:", sistema_args);

    //         //salvar o ip/hostname identificador caso exista no comando vmware'ip/hostname'[args]
    //         let identifier = sistema_args.match(/(vmware|unidade)([^\s\[]+)/);

    //         //caso exista um identificador, trocamos o ip/hostname para '#identifier#' pois já salvamos 'ip/hostname em' 'let identifier'
    //         if(identifier) {
    //             sistema_args = sistema_args.replace(identifier[2], '#identifier#');
    //             console.log("passo 1.2.1 command identifier[1]: ", identifier[1], " | identifier[2]: ", identifier[2]);
    //             console.log("passo 1.2.2 sistema_args: ", sistema_args);
    //         }
    //         else {
    //             identifier = null;
    //             console.log("passo 1.2.else problema nao possui identificador. setando 'null'");
    //         }

    //         //variavel que salva o sistema, conteudo passado antes dos colchetes 'msaf'[...]
    //         let system = sistema_args.match(/^([A-Za-z-0-9#]+)\[/)[1];
    //         console.log("passo 1.2.3 system = sistema_args.match:", system);

    //         //Extraindo o tipo de comando e o argumento de cada correspondência começando por '['
    //         parts = sistema_args.split("[");
    //         console.log("passo 1.2.4 parts = sistema_args: ", parts);

    //         //Remove o colchete de fechamento "]" // argumentos tem os conteudos dentro dos colchetes sistema['conteudo1,conteudo2...']
    //         let argumentos = parts[1].slice(0, -1);
    //         console.log("passo 1.2.5 let argumentos: ", argumentos);

    //         //separar os argumentos passados nos colchetes com regex ['']
    //         args = argumentos.match(/([^\]]+)/).input.split(',').map(arg => arg.trim());
    //         console.log("passo 1.2.6 args: ", args);

    //         args.forEach(function (problema_recebido){

    //             console.log("passo 1.3.0 [forEach] problema_recebido: ", problema_recebido);

    //             //vetor que vai salvar o problema atual 'titulo' - 'descricao problema'
    //             let titulo_desc;

    //             //buscar o problema recebido no comando na lista de problemas
    //             if(system + "_" + problema_recebido in database["banco_problemas"]){

    //                 console.log('passo 1.3.1 entrando no if find system_problema in banco_problemas');

    //                 nome_sistema = system;
    //                 let ip_or_host = null;
    //                 let titulo = database["banco_problemas"][system + "_" + problema_recebido][0];
    //                 let descricao = database["banco_problemas"][system + "_" + problema_recebido][1];

    //                 if(identifier != null){
    //                     ip_or_host = identifier[2];
    //                     titulo = titulo.replace('#vmware#', identifier[2]);
    //                     titulo = titulo.replace('#ip#', "192.168.0.4");
    //                     titulo = titulo.replace('#region#', "IGAOOESTEMAIS");
    //                     descricao = descricao.replace('#vmware#', identifier[2]);
    //                     descricao = descricao.replace('#ip#', "192.168.0.4");
    //                     descricao = descricao.replace('#region#', "IGAOOESTEMAIS");
    //                 }
    //                 else {
    //                     nome_sistema = system;
    //                 }

    //                 console.log("passo 1.3.2 nome_sistema: ", nome_sistema);

    //                 //commands[system]["titulo_desc"] = titulo_desc; //adicionando titulo e descrição ao objeto
    //                 titulo_desc = {
    //                     titulo: titulo,
    //                     descricao: descricao,
    //                     arg: problema_recebido,
    //                     identifier: ip_or_host
    //                 };
    //             }

    //             commands.push(titulo_desc);
    //             console.log("passo 1.4 commands after push: ", commands);

    //         });

    //         //commands[nome_sistema]["args"] = args;

    //     });

    //     console.log("passo 1.5 retornando commands: ", commands);

    //     return {commands: commands};
    // }

    return dataReturn;

    //process.exit(0)

}

app.get('/commands', (req, res) => {
    res.send(to_html_commands);
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/checklist', async (req, res) => {

    try{

        console.log("passo 1, entrou no /checklist");

        if (req.body.token !== 'u5s3ewim5t8i5g7wc8urd8zhjo') return res.status(403).send('Mattermost Token inválido');

        //const response = `Bom dia segue o report: '${req.body.command}'`;
        to_html_commands = CommandReader(req.body.command + " " + req.body.text);

        const actual_datehours = getCurrentDateTime();
        const command_token = generateToken(5);

        console.log("actual_datehours: ", actual_datehours);
        console.log("command_token: ", command_token);

        /*
        console.log("passo 2 apagando arquivo anterior");
        // deletar diretorio para depois escrever novamente
        if (fs.existsSync(report_img_dir)) {
            await fs.promises.unlink(report_img_dir);
            console.log("diretorio " + report_img_dir + " apagado com sucesso.");
        }
        else {
            console.log("Imagem não existe no diretório " + report_img_dir + " não foi necessário apaga-la");
        }
        */

        console.log("passo 3.0, antes de chamar UpdateDOM();");

        await UpdateDOM();
        console.log("passo 3.4, passou do UpdateDOM(); antes de chamar await saveImage();");

        const image_name = `report_brk_${actual_datehours}_${command_token}.png`;

        await saveImage(image_name);
        console.log("passo 4.0, passou do await saveImage();");

        //const imageBuffer = fs.readFileSync(__dirname + '/reports/brk/report_brk.png');

        //const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        console.log("passo 4.1 final, enviando res.json({})");
        
        const fileServerPathUrl = `http://192.168.0.4:8083/reports/brk/${image_name}`;
        
        res.json({
            response_type: 'in_channel',
            text: fileServerPathUrl
        });
    }
    catch (error){
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

// Chame MakeReportObjects para obter os grupos de Unidades e VMWares
//let xx = MakeReportObjects();

//console.log("MakedReportObjects", xx);

//to_html_commands = CommandReader('/checklist report brk unidade{172.128.5.4,112.122.10.2}[nossh] vmware{10.156.4.1,132.98.10.2}[noui,nologin,retorno:\'Reportado ao Jere no grupo tal\']');

//process.exit(0);

app.listen(PORT, () => {
    console.log(`AZ-Reporter iniciado na porta: ${PORT}`);
});

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

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

// app.post('/save-image', (req, res) => {
//     const data = req.body;
//     const imageDate = Object.keys(data)[0];
//     const imageBase64 = data[imageDate]["image"];

    
//     saveImage(imageBase64, `./reports/brk/report_brk.png`);

//     console.log("Imagem salva!");

//     res.sendStatus(200);
// });