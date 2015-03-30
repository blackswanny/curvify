(function (exports) {
    function getXY(event) {
        return {
            x: event.changedTouches[0].pageX,
            y: event.changedTouches[0].pageY
        }
    }

    function checkIsIn(x, y, img, basicColor) {
        if ((x > img.width) || (y > img.height)) {
            return false;
        }
        var color = getColorData(img, {
            x: x,
            y: y
        });
        return closeToColor(color[0], color[1], color[2], basicColor);
    }

    function getColorData(img, onePixel) {
        var canvas = document.createElement('canvas');
        var width = img.offsetWidth;
        var height = img.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        var d2 = canvas.getContext('2d');
        d2.drawImage(img, 0, 0, width, height);
        var data;
        if (onePixel) {
            data = d2.getImageData(onePixel.x, onePixel.y, 1, 1).data;
        } else {
            data = d2.getImageData(0, 0, canvas.width, canvas.height).data;
        }
        return data;
    }

    function getColoredPixels(data, basicColor) {
        var coloredPixels = 0;
        for (var i = 0; i < data.length; i += 4) {
            var red = data[i], green = data[i + 1], blue = data[i + 2];
            if (closeToColor(red, green, blue, basicColor)) {
                coloredPixels++;
            }
        }
        return coloredPixels;
    }

    function calculatePixels() {
        var data = getColorData(this.image);
        var darkPixels = getColoredPixels(data, this.opts.color);
        var maskCanvas = this.canvas;
        var maskData = maskCanvas.getContext('2d').getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
        var paintedPixels = getColoredPixels(maskData, {
            red: 19,
            green: 168,
            blue: 164
        });
        return Math.abs((paintedPixels - darkPixels) / darkPixels * 100);
    }

    function closeToColor(red, green, blue, basicColor) {
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

    function makeSpot(x, y, color, canvas) {
        var ctx = canvas.getContext("2d");
        ctx.globalAlpha = this.opts.opacity;
        ctx.beginPath();
        ctx.arc(x, y, this.opts.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function setCanvasAndMask(image, canvas, mask) {
        canvas.width = image.offsetWidth;
        canvas.height = image.offsetHeight;
        mask.style.height = image.offsetHeight + 'px';
        mask.style.width = image.offsetWidth + 'px';
    }

    function refresh() {
        var context = this.canvas.getContext("2d");
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.PASSED = false;
        this.prevGestures = [];
    }

    function check() {
        var difference = calculatePixels.call(this) < 20;
        var check = !this.PASSED || !difference;
        this.refresh(this.canvas);
        return check;
    }

    exports.Curvify = function (options) {
        this.opts = {
            color: [],
            img: null,
            correctColor: '#13a8a4',
            opacity: 0.5,
            radius: 25,
            threshold: 20,
            mistakes: false,
            mistakesColor: 'red'
        };
        for (var prop in options) {
            this.opts[prop] = options[prop];
        }
        this.prevGestures = [];
        this.PASSED = false;

        var image = this.opts.img;
        this.image = image;
        var canvas = document.createElement('canvas');
        this.canvas = canvas;
        var mask = document.createElement('div');
        canvas.style.position = "absolute";
        canvas.style.left = 0;
        canvas.style.top = 0;
        mask.style.position = "absolute";
        mask.style.left = 0;
        mask.style.top = 0;
        image.parentNode.appendChild(canvas);
        image.parentNode.appendChild(mask);
        image.addEventListener('load', function () {
            setCanvasAndMask(image, canvas, mask);
        });
        setCanvasAndMask(image, canvas, mask);
        mask.addEventListener("touchstart", function (ev) {
            this.PASSED = true;
            this.prevGestures.push(getXY(ev));
        }.bind(this));
        mask.addEventListener("touchmove", function (ev) {
            var coords = getXY(ev);
            var ins = checkIsIn(coords.x, coords.y, image, this.opts.color);
            if (!ins) {
                this.PASSED = false;
                if (this.opts.mistakes) {
                    makeSpot.call(this, coords.x, coords.y, this.opts.mistakesColor, canvas);
                }
            } else {
                makeSpot.call(this, coords.x, coords.y, this.opts.correctColor, canvas);
            }
            if (this.prevGestures.length < 2) {
                this.prevGestures.push(getXY(ev));
            }
        }.bind(this));

        this.check = check;
        this.refresh = refresh;
    };

})(window);