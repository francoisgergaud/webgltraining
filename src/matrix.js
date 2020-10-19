var m3 = {
  multiply: function(a, b) {
    return [
      b[0] * a[0] + b[1] * a[3] + b[2] * a[6],
      b[0] * a[1] + b[1] * a[4] + b[2] * a[7],
      b[0] * a[2] + b[1] * a[5] + b[2] * a[8],
      b[3] * a[0] + b[4] * a[3] + b[5] * a[6],
      b[3] * a[1] + b[4] * a[4] + b[5] * a[7],
      b[3] * a[2] + b[4] * a[5] + b[5] * a[8],
      b[6] * a[0] + b[7] * a[3] + b[8] * a[6],
      b[6] * a[1] + b[7] * a[4] + b[8] * a[7],
      b[6] * a[2] + b[7] * a[5] + b[8] * a[8],
    ];
  },

  translation: function(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },
 
  rotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c,-s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },
 
  scaling: function(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  projection: function(width, height) {
    // Note: This matrix flips the Y axis so that 0 is at the top.
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  },

  translate: function(m, tx, ty) {
    return m3.multiply(m, m3.translation(tx, ty));
  },
 
  rotate: function(m, angleInRadians) {
    return m3.multiply(m, m3.rotation(angleInRadians));
  },
 
  scale: function(m, sx, sy) {
    return m3.multiply(m, m3.scaling(sx, sy));
  },
}

export {m3};