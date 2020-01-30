var scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.fog = new THREE.Fog(0xffffff, 0, 750);

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
var geometry = new THREE.BoxGeometry(8, 4, 2);
var material = new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: false } );
var hurdle = new THREE.Mesh(geometry, material);
hurdle.position.z = -500;
hurdle.position.y = person.geometry.parameters.height / 2;
scene.add(hurdle);



//game logic
var update = function(){
    //person.rotation.x += 0.01;
    //person.rotation.y += 0.01;
    person.position.z -= 1;
    camera.position.z -= 1;
    //camera.rotation.x += 0.1;
    detectCollisionCubes(person, hurdle);
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
  });

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

    return console.log(box1.intersectsBox(box2));
  }