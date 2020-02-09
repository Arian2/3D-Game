var scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.fog = new THREE.Fog(0xffffff, 0, 200);

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.x = -1.2;
camera.position.y = 5.6;
camera.position.z = 9.0;
camera.rotation.x = -0.2;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//lightening the Materials
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( -0.6, 2.8, 4.5 );
directionalLight.ambient = 0;
scene.add( directionalLight );

//floor
var geo = new THREE.PlaneBufferGeometry(2000, 2000, 80, 80);
geo.rotateX( -Math.PI / 2 );

var vertex = new THREE.Vector3();
var position = geo.attributes.position;
for(var i = 0, l = position.count; i < l; i ++) {
    vertex.fromBufferAttribute( position, i );

    vertex.x += Math.random() * 20 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

    position.setXYZ( i, vertex.x, 0, vertex.z );
}
geo = geo.toNonIndexed();
position = geo.attributes.position;

var color = new THREE.Color();
var colors = [];

for ( var i = 0, l = position.count; i < l; i ++ ) {

    color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    colors.push( color.r, color.g, color.b );

}
geo.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
var mat = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
floor = new THREE.Mesh( geo, mat);
scene.add(floor);


//create person who have to dodge
var geometry = new THREE.BoxGeometry(2, 2, 2);
var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: false } );
var person = new THREE.Mesh(geometry, material);
person.position.y = person.geometry.parameters.height / 2;
scene.add(person);

//create hurdle
var geometry = new THREE.BoxGeometry(4, 2, 2);
var material = new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: false } );

var materialblue = new THREE.MeshLambertMaterial( { color: 0x0000ff, wireframe: false } );
for(var i = 5;i<1000; i++){
    var hurdle = new THREE.Mesh(geometry, materialblue);
    hurdle.position.x = Math.random() * 40 - 20;
    hurdle.position.y = person.geometry.parameters.height / 2;
    hurdle.position.z = - i * 10;
    scene.add(hurdle);
}

var hurdle = new THREE.Mesh(geometry, material);
hurdle.position.z = -200;
hurdle.position.y = person.geometry.parameters.height / 2;
scene.add(hurdle);

//text start
var text2 = document.createElement('a');
text2.style.position = 'absolute';
text2.innerHTML = "Press ENTER to start!";
text2.style.fontSize = 50 + "px";
text2.style.top = 50 + '%';
text2.style.left = 40 + '%';
document.body.appendChild(text2);
//text score
var score = 0;
var textscore = document.createElement('a');
textscore.style.position = 'absolute';
textscore.innerHTML = score;
textscore.style.fontSize = 30 + "px";
textscore.style.top = 10 + 'px';
textscore.style.left = 10 + 'px';
document.body.appendChild(textscore);

//sound
var soundLoose = new Audio("sound/loose.mp3");
soundLoose.volume = 0.7;

var soundHaha = new Audio("sound/haha.mp3");
soundHaha.volume = 0.7;


//Variablen
var gameStarted = false;

//game logic
var update = function(){
    if(gameStarted){
        score += 10;
        textscore.innerHTML = score;
        person.position.z -= 1;
        camera.position.z -= 1;
    }
    if(detectCollisionCubes(person, hurdle)){
        gameStarted = false;
        soundLoose.play();
        soundLoose.onended = () => { 
            soundHaha.play(); 
            document.body.appendChild(text2);
            score = 0;
            textscore.innerHTML = score;
            person.position.z = 0;
            camera.position.z = 9;
        }
        
    }
};

//draw scene
var render = function(){
    renderer.render(scene, camera);
};

// run game loop (update, render, repeat)
var GameLoop = function(){
    requestAnimationFrame(GameLoop);
    update();
    render();
};

//key down event
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
        if(person.position.x > -10){
            person.position.x -= 2;
        }
    }
    if(event.key === "ArrowRight"){
        if(person.position.x < 10){
            person.position.x += 2;
        }
    }
    if(event.key === "Enter" || event.key === " "){
        if(document.body.removeChild(text2)){

        };
        gameStarted = true;
    }
  });

document.addEventListener('touchstart', event => {
    if(gameStarted === true){
        if(event.touches[0].clientX < window.outerWidth && person.position.x > -10){
            person.position.x -= 2;
        }else{
            person.position.x += 2;
        }
    }
    document.body.removeChild(text2);
    gameStarted = true;
},false);

GameLoop();


//true if two object collide
function detectCollisionCubes(object1, object2){
    object1.geometry.computeBoundingBox(); //not needed if its already calculated
    object2.geometry.computeBoundingBox();
    object1.updateMatrixWorld();
    object2.updateMatrixWorld();
    
    var box1 = object1.geometry.boundingBox.clone();
    box1.applyMatrix4(object1.matrixWorld);
  
    var box2 = object2.geometry.boundingBox.clone();
    box2.applyMatrix4(object2.matrixWorld);

    return box1.intersectsBox(box2);
  }