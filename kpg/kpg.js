const xml = new XMLHttpRequest();

function gbc(c) {
    return document.getElementsByClassName(c);
}

function gbi(i) {
    return document.getElementById(i);
}

class Generator {
    constructor() {
        let info = {
            matrix: {
                col: 0,
                row: 0
            }
        }

        let gen = (cols, rows) => {
            let gvl = '1fr ';
            let el = '<div class="num"><input type="number"></div>'
            let mx0 = gbc('mx0')[0];
            let mx1 = gbc('mx1')[0];
            let mxr = gbc('mxr')[0];
        }
    }
}

function req(mtd, url, dt, callback) {
    let info = {
        'status': null,
        'res': null,
        'headers': {}
    }
    xml.open(mtd, url);

    if (dt != null) xml.send(dt);
    else xml.send();

    xml.onload = function() {
        info.status = this.status;
        if (this.readyState == 4 && this.status == 200) {
            let headers = this.getAllResponseHeaders().trim().split(/[\r\n]+/);

            headers.forEach(function (header) {
                var parts = header.split(': ');
                var header = parts.shift();
                var value = parts.join(': ');
                info.headers[header] = value;
            });

            let resType = this.getResponseHeader('Content-Type').split('/')[1];
            if (resType == 'json') {
                info.res = JSON.parse(this.responseText);
            }
        }
        return callback(info);
    }
}

function gck() {
    let cookies = {};

    document.cookie.split('; ').forEach(ck => {
        cookies[ck.split('=')[0]] = ck.split('=')[1];
    });

    console.log(cookies);
    return cookies;
}

function chck(ck) {
    console.log('Checking token ' + ck)
    req('GET', '/chck?tk=' + ck, null, function(d) {
        if (d.status == 404) {
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            location.pathname = '/';
        } else {
            if (d.headers['complete'] == 'true') {
                location.pathname = '/cp';
            }
        }
    });
}

function clr() {
    gbc('mx')[0].innerHTML = '';
    gbc('mx')[1].innerHTML = '';
}

function gmxs() {
    req('GET', '/mxs', null, function(d) {
        console.log(d);
        let res = d.res;

        if (d.status == 200) {
            console.log("Setting matrices");
            clr();

            gbc('mx')[0].style.gridTemplateRows = `repeat(${res.key.length}, 1fr)`
            gbc('mx')[0].style.gridTemplateColumns = `repeat(${res.key[0].length}, 1fr)`
            res.key.forEach(row=> {
                row.forEach(val => {
                    gbc('mx')[0].insertAdjacentHTML('beforeend', `<h1>${val}</h1>`);
                });
            });

            gbc('mx')[1].style.gridTemplateRows = `repeat(${res.emsg.length}, 1fr)`
            gbc('mx')[1].style.gridTemplateColumns = `repeat(${res.emsg[0].length}, 1fr)`
            res.emsg.forEach(row=> {
                row.forEach(val => {
                    gbc('mx')[1].insertAdjacentHTML('beforeend', `<h1>${val}</h1>`);
                });
            });
        }
    });
}

function sb() {
    let dmsg = gbi('dmsg').value;
    req('POST', '/dmsg', JSON.stringify({'dmsg': dmsg}), function(d) {
        console.log(d.headers);
        if (d.status == 200 && d.headers['complete'] == 'false') {
            gmxs();
        } else if (d.headers['complete'] == 'true') {
            location.pathname = '/cp';
        }
    });
}

if (gck()['token'] != undefined) {
    chck(gck()['token']);
} else {
    location.pathname = '/';
}

window.onload = function() {
    gmxs();
    gbi('sb').onclick = sb;
}