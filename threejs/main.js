var container, stats;

var interactiveView, scene, renderer;

var containerWidth, containerHeight;

var gui = new dat.GUI();

var XAXIS = new THREE.Vector3(1,0,0);
var XAXISQUAT = new THREE.Quaternion().setFromAxisAngle(XAXIS, Math.PI);

var mmToPixel = 1/12;//0.003; // based on email from Google guys
var cameraParams = {
  focalLength: {
    x: 256.418 * mmToPixel,
    y: 256.52 * mmToPixel,
  },
}

var cameraRig;
var views = {
  "ThirdPerson": {
          left: 0,
          bottom: 0,
          width: 1.0,
          height: 1.0,
          background: new THREE.Color().setRGB( 1, 1, 1 ),
          eye: [ 0, 0, 50 ],
          up: [ 0, 0, 1 ],
          fov: 60,
          near: .5,
          controls: null,
          updateCamera: function ( camera, scene, mouseX, mouseY ) {
            // camera.position.x += mouseX * 0.05;
            // camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), -2000 );
            if (CURRENT_POSE && params.FirstPerson) {
              camera.position.set(CURRENT_POSE.position.x, CURRENT_POSE.position.y, CURRENT_POSE.position.z)
              camera.quaternion.set(CURRENT_POSE.quaternion.x, CURRENT_POSE.quaternion.y, 
                                     CURRENT_POSE.quaternion.z, CURRENT_POSE.quaternion.w);
              camera.rotateOnAxis(XAXIS, Math.PI);
            }
          }
        },
  "FirstPerson": { 
          left: .02,
          bottom: 0.02,
          width: 0.2,
          height: 0.2,
          background: new THREE.Color().setRGB( .99, .99, .99 ),
          eye: [ 0, 0, 50 ],
          up: [ 0, 0, 1 ],
          fov: 60,
          near: 4,
          controls: null,
          updateCamera: function ( camera, scene, mouseX, mouseY ) {
            // camera.position.x -= mouseX * 0.05;
            // camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), -2000 );
            // camera.lookAt(CURRENT_POSE.position);
          }
        } 
      };

var params = {
  FirstPerson: false,
  Play: false,
  Speed: 50,
  PointCloudSize: 0.8,
  PointCloudOpacity: 0.4,
  OnlyCurrentPoints: false,
  'Top Left Image': true,
  Selecting : false,
  Deselecting : false,
}
var MAXFRAMERATE = 100;
var MINFRAMERATE = 10;

var keyboard = new THREEx.KeyboardState();

var cameraPoses = [];
var individalTrajPoses = [];
var mouse = { x: -Infinity, y: -Infinity }, INTERSECTED;
var currentlySelectedPoses = []; // list of all poses that are currently selected with whatever filter tool we use.
var CURRENT_POSE = null;
var CLICKED_POSE = null;
var CURRENT_POSE_OBJECT;
var ImageViewer = null;

var camera_poses = [walter_1_traj, walter_2_traj, walter_3_traj, walter_4_traj];
var NumberOfTrajectories = camera_poses.length;
// var TrajStartIndex = [0, camera_poses[0].length, camera_poses[0].length + camera_poses[1].length, 
//                       camera_poses[0].length + camera_poses[1].length + camera_poses[2].length];

var trajectory_drawing = [];
var shadow = [];
var sceneTranslationVector;
var sceneBoundingBox;

var point_cloud_json, pointCloud;
var point_cloud_geo = new THREE.Geometry();

var radiusAroundObject = 1.5;
var frustumHeight = null;

var DATA_DIR         = "data/"
var FISH_DIR    = DATA_DIR + "Fisheye/";
var FISH_IMAGE_DIRECTORY  = [FISH_DIR + "Walter-1/", FISH_DIR + "Walter-2/", FISH_DIR + "Walter-3/", FISH_DIR + "Walter-4/"];
var REC_DIR    = DATA_DIR + "Standard/";
var REC_IMAGE_DIRECTORY  = [REC_DIR + "Walter-1/", REC_DIR + "Walter-2/", REC_DIR + "Walter-3/", REC_DIR + "Walter-4/"];
var startingImageId = [10, 10, 10, 100];     // Image cooresponding to first xkk pose
var intervalBetweenPoses = 5; // Number of images between xkk printouts
var CHEVRON_TEXTURE     = [DATA_DIR + "Chevron_blue.png", DATA_DIR + "Chevron_green.png", DATA_DIR + "Chevron_red.png", DATA_DIR + "Chevron_indigo.png"];
var TRAIN_TEXTURE       = DATA_DIR + "train.png";
var TRACK_TEXTURE       = DATA_DIR + "track.png";
var CONTEXT_BOX_TEXTURE = DATA_DIR + "grid.png";
var POINT_CLOUD_TEXTURE = DATA_DIR + "PointCloudPoint.png";

init();
animate();

function init() {
  container = document.getElementById( 'container' );
  containerWidth = window.innerWidth;
  containerHeight = window.innerHeight;

  var image_viewer = document.createElement( 'div' );
  image_viewer.style.position = 'absolute';
  image_viewer.style.top = '10px';
  image_viewer.style.left = '10px';
  image_viewer.style.visibility = 'visible';
  image_viewer.innerHTML += '<img src="" alt="" id="currentImage" height="240" width="320">';
  container.appendChild( image_viewer );

  scene = new THREE.Scene();
  // scene.autoUpdate = false;

  // world
  var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
  var material = new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );

  // Add point cloud
  // CREATE THIS FIRST TO SET sceneTranslationVector
  createPointCloud();

  // add trajectory
  createTrajectory();

  // add camera poses
  createPoses();

  // center the scene, then add a box
  createImageViewer();

  // center the scene, then add a box
  createBoundingBox();

  // lights
  light = new THREE.DirectionalLight( 0x808080 );
  light.position.set( 0, 0, 10 );
  scene.add( light );

  light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( -1, -1, -1 );
  scene.add( light );
  
  light = new THREE.DirectionalLight( 0x808080);
  light.position.set( 1, 1, 1 );
  scene.add( light );

  light = new THREE.AmbientLight( 0x222222 );
  scene.add( light );

  // renderer
  renderer = Detector.webgl ? new THREE.WebGLRenderer({ antialias: true}) : alert("Your browser does not support WebGL.\nYou may be able to enable it on Safari or Firefox.\nIt should work by default on Google Chrome.");
  renderer.setClearColor( 0x000000, 1 );
  renderer.setSize( containerWidth, containerHeight );
  renderer.sortObjects = true;
  // renderer.setBlending(THREE.NormalBlending);
  // renderer.enableScissorTest ( true );

  // Camera setup
  ResetView();

  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

  // when the mouse moves, call the given function
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  // when the mouse is CURRENT_POSE, call other function
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );

  UpdateForNewPose(cameraPoses[0]);
}

function updateMouse(event) {
    mouse.x = ( event.clientX / containerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / containerHeight ) * 2 + 1;
}

function onDocumentMouseUp( event ) {
  // update the mouse variable
  updateMouse(event);

  // If we didn't click anything, just don't worry about it
  if (!CLICKED_POSE) return;

  // display nearby images
  // create a Ray with origin at the mouse position
  // and direction into the scene (views["ThirdPerson"].camera direction)
  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  var ray = new THREE.Raycaster( interactiveView.camera.position, vector.unproject(interactiveView.camera).sub( views["ThirdPerson"].camera.position ).normalize() );

  // create an array containing all objects in the scene with which the ray intersects
  var stitchedPoses = StitchVisiblePoses();
  var intersects = ray.intersectObjects( stitchedPoses );

  // if there is one (or more) intersections
  if ( intersects.length > 0 && intersects[ 0 ].object == CLICKED_POSE) 
    UpdateForNewPose(intersects[ 0 ].object);
  CLICKED_POSE = null;
}

function onDocumentMouseDown( event ) {
  // update the mouse variable
  updateMouse(event);

  if (params.FirstPerson) return;
  // display nearby images
  // create a Ray with origin at the mouse position
  // and direction into the scene (views["ThirdPerson"].camera direction)
  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  var ray = new THREE.Raycaster( interactiveView.camera.position, vector.unproject(interactiveView.camera).sub( views["ThirdPerson"].camera.position ).normalize() );

  // create an array containing all objects in the scene with which the ray intersects
  var stitchedPoses = StitchVisiblePoses();
  var intersects = ray.intersectObjects( stitchedPoses );

  // if there is one (or more) intersections
  if ( intersects.length > 0 ) {
    CLICKED_POSE = intersects[ 0 ].object;
  } else {
    CLICKED_POSE = null;
  }
}

function onDocumentMouseMove( event ) 
{
  // update the mouse variable
  updateMouse(event);

  if (params.FirstPerson) return;
   // create a Ray with origin at the mouse position
  //   and direction into the scene (views["ThirdPerson"].camera direction)
  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  // projector.unprojectVector( vector, views["ThirdPerson"].camera );
  var ray = new THREE.Raycaster( interactiveView.camera.position, vector.unproject(interactiveView.camera).sub( interactiveView.camera.position ).normalize() );

  // create an array containing all objects in the scene with which the ray intersects
  var stitchedPoses = StitchVisiblePoses();
  var intersects = ray.intersectObjects( stitchedPoses );

  for (var i = 0; i < cameraPoses.length; i++)
    cameraPoses[i].visible = false;
  if (!params.FirstPerson) {
    if (intersects.length > 0) {
      var rangeOfPoses = 20;
      var mid = intersects[ 0 ].object.poseIndex;
      start = Math.max(mid - rangeOfPoses, 0);
      end = Math.min(mid + rangeOfPoses, cameraPoses.length-1);
      for (var i = start; i < end; i++) {
        var opacity = 1 - (Math.abs(i-mid)/rangeOfPoses) * (Math.abs(i-mid)/rangeOfPoses);
        cameraPoses[i].visible = true;
        cameraPoses[i].material.opacity = opacity;
      }
    } else {
      for (var i = 0; i < stitchedPoses.length; i++) {
        var distance = ray.ray.distanceToPoint(stitchedPoses[i].position);
        if (distance < radiusAroundObject && !params.FirstPerson ) {
          var opacity = 1 - (distance/radiusAroundObject)*(distance/radiusAroundObject);
          stitchedPoses[i].visible = true;
          stitchedPoses[i].material.opacity = opacity;
        }
      }
    }
  }

  CURRENT_POSE.visible = true;
  CURRENT_POSE.material.opacity = 1.0;
  for (var i = currentlySelectedPoses.length - 1; i >= 0; i--) {
    currentlySelectedPoses[i].visible = true;
    currentlySelectedPoses[i].material.opacity = 1.0;
  };

  // INTERSECTED = the object in the scene currently closest to the interactiveView.camera 
  //    and intersected by the Ray projected from the mouse position  
  
  // if there is one (or more) intersections
  if ( intersects.length > 0 )
  {
    // if the closest object intersected is not the currently stored intersection object
    if ( intersects[ 0 ].object != INTERSECTED ) 
    {
        // restore previous intersection object (if it exists) to its original color
        // and make it invisible
      if ( INTERSECTED ) {
        RestorePose(INTERSECTED);
      }
      // store reference to closest object as current intersection object
      INTERSECTED = intersects[ 0 ].object;
      // // store color of closest object (for later restoration)
      INTERSECTED.material.color.setHex(0xffff00);
    }
  } 
  else // there are no intersections
  {
    // restore previous intersection object (if it exists) to its original color
    if ( INTERSECTED ) {
      RestorePose(INTERSECTED);
    }
    // remove previous intersection object reference
    //     by setting current intersection object to "nothing"
    INTERSECTED = null;
  }
}

function onWindowResize() {
  containerWidth = window.innerWidth;
  containerHeight = window.innerHeight;
  // console.log(containerWidth);

  views["ThirdPerson"].camera.aspect = containerWidth / containerHeight;
  views["ThirdPerson"].camera.updateProjectionMatrix();

  views["FirstPerson"].camera.aspect = containerWidth / containerHeight;
  views["FirstPerson"].camera.updateProjectionMatrix();

  frustumHeight = 2 * Math.tan(interactiveView.camera.fov * (Math.PI/180) / 2) * interactiveView.camera.near;
  renderer.setSize( containerWidth, containerHeight );

}

function animate(time) {
  setTimeout( function() {
    requestAnimationFrame( animate );
  }, MAXFRAMERATE - params.Speed - MINFRAMERATE);

  if (params.Play) {
    var current_idx = CURRENT_POSE.poseIndex;
    current_idx++;
    if (current_idx >= cameraPoses.length) current_idx = 0;
    UpdateForNewPose(cameraPoses[current_idx]);
  }

  // interactiveView.controls.update();
  update();
  render();
  TWEEN.update();
  updateCameraPosePointCloud(time);
}

function update() {
  checkKeyboard();

  // Basically, find the furthest possible point from the camera, and set that to be black.
  // Then find the closest possible point, and set that to be white
  if (false && pointCloud.visible) {
    // var cameraDistance = camera.position.distanceTo(point_cloud_geo.boundingSphere.center);
    // var pointCloudRadius = point_cloud_geo.boundingSphere.radius;
    // var farthestDistance;
    // if (cameraDistance > pointCloudRadius) {
    //   farthestDistance = 2 * pointCloudRadius;
    //   for( var i = 0; i < point_cloud_geo.vertices.length; i++ ) {
    //       var distance = camera.position.distanceTo(pointCloud.geometry.vertices[i]) - cameraDistance + pointCloudRadius;
    //       distance = 1.0 - (distance/farthestDistance);
    //       pointCloud.geometry.colors[i].setRGB(distance, distance, distance);
    //       // pointCloud.geometry.colors[i].setHSL(0, 1.0, distance);
    //   }
    // } else {
    //   farthestDistance = pointCloudRadius + cameraDistance;
    //   for( var i = 0; i < point_cloud_geo.vertices.length; i++ ) {
    //       var distance = camera.position.distanceTo(pointCloud.geometry.vertices[i]);
    //       distance = 1.0 - (distance/farthestDistance);
    //       pointCloud.geometry.colors[i].setRGB(distance, distance, distance);
    //       // pointCloud.geometry.colors[i].setHSL(0, 1.0, distance);
    //   }
    // }

    var currPoseVisiblePointsIdx = 0;
    for( var i = 0; i < point_cloud_geo.vertices.length; i++ ) {
      if (i == CURRENT_POSE.visiblePoints[currPoseVisiblePointsIdx]) {
        // pointCloud.geometry.colors[i].setRGB(1.0, 0, 0);
        pointCloud.pcAttributes.alpha.value[ i ] = params.PointCloudOpacity;
        currPoseVisiblePointsIdx++;
      } else {
        // pointCloud.geometry.colors[i].setRGB(1.0, 1.0, 1.0);
        if (params.OnlyCurrentPoints)
          pointCloud.pcAttributes.alpha.value[ i ] = 0.0;
        else 
          pointCloud.pcAttributes.alpha.value[ i ] = params.PointCloudOpacity;
      }

      pointCloud.pcAttributes.size.value[ i ] = params.PointCloudSize;
    }
    // console.log(point_cloud_geo.boundingSphere);
    // pointCloud.geometry.colorsNeedUpdate = true;
    pointCloud.pcAttributes.alpha.needsUpdate = true; // important!
    pointCloud.pcAttributes.size.needsUpdate = true; // important!
    // pointCloud.pcAttributes.color.needsUpdate = true; // important!
  }
}

var oldTime = 0;
function updateCameraPosePointCloud(time) {
  var dt = time/1000;
  
  var quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(CURRENT_POSE.poseError[3], CURRENT_POSE.poseError[4], CURRENT_POSE.poseError[5]).normalize(), dt);
  //quat.normalize();
  
  var transformation = new THREE.Matrix4().makeRotationFromQuaternion(quat);

  //var transformation = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(CURRENT_POSE.poseError[3] * dt, CURRENT_POSE.poseError[4] * dt, CURRENT_POSE.poseError[5] * dt, 'XYZ'));
  CURRENT_POSE_OBJECT.rotationalPoints.matrix.copy(transformation);
}

var oldCameraPosition;
var oldCameraRot;

function checkKeyboard() {
  if (keyboard.pressed("left")) {
    var current_idx = CURRENT_POSE.poseIndex;
    
    current_idx--;
    if (current_idx < 0) current_idx = cameraPoses.length - 1;
    UpdateForNewPose(cameraPoses[current_idx]);
  }
  
  if (keyboard.pressed("right")) {
    var current_idx = CURRENT_POSE.poseIndex;
    current_idx++;
    if (current_idx >= cameraPoses.length) current_idx = 0;
    UpdateForNewPose(cameraPoses[current_idx]);
  }
};

function render() {
  renderer.clear();

  renderer.render( scene, camera );
}

function createImageViewer() {
// fix for issue where it doesn't render transapernt all the time
// texture = new THREE.Texture(textureImage);
// texture.needsUpdate = true;
// material = new THREE.MeshBasicMaterial({
//     map: texture,
//     transparent: true,
//     side: THREE.BackSide
//  }); 
// material2 = new THREE.MeshBasicMaterial({
//     map: texture,
//     transparent: true
// });
// geometry = new THREE.SphereGeometry(RADIUS, 40, 20);
// mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);
// mesh = new THREE.Mesh(geometry, material2);
// scene.add(mesh);

  var geometry = new THREE.PlaneBufferGeometry(6.4, 4.8);
  var texture = THREE.ImageUtils.loadTexture( CONTEXT_BOX_TEXTURE );
  var material = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, map: texture, 
                                                opacity: 0.4, transparent: true} );
  material.depthTest = false;
  ImageViewer = new THREE.Mesh( geometry, material );

  scene.add( ImageViewer );
}

function createBoundingBox() {
  // Make it as large as the point cloud
  point_cloud_geo.computeBoundingBox();
  point_cloud_geo.computeBoundingSphere();
  var pointCoudBox = point_cloud_geo.boundingBox;

  var geometry = new THREE.PlaneBufferGeometry(pointCoudBox.max.x - pointCoudBox.min.x, pointCoudBox.max.y - pointCoudBox.min.y);

  var texture = THREE.ImageUtils.loadTexture( CONTEXT_BOX_TEXTURE );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);

  var material = new THREE.MeshBasicMaterial( {side: THREE.FrontSide, map: texture} );
  sceneBoundingBox = new THREE.Mesh( geometry, material );
  sceneBoundingBox.translateZ(pointCoudBox.min.z);
  sceneBoundingBox.updateMatrix();

  sceneBoundingBox.matrixAutoUpdate = false;
  sceneBoundingBox.updateMatrix = false;
  sceneBoundingBox.rotationAutoUpdate = false;

  scene.add( sceneBoundingBox );
}

function createTrajectory() {
  var width = 0.4;
  var trajPoint1 = new THREE.Vector3(-width/2, 0, 0);
  var trajPoint2 = new THREE.Vector3( width/2, 0, 0);
  var texturePosition = 0.0;

  for (var trajNum = 0; trajNum < camera_poses.length; trajNum++) {
    var traj_geo = new THREE.Geometry();
    traj_geo.faceVertexUvs[0] = [];
    
    // Set up camera_poses geometry
    for ( var i = 0; i < camera_poses[trajNum].length; i+=7) {
      var currentPoint = new THREE.Vector3(camera_poses[trajNum][i + 4], camera_poses[trajNum][i + 5], camera_poses[trajNum][i + 6]);
      var currentQuat = new THREE.Quaternion(-camera_poses[trajNum][i], -camera_poses[trajNum][i+1], -camera_poses[trajNum][i+2], camera_poses[trajNum][i+3]);
      var previousPoint = new THREE.Vector3(camera_poses[trajNum][i + 4 - 7], camera_poses[trajNum][i + 5 - 7], camera_poses[trajNum][i + 6 - 7]);
      var previousQuat = new THREE.Quaternion(-camera_poses[trajNum][i - 7], -camera_poses[trajNum][i+1 - 7], -camera_poses[trajNum][i+2 - 7], camera_poses[trajNum][i+3 - 7]);
      
      var point1 = currentPoint.clone();
      var point2 = currentPoint.clone();
      
      var distance = currentPoint.distanceTo(previousPoint);
      
      if (i == 0) {
        // Just create and add the initial points
        var rotatedTrajPoint1 = trajPoint1.clone();
        var rotatedTrajPoint2 = trajPoint2.clone();
        
        rotatedTrajPoint1.applyQuaternion(currentQuat);
        rotatedTrajPoint2.applyQuaternion(currentQuat);
        
        point1.add(rotatedTrajPoint1);
        point2.add(rotatedTrajPoint2);
        
        traj_geo.vertices.push(point1, point2);
        continue;
      }
      
      var currentIteration = 1.0;
      var remainingDistance = distance;
      while (currentIteration - texturePosition < distance) {
        var newPoint = previousPoint.lerp(currentPoint, (currentIteration - texturePosition)/distance);
        var newQuat = previousQuat.slerp(currentQuat, (currentIteration - texturePosition)/distance);
        
        var newPoint1 = newPoint.clone();
        var newPoint2 = newPoint.clone();
        var rotatedTrajPoint1 = trajPoint1.clone();
        var rotatedTrajPoint2 = trajPoint2.clone();
        
        rotatedTrajPoint1.applyQuaternion(newQuat);
        rotatedTrajPoint2.applyQuaternion(newQuat);
        newPoint1.add(rotatedTrajPoint1);
        newPoint2.add(rotatedTrajPoint2);
        
        traj_geo.vertices.push(newPoint1, newPoint2);
        
        var pointCount = traj_geo.vertices.length - 1;
          
        var normal = new THREE.Vector3();
        normal.subVectors(traj_geo.vertices[pointCount], traj_geo.vertices[pointCount - 3]);
        normal.cross(new THREE.Vector3().subVectors(traj_geo.vertices[pointCount - 1], traj_geo.vertices[pointCount - 2]));
        normal.normalize();
        
        var face1 = new THREE.Face3(pointCount - 2, pointCount, pointCount - 3, normal);
        var face2 = new THREE.Face3(pointCount - 3, pointCount, pointCount - 1, normal);
        traj_geo.faces.push(face1, face2);
        
        var currentTexturePosition = 1.0;
        var previousTexturePosition = texturePosition;
        var uv1 = new THREE.Vector2(0, previousTexturePosition);
        var uv2 = new THREE.Vector2(1, previousTexturePosition);
        var uv3 = new THREE.Vector2(0, currentTexturePosition);
        var uv4 = new THREE.Vector2(1, currentTexturePosition);
        
        traj_geo.faceVertexUvs[0].push([uv2, uv4, uv1]);
        traj_geo.faceVertexUvs[0].push([uv1, uv4, uv3]);
        
        remainingDistance -= (1.0 - texturePosition);
        currentIteration++;
        texturePosition = 0.0;
        previousPoint = newPoint.clone();
        previousQuat = newQuat.clone();
      }
      
      var newPoint1 = currentPoint.clone();
      var newPoint2 = currentPoint.clone();
      var rotatedTrajPoint1 = trajPoint1.clone();
      var rotatedTrajPoint2 = trajPoint2.clone();
      
      rotatedTrajPoint1.applyQuaternion(currentQuat);
      rotatedTrajPoint2.applyQuaternion(currentQuat);
      newPoint1.add(rotatedTrajPoint1);
      newPoint2.add(rotatedTrajPoint2);
      
      traj_geo.vertices.push(newPoint1, newPoint2);
      
      var pointCount = traj_geo.vertices.length - 1;
      
      var normal = new THREE.Vector3();
      normal.subVectors(traj_geo.vertices[pointCount], traj_geo.vertices[pointCount - 3]);
      normal.cross(new THREE.Vector3().subVectors(traj_geo.vertices[pointCount - 1], traj_geo.vertices[pointCount - 2]));
      normal.normalize();
      
      var face1 = new THREE.Face3(pointCount - 2, pointCount, pointCount - 3, normal);
      var face2 = new THREE.Face3(pointCount - 3, pointCount, pointCount - 1, normal);
      traj_geo.faces.push(face1, face2);
      
      var oldTexturePosition = texturePosition;
      texturePosition += remainingDistance;
      
      var currentTexturePosition = texturePosition;
      var previousTexturePosition = oldTexturePosition;
      var uv1 = new THREE.Vector2(0, previousTexturePosition);
      var uv2 = new THREE.Vector2(1, previousTexturePosition);
      var uv3 = new THREE.Vector2(0, currentTexturePosition);
      var uv4 = new THREE.Vector2(1, currentTexturePosition);
      
      traj_geo.faceVertexUvs[0].push([uv2, uv4, uv1]);
      traj_geo.faceVertexUvs[0].push([uv1, uv4, uv3]);
    }
    // sceneTranslationVector = traj_geo.center();

    // material
    var texture = THREE.ImageUtils.loadTexture(CHEVRON_TEXTURE[trajNum]);
    var material = new THREE.MeshLambertMaterial({map: texture});
    // var material = new THREE.MeshBasicMaterial({map: texture});
    material.side = THREE.DoubleSide;

    // camera_poses
    traj_geo.computeVertexNormals();
    var geometry = new THREE.BufferGeometry();
    geometry.fromGeometry(traj_geo);
    trajectory_drawing[trajNum] = new THREE.Mesh(geometry, material);
    
    trajectory_drawing[trajNum].translateX(sceneTranslationVector.x);
    trajectory_drawing[trajNum].translateY(sceneTranslationVector.y);
    trajectory_drawing[trajNum].translateZ(sceneTranslationVector.z);
    trajectory_drawing[trajNum].updateMatrix();
    
    trajectory_drawing[trajNum].matrixAutoUpdate = false;
    trajectory_drawing[trajNum].updateMatrix = false;
    trajectory_drawing[trajNum].rotationAutoUpdate = false;

    scene.add(trajectory_drawing[trajNum]);
    
    // Create the shadow
    var shadowMaterial = new THREE.MeshBasicMaterial({color: 0x555555});
    shadow[trajNum] = new THREE.Mesh(geometry, shadowMaterial);
    
    var scaleMatrix = new THREE.Matrix4();
    scaleMatrix.makeScale(1, 1, 0.001);
    shadow[trajNum].applyMatrix(scaleMatrix);
    
    point_cloud_geo.computeBoundingBox();
    point_cloud_geo.computeBoundingSphere();
    var pointCoudBox = point_cloud_geo.boundingBox;
    
    shadow[trajNum].translateX(sceneTranslationVector.x);
    shadow[trajNum].translateY(sceneTranslationVector.y);
    shadow[trajNum].translateZ(0.001 + pointCoudBox.min.z);
    shadow[trajNum].updateMatrix();
    
    shadow[trajNum].matrixAutoUpdate = false;
    shadow[trajNum].updateMatrix = false;
    shadow[trajNum].rotationAutoUpdate = false;

    trajectory_drawing[trajNum].shadow = shadow[trajNum];
    
    scene.add(shadow[trajNum]);
  }
}

function createPoses () {
  var sphereGeometry = new THREE.SphereGeometry( 0.1 );
  for (var trajNum = 0; trajNum < camera_poses.length; trajNum++) {
    individalTrajPoses.push([]);
    var totalPoses = camera_poses[trajNum].length/7;
    for ( var i = 0; i < totalPoses; i++) {
      // Add the core of the object
      var camera_array_index = i * 7;
      var image_num = i * intervalBetweenPoses + startingImageId[trajNum];
      var material = new THREE.MeshLambertMaterial( { color: 0x000000, transparent: true } );
      var centerPose = new THREE.Mesh( sphereGeometry, material );
      centerPose.poseIndex = cameraPoses.length; 
      centerPose.fishimagefile = FISH_IMAGE_DIRECTORY[trajNum] + GetImageFile(image_num.toString());
      centerPose.recimagefile = REC_IMAGE_DIRECTORY[trajNum] + GetImageFile(image_num.toString());
      centerPose.fishImageTexture = null;
      centerPose.recImageTexture = null;
      centerPose.visiblePoints = [];
      for (var j = 2*i; j <= 2*(i+200); j++) {
          centerPose.visiblePoints.push(j);
      }
      centerPose.poseError = fake_pose_error[centerPose.poseIndex]; // just for testing purposes
      // centerPose.poseError = [0.8, 0.5, 1.4, 0.7, 0.2, 1.3];
      // centerPose.fishImageTexture = THREE.ImageUtils.loadTexture( centerPose.recimagefile );
      centerPose.position.set(camera_poses[trajNum][camera_array_index + 4] + sceneTranslationVector.x, 
                              camera_poses[trajNum][camera_array_index + 5] + sceneTranslationVector.y, 
                              camera_poses[trajNum][camera_array_index + 6] + sceneTranslationVector.z);
      centerPose.quaternion.set(-camera_poses[trajNum][camera_array_index], 
                                -camera_poses[trajNum][camera_array_index + 1], 
                                -camera_poses[trajNum][camera_array_index + 2], 
                                camera_poses[trajNum][camera_array_index + 3] )
      centerPose.visible = false;
      cameraPoses.push(centerPose);
      individalTrajPoses[trajNum].push(centerPose);
      scene.add(centerPose);
    }
  }

  CURRENT_POSE_OBJECT = new THREE.Object3D();
  var radius = 1.0;

  var rollEllipse = new THREE.EllipseCurve( 0,  0, radius, radius, 0,  2 * Math.PI, false);
  var pitchEllipse = new THREE.EllipseCurve( 0,  0, radius, radius, 0,  2 * Math.PI, false);
  var yawEllipse = new THREE.EllipseCurve( 0,  0, radius, radius, 0,  2 * Math.PI, false);

  var verticesInEllipse = 100;
  var path = new THREE.Path( rollEllipse.getPoints(verticesInEllipse) );
  var geometry = path.createPointsGeometry( verticesInEllipse );
  var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  var roll_orbital = new THREE.Line( geometry, material );
  CURRENT_POSE_OBJECT.add(roll_orbital);
  var path = new THREE.Path( pitchEllipse.getPoints(verticesInEllipse) );
  var geometry = path.createPointsGeometry( verticesInEllipse );
  var material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
  var pitch_orbital = new THREE.Line( geometry, material );
  pitch_orbital.rotation.x = Math.PI / 2.0;
  CURRENT_POSE_OBJECT.add(pitch_orbital);
  var path = new THREE.Path( yawEllipse.getPoints(verticesInEllipse) );
  var geometry = path.createPointsGeometry( verticesInEllipse );
  var material = new THREE.LineBasicMaterial( { color: 0x00ff00 } );
  var yaw_orbital = new THREE.Line( geometry, material );
  yaw_orbital.rotation.y = Math.PI / 2.0;
  CURRENT_POSE_OBJECT.add(yaw_orbital);  

  // Add axis to pose
  // x-axis
  /*material = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    linewidth: 1.6
  });
  geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3( 0, 0, 0 ),
    new THREE.Vector3( radius, 0, 0 )
  );
  line = new THREE.Line( geometry, material );
  CURRENT_POSE_OBJECT.add( line );
  // y-axis
  material = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: 1.6
  });
  geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3( 0, 0, 0 ),
    new THREE.Vector3( 0, radius, 0 )
  );
  line = new THREE.Line( geometry, material );
  CURRENT_POSE_OBJECT.add( line );
  // z-axis
  var material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 1.6
  });
  var geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3( 0, 0, 0 ),
    new THREE.Vector3( 0, 0, radius )
  );
  var line = new THREE.Line( geometry, material );
  CURRENT_POSE_OBJECT.add( line );*/
  
  var pointCount = 300;
  var boundary = new THREE.Sphere(new THREE.Vector3(0, 0, 0), radius);
  var pointsGeometry = new THREE.Geometry();
  for (var i = 0; i < pointCount; i++) {
    var point = new THREE.Vector3(Math.random() * 2 * radius - radius, Math.random() * 2 * radius - radius, Math.random() * 2 * radius - radius);
    var length = point.length();
    if (length > radius) {
      point.setLength(radius);
    }
    boundary.clampPoint(point);
    pointsGeometry.vertices.push(point);
  }
  
  var particleImage = THREE.ImageUtils.loadTexture( POINT_CLOUD_TEXTURE );
  var pointsMaterial = new THREE.PointCloudMaterial({size: 0.15, transparent: true, opacity: 0.6, color:0xffff00, map: particleImage});
  
  var pointsObject = new THREE.PointCloud(pointsGeometry, pointsMaterial);
  pointsObject.matrixAutoUpdate = false;
  CURRENT_POSE_OBJECT.rotationalPoints = pointsObject;
  CURRENT_POSE_OBJECT.add(pointsObject);

  material = new THREE.MeshLambertMaterial( { color: 0x000088, opacity: 0.55, transparent: true, wireframe: true } );
  geometry = new THREE.SphereGeometry( radius );
  /*var shell = new THREE.Mesh( geometry, material );
  CURRENT_POSE_OBJECT.add(shell);*/
  CURRENT_POSE_OBJECT.visible = false;

  scene.add(CURRENT_POSE_OBJECT);
}

function createPointCloud() {
  // Make geometry
  // Set up camera_poses geometry
  for ( var i = 0; i < point_cloud.length; i+=3) {
    point_cloud_geo.vertices.push(new THREE.Vector3(point_cloud[i+0], 
                                                    point_cloud[i+1], 
                                                    point_cloud[i+2]));
  }
  sceneTranslationVector = point_cloud_geo.center();
  point_cloud_geo.dynamic = true;

  // vertex colors
  // var colors = [];
  // for( var i = 0; i < point_cloud_geo.vertices.length; i++ ) {
  //     colors[i] = new THREE.Color();
  //     // colors[i].setRGB(point_cloud[i][3]/255.0, point_cloud[i][4]/255.0, point_cloud[i][5]/255.0);
  //     colors[i].setRGB(1,1,1);
  // }
  // point_cloud_geo.colors = colors;

  var particleImage = THREE.ImageUtils.loadTexture( POINT_CLOUD_TEXTURE );

  // material
  var material = new THREE.PointCloudMaterial( {
      size: 0.1,
      transparent: true,
      opacity: 0.4,
      // vertexColors: THREE.VertexColors,
      map: particleImage,
  } );

  // point cloud
  pointCloud = new THREE.PointCloud( point_cloud_geo, material );

  pointCloud.visible = false;
  pointCloud.matrixAutoUpdate = false;
  pointCloud.updateMatrix = false;
  pointCloud.rotationAutoUpdate = false;

  scene.add( pointCloud );

}

function StitchVisiblePoses() {
  var poses = [];
  for (var trajNum = 0; trajNum < NumberOfTrajectories; trajNum++)
    if (trajectory_drawing[trajNum].visible)
      poses = poses.concat(individalTrajPoses[trajNum]);
  return poses;
}

function RestorePose(centerOfPose) {
  if (CURRENT_POSE == centerOfPose) return; // don't change the current pose
  for (var i = currentlySelectedPoses.length - 1; i >= 0; i--) {
    if (currentlySelectedPoses[i] == centerOfPose) return;
  };
  centerOfPose.material.color.setHex(0x000000);
  centerOfPose.visible = false;
}

function DeselectAllPoses() {
    for (var i = currentlySelectedPoses.length - 1; i >= 0; i--) {
      if (currentlySelectedPoses[i] != CURRENT_POSE) {
        currentlySelectedPoses[i].material.color.setHex(0x000000);
        currentlySelectedPoses[i].visible = false;
      }
    };
    currentlySelectedPoses = [];
}

function UpdateForNewPose (centerOfPose) {
  // Restore current pose 
  oldPose = CURRENT_POSE;
  CURRENT_POSE = centerOfPose;
  if (oldPose)
    RestorePose(oldPose);

  CURRENT_POSE.visible = true;
  CURRENT_POSE.material.color.setHex(0xffff00);

  if (params.Selecting) {
    currentlySelectedPoses.push(centerOfPose);
  } else if (params.Deselecting) {
    var indexOfPoseToDeselect = currentlySelectedPoses.indexOf(centerOfPose);
    currentlySelectedPoses.splice(indexOfPoseToDeselect,1);
  }
  for (var i = currentlySelectedPoses.length - 1; i >= 0; i--) {
    currentlySelectedPoses[i].visible = true;
    currentlySelectedPoses[i].material.opacity = 1.0;
    currentlySelectedPoses[i].material.color.setHex(0xffff00);
  };

  if (!params.FirstPerson) {
    CURRENT_POSE_OBJECT.visible = true;
  } else {
    interactiveView.controls.target.set(CURRENT_POSE.position.x, CURRENT_POSE.position.y, CURRENT_POSE.position.z+0.00001);
    // interactiveView.controls.object.position.set(CURRENT_POSE.position.x, CURRENT_POSE.position.y, CURRENT_POSE.position.z);
  }

  CURRENT_POSE_OBJECT.scale.set(CURRENT_POSE.poseError[0], CURRENT_POSE.poseError[1], CURRENT_POSE.poseError[2]);
  CURRENT_POSE_OBJECT.position.set(CURRENT_POSE.position.x, CURRENT_POSE.position.y, CURRENT_POSE.position.z);
  CURRENT_POSE_OBJECT.quaternion.set(CURRENT_POSE.quaternion.x, CURRENT_POSE.quaternion.y, 
                                     CURRENT_POSE.quaternion.z, CURRENT_POSE.quaternion.w);

  view = views["ThirdPerson"];
  camera = view.camera;
  view.updateCamera( camera, scene, mouse.x, mouse.y );
  camera.updateProjectionMatrix();

  if (ImageViewer.visible) {
    var zOffset = views["FirstPerson"].near + 0.1;
    ImageViewer.rotation.copy( CURRENT_POSE.rotation );
    ImageViewer.position.copy( CURRENT_POSE.position );
    ImageViewer.rotateOnAxis(XAXIS, Math.PI);
    ImageViewer.updateMatrix();
    var h = zOffset * Math.tan( views["FirstPerson"].fov * (Math.PI / 180)); // to radians
    var imageScale = h/ImageViewer.geometry.parameters.height;
    // var imageScale = 0.9082727587400484;
    ImageViewer.scale.set(imageScale, imageScale, imageScale);
    // ImageViewer.scale.x = 0.932018;
    ImageViewer.translateZ( -zOffset );
  }

  var startIndex = Math.max(0, CURRENT_POSE.poseIndex - 5);
  var endIndex = Math.min(cameraPoses.length-1, CURRENT_POSE.poseIndex + 15);
  for (var i = startIndex; i < endIndex; i++) { // load the next ten textures
    if (!cameraPoses[i].fishImageTexture)
      cameraPoses[i].fishImageTexture = THREE.ImageUtils.loadTexture( cameraPoses[i].fishimagefile );
    if (!cameraPoses[i].recImageTexture)
      cameraPoses[i].recImageTexture = THREE.ImageUtils.loadTexture( cameraPoses[i].recimagefile );
  }

  ImageViewer.material.map = CURRENT_POSE.recImageTexture;
  
  // document.getElementById("currentImage").style.visibility = 'visible';
  document.getElementById("currentImage").src = CURRENT_POSE.fishimagefile;
}

function ResetView() {
    // Camera setup
  for (var key in views) {
    var view = views[key];
    if (!view.camera) {
      camera = new THREE.PerspectiveCamera( view.fov, containerWidth / containerHeight, view.near, 1000 );
      var index = 0;
      // camera.projectionMatrix.set(m[index++], m[index++], m[index++], m[index++], m[index++], m[index++], m[index++], m[index++], m[index++], m[index++], m[index++], m[index++], m[index++], m[index++], m[index++], m[index++]);
      camera.up.x = view.up[ 0 ];
      camera.up.y = view.up[ 1 ];
      camera.up.z = view.up[ 2 ];
      // camera.setLens(cameraParams.focalLength.x);
      // camera.useQuaternion = true;
      view.camera = camera;
        view.controls = new THREE.OrbitControls(view.camera, renderer.domElement); // Add orbital controls to FirstPerson camera
      view.controls.noKeys = true;  // So that arrow keys don't cause object to pan
      view.controls.addEventListener( 'change', render );
    } else {
      view.controls.update();
    }
    camera.position.x = view.eye[ 0 ];
    camera.position.y = view.eye[ 1 ];
    camera.position.z = view.eye[ 2 ];
    // camera.useQuaternion
    camera.lookAt(sceneBoundingBox.position);
    camera.updateProjectionMatrix();
  }
  params.FirstPerson = false;
  views["ThirdPerson"].controls.noPan = false;
  views["ThirdPerson"].controls.noZoom = false;
  CURRENT_POSE_OBJECT.visible = true;

  // views["FirstPerson"].controls.enabled = false;
  interactiveView = views["ThirdPerson"];
  frustumHeight = 2 * Math.tan(interactiveView.camera.fov * (Math.PI/180) / 2) * interactiveView.camera.near;
  interactiveView.controls.target.set(0,0,0);
  if (renderer)
    interactiveView.controls.update();
}

function GetImageFile(id) {
  var name = id.length >= 8 ? id : new Array(8 - id.length + 1).join('0') + id;
  return name + ".jpg";
}

var targetRot = new THREE.Euler();
function TogglePerspective() {
  if (params.FirstPerson) {
    params.FirstPerson = false;
    views["ThirdPerson"].controls.noPan = false;
    views["ThirdPerson"].controls.noZoom = false;
    interactiveView.controls.target.set(0,0,0);
    CURRENT_POSE_OBJECT.visible = true;
    var camPosition = views["ThirdPerson"].camera.position.clone();
    var camRot = views["ThirdPerson"].camera.rotation.clone();
    
    var tween = new TWEEN.Tween(camPosition).to(oldCameraPosition, 2000).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function () {
          views["ThirdPerson"].camera.position.x = camPosition.x;
          views["ThirdPerson"].camera.position.y = camPosition.y;
          views["ThirdPerson"].camera.position.z = camPosition.z;
        }).onComplete(function () {}).start();
    var tween = new TWEEN.Tween(camRot).to(oldCameraRot, 2000)
    .easing(TWEEN.Easing.Linear.None).onUpdate(function () {
      // Need this line otherwise, we get an error
      camRot.onChangeCallback = function() {};
      views["ThirdPerson"].camera.rotation.x = camRot.x;
      views["ThirdPerson"].camera.rotation.y = camRot.y;
      views["ThirdPerson"].camera.rotation.z = camRot.z;
    }).onComplete(function () { 
                      pointCloud.material.size = 0.1; 
                      pointCloud.material.opacity = 0.4; 
                      CURRENT_POSE_OBJECT.visible = true; }).start();

  } else {
    params.FirstPerson = true;
    views["ThirdPerson"].controls.noPan = true;
    views["ThirdPerson"].controls.noZoom = true;
    pointCloud.material.size = 0.03; 
    pointCloud.material.opacity = 0.8; 
    if (params.Play) 
      CURRENT_POSE_OBJECT.visible = false;
    interactiveView.controls.target.set(CURRENT_POSE.position.x, CURRENT_POSE.position.y, CURRENT_POSE.position.z+0.00001);
    var camPosition = views["ThirdPerson"].camera.position.clone();
    oldCameraPosition = camPosition.clone();
    var camRot = views["ThirdPerson"].camera.rotation.clone();
    oldCameraRot = camRot.clone();
  
    targetRot.setFromQuaternion(CURRENT_POSE.quaternion.clone().multiply(XAXISQUAT));
    
    var tween = new TWEEN.Tween(camPosition).to(CURRENT_POSE_OBJECT.position, 2000).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function () {
          views["ThirdPerson"].camera.position.x = camPosition.x;
          views["ThirdPerson"].camera.position.y = camPosition.y;
          views["ThirdPerson"].camera.position.z = camPosition.z;
        }).onComplete(function () {}).start();
    var tween = new TWEEN.Tween(camRot).to(targetRot, 2000)
        .easing(TWEEN.Easing.Linear.None).onUpdate(function () {
           // Need this line otherwise, we get an error
           camRot.onChangeCallback = function() {};
           views["ThirdPerson"].camera.rotation.x = camRot.x;
           views["ThirdPerson"].camera.rotation.y = camRot.y;
           views["ThirdPerson"].camera.rotation.z = camRot.z;
             }).onComplete(function () { CURRENT_POSE_OBJECT.visible = false; }).start();
  }
    
}

// Set up gui
var imageGui;
var cloudGui;
var trajectoriesGui;
var contextGUI;
var selectAndFilterGUI;
var toggleVis;

window.onload = function() {
  var resetObj = { 'Reset Camera': function(){ ResetView() }};
  var togglePersp = { 'Toggle POV': function() { TogglePerspective() }}
  var pers = { test: 1.0, test2: 60 };

  gui.add(resetObj,'Reset Camera');
  gui.add(togglePersp,'Toggle POV');
  gui.add(params, 'Play');
  gui.add(params, 'Top Left Image').onChange(function(value) {
                                            if (value) document.getElementById("currentImage").style.visibility = 'visible';
                                            else document.getElementById("currentImage").style.visibility = 'hidden';});
  // gui.add(pers, 'test', 0.0, 2.0)
  //    .onChange(function(value) {ImageViewer.scale.set(value, value, value); console.log(value)});
  // gui.add(interactiveView.camera, 'fov', 20, 100).onChange(function(value){UpdateForNewPose(CURRENT_POSE);});
  gui.add(params, 'Speed', MINFRAMERATE, MAXFRAMERATE);
  // gui.add(interactiveView.camera, 'near', 0.01, 10);

  imageGui = gui.addFolder("Camera Image Viewer");
  imageGui.add(ImageViewer, 'visible').onChange(function(value) { UpdateForNewPose(CURRENT_POSE); });
  imageGui.add(ImageViewer.material, 'opacity', 0, 1.0);
  imageGui.open();

  cloudGui = gui.addFolder("Point Cloud");
  cloudGui.add(pointCloud, 'visible').listen();
  cloudGui.add(pointCloud.material, 'size', 0, 0.25).listen();
  cloudGui.add(pointCloud.material, 'opacity', 0, 1.0).listen();
  // cloudGui.add(params, 'PointCloudSize', 0, 2.25).listen();
  // cloudGui.add(params, 'PointCloudOpacity', 0, 1.0).listen();
  // cloudGui.add(params, 'OnlyCurrentPoints').listen();
  cloudGui.open();

  trajectoriesGui = gui.addFolder("Trajectories");
  for (var trajNum = 0; trajNum < NumberOfTrajectories; trajNum++)
    trajectory_drawing[trajNum].visible = false;
  for (var trajNum = 0; trajNum < NumberOfTrajectories; trajNum++)
    trajectoriesGui.add(trajectory_drawing[trajNum], 'visible').name("Show " + (trajNum+1) ).onChange(function(value) {
                                                                this.object.shadow.visible = value && sceneBoundingBox.visible;
                                                        });
  // trajectoriesGui.open();

  contextGUI = gui.addFolder("Plane and Shadow");
  toggleVis = { 'Toggle Visibility': function(){ sceneBoundingBox.visible = !sceneBoundingBox.visible;
                                                      for (var i in shadow) {shadow[i].visible = sceneBoundingBox.visible && trajectory_drawing[i].visible;}}};
  contextGUI.add(toggleVis, 'Toggle Visibility');
    
  // A terribly hacky way to fix the shadows, but it will work
  toggleVis['Toggle Visibility']();
  toggleVis['Toggle Visibility']();

  selectAndFilterGUI = gui.addFolder("Select/Filter");
  clearSelectedPoses = { 'Deselect All' : function() { DeselectAllPoses() } }
  selectAndFilterGUI.add(clearSelectedPoses, 'Deselect All');
  selectAndFilterGUI.add(params, 'Selecting');
  selectAndFilterGUI.add(params, 'Deselecting');
  
  gui.close();
  // Show first trajectory
  trajectoriesGui.__controllers[0].setValue(true);
  // Hide camera image viewer
  imageGui.__controllers[0].setValue(false);
};

function pressPlayButton() {
  // Toggle play
  gui.__controllers[2].setValue(!params.Play);
}
function pressViewButton() {
  TogglePerspective();
  if (params.FirstPerson) {
    // Show the point cloud
    cloudGui.__controllers[0].setValue(true);
      
    // Hide image viewer
    gui.__controllers[3].setValue(false);
    
    // Show camera image viewer
    imageGui.__controllers[0].setValue(true);
    
    setTimeout(function() {
      // Hide the plane
      if (sceneBoundingBox.visible) {
        toggleVis['Toggle Visibility']();
      }
      
      // Hide all the trajectories
      for (var i in trajectoriesGui.__controllers) {
        trajectoriesGui.__controllers[i].setValue(false);
      }
    },2000);
  } else {
    // Show the first trajectory (and any other that are on screen)
    trajectoriesGui.__controllers[0].setValue(true);
    
    // Show the plane
    if (!sceneBoundingBox.visible) {
      toggleVis['Toggle Visibility']();
    }
    
    setTimeout(function() {
      // Hide the point cloud
      cloudGui.__controllers[0].setValue(false);

      // Show image viewer
      gui.__controllers[3].setValue(true);

      // Hide camera image viewer
      imageGui.__controllers[0].setValue(false);
    }, 2000);
  }
};

function pressPrevButton() {
  var current_idx = CURRENT_POSE.poseIndex;
  
  current_idx--;
  if (current_idx < 0) current_idx = cameraPoses.length - 1;
  UpdateForNewPose(cameraPoses[current_idx]);
};

function pressNextButton() {
  var current_idx = CURRENT_POSE.poseIndex;
  current_idx++;
  if (current_idx >= cameraPoses.length) current_idx = 0;
  UpdateForNewPose(cameraPoses[current_idx]);
};
