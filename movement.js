//Global Vars
var isDragging = false;
var dragStart = {x:0, y:0};
var theta_start;
var phi_start;
var theta; //Radians
var phi; //Radians
var total_x_drag = 0;
var total_y_drag = 0;

var Orthographic = false;

var clamp = function(val, lower, upper)
{
    return Math.min(Math.max(lower,val),upper);  
}

var calcThetaPhi = function(dir)
{
    var x = -dir[0];
    var y = -dir[1];
    var z = -dir[2];
    
    console.log("(x,y,z) " + [x,y,z] );
    
    var local_theta =  Math.atan2(y,x);
    var local_phi = Math.asin((z)/(x**2+y**2+z**2)**0.5);
    return [local_theta, local_phi];
    
}

var GetbtnProjText = function(isOrthographic)
{
    if (isOrthographic)
    {
        return "Projection Orthographic";
    } 
    else 
    {return "Projection Perspective";}
}

var ResetCamera = function(cam_dir)
{
    total_x_drag = 0;
    total_y_drag = 0;
    
    var temp = calcThetaPhi(cam_dir);
    theta = temp[0];
    phi = temp[1];
    theta_start = temp[0];
    phi_start = temp[1];
    console.log(temp);
}

var buttonClickProj = function(e)
{    
    btnProj = document.getElementById('btnProj');
    console.log(Orthographic);
    Orthographic = !Orthographic;   
    btnProj.innerText = GetbtnProjText(Orthographic);
}

var onPointerDown = function(e)
{
    isDragging = true;
    dragStart.x = e.offsetX ;
    dragStart.y = e.offsetY ;
    console.log("Click down at " + dragStart.x + ", " + dragStart.y);
    
}

var onPointerUp = function(e)
{
    isDragging = false;
    console.log("Release Click at " + e.offsetX + ", " + e.offsetY);
    total_x_drag += e.offsetX - dragStart.x;
    total_y_drag += e.offsetY - dragStart.y;
}

var onPointerMove = function(e)
{
    if (isDragging)
    {
        theta = -(e.offsetX  - dragStart.x + total_x_drag)/100 + theta_start;
        phi = clamp((e.offsetY - dragStart.y + total_y_drag)/100 + phi_start,
        -Math.PI/2 + 0.001, Math.PI/2 - 0.001);
    }
}