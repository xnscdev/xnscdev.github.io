const equation = document.getElementById("equation");
const graph = document.getElementById("graph");

class Expr {
    constructor() {
    }

    eval(x, y) {
	throw null;
    }
}

class Numeral extends Expr {
    constructor(value) {
	super();
	this.value = value;
    }

    eval(x, y) {
	return this.value;
    }
}

class UnaryMinus extends Expr {
    constructor(expr) {
	super();
	this.expr = expr;
    }

    eval(x, y) {
	return -this.expr.eval(x, y);
    }
}

const ADD = 1;
const SUB = 2;
const MUL = 3;
const DIV = 4;
const EXP = 5;

const ARITHTYPE = {
    '+': ADD,
    '-': SUB,
    '*': MUL,
    '/': DIV,
    '^': EXP
};

const PREC = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3
};

class Arithmetic extends Expr {
    constructor(lhs, rhs, op) {
	super();
	this.lhs = lhs;
	this.rhs = rhs;
	this.op = op;
    }

    eval(x, y) {
	switch (this.op) {
	case ADD:
	    return this.lhs.eval(x, y) + this.rhs.eval(x, y);
	case SUB:
	    return this.lhs.eval(x, y) - this.rhs.eval(x, y);
	case MUL:
	    return this.lhs.eval(x, y) * this.rhs.eval(x, y);
	case DIV:
	    return this.lhs.eval(x, y) / this.rhs.eval(x, y);
	case EXP:
	    return Math.pow(this.lhs.eval(x, y), this.rhs.eval(x, y));
	default:
	    throw null;
	}
    }
}

class Function extends Expr {
    constructor(arg, func) {
	super();
	this.arg = arg;
	this.func = func;
    }

    eval(x, y) {
	return this.func(this.arg.eval(x, y));
    }
}

const X = 0;
const Y = 1;

class Variable extends Expr {
    constructor(name) {
	super();
	if (name == "x")
	    this.name = X;
	else if (name == "y")
	    this.name = Y;
	else
	    throw null;
    }

    eval(x, y) {
	return this.name ? y : x;
    }
}

let text;
let save;

function nextChar() {
    let c;
    if (save) {
	c = save;
	save = null;
	return c;
    }
    do {
	if (!text.length)
	    return null;
	c = text.charAt(0);
	text = text.substring(1);
    }
    while (c == ' ');
    return c;
}

function parseAtomic() {
    let c = nextChar();
    if (!c)
	return null;
    if (c == '(') {
	let expr = parseExpr();
	if (!expr)
	    return null;
	if (nextChar() != ')')
	    return null;
	return expr;
    }
    else if (c == 'x' || c == 'y')
	return new Variable(c);
    else if (c == 'e')
	return new Numeral(Math.E);
    else if (c == 'p') {
	if (nextChar() == 'i')
	    return new Numeral(Math.PI);
    }
    else if (c == 'c') {
	if (text.startsWith('os')) {
	    text = text.substring(2);
	    let arg = parseBasic();
	    if (!arg)
		return null;
	    return new Function(arg, Math.cos);
	}
    }
    else if (c == 's') {
	if (text.startsWith('in')) {
	    text = text.substring(2);
	    let arg = parseBasic();
	    if (!arg)
		return null;
	    return new Function(arg, Math.sin);
	}
    }
    else if (c == 't') {
	if (text.startsWith('an')) {
	    text = text.substring(2);
	    let arg = parseBasic();
	    if (!arg)
		return null;
	    return new Function(arg, Math.tan);
	}
    }
    else if (c == '-') {
	let expr = parseBasic();
	if (expr == null)
	    return null;
	return new UnaryMinus(expr);
    }
    else if (c >= '0' && c <= '9') {
	let value = 0;
	while (c && c >= '0' && c <= '9') {
	    value *= 10;
	    value += parseInt(c);
	    c = nextChar();
	}
	save = c;
	return new Numeral(value);
    }
    return null;
}

function parseBasic() {
    let expr = parseAtomic();
    if (!expr)
	return null;
    while (true) {
	let c = nextChar();
	if (!c)
	    return expr;
	save = c;
	if (c == ')' || getPrec(c))
	    return expr;
	let rhs = parseAtomic();
	if (!rhs)
	    return null;
	expr = new Arithmetic(expr, rhs, MUL);
    }
}

function getPrec(c) {
    if (c == '+' || c == '-' || c == '*' || c == '/' || c == '^')
	return PREC[c];
    return 0;
}

function parseBinary(lhs, minprec) {
    while (true) {
	let c = nextChar();
	let prec = getPrec(c);
	if (prec < minprec) {
	    save = c;
	    return lhs;
	}
	if (!c)
	    return lhs;
	if (c == ')') {
	    save = c;
	    return lhs;
	}
	let op = ARITHTYPE[c];
	if (!op)
	    op = MUL;

	let rhs = parseBasic();
	if (!rhs)
	    return null;
	c = nextChar();
	save = c;
	let nextprec = getPrec(c);
	if (prec < nextprec) {
	    rhs = parseBinary(rhs, prec + 1);
	    if (!rhs)
		return null;
	}
	lhs = new Arithmetic(lhs, rhs, op);
    }
}

function parseExpr() {
    let expr = parseBasic();
    if (!expr)
	return null;
    return parseBinary(expr, 0);
}

function updateGraph() {
    text = equation.value;
    let expr = parseExpr();
    if (!expr) {
	alert("Invalid expression!");
	return;
    }

    let ctx = graph.getContext("2d");
    ctx.clearRect(0, 0, graph.width, graph.height);

    // Draw grid
    for (let x = 0; x < 19; x++) {
	ctx.beginPath();
	if (x == 9)
	    ctx.lineWidth = 3;
	else
	    ctx.lineWidth = 1;
	ctx.moveTo(x * 40 + 20, 0);
	ctx.lineTo(x * 40 + 20, graph.height);
	ctx.stroke();
    }
    for (let y = 0; y < 19; y++) {
	ctx.beginPath();
	if (y == 9)
	    ctx.lineWidth = 2;
	else
	    ctx.lineWidth = 1;
	ctx.moveTo(0, y * 40 + 20);
	ctx.lineTo(graph.width, y * 40 + 20);
	ctx.stroke();
    }

    // Draw slope fields
    ctx.lineWidth = 3;
    for (let x = -9; x < 10; x++) {
	for (let y = -9; y < 10; y++) {
	    let m = expr.eval(x, y);
	    ctx.beginPath();
	    // Work around the differences in numbering for Cartesian
	    // coordinates vs the canvas coordinates
	    let bx = 40 * (x + 9) + 20;
	    let by = 40 * (9 - y) + 20;
	    if (!m) {
		ctx.moveTo(bx - 15, by);
		ctx.lineTo(bx + 15, by);
	    }
	    else if (isFinite(m)) {
		let theta = Math.atan(m);
		let dx = 15 * Math.cos(theta);
		let dy = 15 * Math.sin(theta);
		ctx.moveTo(bx + dx, by - dy);
		ctx.lineTo(bx - dx, by + dy);
	    }
	    else {
		ctx.moveTo(bx, by - 15);
		ctx.lineTo(bx, by + 15);
	    }
	    ctx.stroke();
	}
    }

    // Draw axis numbers
    ctx.font = "12px Arial";
    for (let x = -9; x < 10; x++)
	ctx.fillText(x.toString(), 22 + 40 * (x + 9), 378);
    for (let y = -9; y < 10; y++) {
	if (!y)
	    continue; // 0 already drawn by previous loop
	ctx.fillText(y.toString(), 382, 18 + 40 * (9 - y));
    }
}
