export class Terrain{

	//todo: this class is mixing the terran properties with the rendered voxels. Split tjis class
	constructor(){
		this.cells = [];
		this.voxelSize = 20;
		this.gridWidth = 100;
		this.gridHeight = 100;
		this.voxelColors = {
			1: {top: [45, 201, 10], side: [161, 68, 18]},//land voxel
			2: {top: [5, 20, 237], side: [5, 20, 237]},//water-river voxel
			3: {top: [5, 20, 237], side: [5, 20, 237]},//water-flood voxel
		};
		this.generate();	
	}

	generate(){
		//generate the terrain cells with their heights
		var vertexes = [];
		var colors = [];
		var normals = [];
		var heightHarmonics = new Map([
			[10, this.voxelSize*5],
			[40, this.voxelSize*10]
		]);
		var heightSeed= 1;
		var heights = generate2DPerlinNoise(heightSeed, this.gridWidth, this.gridHeight, heightHarmonics);
		for(var i = 0; i <this.gridWidth; i++){
			var cellsColumn = [];
			this.cells.push(cellsColumn);
			for(var j = 0; j < this.gridHeight; j++){
				cellsColumn.push({height: heights[i][j], type: 1});
			}		
		}
		//generate a river
		var riverSeed = 13;
		var pseudoRandomGenerator = new LinearCongruentialGenerator(riverSeed);
		this.generateRiver(Math.floor(pseudoRandomGenerator.generate()*this.gridWidth), Math.floor(pseudoRandomGenerator.generate()*this.gridHeight));

		//generate the geometry for the terrain.
		////TODO: generate the voxel in another class or method
		for(var i = 0; i <this.gridWidth; i++){
			for(var j = 0; j <this.gridHeight; j++){
				var height =this.cells[i][j].height;
				var color = this.voxelColors[this.cells[i][j].type];
				var voxel = this.generateVoxelGeometryAndColor(i, height, j, this.voxelSize, color);
			 	vertexes.push(...voxel.vertexes);
			 	colors.push(...voxel.colors);
			 	normals.push(...voxel.normals);
			}
		}
		this.vertexes = new Float32Array(vertexes);
		this.colors = new Uint8Array(colors);
		this.normals = new Float32Array(normals);
	}

	generateRiver(i, j){
		this.cells[i][j].type = 2;
		var maxHeight = this.cells[i][j].height;
		var direction = 0;
		var newI = i;
		var newJ = j;
		if(i <99 && maxHeight < this.cells[i+1][j].height){
			maxHeight = this.cells[i+1][j].height;
			newI = i+1;
		} 
		if(i > 0 && maxHeight < this.cells[i-1][j].height){
			maxHeight = this.cells[i-1][j].height;
			newI = i-1;
		}
		if(j < 99 && maxHeight < this.cells[i][j+1].height){
			maxHeight = this.cells[i][j+1].height;
			newI = i;
			newJ = j+1;
		} 
		if(j > 0 && maxHeight < this.cells[i][j-1].height){
			maxHeight = this.cells[i][j-1].height;
			newI = i;
			newJ = j-1;
		}
		if(newI != i || newJ != j){
			this.generateRiver(newI, newJ);
		} else {
			var floodMaxHeight = maxHeight - (this.voxelSize/5);
			this.flood(i, j, floodMaxHeight);
		}
	}

	flood(i, j, maxHeight){
		if(this.cells[i][j].type != 3){
			this.cells[i][j].type = 3;
			this.cells[i][j].height = maxHeight;
			if(i <99 && maxHeight < this.cells[i+1][j].height){
				this.flood(i+1, j, maxHeight);
			} 
			if(i > 0 && maxHeight < this.cells[i-1][j].height){
				this.flood(i-1, j, maxHeight);
			}
			if(j < 99 && maxHeight < this.cells[i][j+1].height){
				this.flood(i, j+1, maxHeight);
			} 
			if(j > 0 && maxHeight < this.cells[i][j-1].height){
				this.flood(i, j-1, maxHeight);
			}
		}
	}

	generateVoxelGeometryAndColor(x, y, z, voxelSize, voxelColors){
		var startX = x * voxelSize;
		var startZ = z * voxelSize;
		var startY = y;
		var endX = startX + voxelSize;
		var endZ = startZ + voxelSize;
		var endY = startY + voxelSize;
		var vertexes = [];
		var colors = [];
		var normals = [];
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
			...voxelColors.top,
			...voxelColors.top,
			...voxelColors.top,
			...voxelColors.top,
			...voxelColors.top,
			...voxelColors.top,
		);
		normals.push(
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0
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
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
		);
		normals.push(
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
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
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
		);
		normals.push(
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0
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
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
		);
		normals.push(
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1
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
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
			...voxelColors.side,
		);
		normals.push(
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0
		);
	    return {vertexes: vertexes, colors: colors, normals: normals};
	}
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


function generate2DPerlinNoise(seed, width, height, harmonics){
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
class LinearCongruentialGenerator{
	constructor(seed){
		this.modulus=2^48;
		this.multiplier=25214903917;
		this.increment=11;
		this.current=seed;
	}

	generate(){
		this.current = (this.multiplier*this.current + this.increment) % this.modulus;
		return this.current/this.modulus;
	}

}