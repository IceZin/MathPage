const xml = new XMLHttpRequest();

var alns = [];

function gbi(i) {
    return document.getElementById(i);
}

function gbc(c) {
    return document.getElementsByClassName(c);
}

function gals() {
    let trms = [];

    gbc('sl')[0].querySelectorAll('input').forEach(function(el, index) {
        if (el.checked) trms.push(index);
    });

    return trms;
}

function reqals(callback) {
    xml.open('GET', '/mt/alns');
    xml.send();
    xml.onload = function() {
        console.log(this.status);
        if (this.readyState == 4 && this.status == 200) {
            let resType = this.getResponseHeader('Content-Type').split('/')[1];

            if (resType == 'json') {
                let res = JSON.parse(this.responseText);

                res.forEach(function(trm, index) {
                    alns[index] = trm;
                });

                return callback();
            }
        }
    }
}

window.onload = function() {
    let turmas = ['2A', '2B', '2C'];

    gbi('rfr').onclick = function() {
        gbc('als')[0].innerHTML = '';

        reqals(function() {
            gals().forEach(i => {
                console.log(alns);
                Object.keys(alns[i]).forEach(al => {
                    let el = `
                    <div class='al'>
                        <h1>Nome: ${alns[i][al].nome}</h1>
                        <h1>Numero: ${al}</h1>
                        <h1>Turma: ${turmas[i]}</h1>
                        <h1>Pontos: ${alns[i][al].pts}</h1>
                    </div>
                    `
                    gbc('als')[0].insertAdjacentHTML('beforeend', el);
                });
            });
        });
    }
}