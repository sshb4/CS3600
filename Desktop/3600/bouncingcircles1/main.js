// bouncing circles 1

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
      return null;
    }

    gl.validateProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
      console.error('ERROR validating program!', gl.getProgramInfoLog(shaderProgram));
      return;
    }
  
    return shaderProgram;
}
  
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
}


// Circle Class
class Circle{
    constructor(xlow, xhigh, ylow, yhigh){
        this.xlow = xlow;
        this.xhigh = xhigh;
        this.ylow = ylow;
        this.yhigh = yhigh;
        this.color = [Math.random(), Math.random(), Math.random(), 1];
        this.size = 0.5 + Math.random() * 1.5; // radius between 0.5 and 2.0
        const minx = xlow+this.size;
        const maxx = xhigh-this.size;
        this.x = minx + Math.random()*(maxx-minx);
        const miny = ylow+this.size;
        const maxy = yhigh-this.size;
        this.y = miny + Math.random()*(maxy-miny);
        this.dx = Math.random()*4+2; // 2 to 6
        if (Math.random()>.5)
            this.dx = -this.dx;
        this.dy = Math.random()*4+2;
        if (Math.random()>.5)
            this.dy = - this.dy;
    }
    update(DT){
        if(this.x+this.dx*DT +this.size > this.xhigh){
            this.dx = -Math.abs(this.dx);
        }
        if(this.x+this.dx*DT -this.size < this.xlow){
            this.dx = Math.abs(this.dx);
        }
        if(this.y+this.dy*DT +this.size > this.yhigh){
            this.dy = -Math.abs(this.dy);
        }
        if(this.y+this.dy*DT -this.size < this.ylow){
            this.dy = Math.abs(this.dy);
        }

        this.x += this.dx*DT;
        this.y += this.dy*DT;
    }
    draw(gl, shaderProgram){
        drawCircle(gl, shaderProgram, this.color, this.x, this.y, this.size);
    }
}

function CreateCircleVertices(sides) {
    const positions = [];
    positions.push(0);
    positions.push(0);
    for (let i = 0; i < sides + 1; i++) {
      const radians = i / sides * 2 * Math.PI;
      const x = Math.cos(radians);
      const y = Math.sin(radians);
      positions.push(x);
      positions.push(y);
    }
    return positions;
}

function drawCircle(gl, shaderProgram, color, x, y, size){
    const sides = 64;
    const circleVertices = CreateCircleVertices(sides);

	const vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);

	const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation,
		2,
		gl.FLOAT,
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT,
		0
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
	gl.uniform4fv(colorUniformLocation, color);

    const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [x, y, 0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [size, size, 1]);
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);	  	

    gl.drawArrays(gl.TRIANGLE_FAN, 0, sides+2);
}

main();
async function main() {
	console.log('This is working');

	const canvas = document.getElementById('glcanvas');
	const gl = canvas.getContext('webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const vertexShaderText = await (await fetch("simple.vs")).text();
    const fragmentShaderText = await (await fetch("simple.fs")).text();
	let shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);
	gl.useProgram(shaderProgram);

	const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	const aspect = canvas.clientWidth / canvas.clientHeight;
	const projectionMatrix = mat4.create();
	const yhigh = 10;
	const ylow = -yhigh;
	const xlow = ylow * aspect;
	const xhigh = yhigh * aspect;
	mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
	gl.uniformMatrix4fv(
		projectionMatrixUniformLocation,
		false,
		projectionMatrix
	);

	const NUM_CIRCLES = 20;
	const circleList = []
	for (let i = 0; i < NUM_CIRCLES; i++) {
	  let c = new Circle(xlow, xhigh, ylow, yhigh);
	  circleList.push(c);
	}

	let previousTime = 0;
	function redraw(currentTime) {
		currentTime*= .001;
		let DT = currentTime - previousTime;
		previousTime = currentTime;
		if(DT > .1){
			DT = .1;
		}
	
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		for (let i = 0; i < NUM_CIRCLES; i++) {
			circleList[i].update(DT);
		}

		for (let i = 0; i < NUM_CIRCLES; i++) {
			circleList[i].draw(gl, shaderProgram);
		}
	
		requestAnimationFrame(redraw);
	}	
	requestAnimationFrame(redraw);
}