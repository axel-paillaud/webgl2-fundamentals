var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;

// A matrix to transform the positions by
uniform mat4 u_matrix;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
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

    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    var translation = [45, 150, 100];
    var rotation = [80, 80, 80];
    var scale = [0, 0, 0];
    var angle = 0;
    var angleInRadians = angle * Math.PI / 180;
    var size = 0;
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
                rotation[2] = angleInRadians;
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
        gl.bindVertexArray(vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        //setRectangle(gl, translation[0], translation[1], width, height);
        setGeometry(gl);
        
        // Set the color.
        gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]);

        // Compute the matrices
        //var matrix = m4.identity();
        var matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
        matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
        matrix = m4.xRotate(matrix, rotation[0]);
        matrix = m4.yRotate(matrix, rotation[1]);
        matrix = m4.zRotate(matrix, rotation[2]);
        matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

        // Starting Matrix.
        var matrix = m4.identity();

        // Multiply the matrices.
        
        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

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
        0,   0,  0,
        30,   0,  0,
         0, 150,  0,
         0, 150,  0,
        30,   0,  0,
        30, 150,  0,

       // top rung
        30,   0,  0,
       100,   0,  0,
        30,  30,  0,
        30,  30,  0,
       100,   0,  0,
       100,  30,  0,

       // middle rung
        30,  60,  0,
        67,  60,  0,
        30,  90,  0,
        30,  90,  0,
        67,  60,  0,
        67,  90,  0,
    ]), gl.STATIC_DRAW);
}

var m4 = {
    identity : function() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    projection: function(width, height, depth) {
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1,
        ];
    },

    translation : function(tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            tx, ty, tz, 1,
        ];
    },

    xRotation : function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },

    yRotation : function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },

    zRotation : function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    scaling : function(sx, sy, sz) {
       return [
           sx, 0, 0, 0,
           0, sy, 0, 0,
           0, 0, sz, 0,
           0, 0, 0, 1,
       ]; 
    },

    translate: function (m, tx, ty ,tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },

    xRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },

    yRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },

    zRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },

    scale: function(m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

    multiply: function(a, b) {
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];

        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    }
}

main();
