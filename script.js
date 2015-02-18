$(document).ready(function () {

  chooseRandomImage();

  var image = $('img');

  var prevGestures = [];
  
  function getXY (event) {
    return {
      x: event.originalEvent.changedTouches[0].pageX,
      y: event.originalEvent.changedTouches[0].pageY
    }
  }

  var PASSED = false;  
  var mask = $('#canv');
  
  mask.on("touchstart", function(ev) {
    PASSED = true;
    prevGestures.push(getXY(ev));
  });
  mask.on("touchmove", function(ev) {
    var coords = getXY(ev);
    var ins = checkIsIn(coords.x, coords.y, image[0]);
    if (!ins) {
      PASSED = false;
    }
    makeSpot(coords.x, coords.y, ins);
    if (prevGestures.length < 2) {
      prevGestures.push(getXY(ev));
    }
  });
  
  $('button').on('click', function (ev) {
    if (PASSED == 'restart') {
      chooseRandomImage();
      PASSED = false;  
      var canvas = document.getElementById("canvas");
      var context = canvas.getContext("2d");  
      context.clearRect(0, 0, canvas.width, canvas.height);
      this.innerHTML = 'Check';
    } else {
        var difference = calculatePixels () < 20;
        this.innerHTML = !PASSED || !difference? 'Didn\'t pass test. Try again?' : 'Passed. Try again?';
        PASSED = 'restart';
    }
  });
  
  
  function checkIsIn (X, Y, img) {
    if ((X > img.width) || (Y > img.height)) {
      return false;
    }
    var color = getColor(X, Y, img);
    return closeToColor(color[0], color[1], color[2]);
  }
  
  function getColor (X, Y, img) {
    var canvas = $('<canvas/>')[0];
    canvas.width = img.width;
    canvas.height = img.height;
    var d2 = canvas.getContext('2d');
    d2.drawImage(img, 0, 0, img.width, img.height);
    return d2.getImageData(X, Y, 1, 1).data;
  }
  
  function closeToColor (red, green, blue, basicColor) {
    var closeTo = function (a, b, exp) {
      return Math.abs(a - b) < exp;
    };
    var exp = 30;
    if (!basicColor) {
      return closeTo(red, 0, exp) && closeTo(green, 0, exp) && closeTo(blue, 0, exp);
    } else {
      return closeTo(red, basicColor.red, exp) && closeTo(green, basicColor.green, exp) && closeTo(blue, basicColor.blue, exp);
    }
  }
  
  function makeSpot (x, y, ins) {
      var canvas = document.getElementById("canvas");
      var ctx = canvas.getContext("2d");  
      ctx.globalAlpha = 0.50;
      ctx.beginPath();
      var radius = 25;
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = ins ? '#13a8a4' : 'red';
      ctx.fill();
  }
  
  function calculatePixels() {
    var canvas = $('<canvas/>')[0];
    canvas.width = image[0].width;
    canvas.height = image[0].height;
    var d2 = canvas.getContext('2d');
    d2.drawImage(image[0], 0, 0);
    var darkPixels = getColoredPixels (canvas);
    var maskCanvas = document.getElementById("canvas");
    var paintedPixels = getColoredPixels (maskCanvas, {
      red: 19,
      green: 168,
      blue: 164
    });
    return Math.abs((paintedPixels - darkPixels) / darkPixels * 100);
  }
  
  function getColoredPixels (canvas, basicColor) {
    var coloredPixels = 0;    
    var canvasContext = canvas.getContext('2d');
    var data = canvasContext.getImageData(0, 0, canvas.width, canvas.height).data;
    for (var i = 0; i < data.length; i+=4) {
        var red = data[i], green = data[i+1], blue = data[i+2];
        if (closeToColor(red, green, blue, basicColor)) {
          coloredPixels++;
        }      
    }
    return coloredPixels;
  }

  function chooseRandomImage () {
    var imagesList = ['s.png', 'e.png', 'p.png', 'h.png', 'o.png', 'r.png', 'a.png'];
    var image = $('img');
    image[0].src = 'img/' + imagesList[Math.round(Math.random() * imagesList.length)];
    image.on('load', function () {
      var canvas = $('canvas')[0];
      canvas.width = image.width();
      canvas.height = image.height();
      $('#canv').css({
        width: image.width(),
        height: image.height()
      });
      $('button').css({ top: image.height() + 20});
    });
  }
  
});