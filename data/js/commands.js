const jsonx = require('./database.json');

let answer = "/checklist report cartoes[nocol] msaf[httpversion] ordens[timepass]";

//regex para separar os itens dos comandos
const regex_answer = /(\w+)\[([^\]]+)\]/g;
let matches = answer.match(regex_answer);

//verificar se existe ocorrencia da regex na answer e não é 'null'
if(matches){

    let parts;
    let args;

    let commands = {};

    //iterar sobre cada ocorrencia no comando
    matches.forEach(function(match){

        //variavel que salva o sistema, conteudo passado antes dos colchetes 'msaf'[...]
        let system = match.match(/^(\w+)\[/)[1];

        commands[system] = {
            titulo_desc: [],
            args: []
        }

        // Extraindo o tipo de comando e o argumento de cada correspondência
        parts = match.split("[");
    
        // Remove o colchete de fechamento "]" // argumentos tem os conteudos dentro dos colchetes sistema['conteudo1,conteudo2...']
        let argumentos = parts[1].slice(0, -1);
        
        // regex para separar os argumentos passados nos colchetes ['']
        const regex_argumentos = /([^\]]+)/;

        args = argumentos.match(regex_argumentos).input.split(',').map(arg => arg.trim());

        args.forEach(function (problema_recebido){
            
            //vetor que vai salvar o problema atual 'titulo' - 'descricao problema'
            let titulo_desc = [];

            //buscar o problema recebido no comando na lista de problemas
            if(system + "_" + problema_recebido in jsonx["banco_problemas"]){

                titulo_desc.push(jsonx["banco_problemas"][system + "_" + problema_recebido][0]); //titulo
                titulo_desc.push(jsonx["banco_problemas"][system + "_" + problema_recebido][1]); //descricao

                commands[system]["titulo_desc"] = titulo_desc; //adicionando titulo e descrição ao objeto

            }

        });

        commands[system]["args"] = args;
        
    });

    console.log("\nCommands: ", commands);

    fetch("http://localhost:8083/command_input/", {
        
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify({ commands: commands })

    }).then(response => {
        //console.log("response: ", response);
    }).catch(error => {
        //console.log("error: ", error);
    });

}