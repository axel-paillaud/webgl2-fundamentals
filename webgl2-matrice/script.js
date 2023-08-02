var vertexShaderSource = `#version 300 es
in vec2 a_position;

uniform vec2 u_resolution;
uniform mat3 u_matrix;

void main() {
    vec2 position = (u_matrix * vec3(a_position, 1)).xy;
    
    gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
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
    var matrixLocation = gl.getUniformLocation(program, 'u_matrix');

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
    var angleInRadians = angle * Math.PI / 180;
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
                rotation[0] = angleInRadians;
                rotation[1] = angleInRadians;
                angle++;
                angleInRadians = angle * Math.PI / 180;
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

        // Compute the matrices
        var projectionMatrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
        var translationMatrix = m3.translation(translation[0], translation[1]);
        var rotationMatrix = m3.rotation(rotation[0]);
        var scaleMatrix = m3.scaling(scale[0], scale[1]);
        var moveOriginMatrix = m3.translation(-50, -75);

        // Starting Matrix.
        var matrix = m3.identity();

        // Multiply the matrices.
        matrix = m3.multiply(matrix, projectionMatrix);
        matrix = m3.multiply(matrix, translationMatrix);
        matrix = m3.multiply(matrix, rotationMatrix);
        matrix = m3.multiply(matrix, scaleMatrix);
        matrix = m3.multiply(matrix, moveOriginMatrix);
        
        // Set the matrix.
        gl.uniformMatrix3fv(matrixLocation, false, matrix);

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

var m3 = {
    identity : function() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ];
    },

    projection: function(width, height) {
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1,
        ];
    },

    translation : function(tx, ty) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
        ];
    },

    rotation : function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    },

    scaling : function(sx, sy) {
       return [
           sx, 0, 0,
           0, sy, 0,
           0, 0, 1,
       ]; 
    },

    multiply: function(a, b) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
 
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    }
}

main();

