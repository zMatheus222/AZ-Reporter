//const { JSDOM } = require('jsdom');
import { JSDOM } from 'jsdom';

import database from "./../json/reportsbase.json" assert { type: "json" };

//const fs = require('fs');
import fs from 'fs';

//const MakeReportObjects = require('./data/js/ReportMaker'); //importando arquivo js 'ReportMaker.js'
import MakeReportObjects from './../js/ReportMaker.mjs';

// Chame MakeReportObjects para obter os grupos de Unidades e VMWares
var AllGroups = await MakeReportObjects();
console.log('\n\nteste 1:\n', AllGroups["brk"]["unidade"], "\n\n");

async function UpdateDOM() {

  console.log("[DOMUpdater] passo 1.0 entered on UpdateDOM function");

  return new Promise((resolve, reject) => {

    // Importando o node-fetch de forma compatível com CommonJS e módulos ES
    import('node-fetch').then(({ default: fetch }) => {

      console.log("[DOMUpdater] passo 1.1 importando 'node-fetch'");

      fetch('http://localhost:8083/commands').then(response => response.json()).then(data => {

          function createReportContainer(Titulo, Descricao, Retorno, ip){

             //<div class="container">
             const div_container = document.createElement('div');
             div_container.classList.add('container');
 
             //<img class="info" src="./data/img/gotall.png" alt="" style="height: 30px; position: absolute; margin-top: 40px; margin-left: 18px;">
             const img_gota = document.createElement('img');
             img_gota.classList.add('info');
             img_gota.src = './data/img/gota.png';
             img_gota.style.height = '30px';
             img_gota.style.position = 'absolute';
             img_gota.style.marginTop = '40px';
             img_gota.style.marginLeft = '18px';
 
             //<h2 class="info" id="problema">A VMWare (SRVHVM001PDL ip: 10.156.180.11) sem trazer métricas e com acesso muito lento no /ui.</h2>
             const h2_title = document.createElement('h2');
             h2_title.classList.add('info');
             h2_title.id = 'problema';
             h2_title.textContent = Titulo;
 
             //<p class="info" id="reportado">Reportado ao Marcos Paulo no grupo Observability - Monitoramento Esxi VMware.</p> 
             const p_desc = document.createElement('p');
             p_desc.classList.add('info');
             p_desc.id = 'reportado';
             p_desc.textContent = Descricao;
 
             //<h5 class="info" id="status">Status Retorno: Manutenção local da Unidade.</h5>
             const h5_return = document.createElement('h5');
             h5_return.classList.add('info');
             h5_return.id = 'status';
             h5_return.textContent = Retorno;
 
             div_container.appendChild(img_gota);
             div_container.appendChild(h2_title);
             div_container.appendChild(p_desc);
             div_container.appendChild(h5_return);
 
             main_container.appendChild(div_container);
          }

          console.log("[UpdateDOM] passo 1.2 entered on fetch /commands | data: ", data);

          const html_content = fs.readFileSync('./base_index.html', 'utf8');

          const dom = new JSDOM(html_content);
          const document = dom.window.document;

          //<div class="div_global">
          const div_global = document.getElementById('div_global');

          //<div id="main_container"></div>
          const main_container = document.createElement('div');
          main_container.id = 'main_container';
          
          //<div class='main_title'>
          const div_main_title = document.createElement('div');
          div_main_title.classList.add('main_title');

          //<h1 class="title">
          const h1_title = document.createElement('h1');
          h1_title.classList.add('title');

          //<div>
          const div1 = document.createElement('div');
          
          //<img src="logobrk.png" alt="" style="height:60px;">
          const img_logo_empresa = document.createElement('img');
          img_logo_empresa.src = './data/img/brk.png';
          img_logo_empresa.style.height = '160px';

          //<div>
          const div2 = document.createElement('div');
          div2.classList.add('green');

          //<div>
          const div3 = document.createElement('div');

          //<p style="font-size: 15px; font-family: 'roc-grotesk', sans-serif; font-style: bold; margin-left: 10px; margin-top: -3px; height:10px;">CHECKLIST</p>
          const p_checklist_text = document.createElement('p');
          p_checklist_text.style.fontSize = '44px';
          p_checklist_text.style.fontFamily = "'Roboto Condensed', sans-serif";
          p_checklist_text.style.fontStyle = 'bold';
          p_checklist_text.style.marginLeft = '10px';
          p_checklist_text.style.marginTop = '-3px';
          p_checklist_text.style.height = '10px';
          p_checklist_text.textContent = 'CHECKLIST';

          //<div>
          const div4 = document.createElement('div');
          
          //<img src="./data/img/formaII.png" alt="" style="height: 60px; margin-left: 10px; margin-top: -5px;">
          const img_formaII = document.createElement('img');
          img_formaII.src = './data/img/form.png';
          img_formaII.style.height = '60px';
          img_formaII.style.marginLeft = '10px';
          img_formaII.style.marginTop = '-5px';

          div1.appendChild(img_logo_empresa);
          h1_title.appendChild(div1);

          div_main_title.appendChild(h1_title);

          h1_title.appendChild(div2);
          
          div3.appendChild(p_checklist_text);
          h1_title.appendChild(div3);

          div4.appendChild(img_formaII);

          h1_title.appendChild(div4);

          div_global.appendChild(div_main_title);

          let i;
          Object.keys(data).forEach((row) => {

            console.log("row: ", row);
            //console.log("\ndata[row]: \n", data[row]);

            let Titulo, Descricao, Retorno;
            Titulo = data[row]["titulo"];
            Descricao = data[row]["descricao"];
            Retorno = data[row]["retorno"]

            console.log("[DOMUpdater] - Titulo: ", Titulo, "\n- Descricao: ", Descricao, "\n- Retorno: ", Retorno);

            //para cada ip criar um container de report
            i = 0;
            Object.keys(data[row]["ips"]).forEach((actual) => {

              const ip = data[row]["ips"][actual];
              
              const ipDetails = database["brk"][row]["List"].find((machine) => machine.IP === ip);

              //console.log('\n\nipDetails: ', ipDetails);
              //console.log('\nAllGroups\n', AllGroups["brk"][i], "\n");

              console.log('row: ', row);

              //console.log("ipDetails.Hostname: ", ipDetails.Hostname);

              Titulo = Titulo.replace(/\{hostname\}/, ipDetails.Hostname);
              Titulo = Titulo.replace(/\{region\}/, ipDetails.UNIDADE);
              Titulo = Titulo.replace(/\{ip\}/, ip);
              Titulo = Titulo.replace(/\{regshort\}/, ipDetails.UNI);

              Descricao = Descricao.replace(/\{hostname\}/, ipDetails.Hostname);
              Descricao = Descricao.replace(/\{region\}/, ipDetails.UNIDADE);
              Descricao = Descricao.replace(/\{ip\}/, ip);
              Descricao = Descricao.replace(/\{reg\}/, ipDetails.UNI);

              createReportContainer(Titulo, Descricao, Retorno, ip);

              i++;
            });
          });
          
          //i contagem de containers
          (i > 3) ? main_container.style.display = 'grid' : main_container.style.display = 'block';

          div_global.appendChild(main_container);
          
          const br = document.createElement('br');

          div_global.appendChild(br);

          //<div class="marcadagua">
          const div_marcadagua = document.createElement('div');
          div_marcadagua.classList.add('marcadagua');

          //<img src="./data/img/logoaz.png" style="width: 15%;">
          const img_logoaz = document.createElement('img');
          img_logoaz.src = './data/img/logoaz.png';
          img_logoaz.style.width = '15%';

          div_marcadagua.appendChild(img_logoaz);

          div_global.appendChild(div_marcadagua);

          const htmlContent = dom.serialize();
          fs.writeFileSync('index.html', htmlContent);

          resolve();

        }).catch(error => {
          console.error('[DOMUpdater] Ocorreu um erro:', error);
          reject(error);
        });
      });

  });
}

//module.exports = UpdateDOM;
export default UpdateDOM;