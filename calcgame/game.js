const GROUPS = 7;

const PSL = [
  null,
  "(2, 2)",
  "(\u03c0, 1)",
  "(\u221a2, 6)",
  "(1, 0.5)",
  "(0, -e)",
  "(0, \u03c0/2)",
  "(5, 100)",
];

document.getElementById("party").onclick = () => {
  $("#party").hide();
};

$(document).ready(() => {
  // Load the bank with possible elements
  let bankelems = [];
  for (let i = 1; i <= GROUPS; i++) {
    bankelems.push(
      "<div class='tile t" +
        i +
        "'><div class='tc'><img src='/calcgame/q/" +
        i +
        "/de.png'></div><p>Differential equation</p></div>"
    );
    bankelems.push(
      "<div class='tile t" +
        i +
        "'><div class='tc'><img src='/calcgame/q/" +
        i +
        "/gs.png'></div><p>General solution</p></div>"
    );
    bankelems.push(
      "<div class='tile t" +
        i +
        "'><div class='tc'><img src='/calcgame/q/" +
        i +
        "/ps.png'></div><p>Particular solution through " +
        PSL[i] +
        "</p></div>"
    );
    bankelems.push(
      "<div class='tile t" +
        i +
        "'><div class='tc'><img src='/calcgame/q/" +
        i +
        "/sf.png'></div><p>Slope field</p></div>"
    );
  }

  // Shuffle elements randomly
  let ci = bankelems.length;
  while (ci) {
    let ri = Math.floor(Math.random() * ci);
    ci--;
    let temp = bankelems[ci];
    bankelems[ci] = bankelems[ri];
    bankelems[ri] = temp;
  }

  let bankhtml = "";
  bankelems.forEach((e) => (bankhtml += e));
  $("#bank")
    .html(bankhtml)
    .sortable({
      connectWith: ".cg",
    })
    .disableSelection();
  $(".tg")
    .sortable({
      connectWith: ".cg",
      scroll: true,
      receive: function (event, ui) {
        if ($(this).children().length > 4) $(ui.sender).sortable("cancel");
      },
    })
    .disableSelection();
});

function checkResponses() {
  let html = "";
  for (let i = 1; i <= GROUPS; i++) {
    let e = $("#tg" + i);
    let good = true;
    let cls = null;
    let elems = e.children();
    if (elems.length != 4) {
      html +=
        "<p style='color: red;'>Group " + i + " does not have 4 tiles</p>";
      $(`#stat${i}`).html("Group does not have 4 cards.");
      $(`#stat${i}`).addClass("red");
      $(`#stat${i}`).removeClass("green");
      continue;
    }
    for (let j = 0; j < elems.length; j++) {
      if (!cls) {
        for (const c of elems[j].classList) {
          var match = /t(\d+)/g.exec(c);
          if (match) cls = match[0];
        }
      } else if (!$(elems[j]).hasClass(cls)) {
        good = false;
        break;
      }
    }
    if (!good) {
      html +=
        "<p style='color: red;'>Group " +
        i +
        " has one or more incorrect tiles</p>";
      $(`#stat${i}`).html("Group has 1+ incorrect cards.");
      $(`#stat${i}`).addClass("red");
    } else {
      $(`#stat${i}`).html("Good!");
      $(`#stat${i}`).addClass("green");
      $(`#stat${i}`).removeClass("red");
    }
  }
  if (!html) {
    $("#party").css("display", "flex");

    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function () {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 150 * (timeLeft / duration);

      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  }
}

function toggleGroup(el, id) {
  if (el.innerHTML == "Show") {
    el.innerHTML = "Hide";
    $("#tg" + id).css({ display: "block" });
  } else {
    el.innerHTML = "Show";
    $("#tg" + id).css({ display: "none" });
  }
}
