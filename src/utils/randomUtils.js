export function interpolate(a0, a1, w) {
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


export function generate2DPerlinNoise(seed, width, height, harmonics){
	var lgGenerator = new LinearCongruentialGenerator(seed);
	var harmonicNoise = new Map();
	//calculare the grid-factors
	for (const [offset, amplitude] of harmonics) {
		var factors = [];
		for(var i = 0; i < width+offset; i+=offset){
			var factorColumn = [];
			factors.push(factorColumn);
			for(var j = 0; j < height+offset; j+=offset){
				var angleRad = lgGenerator.generate() * Math.PI *2;
				factorColumn.push({x: Math.cos(angleRad), y: Math.sin(angleRad)});
			}
		}
		harmonicNoise.set(offset, factors);
	}
	//interpolate all the cells
	var result = [];
	var firstLoop = true;
	for (var [offset, factors] of harmonicNoise) {
		for(var i = 0; i < width; i++){
			var resultColumn = null;
			if(firstLoop) {
				resultColumn = [];
				result.push(resultColumn);
			} else {
				resultColumn = result[i];
			}
			for(var j = 0; j < height; j++){
				var left = Math.floor(i/offset);
			    var right = left + 1;
			    var top = Math.floor(j/offset);
			    var bottom = top + 1;
			    // Determine interpolation weights
			    var sx = (i%offset)/offset;
			    var sy = (j%offset)/offset;
			    //dot products
			    var leftTopVector = factors[left][top];
			    var n0 = leftTopVector.x * sx + leftTopVector.y * sy;
			    var rightTopVector = factors[right][top];
				var n1 = rightTopVector.x * (sx-1) + rightTopVector.y * sy;
			    var ix0 = interpolate(n0, n1, sx);
			    var leftBottomVector = factors[left][bottom];
			    n0 = leftBottomVector.x * sx + leftBottomVector.y * (sy-1);
			    var rightBottomVector = factors[right][bottom];
			    n1 = rightBottomVector.x * (sx-1) + rightBottomVector.y * (sy-1);
			    var ix1 = interpolate(n0, n1, sx);

			    var value = interpolate(ix0, ix1, sy) * harmonics.get(offset);
			    if(firstLoop){
			    	resultColumn.push(value);
			   	} else {
			   		resultColumn[j] += value;
			   	} 
			}
		}
		firstLoop = false;
	}
	return result;

}

//pseudo-random generator using seed
export class LinearCongruentialGenerator{
	constructor(seed){
		this.modulus=Math.pow(2, 48);
		this.multiplier=25214903917;
		this.increment=11;
		this.current=seed;
	}

	generate(){
		this.current = (this.multiplier*this.current + this.increment) % this.modulus;
		return this.current/this.modulus;
	}
}