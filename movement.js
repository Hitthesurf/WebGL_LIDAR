//Global Vars
var isDragging = false;
var dragStart = {x:0, y:0};
var theta_start;
var phi_start;
var theta; //Radians
var phi; //Radians
var total_x_drag = 0;
var total_y_drag = 0;
var movement_calls = 0;

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

//Movement with mouse and touchpad
//But touchpad movement impacted by scrolling
var onPointerDown = function(e)
{
    movement_calls = 0;
    isDragging = true;
    dragStart.x = e.offsetX ;
    dragStart.y = e.offsetY ;

   

    if (e.type == 'touchstart')
    {
        var touch = e.touches[0];
        dragStart.x = touch.pageX
        dragStart.y = touch.pageY

    }

    console.log("Click down at " + dragStart.x + ", " + dragStart.y);
    
}

var onPointerUp = function(e)
{
    
    isDragging = false;

    var offsetX = e.offsetX; 
    var offsetY = e.offsetY;

    if (e.type == 'touchend')
    {
         var touch = e.changedTouches[0];
         offsetX = touch.pageX;
         offsetY = touch.pageY;
    }

    console.log("Release Click at " + offsetX + ", " + offsetY + ", Movement Calls: " +  movement_calls);
    total_x_drag += offsetX - dragStart.x;
    total_y_drag += offsetY - dragStart.y;
    movement_calls = 0;
}

var onPointerMove = function(e)
{
    movement_calls += 1;
    var offsetX = e.offsetX; 
    var offsetY = e.offsetY;
    if (e.type == 'touchmove')
    {
         var touch = e.changedTouches[0];
         offsetX = touch.pageX;
         offsetY = touch.pageY;
    }

    if (isDragging)
    {
        theta = -(offsetX  - dragStart.x + total_x_drag)/100 + theta_start;
        phi = clamp((offsetY - dragStart.y + total_y_drag)/100 + phi_start,
        -Math.PI/2 + 0.001, Math.PI/2 - 0.001);
    }
}