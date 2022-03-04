# WebGL_LIDAR
WebGL to visualise recorded LIDAR data for self-driving cars.
## Inspiration
 Started off with a hardware based project, but when the Oxbotica Mini Challenge released we changed gears and started on that project. As we were mainly maths students we wanted a project which involved some fun math. We wanted to derive ways of plotting 3D data on a 2D screen (This leads to matrix multiplication translating and rotating our points).

Additionally, we wanted to visualise collected data. Also, we liked the idea of being able to visualise these datasets on any device so we wanted to use the GPU via WebGL, thus being available to visualise data on any device with a browser. 

## What it does
A website implementation of visualising LIDAR data from self-driving cars. 

On load of website, requests are sent for the LIDAR data. Then the data is sent to the GPU to do some derived maths to calculate a 2D position for every 3D point. Then the data is plotted as a scatter plot. With white points being very reflective.

This is rendered in real time therefore the camera can be rotated. The two camera modes are street view and a birds eye view of the road layout. As the camera can be rotated it gives the user a good idea of the cars surroundings. 

Note: if no GPU the program uses the integrated graphics card.

Note: it can visualise data on mobile devices but for larger datasets mobile devices may start to struggle.

## How we built it

Derived linear algebra for finding a 2D position of a 3D point via (Perspective and Orthographic Methods)

We tested these methods in python with a 2D scatter plot. Then implemented the maths in GLSL.

Used html, JavaScript, WebGL and  implement a heterogenous computing solution to the problem. 

Pushed work to GitHub and used its gh-pages to create a prototype website.

## Challenges we ran into

Using WebGL, the main difficulty was remembering to do all the prerequisite code and putting it in the correct order. Examples include, transferring data to and from the GPU. Creating automatic syntax checking for shaders (i.e. when we got a blue screen we would know if the error came from a shader). 

Security issues when reading files in local testing (“Cross-Origin Request Blocked”). To continue local testing we used the inbuilt python http library. For anyone interested the code goes:
```python
python -m http.server 8080
```

Deriving the maths for finding the 2D perspective representation of a 3D point.


## Accomplishments that we're proud of

Can clearly interpret the LIDAR data, can distinguish between cars people and open road. With high reflections representing important things (registration numbers, road signs, traffic lights).

Since calculated and displayed on the GPU it can render LIDAR points in real time (Longest part is retrieving data from GitHub server) This makes it possible for quick video creation or extra data points to be added.

Requesting and Loading data from over the web.
## What we learned

•	Derived matrices to visualize 3D shapes in 2D space via perspective and orthographic methods.

•	Became proficient in data visualization using WebGL. Manipulated the data in the pipeline with GLSL (OpenGL Shading Language)

•	Hosted websites with WebGL content on Github using gh-pages

•	Learnt about LIDAR technolgy


## What's next for Open LIDAR
Combine with other input methods to get a better visualization of the cars surroundings. For example find locations where there are lots of points and see if a polygon can be formed. Then using the camera a texture can be applied to the polygon.

Derive better methods for visualizing the data, it is set up in a way where mathematical operations can easily be applied to any point. 
Potentially, a 3D model of a car for the centre could be added.
Displaying data over time, and generate small movies from moving car (Movies).
Have a full website.
More functionality, scales with numbers to measure distance (parallel lines) .
Multiple LIDAR sensors (on same car or different cars).

## Links
DevPost: https://devpost.com/software/open-lidar

GitHub Repo:  https://github.com/Hitthesurf/WebGL_LIDAR

Webpage Demo: https://hitthesurf.github.io/WebGL_LIDAR/index.html?data_File=325

QR Link:
![Alt Text]( https://raw.githubusercontent.com/Hitthesurf/WebGL_LIDAR/main/Pictures/QR_Code.png?raw=true)

## Examples
Street view (perspective Camera just above car)
![Alt Text]( https://raw.githubusercontent.com/Hitthesurf/WebGL_LIDAR/main/Pictures/LIDAR_Street_View.png?raw=true)


Birds Eye View (Orthographic Camera) shows the layout of the road.
![Alt Text]( https://raw.githubusercontent.com/Hitthesurf/WebGL_LIDAR/main/Pictures/LIDAR_Birds_View.png?raw=true)

