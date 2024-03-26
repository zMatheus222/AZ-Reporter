//let reports = require('./../json/reportsbase.json');
//import reports from './../json/reportsbase.json';

//let reports = require('./../json/reportsbase.json');
import reports from "./../json/reportsbase.json" assert { type: "json" };

//console.log(reports);

class UnidadeControle {

    static Args;
    static List;

    constructor(hostname, ip, unidade){
        this.hostname = hostname;
        this.ip = ip;
        this.unidade = unidade;
    }
}

class VMWare {

    static Args;
    static List;

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

    return new Promise((resolve, reject) =>{

        try{

            let AllGroups = {}; //objeto que irá conter todos os itens
    
            Object.keys(reports).forEach((empresa) =>{ console.log("empresa....: ", empresa); // equivale a: brk: {

                //console.log("reports: ", reports);

                let CompanyGroup = {}; //objeto que ira guardar o nome da empresa
                let VMWaresGroup = []; //vetor que irá guardar VMWares
                let UnidadesGroup = []; //vetor que irá guardar Unidades
    
                Object.keys(reports[empresa]).forEach((itemEmpresa) =>{ console.log("  itensEmpresa: ", itemEmpresa); //equivale a UnidadesControle: {
    
                    Object.keys(reports[empresa][itemEmpresa]).forEach((subItem) =>{ console.log("    subItem.....: ", subItem); //equivale a Args: { e List: {

                        
                        //inserindo argumentos de VMWare ou Unidades nas classes correspondentes
                        if(itemEmpresa === "UnidadesControle"){
                            if(subItem === "Args"){
                                UnidadeControle.Args = reports[empresa][itemEmpresa][subItem];
                            }
                            else if(subItem === "List"){
                                UnidadeControle.List = reports[empresa][itemEmpresa][subItem];
                            }
                        }
                        else if (itemEmpresa === "VMWares"){
                            if(subItem === "Args"){
                                VMWare.Args = reports[empresa][itemEmpresa][subItem];
                            }
                            else if(subItem === "List"){
                                VMWare.List = reports[empresa][itemEmpresa][subItem];
                            }
                        }
                        else {
                            console.log("Erro ao inserir Args | List na classe.");
                        }
    
                        Object.keys(reports[empresa][itemEmpresa][subItem]).forEach((item) =>{ console.log("      item........: ", item); //equivale aos itens dentro de Args: { e List: {
                            
                            const details = reports[empresa][itemEmpresa][subItem][item];

                            console.log('details: ', details);
    
                            if(itemEmpresa === "UnidadesControle" && subItem === "List"){
                                
                                const NewObjUnidade = new UnidadeControle(
                                    details.Hostname,
                                    details.IP,
                                    details.UNIDADE,
                                );
    
                                UnidadesGroup.push(NewObjUnidade);
                            }
                            if (itemEmpresa === "VMWares" && subItem === "List"){
    
                                const NewObjVMWare = new VMWare(
                                    details.Hostname,
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

                CompanyGroup["UnidadesControle"] = UnidadesGroup;
                CompanyGroup["VMWares"] = VMWaresGroup;
    
                AllGroups[empresa] = CompanyGroup;
                
            });

            // console.log("\n");
            // console.log("VMW-ARGS:", VMWare.Args);
            // console.log("UND-ARGS:", UnidadeControle.Args);
            // console.log("\n");
            // console.log("VMW-LIST:", VMWare.List);
            // console.log("UND-LIST:", UnidadeControle.List);
            // console.log("\n");
            // console.log("AllGroups: ", AllGroups);

            resolve(AllGroups);

        }
        catch (error) {
            reject(error);
        }

    });

}

//MakeReportObjects();

//module.exports = MakeReportObjects;
//export default MakeReportObjects;

export { MakeReportObjects as default, UnidadeControle, VMWare };