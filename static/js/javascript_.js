var basePosition = [null,null,null]

var currentInning = 1;
var currentRuns = 0;
var outs = 0;

var awayTeamRuns = 0;
var homeTeamRuns = 0;

var awayTeam = {
  data: awayTeamData,
  text: "away",
  runs: 0,
  batter: 0,
  batterInfo: awayTeamData.lineup,
  pitcher: awayTeamData.rotation[0],
  currentIP: 0,
  currentER: 0
}

var homeTeam = {
  data: homeTeamData,
  text: "home",
  runs: 0,
  batter: 0,
  batterInfo: homeTeamData.lineup,
  pitcher: homeTeamData.rotation[0],
  currentIP: 0,
  currentER: 0
}

if (userTeam == "away") {
  userTeam = awayTeam;
} else {
  userTeam = homeTeam;
}

var currentTeam = awayTeam;
var currentTeamRuns = currentTeam.runs;
var currentBatter = currentTeam.batter;

var defenseTeam = homeTeam;

var batter = currentTeam.batterInfo[currentBatter];

var pitcher = homeTeam.pitcher;

var roll = function() {
  return Math.floor(Math.random() * Math.floor(20)) + 1;
};

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  // handle case of empty input
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

var endGame = function() {
  if (userTeam == homeTeam && homeTeam.runs > awayTeam.runs) {
    $("#winning-modal").modal({
      backdrop: 'static',
      keyboard: false
    });
  } else if (userTeam == awayTeam && homeTeam.runs < awayTeam.runs) {
    $("#winning-modal").modal({
      backdrop: 'static',
      keyboard: false
    });
  } else {
    $("#losing-modal").modal({
      backdrop: 'static',
      keyboard: false
    });
  }
}

var infieldDefense = function() {
  if (currentTeam = awayTeam) {
    return Number($("#home-1B-value").text()) + Number($("#home-2B-value").text()) + Number($("#home-SS-value").text()) + Number($("#home-3B-value").text());
  } else {
    return Number($("#away-1B-value").text()) + Number($("#away-2B-value").text()) + Number($("#away-SS-value").text()) + Number($("#away-3B-value").text());
  }

};

var changeBatter = function(batter) {
  if (batter.pos == "Starter" || batter.pos == "Reliever" || batter.pos == "Closer") {

    $("#batters-box").attr("src", playerImage(batter));
    $("#batter-name").text(htmlDecode(batter.name));
    $("#batter-ob").text("OB: -");
    $("#batter-so").text("-");
    $("#batter-gb").text("-");
    $("#batter-fb").text("-");
    $("#batter-bb").text("-");
    $("#batter-1b").text("-");
    $("#batter-1b-plus").text("-");
    $("#batter-2b").text("-");
    $("#batter-3b").text("-");
    $("#batter-hr").text("-");
  } else {
    $("#batters-box").attr("src", playerImage(batter));
    $("#batter-name").text(htmlDecode(batter.name));
    $("#batter-ob").text("OB: " + batter.onBase);
    $("#batter-so").text(batter.strikeOut);
    $("#batter-gb").text(batter.groundBall);
    $("#batter-fb").text(batter.flyBall);
    $("#batter-bb").text(batter.walk);
    $("#batter-1b").text(batter.single);
    $("#batter-1b-plus").text(batter.singlePlus);
    $("#batter-2b").text(batter.double);
    $("#batter-3b").text(batter.triple);
    $("#batter-hr").text(batter.homeRun);
  }
}

var changePitcher = function(pitcher) {
  if (pitcher.pos == "Starter" || pitcher.pos == "Reliever" || pitcher.pos == "Closer") {
    $("#pitcher-img").attr("src", playerImage(pitcher));
    $("#pitcher-name").text(htmlDecode(pitcher.name));
    $("#pitcher-con").text("Con: " + pitcher.onBase);
    if (defenseTeam.currentIP >= pitcher.speed) {
      $("#pitcher-ip").addClass("text-danger");
      if (defenseTeam == userTeam) {
        if ($("#" + defenseTeam.text + "-bullpen").find("div").length != 0) {
          $("#" + defenseTeam.text + "BullpenModal").modal('show');
        }
      }
    } else {
      $("#pitcher-ip").removeClass("text-danger");
    }
    $("#pitcher-ip").text(defenseTeam.currentIP + "/" + pitcher.speed);
    $("#pitcher-pu").text(pitcher.popUp);
    $("#pitcher-so").text(pitcher.strikeOut);
    $("#pitcher-gb").text(pitcher.groundBall);
    $("#pitcher-fb").text(pitcher.flyBall);
    $("#pitcher-bb").text(pitcher.walk);
    $("#pitcher-1b").text(pitcher.single);
    $("#pitcher-2b").text(pitcher.double);
    $("#pitcher-hr").text(pitcher.homeRun);
  } else {
    $("#pitcher-img").attr("src", playerImage(pitcher));
    $("#pitcher-name").text(htmlDecode(pitcher.name));
    $("#pitcher-con").text("Con: -");
    $("#pitcher-ip").addClass("text-danger");
    $("#pitcher-ip").text("-/-");
    $("#pitcher-pu").text("-");
    $("#pitcher-so").text("-");
    $("#pitcher-gb").text("-");
    $("#pitcher-fb").text("-");
    $("#pitcher-bb").text("-");
    $("#pitcher-1b").text("-");
    $("#pitcher-2b").text("-");
    $("#pitcher-hr").text("-");
    if (defenseTeam == userTeam) {
      if ($("#" + defenseTeam.text + "-bullpen").find("div").length != 0) {
        $("#" + defenseTeam.text + "BullpenModal").modal('show');
      }
    }
  }
}

var checkResult = function (player, roll) {
  if (roll == player.popUp.split('-')[0] || roll <= player.popUp.split('-')[1]) {
    outs += 1;
    return "Pop Up";
  } else if (roll == player.strikeOut.split('-')[0] || roll <= player.strikeOut.split('-')[1]) {
    outs += 1;
    return "Strike Out";
  } else if (roll == player.groundBall.split('-')[0] || roll <= player.groundBall.split('-')[1]) {
    outs += 1;
    result = "Ground ball";
    if (outs < 3 && basePosition[0] != null) {
      infieldRoll = Math.floor(Math.random() * Math.floor(20)) + 1;
      currentDefense = Number($("#" + defenseTeam.text + "-1B-value").text()) + Number($("#" + defenseTeam.text + "-2B-value").text()) + Number($("#" + defenseTeam.text + "-SS-value").text()) + Number($("#" + defenseTeam.text + "-3B-value").text());
      infieldResult = infieldRoll + currentDefense;
      if (infieldResult > basePosition[0].speed) {
        basePosition[0] = null;
        outs += 1;
        result = "Double Play"
      }
    }
    if (outs < 3) {
      basePosition.unshift(null);
    }
    return result;
  } else if (roll == player.flyBall.split('-')[0] || roll <= player.flyBall.split('-')[1]) {
    outs += 1;
    if (outs < 3) {
      if (basePosition[2] != null && basePosition[2].speed >= 15) {
        basePosition.push(basePosition[2]);
        basePosition[2] = null;
      }
      if (basePosition[1] != null && basePosition[2] == null && basePosition[1].speed >= 20) {
        basePosition[2] = basePosition[1];
        basePosition[1] = null;
      }
    }
    return "Fly ball";
  } else if (roll == player.walk.split('-')[0] || roll <= player.walk.split('-')[1]) {
    if (basePosition[0] == null) {
      basePosition[0] = batter;
    } else if (basePosition[0] != null && basePosition[1] == null && basePosition[2] != null) {
      basePosition[1] = basePosition[0];
      basePosition[0] = batter;
    } else {
      basePosition.unshift(batter);
    }
    return "Walk";
  } else if (roll == player.single.split('-')[0] || roll <= player.single.split('-')[1]) {
    basePosition.unshift(batter);
    return "Single";
  } else if (roll == player.singlePlus.split('-')[0] || roll <= player.singlePlus.split('-')[1]) {
    if (basePosition[0] == null) {
      basePosition.unshift(null, batter);
    } else if (basePosition[0] != null && basePosition[1] != null) {
      basePosition.unshift(batter, basePosition[0], null);
      basePosition[3] = null;
    } else {
      basePosition.unshift(batter);
    }
    return "Single Plus";
  } else if (roll == player.double.split('-')[0] || roll <= player.double.split('-')[1]) {
    if (outs == 2 && basePosition[0] != null && basePosition[0].speed >= 20){
      basePosition.unshift(null,batter,null);
    } else {
      basePosition.unshift(null,batter);
    }
    return "Double";
  } else if (roll == player.triple.split('-')[0] || roll <= player.triple.split('-')[1]) {
    basePosition.unshift(null,null,batter);
    return "Triple";
  } else if (roll >= player.homeRun.split('+')[0]) {
    basePosition.unshift(null,null,null,batter);
    return "Home Run";
  }
}

var updateBases = function() {
  bases = ["#first-base", "#second-base", "#third-base"]
  for (i = 0; i < 3; i++) {
    if (basePosition[i] != null){
      $(bases[i] + "-img").attr("src", playerImage(basePosition[i]));
      $(bases[i] + "-name").text(htmlDecode(basePosition[i].name));
      if (basePosition[i].pos == "Starter" || basePosition[i].pos == "Reliever" || basePosition[i].pos == "Closer") {
        basePosition[i].speed = 10;
      }
      $(bases[i] + "-speed").text("SPD: " + basePosition[i].speed);
      if (i <= 1 && basePosition[i + 1] == null && currentTeam == userTeam) {
        $(bases[i]).popover('show');
      } else {
        $(bases[i]).popover('hide');
      }
    } else {
      $(bases[i] + "-img").attr("src", "static/image/card_imgs/_base.jpg");
      $(bases[i] + "-name").html("<br>");
      $(bases[i] + "-speed").html("<br>");
      $(bases[i]).popover('hide');
    }
  };
}

var endInning = function() {
  //Switch innings
  outs = 0;
  $("#outs").html('<i class="far fa-circle"></i> <i class="far fa-circle">');
  currentRuns = 0;
  basePosition = [null,null,null];
  if ($("#var-button").text() == "Bunt") {
    $("#var-button").text("IBB");
  } else {
    $("#var-button").text("Bunt");
  }
  if (currentTeam == awayTeam) {
    pitcher = awayTeam.pitcher;
    currentTeam = homeTeam;
    defenseTeam = awayTeam;
    $("#inning").html(currentInning + ' <i class="fas fa-caret-down"></i>');
    $("#away-runs-" + currentInning).removeClass("bg-secondary");
    $("#home-runs-" + currentInning).addClass("bg-secondary");
    $("#home-runs-" + currentInning).text("0");
    if (currentInning >= 9 && homeTeam.runs > awayTeam.runs) {
      endGame()
    }

  } else {
    pitcher = homeTeam.pitcher;
    currentTeam = awayTeam;
    defenseTeam = homeTeam;
    $("#home-runs-" + currentInning).removeClass("bg-secondary");
    currentInning += 1;
    if (currentInning > 9) {
      $("#inning-" + String(currentInning - 1)).after('<th id="inning-' + currentInning + '" scope="col">' + currentInning + '</th>')
      $("#away-runs-" + String(currentInning - 1)).after('<td id="away-runs-' + currentInning + '">&nbsp;</td>')
      $("#home-runs-" + String(currentInning - 1)).after('<td id="home-runs-' + currentInning + '">&nbsp;</td>')
    }
    $("#inning").html(currentInning + ' <i class="fas fa-caret-up"></i>');
    $("#away-runs-" + currentInning).addClass("bg-secondary");
    $("#away-runs-" + currentInning).text("0");
  }
  if (currentInning > 1) {
    defenseTeam.currentIP += 1;
  }
  if (defenseTeam.currentIP >= pitcher.speed) {
    pitcher.onBase -= 1;
  }
  $("#test-box").append("<br>-----END OF INNING-----<br>").animate({scrollTop: $("#test-box").prop("scrollHeight")}, 100);
  if (defenseTeam.currentIP >= pitcher.speed && defenseTeam != userTeam) {
    oldPitcher = pitcher;
    rotation = defenseTeam.data.rotation
    if (currentInning >= 9 && defenseTeam.runs > currentTeam.runs && defenseTeam.runs - currentTeam.runs <= 3) {
      pitcher = rotation[rotation.length - 1];
    } else if (currentInning == 8) {
      pitcher = rotation[rotation.length - 2];
    } else {
      pitcher = rotation[1];
      rotation.slice(1,1);
    }
    defenseTeam.currentIP = 0;
    defenseTeam.currentER = 0;
    defenseTeam.pitcher = pitcher;
    $("#test-box").append(pitcher.name + " replaces " + oldPitcher.name +"<br>").animate({scrollTop: $("#test-box").prop("scrollHeight")}, 100);
  }
  if (defenseTeam == userTeam) {
    $('.replace-pitcher').prop('disabled', false);
    $('.replace-batter').prop('disabled', true);
  } else {
    $('.replace-pitcher').prop('disabled', true);
    $('.replace-batter').prop('disabled', false);
  }
  batter = currentTeam.batterInfo[currentTeam.batter];
  changeBatter(batter);
  changePitcher(pitcher);
}

var endPlay = function() {
  if (basePosition.length > 3) {
    for (i = 3; i < basePosition.length; i++){
      if (basePosition[i] != null) {
        currentRuns += 1;
        currentTeam.runs += 1;
        defenseTeam.currentER += 1;
        $("#test-box").append(basePosition[i].name + " scored <br>").animate({scrollTop: $("#test-box").prop("scrollHeight")}, 100);
      }
    };
    if (Math.floor(defenseTeam.currentER / 3) >= 1) {
      pitcher.onBase -= Math.floor(defenseTeam.currentER / 3);
      defenseTeam.currentER = 0;
    }
    $("#pitcher-con").text("Con: " + pitcher.onBase);
    $("#" + currentTeam.text + "-runs-" + String(currentInning)).text(currentRuns);
    $("." + currentTeam.text + "-runs").text(currentTeam.runs);
    basePosition.length = 3;
  }

  $("#" + currentTeam.text + "-batter-" + String(currentTeam.batter + 1)).removeClass("bg-secondary");
  if (currentTeam.batter < 8) {
    currentTeam.batter += 1;
  } else {
    currentTeam.batter = 0;
  }
  $("#" + currentTeam.text + "-batter-" + String(currentTeam.batter + 1)).addClass("bg-secondary");
  if (currentInning >= 9 && currentTeam == homeTeam && homeTeam.runs > awayTeam.runs) {
    endGame();
  }

  if (outs >= 3) {
    //End of game
    if (currentInning > 9 && awayTeam.runs < homeTeam.runs) {

      endGame();

    } else if (currentInning >= 9 && currentTeam == homeTeam && awayTeam.runs > homeTeam.runs) {

      endGame();

    } else {

      endInning();

    }

  } else {

    $("#" + currentTeam.text + "-batter-" + String(currentTeam.batter + 1)).addClass("bg-secondary");
    batter = currentTeam.batterInfo[currentTeam.batter];
    changeBatter(batter);

  }
  $("#test-box").append("<br> Now batting: " + batter.name + " (OB: " + batter.onBase + ")<br>");

  updateBases();

  if (outs == 1) {
    $("#outs").html('<i class="fas fa-circle"></i> <i class="far fa-circle">');
  } else if (outs == 2) {
    $("#outs").html('<i class="fas fa-circle"></i> <i class="fas fa-circle">');
  }

}

$("#roll-button").click(function () {
  var rollResult = roll()
  if (batter.pos == "Starter" || batter.pos == "Reliever" || batter.pos == "Closer") {
    advantage = pitcher;
  } else if (pitcher.pos != "Starter" && pitcher.pos != "Reliever" && pitcher.pos != "Closer") {
    advantage = batter;
  } else if (pitcher.pos == "Starter" || pitcher.pos == "Reliever" || pitcher.pos == "Closer") {
    if (pitcher.onBase + rollResult >= batter.onBase) {
      advantage = pitcher;
    } else if (pitcher.onBase + rollResult < batter.onBase) {
      advantage = batter;
    }
  } else {
    advantage = batter;
  }
  $("#test-box").append("Advantage: " + advantage.name + " (Roll: " + rollResult + ")<br>").animate({scrollTop: $("#test-box").prop("scrollHeight")}, 100);
  pitchRoll = roll();
  playResult = checkResult(advantage, pitchRoll);
  //playResult = checkResult(batter, 14);
  $("#test-box").append("Result: " + playResult + " (Roll: " + pitchRoll + ")<br>").animate({scrollTop: $("#test-box").prop("scrollHeight")}, 100);
  endPlay();
});

$("#var-button").click(function () {
  if ($("#var-button").text() == "Bunt") {
    outs += 1;
    basePosition.unshift(null);
    $("#test-box").append("Sac Bunt<br>").animate({scrollTop: $("#test-box").prop("scrollHeight")}, 100);
  } else {
    if (basePosition[0] == null) {
      basePosition[0] = batter;
    } else if (basePosition[0] != null && basePosition[1] == null && basePosition[2] != null) {
      basePosition[1] = basePosition[0];
      basePosition[0] = batter;
    } else {
      basePosition.unshift(batter);
    }
    $("#test-box").append("Intentional Walk<br>").animate({scrollTop: $("#test-box").prop("scrollHeight")}, 100);
  }
  endPlay();
});

$("#first-base").popover({
  html: true,
  content: '<button class="btn btn-sm btn-secondary steal-button" id="steal-first">Steal</button>',
  //template: '<div class="popover bg-dark" role="tooltip"><div class=""></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
  trigger: "manual"
});

$("#second-base").popover({
  html: true,
  content: '<button class="btn btn-sm btn-secondary steal-button" id="steal-second">Steal</button>',
  //template: '<div class="popover bg-dark" role="tooltip"><div class=""></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
  trigger: "manual"
});

$("#pitcher").click(function () {
  if (defenseTeam == userTeam) {
    $("#" + defenseTeam.text + "BullpenModal").modal('show');
  }
});

$("#batter").click(function () {
  if (currentTeam == userTeam) {
    $("#" + currentTeam.text + "BenchModal").modal('show');
  }
});

$(document).on('click', '.steal-button', function(){
  catcherRoll = roll();
  catcherArm = Number($("#" + defenseTeam.text + "-C-value").text());
  if ($(this).attr('id') == "steal-first") {
    runner = 0;
    base = "second"
  } else {
    runner = 1;
    base = "third"
    catcherRoll += 5;
  }
  if (batter.pos == "Starter" || batter.pos == "Reliever" || batter.pos == "Closer") {
    basePosition[runner].speed = 10;
  }
  if (catcherRoll + catcherArm <= basePosition[runner].speed) {
    result = basePosition[runner].name + " stole " + base;
    basePosition[runner + 1] = basePosition[runner];
    basePosition[runner] = null;
  } else {
    result = basePosition[runner].name + " was thrown out attempting to steal " + base;
    basePosition[runner] = null;
    outs += 1;
  }
  $("#test-box").append(result + "<br>").animate({scrollTop: $("#test-box").prop("scrollHeight")}, 100);
  updateBases();
  if (outs == 1) {
    $("#outs").html('<i class="fas fa-circle"></i> <i class="far fa-circle">');
  } else if (outs == 2) {
    $("#outs").html('<i class="fas fa-circle"></i> <i class="fas fa-circle">');
  } else if (outs == 3) {
    endInning();
  }
});

$(document).on('click', '.replace-pitcher', function(){
  pitcherNumber = $(this).attr('id').split("-")[2]
  newPitcher = defenseTeam.data.rotation[pitcherNumber]
  $("#test-box").append(newPitcher.name + " replaces " + pitcher.name +"<br>").animate({scrollTop: $("#test-box").prop("scrollHeight")}, 100);
  defenseTeam.pitcher = newPitcher;
  pitcher = newPitcher;
  defenseTeam.currentIP = 0;
  defenseTeam.currentER = 0;
  pitchersSpot = defenseTeam.data.pitchersSpot;
  if (pitchersSpot != null) {
    defenseTeam.data.lineup[pitchersSpot] = pitcher;
    $("#" + defenseTeam.text + "-batter-" + (pitchersSpot + 1)).html('<th scope="row">' + (pitchersSpot + 1) + '</th><td>' + pitcher.name + '</td><td>P</td>');
  }
  changePitcher(pitcher);
  $("#" + defenseTeam.text + "BullpenModal").modal('hide');
  $(this).parent().parent().parent().remove();
});

$(document).on('click', '.replace-batter', function(){
  position = $("#" + currentTeam.text + "-batter-" + (currentTeam.batter + 1)).find("span").attr('id');
  batterNumber = $(this).attr('id').split("-")[2]
  newBatter = currentTeam.data.lineup[batterNumber]
  plusOrMinus = ''
  $("#test-box").append(newBatter.name + " (OB: " + newBatter.onBase + ") pinch hits for " + batter.name +"<br>").animate({scrollTop: $("#test-box").prop("scrollHeight")}, 100);
  currentTeam.data.lineup[currentTeam.batter] = newBatter;
  batter = newBatter;
  batterPos = batter.pos.split(",")
  //if position != P
  if (typeof position != "undefined") {
    position = position.split("-")[1];
    for (i = 0; i < batterPos.length; i++) {
      if (batterPos[i].includes(position)) {
        positionValue = batterPos[i].split("+")[1]
        plusOrMinus = '+'
      } else {
        positionValue = -2
      }
    }
    $("#" + currentTeam.text + "-batter-" + (currentTeam.batter + 1)).html('<th scope="row">' + (currentTeam.batter + 1) + '</th><td>' + batter.name + '</td><td>' + position + ' ' + plusOrMinus +'<span id="home-' + position + '-value">' + positionValue + '</td>');
  } else {
    currentTeam.pitcher = batter;
    currentTeam.currentIP = 0;
    currentTeam.currentER = 0;
    position = "PH"
    $("#" + currentTeam.text + "-batter-" + (currentTeam.batter + 1)).html('<th scope="row">' + (currentTeam.batter + 1) + '</th><td>' + batter.name + '</td><td>' + position + '</td>');
  }

  changeBatter(batter);
  $("#" + currentTeam.text + "BenchModal").modal('hide');
  $(this).parent().parent().parent().remove();
});


var init = function() {
  $("#test-box").append("Now batting: " + batter.name + " (OB: " + batter.onBase + ")<br>");
  changeBatter(batter);
  changePitcher(pitcher);
  $("#away-runs-1").addClass("bg-secondary");
  $("#away-runs-1").text("0");
  $("#away-batter-" + String(currentTeam.batter + 1)).addClass("bg-secondary");
  $("#home-batter-" + String(currentTeam.batter + 1)).addClass("bg-secondary");
};

init();
