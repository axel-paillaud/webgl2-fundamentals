var vertexShaderSource = `#version 300 es
in vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_rotation;
uniform vec2 u_scale;

void main() {
    // Scale the position
    vec2 scaledPosition = a_position * u_scale;

    // Rotate the position
    vec2 rotatedPosition = vec2(
        scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
        scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
    );

    // Add in the translation
    vec2 position = rotatedPosition + u_translation;
    
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
    var rotationButton = document.getElementById("rotate-button");
    var scaleUpButton = document.getElementById("scale-up-button");
    var scaleDownButton = document.getElementById("scale-down-button");

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
    var rotationLocation = gl.getUniformLocation(program, 'u_rotation');
    var scaleLocation = gl.getUniformLocation(program, 'u_scale');

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

    var translation = [100, 100];
    var rotation = [0, 1];
    var scale = [1, 1];
    var angle = 0;
    var size = 0;
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
            }, 10);
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
            }, 10);
        };
    });

    leftButton.addEventListener('mouseup', () => {
        if (mousedownID != -1) {
            clearInterval(mousedownID);
            mousedownID = -1;
        }
    });

    rotationButton.addEventListener('mousedown', (e) => {
        if (mousedownID == -1) {
            mousedownID = setInterval(() => {
                let angleInDegrees = 360 - angle;
                let angleInRadians = angleInDegrees * Math.PI / 180;
                rotation[0] = Math.sin(angleInRadians);
                rotation[1] = Math.cos(angleInRadians);
                angle++;
                drawScene();
            }, 10);
        };
    });

    rotationButton.addEventListener('mouseup', () => {
        if (mousedownID != -1) {
            clearInterval(mousedownID);
            mousedownID = -1;
        }
    });

    scaleUpButton.addEventListener('mousedown', (e) => {
        if (mousedownID == -1) {
            mousedownID = setInterval(() => {
                size += 0.05;
                scale[0] = size;
                scale[1] = size;
                drawScene();
            }, 10);
        };
    });

    scaleUpButton.addEventListener('mouseup', () => {
        if (mousedownID != -1) {
            clearInterval(mousedownID);
            mousedownID = -1;
        }
    });

    scaleDownButton.addEventListener('mousedown', (e) => {
        if (mousedownID == -1) {
            mousedownID = setInterval(() => {
                size -= 0.05;
                scale[0] = size;
                scale[1] = size;
                drawScene();
            }, 10);
        };
    });

    scaleDownButton.addEventListener('mouseup', () => {
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
        
        // Set the color.
        gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]);

        // Set the translation.
        gl.uniform2f(translationLocation, translation[0], translation[1]);

        // Set the rotation.
        gl.uniform2f(rotationLocation, rotation[0], rotation[1]);

        // Set the scale.
        gl.uniform2f(scaleLocation, scale[0], scale[0]);

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

