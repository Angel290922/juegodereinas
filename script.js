let N=8;
let boardState=[];

let startTime;
let timer;

let hintTimer;
let solveTimer;

let usoSolucion=false;

let contraReloj=false;
let tiempoLimite=180;

let mejorTiempo=localStorage.getItem("record")||null;


/* INICIO */

window.onload=()=>{

    btnReset.onclick=reiniciar;
    btnHint.onclick=sugerencia;
    btnSolve.onclick=resolverCompleto;
    btnSize.onclick=cambiarTamano;
    btnTime.onclick=modoTiempo;

    btnClose.onclick=cerrarFinal;
    btnStart.onclick=cerrarTutorial;

    mostrarTutorial();

    init();
};


/* TUTORIAL */

function mostrarTutorial(){

    if(!localStorage.getItem("tutorial")){

        tutorial.style.display="flex";
    }
}

function cerrarTutorial(){

    tutorial.style.display="none";

    localStorage.setItem("tutorial","ok");
}


/* INIT */

function init(){

    usoSolucion=false;

    const board=document.getElementById("board");

    board.innerHTML="";

    board.style.gridTemplateColumns=
    `repeat(${N},50px)`;


    boardState=Array(N).fill(-1);

    startTime=Date.now();


    clearInterval(timer);

    timer=setInterval(updateTime,1000);


    resetAyudas();


    for(let r=0;r<N;r++){

        for(let c=0;c<N;c++){

            let cell=document.createElement("div");

            cell.className=
            "square "+((r+c)%2==0?"white":"black");

            cell.id=`cell-${r}-${c}`;

            cell.onclick=()=>clickUser(r,c);

            board.appendChild(cell);
        }
    }

    render();
    mostrarRanking();
}


/* TIMER */

function updateTime(){

    let t=Math.floor((Date.now()-startTime)/1000);

    if(contraReloj){

        let restante=tiempoLimite-t;

        if(restante<=0){
            perder();
            return;
        }

        status.innerText=
        `⏱ ${restante}s | Reinas ${contar()}/${N}`;

    }else{

        status.innerText=
        `⏱ ${t}s | Reinas ${contar()}/${N}`;
    }
}


/* AYUDAS */

function resetAyudas(){

    btnHint.style.display="none";
    btnSolve.style.display="none";

    clearTimeout(hintTimer);
    clearTimeout(solveTimer);

    hintTimer=setTimeout(()=>{
        btnHint.style.display="inline";
    },10000);

    solveTimer=setTimeout(()=>{
        btnSolve.style.display="inline";
    },120000);
}


/* CLICK */

function clickUser(r,c){

    resetAyudas();


    if(boardState[r]===c){

        boardState[r]=-1;
        render();
        return;
    }


    if(boardState[r]!==-1){
        alert("Solo una reina por fila");
        return;
    }


    if(esSeguro(boardState,r,c)){

        boardState[r]=c;

        render();

        verificar();

    }else{

        error(r,c);
    }
}


/* RENDER */

function render(){

    document.querySelectorAll(".square")
    .forEach(s=>{
        s.innerText="";
        s.classList.remove("hint");
    });


    for(let i=0;i<N;i++){

        if(boardState[i]!==-1){

            document.getElementById(
            `cell-${i}-${boardState[i]}`
            ).innerText="♕";
        }
    }

    updateTime();
}


/* CONTAR */

function contar(){

    return boardState.filter(x=>x!=-1).length;
}


/* VALIDAR */

function esSeguro(board,r,c){

    for(let i=0;i<N;i++){

        if(board[i]!==-1){

            if(board[i]===c) return false;

            if(Math.abs(i-r)===
               Math.abs(board[i]-c))
               return false;
        }
    }

    return true;
}


/* BACKTRACKING */

function resolver(board,row){

    if(row===N) return true;

    if(board[row]!==-1)
        return resolver(board,row+1);


    for(let c=0;c<N;c++){

        if(esSeguro(board,row,c)){

            board[row]=c;

            if(resolver(board,row+1))
                return true;

            board[row]=-1;
        }
    }

    return false;
}


/* AYUDAS */

function sugerencia(){

    let copy=[...boardState];

    if(resolver(copy,0)){

        for(let i=0;i<N;i++){

            if(boardState[i]===-1){

                document.getElementById(
                `cell-${i}-${copy[i]}`
                ).classList.add("hint");

                break;
            }
        }
    }
}


function resolverCompleto(){

    usoSolucion=true;

    let temp=[...boardState];

    if(resolver(temp,0)){

        boardState=[...temp];

        render();

        verificar();
    }
}


/* VERIFICAR */

function verificar(){

    if(contar()===N){

        ganar();
    }
}


/* GANAR */

function ganar(){

    clearInterval(timer);

    let tiempo=
    Math.floor((Date.now()-startTime)/1000);


    if(!usoSolucion){

        soundWin.play();

        lanzarConfeti();

        guardarRecord(tiempo);

        N++; // subir nivel

        sizeInput.value=N;
    }


    if(usoSolucion){

        tituloFinal.innerText="Sigue intentando";

        msgFinal.innerText=
        "Cada intento te hace mejor.";

    }else{

        tituloFinal.innerText="¡Ganaste!";

        msgFinal.innerHTML=
        `Tiempo: ${tiempo}s<br>Subes a nivel ${N}`;
    }


    celebracion.style.display="flex";
}


/* PERDER */

function perder(){

    clearInterval(timer);

    tituloFinal.innerText="Tiempo agotado";

    msgFinal.innerText=
    "Inténtalo otra vez.";

    celebracion.style.display="flex";
}


/* FINAL */

function cerrarFinal(){

    celebracion.style.display="none";

    detenerConfeti();

    reiniciar();
}


/* RANKING */

function guardarRecord(t){

    if(!mejorTiempo || t<mejorTiempo){

        mejorTiempo=t;

        localStorage.setItem("record",t);
    }
}

function mostrarRanking(){

    if(mejorTiempo){

        ranking.innerText=
        `Récord: ${mejorTiempo}s`;
    }
}


/* MODO TIEMPO */

function modoTiempo(){

    contraReloj=!contraReloj;

    btnTime.innerText=
    contraReloj?"Normal":"Contrarreloj";

    reiniciar();
}


/* CONFETI */

const canvas=document.getElementById("confetti");
const ctx=canvas.getContext("2d");

let confettis=[];
let confetiOn=false;


function lanzarConfeti(){

    confetiOn=true;

    canvas.width=innerWidth;
    canvas.height=innerHeight;

    confettis=[];


    for(let i=0;i<200;i++){

        confettis.push({

            x:Math.random()*canvas.width,
            y:Math.random()*canvas.height,

            r:Math.random()*6+3,
            d:Math.random()*5+2,

            c:`hsl(${Math.random()*360},
            100%,50%)`
        });
    }

    animarConfeti();
}


function animarConfeti(){

    if(!confetiOn) return;

    ctx.clearRect(
    0,0,canvas.width,canvas.height);


    confettis.forEach(p=>{

        ctx.beginPath();

        ctx.fillStyle=p.c;

        ctx.arc(p.x,p.y,p.r,0,
        Math.PI*2);

        ctx.fill();

        p.y+=p.d;

        if(p.y>canvas.height)
            p.y=0;
    });

    requestAnimationFrame(animarConfeti);
}


function detenerConfeti(){

    confetiOn=false;

    ctx.clearRect(
    0,0,canvas.width,canvas.height);
}


/* EXTRAS */

function error(r,c){

    let cell=
    document.getElementById(`cell-${r}-${c}`);

    cell.classList.add("error");

    setTimeout(()=>{
        cell.classList.remove("error");
    },400);
}


function reiniciar(){

    detenerConfeti();

    init();
}


function cambiarTamano(){

    let v=parseInt(sizeInput.value);

    if(v<4){
        alert("Mínimo 4");
        return;
    }

    N=v;

    reiniciar();
}