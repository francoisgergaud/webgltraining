export class terrainGenerator{

	constructor(){
		this.voxelSize = 20;
		this.generateVoxels();
	}

	generateVoxels(){
		var vertexes = [];
		var colors = [];
		for(var i = 0; i <100; i++){
			for(var j = 0; j <100; j++){
				var y = Math.floor(Math.random() * this.voxelSize);
				var voxel = this.generateVoxelGeometryAndColor(i, y, j, this.voxelSize);
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