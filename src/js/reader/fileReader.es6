import strReader from './stringReader';
import pointCloud from '../render/pointCloud';

function readFile(file) {
  var reader = new FileReader();

  reader.onloadend = function(evt) {
    if (evt.target.readyState == FileReader.DONE) { // DONE == 2
      var bytes = evt.target.result;
      var array = strReader(bytes);
      pointCloud(file.name, array);
    }
  };

  reader.readAsBinaryString(file);
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.

  // files is a FileList of File objects. List some properties.
  for (var i = 0, f; f = files[i]; i++) {
    readFile(f);
  }
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

export default function(dropZone) {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
  } else {
    console.error('The File APIs are not fully supported in this browser.');
  }
}
