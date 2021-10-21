var divFps = document.getElementById("fps");
var canvas = document.getElementById("renderCanvas");
var today = new Date();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var square = 5;
var tile = "tile.glb";
var selectedMesh;
var currentMesh;
var selected = null;
var meshObject;
var playerYOffset = 1;
//create scene
var createScene = function () {
	console.log("start createScene " +time);
	var scene = new BABYLON.Scene(engine);
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
		light.intensity = 0.7;
	// var spriteManagerPlayer = new BABYLON.SpriteManager("playerManager", "test2.png", 1, {width:78, height:170}, scene);
	var spriteManagerPlayer = new BABYLON.SpriteManager("playerManager", "test.png", 1, {width:150, height:193.9}, scene);
    var player = new BABYLON.Sprite("player", spriteManagerPlayer);
		player.playAnimation(0, 28, true, 100);
		player.position.y = playerYOffset;
		player.size = 2;
		player.position.x = square*2;
		player.position.z = square*2;
		player.isPickable = true;
		var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);	
			// myMaterial.wireframe = true;
			myMaterial.alpha = 0.5;
	for (let v = 0; v < 1; v++) {
		for (let width = -square; width <= square; width++) {
			for (let length = -square; length <= square; length++) {
				BABYLON.SceneLoader.ImportMesh("", "", tile, scene, function (newMeshes) {
					var mesh = newMeshes[v];
					mesh.isPickable = true;
					mesh.scaling.x = 0.99;
					mesh.scaling.y = 0.99;
					mesh.scaling.z = 0.99;
					mesh.position.copyFromFloats((mesh.scaling.x+1.01)*width + (square * 2), 0, ((mesh.scaling.x+1.01)*length) + (square * 2));
					if (mesh.position.x === player.position.x && mesh.position.z === player.position.z){
						camera.target = mesh;
						selectedMesh = mesh.uniqueId;
						meshObject = mesh;
					}
				});
			}
		}
	}	
	console.log("end createScene");
return scene;
};
//build scene
var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
var scene = createScene();
var moveableTiles = [];
var movementRange = 7; //1,3,5,7
var cameraTurnFrames = 50;
var cameraActualFrames =0;
var turnRadius = 1.175;
var cameraGoal = 0.8;
var frameCut =12;
var camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(0), 5, new BABYLON.Vector3(10, 10, -10.5), scene);
// camera.lowerAlphaLimit = 0.8; //-2.35, 0.8
// camera.upperAlphaLimit = 0.8;
camera.lowerBetaLimit = 1.1;
camera.upperBetaLimit = 1.1;
camera.upperRadiusLimit = 20;
camera.lowerRadiusLimit = 20;
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);		
// scene.debugLayer.show();
engine.runRenderLoop(function () {
	if (scene) {
		
		scene.render();
		
		divFps.innerHTML = engine.getFps().toFixed() + "fps";
		scene.onPointerDown = function(_pickResult,evt){
		evt.hit = true;
		// console.log(selected);
			if(selected) {
				// console.log(evt.hit);
				if (evt.pickedMesh || evt.mesh == currentMesh) {
					selected = evt.pickedMesh;
					selectedMesh = currentMesh
				}
				try {
					if (selected.parent.uniqueId===meshObject.uniqueId){
						for (let v = 0; v < moveableTiles.length; v++){
							if(unMovable(moveableTiles[v])){
								evt.pickedMesh.material.wireframe = false;
								evt.pickedMesh.material.disableLighting = false;
								evt.pickedMesh.material.emissiveColor =  BABYLON.Color3.FromInts(0,0,0);
							// evt.hit = false;					
							}
						}
					// selected = undefined;
						moveableTiles = [];
					} 
				} catch(err) {
					evt.hit = true;	
					// console.log(selectedMesh);
				}
				if (moveableTiles.includes(selected)) {
					moveCharacter(evt.pickedMesh,scene.spriteManagers[0]);
					for (let v = 0; v < moveableTiles.length; v++){
						unMovable(moveableTiles[v]);
					}
					// selected = undefined;
					moveableTiles = [];
					// evt.hit = false;	
				}
				// evt.hit = false;	
			}
			try {
				if(((evt.hit)) && evt.pickedMesh.parent.uniqueId === selectedMesh && moveableTiles.length == 0 ){
					for (let v = 0; v < scene.meshes.length; v++){
						if(isMovable(meshObject,scene.meshes[v],movementRange)){
							selected = evt.pickedMesh;
							evt.pickedMesh.material.wireframe = true;
							selected.material.emissiveColor = BABYLON.Color3.Green();
						}
					}
					// evt.hit = false;
				} 
			} catch(err){
				evt.hit = true;
			}
		}
	}
	// console.log("end runRenderLoop " +time);
});
// Resize
window.addEventListener("resize", function () {
	engine.resize();
});

function isMovable (mesh1, mesh2, movementRange) {
	if (mesh2.id === "Cube" && mesh2.parent != null) {
		if (((Math.abs(mesh1.position.x - mesh2.position.x) == 0 )  
		|| (Math.abs(mesh1.position.y - mesh2.position.y) == 0)
		|| (Math.abs(mesh1.position.z - mesh2.position.z) == 0 )) 
		|| (mesh1.uniqueId != mesh2.uniqueId))
		{
			if (((Math.abs(mesh1.position.x - mesh2.parent.position.x)
			+ (Math.abs(mesh1.position.y - mesh2.parent.position.y))
			+ (Math.abs(mesh1.position.z - mesh2.parent.position.z))) < movementRange )) 
			{
			// mesh2.material.wireframe = true;
			// mesh2.material.disableLighting = true;
			mesh2.material.emissiveColor = BABYLON.Color3.Blue();
			moveableTiles.push(mesh2);
			return true;
			} 
			return false;
		} else if (((Math.abs(mesh1.position.x - mesh2.position.x) == 0 )  
		|| (Math.abs(mesh1.position.y - mesh2.parent.position.y) == 0)
		|| (Math.abs(mesh1.position.z - mesh2.parent.position.z) == 0 )) 
		&& (mesh1.uniqueId != mesh2.uniqueId)) {
			if (((Math.abs(Math.abs(mesh1.position.x) - Math.abs(mesh2.parent.position.x)
			+ (Math.abs(mesh1.position.y) - Math.abs(mesh2.parent.position.y))
			+ (Math.abs(mesh1.position.z) - Math.abs(mesh2.parent.position.z)))) < movementRange )) 
			{
			mesh2.material.wireframe = true;
			mesh2.material.disableLighting = false;
			moveableTiles.push(mesh2);
			return true;
			}
		}
		return false;
	}
}
function unMovable (mesh2) {
	mesh2.material.wireframe = false;
	mesh2.material.disableLighting = false;
	mesh2.material.emissiveColor = BABYLON.Color3.FromInts(0,0,0);
	return true;
}
function moveCharacter (meshDestination, character){
	try {
		meshObject = meshDestination.parent;
		camera.setTarget(new BABYLON.Vector3(meshDestination.parent.position.x, meshDestination.parent.position.y, meshDestination.parent.position.z))
		getGrid(character.sprites[0].position.x, character.sprites[0].position.z, meshDestination.parent.position.x, meshDestination.parent.position.z, scene);
		selectedMesh = meshDestination.parent.uniqueId;	
	}
	catch {
		selectedMesh = selectedMesh;
		// console.log(selectedMesh);
	}
	currentMesh = selectedMesh;
	selectedMesh = null;
}
function getGrid (fromX, fromZ, toX, toZ, scene) {
	var finder = new PF.AStarFinder({
		allowDiagonal: false,
		dontCrossCorners: true
	});
	var grid = new PF.Grid(((square*2)+1)*2, ((square*2)+1)*2); 
	try{
		var path = finder.findPath(fromX, fromZ, toX, toZ, grid);
	} catch (error){
		console.log("cannot find path");
		console.log(error);
		path = 0;
	}
	for (let v = 0; v < path.length; v++) {
		scene.spriteManagers[0].sprites[0].position.x = path[v][0];
		scene.spriteManagers[0].sprites[0].position.z = path[v][1];
	}
	return true;
}
function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}
let textBox = document.getElementById('renderCanvas');
textBox.addEventListener('keydown', (event) => {
	console.log(`key=${event.key},code=${event.code}`);

});