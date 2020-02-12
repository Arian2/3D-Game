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


//create person who has to dodge
var geometry = new THREE.BoxGeometry(2, 2, 2);
var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: false } );
var person = new THREE.Mesh(geometry, material);
person.position.y = person.geometry.parameters.height / 2;
scene.add(person);

//create hurdle
var geometry = new THREE.BoxGeometry(4, 2, 2);
var material = new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: false } );

var hurdles = [];
for(var i = 5;i<100; i++){
    var hurdle = new THREE.Mesh(geometry, material);
    hurdle.position.x = Math.random() * 40 - 20;
    hurdle.position.y = person.geometry.parameters.height / 2;
    hurdle.position.z = - i * 10;
    hurdles.push(hurdle);
    scene.add(hurdle);
}

//text start
var text2 = document.createElement('a');
text2.style.position = 'absolute';
text2.innerHTML = "Press ENTER to start!";
text2.style.fontSize = 50 + "px";
text2.style.top = 50 + '%';
text2.style.left = 40 + '%';
text2.style.zIndex = "1";
document.body.appendChild(text2);
//text score
var score = 0;
var textscore = document.createElement('a');
textscore.style.position = 'absolute';
textscore.innerHTML = score;
textscore.style.fontSize = 30 + "px";
textscore.style.top = 10 + 'px';
textscore.style.right = 2 + '%';
document.body.appendChild(textscore);

//sound
var soundLoose = new Audio("sound/loose.mp3");
soundLoose.volume = 0.7;

var soundHaha = new Audio("sound/haha.mp3");
soundHaha.volume = 0.7;


//Variablen
var gameStarted = false;
var speed = 0.3;
var goingLeft = false;
var goingRight = false;
var countTriedAudioPlay = 0;

//game logic
var update = function(){
    if(gameStarted){
        score += 10;
        textscore.innerHTML = score;
        person.position.z -= 1;
        camera.position.z -= 1;

        if(goingLeft){
            person.position.x -= speed;
        }
        if(goingRight){
            person.position.x += speed;
        }
    }
    hurdles.forEach(hurdle => {
        if(detectCollisionCubes(person, hurdle)){
            gameStarted = false;
            countTriedAudioPlay++;
            if(countTriedAudioPlay>=2){
                text2.style.zIndex = "1";
                score = 0;
                textscore.innerHTML = score;
                person.position.x = 0;
                person.position.z = 0;
                camera.position.z = 9;
            }else{
                soundLoose.play();
                soundLoose.onended = () => { 
                    soundHaha.play(); 
                    countTriedAudioPlay=0
                    text2.style.zIndex = "1";
                    score = 0;
                    textscore.innerHTML = score;
                    person.position.x = 0;
                    person.position.z = 0;
                    camera.position.z = 9;
                }
            }
        }
    });
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

GameLoop();

//key down event
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
        if(person.position.x > -10){
            goingLeft = true;
        }else{
            goingLeft = false;
        } 
    }
    if(event.key === "ArrowRight"){
        if(person.position.x < 10){
            goingRight = true;
        }else{
            goingRight = false;
        }
    }
    if(event.key === "Enter" || event.key === " "){
        if(text2.style.zIndex === "1"){
            text2.style.zIndex = "-1";
        }
        gameStarted = true;
    }
  });
  document.addEventListener("keyup", event => {
    if (event.key === "ArrowLeft") {
        goingLeft = false;
    }
    if(event.key === "ArrowRight"){
        goingRight = false;
    }

  });

document.addEventListener('touchstart', event => {
    console.log(event.touches[0].clientX)
    if(gameStarted === true){
        if(event.touches[0].clientX < window.outerWidth/2 && person.position.x > -10){
            goingLeft = true;
        }else{
            goingLeft = false;
        }
        if(event.touches[0].clientX > window.outerWidth/2 && person.position.x < 10){
            goingRight = true;
        }else{
            goingRight = false;
        }
    }else{
        if(text2.style.zIndex === "1"){
            gameStarted = true
            text2.style.zIndex = "-1";
        }
    }
},false);


document.addEventListener('touchend', event => {
    goingLeft = false;
    goingRight = false;
},false);

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    renderer.setSize( window.innerWidth, window.innerHeight );
}


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