import strReader from './reader/stringReader';
import fileReader from './reader/fileReader';
import pointCloud, { getDOM } from './render/pointCloud';

window.pointCloud = pointCloud;
fileReader(getDOM());

window.strPointCloud = function(label, str) {
  pointCloud(label, strReader(rfc));
};
