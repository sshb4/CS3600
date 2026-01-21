import { Circle } from 'circle.js';
import {initShaderProgram} from shader.js;


const vertexShaderText = `
	precision mediump float;

	attribute vec2 vertPosition;
	uniform mat4 uProjectionMatrix;

	void main()
	{
		gl_Position = uProjectionMatrix * vec4(vertPosition, 0.0, 1.0);
	}
`;
//vec 2 is a vector w 2 components, mat4 is a 4x4 matrix

const fragmentShaderText = `
	precision mediump float;
	uniform vec4 uColor;
	void main()
	{
		gl_FragColor = uColor;
	}
`;

main();
async function main() {
	console.log('This is working');

	//
	// Init gl
	// 
	const canvas = document.getElementById('glcanvas');
	const gl = canvas.getContext('webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	// Create shaders
	// 
	let shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);

	//
	// Create buffer
	//
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

	const sides = 64;
	const circleVertices = CreateCircleVertices(sides);

	const circleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);

	//
	// Set Vertex Attributes
	//
	const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	//
	// Set Uniforms
	//
	const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
	const theColor = [0, 0, 1, 1]; //rgba, set to blue
	gl.uniform4fv(
		colorUniformLocation,
		theColor
	  );

		const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
		const aspect = canvas.clientWidth / canvas.clientHeight; //not based on aspect ratio, a good circle now
		const projectionMatrix = mat4.create();
		const yhigh = 10;
		const ylow = -yhigh;
		const xlow = ylow * aspect;
		const xhigh = yhigh * aspect;
		mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
        //matrices re doing transformations

		gl.uniformMatrix4fv(
			projectionMatrixUniformLocation,
			false,
			projectionMatrix
		);
		  
	//
	// Main render loop
	//

    //draw circle

    let previousTime = 0;
        function redraw(currentTime) {
            currentTime*= .001; // milliseconds to seconds
            let DT = currentTime - previousTime;
            previousTime = currentTime;
            if(DT > .1){
                DT = .1;
            }
        
            // Clear the canvas before we start drawing on it.
            gl.clearColor(0.75, 0.85, 0.8, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            for (let i = 0; i < circleArray.length; i++){
                circleArray[i].update(DT);
                circleArray[i].draw(gl, shaderProgram);
            }

            // Update the modelViewMatrix
            degrees += degreesPerSecond*DT;
            mat4.rotate(modelViewMatrix, identityMatrix, (degrees* Math.PI / 180), [0, 0, 1]);
            gl.uniformMatrix4fv( modelViewMatrixUniformLocation, false, modelViewMatrix);	  	
        
            // Starts the Shader Program, which draws one frame to the screen.
            //gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, sides+2);

            requestAnimationFrame(redraw);
        }	
        requestAnimationFrame(redraw);
};
