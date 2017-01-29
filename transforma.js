
var gl, programRfl, programTex;

//DONE
function getWebGLContext() {

  var canvas = document.getElementById("myCanvas");

  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];

  for (var i = 0; i < names.length; ++i) {
    try {
      return canvas.getContext(names[i]);
    }
    catch(e) {
    }
  }

  return null;

}

//DONE
function initShaders(){
	programRefl=initShader("myVertexShaderRefl","myFragmentShaderRefl");
	programTex=initShader("myVertexShaderTex","myFragmentShaderTex");
	programNoTex=initShader("myVertexShaderNoTex","myFragmentShaderNoTex");
}

//DONE
function initShader(vs, fs) {
  
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById(vs).text);
  gl.compileShader(vertexShader);
  
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
	  alert(gl.getShaderInfoLog(vertexShader));
  }
  
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById(fs).text);
  gl.compileShader(fragmentShader);
  
  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
	  alert(gl.getShaderInfoLog(fragmentShader));
  }
  
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  
  gl.linkProgram(program);
  
  gl.useProgram(program);
  
  program.vertexPositionAttribute = gl.getAttribLocation( program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);

  program.vertexNormalAttribute = gl.getAttribLocation( program, "VertexNormal");
  gl.enableVertexAttribArray(program.vertexNormalAttribute);
  
  program.vertexTexcoordAttribute = gl.getAttribLocation( program, "VertexTexcoord");
  gl.enableVertexAttribArray(program.vertexTexcoordAttribute);
  
  program.modelMatrixIndex = gl.getUniformLocation(program, "modelMatrix");
  program.viewMatrixIndex = gl.getUniformLocation(program, "viewMatrix");
  program.projMatrixIndex = gl.getUniformLocation(program, "projMatrix");
  
  return program;
}


//DONE
function initBuffers(model) {
  
  model.idBufferVertices = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
  
  model.idBufferIndices = gl.createBuffer ();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
  
}

//DONE
function initRendering() {
  
  gl.clearColor(0.0,0.0,0.0,0.9);
  gl.lineWidth(1.5);
  draw(examplePlane, programTex, modelMatrix9);
  gl.enable(gl.DEPTH_TEST);
  
}

var torus;

function initPrimitives() {

  initBuffers(examplePlane);
  initBuffers(exampleCube);
  initBuffers(exampleCone);
  initBuffers(exampleCylinder);
  initBuffers(exampleSphere);
  initBuffers(exampleTio);
  initBuffers(exampleAvion);

  torus = makeTorus(0.5, 1,10,50);
  initBuffers(torus);
}
      
function draw(model, program, modelMatrix) {
  
  gl.useProgram(program);
  
  setProjectionMatrix(program);
  setCameraMatrix(program);
  
  var r = 1.0;
  var g = 1.0;
  var b = 1.0;
  
  if(model.hasOwnProperty("r"))
	  r = model.r;
  
  if(model.hasOwnProperty("g"))
	  g = model.g;
  
  if(model.hasOwnProperty("b"))
	  b = model.b;
  
  
  var myColorLoc = gl.getUniformLocation(program, "myColor");
  
  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.uniform4f(myColorLoc,r,g,b,1);
  
  gl.uniformMatrix4fv(program.modelMatrixIndex, false, modelMatrix);
  
  //Donde empieza la normal en el fichero primitivas y *4 porque son en bytes
  gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 8*4, 0);
  gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 8*4, 3*4);
  gl.vertexAttribPointer(program.vertexTexcoordAttribute, 2, gl.FLOAT, false, 8*4, 6*4);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
  
}

var rotCamY = 3.14159/2.0;
var rotCamX = 3.14159/2.0;
var acercaZ = -20;
var acercaY = 0;

var posCamX = 0;
var posCamY = 0;
var posCamZ = -20;
var posLookX = 0;
var posLookY = 0;
var posLookZ = 0;

var upPressed = false;
var downPressed = false;
var rightPressed = false;
var leftPressed = false;


function setProjectionMatrix(program){
	var mat = mat4.create();
	mat4.perspective(mat, 3.14159/9, 1, 0.01, 100);
	gl.uniformMatrix4fv(program.projMatrixIndex, false, mat);
}

function setCameraMatrix(program){
	
	var pihalf = 3.14159/2.0;
	
	var dirLookX = Math.sin(rotCamX)*Math.cos(rotCamY); 
	var dirLookY = Math.cos(rotCamX);
	var dirLookZ = Math.sin(rotCamX)*Math.sin(rotCamY); 

	var dirLook = vec3.fromValues(dirLookX,dirLookY,dirLookZ);

	var up = vec3.fromValues(0,1,0);
	
	var dirRight = vec3.create();
	dirRight = vec3.cross(dirRight,dirLook,up);
	
	var speed = 0.1;
	
	if (upPressed)
	{

		posCamX += speed*dirLookX;
		posCamY += speed*dirLookY;
		posCamZ += speed*dirLookZ;
	}

	if (downPressed)
	{
		posCamX -= speed*dirLookX;
		posCamY -= speed*dirLookY;
		posCamZ -= speed*dirLookZ;
	}
	
	posLookX = posCamX + dirLookX;
	posLookY = posCamY + dirLookY;
	posLookZ = posCamZ + dirLookZ;
	
	var mat = mat4.create();
	mat4.lookAt(mat, vec3.fromValues(posCamX,posCamY,posCamZ), vec3.fromValues(posLookX,posLookY,posLookZ), up);
	
	gl.uniformMatrix4fv(program.viewMatrixIndex, false, mat);
} 

var rotTorusX = 0.0; 
var modelMatrix4;

function drawScene() {
  
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // 1. calcula la matriz de transformación
  var modelMatrix = mat4.create();
  mat4.identity(modelMatrix);
  mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, -0.5]);        
  gl.bindTexture(gl.TEXTURE_2D,brickTexture);		
  draw(exampleTio, programRefl, modelMatrix);

  var modelMatrix2 = mat4.create();
  mat4.identity(modelMatrix2);
  mat4.scale(modelMatrix2, modelMatrix2, [10.5, 10.5, 10.5]);        
  gl.bindTexture(gl.TEXTURE_2D,wallTexture);		
  draw(examplePlane, programTex, modelMatrix2);

  var modelMatrix3 = mat4.create();
  exampleCube.r = 1.0;
  exampleCube.g = 1.0;
  exampleCube.b = 1.0;
  mat4.identity(modelMatrix3);
  mat4.translate(modelMatrix3, modelMatrix3, [4.5, 0.7, 1.5]);
  mat4.scale(modelMatrix3, modelMatrix3, [0.5, 1.5, 5.5]);   	
  draw(exampleCube, programNoTex, modelMatrix3);

  modelMatrix4 = mat4.create();
  mat4.identity(modelMatrix4);
  mat4.translate(modelMatrix4, modelMatrix4, [-5.0, 0.7, 1.5]); 
  mat4.scale(modelMatrix4, modelMatrix4, [0.8, 0.8, 0.8]); 
  mat4.rotateX(modelMatrix4, modelMatrix4, -3.14159*0.5) 
  gl.bindTexture(gl.TEXTURE_2D,metalTexture);	 	
  draw(exampleAvion, programTex, modelMatrix4);

  modelMatrix5 = mat4.create();
  torus.r = 1.0;
  torus.g = 0.0;
  torus.b = 1.0;
  mat4.identity(modelMatrix5);
  mat4.translate(modelMatrix5, modelMatrix4, [6.0, 2.0, -0.7]); 
  mat4.scale(modelMatrix5, modelMatrix5, [0.5, 0.5, 0.5]);  	
  draw(torus, programNoTex, modelMatrix5);

  modelMatrix6 = mat4.create();
  mat4.identity(modelMatrix6);
  mat4.translate(modelMatrix6, modelMatrix6, [2.0, 0.0, 1.5]); 
  mat4.scale(modelMatrix6, modelMatrix6, [0.8, 0.8, 0.8]);
  mat4.rotateX(modelMatrix6, modelMatrix6, -3.14159*0.5)  
  gl.bindTexture(gl.TEXTURE_2D,brickTexture);	 	
  draw(exampleCone, programTex, modelMatrix6);

modelMatrix7 = mat4.create();
  exampleCylinder.r = 1.0;
  exampleCylinder.g = 1.0;
  exampleCylinder.b = 1.0;
  mat4.identity(modelMatrix7);
  mat4.translate(modelMatrix7, modelMatrix7, [2.0, 0.0, 1.5]); 
  mat4.scale(modelMatrix7, modelMatrix7, [0.05, 9.8, 0.8]);
  mat4.rotateX(modelMatrix7, modelMatrix7, -3.14159*0.5)   	
  draw(exampleCylinder, programNoTex, modelMatrix7);

  var modelMatrix8 = mat4.create();
  mat4.identity(modelMatrix8);
  mat4.translate(modelMatrix8, modelMatrix8, [2.8, 9.0, 1.5]); 
  mat4.scale(modelMatrix8, modelMatrix8, [1.5, 1.5, 1.5]);
  mat4.rotateX(modelMatrix8, modelMatrix8, -3.14159*0.5)
  gl.bindTexture(gl.TEXTURE_2D, bannerTexture);	  		
  draw(examplePlane, programTex, modelMatrix8);

  var modelMatrix9 = mat4.create();
  mat4.identity(modelMatrix9);
  mat4.translate(modelMatrix9, modelMatrix9, [0.0, 5.0, 8.0]); 
  mat4.scale(modelMatrix9, modelMatrix9, [10.5, 10.5, 10.5]);  
  mat4.rotateX(modelMatrix9, modelMatrix9, 3.14159*0.5)      
  gl.bindTexture(gl.TEXTURE_2D,skyTexture);		
  draw(examplePlane, programTex, modelMatrix9);

  requestAnimationFrame(drawScene);
}


function initListeners(){
	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);
	document.addEventListener("mousemove", onMouseMove);
}

var mousePosX=0;
var mousePosY=0;


function onMouseMove(event){
	//console.log("Pos: "+event.clientX+", "+event.clientY);
	
	if (mousePosX==0)
		mousePosX = 100;

	if (mousePosY==0)
		mousePosY = 100;
	
	if (rotCamY<200){
		rotCamY += (event.clientX - mousePosY)*0.002;
		mousePosY = event.clientX;
	}
	if (rotCamX<200){
	rotCamX += (event.clientY - mousePosX)*0.002;
	mousePosX = event.clientY;
	}
}

function onKeyDown(event){
	//alert("Tecla: "+event.keyCode);

	if(event.keyCode==39) //DER
		rotCamY += 0.01;

	if(event.keyCode==37) //IZQ
		rotCamY -= 0.01;		

	if(event.keyCode==38) //ARR
		rotCamX -= 0.01;

	if(event.keyCode==40) //ABA
		rotCamX += 0.01;		

		
	if(event.keyCode==87) //W
		upPressed = true;
	
	if(event.keyCode==83) //S
		downPressed = true;
	
}


function onKeyUp(event){
	console.log("Tecla: "+event.keyCode);
	
	if(event.keyCode==87) //W
		upPressed = false;
	
	if(event.keyCode==83) //S
		downPressed = false;
	
}

function loadTexture(texture,filename){
	var image = new Image();
	image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	image.src = filename;
}

var brickTexture;
var skyTexture;
var camuflajeTexture;
var wallTexture; 
var metalTexture;
var bannerTexture;

function initTextures(){
	brickTexture = gl.createTexture();
	loadTexture(brickTexture,"ladrillos.jpg");

	skyTexture = gl.createTexture();
	loadTexture(skyTexture,"sky.jpg");

	camuflajeTexture = gl.createTexture();
	loadTexture(camuflajeTexture,"images.jpeg");

	wallTexture = gl.createTexture();
	loadTexture(wallTexture,"wall.jpg");

	metalTexture = gl.createTexture();
	loadTexture(metalTexture,"metal.jpg");

	bannerTexture = gl.createTexture();
	loadTexture(bannerTexture,"banner.jpg");

}

function initWebGL() {
  
  gl = getWebGLContext();
  
  if (!gl) {
    alert("WebGL is not available");
    return;
  }
  
  initTextures();
  initListeners();
  initShaders();
  initPrimitives();
  initRendering();
  
  requestAnimationFrame(drawScene);
  
}

initWebGL();
