// XP needed per level
const l10x = [15, 30, 50, 75, 125, 300, 600, 800, 900, 1000, 1200, 1500];

// Prestige XP multipliers
const pmu = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10,
	     12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 45, 50, 75, 100, 101, 101,
	     101, 101, 101];

// DOM elements
const _cp = document.getElementById("cp");
const _cl = document.getElementById("cl");
const _lb = document.getElementById("lb");
const _xnl = document.getElementById("xnl");
const _xb = document.getElementById("xb");
const _fp = document.getElementById("fp");
const _tx = document.getElementById("tx");
const _px = document.getElementById("px");
const _nx = document.getElementById("nx");
const _pp = document.getElementById("pp");
const _sl = document.getElementById("sl");
const _sb = document.getElementById("sb");
const _nd = document.getElementById("nd");
const _np = document.getElementById("np");

// User inputs
let cp = 0, cl = 1, xnl = 15, fp = false, sl = 120;

_cp.oninput = () => { cp = +_cp.value; update(); }
_cl.oninput = () => { cl = +_cl.value; update(); }
_xnl.oninput = () => { xnl = +_xnl.value; update(); }
_fp.oninput = () => { fp = +_fp.checked; update(); }
_sl.oninput = () => { sl = +_sl.value; update(); }

function ptx(p) {
    let x = 0;
    for (let i = 0; i <= p; i++) {
	for (let l = 1; l < 120; l++)
	    x += lx(i, l);
    }
    return x;
}

function lx(p, l) {
    return Math.ceil(l10x[Math.floor(l / 10)] * pmu[p]);
}

function update() {
    let ret = false;
    if (xnl > lx(cp, cl)) {
	_xb.style.display = "block";
	ret = true;
    }
    else
	_xb.style.display = "none";
    if (cl < 50 && fp) {
	_lb.style.display = "block";
	ret = true;
    }
    else
	_lb.style.display = "none";
    if (sl <= cl) {
	_sb.style.display = "block";
	ret = true;
    }
    else
	_sb.style.display = "none";
    if (ret)
	return;

    if (cl == 120) {
	_tx.innerHTML = numfmt(ptx(cp));
	_px.innerHTML = numfmt(ptx(cp));
	_nx.innerHTML = 0;
	_pp.innerHTML = 100;
	_ll.innerHTML = 120;
	_nd.innerHTML = 0;
	return;
    }

    let px = lx(cp, cl) - xnl;
    for (let i = 1; i < cl; i++)
	px += lx(cp, i);
    _px.innerHTML = numfmt(px);
    let ppx = ptx(cp - 1);
    let cpx = ptx(cp);
    let tx = ppx + px;
    _tx.innerHTML = numfmt(tx);
    _nx.innerHTML = numfmt(cpx - tx);

    let rpx = px;
    if (fp) {
	for (let i = 1; i < 50; i++)
	    rpx -= lx(cp, i);
    }
    _pp.innerHTML = (rpx * 100 / (cpx - ppx)).toFixed(4);

    let nd = xnl;
    for (let i = cl + 1; i < sl; i++)
	nd += lx(cp, i);
    _nd.innerHTML = numfmt(nd);
    _np.innerHTML = (px * 100 / (px + nd)).toFixed(4);
}

function numfmt(x) {
    // https://stackoverflow.com/questions/2901102
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
