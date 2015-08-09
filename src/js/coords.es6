export function toIndex(x, y, z, size) {
  return x * size * size + y * size + z;
}

export function fromIndex(i, size) {
  var x = Math.floor(i / (size * size));
  var y = Math.floor(i / size) % size;
  var z = i % size;
  return [x, y, z];
}
