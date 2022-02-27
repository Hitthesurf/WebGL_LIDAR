//Using this camera is always facing in -Z with right the x-axis, but scene moves around camera
var Ref_URL = "https://hitthesurf.github.io/WebGL_LIDAR"; //Different to gh-pages allows to test using local server
var start_func = ""; 

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray); //Pointless data already normed
}

var TTO32 = function(cam_pos) //Transform to origin(matrix)
{
    //cam_pos is of form [1,3,2]
    //returns as float 32
    
    var x = cam_pos[0];
    var y = cam_pos[1];
    var z = cam_pos[2];
    
    return new Float32Array([1.0,0.0,0.0,-x,
                             0.0,1.0,0.0,-y,
                             0.0,0.0,1.0,-z,
                             0.0,0.0,0.0,1.0]);
}

var RTA32 = function(u, v, n) //Rotate to Align(matrix)
{
    // u is the direction to the right of camera 
    // v is the up direction 
    // n points backwards (point negative direction camera is facing)
    
    return new Float32Array([u[0],u[1],u[2],0.0,
                             v[0],v[1],v[2],0.0,
                             n[0],n[1],n[2],0.0,
                             0.0 ,0.0 ,0.0 ,1.0]);
}

var insRTA32 = function(u, v, n) //Rotate to align 
{
    //Transpose of the one above
    
}

var OrthoProj32 = function(left, right, bottom, up, near, far) //OrthographicProjection Matrix
{
    // z part is minus as camera looking -z direction, and webGL prioritses z value closest to -1
    
    
    return new Float32Array([2/(right-left), 0.0, 0.0, -(right+left)/(right-left),
                             0.0, 2/(up-bottom), 0.0, -(up+bottom)/(up-bottom),
                             0.0, 0.0,-2/(far-near), -(far+near)/(far-near),
                             0.0, 0.0, 0.0,    1.0]);
}

var PerProj32 = function() //Perspective Projection Matrix
{
    var near = 3;
    var far = 120;
    var xsize = 0.75*near;
    var ysize = 0.75*near;
    
    return new Float32Array([near/xsize, 0, 0, 0,
                             0,near/ysize, 0, 0, 
                             0,0,-(far+near)/(far-near),2*far*near/(near-far),
                             0,0,-1,0]);
    
}

//var TAR_Cam32 = function(point, theta, phi) //Translate and rotate around point

var cross = function(u, a)
{
 //calculate uxa
    return [u[1]*a[2]-u[2]*a[1], u[2]*a[0]-u[0]*a[2], u[0]*a[1] - u[1]*a[0]];
}

var lookAt = function(a) //return RTA32 by calculating other directions
{
    //Easy and quick to use, but cannot look vertically up or down
    // a is the direction of the camera 
    var my_length = (a[0]**2 + a[1]**2 + a[2]**2)**0.5;
    a[0] = a[0]/my_length;
    a[1] = a[1]/my_length;
    a[2] = a[2]/my_length;
    
    //Get Horizontal
    var u = [a[1], -a[0], 0];
    var u_length = (a[0]**2+a[1]**2)**0.5;
    
    u[0] = u[0]/u_length;
    u[1] = u[1]/u_length;
    
    //Get Vertical
    var v = cross(u,a);
    var n = [-a[0],-a[1],-a[2]];
    return RTA32(u,v,n);
    
}

var Big_Alert = function(the_text)
{
    console.error(the_text);
    alert(the_text);
}

var create_program = function(gl, program, vertexShader, fragmentShader, vertexShaderText, fragmentShaderText)
{
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    
    //Check if worked
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        Big_Alert('ERROR compiling vertex shader!' + gl.getShaderInfoLog(vertexShader));
        return;
    }
    
    gl.compileShader(fragmentShader);
    //Check if worked
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        Big_Alert('ERROR compiling fragment shader!'+ gl.getShaderInfoLog(fragmentShader));
        return;
    }
    
    //Now for program (pipeline)
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        Big_Alert('ERROR linking program!' + gl.getProgramInfoLog(program));
        return;
    }
    
    //Validate the Program
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program)); //Only error
        return;
    }
    
    //Now Delete and detach shaders
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    
    
    //gl.deleteShader(vertexShader);
    //gl.deleteShader(fragmentShader);
    
}


var Init = function()
{

    var urlParams = new URLSearchParams(window.location.search);
    var dataFile = urlParams.get('dataFile');
    console.log(dataFile);
    if (dataFile == null)
    {
        dataFile = '235';
    }
    console.log(dataFile);

    loadTextResource(Ref_URL + '/Data/lidar_points_'+dataFile+'.pcd', function (dataError, dataText)
    {if (dataError) {alert('data failed to load'); console.error(dataText);}
    else{loadTextResource(Ref_URL + '/ShaderVS.txt', function (vsError, vsText) 
    {
       if (vsError) {alert('vs shader failed to load'); console.error(vsText);}
       else { loadTextResource(Ref_URL + '/ShaderFS.txt', function (fsError, fsText) {
       
       if (fsError) {alert('fs shader failed to load'); console.error(fsText);}
       else { Start(vsText, fsText, dataText)}               
       })}       
    }
    )}})
    
}
    
var Start = function(vertexShaderText, fragmentShaderText, dataText) {
    
    var canvas = document.getElementById('Render_Surface');
    var btnProj = document.getElementById('btnProj');
    var btnResetCam = document.getElementById('btnResetCam');
    var btnCompile = document.getElementById('btnCompile');
    var txtBoxFunctionText = document.getElementById('FunctionText');
    var gl=canvas.getContext('webgl');
    
    
    if (!gl) {
        console.log("WebGL not supported, using experimental version");
        gl = canvas.getContext('experimental-webgl');
    }
    
    if (!gl) {
        alert("Your browser does not support webGL");        
    }
    
    //Setup for objects
    btnProj.innerText = GetbtnProjText(Orthographic);
    txtBoxFunctionText.value = start_func;
    
    //Add event handelers for canvas
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mousemove', onPointerMove);
    
    btnProj.addEventListener('click', buttonClickProj);
    btnResetCam.addEventListener('click', function() {ResetCamera(cam_dir);});
    btnCompile.addEventListener('click', function() 
    {
        ExtravertexShaderText = txtBoxFunctionText.value + vertexShaderText;
        create_program(gl, program, vertexShader, fragmentShader, ExtravertexShaderText, fragmentShaderText);
        gl.useProgram(program);
        //Get Uniform Locations
        mat4TTOUniformLocation = gl.getUniformLocation(program, 'TTO');
        mat4RTAUniformLocation = gl.getUniformLocation(program, 'RTA');
        mat4ProjUniformLocation = gl.getUniformLocation(program, 'Proj');
        
        //Rotate scene
        mat4TTR_UL = gl.getUniformLocation(program, 'TTR');  //Translate to rotation point
        mat4RS_UL  = gl.getUniformLocation(program, 'RS');  //Rotate Scene
        mat4TTRB_UL = gl.getUniformLocation(program, 'TTRB');//Translate to starting point    

        if (Orthographic == false)
        {
            Proj = PerProj32();
        }
        gl.uniformMatrix4fv(mat4TTOUniformLocation, gl.FALSE, TTO);
        gl.uniformMatrix4fv(mat4RTAUniformLocation, gl.FALSE, RTA);
        gl.uniformMatrix4fv(mat4ProjUniformLocation, gl.FALSE, Proj);
        
        
        gl.uniformMatrix4fv(mat4TTR_UL, gl.FALSE, TTR);
        gl.uniformMatrix4fv(mat4RS_UL, gl.FALSE, RS);
        gl.uniformMatrix4fv(mat4TTRB_UL, gl.FALSE, TTRB);
        
        console.log(txtBoxFunctionText.value);
        
    });
    
    //Start color
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    
    //Don't draw extra, shape has to be closed(as not closed comment out)
    //gl.enable(gl.CULL_FACE);
    //gl.frontFace(gl.CW);
    //gl.cullFace(gl.BACK);
    console.log("This  is Working");
    
    //Create shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    //Now create the pipeline
    var program = gl.createProgram();
    
    var ExtravertexShaderText = start_func + vertexShaderText;
    create_program(gl, program, vertexShader, fragmentShader, ExtravertexShaderText, fragmentShaderText);
    gl.useProgram(program);
    
    //Create Buffers
var chunks, f, lines, my_info, max_intensity;

//f = open("/lidar_points_235.pcd", "r");
//console.log(dataText);
lines = dataText.split("\n");
console.log(lines.length)
my_info = [];

for (var line, _pj_c = 0, _pj_a = lines.slice(10, lines.length), _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
  line = _pj_a[_pj_c];
  chunks = line.split(" ");

  for (var chunk, _pj_f = 0, _pj_d = chunks, _pj_e = _pj_d.length; _pj_f < _pj_e; _pj_f += 1) {
    chunk = _pj_d[_pj_f];
    my_info.push(Number.parseFloat(chunk));
  }
}

var Max_Vals = [];
var ITER = parseInt((_pj_a.length-3)/5);

for (var i = 0; i < ITER; i += 1)
   {
    Max_Vals.push(my_info[5 * i + 3]);
   }
console.log(Max_Vals)
max_intensity = getMaxOfArray(Max_Vals)

console.log("Max_Intensity")
console.log(max_intensity)
var GridPoints = my_info;
console.log(GridPoints);
	//var Indices = 
//[ 1,2,3,4,5,6,7,8,9,10   ];


  //Send data to GPU buffer
    var VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(GridPoints), gl.STATIC_DRAW);
    

    
    //Tell GPU what the format of the data is
    var positionAttribLocation = gl.getAttribLocation(program, 'GridPoint');

    

    
    
    gl.vertexAttribPointer(
    positionAttribLocation, //Attribute location
    4,// Number of elements per attribute (1,2,3,4)
    gl.FLOAT,//Type of elements
    gl.FALSE, //Is normed ?
    5*Float32Array.BYTES_PER_ELEMENT,//Size of a an individual vertex, number of data per vertex, stride distance
    0//Offset from the beginning of a single vertex 
    );
    
    
    gl.enableVertexAttribArray(positionAttribLocation);
    
    
    
    //Get Uniform Locations
    var mat4TTOUniformLocation = gl.getUniformLocation(program, 'TTO');
    var mat4RTAUniformLocation = gl.getUniformLocation(program, 'RTA');
    var mat4ProjUniformLocation = gl.getUniformLocation(program, 'Proj');
    
    //Rotate scene
    var mat4TTR_UL = gl.getUniformLocation(program, 'TTR');  //Translate to rotation point
    var mat4RS_UL  = gl.getUniformLocation(program, 'RS');  //Rotate Scene
    var mat4TTRB_UL = gl.getUniformLocation(program, 'TTRB');//Translate to starting point

    
    //Set Uniforms
    
    //var dev = [-Math.cos(phi)*Math.cos(theta),-Math.cos(phi)*Math.sin(theta),-Math.sin(phi)];//Minus to always look at ROT point
    var dev = [-0.001,0,-1];//Not constant
    var cam_pos = [4,4,4];
    var rot_pos = [0.0,0,0];
    var cam_dir = [rot_pos[0]-cam_pos[0], rot_pos[1]-cam_pos[1], rot_pos[2]-cam_pos[2]]; //Calculalte
    //Find theta and phi
    ResetCamera(cam_dir);
    
    var TTR = TTO32(rot_pos);
    var RS = lookAt(dev); //Not Constant
    var TTRB = TTO32([-rot_pos[0], -rot_pos[1], -rot_pos[2]]); //Should be minus
    var TTO = TTO32(cam_pos);
    var RTA = lookAt(cam_dir);
    var Proj = OrthoProj32(-100,100,-100,100,-100,100);
    
    if (Orthographic == false)
    {
        Proj = PerProj32();
    }
    gl.uniformMatrix4fv(mat4TTOUniformLocation, gl.FALSE, TTO);
    gl.uniformMatrix4fv(mat4RTAUniformLocation, gl.FALSE, RTA);
    gl.uniformMatrix4fv(mat4ProjUniformLocation, gl.FALSE, Proj);
    
    
    gl.uniformMatrix4fv(mat4TTR_UL, gl.FALSE, TTR);
    gl.uniformMatrix4fv(mat4RS_UL, gl.FALSE, RS);
    gl.uniformMatrix4fv(mat4TTRB_UL, gl.FALSE, TTRB);
    
    // Main loop
    var loop = function () {
        

        //Start Up
        gl.useProgram(program);
        
        gl.clearColor(0.0, 1.0, 1.0, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        
        //gl.bindTexture(gl.TEXTURE_2D, boxTexture);
		//gl.activeTexture(gl.TEXTURE0);

        if (Orthographic)
        {
            Proj = OrthoProj32(-100,100,-100,100,-100,100);
        } else {
            Proj = PerProj32();
        }
        
        dev = [-Math.cos(phi)*Math.cos(theta),-Math.cos(phi)*Math.sin(theta),-Math.sin(phi)];
        RS = lookAt(dev); //camera is moving around cube
        
        //update uniforms
        gl.uniformMatrix4fv(mat4RS_UL, gl.FALSE, RS);
        gl.uniformMatrix4fv(mat4ProjUniformLocation, gl.FALSE, Proj);
        
        //Draw
        //gl.drawElements(gl.LINE_STRIP, Indices.length, gl.UNSIGNED_SHORT, 0);
        //gl.drawElements(gl.TRIANGLES, Indices.length, gl.UNSIGNED_SHORT, 0);
        gl.drawArrays(gl.POINTS, 0, lines.length-10);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};
