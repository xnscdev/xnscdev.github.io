/*
Simple expression parsing library.

Supported features: +, -, *, /, ^, ln, log, sqrt, cbrt, sin, cos, tan, e, pi

Notes:
* Parses -x^2 as (-x)^2, use -(x^2) instead
* Parses sinxcosx as sin(xcosx), use (sinx)(cosx) instead

MIT License

Copyright (c) 2021-2022 Isaac Liu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

let text;
let save;

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
        if (name === "x")
            this.name = X;
        else if (name === "y")
            this.name = Y;
        else
            throw null;
    }

    eval(x, y) {
        return this.name ? y : x;
    }
}

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
    while (c === ' ');
    return c;
}

function parseAtomic() {
    let c = nextChar();
    if (!c)
        return null;
    if (c === '(') {
        let expr = parseExpr();
        if (!expr)
            return null;
        if (nextChar() !== ')')
            return null;
        return expr;
    }
    else if (c === 'x' || c === 'y')
        return new Variable(c);
    else if (c === 'e')
        return new Numeral(Math.E);
    else if (c === 'p') {
        if (nextChar() === 'i')
            return new Numeral(Math.PI);
    }
    else if (c === 'l') {
        if (text.startsWith('og')) {
            text = text.substring(2);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.log10);
        }
        else if (text.startsWith('n')) {
            text = text.substring(1);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.log);
        }
    }
    else if (c === 'a') {
        if (text.startsWith('rcsin')) {
            text = text.substring(5);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.asin);
        }
        else if (text.startsWith('rccos')) {
            text = text.substring(5);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.acos);
        }
        else if (text.startsWith('rctan')) {
            text = text.substring(5);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.atan);
        }
        else if (text.startsWith('bs')) {
            text = text.substring(2);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.abs);
        }
    }
    else if (c === 'c') {
        if (text.startsWith('os')) {
            text = text.substring(2);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.cos);
        }
        else if (text.startsWith('brt')) {
            text = text.substring(3);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.cbrt);
        }
    }
    else if (c === 's') {
        if (text.startsWith('in')) {
            text = text.substring(2);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.sin);
        }
        else if (text.startsWith('qrt')) {
            text = text.substring(3);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.sqrt);
        }
    }
    else if (c === 't') {
        if (text.startsWith('an')) {
            text = text.substring(2);
            let arg = parseBasic();
            if (!arg)
                return null;
            return new Function(arg, Math.tan);
        }
    }
    else if (c === '-') {
        let expr = parseBasic();
        if (expr === null)
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
        if (c === ')' || getPrec(c))
            return expr;
        let rhs = parseAtomic();
        if (!rhs)
            return null;
        expr = new Arithmetic(expr, rhs, MUL);
    }
}

function getPrec(c) {
    if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^')
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
        if (c === ')') {
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
