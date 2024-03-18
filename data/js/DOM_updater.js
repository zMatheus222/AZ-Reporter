const { JSDOM } = require('jsdom');
const fs = require('fs');

async function UpdateDOM() {

  return new Promise((resolve, reject) => {

    // Importando o node-fetch de forma compatível com CommonJS e módulos ES
    import('node-fetch').then(({ default: fetch }) => {

      fetch('http://localhost:8083/commands').then(response => response.json()).then(data => {

          console.log("passo 3.1, antes de pegar base_index.html");

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
          img_logo_empresa.style.height = '60px';

          //<div>
          const div2 = document.createElement('div');

          //<img src="./data/img/linhaII.png" alt="" style="height: 45px; margin-left: 10px; margin-top: -15px; ">
          const img_linhaII = document.createElement('img');
          img_linhaII.src = './data/img/green.png';
          img_linhaII.style.height = '45px';
          img_linhaII.style.marginLeft = '10px';
          img_linhaII.style.marginTop = '-15px';

          //<div>
          const div3 = document.createElement('div');

          //<p style="font-size: 15px; font-family: 'roc-grotesk', sans-serif; font-style: bold; margin-left: 10px; margin-top: -3px; height:10px;">CHECKLIST</p>
          const p_checklist_text = document.createElement('p');
          p_checklist_text.style.fontSize = '15px';
          p_checklist_text.style.fontFamily = "'roc-grotesk', sans-serif";
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

          div2.appendChild(img_linhaII);
          h1_title.appendChild(div2);
          
          div3.appendChild(p_checklist_text);
          h1_title.appendChild(div3);

          div4.appendChild(img_formaII);
          h1_title.appendChild(div4);

          div_global.appendChild(div_main_title);

          let i = 0;

          Object.keys(data["commands"]).forEach((row) => {

            console.log("passo 3.3, inserindo elementos | titulo | descricao: ");
            console.log("data[commands][row].titulo: ", data['commands'][row].titulo);
            console.log("data[commands][row].descricao: ", data['commands'][row].descricao);

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
            h2_title.textContent = data['commands'][row].titulo;

            //<p class="info" id="reportado">Reportado ao Marcos Paulo no grupo Observability - Monitoramento Esxi VMware.</p> 
            const p_desc = document.createElement('p');
            p_desc.classList.add('info');
            p_desc.id = 'reportado';
            p_desc.textContent = data['commands'][row].descricao;

            //<h5 class="info" id="status">Status Retorno: Manutenção local da Unidade.</h5>
            const h5_return = document.createElement('h5');
            h5_return.classList.add('info');
            h5_return.id = 'status';
            h5_return.textContent = 'Status Retorno: Manutenção local da Unidade.';

            div_container.appendChild(img_gota);
            div_container.appendChild(h2_title);
            div_container.appendChild(p_desc);
            div_container.appendChild(h5_return);

            main_container.appendChild(div_container);

            i++;
          });
          
          //i contagem de reports

          (i > 8) ? main_container.style.display = 'grid' : main_container.style.display = 'block';

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
          console.error('Ocorreu um erro:', error);
          reject(error);
        });
      });

  });
}

module.exports = UpdateDOM;