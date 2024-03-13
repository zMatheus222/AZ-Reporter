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

          const dom = new JSDOM(html_content);
          const document = dom.window.document;

          const mainElement = document.getElementById('main_container');
          
          console.log("passo 3.2, inserindo dados 'Object.keys(data['commands'])'");

          Object.keys(data["commands"]).forEach((row) => {

            console.log("row:", row);
        
            const div_command_container = document.createElement('div');
            div_command_container.classList.add('container');
            mainElement.appendChild(div_command_container);        

            data["commands"][row].titulo_desc.forEach((titulo_desc, index) => {
                const div_status_container = document.createElement('div');
                div_status_container.classList.add('status_container');
                div_command_container.appendChild(div_status_container);
            
                const textarea_title = document.createElement('textarea');
                textarea_title.classList.add('info');
                textarea_title.classList.add('input_');
                textarea_title.classList.add('input_title');
                textarea_title.spellcheck = false;
                textarea_title.textContent = titulo_desc[0];
            
                const textarea_description = document.createElement('textarea');
                textarea_description.classList.add('info');
                textarea_description.classList.add('input_');
                textarea_description.classList.add('input_desc');
                textarea_description.spellcheck = false;
                textarea_description.textContent = titulo_desc[0];

                const textarea_report = document.createElement('textarea');
                textarea_report.classList.add('info');
                textarea_report.classList.add('input_');
                textarea_report.classList.add('input_report');
                textarea_report.spellcheck = false;
                textarea_report.textContent = '<Area para retorno do cliente>';
                 
                div_status_container.appendChild(textarea_title);
                div_status_container.appendChild(textarea_description);
                div_status_container.appendChild(textarea_report);
            });
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