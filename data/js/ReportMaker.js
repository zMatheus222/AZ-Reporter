let reports = require('./../json/reportsbase.json');

class UnidadeControle {

    static Args;

    constructor(hostname, ip, unidade){
        this.hostname = hostname;
        this.ip = ip;
        this.unidade = unidade;
    }
}

class VMWare {

    static Args;

    constructor(hostname, Servidor, Port, ContainerName, Unidade, IP){
        this.hostname = hostname;
        this.Servidor = Servidor;
        this.Port = Port;
        this.containername = ContainerName;
        this.unidade = Unidade;
        this.ip = IP;
    }
}

function MakeReportObjects(){

    let AllGroups = {}; //objeto que irá conter todos os itens

    let VMWaresGroup = []; //vetor que irá guardar VMWares
    let UnidadesGroup = []; //vetor que irá guardar Unidades

    Object.keys(reports).forEach((empresa) =>{ //console.log("empresa....: ", empresa); // equivale a: brk: {

        Object.keys(reports[empresa]).forEach((itemEmpresa) =>{ //console.log("  itensEmpresa: ", itemEmpresa); //equivale a UnidadesControle: {

            Object.keys(reports[empresa][itemEmpresa]).forEach((subItem) =>{ console.log("    subItem.....: ", subItem); //equivale a Args: { e List: {

                //inserindo argumentos de VMWare ou Unidades nas classes correspondentes
                (itemEmpresa === "UnidadesControle") ? UnidadeControle.Args = reports[empresa][itemEmpresa][subItem] : (itemEmpresa === "VMWares") ? VMWare.Args = reports[empresa][itemEmpresa][subItem] : Console.log("Erro ao inserir Args na classe.");

                Object.keys(reports[empresa][itemEmpresa][subItem]).forEach((item) =>{ //console.log("      item........: ", item); //equivale aos itens dentro de Args: { e List: {
                    
                    const details = reports[empresa][itemEmpresa][subItem][item];

                    if(itemEmpresa === "UnidadesControle" && subItem === "List"){
                        
                        const NewObjUnidade = new UnidadeControle(
                            item,
                            details.IP,
                            details.UNIDADE,
                        );

                        UnidadesGroup.push(NewObjUnidade);
                    }
                    if (itemEmpresa === "VMWares" && subItem === "List"){

                        const NewObjVMWare = new VMWare(
                            item,
                            details.Servidor,
                            details.Port,
                            details.ContainerName,
                            details.Unidade,
                            details.IP,
                        );

                        VMWaresGroup.push(NewObjVMWare);
                    }

                });
                
            });

        });

        AllGroups["UnidadesControle"] = UnidadesGroup;
        AllGroups["VMWares"] = VMWaresGroup;

        console.log("UnidadesGroup: ", UnidadesGroup);
        console.log("VMWaresGroup: ", VMWaresGroup);
        
    });

    return AllGroups;

}

//MakeReportObjects();

module.exports = MakeReportObjects;