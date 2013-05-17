/*************************************************************
  3D Graphics Programming
  anssi.grohn@karelia.fi 2013
  Skybox and lighting demo demo code with Three.js.
  (with FPS counter, too!)
  Modified by Arttu Nevalainen 1001130
 *************************************************************/
// Parameters
var width = 1500,
    height = 800
    viewAngle = 45,
    aspect = width/height,
    near = 0.1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;

var mouse = {
    down: false,
    prevY: 0,
    prevX: 0
}

var camObject = null;
var keysPressed = [];
var ruins = [];
var clouds;
var cloudObj;
var wood = [];
var coal;
var limeTree = [,];
var pineTree = [,];


var fps = {
    width: 100,
    height: 50,
    svg: null,
    data: [],
    ticks: 0,
    time: null
}
var spotLight = null;
var spotLightObj = null;
var ambientLight = null;
var FireParticleSystem = null;
var SmokeParticleSystem = null;
var firelight = null;

$(function(){

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);

    // create scene
    scene = new THREE.Scene();
    camObject = new THREE.Object3D();
    camObject.add(camera);
    spotLightObj = new THREE.Object3D();
    spotLightObj.position.z = 0.1;
    camera.add(spotLightObj);

    // add camera to scene and set its position.
    scene.add(camObject);
    camObject.position.z = 5;
    camObject.position.y = 1.0;
    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    // directional light for the moon
    var directionalLight = new THREE.DirectionalLight( 0x88aaff, 1.0 ); 
    directionalLight.position.set( 1, 1, -1 ); 
    scene.add( directionalLight );

    // Add ambient light, simulating surround scattering light
    ambientLight = new THREE.AmbientLight(0x282a2f);
    scene.add( ambientLight  );

    scene.fog = new THREE.Fog(0x172747, 1.0, 50.0);

    // Add our "flashlight"
    var distance  = 60.0;
    var intensity = 2.0;
    spotLight = new THREE.SpotLight( 0xffffff, 
				     intensity,
				     distance ); 
    // shadows are complex topic, not covered now.
    spotLight.castShadow = false; 
    spotLight.position = new THREE.Vector3(0,0,1);
    // where spotlight is "looking"
    spotLight.target = spotLightObj;
    // spotlight exponent "spread"
    spotLight.exponent = 188.1;
    // spotlight cone angle
    spotLight.angle = 0.21;

    scene.add( spotLight );
	
	firelight = new THREE.PointLight(0xFF9933);
	firelight.position.set(0, 1, 0);
	firelight.distance = 20;
	scene.add(firelight);
	
	
	

    // create cube  material
    var material =
	new THREE.MeshBasicMaterial(
	    {
		color: 0xFFFFFF,
		
	    });
    
    var loader = new THREE.JSONLoader();

    function handler(geometry, materials) {
	ruins.push(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(
	    {
		map: THREE.ImageUtils.loadTexture("rock.jpg"),
		transparent: true
		
	    }
	)));
	checkIsAllLoaded();
    }
    
    function checkIsAllLoaded(){
	if ( ruins.length == 5 ) {
	    $.each(ruins, function(i,mesh){
		scene.add(mesh);
		// mesh is rotated around x-axis
		mesh.rotation.x = Math.PI/2.0;
	    });
	    // arcs
	    ruins[0].position.z = 13;
	    // corner
	    ruins[1].position.x = 13;

	    // crumbled place
	    ruins[2].position.x = -13;
	    

	    ruins[3].position.z = -13;
	}
    }
    loader.load("meshes/ruins30.js", handler);    
    loader.load("meshes/ruins31.js", handler);
    loader.load("meshes/ruins33.js", handler);
    loader.load("meshes/ruins34.js", handler); 
    loader.load("meshes/ruins35.js", handler);
	
	cloudObj = new THREE.Object3D();
	var cloudTexture = THREE.ImageUtils.loadTexture("clouds.png");
	var cloudMaterial = new THREE.MeshBasicMaterial({map: cloudTexture, transparent: true});
	cloudMaterial.depthWrite = false;
	function handler2(geometry, materials) {
	clouds = new THREE.Mesh(geometry, cloudMaterial);
	scene.add(clouds);
	clouds.position = cloudObj.position;
	clouds.rotation = cloudObj.rotation;

    }
	loader.load("meshes/sky.js", handler2);
	

	var woodTexture = THREE.ImageUtils.loadTexture("wood.jpg");
	var woodMaterial = new THREE.MeshPhongMaterial({map: woodTexture, transparent: true});
	woodMaterial.side = THREE.FrontSide;
	function handler3(geometry, materials) {
		for(var i = 0; i < 13; i++)
		{
		wood[i] = new THREE.Mesh(geometry, woodMaterial);
		scene.add(wood[i]);
		wood[i].position = new THREE.Vector3(Math.sin(i/1.5),0.4,Math.cos(i/1.5));
		wood[i].rotation.x -= Math.cos(i/1.5);
		wood[i].rotation.z += Math.sin(i/1.5);
		}
    }
	loader.load("meshes/wood.js", handler3);
	
	
	var coalTexture = THREE.ImageUtils.loadTexture("coal.jpg");
	var coalMaterial = new THREE.MeshBasicMaterial({map: coalTexture, transparent: true});
	coalMaterial.side = THREE.BackSide;
	function handler4(geometry, materials) {

		coal = new THREE.Mesh(geometry, coalMaterial);
		scene.add(coal);
		coal.scale.set(1.5,1.5,1.5);

    }
	loader.load("meshes/coal.js", handler4);
	
	var limeTexture = THREE.ImageUtils.loadTexture("lime.png");
	var limeMaterial = new THREE.MeshPhongMaterial({map: limeTexture, transparent: true, alphaTest: 0.9});
	limeMaterial.side = THREE.DoubleSide;
	for(var i = 0; i < 11; i++)
	{
		limeTree[i,0] = new THREE.Mesh( new THREE.PlaneGeometry(5,5), limeMaterial);
		limeTree[i,1] = new THREE.Mesh( new THREE.PlaneGeometry(5,5), limeMaterial);
		scene.add(limeTree[i,0]);
		scene.add(limeTree[i,1]);
		limeTree[i,0].position = new THREE.Vector3((Math.random() * 20) + 2, 2, (Math.random() * 20) + 2);
		limeTree[i,1].position = limeTree[i,0].position;
		limeTree[i,1].rotation.y = 1.5;
	}
	
	
	var pineTexture = THREE.ImageUtils.loadTexture("pine.png");
	var pineMaterial = new THREE.MeshPhongMaterial({map: pineTexture, transparent: true, alphaTest: 0.9});
	pineMaterial.side = THREE.DoubleSide;
	for(var i = 0; i < 11; i++)
	{
		pineTree[i,0] = new THREE.Mesh( new THREE.PlaneGeometry(5,5), pineMaterial);
		pineTree[i,1] = new THREE.Mesh( new THREE.PlaneGeometry(5,5), pineMaterial);
		scene.add(pineTree[i,0]);
		scene.add(pineTree[i,1]);
		pineTree[i,0].position = new THREE.Vector3((Math.random() * 20) + 2, 2.5, (Math.random() * 20) + 2);
		pineTree[i,1].position = pineTree[i,0].position;
		pineTree[i,1].rotation.y = 1.5;
	}
	
	
	FireParticleSystem = new CustomParticleSystem( {
	maxParticles: 50,
	energyDecrement: 1.5,
	throughPutFactor: 45.0,
	material: new THREE.ParticleBasicMaterial({
	    color: 0xffffff,
	    size: 2,
	    map: THREE.ImageUtils.loadTexture("fire.png"),
	    transparent: true,
	    blending: THREE.AdditiveBlending,
	    depthWrite: false
	}),
	onParticleInit: function(particle){
	    // original birth position of particle.
	    particle.set(Math.random(1.5) - 0.5,Math.random(1.0),Math.random(1.5) -0.5);
	    // particle moves up
	    particle.velocity = new THREE.Vector3(0,1,0);
	    // particle life force
	    particle.energy = 1.0;
		
		
	},
	onParticleUpdate: function(particle,delta){
	    // Add velocity per passed time in seconds
	    particle.add(particle.velocity.clone().multiplyScalar(delta));
	    // reduce particle energy
	    particle.energy -= (FireParticleSystem.options.energyDecrement * delta);
	}
    });
	
	// add Three.js particlesystem to scene.
    scene.add(FireParticleSystem.ps);
	
	SmokeParticleSystem = new CustomParticleSystem( {
	maxParticles: 50,
	energyDecrement: 0.2,
	throughPutFactor: 3.5,
	material: new THREE.ParticleBasicMaterial({
	    color: 0xC0C0C0,
	    size: 4,
	    map: THREE.ImageUtils.loadTexture("smoke.png"),
	    transparent: true,
	    blending: THREE.AdditiveBlending,
	    depthWrite: false
	}),
	onParticleInit: function(particle){
	    // original birth position of particle.
	    particle.set(Math.random(1.5) - 0.5,Math.random(1.0) + 1,Math.random(1.5) -0.5);
	    // particle moves up
	    particle.velocity = new THREE.Vector3(0,1,0);
	    // particle life force
	    particle.energy = 1.0;
		
		
	},
	onParticleUpdate: function(particle,delta){
	    // Add velocity per passed time in seconds
	    particle.add(particle.velocity.clone().multiplyScalar(delta));
	    // reduce particle energy
	    particle.energy -= (SmokeParticleSystem.options.energyDecrement * delta);
	}
    });
	
	// add Three.js particlesystem to scene.
    scene.add(SmokeParticleSystem.ps);
	
	

    // load skybox materials 
    var skyboxMaterials = [];
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_west.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_east.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_up.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_down.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_north.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_south.png")}));
    $.each(skyboxMaterials, function(i,d){
	d.side = THREE.BackSide;
	d.depthWrite = false;

    });
    var sbmfm = new THREE.MeshFaceMaterial(skyboxMaterials);
    sbmfm.depthWrite = false;
    // Create a new mesh with cube geometry 
    var skybox = new THREE.Mesh(
	new THREE.CubeGeometry( 1,1,1,1,1,1 ), 
	sbmfm
    );

    skybox.position = camObject.position;
    scene.add(skybox);
	

    // Create ground from cube and some rock
    var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");

    // texture wrapping mode set as repeating
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;


    // Construct a mesh object
    var ground = new THREE.Mesh( new THREE.CubeGeometry(100,0.2,100,1,1,1),
				 new THREE.MeshPhongMaterial({
				     map: rockTexture,
				     transparent: true
				 }));

    
    // Do a little magic with vertex coordinates so ground looks more interesting
    $.each(ground.geometry.faceVertexUvs[0], function(i,d){

	d[0] = new THREE.Vector2(0,25);
	d[2] = new THREE.Vector2(25,0);
	d[3] = new THREE.Vector2(25,25);
    });
    
    
    scene.add(ground);

    
    
    fps.time = new Date();
    // request frame update and call update-function once it comes
    requestAnimationFrame(update);

    ////////////////////
    // Setup simple input handling with mouse
    document.onmousedown = function(ev){
	mouse.down = true;
	mouse.prevY = ev.pageY;
	mouse.prevX = ev.pageX;
    }

    document.onmouseup = function(ev){
	mouse.down = false;
    }

    document.onmousemove = function(ev){
	if ( mouse.down ) {

	    var rot = (ev.pageY - mouse.prevY) * 0.01;
	    var rotY = (ev.pageX - mouse.prevX) * 0.01;

	    camObject.rotation.y -= rotY;
	    camera.rotation.x -= rot;

	    mouse.prevY = ev.pageY;
	    mouse.prevX = ev.pageX;
	}
    }
    ////////////////////
    // setup input handling with keypresses
    document.onkeydown = function(event) {
	keysPressed[event.keyCode] = true;
    }
    
    document.onkeyup = function(event) {
	keysPressed[event.keyCode] = false;
    }
    
    
    // querying supported extensions
    var gl = renderer.context;
    var supported = gl.getSupportedExtensions();

    console.log("**** Supported extensions ***'");
    $.each(supported, function(i,d){
	console.log(d);
    });
    //Create SVG element (ain't HTML5 grand stuff?)
    fps.svg = d3.select("#fps")
	.append("svg")
	.attr("width", fps.width)
	.attr("height", fps.height);

});

var angle = 0.0;
var movement = 0.0;
var moving = false;
function update(){

    // render everything 
    renderer.setClearColorHex(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera); 
    angle += 0.001;
    moving = false;
    if ( keysPressed["W".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["S".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;

    }
    if ( keysPressed["A".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["D".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;
    }


    // so strafing and moving back-fourth does not double the bounce
    if ( moving ) {
	movement+=0.1;
	camObject.position.y = Math.sin(movement*2.30)*0.07+1.2; 
    }
    spotLight.position = camObject.position;

    var dir = new THREE.Vector3(0,0,-1);
    var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);

    spotLight.target.position = dirW;

	cloudObj.rotation.y += 0.001;
	cloudObj.position.x = camObject.position.x;
	cloudObj.position.y = camObject.position.y - 0.2;
	cloudObj.position.z = camObject.position.z;
	if (FireParticleSystem != null)
	{
	FireParticleSystem.update();
    }
	if (SmokeParticleSystem != null)
	{
	SmokeParticleSystem.update();
    }
	
    // request another frame update
    requestAnimationFrame(update);
    
    fps.ticks++;
    var tmp = new Date();
    var diff = tmp.getTime()-fps.time.getTime();

    if ( diff > 1000.0)
	{
	fps.data.push(fps.ticks);
	if ( fps.data.length > 15 ) 
	{
	    fps.data.splice(0, 1);
	}
	fps.time = tmp;
	fps.ticks = 0;
	displayFPS();
    }
    
}

var CustomParticleSystem = function( options )
{
    var that = this;
    
    this.prevTime = new Date();
    this.particles = new THREE.Geometry();
    this.options = options;

    this.numAlive = 0;
    this.throughPut = 0.0;
    this.throughPutFactor = 0.0;
    if ( options.throughPutFactor !== undefined ){
	this.throughPutFactor = options.throughPutFactor;
    }

    // add max amount of particles (vertices) to geometry
    for( var i=0;i<this.options.maxParticles;i++){
	this.particles.vertices.push ( new THREE.Vector3());
    }
    
    this.ps = new THREE.ParticleSystem(this.particles, 
				       this.options.material);
    this.ps.renderDepth = 0;
    this.ps.sortParticles = false;
    this.ps.geometry.__webglParticleCount = 0;

    this.getNumParticlesAlive = function(){
	return this.numAlive;
    }
    this.setNumParticlesAlive = function(particleCount){
	this.numAlive = particleCount;
    }
    this.getMaxParticleCount = function(){
	return this.ps.geometry.vertices.length;
    }

    this.removeDeadParticles = function(){

	var endPoint = this.getNumParticlesAlive();
	for(var p=0;p<endPoint;p++){
	    var particle = this.ps.geometry.vertices[p];
	    //console.log("remove dead particles", particle.energy);
	    if ( particle.energy <= 0.0 ){
		// remove from array
		var tmp = this.ps.geometry.vertices.splice(p,1);
		// append to end of array
		this.ps.geometry.vertices.push(tmp[0]);
		// vertices have shifted, no need to as far anymore
		endPoint--;
		// decrease alive count by one
		this.setNumParticlesAlive( this.getNumParticlesAlive()-1);
		
	    }
	}
    }

    this.init = function( particleCount ){
	var previouslyAlive = this.getNumParticlesAlive();
	var newTotal = particleCount + previouslyAlive;
	newTotal = (newTotal > this.getMaxParticleCount()) ? 
	    this.getMaxParticleCount() : newTotal;
	
	this.setNumParticlesAlive(newTotal);
	// initialize every particle
	for(var p=previouslyAlive;p<newTotal;p++){
	    this.options.onParticleInit( this.ps.geometry.vertices[p]);
	}
	this.ps.geometry.verticesNeedUpdate = true;
	
    }
    
    this.update = function(){

	var now = new Date();
	var delta = (now.getTime() - that.prevTime.getTime())/1000.0;
	
	// a quick hack to get things working.
	this.ps.geometry.__webglParticleCount = this.getNumParticlesAlive();
	
	// seek and destroy dead ones
	this.removeDeadParticles();

	var endPoint = this.getNumParticlesAlive();
	for( var p=0;p<endPoint;p++){
	    var particle = this.ps.geometry.vertices[p];
	    if ( particle !== undefined ){
		this.options.onParticleUpdate(particle, delta);
	    }
	}
	// Add new particles according to throughput factor
	that.throughPut += (that.throughPutFactor * delta);
	var howManyToCreate  = Math.floor( that.throughPut );
	if ( howManyToCreate > 1 ){
	    that.throughPut -= howManyToCreate;
	    that.init( howManyToCreate );
	}
	// Changes in position need to be reflected to VBO
	this.ps.geometry.verticesNeedUpdate = true;
	
	that.prevTime = now;
    }
}


  
// for displaying fps meter 
function displayFPS(){

    fps.svg.selectAll("rect").remove();
    
    fps.svg.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", 100)
	.attr("height", 50)
	.attr("fill", "rgb(0,0,0)");

    fps.svg.selectAll("rect")
	.data(fps.data)
	.enter()
	.append("rect")
	.attr("x", function(d, i) {
	    return (i * (2+1));  //Bar width of 20 plus 1 for padding
	})
	.attr("y", function(d,i){
	    return 50-(d/2);
	})
	.attr("width", 2)
	.attr("height", function(d,i){
	    return (d/2);
	})
	.attr("fill", "#FFFFFF");
	
    fps.svg.selectAll("text").remove();
    fps.svg
	.append("text")
	.text( function(){
	    return fps.data[fps.data.length-1] + " FPS";
	})
	.attr("x", 50)
	.attr("y", 25)
	.attr("fill", "#FFFFFF");
}  