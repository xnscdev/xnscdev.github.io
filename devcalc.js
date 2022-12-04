/* BITWISE OPERATIONS AND CONVERSIONS */

function numFormCompDec(id, readonly, negative, onchange) {
    let num = BigInt.asUintN(bits(), BigInt((readonly ? "" : "0x") + ($(`#${id}_n`).val() || '0')));
    $(`#${id}_nc`).html(`<input type="number" id="${id}_n" ${onchange ? "onchange='" + onchange + "();'" : ""} ${negative ? "" : "min='0'"} ${readonly ? "readonly class='form-control-plaintext'" : "class='form-control'"} value="${num}">`);
}

function numFormCompHex(id, readonly, negative, onchange) {
    let num = BigInt.asUintN(bits(), BigInt($(`#${id}_n`).val() || '0'));
    if (readonly) $(`#${id}_nc`).html(`<input type="text" id="${id}_n" class="form-control-plaintext" value="0x${num.toString(16)}">`);
    else $(`#${id}_nc`).html(`<div class="input-group">
<div class="input-group-prepend"><div class="input-group-text">0x</div></div>
<input type="text" id="${id}_n" ${onchange ? "onchange='" + onchange + "();'" : ""} ${negative ? "" : "min='0'"} class="form-control" value="${num.toString(16)}">
</div>`);
}

function numFormComp(id, label, readonly, negative = true, onchange = undefined) {
    return `<div class="form-group">
<div class="row">
<label for="${id}" class="col-sm-4 col-form-label">${label}</label>
<div class="col-sm-2 btn-group btn-group-toggle" data-toggle="buttons">
<label class="btn btn-primary active"><input type="radio" name="${id}_ns" id="${id}_dec" autocomplete="off" checked onchange="numFormCompDec('${id}', ${readonly}, ${negative}, '${onchange}');">Dec</label>
<label class="btn btn-primary"><input type="radio" name="${id}_ns" id="${id}_hex" autocomplete="off" onchange="numFormCompHex('${id}', ${readonly}, ${negative}, '${onchange}');">Hex</label>
</div>
<div class="col-sm-6" id="${id}_nc"><input type="number" id="${id}_n" value="0" ${onchange ? "onchange='" + onchange + "();'" : ""} ${negative ? "" : "min='0'"} ${readonly ? "readonly class='form-control-plaintext'" : "class='form-control'"}></div>
</div>
<div class="row">
<div class="col-sm-6"></div>
<div class="col-sm-6"><small id="${id}_ne" style="display: none;" class="form-text text-danger">Invalid hex number</small></div>
</div>
</div>`;
}

function numFormCompGet(id) {
    const n = $(`#${id}_n`);
    try {
        const r = BigInt.asUintN(bits(), BigInt((n.attr("type") === "text" ? "0x" : "") + n.val()));
        $(`#${id}_ne`).css({display: 'none'});
        return r;
    }
    catch (e) {
        $(`#${id}_ne`).css({display: 'block'});
        return null;
    }
}

function numFormCompSet(id, v) {
    const n = $(`#${id}_n`);
    n.val((n.attr("type") === "text" ? "0x" : "") + BigInt.asUintN(bits(), v).toString(n.attr("type") === "text" ? 16 : 10));
}

function bits() {
    return +$("input[name=b_bits]:checked").attr('id').substring(3);
}

function b_inv() {
    const v = numFormCompGet("b_n");
    if (v !== null) numFormCompSet("b_r", BigInt.asUintN(bits(), ~v));
}

function b_shl() {
    const a = numFormCompGet("b_n1");
    const b = numFormCompGet("b_n2");
    if (a !== null && b !== null) numFormCompSet("b_r", BigInt.asUintN(bits(), a << b));
}

function b_shr() {
    const a = numFormCompGet("b_n1");
    const b = numFormCompGet("b_n2");
    if (a !== null && b !== null) numFormCompSet("b_r", BigInt.asUintN(bits(), a >> b));
}

function b_ext() {
    const v = numFormCompGet("b_n");
    const s = BigInt($("#b_sl").val());
    const e = BigInt($("#b_el").val());
    $("#b_ele").css({display: s > e ? "block" : "none"});
    if (v !== null && s <= e) numFormCompSet("b_r", BigInt.asUintN(bits(), (v >> s) & ((1n << (e - s)) - 1n)));
}

function opRecalc() {
    const op = $("#b_op").val();
    window[op]();
}

function opSel() {
    const op = $("#b_op").val();
    if (op === "b_inv") {
        $("#b_f").html(numFormComp("b_n", "Number", false, true, op) + numFormComp("b_r", "Result", true));
        $("#b_r_n").val(BigInt.asUintN(bits(), ~0n));
    }
    else if (op === "b_ext") {
        $("#b_f").html(numFormComp("b_n", "Number", false, true, op) + `<div class="form-group row">
<label for="b_sl" class="col-sm-6 col-form-label">Starting bit</label>
<div class="col-sm-6">
<input type="number" min="0" max="127" value="0" id="b_sl" class="form-control" onchange="b_ext();">
</div>
</div>
<div class="form-group">
<div class="row">
<label for="b_el" class="col-sm-6 col-form-label">Ending bit</label>
<div class="col-sm-6">
<input type="number" min="0" max="127" value="0" id="b_el" class="form-control" onchange="b_ext();">
</div>
</div>
<div class="row">
<div class="col-sm-6"></div>
<div class="col-sm-6"><small id="b_ele" style="display: none;" class="form-text text-danger">Ending bit cannot be less than starting bit</small></div>
</div>
</div>` + numFormComp("b_r", "Result", true));
    }
    else $("#b_f").html(numFormComp("b_n1", "First number", false, false, op) + numFormComp("b_n2", "Second number", false, false, op) + numFormComp("b_r", "Result", true));
}

/* DATES AND UNIX TIMESTAMPS */

$("#d_lt").change(function() {
    const date = new Date($(this).val());
    $("#d_gt").val(date.toISOString().slice(0, -1));
    $("#d_ut").val(Math.floor(date.getTime() / 1000));
});

$("#d_gt").change(function() {
    const date = new Date($(this).val());
    const newDate = new Date(date.toString().slice(0, date.toString().indexOf("GMT")) + "UTC");
    $("#d_lt").val(new Date(newDate.getTime() + newDate.getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19));
    $("#d_ut").val(Math.floor(newDate.getTime() / 1000));
});

$("#d_ut").change(function() {
    const date = new Date($(this).val() * 1000);
    $("#d_lt").val(new Date(date.getTime() + date.getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19));
    $("#d_gt").val(date.toISOString().slice(0, -1));
})