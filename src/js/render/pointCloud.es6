import OrbitControls from './orbitControls';
import { fromIndex } from '../coords';

var stats = new Stats();
stats.setMode( 0 );
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

var scene, camera, controls, renderer;
var geometry, material, mesh, cubeMesh, cube;
var label;
var cloudMeshes = [];

function createLabel() {
  label = document.createElement('div');
  label.className = 'label';
  label.innerHTML = "&nbsp;";
  document.body.appendChild(label);
}

const baseZoom = 450;

function init() {
  if (scene) {
    return false;
  }

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.y = 200;
  camera.position.z = 500;
  camera.lookAt(origin);

  controls = new OrbitControls(camera);
  controls.target = origin;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 4;
  controls.noPan = false;
  controls.keyPanSpeed = 50;
  controls.maxDistance = baseZoom;

  document.body.appendChild( renderer.domElement );
  createLabel();
  document.body.appendChild( stats.domElement );

  resize();

  window.addEventListener('resize', resize, true);

  renderer.domElement.addEventListener('dblclick', function() {
    controls.autoRotate = !controls.autoRotate;
  });

  animate();

  return true;
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

const origin = new THREE.Vector3(0, -30, 0);
var oldZoom = 0;

function animate() {
  stats.begin();

  if (oldZoom != controls.getScale()) {
    oldZoom = controls.getScale();
    var mult = 1 + ((baseZoom - oldZoom) / baseZoom) * 15;

    for (var i = 0; i < cloudMeshes.length; i++) {
      scene.remove(cloudMeshes[i]);
      var mat = cloudMeshes[i].material;
      mat.size = (75 * mult / mat.numPoints) * mat.numOffset * mult;
      scene.add(cloudMeshes[i]);
    }
  }

  controls.update();
  renderer.render( scene, camera );

  stats.end();

  requestAnimationFrame( animate );
}

const red   = new THREE.Color(1, 0, 0);
const green = new THREE.Color(0, 1, 0);
const blue  = new THREE.Color(0, 0, 1);

window.linearColours = true;

function createPointCloud(points, size) {
  if (cube) {
    scene.remove(cube);
  }

  geometry = new THREE.Geometry();
  var scale  = 250 / size;
  var offset = scale * Math.floor(size / 2);

  var cubeSize = (size - 1) * scale;
  var cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  var cubeMaterial = new THREE.MeshBasicMaterial();

  cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);

  cube = new THREE.BoxHelper( cubeMesh );
  cube.material.color.set( 0x5500FF );
  scene.add( cube );

  var cloudByInt = {};
  var clouds = [];
  var numPoints = 0;

  for (var i = 0; i < points.length; i ++) {
    var point = points[i];

    if (point <= 0 || point === undefined || point === null) {
      continue;
    }

    var cloud = cloudByInt[point];
    if (!cloud) {
      cloud = cloudByInt[point] = {
        'size': point,
        'points': 0,
        'geo': new THREE.Geometry()
      };
      clouds.push(cloud);
    }

    var vertex = new THREE.Vector3();
    var pos = fromIndex(i, size);
		vertex.x = pos[0] * scale - offset;
		vertex.y = pos[1] * scale - offset;
		vertex.z = pos[2] * scale - offset;
    // console.log('index ' + i + ' at value ' + point + ' is ', vertex);
		cloud.geo.vertices.push( vertex );
    cloud.points++;
    numPoints++;
  }

  // Remove the old meshes
  for (var i = 0; i < cloudMeshes.length; i++) {
    scene.remove(cloudMeshes[i]);
  }
  cloudMeshes = [];

  // Add th new meshes, based on wait
  var pointCount = 0;
  clouds.sort(function(a, b) { return a.size - b.size; });
  for (var i = 0; i < clouds.length; i++) {
    pointCount += clouds[i].points;
    var norm = i / (clouds.length - 1);
    var offset = pointCount / numPoints;

    var cloudMaterial = new THREE.PointCloudMaterial(
      {
        'color': hsbToRgb(240 - (240 * norm)),
        'size': (75 / numPoints) * offset,
        'opacity': 0.75,
        'transparent': true,
        'sizeAttenuation': false,
        'transparent': true
      }
    );
    cloudMaterial['numPoints'] = numPoints;
    cloudMaterial['numOffset'] = offset;
  	var cloudMesh = new THREE.PointCloud(clouds[i].geo, cloudMaterial);
    cloudMeshes.push(cloudMesh);
    scene.add(cloudMesh);
  }
}

function hsbToRgb(hue) {
  var hdash   = hue / 60.0;
  var abswork = (hdash % 2.0) - 1.0;
  var X = 1 - Math.abs(abswork);

  var r = 0;
  var g = 0;
  var b = 0;

  if (hdash < 1.0) {
    r = 1.0;
    g = X;
  } else if (hdash < 2.0) {
    r = X;
    g = 1.0;
  } else if (hdash < 3.0) {
    g = 1.0;
    b = X;
  } else if (hdash < 4.0) {
    g = X;
    b = 1.0;
  } else if (hdash < 5.0) {
    r = X;
    b = 1.0;
  } else {
    r = 1.0;
    b = X;
  }

  return new THREE.Color(r * 255, g * 255, b * 255);
}

export function getDOM() {
  init();
  return renderer.domElement;
}

export default function(name, points) {
  init();
  label.innerHTML = name;
  createPointCloud(points, Math.cbrt(points.length));
}
