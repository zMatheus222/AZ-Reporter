const { JSDOM } = require('jsdom');
const fs = require('fs');

async function UpdateDOM() {

  return new Promise((resolve, reject) => {

    // Importando o node-fetch de forma compatível com CommonJS e módulos ES
    import('node-fetch').then(({ default: fetch }) => {

      fetch('http://localhost:8083/commands').then(response => response.json()).then(data => {

          console.log("passo 3.1 data: ", data);

          console.log("passo 3.1, antes de pegar base_index.html");

          const html_content = fs.readFileSync('./base_index.html', 'utf8');

          console.log("html_content: ", html_content);

          const dom = new JSDOM(html_content);
          const document = dom.window.document;

          const mainElement = document.getElementById('background');
          
          console.log("passo 3.2, inserindo dados 'Object.keys(data['commands'])'");

          Object.keys(data["commands"]).forEach((row) => {

            console.log("row:", row);

            //<div class="top">
            const div_top = document.createElement('div');
            div_top.classList.add('top');

            //<img src="teste/brk.png" class="logoempresa">
            const img_empresa = document.createElement('img');
            img_empresa.classList.add('logoempresa');
            img_empresa.src = 'data/img/brk.png';

            //<div class="vertical_line"></div>
            const div_vertical_line = document.createElement('div');
            div_vertical_line.classList.add('vertical_line');
            
            //<a class="checklist_text">CHECKLIST</a>
            const a_checklist = document.createElement('a');
            a_checklist.classList.add('checklist_text');
            a_checklist.textContent = 'CHECKLIST';
            
            //<img src="teste/redb.png" class="detail_blue_red">
            const img_blue_red = document.createElement('img');
            img_blue_red.classList.add('detail_blue_red');
            img_blue_red.src = 'data/img/redb.png';

            console.log("img_empresa", img_empresa);

            //adicionando elementos acima na div com id 'background'
            div_top.appendChild(img_empresa);
            div_top.appendChild(div_vertical_line);
            div_top.appendChild(a_checklist);
            div_top.appendChild(img_blue_red);
            mainElement.appendChild(div_top);

            //<div class="mid">
            const div_mid = document.createElement('div');
            div_mid.classList.add('mid');

            //<div class="container">
            const div_container = document.createElement('div');
            div_container.classList.add('container');

            //<div class="container_left">
            const div_container_left = document.createElement('div');
            div_container_left.classList.add('container_left');

            //<img src="teste/gota.png" class="gota">
            const img_gota = document.createElement('img');
            img_gota.classList.add('gota');
            img_gota.src = 'data/img/gota.png';

            //<div class="container_right">
            const div_container_right = document.createElement('div');
            div_container_right.classList.add('container_right');

            //<h1 class="titulo_report">VMWare de LDR LDR23PTH001 está sem trazer métricas</h1>
            const h1_titulo_report = document.createElement('h1');
            h1_titulo_report.classList.add('titulo_report');
            h1_titulo_report.textContent = 'VMWare de LDR LDR23PTH001 está sem trazer métricas';

            //<p class="descricao_report">VMWare está sem acesso no /ui</p>
            const p_descricao_report = document.createElement('p');
            p_descricao_report.classList.add('descricao_report');
            p_descricao_report.textContent = 'VMWare está sem acesso no /ui';
            
            div_container_left.appendChild(img_gota);
            div_container.appendChild(div_container_left);
            div_container_right.appendChild(h1_titulo_report);
            div_container_right.appendChild(p_descricao_report);
            div_container.appendChild(div_container_right);
            div_mid.appendChild(div_container);

            mainElement.appendChild(div_mid);

            //<div class="bot">
            const div_bot = document.createElement('div');
            div_bot.classList.add('bot');

            //<div class="bot_right">
            const div_bot_right = document.createElement('div');
            div_bot_right.classList.add('bot_right');

            //<img src="azcorp.png" class="az-logo">
            const img_azcorp = document.createElement('img');
            img_azcorp.classList.add('az-logo');
            img_azcorp.src = 'azcorp.png';

            div_bot_right.appendChild(img_azcorp);
            div_bot.appendChild(div_bot_right);
            mainElement.appendChild(div_bot);


            // const div_command_container = document.createElement('div');
            // div_command_container.classList.add('container');
            // mainElement.appendChild(div_command_container);     
            
            // console.log("data[\"commands\"][row]", data["commands"][row]);

            // data["commands"][row].titulo_desc.forEach((titulo_desc, index) => {

            //     console.log("titulo_desc: ", titulo_desc);

            //     const div_status_container = document.createElement('div');
            //     div_status_container.classList.add('status_container');
            //     div_command_container.appendChild(div_status_container);
            
            //     const textarea_title = document.createElement('textarea');
            //     textarea_title.classList.add('info');
            //     textarea_title.classList.add('input_');
            //     textarea_title.classList.add('input_title');
            //     textarea_title.spellcheck = false;
            //     textarea_title.textContent = titulo_desc[0];
            
            //     const textarea_description = document.createElement('textarea');
            //     textarea_description.classList.add('info');
            //     textarea_description.classList.add('input_');
            //     textarea_description.classList.add('input_desc');
            //     textarea_description.spellcheck = false;
            //     textarea_description.textContent = titulo_desc[0];

            //     const textarea_report = document.createElement('textarea');
            //     textarea_report.classList.add('info');
            //     textarea_report.classList.add('input_');
            //     textarea_report.classList.add('input_report');
            //     textarea_report.spellcheck = false;
            //     textarea_report.textContent = '<Area para retorno do cliente>';
                 
            //     div_status_container.appendChild(textarea_title);
            //     div_status_container.appendChild(textarea_description);
            //     div_status_container.appendChild(textarea_report);
            // });
        });

          console.log("passo 3.3, terminou de inserir os dados (3x appendChild();)");
          
          const htmlContent = dom.serialize();
          fs.writeFileSync('index.html', htmlContent);

          resolve();
        })
        .catch(error => {
          console.error('Ocorreu um erro:', error);
          reject(error);
        });
      });

  });
}

module.exports = UpdateDOM;