//let reports = require('./../json/reportsbase.json');
//import reports from './../json/reportsbase.json';

//let reports = require('./../json/reportsbase.json');
import reports from "./../json/reportsbase.json" assert { type: "json" };

//console.log(reports);

class unidade {

    static Args;
    static List;

    constructor(hostname, ip, unidade, uni){
        this.hostname = hostname;
        this.ip = ip;
        this.unidade = unidade;
        this.uni = uni;
    }
}

class vmware {

    static Args;
    static List;

    constructor(hostname, Servidor, Port, ContainerName, Unidade, uni, IP){
        this.hostname = hostname;
        this.Servidor = Servidor;
        this.Port = Port;
        this.containername = ContainerName;
        this.unidade = Unidade;
        this.uni = uni;
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

                        
                        //inserindo argumentos de vmware ou Unidades nas classes correspondentes
                        if(itemEmpresa === "unidade"){
                            if(subItem === "Args"){
                                unidade.Args = reports[empresa][itemEmpresa][subItem];
                            }
                            else if(subItem === "List"){
                                unidade.List = reports[empresa][itemEmpresa][subItem];
                            }
                        }
                        else if (itemEmpresa === "vmware"){
                            if(subItem === "Args"){
                                vmware.Args = reports[empresa][itemEmpresa][subItem];
                            }
                            else if(subItem === "List"){
                                vmware.List = reports[empresa][itemEmpresa][subItem];
                            }
                        }
                        else {
                            console.log("Erro ao inserir Args | List na classe.");
                        }
    
                        Object.keys(reports[empresa][itemEmpresa][subItem]).forEach((item) =>{ console.log("      item........: ", item); //equivale aos itens dentro de Args: { e List: {
                            
                            const details = reports[empresa][itemEmpresa][subItem][item];

                            console.log('details: ', details);
    
                            if(itemEmpresa === "unidade" && subItem === "List"){
                                
                                const NewObjUnidade = new unidade(
                                    details.Hostname,
                                    details.IP,
                                    details.UNIDADE,
                                    details.UNI
                                );
    
                                UnidadesGroup.push(NewObjUnidade);
                            }
                            if (itemEmpresa === "vmware" && subItem === "List"){
    
                                const NewObjVMWare = new vmware(
                                    details.Hostname,
                                    details.Servidor,
                                    details.Port,
                                    details.ContainerName,
                                    details.UNIDADE,
                                    details.UNI,
                                    details.IP
                                );
    
                                VMWaresGroup.push(NewObjVMWare);
                            }
    
                        });
                        
                    });
    
                });

                CompanyGroup["unidade"] = UnidadesGroup;
                CompanyGroup["vmware"] = VMWaresGroup;
    
                AllGroups[empresa] = CompanyGroup;
                
            });

            //console.log("\n");
            //console.log("VMW-ARGS:", vmware.Args);
            //console.log("UND-ARGS:", unidade.Args);
            //console.log("\n");
            //console.log("VMW-LIST:", vmware.List);
            //console.log("UND-LIST:", unidade.List);
            //console.log("\n");
            //console.log("AllGroups: ", AllGroups);

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

export { MakeReportObjects as default, unidade, vmware };