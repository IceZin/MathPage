var http = require('http');
var fs = require('fs');
const url = require('url');
const m = require('mathjs');
const { compare } = require('mathjs');

function genRdm(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

class Matrix {
    constructor() {
        let matrix = {
            'mx': [],
            'key': [],
            'emsg': [],
            'dmsg': ''
        }

        let getDt = () => {
            m.det(matrix.key);
        }

        let invert = () => {
            console.log("[*] Inverting matrix");
            matrix.mx = m.inv(matrix.key);
        }

        let cryp = (msg) => {
            matrix.emsg = m.multiply(matrix.mx, msg);

            for (let i = 0; i < matrix.emsg.length; i++) {
                for (let y = 0; y < matrix.emsg[0].length; y++) {
                    matrix.emsg[i][y] = matrix.emsg[i][y].toFixed(2);
                }
            }
        }

        let encmsg = (lvl) => {
            console.log("[*] Encoding matrix");
            let msg = [];

            let max = Math.pow(16, lvl * 3) - 1;
            let min = Math.pow(16, lvl * 3 - 1);

            let token = Math.floor(Math.random() * (max - min) + min).toString(16);
            matrix.dmsg = token;

            let sz = Math.floor(token.length / matrix.mx.length);
            for (let i = 0; i < matrix.mx.length; i++) {
                msg[i] = [];
            }

            let ind = 0;

            for (let i = 0; i < matrix.mx.length * (sz + 1); i++) {
                if (i == (ind + 1) * (sz + 1)) ind++;
                if (token[i] != undefined) {
                    if (!isNaN(parseInt(token[i]))) {
                        msg[ind].push(parseInt(token[i]));
                    } else {
                        msg[ind].push(parseInt(token[i], 16));
                    }
                } else {
                    msg[ind].push(-1);
                }
            }
            cryp(msg);
        }

        let genMx = (lvl) => {
            console.log("[*] Creating matrix");
            matrix.key = [];
            let size = lvl + 1;

            for (let x = 0; x < size; x++) {
                matrix.key[x] = [];
                for (let y = 0; y < size; y++) {
                    matrix.key[x][y] = genRdm(-15, 15);
                }
            }
        }

        this.gen = (lvl) => {
            let i = 0;
            while (true) {
                i++
                if (i == 10) {
                    break;
                }
                genMx(lvl);
                if (getDt() != 0) {
                    try {
                        invert();
                        encmsg(lvl);
                        break;
                    } catch(err) {
                        continue;
                    }
                } else {
                    continue;
                }
            }

            return matrix;
        }
    }
}

const port = process.env.PORT || 10080;

var users;
var trms;

fs.readFile('users.json', (err, data) => {
    if (err) throw err;
    users = JSON.parse(data);
    console.log(users);
});

fs.readFile('turmas.json', (err, data) => {
    if (err) throw err;
    trms = JSON.parse(data);
    console.log(trms);
});

function saveJSON() {
    fs.writeFile('users.json', JSON.stringify(users), (err) => {
        if (err) throw err;
        console.log("[*] Arquivo salvo");
    });

    fs.writeFile('turmas.json', JSON.stringify(trms), (err) => {
        if (err) throw err;
        console.log("[*] Arquivo salvo");
    });
}

function sendpg(res, pg) {
    let t = pg.split('.')[1];
    let p = pg.split('.')[0];

    res.writeHead(200, {
        'Content-Type': `text/${t}`
    });

    var htmlfile = fs.createReadStream(`.${p}${pg}`);
    htmlfile.pipe(res);
}

function getCookies(cks) {
    let cookies = {};

    cks.split('; ').forEach(ck => {
        cookies[ck.split('=')[0]] = ck.split('=')[1];
    });

    return cookies;
}

const gpaths = {
    '/': function(req, res, query) {
        sendpg(res, '/lgpg.html')
    },
    '/lgpg.css': function(req, res, query) {
        sendpg(res, '/lgpg.css')
    },
    '/lgpg.js': function(req, res, query) {
        sendpg(res, '/lgpg.js')
    },
    '/kpg': function(req, res, query) {
        sendpg(res, '/kpg.html')
    },
    '/kpg.css': function(req, res, query) {
        sendpg(res, '/kpg.css')
    },
    '/kpg.js': function(req, res, query) {
        sendpg(res, '/kpg.js')
    },
    '/mt': function(req, res, query) {
        sendpg(res, '/mt.html')
    },
    '/mt.css': function(req, res, query) {
        sendpg(res, '/mt.css')
    },
    '/mt.js': function(req, res, query) {
        sendpg(res, '/mt.js')
    },
    '/cp': function(req, res, query) {
        sendpg(res, '/cp.html')
    },
    '/cp.css': function(req, res, query) {
        sendpg(res, '/cp.css')
    },
    '/chck': function(req, res, query) {
        if (users[query.tk] != undefined) {
            res.statusCode = 200;

            console.log()
            if (users[query.tk].fs.nv <= 5) {
                res.setHeader('Complete', 'false');
            } else {
                res.setHeader('Complete', 'true');
            }

            res.setHeader('Content-Type', 'text/plain');
            res.end();
        } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end();
        }
    },
    '/mxs': function(req, res, query) {
        let cookies = getCookies(req.headers.cookie);
        console.log(cookies);

        if (users[cookies['token']] != undefined) {
            console.log("[*] Sending matrices")
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                'key': users[cookies['token']].fs.key,
                'emsg': users[cookies['token']].fs.emsg
            }));
        } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end();
        }
    },
    '/mt/alns': function(req, res, query) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(trms));
    },
    '/robots933456.txt': function(req, res, query) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('User-agent', '*');
        res.setHeader('Disallow', '/');
        res.end();
    }
}

const ppaths = {
    '/lgn': function(req, res, d) {
        var date = new Date();
        var m = new Matrix();

        let max = Math.pow(16, 8) - 1;
        let min = Math.pow(16, 7);

        let token = Math.floor(Math.random() * (max - min) + min).toString(16)
        let mx = m.gen(1);
        console.log(mx);

        date.setTime(date.getTime() + (1209600000));

        users[token] = {
            'fs': {
                'nv': 1,
                'key': mx.key,
                'enc': mx.mx,
                'emsg': mx.emsg,
                'dmsg': mx.dmsg
            },
            'info': {
                'nome': d.alnm,
                'nmr': d.nmr,
                'sr': d.tm
            }
        }

        console.log(d);
        console.log(d.tm);
        console.log(trms);

        trms[d.tm][d.nmr] = {
            'nome': d.alnm,
            'pts': 0
        }

        saveJSON();

        res.setHeader('Set-Cookie', `token=${token}; expires=Mon, 27 Sep 2020 23:59:59 GMT`);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end();
    },
    '/dmsg': function(req, res, d) {
        var m = new Matrix();
        let cookies = getCookies(req.headers.cookie);

        if (users[cookies['token']] != undefined) {
            let usr = users[cookies['token']]

            if (d.dmsg == usr.fs.dmsg) {
                trms[usr.info.sr][usr.info.nmr].pts = usr.fs.nv * 20;

                usr.fs.nv++;

                if (usr.fs.nv <= 5) {
                    let mx = m.gen(usr.fs.nv);

                    usr.fs.key = mx.key;
                    usr.fs.enc = mx.mx;
                    usr.fs.emsg = mx.emsg;
                    usr.fs.dmsg = mx.dmsg;
                    console.log(users[cookies['token']].fs.nv)

                    res.statusCode = 200;
                    res.setHeader('Complete', 'false');
                    res.setHeader('Content-Type', 'text/plain');
                    res.end();
                } else {
                    res.statusCode = 200;
                    res.setHeader('Complete', 'true');
                    res.setHeader('Content-Type', 'text/plain');
                    res.end();
                }
            
                saveJSON();
            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end();
            }
        }
    }
}

var httpserver = http.createServer((req, res) => {
    let req_attr = url.parse(req.url, true);
    console.log("[!] New request");
    console.log("[*] Path: " + req_attr.pathname);
    console.log("[*] Query: ");
    console.log(req_attr.query);
    console.log("[*] Cookie: ");
    console.log(req.headers.cookie);

    if (req.method == 'GET') {
        try {
            gpaths[req_attr.pathname](req, res, req_attr.query);
        } catch (err) {
            console.log("[!] Path does not exists");
        }
    } else if (req.method == 'POST') {
        req.on('data', function(data) {
            ppaths[req_attr.pathname](req, res, JSON.parse(data.toString()));
        });
    }
});

httpserver.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
