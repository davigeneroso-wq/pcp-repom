// ==UserScript==
// @name         🚛 PCP REPOM AUTO TURBO UNIFICADO
// @namespace    http://tampermonkey.net/
// @version      10.0
// @updateURL    https://raw.githubusercontent.com/davigeneroso-wq/pcp-repom/main/SCRIPT%20REPOM.user.js
// @downloadURL  https://raw.githubusercontent.com/davigeneroso-wq/pcp-repom/main/SCRIPT%20REPOM.user.js
// @description  PCP Automação Repom - Turbo + Rotas Automáticas por ID + Alteração de Rota pelo Usuário
// @match        https://www.repom.com.br/*
// @grant        none
// ==/UserScript==

(function(){

"use strict";


/* =====================================================
CONFIGURAÇÃO
===================================================== */

const FILIAL = "001";

let executando = false;
let executandoRota = false;

const ULTIMO_MOTORISTA_KEY = "pcpUltimoMotorista";
const ULTIMO_FILTRO_KEY = "pcpUltimoFiltro";
const ROTAS_KEY = "pcpRotasMotoristas";
const CONFIG_MOTORISTAS_KEY = "pcpConfigMotoristas";

const STATUS_KEY = "pcpStatusMotoristas";
const ESCALA_KEY = "pcpEscalaDia";
const MOTORISTA_PENDENTE_KEY = "pcpMotoristaPendente";
const ROTA_PENDENTE_KEY = "pcpRotaPendente";

// =====================================================
// 🔄 RESET DIÁRIO DO TURNO
// Turno: 23:00 → 06:20
// O reset acontece somente quando começa um novo turno.
// =====================================================

function resetDiario(){

    const agora = new Date();

    const hora = agora.getHours();
    const minuto = agora.getMinutes();

    /*
     * O "dia operacional" começa às 23:00.
     *
     * Exemplo:
     *
     * 11/08 22:59 → turno anterior
     * 11/08 23:00 → NOVO TURNO / RESET
     * 12/08 03:00 → continua o mesmo turno
     * 12/08 06:20 → continua sem reset
     * 12/08 22:59 → ainda não reseta
     * 12/08 23:00 → NOVO RESET
     */

    const dataOperacional = new Date(agora);

    if(hora < 23){

        dataOperacional.setDate(
            dataOperacional.getDate() - 1
        );

    }

    const diaOperacional =
        dataOperacional.getFullYear() +
        "-" +
        String(
            dataOperacional.getMonth() + 1
        ).padStart(2,"0") +
        "-" +
        String(
            dataOperacional.getDate()
        ).padStart(2,"0");


    const ultimoReset =
        localStorage.getItem(
            "pcpUltimoReset"
        );


    /*
     * Só executa UMA VEZ por turno.
     */

    if(
        hora >= 23 &&
        ultimoReset !== diaOperacional
    ){

        console.log(
            "♻️ INICIANDO NOVO TURNO PCP"
        );


        // =============================================
        // ZERA STATUS DOS PEDÁGIOS
        // =============================================

        localStorage.removeItem(
            "pcpStatusMotoristas"
        );


        // =============================================
        // ZERA ESCALA
        // =============================================

        localStorage.removeItem(
            "pcpEscalaDia"
        );


        // =============================================
        // LIMPA MOTORISTA ANTERIOR
        // =============================================

        localStorage.removeItem(
            "pcpUltimoMotorista"
        );


        // =============================================
        // LIMPA FILTRO ANTERIOR
        // =============================================

        localStorage.removeItem(
            "pcpUltimoFiltro"
        );


        // =============================================
        // LIMPA PENDÊNCIAS
        // =============================================

        localStorage.removeItem(
            "pcpMotoristaPendente"
        );

        localStorage.removeItem(
            "pcpRotaPendente"
        );


        // =============================================
        // MARCA O TURNO COMO RESETADO
        // =============================================

        localStorage.setItem(
            "pcpUltimoReset",
            diaOperacional
        );


        console.log(
            "✅ PEDÁGIOS RESETADOS"
        );

        console.log(
            "👥 Todos os motoristas agora estão pendentes"
        );

    }

}


// Executa ao carregar o script
resetDiario();


// Verifica a cada 1 minuto se chegou 23:00
setInterval(
    resetDiario,
    60000
);



function obterStatusMotoristas(){

try{

return JSON.parse(
localStorage.getItem(STATUS_KEY)
)||{};

}catch(e){

return {};

}

}


function salvarStatusMotoristas(status){

localStorage.setItem(
STATUS_KEY,
JSON.stringify(status)
);

}


function atualizarStatusMotorista(nome,status){

const lista = obterStatusMotoristas();

lista[nome] = {
status: status,
horario: new Date().toLocaleTimeString()
};

salvarStatusMotoristas(lista);

}


function pegarStatusMotorista(nome){

const lista = obterStatusMotoristas();

return lista[nome] || {
status:"pendente"
};

}


// COLE AQUI 👇

function contarStatus(){



const lista = obterStatusMotoristas();

let feitos=0;
let processo=0;
let pendentes=0;

motoristas.forEach(m=>{

const s = lista[m.nome]?.status || "pendente";

if(s==="feito"){
feitos++;
}
else if(s==="processando"){
processo++;
}
else{
pendentes++;
}

});

return {
total:motoristas.length,
feitos,
processo,
pendentes
};

}

let filtroAtual =
localStorage.getItem(ULTIMO_FILTRO_KEY) ||
"TODOS";

function obterEscala(){

try{

return JSON.parse(
localStorage.getItem(ESCALA_KEY)
)||[];

}catch(e){

return [];

}

}


function salvarEscala(lista){

localStorage.setItem(
ESCALA_KEY,
JSON.stringify(lista)
);

}

/* =====================================================
MOTORISTAS
===================================================== */

const motoristasBase = [

{nome:"KAIQUE DEVECHIO GUIMARAES",placa:"IWL6D74",conjunto:"EJZ4H00",cnpj:"35202560000103",praca:"BRASILIA"},
{nome:"RUAN CARLOS",placa:"EJJ8C29",conjunto:"FZV5H70",cnpj:"29327010000118",praca:"BRASILIA"},
{nome:"TIAGO JOSE DE CASTRO",placa:"BZF9B97",conjunto:"ATH0J76",cnpj:"28928563000163",praca:"BRASILIA"},
{nome:"GABRIELA LUIZA DA SILVA",placa:"QIK9A03",conjunto:"EZU9A62",cnpj:"29327010000118",praca:"BRASILIA"},
{nome:"RODRIGO DA SILVA PIRES",placa:"FJX6A18",conjunto:"EGK9B36",cnpj:"29327010000118",praca:"BRASILIA"},
{nome:"LEONARDO ALVES DE LIMA",placa:"RUX1G33",conjunto:"CPG6888",cnpj:"11675005000130",praca:"BRASILIA"},
{nome:"DEIVIT WILIAN MARTINS",placa:"UFA5I97",conjunto:"",cnpj:"35202560000103",praca:"BRASILIA"},
{nome:"REGINALDO DE MORAES",placa:"EJZ3986",conjunto:"",cnpj:"REGINALDO DE MORAES",praca:"BRASILIA"},

{nome:"AGEU AIRES",placa:"EKH9B81",conjunto:"",cnpj:"53464773000195",praca:"SAO PAULO"},
{nome:"AMARILDO CLAUDIMIR MAZUCKI",placa:"EFV2C76",conjunto:"",cnpj:"14860737000199",praca:"SAO PAULO"},
{nome:"ANDRE LUIZ",placa:"BTT6814",conjunto:"",cnpj:"14716390000105",praca:"SAO PAULO"},
{nome:"CRISTIANO ROGERIO MAZUCHI",placa:"CUB7B57",conjunto:"",cnpj:"23866183000128",praca:"SAO PAULO"},
{nome:"DANIEL FERREIRA DA CRUZ",placa:"GIC7G06",conjunto:"",cnpj:"692233700013",praca:"SAO PAULO"},
{nome:"DERMIVAL ALVES PEREIRA",placa:"OER8790",conjunto:"",cnpj:"34686222000121",praca:"SAO PAULO"},
{nome:"EDEVALDO GUIMARAES",placa:"DSG3A52",conjunto:"",cnpj:"15401083000106",praca:"SAO PAULO"},
{nome:"ELIAS PEREIRA DOS SANTOS",placa:"EKS4G24",conjunto:"",cnpj:"24928383000120",praca:"SAO PAULO"},
{nome:"ERINALDO SILVA DE ALMEIDA",placa:"DJC6I51",conjunto:"",cnpj:"14716390000105",praca:"SAO PAULO"},
{nome:"FABIANO CARLOS AMORIM",placa:"MJH0807",conjunto:"",cnpj:"17308451000193",praca:"SAO PAULO"},
{nome:"FLAVIO CESAR MAZUCKI",placa:"AOA8140",conjunto:"",cnpj:"42088838000129",praca:"SAO PAULO"},
{nome:"GILDO VIEIRA TENORIO",placa:"DDU4397",conjunto:"",cnpj:"14748652000113",praca:"SAO PAULO"},
{nome:"GIOVANNI GUIMARAES",placa:"EOF4J66",conjunto:"",cnpj:"15401083000106",praca:"SAO PAULO"},
{nome:"GIVANILDO BATISTA DA SILVA",placa:"NTU0372",conjunto:"",cnpj:"14716390000105",praca:"SAO PAULO"},
{nome:"JOAO BATISTA FERREIRA FILHO",placa:"DBB6C41",conjunto:"",cnpj:"14681769000127",praca:"SAO PAULO"},
{nome:"JOAO NERES ARISTIDES",placa:"MJE5867",conjunto:"",cnpj:"07735204000110",praca:"SAO PAULO"},
{nome:"JOAO VITOR CRISTIANO RODRIGUES",placa:"TKZ2F64",conjunto:"",cnpj:"35202560000103",praca:"SAO PAULO"},
{nome:"JOSE ARISTIDES MAZUCHI",placa:"DPB7G53",conjunto:"",cnpj:"14681769000127",praca:"SAO PAULO"},
{nome:"JOSE CARLOS DA SILVA PUPO DOS SANTOS",placa:"DSH0E00",conjunto:"",cnpj:"14716390000105",praca:"SAO PAULO"},
{nome:"LEANDRO ALBERTO MAZUCHI",placa:"EMU5A55",conjunto:"",cnpj:"19291703000144",praca:"SAO PAULO"},
{nome:"LUCAS OLIVEIRA MARIANO",placa:"FCX1F28",conjunto:"",cnpj:"35208253000130",praca:"SAO PAULO"},
{nome:"LUIS ALBERTO AGOSTIN",placa:"CPI7G86",conjunto:"",cnpj:"58793935000152",praca:"SAO PAULO"},
{nome:"MANOEL FRANCISCO LOPES",placa:"DNY2094",conjunto:"",cnpj:"52887164000186",praca:"SAO PAULO"},
{nome:"MARCOS ANTONIO LUCIO",placa:"AUG6307",conjunto:"",cnpj:"61036791000102",praca:"SAO PAULO"},
{nome:"MAYCON JOSE FRANCO",placa:"UFT8A20",conjunto:"",cnpj:"11843159000194",praca:"SAO PAULO"},
{nome:"PEDRO FELIPE BARBOSA",placa:"EHH7E91",conjunto:"",cnpj:"7735204000110",praca:"SAO PAULO"},
{nome:"RAFAEL KUBO FRANCO",placa:"AVD3J52",conjunto:"",cnpj:"35202560000103",praca:"SAO PAULO"},
{nome:"REINALDO CALDEIRA",placa:"ESU1F39",conjunto:"",cnpj:"3864375000198",praca:"SAO PAULO"},
{nome:"RICARDO DE OLIVEIRA FERREIRA",placa:"CUC4952",conjunto:"",cnpj:"14681769000127",praca:"SAO PAULO"},
{nome:"JAIME FURIN",placa:"CUA6J28",conjunto:"",cnpj:"28545579802",praca:"SAO PAULO"},
{nome:"RODRIGO DONISETE MOREIRA",placa:"ELQ2C20",conjunto:"",cnpj:"18201777859",praca:"SAO PAULO"},
{nome:"SERGIO VIEIRA DE SOUSA",placa:"HBZ0H22",conjunto:"",cnpj:"35202560000103",praca:"SAO PAULO"},
{nome:"SIDNEI RICARDO",placa:"DTE7A20",conjunto:"",cnpj:"21482811863",praca:"SAO PAULO"},
{nome:"VALDECI DA COSTA BARREIROS",placa:"PUJ5I64",conjunto:"",cnpj:"51434796000121",praca:"SAO PAULO"},
{nome:"WAGNER RODRIGUES",placa:"ETQ0103",conjunto:"",cnpj:"11843159000194",praca:"SAO PAULO"},
{nome:"WALDETES CHAVES DE OLIVEIRA",placa:"CVP9J61",conjunto:"",cnpj:"14716390000105",praca:"SAO PAULO"},
{nome:"WELLINGTON RIBEIRO",placa:"BWQ1752",conjunto:"",cnpj:"23866183000128",praca:"SAO PAULO"},
{nome:"WEVERTON RIBEIRO RODRIGUES DA SILVA",placa:"FJE6I53",conjunto:"",cnpj:"14681769000127",praca:"SAO PAULO"},


{nome:"GUSTAVO RODRIGO",placa:"CPI4G31",conjunto:"ATR0C74",cnpj:"34707500000180",praca:"INTERIOR"},
{nome:"GUILHERME FELIPE AGOSTIN",placa:"CUE4G47",conjunto:"GZG3G07",cnpj:"58516613000166",praca:"INTERIOR"},
{nome:"VINICIUS GABRIEL MARETTO SILVA",placa:"MQJ9689",conjunto:"MKX6C24",cnpj:"34707500000180",praca:"INTERIOR"},
{nome:"GUSTAVO SORIANO DE LIMA",placa:"IWA7G43",conjunto:"EZU9B08",cnpj:"35202560000103",praca:"INTERIOR"},
{nome:"RODOLFO COMPARINI TREVISAN",placa:"IOR7F02",conjunto:"CPG7E26",cnpj:"22467893898",praca:"INTERIOR"},
{nome:"EDMILSON VON ZUBEN",placa:"DPC5D90",conjunto:"MHF6E46",cnpj:"34707500000180",praca:"INTERIOR"},
{nome:"OZIEL PEREIRA DE PAULA",placa:"NST3H48",conjunto:"DVT9C70",cnpj:"8608371000162",praca:"INTERIOR"},
{nome:"ANTONIO MARCOS DE SOUZA SILVA",placa:"HHS9B17",conjunto:"DVT9C70",cnpj:"54562378000108",praca:"INTERIOR"},
{nome:"SPAULO TORQUATO",placa:"GVQ9C14",conjunto:"",cnpj:"35208253000130",praca:"INTERIOR"},
{nome:"MILTON VEIGA MARTINS JUNIOR",placa:"ETU1A18",conjunto:"",cnpj:"3864375000198",praca:"INTERIOR"},
{nome:"VAGNER BARBOSA DO NASCIMENTO",placa:"GIL6G54",conjunto:"",cnpj:"06922337000132",praca:"INTERIOR"},
{nome:"VINICIUS ANTONIO MARTINS",placa:"FUJ2C01",conjunto:"",cnpj:"06922337000132",praca:"INTERIOR"},
{nome:"JOSE ANTONIO DEL BIANCHI",placa:"QHG7A87",conjunto:"",cnpj:"34686222000121",praca:"INTERIOR"},
{nome:"BRUNO GABRIEL CECCONELLO",placa:"CYR6A25",conjunto:"",cnpj:"17308451000193",praca:"INTERIOR"},
{nome:"LUCAS RODRIGUES",placa:"AFF1250",conjunto:"",cnpj:"24928383000120",praca:"INTERIOR"},
{nome:"CLEITON",placa:"CUC6G78",conjunto:"",cnpj:"36634656000103",praca:"INTERIOR"},
{nome:"JOAO BATISTA CAGNIN",placa:"DBC0957",conjunto:"",cnpj:"52892961000151",praca:"INTERIOR"},
{nome:"MATHEUS BRITO RAFAEL",placa:"AVF5I45",conjunto:"",cnpj:"66476991000191",praca:"INTERIOR"},
{nome:"RENATO PEDROSA JUNIOR",placa:"EFZ1C56",conjunto:"",cnpj:"55634254000153",praca:"INTERIOR"},
{nome:"MARCELO ALVES MARIANO",placa:"DVT6G01",conjunto:"",cnpj:"14716390000105",praca:"INTERIOR"},
{nome:"ANDREY AMORIM DOS SANTOS",placa:"KYP2921",conjunto:"",cnpj:"34686222000121",praca:"INTERIOR"},
{nome:"RICARDO DO NASCIMENTO CHAGAS",placa:"AED6481",conjunto:"",cnpj:"52864662000103",praca:"INTERIOR"},


];

/* =====================================================
MOTORISTAS ADICIONADOS PELO USUÁRIO
===================================================== */

const MOTORISTAS_NOVOS_KEY = "pcpMotoristasNovos";

function obterMotoristasNovos(){

    try{

        return JSON.parse(
            localStorage.getItem(MOTORISTAS_NOVOS_KEY)
        ) || [];

    }catch(e){

        return [];

    }

}

function salvarMotoristasNovos(lista){

    localStorage.setItem(
        MOTORISTAS_NOVOS_KEY,
        JSON.stringify(lista)
    );

}

function obterTodosMotoristas(){

    return [
        ...motoristasBase,
        ...obterMotoristasNovos()
    ];

}

let motoristas = obterTodosMotoristas();

/* =====================================================
ROTAS COM IDs OFICIAIS DO REPOM
===================================================== */

const rotasBase = {

BRASILIA:{
    cidadeId:"4998",
    roteiroId:"14448",
    percursoId:"23"
},

SAO_PAULO:{
    cidadeId:"4998",
    roteiroId:"13470",
    percursoId:"102"
},

SAO_PAULO_ALPHAVILLE:{
    cidadeId:"4998",
    roteiroId:"13470",
    percursoId:"60"
},

SUMARE_AMERICANA:{
    cidadeId:"4998",
    roteiroId:"13291",
    percursoId:"40"
},

AMERICANA_SUMARE: {
    cidadeId: "4434",
    roteiroId: "124539",
    percursoId: "7"
},

BAURU:{
    cidadeId:"4998",
    roteiroId:"42386",
    percursoId:"25"
},

FRANCA:{
    cidadeId:"4998",
    roteiroId:"42559",
    percursoId:"5"
},

INDAIATUBA:{
    cidadeId:"4998",
    roteiroId:"32369",
    percursoId:"27"
},

ITATIBA_RENATO:{
    cidadeId:"4998",
    roteiroId:"21697",
    percursoId:"35"
},

ITATIBA_FRIGO:{
    cidadeId:"4998",
    roteiroId:"21697",
    percursoId:"37"
},

ITU:{
    cidadeId:"4998",
    roteiroId:"13459",
    percursoId:"44"
},

JUNDIAI:{
    cidadeId:"4998",
    roteiroId:"12386",
    percursoId:"77"
},

LIMEIRA:{
    cidadeId:"4998",
    roteiroId:"13461",
    percursoId:"69"
},

PIRACICABA:{
    cidadeId:"4998",
    roteiroId:"34265",
    percursoId:"40"
},

RIBEIRAO_PRETO:{
    cidadeId:"4998",
    roteiroId:"21678",
    percursoId:"20"
},

SUMARE_SOROCABA_IDA:{
    cidadeId:"4998",
    roteiroId:"85366",
    percursoId:"30"
},

SANTO_ANDRE:{
    cidadeId:"4998",
    roteiroId:"13466",
    percursoId:"23"
},

SANTOS:{
    cidadeId:"4998",
    roteiroId:"4849",
    percursoId:"260"
},

SÃO_BERNARDO_DO_CAMPO:{
    cidadeId:"4998",
    roteiroId:"12383",
    percursoId:"44"
},

SAO_CARLOS:{
    cidadeId:"4998",
    roteiroId:"38668",
    percursoId:"33"
},

SAO_JOSE_RIO_PRETO:{
    cidadeId:"4998",
    roteiroId:"109337",
    percursoId:"35"
},

SAO_JOSE_CAMPOS:{
    cidadeId:"4998",
    roteiroId:"13468",
    percursoId:"25"
},

SOROCABA:{
    cidadeId:"4998",
    roteiroId:"32369",
    percursoId:"41"
},

SOROCABA_PIRACICABA:{
    cidadeId:"4996",
    roteiroId:"8604",
    percursoId:"34"
}

};

/* =====================================================
ROTAS FIXAS
===================================================== */

const rotasMotoristas = {

"AGEU AIRES":["SAO_PAULO"],
"AMARILDO CLAUDIMIR MAZUCKI":["SAO_PAULO"],
"ANDRE LUIZ":["SAO_PAULO"],
"CRISTIANO ROGERIO MAZUCHI":["SAO_PAULO"],

"RAFAEL KUBO":[
"SAO_PAULO",
"SOROCABA",
"SOROCABA_PIRACICABA",
"AMERICANA_SUMARE"
],

"DANIEL FERREIRA DA CRUZ":["SAO_PAULO"],
"DERMIVAL ALVES PEREIRA":["SAO_PAULO"],
"EDEVALDO GUIMARAES":["SAO_PAULO"],
"ELIAS PEREIRA DOS SANTOS":["SAO_PAULO"],
"ERINALDO SILVA DE ALMEIDA":["SAO_PAULO"],
"FABIANO CARLOS AMORIM":["SAO_PAULO"],
"FLAVIO CESAR MAZUCKI":["SAO_PAULO"],
"GILDO VIEIRA TENORIO":["SAO_PAULO"],
"GIOVANNI GUIMARAES":["SAO_PAULO"],
"GIVANILDO BATISTA DA SILVA":["SAO_PAULO"],
"JOAO BATISTA FERREIRA FILHO":["SAO_PAULO"],
"JOAO NERES ARISTIDES":["SAO_PAULO"],
"JOSE ARISTIDES MAZUCHI":["SAO_PAULO"],
"JOSE CARLOS DA SILVA PUPO DOS SANTOS":["SAO_PAULO"],
"LEANDRO ALBERTO MAZUCHI":["SAO_PAULO"],
"LUCAS OLIVEIRA MARIANO":["SAO_PAULO"],
"LUIS ALBERTO AGOSTIN":["SAO_PAULO"],
"MANOEL FRANCISCO LOPES":["SAO_PAULO"],
"MARCOS ANTONIO LUCIO":["SAO_PAULO"],
"MAYCON JOSE FRANCO":["SAO_PAULO"],
"PEDRO FELIPE BARBOSA":["SAO_PAULO"],
"RAFAEL KUBO FRANCO":["SAO_PAULO"],
"REINALDO CALDEIRA":["SAO_PAULO"],
"RICARDO DE OLIVEIRA FERREIRA":["SAO_PAULO"],
"RICARDO DE SOUZA IONTA":["SAO_PAULO"],
"SERGIO VIEIRA DE SOUSA":["SAO_PAULO"],
"SIDNEI RICARDO":["SAO_PAULO"],
"VALDECI DA COSTA BARREIROS":["SAO_PAULO"],
"RAFAEL FRANCO":["SAO_PAULO"],
"WAGNER RODRIGUES":["SAO_PAULO"],
"WALDETES CHAVES DE OLIVEIRA":["SAO_PAULO"],
"WELLINGTON RIBEIRO":["SAO_PAULO"],
"WEVERTON RIBEIRO RODRIGUES DA SILVA":["SAO_PAULO"],

"GUSTAVO RODRIGO":["RIBEIRAO_PRETO"],
"GUILHERME FELIPE AGOSTIN":["RIBEIRAO_PRETO"],
"CARLOS ALBERTO AGOSTIN":["SANTOS"],
"GUSTAVO SORIANO DE LIMA":["SAO_JOSE_RIO_PRETO"],
"RODOLFO COMPARINI TREVISAN":["SAO_JOSE_RIO_PRETO"],
"ANTONIO MARCOS DE SOUZA SILVA":["SAO_JOSE_CAMPOS"],
"SPAULO TORQUATO":["SAO_JOSE_CAMPOS"],
"MILTON VEIGA MARTINS JUNIOR":["SAO_JOSE_CAMPOS"],
"VINICIUS ANTONIO MARTINS":["SANTO_ANDRE"],
"JOSE ANTONIO DEL BIANCHI":["SAO_CARLOS"],
"BRUNO GABRIEL CECCONELLO":["JUNDIAI"],
"LUCAS RODRIGUES":["SOROCABA"],
"CLEITON":["SOROCABA"],
"JOAO BATISTA CAGNIN":["LIMEIRA"],
"RENATO PEDROSA JUNIOR":["ITATIBA_RENATO"],
"MARCELO ALVES MARIANO":["ITU"],
"ANDREY AMORIM DOS SANTOS":["PIRACICABA"],
"RICARDO DO NASCIMENTO CHAGAS":["INDAIATUBA"]

};

/* =====================================================
ROTAS SALVAS
===================================================== */

function obterRotas(){

try{

return JSON.parse(
localStorage.getItem(ROTAS_KEY)
)||{};

}catch(e){

return {};

}

}

function salvarRotas(rotas){

localStorage.setItem(
ROTAS_KEY,
JSON.stringify(rotas)
);

}

function obterConfigMotoristas(){

    try{

        return JSON.parse(
            localStorage.getItem(CONFIG_MOTORISTAS_KEY)
        ) || {};

    }catch(e){

        return {};

    }

}

function salvarConfigMotoristas(config){

    localStorage.setItem(
        CONFIG_MOTORISTAS_KEY,
        JSON.stringify(config)
    );

}

function obterMotoristaConfigurado(m){

    const configs = obterConfigMotoristas();

    const config = configs[m.nome];

    if(!config)
        return m;

    return {
        ...m,
        nome: config.nome || m.nome,
        placa: config.placa ?? m.placa,
        conjunto: config.conjunto ?? m.conjunto,
        cnpj: config.cnpj ?? m.cnpj,
        praca: config.praca || m.praca
    };

}


// =====================================================
// ROTAS SALVAS
// =====================================================

function obterRotaMotorista(nome){

const salvas=
obterRotas();

if(
Object.prototype.hasOwnProperty.call(
salvas,
nome
)
){

return Array.isArray(
salvas[nome]
)
?
salvas[nome]
:
[];

}

return rotasMotoristas[nome]||[];

}

function obterPracaAtual(m){

const rotas=
obterRotaMotorista(
m.nome
);

if(!rotas.length){

return m.praca;

}

const primeiraRota=
rotas[0];

if(
primeiraRota===
"BRASILIA"
){

return "BRASILIA";

}

if(
primeiraRota===
"SAO_PAULO"||
primeiraRota===
"SAO_PAULO_ALPHAVILLE"
){

return "SAO PAULO";

}

return "INTERIOR";

}

function nomeBonitoRota(nome){

return String(nome||"")
.replace(/_/g," ");

}

/* =====================================================
PENDÊNCIAS DE ROTA
===================================================== */

function salvarMotoristaPendente(m){

localStorage.setItem(
MOTORISTA_PENDENTE_KEY,
JSON.stringify(m)
);

}

function obterMotoristaPendente(){

try{

return JSON.parse(
localStorage.getItem(
MOTORISTA_PENDENTE_KEY
)
);

}catch(e){

return null;

}

}

function limparMotoristaPendente(){

localStorage.removeItem(
MOTORISTA_PENDENTE_KEY
);

}

function salvarRotaPendente(index){

localStorage.setItem(
ROTA_PENDENTE_KEY,
String(index)
);

}

function obterRotaPendente(){

const valor=
localStorage.getItem(
ROTA_PENDENTE_KEY
);

return valor===null
?
0
:
Number(valor);

}

function limparRotaPendente(){

localStorage.removeItem(
ROTA_PENDENTE_KEY
);

}

/* =====================================================
FUNÇÕES BÁSICAS
===================================================== */

const esperar=
ms=>
new Promise(
resolve=>
setTimeout(
resolve,
ms
)
);

function normalizar(valor){

return String(valor||"")
.toUpperCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.replace(/\s+/g," ")
.trim();

}

async function esperarElemento(
seletor,
tempo=15000
){

const inicio=
Date.now();

while(
Date.now()-inicio<tempo
){

const elemento=
document.querySelector(
seletor
);

if(elemento)
return elemento;

await esperar(50);

}

return null;

}

async function esperarOpcoes(
seletor,
tempo=15000
){

const inicio=
Date.now();

while(
Date.now()-inicio<tempo
){

const campo=
document.querySelector(
seletor
);

if(
campo&&
campo.options&&
campo.options.length>1
)
return campo;

await esperar(100);

}

return null;

}

function encontrarOpcaoPorTexto(campo,texto){

const alvo=
normalizar(
texto
);

const opcoes=
Array.from(
campo.options
);

let opcao=
opcoes.find(
o=>
normalizar(
o.textContent
)===
alvo
);

if(opcao)
return opcao;

opcao=
opcoes.find(
o=>
normalizar(
o.textContent
).includes(
alvo
)
);

if(opcao)
return opcao;

opcao=
opcoes.find(
o=>
alvo.includes(
normalizar(
o.textContent
)
)
);

return opcao||null;

}

async function esperarOpcaoPorTexto(
seletor,
texto,
tempo=15000
){

const inicio=
Date.now();

while(
Date.now()-inicio<tempo
){

const campo=
document.querySelector(
seletor
);

if(
campo&&
campo.options&&
campo.options.length>1
){

const opcao=
encontrarOpcaoPorTexto(
campo,
texto
);

if(opcao){

return {
campo,
opcao
};

}

}

await esperar(100);

}

return null;

}

async function esperarOpcaoPorId(
seletor,
id,
tempo=15000
){

const inicio=
Date.now();

while(
Date.now()-inicio<tempo
){

const campo=
document.querySelector(
seletor
);

if(
campo&&
campo.options&&
campo.options.length>1
){

const opcao=
Array.from(
campo.options
)
.find(
o=>
String(o.value).trim()===
String(id).trim()
);

if(opcao){

return {
campo,
opcao
};

}

}

await esperar(100);

}

return null;

}

function preencherCampo(
seletor,
valor
){

const campo=
document.querySelector(
seletor
);

if(!campo)
throw new Error(
"Campo não encontrado: "+
seletor
);

campo.focus();

const proto=
campo instanceof HTMLSelectElement
?
HTMLSelectElement.prototype
:
HTMLInputElement.prototype;

const setter=
Object.getOwnPropertyDescriptor(
proto,
"value"
)?.set;

if(setter)
setter.call(
campo,
String(valor)
);
else
campo.value=
String(valor);

campo.dispatchEvent(
new Event(
"input",
{
bubbles:true
}
)
);

campo.dispatchEvent(
new Event(
"change",
{
bubbles:true
}
)
);

campo.dispatchEvent(
new Event(
"blur",
{
bubbles:true
}
)
);

return campo;

}

function selecionarSelect(
seletor,
valor
){

const campo=
document.querySelector(
seletor
);

if(!campo)
throw new Error(
"Select não encontrado: "+
seletor
);

const opcao=
Array.from(
campo.options
)
.find(
o=>
String(o.value).trim()===
String(valor).trim()
);

if(!opcao)
throw new Error(
"Opção "+
valor+
" não encontrada em "+
seletor
);

campo.focus();

campo.value=
opcao.value;

campo.dispatchEvent(
new Event(
"input",
{
bubbles:true
}
)
);

campo.dispatchEvent(
new Event(
"change",
{
bubbles:true
}
)
);

return campo;

}

/* =====================================================
LOG / STATUS
===================================================== */

function log(msg){

const area=
document.querySelector(
"#pcpLog"
);

if(!area)
return;

const linha=
document.createElement(
"div"
);

linha.textContent=
new Date().toLocaleTimeString()+
" - "+
msg;

area.appendChild(
linha
);

area.scrollTop=
area.scrollHeight;

}

function status(
msg,
tipo=""
){

const area=
document.querySelector(
"#pcpStatus"
);

if(area){

area.textContent=
msg;

area.className=
tipo;

}

}

function limparLog(){

const area=
document.querySelector(
"#pcpLog"
);

if(area)
area.innerHTML="";

}

/* =====================================================
ÚLTIMO MOTORISTA / FILTRO
===================================================== */

function salvarUltimoMotorista(m){

localStorage.setItem(
ULTIMO_MOTORISTA_KEY,
m.nome
);

}

function obterUltimoMotorista(){

return localStorage.getItem(
ULTIMO_MOTORISTA_KEY
);

}

function salvarUltimoFiltro(filtro){

localStorage.setItem(
ULTIMO_FILTRO_KEY,
filtro
);

}

function obterUltimoFiltro(){

return localStorage.getItem(
ULTIMO_FILTRO_KEY
)||
"TODOS";

}

function selecionarUltimoMotoristaNaLista(){

const ultimo=
obterUltimoMotorista();

if(!ultimo)
return;

const caixas=
document.querySelectorAll(
".pcpMotorista"
);

for(
const caixa
of caixas
){

const nome=
caixa.querySelector(
".nome"
);

if(
nome&&
normalizar(
nome.textContent
)===
normalizar(
ultimo
)
){

caixa.classList.add(
"pcpMotoristaSelecionado"
);

if(
m.nome === ultimo
){

caixaUltimo = caixa;

}

const lista=
document.querySelector(
"#pcpLista"
);

if(lista){

const topo=
caixa.offsetTop-
(lista.clientHeight/2)+
(caixa.clientHeight/2);

lista.scrollTo({

top:topo,

behavior:"smooth"

});

}

setTimeout(
()=>{

caixa.classList.remove(
"pcpMotoristaSelecionado"
);

},
3000
);

break;

}

}

}

/* =====================================================
PEDÁGIO
===================================================== */

async function preencherFilial(){

const campo=
await esperarElemento(
'select[name="Filial"]'
);

if(!campo)
throw new Error(
"Select Filial não encontrado"
);

selecionarSelect(
'select[name="Filial"]',
FILIAL
);

await esperar(100);

log(
"✅ Filial 001 - MATRIZ selecionada"
);

}

async function selecionarMotorista(m){

const campo=
await esperarElemento(
'input[name="CPFNomeMotorista"]'
);

if(!campo)
throw new Error(
"Campo do motorista não encontrado"
);

preencherCampo(
'input[name="CPFNomeMotorista"]',
m.nome
);

const validar=
await esperarElemento(
'input[name="CPFNomeValidar"]'
);

if(!validar)
throw new Error(
"Botão de validar motorista não encontrado"
);

validar.click();

const lista=
await esperarOpcoes(
'select[name="CPFMotorista"]'
);

if(!lista)
throw new Error(
"Lista de motoristas não carregou"
);

const nome=
normalizar(
m.nome
);

const encontrado=
Array.from(
lista.options
)
.find(
option=>{

const texto=
normalizar(
option.textContent
);

return(
texto===nome||
texto.includes(nome)||
nome.includes(texto)
);

}
);

if(!encontrado)
throw new Error(
"Motorista não encontrado"
);

lista.value=
encontrado.value;

lista.dispatchEvent(
new Event(
"change",
{
bubbles:true
}
)
);

await esperar(100);

log(
"✅ Motorista selecionado"
);

}

async function selecionarTransportador(m){

const campo=
await esperarElemento(
'input[name="CPFCNPJNomeTransportador"]'
);

if(!campo)
throw new Error(
"Campo da transportadora não encontrado"
);

preencherCampo(
'input[name="CPFCNPJNomeTransportador"]',
m.cnpj
);

const validar=
await esperarElemento(
'input[name="TransportadorValidar"]'
);

if(!validar)
throw new Error(
"Botão da transportadora não encontrado"
);

validar.click();

await esperar(200);

const lista=
document.querySelector(
'select[name="CPFCNPJTransportador"]'
);

if(lista){

const opcao=
Array.from(
lista.options
)
.find(
o=>
String(o.value)!=="0"
);

if(opcao){

lista.value=
opcao.value;

lista.dispatchEvent(
new Event(
"change",
{
bubbles:true
}
)
);

}

}

log(
"✅ Transportadora validada"
);

}

async function preencherVeiculos(m){

const placa=
await esperarElemento(
'input[name="PlacaVeiculoTag"]'
);

if(!placa)
throw new Error(
"Campo da placa não encontrado"
);

preencherCampo(
'input[name="PlacaVeiculoTag"]',
m.placa
);

log(
"🚛 Placa preenchida: "+
m.placa
);

const validar=
await esperarElemento(
'input[name="PlacaVeiculoPedagioValidar"]'
);

if(!validar)
throw new Error(
"Validador da placa não encontrado"
);

validar.click();

await esperar(200);

log(
"✅ Placa validada: "+
m.placa
);

if(m.conjunto){

const carreta=
document.querySelector(
'input[name="PlacaCarreta"]'
)||
document.querySelector(
"#PlacaCarreta"
);

if(carreta){

const seletor=
carreta.name
?
'input[name="PlacaCarreta"]'
:
"#PlacaCarreta";

preencherCampo(
seletor,
m.conjunto
);

const validarCarreta=
document.querySelector(
'input[name="PlacaCarretaValidar"]'
);

if(validarCarreta){

validarCarreta.click();

await esperar(200);

log(
"✅ Carreta validada: "+
m.conjunto
);

}

}

}

}

async function preencherDocumento(){

const numero=
await esperarElemento(
'input[name="NumeroDocumento"]'
);

const serie=
await esperarElemento(
'input[name="SerieDocumento"]'
);

const filialDocumento=
await esperarElemento(
'select[name="FilialDocumento"]'
);

if(
!numero||
!serie||
!filialDocumento
)
throw new Error(
"Campos do documento não encontrados"
);

preencherCampo(
'input[name="NumeroDocumento"]',
"150000000"
);

preencherCampo(
'input[name="SerieDocumento"]',
"000"
);

filialDocumento.value=
"001";

filialDocumento.dispatchEvent(
new Event(
"change",
{
bubbles:true
}
)
);

await esperar(200);

log(
"📄 Documento preenchido"
);

}

async function adicionarDocumento(){

const botao=
await esperarElemento(
'input[name="Adiciona"]'
);

if(!botao)
throw new Error(
"Botão Adiciona não encontrado"
);

const filial=
document.querySelector(
'select[name="FilialDocumento"]'
);

if(!filial)
throw new Error(
"FilialDocumento não encontrado"
);

filial.value=
"001";

filial.dispatchEvent(
new Event(
"change",
{
bubbles:true
}
)
);

await esperar(200);

botao.click();

await esperar(500);

log(
"✅ Documento adicionado"
);

}

async function confirmar(){

const filial=
document.querySelector(
'select[name="FilialDocumento"]'
);

if(filial){

filial.value=
"001";

filial.dispatchEvent(
new Event(
"change",
{
bubbles:true
}
)
);

await esperar(200);

}

const botao=
await esperarElemento(
'input[name="Conf"]'
);

if(!botao)
throw new Error(
"Botão Confirma não encontrado"
);


// VALIDA PEDÁGIO ELETRÔNICO
const botoesValidacao = [
    'input[value*="Validar"]',
    'input[name*="Validar"]',
    'button'
];

for(const seletor of botoesValidacao){

    const btn = document.querySelector(seletor);

    if(btn){

        const texto =
        (btn.value || btn.innerText || "")
        .toUpperCase();

        if(
            texto.includes("VALIDAR") ||
            texto.includes("CARGA")
        ){

            log("🔄 Validando informações de carga...");
            btn.click();

            await esperar(500);

            break;
        }

    }

}
await esperar(1000);

// tenta confirmar várias vezes
for(let i = 0; i < 3; i++){

    botao.click();

    await esperar(1500);

    const erro = document.body.innerText.includes(
        "Favor validar as informações de carga"
    );

    if(!erro){
        log("🎉 Viagem confirmada");
        break;
    }

    log("⚠️ Repom pediu validação, tentando novamente...");
}


}

/* =====================================================
AUTOMÁTICO DE ROTA
===================================================== */

async function selecionarCidade(rota){

    const cidade = await esperarElemento("#CidadeOri");

    if(!cidade)
        throw new Error("Campo CidadeOri não encontrado");


    status(
        "📍 Selecionando cidade...",
        "executando"
    );


    if(String(cidade.value) !== String(rota.cidadeId)){

        cidade.value = String(rota.cidadeId);

        cidade.dispatchEvent(
            new Event(
                "input",
                {bubbles:true}
            )
        );

        cidade.dispatchEvent(
            new Event(
                "change",
                {bubbles:true}
            )
        );


const listaRot = document.querySelector("#ListaRot");

if(listaRot){
    listaRot.click();
}


    }


    await esperarOpcoes(
        "#Roteiros",
        20000
    );


    status(
        "✅ Cidade selecionada",
        "sucesso"
    );


    log(
        "📍 Cidade OK: "+rota.cidadeId
    );

}



async function selecionarRoteiro(rota){

    const resultado = await esperarOpcaoPorId(
        "#Roteiros",
        rota.roteiroId,
        20000
    );

    if(!resultado)
        throw new Error("Roteiro não encontrado: " + rota.roteiroId);

    resultado.campo.value = resultado.opcao.value;
    resultado.campo.dispatchEvent(new Event("change",{bubbles:true}));

    await esperar(300);

    log("✅ Roteiro selecionado");
}

async function selecionarPercurso(rota){

    if(!rota.percursoId) return;

await esperarOpcoes("#Percursos", 20000);

const campo = document.querySelector("#Percursos");

    campo.value = String(rota.percursoId);

    campo.dispatchEvent(new Event("input",{bubbles:true}));
    campo.dispatchEvent(new Event("change",{bubbles:true}));

    await esperar(100);

    const btnConfirma =
        document.querySelector("#Confirmar") ||
        document.querySelector("input[value='Confirma']") ||
        document.querySelector("input[value='Confirmar']");

    if(btnConfirma){
        btnConfirma.click();
        await esperar(1000);
    }

    log("✅ Percurso confirmado");
}

/* =====================================================
INICIAR FLUXO DE ROTA
===================================================== */

function iniciarFluxoRota(m){

const rotas=
obterRotaMotorista(
m.nome
);

if(!rotas.length){

alert(
"Não existe rota configurada para "+
m.nome
);

return;

}

salvarUltimoMotorista(m);

salvarMotoristaPendente(m);

salvarRotaPendente(0);

location.href=
"https://www.repom.com.br/Express/ValePedagio/Viagem/ViagemRoteiro.asp";

}

/* =====================================================
EXECUTAR ROTAS
===================================================== */

async function executarRotas(m){

if(executandoRota)
return;

const rotas=
obterRotaMotorista(
m.nome
);

if(!rotas.length){

alert(
"Não existe rota configurada para "+
m.nome
);

limparMotoristaPendente();

limparRotaPendente();

return;

}

executandoRota=
true;

try{

const inicio=
obterRotaPendente();

for(
let i=inicio;
i<rotas.length;
i++
){

const nomeRota=
rotas[i];

const rota=
rotasBase[nomeRota];

if(!rota)
throw new Error(
"Rota não encontrada: "+
nomeRota
);

salvarRotaPendente(i);

status(
"🛣️ ROTA "+
(i+1)+
"/"+
rotas.length,
"executando"
);

log(
"🚀 Iniciando: "+
nomeBonitoRota(
nomeRota
)
);

await selecionarCidade(rota);



await selecionarRoteiro(rota);



// Abre a lista de percursos
const btnListaPercurso = document.querySelector("#ListaPerc");

if(btnListaPercurso){
    btnListaPercurso.click();
}

await esperarOpcoes("#Percursos", 5000);

// Seleciona o percurso
await selecionarPercurso(rota);

// Confirma o percurso
const btnConfirma =
    document.querySelector("#Confirmar") ||
    document.querySelector("input[value='Confirma']") ||
    document.querySelector("input[value='Confirmar']");

if(btnConfirma){
    btnConfirma.click();
    await esperar(300);
}


log(
"✅ Rota concluída: "+
nomeBonitoRota(
nomeRota
)
);

if(
i<
rotas.length-1
){

salvarRotaPendente(
i+1
);

await esperar(700);

location.href=
"https://www.repom.com.br/Express/ValePedagio/Viagem/ViagemRoteiro.asp";

return;

}

}

limparRotaPendente();

limparMotoristaPendente();

status(
"✅ TODAS AS ROTAS FINALIZADAS",
"sucesso"
);

log(
"🎉 TODAS AS ROTAS FORAM FINALIZADAS"
);

}catch(e){

console.error(e);

status(
"❌ ERRO: "+
e.message,
"erro"
);

log(
"❌ "+
e.message
);

}finally{

executandoRota=
false;

}

}

/* =====================================================
RETORNO DA ROTA
===================================================== */

async function verificarRetornoRota(){

const m=
obterMotoristaPendente();

if(!m)
return;

const url=
location.href.toLowerCase();

if(
!url.includes(
"viagemroteiro.asp"
)
)
return;

status(
"🛣️ AGUARDANDO PÁGINA DE ROTEIRO...",
"executando"
);

log(
"⏳ Aguardando carregamento dos campos de rota..."
);

const cidade=
await esperarElemento(
"#CidadeOri",
20000
);

if(!cidade){

status(
"❌ Campo CidadeOri não carregou",
"erro"
);

log(
"❌ Não foi encontrado o campo #CidadeOri"
);

return;

}

await esperar(200);

status(
"🛣️ SELECIONANDO ROTA...",
"executando"
);

log(
"🚀 Página de roteiro pronta. Iniciando seleção automática..."
);

executarRotas(m);

}

/* =====================================================
CONFIGURAR ROTAS
===================================================== */

document.addEventListener("click", function(e){

    if(e.target.closest("#pcpFecharRotas")){

        const modal = document.querySelector("#pcpModalRotas");

        if(modal){
            modal.remove();
        }

    }

});

/* =====================================================
CONFIGURAÇÕES COMPLETAS
===================================================== */

function abrirConfiguracaoRotas(){

    /* ================================================
       EVITA ABRIR DOIS MODAIS
    ================================================ */

    const existente =
        document.querySelector("#pcpModalRotas");

    if(existente){

        existente.remove();

        return;

    }


    /* ================================================
       CRIA MODAL
    ================================================ */

    const modal =
        document.createElement("div");

    modal.id =
        "pcpModalRotas";


    modal.innerHTML = `

    <div class="pcpModalInterno">

        <div class="pcpConfigCabecalho">

            <div>

                <h2>
                    ⚙️ CONFIGURAÇÕES DO MOTORISTA
                </h2>

                <span>
                    Gerencie motoristas, veículos e rotas.
                </span>

            </div>


            <button
                id="pcpFecharRotas"
                class="pcpConfigFechar"
                type="button"
            >
                ✕
            </button>

        </div>


        <div class="pcpConfigConteudo">


            <!-- =====================================
                 MOTORISTA
            ====================================== -->

            <div class="pcpConfigSecao">

                <div class="pcpConfigTitulo">

                    <span>1</span>

                    MOTORISTA

                </div>


                <select
                    id="pcpMotoristaRota"
                ></select>


                <button
                    id="pcpNovoMotorista"
                    class="pcpConfigBotaoNovo"
                    type="button"
                >
                    ➕ ADICIONAR NOVO MOTORISTA
                </button>

            </div>



            <!-- =====================================
                 DADOS
            ====================================== -->

            <div class="pcpConfigSecao">

                <div class="pcpConfigTitulo">

                    <span>2</span>

                    DADOS DO VEÍCULO

                </div>


                <div class="pcpConfigCampo">

                    <label>
                        👤 Nome do motorista
                    </label>

                    <input
                        id="pcpConfigNome"
                        autocomplete="off"
                    >

                </div>


                <div class="pcpConfigCampo">

                    <label>
                        🚛 Placa
                    </label>

                    <input
                        id="pcpConfigPlaca"
                        autocomplete="off"
                    >

                </div>


                <div class="pcpConfigCampo">

                    <label>
                        🔗 Carreta / Conjunto
                    </label>

                    <input
                        id="pcpConfigConjunto"
                        autocomplete="off"
                    >

                </div>


                <div class="pcpConfigCampo">

                    <label>
                        🏢 CNPJ
                    </label>

                    <input
                        id="pcpConfigCNPJ"
                        autocomplete="off"
                    >

                </div>


                <div class="pcpConfigCampo">

                    <label>
                        📍 Praça
                    </label>

                    <select
                        id="pcpConfigPraca"
                    >

                        <option value="BRASILIA">
                            BRASÍLIA
                        </option>

                        <option value="SAO PAULO">
                            SÃO PAULO
                        </option>

                        <option value="INTERIOR">
                            INTERIOR
                        </option>

                    </select>

                </div>

            </div>



            <!-- =====================================
                 ROTAS
            ====================================== -->

            <div class="pcpConfigSecao">

                <div class="pcpConfigTitulo">

                    <span>3</span>

                    ROTAS

                </div>


                <div class="pcpConfigCampo">

                    <label>
                        🛣️ Selecionar rota
                    </label>

                    <select
                        id="pcpRotaSelecionar"
                    ></select>

                </div>


                <button
                    id="pcpAdicionarRota"
                    class="pcpConfigBotaoAdicionar"
                    type="button"
                >
                    ➕ ADICIONAR ROTA
                </button>


                <div class="pcpRotasLabel">

                    ROTAS CONFIGURADAS

                </div>


                <div
                    id="pcpRotasAtuais"
                ></div>

            </div>



            <!-- =====================================
                 AÇÕES
            ====================================== -->

            <div class="pcpConfigSecao pcpConfigAcoes">

                <div class="pcpConfigTitulo">

                    <span>4</span>

                    AÇÕES

                </div>


                <button
                    id="pcpSalvarConfig"
                    class="pcpConfigSalvar"
                    type="button"
                >
                    💾 SALVAR CONFIGURAÇÃO
                </button>


                <button
                    id="pcpExportarMotorista"
                    type="button"
                    style="
                        width:100%;
                        height:40px;
                        margin:0 0 8px;
                        border:0;
                        border-radius:7px;
                        background:#e9eaec;
                        color:#333;
                        font-size:11px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    📤 EXPORTAR MOTORISTA
                </button>


                <button
                    id="pcpExcluirMotorista"
                    type="button"
                    style="
                        width:100%;
                        height:40px;
                        margin:0 0 8px;
                        border:0;
                        border-radius:7px;
                        background:#f1dede;
                        color:#a40000;
                        font-size:11px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    🗑️ EXCLUIR MOTORISTA
                </button>


                <button
                    id="pcpRestaurarConfig"
                    class="pcpConfigRestaurar"
                    type="button"
                >
                    ↩️ RESTAURAR PADRÃO
                </button>

            </div>


        </div>

    </div>

    `;


    document.body.appendChild(modal);



    /* ================================================
       ELEMENTOS
    ================================================ */

    const selectMotorista =
        modal.querySelector(
            "#pcpMotoristaRota"
        );


    const selectRota =
        modal.querySelector(
            "#pcpRotaSelecionar"
        );


    const campoNome =
        modal.querySelector(
            "#pcpConfigNome"
        );


    const campoPlaca =
        modal.querySelector(
            "#pcpConfigPlaca"
        );


    const campoConjunto =
        modal.querySelector(
            "#pcpConfigConjunto"
        );


    const campoCNPJ =
        modal.querySelector(
            "#pcpConfigCNPJ"
        );


    const campoPraca =
        modal.querySelector(
            "#pcpConfigPraca"
        );


    const areaRotas =
        modal.querySelector(
            "#pcpRotasAtuais"
        );


    const botaoSalvar =
        modal.querySelector(
            "#pcpSalvarConfig"
        );


    const botaoExcluir =
        modal.querySelector(
            "#pcpExcluirMotorista"
        );


    const botaoRestaurar =
        modal.querySelector(
            "#pcpRestaurarConfig"
        );


    const botaoExportar =
        modal.querySelector(
            "#pcpExportarMotorista"
        );


    const botaoNovo =
        modal.querySelector(
            "#pcpNovoMotorista"
        );



    /* ================================================
       PREENCHE LISTA DE MOTORISTAS
    ================================================ */

    function preencherListaMotoristas(){

        selectMotorista.innerHTML = "";


motoristas =
    obterTodosMotoristas();

motoristas.sort((a, b) =>
    a.nome.localeCompare(
        b.nome,
        "pt-BR",
        { sensitivity: "base" }
    )
);


motoristas.forEach(m=>{

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                m.nome;


            const ehNovo =
                motoristasBase.indexOf(m) === -1;


            option.textContent =
                ehNovo
                ?
                "🆕 " + m.nome
                :
                m.nome;


            selectMotorista.appendChild(
                option
            );

        });

    }



    /* ================================================
       PREENCHE LISTA DE ROTAS
    ================================================ */

Object.keys(rotasBase)
.sort((a, b) =>
    nomeBonitoRota(a).localeCompare(
        nomeBonitoRota(b),
        "pt-BR",
        { sensitivity: "base" }
    )
)
.forEach(nome => {

    const option =
        document.createElement("option");

    option.value =
        nome;

    option.textContent =
        nomeBonitoRota(nome);

    selectRota.appendChild(
        option
    );

});



    /* ================================================
       ESTADO
    ================================================ */

    let rotasAtuais = [];

    let criandoNovo = false;



    /* ================================================
       RENDERIZA ROTAS
    ================================================ */

    function renderRotas(){

        areaRotas.innerHTML = "";


        if(!rotasAtuais.length){

            areaRotas.innerHTML = `

                <div class="pcpSemRotas">

                    Nenhuma rota configurada

                </div>

            `;

            return;

        }


[...rotasAtuais]
.sort((a, b) =>
    nomeBonitoRota(a).localeCompare(
        nomeBonitoRota(b),
        "pt-BR",
        { sensitivity: "base" }
    )
)
.forEach(
    (nome,index)=>{

                const linha =
                    document.createElement(
                        "div"
                    );


                linha.className =
                    "pcpRotaLinha";


                linha.innerHTML = `

                    <div class="pcpRotaNumero">

                        ${index+1}

                    </div>


                    <div class="pcpRotaNome">

                        🛣️
                        ${nomeBonitoRota(nome)}

                    </div>


                    <button
                        type="button"
                        data-index="${index}"
                        class="pcpRotaRemover"
                    >

                        ✕

                    </button>

                `;


                linha
                    .querySelector(
                        ".pcpRotaRemover"
                    )
                    .onclick =
                    function(e){

                        e.preventDefault();
                        e.stopPropagation();


                        rotasAtuais.splice(
                            index,
                            1
                        );


                        renderRotas();

                    };


                areaRotas.appendChild(
                    linha
                );

            }
        );

    }



    /* ================================================
       CARREGAR MOTORISTA
    ================================================ */

    function carregarMotorista(){

        const nomeOriginal =
            selectMotorista.value;


        if(!nomeOriginal)
            return;


        const original =
            motoristas.find(
                m =>
                    m.nome ===
                    nomeOriginal
            );


        if(!original)
            return;


        criandoNovo = false;


        const configurado =
            obterMotoristaConfigurado(
                original
            );


        campoNome.value =
            configurado.nome || "";


        campoPlaca.value =
            configurado.placa || "";


        campoConjunto.value =
            configurado.conjunto || "";


        campoCNPJ.value =
            configurado.cnpj || "";


        campoPraca.value =
            configurado.praca ||
            "INTERIOR";


        rotasAtuais = [
            ...obterRotaMotorista(
                nomeOriginal
            )
        ];


        botaoSalvar.textContent =
            "💾 SALVAR CONFIGURAÇÃO";


        botaoExcluir.style.display =
            motoristasBase.some(
                m =>
                    m.nome ===
                    nomeOriginal
            )
            ?
            "none"
            :
            "block";


        botaoRestaurar.style.display =
            motoristasBase.some(
                m =>
                    m.nome ===
                    nomeOriginal
            )
            ?
            "block"
            :
            "none";


        botaoExportar.style.display =
            "block";


        renderRotas();

    }



    /* ================================================
       NOVO MOTORISTA
    ================================================ */

    function novoMotorista(){

        criandoNovo = true;


        selectMotorista.value = "";


        campoNome.value = "";

        campoPlaca.value = "";

        campoConjunto.value = "";

        campoCNPJ.value = "";

        campoPraca.value =
            "INTERIOR";


        rotasAtuais = [];


        botaoSalvar.textContent =
            "💾 SALVAR NOVO MOTORISTA";


        botaoExcluir.style.display =
            "none";


        botaoRestaurar.style.display =
            "none";


        botaoExportar.style.display =
            "none";


        renderRotas();


        campoNome.focus();

    }



    /* ================================================
       ADICIONAR ROTA
    ================================================ */

    modal
        .querySelector(
            "#pcpAdicionarRota"
        )
        .onclick =
        function(){

            const rota =
                selectRota.value;


            if(!rota)
                return;


            if(
                rotasAtuais.includes(
                    rota
                )
            ){

                alert(
                    "⚠️ Essa rota já está configurada para o motorista."
                );

                return;

            }


            rotasAtuais.push(
                rota
            );


            renderRotas();

        };



    /* ================================================
       SALVAR
    ================================================ */

    botaoSalvar.onclick =
    function(){

        const nome =
            campoNome.value
            .trim()
            .toUpperCase();


        const placa =
            campoPlaca.value
            .trim()
            .toUpperCase();


        const conjunto =
            campoConjunto.value
            .trim()
            .toUpperCase();


        const cnpj =
            campoCNPJ.value
            .trim();


        const praca =
            campoPraca.value;


        /* ============================================
           VALIDAÇÕES
        ============================================ */

        if(!nome){

            alert(
                "❌ Informe o nome do motorista."
            );

            campoNome.focus();

            return;

        }


        if(!placa){

            alert(
                "❌ Informe a placa do veículo."
            );

            campoPlaca.focus();

            return;

        }


        if(!cnpj){

            alert(
                "❌ Informe o CNPJ."
            );

            campoCNPJ.focus();

            return;

        }


        const nomeOriginal =
            criandoNovo
            ?
            null
            :
            selectMotorista.value;



        /* ============================================
           NOVO MOTORISTA
        ============================================ */

        if(criandoNovo){

            const todos =
                obterTodosMotoristas();


            const existe =
                todos.some(
                    m =>
                        normalizar(m.nome) ===
                        normalizar(nome)
                );


            if(existe){

                alert(
                    "❌ Já existe um motorista com esse nome."
                );

                campoNome.focus();

                return;

            }


            const placaExiste =
                todos.some(
                    m =>
                        normalizar(m.placa) ===
                        normalizar(placa)
                );


            if(placaExiste){

                alert(
                    "❌ Essa placa já está cadastrada."
                );

                campoPlaca.focus();

                return;

            }


            const novo = {

                nome:
                    nome,

                placa:
                    placa,

                conjunto:
                    conjunto,

                cnpj:
                    cnpj,

                praca:
                    praca

            };


            const novos =
                obterMotoristasNovos();


            novos.push(
                novo
            );


            salvarMotoristasNovos(
                novos
            );


            /* ========================================
               SALVA ROTAS DO NOVO MOTORISTA
            ======================================== */

            const todasRotas =
                obterRotas();


            todasRotas[
                novo.nome
            ] =
                [
                    ...rotasAtuais
                ];


            salvarRotas(
                todasRotas
            );


            motoristas =
                obterTodosMotoristas();


            alert(
                "✅ NOVO MOTORISTA ADICIONADO!\n\n" +
                novo.nome
            );


            modal.remove();


            renderizarLista();


            return;

        }



        /* ============================================
           MOTORISTA EXISTENTE
        ============================================ */

        const original =
            motoristas.find(
                m =>
                    m.nome ===
                    nomeOriginal
            );


        if(!original)
            return;


        const ehMotoristaNovo =
            !motoristasBase.some(
                m =>
                    m.nome ===
                    nomeOriginal
            );



        /* ============================================
           MOTORISTA NOVO
           EDITA REGISTRO REAL
        ============================================ */

        if(ehMotoristaNovo){

            const novos =
                obterMotoristasNovos();


            const index =
                novos.findIndex(
                    m =>
                        m.nome ===
                        nomeOriginal
                );


            if(index === -1){

                alert(
                    "❌ Motorista não encontrado."
                );

                return;

            }


            const nomeDuplicado =
                novos.some(
                    (m,i)=>
                        i !== index &&
                        normalizar(m.nome) ===
                        normalizar(nome)
                );


            if(nomeDuplicado){

                alert(
                    "❌ Já existe outro motorista com esse nome."
                );

                return;

            }


            const placaDuplicada =
                obterTodosMotoristas()
                .some(
                    m =>
                        m.nome !==
                        nomeOriginal &&
                        normalizar(m.placa) ===
                        normalizar(placa)
                );


            if(placaDuplicada){

                alert(
                    "❌ Essa placa já está cadastrada em outro motorista."
                );

                return;

            }


            novos[index] = {

                nome:
                    nome,

                placa:
                    placa,

                conjunto:
                    conjunto,

                cnpj:
                    cnpj,

                praca:
                    praca

            };


            salvarMotoristasNovos(
                novos
            );


            /* ========================================
               SE MUDOU O NOME,
               MOVE AS ROTAS
            ======================================== */

            const todasRotas =
                obterRotas();


            if(
                nome !==
                nomeOriginal
            ){

                todasRotas[nome] =
                    todasRotas[
                        nomeOriginal
                    ] ||
                    [...rotasAtuais];


                delete todasRotas[
                    nomeOriginal
                ];

            }
            else{

                todasRotas[nome] =
                    [
                        ...rotasAtuais
                    ];

            }


            salvarRotas(
                todasRotas
            );


            motoristas =
                obterTodosMotoristas();


            alert(
                "✅ MOTORISTA ATUALIZADO!"
            );


            modal.remove();


            renderizarLista();


            return;

        }



        /* ============================================
           MOTORISTA BASE
           USA CONFIGURAÇÃO PERSONALIZADA
        ============================================ */

        const configs =
            obterConfigMotoristas();


        configs[
            nomeOriginal
        ] = {

            nome:
                nome,

            placa:
                placa,

            conjunto:
                conjunto,

            cnpj:
                cnpj,

            praca:
                praca

        };


        salvarConfigMotoristas(
            configs
        );


        /* ============================================
           MOVE ROTAS SE O NOME MUDOU
        ============================================ */

        const todasRotas =
            obterRotas();


        if(
            nome !==
            nomeOriginal
        ){

            todasRotas[nome] =
                [
                    ...rotasAtuais
                ];


            delete todasRotas[
                nomeOriginal
            ];

        }
        else{

            todasRotas[
                nomeOriginal
            ] =
                [
                    ...rotasAtuais
                ];

        }


        salvarRotas(
            todasRotas
        );


        motoristas =
            obterTodosMotoristas();


        alert(
            "✅ CONFIGURAÇÃO SALVA!"
        );


        modal.remove();


        renderizarLista();

    };



    /* ================================================
       EXCLUIR MOTORISTA NOVO
    ================================================ */

    botaoExcluir.onclick =
    function(){

        const nome =
            selectMotorista.value;


        if(!nome)
            return;


        const ehBase =
            motoristasBase.some(
                m =>
                    m.nome ===
                    nome
            );


        if(ehBase){

            alert(
                "⚠️ Motoristas originais do script não podem ser excluídos por aqui."
            );

            return;

        }


        const confirmar =
            confirm(
                "🗑️ EXCLUIR MOTORISTA?\n\n" +
                nome +
                "\n\n" +
                "Essa ação removerá o motorista da lista e suas configurações."
            );


        if(!confirmar)
            return;


        /* ============================================
           REMOVE DOS MOTORISTAS NOVOS
        ============================================ */

        const novos =
            obterMotoristasNovos()
            .filter(
                m =>
                    m.nome !==
                    nome
            );


        salvarMotoristasNovos(
            novos
        );


        /* ============================================
           REMOVE ROTAS
        ============================================ */

        const todasRotas =
            obterRotas();


        delete todasRotas[
            nome
        ];


        salvarRotas(
            todasRotas
        );


        /* ============================================
           REMOVE CONFIGURAÇÃO
        ============================================ */

        const configs =
            obterConfigMotoristas();


        delete configs[
            nome
        ];


        salvarConfigMotoristas(
            configs
        );


        motoristas =
            obterTodosMotoristas();


        alert(
            "✅ MOTORISTA EXCLUÍDO!"
        );


        modal.remove();


        renderizarLista();

    };



    /* ================================================
       RESTAURAR MOTORISTA BASE
    ================================================ */

    botaoRestaurar.onclick =
    function(){

        const nome =
            selectMotorista.value;


        if(!nome)
            return;


        const ehBase =
            motoristasBase.some(
                m =>
                    m.nome ===
                    nome
            );


        if(!ehBase){

            alert(
                "⚠️ Esse motorista foi adicionado pelo usuário."
            );

            return;

        }


        const confirmar =
            confirm(
                "↩️ RESTAURAR PADRÃO?\n\n" +
                "Isso apagará as alterações personalizadas de:\n\n" +
                nome
            );


        if(!confirmar)
            return;


        /* ============================================
           REMOVE CONFIGURAÇÃO PERSONALIZADA
        ============================================ */

        const configs =
            obterConfigMotoristas();


        delete configs[
            nome
        ];


        salvarConfigMotoristas(
            configs
        );


        /* ============================================
           REMOVE ROTAS PERSONALIZADAS
        ============================================ */

        const todasRotas =
            obterRotas();


        delete todasRotas[
            nome
        ];


        salvarRotas(
            todasRotas
        );


        alert(
            "↩️ DADOS ORIGINAIS RESTAURADOS!"
        );


        modal.remove();


        renderizarLista();

    };



    /* ================================================
       EXPORTAR MOTORISTA
    ================================================ */

    botaoExportar.onclick =
    async function(){

        const nomeOriginal =
            selectMotorista.value;


        if(!nomeOriginal){

            alert(
                "⚠️ Selecione um motorista."
            );

            return;

        }


        const m =
            obterMotoristaConfigurado(
                motoristas.find(
                    motorista =>
                        motorista.nome ===
                        nomeOriginal
                )
            );


        if(!m)
            return;


        const linha =

            `{nome:"${m.nome}",` +
            `placa:"${m.placa || ""}",` +
            `conjunto:"${m.conjunto || ""}",` +
            `cnpj:"${m.cnpj || ""}",` +
            `praca:"${m.praca || ""}"},`;


        try{

            await navigator.clipboard.writeText(
                linha
            );


            alert(
                "📋 BLOCO COPIADO!\n\n" +
                "Agora é só colar dentro do motoristasBase."
            );


        }catch(e){

            prompt(
                "📋 COPIE O BLOCO ABAIXO:",
                linha
            );

        }

    };



    /* ================================================
       BOTÃO NOVO
    ================================================ */

    botaoNovo.onclick =
    function(){

        novoMotorista();

    };



    /* ================================================
       TROCA MOTORISTA
    ================================================ */

    selectMotorista.onchange =
        function(){

            carregarMotorista();

        };



    /* ================================================
       FECHAR
    ================================================ */

    const btnFechar =
        modal.querySelector(
            "#pcpFecharRotas"
        );


    if(btnFechar){

        btnFechar.onclick =
            function(e){

                e.preventDefault();

                e.stopPropagation();

                modal.remove();

            };

    }



    /* ================================================
       INICIALIZA
    ================================================ */

    preencherListaMotoristas();


    if(
        selectMotorista.options.length
    ){

        selectMotorista.selectedIndex =
            0;


        carregarMotorista();

    }

}

/* =====================================================
ALTERAR ROTA DIRETAMENTE NO MOTORISTA
===================================================== */

function abrirAlteracaoRota(m){

const modal=
document.createElement(
"div"
);

modal.id=
"pcpModalAlterarRota";

modal.innerHTML=`

<style>

#pcpModalAlterarRota{
    position:fixed !important;
    inset:0 !important;
    z-index:999999 !important;

    display:flex !important;
    align-items:center !important;
    justify-content:center !important;

    background:rgba(0,0,0,.55) !important;
}

#pcpModalAlterarRota .pcpModalInterno{
    width:520px !important;
    padding:0 !important;

    background:#1e1e22 !important;
    border:1px solid #38383f !important;
    border-radius:14px !important;

    box-shadow:
        0 20px 60px rgba(0,0,0,.55) !important;

    overflow:hidden !important;
}


/* CABEÇALHO */

#pcpModalAlterarRota .pcpAlterarCabecalho{

    display:flex;
    align-items:center;

    padding:20px 22px;

    border-bottom:1px solid #35353b;
}


#pcpModalAlterarRota .pcpAlterarIcone{

    width:42px;
    height:42px;

    display:flex;
    align-items:center;
    justify-content:center;

    margin-right:14px;

    border-radius:10px;

    background:#6d3fd1;

    color:#fff;

    font-size:22px;

}


#pcpModalAlterarRota .pcpAlterarTitulo{

    flex:1;
}


#pcpModalAlterarRota .pcpAlterarTitulo strong{

    display:block;

    color:#fff;

    font-size:17px;
    font-weight:700;

}


#pcpModalAlterarRota .pcpAlterarTitulo span{

    display:block;

    margin-top:4px;

    color:#a9a9b0;

    font-size:12px;

}


#pcpModalAlterarRota #pcpFecharAlteracaoRota{

    width:34px;
    height:34px;

    border:0;
    border-radius:7px;

    background:transparent;

    color:#aaa;

    font-size:20px;

    cursor:pointer;

}


#pcpModalAlterarRota #pcpFecharAlteracaoRota:hover{

    background:#303037;
    color:#fff;

}


/* CONTEÚDO */

#pcpModalAlterarRota .pcpAlterarConteudo{

    padding:24px 22px 20px;

}


#pcpModalAlterarRota .pcpAlterarLabel{

    display:block;

    margin-bottom:8px;

    color:#aaa;

    font-size:11px;
    font-weight:700;

    letter-spacing:.5px;

}


#pcpModalAlterarRota #pcpNovaRota{

    width:100%;
    height:48px;

    box-sizing:border-box;

    padding:0 14px;

    border:1px solid #55555f;
    border-radius:9px;

    outline:none;

    background:#29292f;

    color:#fff;

    font-size:14px;

    cursor:pointer;

}


#pcpModalAlterarRota #pcpNovaRota:focus{

    border-color:#7b4de0;

    box-shadow:
        0 0 0 2px rgba(123,77,224,.18);

}


/* RODAPÉ */

#pcpModalAlterarRota .pcpAlterarRodape{

    display:flex;

    gap:10px;

    padding:16px 22px 20px;

    border-top:1px solid #35353b;

}


#pcpModalAlterarRota .pcpAlterarRodape button{

    height:42px;

    border-radius:8px;

    font-size:11px;
    font-weight:700;

    cursor:pointer;

}


#pcpModalAlterarRota #pcpSalvarNovaRota{

    flex:1;

    border:0;

    background:#6d3fd1;

    color:#fff;

}


#pcpModalAlterarRota #pcpSalvarNovaRota:hover{

    background:#7d4be5;

}


#pcpModalAlterarRota #pcpRemoverRotaPersonalizada{

    padding:0 18px;

    border:1px solid #4a4a52;

    background:#29292f;

    color:#ddd;

}


#pcpModalAlterarRota #pcpRemoverRotaPersonalizada:hover{

    background:#33333a;

}

</style>


<div class="pcpModalInterno">

    <div class="pcpAlterarCabecalho">

        <div class="pcpAlterarIcone">
            ⚙️
        </div>


        <div class="pcpAlterarTitulo">

            <strong>
                ALTERAR ROTA
            </strong>

            <span>
                ${m.nome}
            </span>

        </div>


        <button
            id="pcpFecharAlteracaoRota"
            type="button"
        >
            ✕
        </button>

    </div>


    <div class="pcpAlterarConteudo">

        <label class="pcpAlterarLabel">
            NOVA ROTA
        </label>

        <select id="pcpNovaRota"></select>

    </div>


    <div class="pcpAlterarRodape">

        <button
            id="pcpRemoverRotaPersonalizada"
            type="button"
        >
            ↩️ ROTA PADRÃO
        </button>


        <button
            id="pcpSalvarNovaRota"
            type="button"
        >
            💾 SALVAR ROTA
        </button>

    </div>

</div>

`;
document.body.appendChild(
modal
);

const select=
modal.querySelector(
"#pcpNovaRota"
);

Object.keys(
rotasBase
)
.sort(
(a,b)=>
nomeBonitoRota(a).localeCompare(
nomeBonitoRota(b),
"pt-BR",
{
    sensitivity:"base"
}
)
)
.forEach(
nome=>{

const option=
document.createElement(
"option"
);

option.value=
nome;

option.textContent=
nomeBonitoRota(
nome
);

select.appendChild(
option
);

}
);

const rotaAtual=
obterRotaMotorista(
m.nome
);

if(
rotaAtual.length
){

select.value=
rotaAtual[0];

}

modal
.querySelector(
"#pcpSalvarNovaRota"
)
.onclick=()=>{

const todas=
obterRotas();

todas[
m.nome
]=[
select.value
];

salvarRotas(
todas
);

alert(
"✅ Rota de "+
m.nome+
" alterada para "+
nomeBonitoRota(
select.value
)
);

modal.remove();

renderizarLista();

};

modal
.querySelector(
"#pcpRemoverRotaPersonalizada"
)
.onclick=()=>{

const todas=
obterRotas();

delete todas[
m.nome
];

salvarRotas(
todas
);

alert(
"↩️ Rota padrão do script restaurada para "+
m.nome
);

modal.remove();

renderizarLista();

};

modal
.querySelector(
"#pcpFecharAlteracaoRota"
)
.onclick=
()=>modal.remove();

}

/* =====================================================
ESTILO
===================================================== */

const style=
document.createElement(
"style"
);

style.textContent=`

#pcpSistema{

position:fixed;
top:40px;
right:15px;
width:470px;
height:calc(100vh - 55px);
background:#f4f6f8;
border:1px solid #ccc;
border-radius:14px;
box-shadow:0 10px 35px rgba(0,0,0,.3);
z-index:2147483647;
font-family:Arial;
overflow:hidden;
display:flex;
flex-direction:column;

}

#pcpCabecalho{

padding:15px;
background:linear-gradient(
135deg,
#ff6500,
#ff8a3d
);
color:white;

}

#pcpCabecalho h2{

margin:0;
font-size:18px;

}

#pcpFiliais{

display:flex;
gap:5px;
padding:8px;
background:white;

}

.pcpFiltro{

flex:1;
padding:8px 2px;
border:1px solid #ddd;
border-radius:6px;
cursor:pointer;
font-size:10px;
font-weight:bold;

}

.pcpFiltro.ativo{

background:#ff6500;
color:white;

}

#pcpBusca{

width:calc(100% - 20px);
margin:10px;
padding:10px;
box-sizing:border-box;
border:1px solid #ccc;
border-radius:8px;

}

#pcpStatus{

margin:0 10px 8px;
padding:9px;
border-radius:7px;
background:#e9ecef;
font-size:11px;
font-weight:bold;

}

#pcpStatus.executando{

background:#fff3cd;

}

#pcpStatus.sucesso{

background:#d1e7dd;

}

#pcpStatus.erro{

background:#f8d7da;

}

#pcpLista{

flex:1;

min-height:0;

height:auto;

overflow-y:auto;

overflow-x:hidden;

padding:6px 10px;

padding-bottom:260px;

box-sizing:border-box;

scroll-behavior:smooth;

}

.pcpMotorista{

display:block;
width:100%;
margin-bottom:8px;
padding:12px;
text-align:left;
background:white;
border:1px solid #ddd;
border-radius:9px;
box-sizing:border-box;

}

.pcpMotorista .nome{

font-weight:bold;
font-size:12px;
margin-bottom:5px;

}

.pcpMotorista div{

font-size:11px;
line-height:1.6;

}

.pcpMotorista.ultimoMotorista{

border:2px solid #ff6500;
background:#fff3e8;

}

.pcpMotorista.pcpMotoristaSelecionado{

border:3px solid #ff6500;
background:#fff3e8;
box-shadow:0 0 0 3px rgba(255,101,0,.18);

}

.pcpAcoesMotorista{

display:flex;
gap:5px;
margin-top:8px;
flex-wrap:wrap;

}

.pcpBotaoAcao{

flex:1 1 0;
min-width:0;
padding:7px;
border:0;
border-radius:6px;
cursor:pointer;
font-weight:bold;
font-size:10px;

}

.pcpBotaoPedagio{

background:#ff6500;
color:white;

}

.pcpBotaoRota{

background:#198754;
color:white;

}

.pcpBotaoAlterarRota{

background:#6f42c1;
color:white;

}

.pcpRotaAtual{

margin-top:6px;
padding:6px;
border-radius:6px;
background:#eef2f7;
font-size:10px !important;
font-weight:bold;

}

#pcpLog{

position:relative;

width:calc(100% - 20px);

height:40px;

margin:5px 10px 8px;

padding:6px;

box-sizing:border-box;

background:#202124;

color:white;

border-radius:8px;

overflow-y:auto;

font-size:9px;

flex-shrink:0;

}

#pcpBotaoConfigRotas{

position:absolute;
top:10px;
right:10px;
padding:6px 10px;
border:0;
border-radius:6px;
cursor:pointer;
font-weight:bold;

}

#pcpSistema.pcpOculto{

display:none !important;

}

#pcpModalRotas,
#pcpModalAlterarRota{

position:fixed;

inset:0;

background:rgba(0,0,0,.68);

z-index:2147483648;

display:flex;

align-items:center;

justify-content:center;

padding:20px;

box-sizing:border-box;

}


#pcpModalRotas .pcpModalInterno{

width:560px;

max-width:100%;

max-height:88vh;

overflow:hidden;

background:#f5f6f8;

border-radius:16px;

box-shadow:
0 20px 60px rgba(0,0,0,.35);

font-family:Arial,sans-serif;

padding:0;

}


.pcpConfigCabecalho{

display:flex;

align-items:center;

justify-content:space-between;

padding:20px 22px;

background:#202124;

color:white;

}


.pcpConfigCabecalho h2{

margin:0 0 4px;

font-size:17px;

}


.pcpConfigCabecalho span{

font-size:11px;

color:#bfc3c8;

}


.pcpConfigFechar{

width:34px;

height:34px;

padding:0 !important;

margin:0 !important;

border:0;

border-radius:8px;

background:#383a3e;

color:white;

font-size:17px;

cursor:pointer;

}


.pcpConfigFechar:hover{

background:#55585d;

}


.pcpConfigConteudo{

padding:18px 20px;

max-height:calc(88vh - 80px);

overflow-y:auto;

box-sizing:border-box;

}


.pcpConfigSecao{

background:white;

border:1px solid #ddd;

border-radius:11px;

padding:15px;

margin-bottom:14px;

}


.pcpConfigTitulo{

display:flex;

align-items:center;

gap:9px;

font-size:12px;

font-weight:bold;

color:#303236;

margin-bottom:12px;

}


.pcpConfigTitulo span{

display:flex;

align-items:center;

justify-content:center;

width:23px;

height:23px;

border-radius:50%;

background:#202124;

color:white;

font-size:11px;

}


.pcpConfigCampo{

display:flex;

flex-direction:column;

gap:5px;

margin-bottom:11px;

}


.pcpConfigCampo:last-child{

margin-bottom:0;

}


.pcpConfigCampo label{

font-size:11px;

font-weight:bold;

color:#555;

}


.pcpModalInterno select,
.pcpModalInterno input{

width:100%;

height:38px;

padding:0 11px;

box-sizing:border-box;

border:1px solid #ccc;

border-radius:7px;

background:white;

font-size:12px;

outline:none;

}


.pcpModalInterno select:focus,
.pcpModalInterno input:focus{

border-color:#777;

box-shadow:0 0 0 2px rgba(0,0,0,.07);

}

.pcpConfigBotaoNovo{

width:100%;

height:38px;

margin-top:10px;

border:1px solid #202124;

border-radius:7px;

background:white;

color:#202124;

font-size:11px;

font-weight:bold;

cursor:pointer;

}

.pcpConfigBotaoNovo:hover{

background:#f0f0f0;

}

.pcpConfigBotaoAdicionar{

width:100%;

height:38px;

margin:12px 0 0 !important;

border:0;

border-radius:7px;

background:#202124;

color:white;

font-size:11px;

cursor:pointer;

}


.pcpConfigBotaoAdicionar:hover{

background:#333;

}


.pcpRotasLabel{

margin-top:16px;

margin-bottom:7px;

font-size:10px;

font-weight:bold;

color:#777;

}


#pcpRotasAtuais{

margin:0;

padding:0;

background:transparent;

border-radius:0;

}


.pcpRotaLinha{

display:flex;

align-items:center;

gap:9px;

padding:9px 10px;

margin-bottom:6px;

background:#f7f7f7;

border:1px solid #ddd;

border-radius:7px;

box-sizing:border-box;

}


.pcpRotaNumero{

width:23px;

height:23px;

display:flex;

align-items:center;

justify-content:center;

border-radius:50%;

background:#202124;

color:white;

font-size:10px;

font-weight:bold;

flex-shrink:0;

}


.pcpRotaNome{

flex:1;

font-size:11px;

font-weight:bold;

color:#333;

}


.pcpRotaRemover{

width:28px;

height:28px;

padding:0 !important;

margin:0 !important;

border:0;

border-radius:6px;

background:#f1dede;

color:#a40000;

font-size:12px;

cursor:pointer;

}


.pcpRotaRemover:hover{

background:#e8c4c4;

}


.pcpSemRotas{

padding:14px;

text-align:center;

color:#888;

font-size:11px;

background:#f7f7f7;

border:1px dashed #ccc;

border-radius:7px;

}


.pcpConfigAcoes{

margin-bottom:0;

}


.pcpConfigAcoes button{

width:100%;

height:40px;

margin:0 0 8px !important;

border:0;

border-radius:7px;

font-size:11px;

font-weight:bold;

cursor:pointer;

}


.pcpConfigAcoes button:last-child{

margin-bottom:0 !important;

}


.pcpConfigSalvar{

background:#202124;

color:white;

}


.pcpConfigSalvar:hover{

background:#333;

}


.pcpConfigRestaurar{

background:#e9eaec;

color:#333;

}


.pcpConfigRestaurar:hover{

background:#ddd;

}

#pcpBotaoRoteiroComprovante{

padding:10px 16px;
margin-left:10px;
border:0;
border-radius:8px;
background:#ff6500;
color:white;
font-weight:bold;
font-size:13px;
cursor:pointer;
box-shadow:0 3px 10px rgba(0,0,0,.35);

}

#pcpBotaoRoteiroComprovante:hover{

background:#e95700;
transform:scale(1.04);

}

`;

document.head.appendChild(
style
);

/* =====================================================
PAINEL
===================================================== */

const painel=
document.createElement(
"div"
);

painel.id=
"pcpSistema";

painel.innerHTML=`

<div id="pcpCabecalho">

<h2>
🚛 PCP REPOM AUTO V10
</h2>

<small id="pcpResumo">
Carregando...
</small>

<button id="pcpBotaoConfigRotas">
⚙️ CONFIGURAÇÕES
</button>

</div>

<div id="pcpFiliais">

<button
class="pcpFiltro ativo"
data-praca="TODOS"
>

TODOS </button>

<button
class="pcpFiltro"
data-praca="BRASILIA"
>

BRASÍLIA </button>

<button
class="pcpFiltro"
data-praca="SAO PAULO"
>

SÃO PAULO </button>

<button
class="pcpFiltro"
data-praca="INTERIOR"
>

INTERIOR </button>

<button
class="pcpFiltro"
data-praca="CARRETAS_INTERIOR"
>

🚛 CARRETAS INT. </button>

</div>

<input
id="pcpBusca"
placeholder="🔎 Buscar motorista, placa ou carreta..."
>

<div id="pcpStatus">
Pronto para iniciar 🚛
</div>


<div id="pcpLista"></div>

<div id="pcpLog"></div>

`;

document.body.appendChild(
painel
);

// =====================================================
// 🖱️ PAINEL FLUTUANTE - ARRASTAR PELA TELA
// =====================================================

(function tornarPainelArrastavel(){

    const cabecalho = document.querySelector("#pcpCabecalho");

    if(!cabecalho || !painel)
        return;

    let arrastando = false;
    let inicioX = 0;
    let inicioY = 0;
    let posInicialX = 0;
    let posInicialY = 0;

    cabecalho.style.cursor = "move";

    cabecalho.addEventListener("mousedown", function(e){

        // Não inicia arraste ao clicar em botão
        if(e.target.closest("button"))
            return;

        arrastando = true;

        const rect = painel.getBoundingClientRect();

        inicioX = e.clientX;
        inicioY = e.clientY;

        posInicialX = rect.left;
        posInicialY = rect.top;

        painel.style.right = "auto";
        painel.style.bottom = "auto";
        painel.style.left = posInicialX + "px";
        painel.style.top = posInicialY + "px";

        e.preventDefault();

    });

    document.addEventListener("mousemove", function(e){

        if(!arrastando)
            return;

        const novaX =
            posInicialX +
            (e.clientX - inicioX);

        const novaY =
            posInicialY +
            (e.clientY - inicioY);

        const limiteX =
            window.innerWidth -
            painel.offsetWidth;

        const limiteY =
            window.innerHeight -
            50;

        painel.style.left =
            Math.max(
                0,
                Math.min(novaX, limiteX)
            ) + "px";

        painel.style.top =
            Math.max(
                0,
                Math.min(novaY, limiteY)
            ) + "px";

    });

    document.addEventListener("mouseup", function(){

        arrastando = false;

    });

})();

setTimeout(()=>{

const btn =
document.querySelector("#pcpBotaoConfigRotas");

if(btn){

btn.onclick = abrirConfiguracaoRotas;

}

},1000);

/* =====================================================
RENDERIZAR LISTA
===================================================== */

function renderizarLista(){

const lista=
document.querySelector(
"#pcpLista"
);

if(!lista)
return;

const resumo =
contarStatus();

const campoResumo =
document.querySelector(
"#pcpResumo"
);

if(campoResumo){

campoResumo.innerHTML =
`
👥 ${resumo.total}
🟢 ${resumo.feitos}
🟡 ${resumo.processo}
🔴 ${resumo.pendentes}
`;

}

const busca=
normalizar(
document.querySelector(
"#pcpBusca"
).value
);

const ultimo=
obterUltimoMotorista();

lista.innerHTML="";


const encontrados=
motoristas.filter(
m=>{

const pracaAtual=
obterPracaAtual(m);

let pracaOk=false;

if(
filtroAtual===
"TODOS"
){

pracaOk=true;

}

else if(
filtroAtual===
"INTERIOR"
){

pracaOk=
pracaAtual===
"INTERIOR"&&
!m.conjunto;

}

else if(
filtroAtual===
"CARRETAS_INTERIOR"
){

pracaOk=
pracaAtual===
"INTERIOR"&&
!!m.conjunto;

}

else{

pracaOk=
pracaAtual===
filtroAtual;

}

const buscaOk=
!busca||
normalizar(
m.nome
).includes(
busca
)||
normalizar(
m.placa
).includes(
busca
)||
normalizar(
m.conjunto
).includes(
busca
);

return(
pracaOk&&
buscaOk
);

}
);

let caixaUltimo=null;

encontrados.forEach(
m=>{

m =
obterMotoristaConfigurado(m);

const caixa=
document.createElement(
"div"
);

caixa.className=
"pcpMotorista";

const statusAtual =
pegarStatusMotorista(
m.nome
);

if(
statusAtual.status===
"feito"
){

caixa.style.borderLeft=
"5px solid green";

}
else if(
statusAtual.status===
"processando"
){

caixa.style.borderLeft=
"5px solid orange";

}
else{

caixa.style.borderLeft=
"5px solid red";

}

if(
m.nome===
ultimo
){

caixa.classList.add(
"ultimoMotorista"
);

caixaUltimo=
caixa;

}

const rotas=
obterRotaMotorista(
m.nome
);

const rotaTexto=
rotas.length
?
rotas
.map(
r=>
nomeBonitoRota(r)
)
.join(
" → "
)
:
"NÃO CONFIGURADA";

const pracaAtual=
obterPracaAtual(m);

caixa.innerHTML=`

<div class="nome">
${m.nome}
</div>

${
filtroAtual===
"CARRETAS_INTERIOR"
?
`
<div>
🚛 Cavalo: ${m.placa}
</div>

<div>
🔗 Carreta:
${m.conjunto||"SEM CARRETA"}
</div>
`
:
`
<div>
🚛 Placa: ${m.placa}
</div>
`
}

<div>
🏢 CNPJ: ${m.cnpj}
</div>

<div class="praca">
📍 ${pracaAtual}
</div>

<div class="pcpRotaAtual">
🛣️ Rota: ${rotaTexto}
</div>

<div class="pcpStatusMotorista">
${
pegarStatusMotorista(
m.nome
).status===
"feito"
?
"🟢 PEDÁGIO OK - "+
pegarStatusMotorista(
m.nome
).horario
:
pegarStatusMotorista(
m.nome
).status===
"processando"
?
"🟡 EM PROCESSO"
:
"🔴 PENDENTE"
}
</div>

<div class="pcpAcoesMotorista">

<button
class="pcpBotaoAcao pcpBotaoPedagio"
>

💰 PEDÁGIO </button>

<button
class="pcpBotaoAcao pcpBotaoRota"
>

🛣️ ROTA </button>

<button
class="pcpBotaoAcao pcpBotaoAlterarRota"
>

⚙️ ALTERAR ROTA </button>

</div>

`;

caixa.onclick=
e=>{

if(
e.target.closest(
"button"
)
){

return;

}

salvarUltimoMotorista(
m
);

document
.querySelectorAll(
".pcpMotorista.pcpMotoristaSelecionado"
)
.forEach(
el=>
el.classList.remove(
"pcpMotoristaSelecionado"
)
);

caixa.classList.add(
"pcpMotoristaSelecionado"
);

const rectLista =
lista.getBoundingClientRect();

const rectCaixa =
caixa.getBoundingClientRect();

const topo =
lista.scrollTop +
(rectCaixa.top -
rectLista.top) -
(lista.clientHeight / 2) +
(rectCaixa.height / 2);

lista.scrollTo({

top:
Math.max(
0,
topo
),

behavior:
"smooth"

});

};

const botaoPedagio=
caixa.querySelector(
".pcpBotaoPedagio"
);

const botaoRota=
caixa.querySelector(
".pcpBotaoRota"
);

const botaoAlterar=
caixa.querySelector(
".pcpBotaoAlterarRota"
);

botaoPedagio.onclick=
()=>{

atualizarStatusMotorista(
m.nome,
"processando"
);

renderizarLista();

salvarUltimoMotorista(
m
);

iniciar(
m
);

};

botaoRota.onclick=
()=>{

salvarUltimoMotorista(
m
);

iniciarFluxoRota(
m
);

};

botaoAlterar.onclick=
()=>{

abrirAlteracaoRota(
m
);

};

lista.appendChild(
caixa
);

}
);


/* =====================================================
CENTRALIZA O ÚLTIMO MOTORISTA
===================================================== */

if(caixaUltimo){

setTimeout(
()=>{

const rectLista =
lista.getBoundingClientRect();

const rectCaixa =
caixaUltimo.getBoundingClientRect();

let topo =
lista.scrollTop +
(rectCaixa.top - rectLista.top) -
(lista.clientHeight / 2) +
(rectCaixa.height / 2);

const maxScroll =
lista.scrollHeight -
lista.clientHeight;

topo =
Math.max(
0,
Math.min(
topo,
maxScroll
)
);

lista.scrollTo({

top:topo,

behavior:"smooth"

});

},
150
);

}

}
/* =====================================================
FILTROS
===================================================== */

document
.querySelectorAll(
".pcpFiltro"
)
.forEach(
botao=>{

botao.onclick=
()=>{

salvarUltimoFiltro(
botao.dataset.praca
);

document
.querySelectorAll(
".pcpFiltro"
)
.forEach(
b=>
b.classList.remove(
"ativo"
)
);

botao.classList.add(
"ativo"
);

filtroAtual=
botao.dataset.praca;

renderizarLista();

};

}
);

document
.querySelector(
"#pcpBusca"
)
.addEventListener(
"input",
renderizarLista
);


/* =====================================================
INICIAR PEDÁGIO
===================================================== */

async function iniciar(m){

if(
executando
){

status(
"⚠️ Já existe uma automação em andamento.",
"erro"
);

return;

}

executando=
true;

limparLog();

status(
"Executando: "+
m.nome,
"executando"
);

try{

log(
"🚀 INICIANDO AUTOMAÇÃO"
);

await preencherFilial();

await selecionarMotorista(
m
);

await selecionarTransportador(
m
);

await preencherVeiculos(
m
);

await preencherDocumento();

await adicionarDocumento();

await confirmar();

atualizarStatusMotorista(
m.nome,
"feito"
);

renderizarLista();

status(
"✅ VIAGEM CONFIRMADA",
"sucesso"
);

log(
"🎉 PROCESSO FINALIZADO"
);

}catch(erro){

console.error(
erro
);

status(
"❌ ERRO: "+
erro.message,
"erro"
);

log(
"❌ "+
erro.message
);

}finally{

executando=
false;

}

}

/* =====================================================
BOTÃO ROTEIRO
===================================================== */

function criarBotaoRoteiro(){

const url=
window.location.href.toLowerCase();

if(
url.includes(
"default02.asp"
)
){

const antigo=
document.querySelector(
"#pcpBotaoRoteiroComprovante"
);

if(antigo)
antigo.remove();

return;

}

if(
document.querySelector(
"#pcpBotaoRoteiroComprovante"
)
)
return;

const botao=
document.createElement(
"button"
);

botao.id=
"pcpBotaoRoteiroComprovante";

botao.type=
"button";

botao.innerHTML=
"➡️ ROTEIRO";

botao.onclick=
()=>{

window.location.href=
"https://www.repom.com.br/Express/ValePedagio/Viagem/ViagemRoteiro.asp";

};

const elementos=
document.querySelectorAll(
"a,td,span,div"
);

let menu=
null;

for(
const elemento
of elementos
){

const texto=
elemento.textContent
.trim()
.toUpperCase();

if(
texto===
"MENU"
){

menu=
elemento;

break;

}

}

if(menu){

menu.parentNode.insertBefore(
botao,
menu.nextSibling
);

}else{

const topo=
document.body.firstElementChild;

if(topo)
topo.appendChild(
botao
);

}

}

/* =====================================================
CONTROLE DE PÁGINAS
===================================================== */

function controlarPainel(){

const url=
location.href.toLowerCase();

const paginaHome=
url.includes(
"valepedagio/home.asp"
);

const paginaDefault=
url.includes(
"valepedagio/viagem/default.asp"
);

const paginaDefault02=
url.includes(
"default02.asp"
);

const paginaRoteiro=
url.includes(
"valepedagio/viagem/viagemroteiro.asp"
);

const paginaImpressao=
url.includes(
"valepedagio/viagem/imprimevpr.asp"
);

const paginaEmissao=
url.includes(
"valepedagio/viagem/viagem.asp"
)||
url.includes(
"valepedagio/viagem/viagemmostra.asp"
);

if(

paginaHome||
paginaDefault||
paginaDefault02||
paginaRoteiro||
paginaImpressao

){

painel.classList.add(
"pcpOculto"
);

}

else if(
paginaEmissao
){

painel.classList.remove(
"pcpOculto"
);

}

else{

painel.classList.add(
"pcpOculto"
);

}

}

/* =====================================================
OBSERVADOR
===================================================== */

const observador=
new MutationObserver(
()=>{

criarBotaoRoteiro();

controlarPainel();

}
);

observador.observe(
document.body,
{

childList:true,

subtree:true

}
);

/* =====================================================
INICIAR
===================================================== */

criarBotaoRoteiro();

controlarPainel();

filtroAtual=
obterUltimoFiltro();

document
.querySelectorAll(
".pcpFiltro"
)
.forEach(
botao=>{

botao.classList.toggle(

"ativo",

botao.dataset.praca===
filtroAtual

);

}
);

renderizarLista();

setTimeout(
()=>{

selecionarUltimoMotoristaNaLista();

},
300
);

setTimeout(
()=>{
verificarRetornoRota();
},
1000
);

/* =====================================================
   📷 LEITURA DA ESCALA
   REGRA:
   - Lê motorista + rota
   - Motorista cadastrado → atualiza somente a rota
   - Motorista não cadastrado → ignora
   - NÃO cria motorista
   - NÃO altera placa
   - NÃO altera carreta
   - NÃO altera a lógica do pedágio
===================================================== */

(function iniciarLeituraEscala(){

    /* =================================================
       ESTILO
    ================================================= */

    const styleEscala =
        document.createElement("style");

    styleEscala.textContent = `

        #pcpBotaoLerEscala{

            width:100%;
            height:38px;

            margin:8px 0;

            border:0;
            border-radius:7px;

            background:#202124;
            color:white;

            font-size:11px;
            font-weight:bold;

            cursor:pointer;

        }

        #pcpBotaoLerEscala:hover{

            background:#333;

        }

        #pcpModalEscala{

            position:fixed;

            inset:0;

            z-index:2147483649;

            display:flex;

            align-items:center;
            justify-content:center;

            background:rgba(0,0,0,.68);

            padding:20px;

            box-sizing:border-box;

        }

        #pcpModalEscala .pcpEscalaInterno{

            width:600px;
            max-width:100%;

            max-height:90vh;

            overflow:hidden;

            background:#f5f6f8;

            border-radius:14px;

            box-shadow:
                0 20px 60px rgba(0,0,0,.45);

            font-family:Arial,sans-serif;

        }

        .pcpEscalaCabecalho{

            display:flex;

            align-items:center;

            justify-content:space-between;

            padding:18px 20px;

            background:#202124;
            color:white;

        }

        .pcpEscalaCabecalho strong{

            font-size:16px;

        }

        .pcpEscalaCabecalho span{

            display:block;

            margin-top:4px;

            color:#aaa;

            font-size:10px;

        }

        #pcpFecharEscala{

            width:32px;
            height:32px;

            border:0;

            border-radius:7px;

            background:#383a3e;

            color:white;

            cursor:pointer;

            font-size:16px;

        }

        .pcpEscalaConteudo{

            padding:20px;

            max-height:calc(90vh - 70px);

            overflow-y:auto;

        }

        #pcpArquivoEscala{

            width:100%;

            box-sizing:border-box;

            padding:12px;

            background:white;

            border:1px solid #ccc;

            border-radius:8px;

            font-size:12px;

        }

        #pcpBotaoProcessarEscala{

            width:100%;

            height:42px;

            margin-top:12px;

            border:0;

            border-radius:8px;

            background:#202124;

            color:white;

            font-size:11px;

            font-weight:bold;

            cursor:pointer;

        }

        #pcpStatusEscala{

            margin-top:12px;

            padding:10px;

            border-radius:7px;

            background:#e9ecef;

            font-size:11px;

            font-weight:bold;

        }

        #pcpResultadoEscala{

            margin-top:12px;

        }

        .pcpEscalaMotorista{

            padding:10px 12px;

            margin-bottom:6px;

            background:white;

            border:1px solid #ddd;

            border-left:4px solid #198754;

            border-radius:7px;

            font-size:11px;

        }

        .pcpEscalaIgnorado{

            padding:9px 12px;

            margin-bottom:6px;

            background:#f1f1f1;

            border:1px solid #ddd;

            border-radius:7px;

            color:#777;

            font-size:10px;

        }

        .pcpEscalaTituloResultado{

            margin:14px 0 7px;

            font-size:11px;

            font-weight:bold;

            color:#333;

        }

    `;

    document.head.appendChild(styleEscala);


    /* =================================================
       NORMALIZAÇÃO
    ================================================= */

    function normalizarEscala(valor){

        return String(valor || "")
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toUpperCase()
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }


    function escaparEscala(valor){

        return String(valor || "")
            .replace(/&/g,"&amp;")
            .replace(/</g,"&lt;")
            .replace(/>/g,"&gt;")
            .replace(/"/g,"&quot;")
            .replace(/'/g,"&#039;");

    }


    /* =================================================
       BOTÃO
    ================================================= */

    function criarBotaoLerEscala(){

        if(
            document.querySelector(
                "#pcpBotaoLerEscala"
            )
        )
            return;

        const painel =
            document.querySelector(
                "#pcpSistema"
            );

        if(!painel)
            return;

        const botao =
            document.createElement("button");

        botao.id =
            "pcpBotaoLerEscala";

        botao.type =
            "button";

        botao.innerHTML =
            "📷 LEITURA DA ESCALA";

        botao.onclick =
            abrirModalEscala;

        const filtros =
            document.querySelector(
                "#pcpFiliais"
            );

        if(filtros){

            filtros.insertAdjacentElement(
                "afterend",
                botao
            );

        }else{

            painel.appendChild(
                botao
            );

        }

    }


    /* =================================================
       MODAL
    ================================================= */

    function abrirModalEscala(){

        const antigo =
            document.querySelector(
                "#pcpModalEscala"
            );

        if(antigo)
            antigo.remove();

        const modal =
            document.createElement("div");

        modal.id =
            "pcpModalEscala";

        modal.innerHTML = `

            <div class="pcpEscalaInterno">

                <div class="pcpEscalaCabecalho">

                    <div>

                        <strong>
                            📷 LEITURA DA ESCALA
                        </strong>

                        <span>
                            Atualiza somente a rota de motoristas cadastrados
                        </span>

                    </div>

                    <button
                        id="pcpFecharEscala"
                        type="button"
                    >
                        ✕
                    </button>

                </div>

                <div class="pcpEscalaConteudo">

                    <input
                        id="pcpArquivoEscala"
                        type="file"
                        accept="image/*"
                    >

                    <button
                        id="pcpBotaoProcessarEscala"
                        type="button"
                    >
                        🔎 LER ESCALA
                    </button>

                    <div id="pcpStatusEscala">
                        Selecione a imagem da escala.
                    </div>

                    <div
                        id="pcpResultadoEscala"
                    ></div>

                </div>

            </div>

        `;

        document.body.appendChild(modal);

        modal.querySelector(
            "#pcpFecharEscala"
        ).onclick =
            () => modal.remove();

        modal.querySelector(
            "#pcpBotaoProcessarEscala"
        ).onclick =
            processarImagemEscala;

    }


    /* =================================================
       TESSERACT
    ================================================= */

    function carregarTesseractEscala(){

        return new Promise(
            (resolve,reject)=>{

                if(
                    typeof Tesseract !==
                    "undefined"
                ){

                    resolve();

                    return;

                }

                const script =
                    document.createElement("script");

                script.src =
                    "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

                script.onload =
                    () => {

                        if(
                            typeof Tesseract !==
                            "undefined"
                        ){

                            resolve();

                        }else{

                            reject(
                                new Error(
                                    "Tesseract indisponível."
                                )
                            );

                        }

                    };

                script.onerror =
                    () =>
                        reject(
                            new Error(
                                "Não foi possível carregar o OCR."
                            )
                        );

                document.head.appendChild(script);

            }
        );

    }


    /* =================================================
       PREPARAR IMAGEM
    ================================================= */

    function prepararImagemEscala(
        arquivo
    ){

        return new Promise(
            (resolve,reject)=>{

                const img =
                    new Image();

                const url =
                    URL.createObjectURL(
                        arquivo
                    );

                img.onload =
                    function(){

                        try{

                            const limite =
                                4000;

                            let largura =
                                img.naturalWidth;

                            let altura =
                                img.naturalHeight;

                            if(
                                largura >
                                limite
                            ){

                                const escala =
                                    limite /
                                    largura;

                                largura =
                                    limite;

                                altura =
                                    Math.round(
                                        altura *
                                        escala
                                    );

                            }

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width =
                                largura;

                            canvas.height =
                                altura;

                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );

                            ctx.drawImage(
                                img,
                                0,
                                0,
                                largura,
                                altura
                            );

                            URL.revokeObjectURL(
                                url
                            );

                            resolve(canvas);

                        }catch(e){

                            URL.revokeObjectURL(
                                url
                            );

                            reject(e);

                        }

                    };

                img.onerror =
                    () => {

                        URL.revokeObjectURL(
                            url
                        );

                        reject(
                            new Error(
                                "Imagem inválida."
                            )
                        );

                    };

                img.src =
                    url;

            }
        );

    }


    /* =================================================
       PROCESSAR IMAGEM
    ================================================= */

    async function processarImagemEscala(){

        const arquivo =
            document.querySelector(
                "#pcpArquivoEscala"
            )?.files?.[0];

        const status =
            document.querySelector(
                "#pcpStatusEscala"
            );

        const resultado =
            document.querySelector(
                "#pcpResultadoEscala"
            );

        if(!arquivo){

            status.innerHTML =
                "⚠️ Selecione uma imagem primeiro.";

            return;

        }

        resultado.innerHTML =
            "";

        try{

            status.innerHTML =
                "⏳ Carregando OCR...";

            await carregarTesseractEscala();

            status.innerHTML =
                "⏳ Preparando imagem...";

            const imagem =
                await prepararImagemEscala(
                    arquivo
                );

            const leitura =
                await Tesseract.recognize(
                    imagem,
                    "por",
                    {

                        logger:
                            info => {

                                if(
                                    info?.status ===
                                    "recognizing text"
                                ){

                                    status.innerHTML =
                                        "⏳ Lendo escala: " +
                                        Math.round(
                                            (info.progress || 0) *
                                            100
                                        ) +
                                        "%";

                                }

                            }

                    }
                );

            const texto =
                leitura?.data?.text ||
                "";

            console.log(
                "📷 OCR ESCALA:",
                texto
            );

            analisarTextoEscala(
                texto
            );

        }
        catch(erro){

            console.error(
                "❌ ERRO LEITURA ESCALA:",
                erro
            );

            status.innerHTML =
                "❌ Erro ao ler a imagem.";

        }

    }


    /* =================================================
       LOCALIZAR LINHA DO MOTORISTA
    ================================================= */

    function localizarLinhaMotorista(
        texto,
        motorista
    ){

        const linhas =
            String(texto || "")
                .split(/\r?\n/)
                .map(
                    l =>
                        l.trim()
                )
                .filter(Boolean);

        const nome =
            normalizarEscala(
                motorista.nome
            );

        const nomeBase =
            nome
                .split("(")[0]
                .trim();

        for(
            let i = 0;
            i < linhas.length;
            i++
        ){

            const linha =
                normalizarEscala(
                    linhas[i]
                );

            if(
                linha.includes(nome)
            ){

                return linha;

            }

            if(
                nomeBase.length >= 8 &&
                linha.includes(nomeBase)
            ){

                return linha;

            }

        }

        return "";

    }


    /* =================================================
       EXTRAIR ROTA
    ================================================= */

    function extrairRotaLinha(
        linha
    ){

        let texto =
            normalizarEscala(
                linha
            );

        if(!texto)
            return "";

        const origem =
            "CD SUMARE";

        const posOrigem =
            texto.indexOf(
                origem
            );

        if(
            posOrigem === -1
        ){

            return "";

        }

        let rota =
            texto.substring(
                posOrigem +
                origem.length
            )
            .trim();

        const operacoes = [

            "DISTRIBUICAO",
            "COLETA",
            "EXTRA",
            "INDISPONIVEL"

        ];

        let fim =
            rota.length;

        operacoes.forEach(
            operacao => {

                const pos =
                    rota.indexOf(
                        operacao
                    );

                if(
                    pos >= 0 &&
                    pos < fim
                ){

                    fim = pos;

                }

            }
        );

        rota =
            rota.substring(
                0,
                fim
            )
            .trim();

        rota =
            rota.replace(
                /\b[A-Z]{3}[0-9][A-Z0-9][0-9]{2}\b/g,
                ""
            );

        rota =
            rota.replace(
                /\b[A-Z]{3}[0-9]{4}\b/g,
                ""
            );

        return rota
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }


    /* =================================================
       SALVAR SOMENTE ROTA
    ================================================= */

    function salvarRotaEscala(
        motorista,
        rotaNome
    ){

        const nome =
            motorista.nome;

        const rotas =
            obterRotas();

        const antiga =
            obterRotaMotorista(
                nome
            );

        const rotaAntiga =
            antiga.length
                ? antiga[0]
                : "";

        const rotaN =
            normalizarEscala(
                rotaNome
            );


        /* =============================================
           CAMPINAS
           SOMENTE REMOVE ROTA.
           NÃO BLOQUEIA PEDÁGIO.
        ============================================= */

        if(
            rotaN.includes("CAMPINAS")
        ){

            rotas[nome] = [];

            salvarRotas(
                rotas
            );

            return {

                alterada:
                    rotaAntiga !== "",

                antiga:
                    rotaAntiga,

                nova:
                    "",

                bloqueada:false,

                fixa:false

            };

        }


        /* =============================================
           MAPA DAS ROTAS
        ============================================= */

        const mapa = {

            "SAO PAULO":
                "SAO_PAULO",

            "SAO JOSE DOS CAMPOS":
                "SAO_JOSE_CAMPOS",

            "SAO JOSE CAMPOS":
                "SAO_JOSE_CAMPOS",

            "INDAIATUBA":
                "INDAIATUBA",

            "JUNDIAI":
                "JUNDIAI",

            "SANTOS":
                "SANTOS",

            "FRANCA":
                "FRANCA",

            "SOROCABA":
                "SOROCABA",

            "PIRACICABA":
                "PIRACICABA",

            "LIMEIRA":
                "LIMEIRA",

            "ITU":
                "ITU",

            "SAO CARLOS":
                "SAO_CARLOS",

            "SANTO ANDRE":
                "SANTO_ANDRE",

            "RIBEIRAO PRETO":
                "RIBEIRAO_PRETO",

            "SAO JOSE DO RIO PRETO":
                "SAO_JOSE_RIO_PRETO",

            "BRASILIA":
                "BRASILIA"

        };


        const nomeBonito =
            rotaNome
                .toUpperCase()
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        const chave =
            mapa[nomeBonito];


        if(!chave){

            return {

                alterada:false,

                desconhecida:true,

                texto:
                    rotaNome

            };

        }


        if(
            rotaAntiga === chave
        ){

            return {

                alterada:false,

                antiga:
                    chave,

                nova:
                    chave

            };

        }


        rotas[nome] =
            [chave];

        salvarRotas(
            rotas
        );


        return {

            alterada:true,

            antiga:
                rotaAntiga,

            nova:
                chave

        };

    }


    /* =================================================
       PROCESSAR TEXTO DA ESCALA
    ================================================= */

    function analisarTextoEscala(
        texto
    ){

        const status =
            document.querySelector(
                "#pcpStatusEscala"
            );

        const resultado =
            document.querySelector(
                "#pcpResultadoEscala"
            );

        if(
            !texto ||
            !texto.trim()
        ){

            status.innerHTML =
                "❌ Nenhum texto foi identificado.";

            return;

        }


        /*
         * AQUI ESTÁ A REGRA PRINCIPAL:
         *
         * obterTodosMotoristas()
         *
         * pega somente quem já pertence
         * ao PCP, incluindo os adicionados
         * pela Configuração.
         */

        const cadastrados =
            obterTodosMotoristas();


        const encontrados = [];

        const ignorados = [];


        /* =================================================
           MOTORISTAS CADASTRADOS
        ================================================= */

        cadastrados.forEach(
            motorista => {

                const linha =
                    localizarLinhaMotorista(
                        texto,
                        motorista
                    );

                /*
                 * Não encontrou o motorista
                 * na escala → não faz nada.
                 */

                if(!linha)
                    return;


                const rotaEscala =
                    extrairRotaLinha(
                        linha
                    );


                let resultadoRota =
                    null;


                /*
                 * SOMENTE ROTA É ALTERADA.
                 */

                if(
                    rotaEscala
                ){

                    resultadoRota =
                        salvarRotaEscala(
                            motorista,
                            rotaEscala
                        );

                }


                const alteracoes = [];


                if(
                    resultadoRota?.alterada
                ){

                    alteracoes.push(

                        "✅ Rota atualizada: " +

                        (
                            resultadoRota.antiga
                                ?
                                nomeBonitoRota(
                                    resultadoRota.antiga
                                )
                                :
                                "NÃO CONFIGURADA"
                        ) +

                        " → " +

                        escaparEscala(
                            rotaEscala
                        )

                    );

                }
                else if(
                    resultadoRota?.desconhecida
                ){

                    alteracoes.push(

                        "⚠️ Rota não encontrada no Repom: " +

                        escaparEscala(
                            rotaEscala
                        )

                    );

                }
                else if(
                    !rotaEscala
                ){

                    alteracoes.push(
                        "⚠️ Rota não identificada na linha."
                    );

                }
                else{

                    alteracoes.push(
                        "✅ Rota já estava configurada."
                    );

                }


                encontrados.push({

                    motorista:
                        motorista,

                    linha:
                        linha,

                    rotaEscala:
                        rotaEscala,

                    alteracoes:
                        alteracoes

                });

            }
        );


        /* =================================================
           MOTORISTAS NÃO CADASTRADOS

           O OCR não cadastra ninguém.
           Eles simplesmente são ignorados.
        ================================================= */

        const linhas =
            String(texto || "")
                .split(/\r?\n/)
                .map(
                    l =>
                        normalizarEscala(l)
                )
                .filter(Boolean);


        linhas.forEach(
            linha => {

                /*
                 * Não tenta criar motorista.
                 *
                 * Apenas registra linhas que
                 * não correspondem aos cadastrados
                 * quando parecem conter uma placa.
                 */

                const temPlaca =
                    /\b[A-Z]{3}[0-9][A-Z0-9][0-9]{2}\b/.test(
                        linha
                    ) ||
                    /\b[A-Z]{3}[0-9]{4}\b/.test(
                        linha
                    );


                if(!temPlaca)
                    return;


                const pertence =
                    cadastrados.some(
                        motorista => {

                            const nome =
                                normalizarEscala(
                                    motorista.nome
                                );

                            const base =
                                nome
                                    .split("(")[0]
                                    .trim();

                            return (
                                linha.includes(nome) ||
                                (
                                    base.length >= 8 &&
                                    linha.includes(base)
                                )
                            );

                        }
                    );


                if(!pertence){

                    if(
                        !ignorados.includes(
                            linha
                        )
                    ){

                        ignorados.push(
                            linha
                        );

                    }

                }

            }
        );


        /*
         * Atualiza a lista visual do Repom.
         *
         * Não cria pedágio.
         * Não executa função de pedágio.
         * Apenas atualiza a interface porque a rota
         * dos cadastrados foi alterada.
         */

        motoristas =
            obterTodosMotoristas();


        renderizarLista();


        exibirResultadoEscala(
            encontrados,
            ignorados
        );


        status.innerHTML =
            "✅ Escala processada: " +
            encontrados.length +
            " motorista(s) cadastrado(s) encontrado(s).";

    }


    /* =================================================
       RESULTADO
    ================================================= */

    function exibirResultadoEscala(
        encontrados,
        ignorados
    ){

        const resultado =
            document.querySelector(
                "#pcpResultadoEscala"
            );

        if(!resultado)
            return;


        let html = `

            <div class="pcpEscalaTituloResultado">

                👥 MOTORISTAS CADASTRADOS ENCONTRADOS

            </div>

        `;


        if(
            !encontrados.length
        ){

            html += `

                <div class="pcpEscalaIgnorado">

                    Nenhum motorista cadastrado
                    foi encontrado na escala.

                </div>

            `;

        }
        else{

            encontrados.forEach(
                item => {

                    const m =
                        item.motorista;


                    const rota =
                        item.rotaEscala ||
                        "NÃO IDENTIFICADA";


                    html += `

                        <div
                            class="pcpEscalaMotorista"
                        >

                            <strong>

                                ${escaparEscala(
                                    m.nome
                                )}

                            </strong>

                            <br>

                            🛣️ Rota:

                            ${escaparEscala(
                                rota
                            )}

                            <div
                                style="
                                    margin-top:7px;
                                    line-height:1.6;
                                "
                            >

                                ${
                                    item.alteracoes
                                        .join("<br>")
                                }

                            </div>

                        </div>

                    `;

                }
            );

        }


        if(
            ignorados.length
        ){

            html += `

                <div class="pcpEscalaTituloResultado">

                    🚫 MOTORISTAS / LINHAS IGNORADAS

                </div>

                <div class="pcpEscalaIgnorado">

                    A leitura encontrou linhas
                    que não correspondem a
                    motoristas cadastrados no PCP.

                    <br><br>

                    ❌ Nenhum cadastro criado.

                    <br>

                    ❌ Nenhuma placa alterada.

                    <br>

                    ❌ Nenhuma carreta alterada.

                    <br>

                    ❌ Nenhum pedágio criado.

                </div>

            `;

        }


        html += `

            <div class="pcpEscalaTituloResultado">

                ℹ️ REGRA DA LEITURA

            </div>

            <div class="pcpEscalaIgnorado">

                A escala somente procura
                motoristas que já estão
                cadastrados no PCP.

                <br><br>

                Motoristas adicionados pela
                CONFIGURAÇÃO também contam
                como cadastrados.

                <br><br>

                A leitura atualiza
                <strong>somente a rota</strong>.

                <br><br>

                Placa e carreta não são
                alteradas pela escala.

                <br><br>

                Motorista que não existe
                no PCP é ignorado.

                <br><br>

                A leitura da escala não
                cria pedágio e não altera
                a lógica existente do pedágio.

            </div>

        `;


        resultado.innerHTML =
            html;

    }


    /* =================================================
       INICIALIZA
    ================================================= */

    criarBotaoLerEscala();


    const observerEscala =
        new MutationObserver(
            () => {

                criarBotaoLerEscala();

            }
        );


    if(document.body){

        observerEscala.observe(
            document.body,
            {
                childList:true,
                subtree:true
            }
        );

    }

})();

})();
