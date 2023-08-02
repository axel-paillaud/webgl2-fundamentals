var vertexShaderSource = `#version 300 es
in vec2 a_position;

uniform vec2 u_resolution;

uniform vec2 u_translation;

void main() {
    // Add in the translation
    vec2 position = a_position + u_translation;
    
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

var fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
    outColor = u_color;
}
`;

function main() {
    var canvas = document.getElementById("c");
    var rightButton = document.getElementById("right-button");
    var leftButton = document.getElementById("left-button");

    var gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("WebGL not available for this browser, sorry !");
        return;
    }

    var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

    var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    var resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    var colorLocation = gl.getUniformLocation(program, 'u_color');
    var translationLocation = gl.getUniformLocation(program, 'u_translation');
    var positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(positionAttributeLocation);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    var translation = [0, 0];
    var width = 100;
    var height = 30;
    var color = [Math.random(), Math.random(), Math.random(), 1];

    drawScene();

    var mousedownID = -1;
    rightButton.addEventListener('mousedown', (e) => {
        if (mousedownID == -1) {
            mousedownID = setInterval(() => {
                translation[0] += 1;
                drawScene();
            }, 50);
        };
    });

    rightButton.addEventListener('mouseup', () => {
        if (mousedownID != -1) {
            clearInterval(mousedownID);
            mousedownID = -1;
        }
    });
    
    leftButton.addEventListener('mousedown', (e) => {
        if (mousedownID == -1) {
            mousedownID = setInterval(() => {
                translation[0] -= 1;
                drawScene();
            }, 50);
        };
    });

    leftButton.addEventListener('mouseup', () => {
        if (mousedownID != -1) {
            clearInterval(mousedownID);
            mousedownID = -1;
        }
    });

    function drawScene() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.bindVertexArray(vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        //setRectangle(gl, translation[0], translation[1], width, height);
        setGeometry(gl);
        
        gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]);
        gl.uniform2f(translationLocation, translation[0], translation[1]);

        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 18;
        gl.drawArrays(primitiveType, offset, count);
    }
}

function randomInt(range) {
    return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2
    ]), gl.STATIC_DRAW);
}

function setGeometry(gl) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        // left column
        0,0,
        30, 0,
        0, 150,
        0, 150,
        30, 0,
        30, 150,

        //top rung
        30, 0,
        100, 0,
        30, 30,
        30, 30,
        100, 0,
        100, 30,

        // middle rung
        30, 60,
        67, 60,
        30, 90,
        30, 90,
        67, 60,
        67, 90
    ]), gl.STATIC_DRAW);
}

main();

