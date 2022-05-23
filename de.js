const graph = document.getElementById("graph");

function canvasX(x) {
    return 40 * (x + 9) + 20;
}

function canvasY(y) {
    return 40 * (9 - y) + 20;
}

function drawSlopeFields(ctx, expr) {
    ctx.lineWidth = 3;
    for (let x = -9; x < 10; x++) {
        for (let y = -9; y < 10; y++) {
            let m = expr.eval(x, y);
            ctx.beginPath();
            // Work around the differences in numbering for Cartesian
            // coordinates vs the canvas coordinates
            let bx = canvasX(x);
            let by = canvasY(y);
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
}

function drawPoint(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'black';
    ctx.fill();
}

function drawGraph(ctx) {
    ctx.clearRect(0, 0, graph.width, graph.height);

    // Draw grid
    for (let x = 0; x < 19; x++) {
        ctx.beginPath();
        if (x === 9)
            ctx.lineWidth = 3;
        else
            ctx.lineWidth = 1;
        ctx.moveTo(x * 40 + 20, 0);
        ctx.lineTo(x * 40 + 20, graph.height);
        ctx.stroke();
    }
    for (let y = 0; y < 19; y++) {
        ctx.beginPath();
        if (y === 9)
            ctx.lineWidth = 2;
        else
            ctx.lineWidth = 1;
        ctx.moveTo(0, y * 40 + 20);
        ctx.lineTo(graph.width, y * 40 + 20);
        ctx.stroke();
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

function drawLine(ctx, a, b) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
    ctx.lineWidth = 1;
}

function fillPointsTable(table) {
    let str = "";
    for (let i = 0; i < table.length; i++) {
        str += "<tr><td>" + table[i][0].toFixed(3) + "</td><td>" + table[i][1].toFixed(3) + "</td></tr>";
    }
    $("#points_table").html(str);
}

function drawSolution(ctx, expr) {
    let last = null;
    if (document.getElementById("euler_method").checked) {
        let x = parseFloat($("#px").val());
        let y = parseFloat($("#py").val());
        let end = parseFloat($("#endpoint").val());
        let step = parseFloat($("#step").val());
        let points = [];
        if (!step)
            step = 1;
        if (end < x) {
            if (step > 0)
                step = -step;
            for (let i = x; i >= end; i += step) {
                let bx = canvasX(i);
                let by = canvasY(y);
                if (last)
                    drawLine(ctx, last, [bx, by]);
                drawPoint(ctx, bx, by);
                last = [bx, by];
                points.push([i, y]);
                y += expr.eval(i, y) * step;
            }
        }
        else {
            if (step < 0)
                step = -step;
            for (let i = x; i <= end; i += step) {
                let bx = canvasX(i);
                let by = canvasY(y);
                if (last)
                    drawLine(ctx, last, [bx, by]);
                drawPoint(ctx, bx, by);
                last = [bx, by];
                points.push([i, y]);
                y += expr.eval(i, y) * step;
            }
        }
        fillPointsTable(points);
    }
    else {
        const step = 0.005;
        let x = parseFloat($("#px").val());
        let oy = parseFloat($("#py").val());
        let y = oy;
        for (let i = x; i <= 9.5; i += step) {
            let bx = canvasX(i);
            let by = canvasY(y);
            if (last)
                drawLine(ctx, last, [bx, by]);
            last = [bx, by];
            y += expr.eval(i, y) * step;
        }
        last = null;
        y = oy;
        for (let i = x; i >= -9.5; i -= step) {
            let bx = canvasX(i);
            let by = canvasY(y);
            if (last)
                drawLine(ctx, last, [bx, by]);
            last = [bx, by];
            y -= expr.eval(i, y) * step;
        }
        drawPoint(ctx, canvasX(x), canvasY(oy));
        $("#points_table").html("");
    }
}

function updateGraph() {
    text = $("#equation").val();
    let expr = parseExpr();
    if (!expr) {
        document.getElementById("invalid").style.display = "block";
        return;
    }
    else
        document.getElementById("invalid").style.display = "none";
    let ctx = graph.getContext("2d");
    drawGraph(ctx);

    if (document.getElementById("slope_field").checked)
        drawSlopeFields(ctx, expr);
    if (document.getElementById("sol").checked)
        drawSolution(ctx, expr);
}

function evaluateX() {
    const step = 0.00001;
    text = $("#equation").val();
    let expr = parseExpr();
    if (!expr) {
        document.getElementById("invalid").style.display = "block";
        return;
    }
    let ex = parseFloat($("#eval_x").val());
    let x = parseFloat($("#px").val());
    let y = parseFloat($("#py").val());
    if (ex > x) {
        for (let i = x; i <= ex; i += step) {
            y += expr.eval(i, y) * step;
        }
    }
    else {
        for (let i = x; i >= ex; i -= step) {
            y -= expr.eval(i, y) * step;
        }
    }
    $("#eval_result").html("Result: " + parseFloat(y.toFixed(4)));
}

$(document).ready(() => {
    drawGraph(graph.getContext("2d"));
    $("#euler_method").change(() => {
        if ($("#euler_method").is(":checked")) {
            $(".euler").removeAttr("disabled");
        }
        else {
            $(".euler").attr("disabled", "disabled");
        }
    });
});