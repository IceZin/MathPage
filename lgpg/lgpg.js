const xml = new XMLHttpRequest();

class Bmn {
    constructor() {
        let btns = {}

        this.addBtn = (ct, bt) => {
            if (btns[ct] == undefined) this.createCt(ct);

            if (btns[ct] != undefined) {
                btns[ct].els.push(bt);

                bt.onclick = function() {
                    if (this.checked) {
                        if (btns[ct].chk != this) {
                            if (btns[ct].chk != null) btns[ct].chk.checked = false;
                            btns[ct].chk = this;
                        }
                    } else {
                        btns[ct].chk = null;
                    }
                };
            }
        }
        this.createCt = (ct) => {
            btns[ct] = {
                'els': [],
                'chk': null
            };
        }
        this.getChk = (ct) => {
            if (btns[ct] != undefined) return btns[ct].els.indexOf(btns[ct].chk);
        }
    }
}

const bmn = new Bmn();

function req(mtd, url, dt, callback) {
    let info = {
        'status': null,
        'res': null,
        'headers': null
    }
    xml.open(mtd, url);

    if (dt != null) xml.send(dt);
    else xml.send();

    xml.onreadystatechange = function() {
        info.status = this.status;
        if (this.readyState == 4 && this.status == 200) {
            info.headers = this.getAllResponseHeaders();
            let resType = this.getResponseHeader('Content-Type').split('/')[1];
            if (resType == 'json') info.res = JSON.parse(this.responseText);
        }
        return callback(info);
    }
}

function gbc(c) {
    return document.getElementsByClassName(c);
}

function gbi(i) {
    return document.getElementById(i);
}

function sb() {
    let u = gbi('us').value;
    let n = parseInt(gbi('nm').value);
    let t = bmn.getChk('tm');

    if (u == "" || n == NaN || t == -1) {
        return;
    }

    let dt = {
        'alnm': u,
        'nmr': n,
        'tm': t
    }

    console.log(dt);

    req('POST', '/lgn', JSON.stringify(dt), function(d) {
        if (d.status == 200) {
            location.pathname = '/kpg';
        }
    });
}

function gck() {
    let cookies = {};

    document.cookie.split('; ').forEach(ck => {
        cookies[ck.split('=')[0]] = ck.split('=')[1];
    });

    return cookies;
}

function chck(ck) {
    console.log('Checking token ' + ck)
    req('GET', '/chck?tk=' + ck, null, function(d) {
        if (d.status == 200) {
            location.pathname = '/kpg';
        } else if (d.status == 404) {
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    });
}

if (gck()['token'] != undefined) {
    chck(gck()['token']);
}

window.onload = function() {
    gbc('chb')[0].querySelectorAll('input').forEach(el => {
        bmn.addBtn('tm', el);
    });

    gbi('sb').onclick = sb;
}