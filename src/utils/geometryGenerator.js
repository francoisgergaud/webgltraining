export class terrainGenerator{

	constructor(){
		this.voxelSize = 20;
		this.generateVoxels();
	}

	generateVoxels(){
		var vertexes = [];
		var colors = [];
		this.heights = [];
		for(var i = 0; i <100; i++){
			var tempHeights = [];
			this.heights.push(tempHeights);
			for(var j = 0; j <100; j++){
				//var y = Math.floor(Math.random() * this.voxelSize);
				var y = (generatePerlinNoise(i/10, j/10)+1)/2;
				tempHeights.push(y);
				var voxel = this.generateVoxelGeometryAndColor(i, y*this.voxelSize*10, j, this.voxelSize);
			 	vertexes.push(...voxel.vertexes);
			 	colors.push(...voxel.colors);
			}		
		}
		this.vertexes = new Float32Array(vertexes);
		this.colors = new Uint8Array(colors);
	}


	generateVoxelGeometryAndColor(x, y, z, voxelSize){
		var startX = x * voxelSize;
		var startZ = z * voxelSize;
		var startY = y;
		var endX = startX + voxelSize;
		var endZ = startZ + voxelSize;
		var endY = startY + voxelSize;
		var vertexes = [];
		var colors = [];
		//top quad
		vertexes.push(
			startX, startY, endZ,
			startX, startY, startZ,
			endX, startY, startZ
		);
		vertexes.push(
			startX, startY, endZ,
			endX, startY, startZ,
			endX, startY, endZ
		);
		colors.push(
			45, 201, 10,
	        45, 201, 10,
	        45, 201, 10,
	        45, 201, 10,
	        45, 201, 10,
	        45, 201, 10
	    );
		//front quad
		vertexes.push(
			startX, startY, startZ,
			startX, endY, startZ,
			endX, endY, startZ
		);
		vertexes.push(
			startX, startY, startZ,
			endX, endY, startZ,
			endX, startY, startZ
		);
		colors.push(
			161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18
	    );
		//right quad
		vertexes.push(
			endX, startY, startZ,
			endX, endY, startZ,
			endX, endY, endZ
		);
		vertexes.push(
			endX, startY, startZ,
			endX, endY, endZ,
			endX, startY, endZ
		);
		colors.push(
			161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18
	    );
		//behind quad
		vertexes.push(
			endX, startY, endZ,
			endX, endY, endZ,
			startX, endY, endZ
		);
		vertexes.push(
			endX, startY, endZ,
			startX, endY, endZ,
			startX, startY, endZ
		);
		colors.push(
			161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18
	    );
		//left quad
		vertexes.push(
			startX, startY, endZ,
			startX, endY, endZ,
			startX, endY, startZ
		);
		vertexes.push(
			startX, startY, endZ,
			startX, endY, startZ,
			startX, startY, startZ
		);
		colors.push(
			161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18,
	        161, 68, 18
	    );
	    return {vertexes: vertexes, colors: colors};
	}
}

//from https://en.wikipedia.org/wiki/Perlin_noise
function generatePerlinNoise(x, y){
	// Determine grid cell coordinates
    var x0 = Math.floor(x);
    var x1 = x0 + 1;
    var y0 = Math.floor(y);
    var y1 = y0 + 1;

    // Determine interpolation weights
    // Could also use higher order polynomial/s-curve here
    var sx = x - x0;
    var sy = y - y0;

    var n0 = dotGridGradient(x0, y0, x, y);
    var n1 = dotGridGradient(x1, y0, x, y);
    var ix0 = interpolate(n0, n1, sx);

    n0 = dotGridGradient(x0, y1, x, y);
    n1 = dotGridGradient(x1, y1, x, y);
    var ix1 = interpolate(n0, n1, sx);

    var value = interpolate(ix0, ix1, sy);
    return value;
}

function interpolate(a0, a1, w) {
    /* // You may want clamping by inserting:
     * if (0.0 > w) return a0;
     * if (1.0 < w) return a1;
     */
    //return (a1 - a0) * w + a0;
    // Use this cubic interpolation [[Smoothstep]] instead, for a smooth appearance:
    //return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
    /*
     * // Use [[Smootherstep]] for an even smoother result with a second derivative equal to zero on boundaries:*/
    //return (a1 - a0) * (w * (w * 6.0 - 15.0) * w * w *w + 10.0) + a0;
    return ((a1 - a0) * ((6*w - 15)*w + 10)*w*w*w) + a0;
}

// Computes the dot product of the distance and gradient vectors.
function dotGridGradient(ix, iy, x, y) {
    // Get gradient from integer coordinates
    var gradient = randomGradient(ix, iy);
    // Compute the distance vector
    var dx = x - ix;
    var dy = y - iy;
    // Compute the dot-product
  return (dx*gradient.x + dy*gradient.y);
}

function randomGradient(ix, iy) {
    // Random float. No precomputed gradients mean this works for any number of grid coordinates
    var random = 2920 * Math.sin(ix * 21942 + iy * 171324 + 8912) * Math.cos(ix * 23157 * iy * 217832 + 9758);
    return {x: Math.cos(random), y: Math.sin(random) };
}

