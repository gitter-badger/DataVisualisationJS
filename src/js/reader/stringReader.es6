import { toIndex } from '../coords';

const divisor = 1;
const arraySize = Math.floor(256 / divisor);
const size = 3;

export default function(str) {
  var result = new Array(arraySize * arraySize * arraySize);

  for (var i = 2; i < str.length; i += 3) {
    var x = Math.floor(str.charCodeAt(i - 2) / divisor);
    var y = Math.floor(str.charCodeAt(i - 1) / divisor);
    var z = Math.floor(str.charCodeAt(i) / divisor);

    var index = toIndex(x, y, z, arraySize);

    // console.log(str.substr(i - 2, 3) + ' is (' + x + ', ' + y + ', ' + z + ') i: ' + index);
    result[index] = (result[index] || 0) + 1;
  }

  return result;
}
