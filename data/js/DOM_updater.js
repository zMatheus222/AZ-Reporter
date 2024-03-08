const { JSDOM } = require('jsdom');
const fs = require('fs');

function UpdateDOM() {
  // Importando o node-fetch de forma compatível com CommonJS e módulos ES
  import('node-fetch').then(({ default: fetch }) => {

    fetch('http://localhost:8083/commands').then(response => response.json()).then(data => {

        const html_content = fs.readFileSync('./base_index.html', 'utf8');

        const dom = new JSDOM(html_content);
        const document = dom.window.document;

        const mainElement = document.getElementById('main_container');
        
        Object.keys(data["commands"]).forEach((row) => {

          console.log("row:", row);
          
          const div_container = document.createElement('div');
          div_container.classList.add('container');
          mainElement.appendChild(div_container);

          const textarea_title = document.createElement('textarea');
          textarea_title.classList.add('info');
          textarea_title.classList.add('input_');
          textarea_title.classList.add('input_title');
          textarea_title.spellcheck = false;
          textarea_title.textContent = data["commands"][row].titulo_desc[0];

          const textarea_description = document.createElement('textarea');
          textarea_description.classList.add('info');
          textarea_description.classList.add('input_');
          textarea_description.classList.add('input_desc');
          textarea_description.spellcheck = false;
          textarea_description.textContent = data["commands"][row].titulo_desc[1];

          const textarea_report = document.createElement('textarea');
          textarea_report.classList.add('info');
          textarea_report.classList.add('input_');
          textarea_report.classList.add('input_report');
          textarea_report.spellcheck = false;
          textarea_report.textContent = '<Area para retorno do cliente>';

          div_container.appendChild(textarea_title);
          div_container.appendChild(textarea_description);
          div_container.appendChild(textarea_report);
          
        });
        
        const htmlContent = dom.serialize();
        fs.writeFileSync('index.html', htmlContent);
      })
      .catch(error => {
        console.error('Ocorreu um erro:', error);
      });
  });
}

module.exports = UpdateDOM;