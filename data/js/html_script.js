fetch('http://localhost:8083/commands').then(response => response.json()).then(data => {

    console.log("data:", data);

    const mainElement = document.getElementById('main_container');

    Object.keys(data["commands"]).forEach((row) =>{

        console.log("Titulo...: ", data["commands"][row].titulo_desc[0]);
        console.log("Descricao:, ", data["commands"][row].titulo_desc[1]);

        const div_container = document.createElement('div');
        div_container.classList.add('container');

        mainElement.appendChild(div_container);

        console.log("mainElement", mainElement);

        //<input type="text" id="tentacles" name="tentacles" value="Igão Meu amor" style="border-style: none; background-color: rgb(240, 248, 255, 0.0); color: white"/>
        const textarea_title = document.createElement('textarea');
        textarea_title.classList.add('input_');
        textarea_title.classList.add('info');
        textarea_title.classList.add('input_title');
        textarea_title.spellcheck = false;
        //h2_title.value = data["commands"][row].titulo_desc[0];
        textarea_title.value = "A VMWare (SRVHVM001PDL ip: 10.156.180.11) sem trazer métricas e com acesso muito lento no /ui.";
        div_container.appendChild(textarea_title);

        //
        const textarea_description = document.createElement('textarea');
        textarea_description.classList.add('info');
        textarea_description.classList.add('input_');
        textarea_description.classList.add('input_desc');
        textarea_description.spellcheck = false;
        textarea_description.value = "Mastersaf com problema no versionamento do HTTP";
        textarea_description.textContent = data["commands"][row].titulo_desc[1];

        const textarea_report = document.createElement('textarea');
        textarea_report.classList.add('info');
        textarea_report.classList.add('input_');
        textarea_report.classList.add('input_report');
        textarea_report.spellcheck = false;
        textarea_report.value = 'Reportado ao jere';

        div_container.appendChild(textarea_title);
        div_container.appendChild(textarea_description);
        div_container.appendChild(textarea_report);

    });

    /*
    // Tirar print do DOM e salvar em uma pasta
    html2canvas(document.querySelector('.div_global')).then(canvas => {
        
        // Converta o canvas para um URL de dados
        const imageData = canvas.toDataURL("image/png");
        
        //criando objeto que será enviado ao servidor
        const item_image = {};

        item_image[`03-03-2024`] = {
            "image": imageData
        }

        console.log("sending item_image: ", item_image);
        
        fetch("http://localhost:8083/save-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item_image)
        }).then(response => {
            if (response.status === 200) {
                //Sucesso: Os dados foram enviados com sucesso
                alert("Dados enviados com sucesso!");
            }
            else {
                //Tratar erros de acordo com a resposta do servidor
                alert("Erro ao enviar dados.");
            }
        }).catch(error => {
            alert("Erro de conexao. " + error);
        });

    });
    */
});