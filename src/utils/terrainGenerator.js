import {interpolate, generate2DPerlinNoise, LinearCongruentialGenerator} from './randomUtils.js';
import {m4} from './matrix.js';

/**
 * The terrain contains the logic data for the terrain. A terrain can be seen as 2D array of cells.
 * Cells have the following definition: {type: <number>, height: <number>}
 */
export class Terrain{
	constructor(cellSize, cells, gridWidth, gridHeight){
		this.cells = cells;
		this.cellSize = cellSize;
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
	}

/**
 * Return the cell depending on the absolute coordinate
 * @param  {float} i the X coordinate
 * @param  {float} j the Y coordinate
 * @return {Cell} the cell if found. null otherwise.
 */
	getCell(i,j){
		var cellX = Math.floor(i/this.cellSize)
		var cellY = Math.floor(j/this.cellSize)
		if(cellX >= 0 && cellX < this.gridWidth && cellY >= 0 && cellY < this.gridHeight){
			return this.cells[cellX][cellY];
		} else {
			return null;
		}
	}
}

/**
 * Terrain generator: based on 2D Perlin noise 
 */
export class TerrainFactory {

	/**
	 * generate a terrain.
	 * @param  {int} cellSize the cell size.
	 * @param  {int} width The grid's width.
	 * @param  {int} height The grid's height.
	 * @return {Terrain} The terrain generated.
	 */
	generate(cellSize, width, height){
		//generate the terrain cells with their heights
		var heightHarmonics = new Map([
			[10, cellSize*5],
			[40, cellSize*10]
		]);
		var heightSeed= 1;
		var heights = generate2DPerlinNoise(heightSeed, width, height, heightHarmonics);
		var cells = [];
		for(var i = 0; i < width; i++){
			var cellsColumn = [];
			cells.push(cellsColumn);
			for(var j = 0; j < height; j++){
				cellsColumn.push({height: heights[i][j], type: 1});
			}		
		}
		//generate a river
		var riverSeed = 1;
		var floodLevel = cellSize;
		var pseudoRandomGenerator = new LinearCongruentialGenerator(riverSeed, floodLevel);
		this.generateWater(cells, Math.floor(pseudoRandomGenerator.generate()*width), Math.floor(pseudoRandomGenerator.generate()*height), floodLevel);
		this.generateWater(cells, Math.floor(pseudoRandomGenerator.generate()*width), Math.floor(pseudoRandomGenerator.generate()*height), floodLevel);
		this.generateWater(cells, Math.floor(pseudoRandomGenerator.generate()*width), Math.floor(pseudoRandomGenerator.generate()*height), floodLevel);
		return new Terrain(cellSize,cells, width, height);
	}

	/**
	 * private method to generate the water (put in another method to improve readability)
	 * @param  {Cell[][]} cells a 2D array of cells where to create the water.
	 * @param  {int} i current X coordinate of the cell.
	 * @param  {int} j current Y coordinate of the cell.
	 * @param  {float} floodLevel height from the lowest river-cell until which the water flooding happens.
	 * @return {None}
	 */
	generateWater(cells, i, j, floodLevel){
		cells[i][j].type = 2;
		var minHeight = cells[i][j].height;
		var direction = 0;
		var newI = i;
		var newJ = j;
		if(i <99 && minHeight > cells[i+1][j].height){
			minHeight = cells[i+1][j].height;
			newI = i+1;
		} 
		if(i > 0 && minHeight > cells[i-1][j].height){
			minHeight = cells[i-1][j].height;
			newI = i-1;
		}
		if(j < 99 && minHeight > cells[i][j+1].height){
			minHeight = cells[i][j+1].height;
			newI = i;
			newJ = j+1;
		} 
		if(j > 0 && minHeight > cells[i][j-1].height){
			minHeight = cells[i][j-1].height;
			newI = i;
			newJ = j-1;
		}
		if(newI != i || newJ != j){
			this.generateWater(cells, newI, newJ, floodLevel);
		} else {
			var floodHeight = minHeight + floodLevel;
			this.flood(cells, i, j, floodHeight);
		}
	}

	flood(cells, i, j, height){
		if(cells[i][j].type != 3){
			cells[i][j].type = 3;
			cells[i][j].height = height;
			cells[i+1][j].height = height;
			cells[i][j+1].height = height;
			cells[i+1][j+1].height = height;
			if(i <99 && height > cells[i+1][j].height){
				this.flood(cells, i+1, j, height);
			} 
			if(i > 0 && height > cells[i-1][j].height){
				this.flood(cells, i-1, j, height);
			}
			if(j < 99 && height > cells[i][j+1].height){
				this.flood(cells, i, j+1, height);
			} 
			if(j > 0 && height > cells[i][j-1].height){
				this.flood(cells, i, j-1, height);
			}
		}
	}
}

/**
 * Generate the geometries (to be rendered) for a terrain.
 */
export class TerrainGeometryGenerator {
	
	constructor(){
		this.voxelColors = {
			1: {top: [45, 201, 10], side: [161, 68, 18]},//land voxel
			2: {top: [5, 20, 237], side: [5, 20, 237]},//water-river voxel
			3: {top: [5, 20, 237], side: [5, 20, 237]},//water-flood voxel
		};
	}

	/**
	 * generate the terrain's voxel geometries from the terrain cells's properties
	 * @param  {Terrain} terrain The terrain to generate the geometries for.
	 * @return {Object} The terrain's geometries
	 */
	generate(terrain){
		var vertexes = [];
		var colors = [];
		var normals = [];
		//generate the geometry for the terrain.
		for(var i = 0; i < terrain.cells.length-1; i++){
			for(var j = 0; j < terrain.cells[i].length-1; j++){
				// var height =terrain.cells[i][j].height;
				// var color = this.voxelColors[terrain.cells[i][j].type];
				// var voxel = this._generateVoxelGeometryAndColor(i, height, j, terrain.cellSize, color);
			 // 	vertexes.push(...voxel.vertexes);
			 // 	colors.push(...voxel.colors);
			 // 	normals.push(...voxel.normals);
			 var color = this.voxelColors[terrain.cells[i][j].type].top;
			 var heightTopLeft =  terrain.cells[i][j].height;
			 var heightTopRight = terrain.cells[i+1][j].height;
			 var heightBottomLeft = terrain.cells[i][j+1].height;
			 var heightBottomRight = terrain.cells[i+1][j+1].height;
			 var triangles = this._generateTriangleGeometryAndColor(i, j, terrain.cellSize, heightTopLeft, heightTopRight, heightBottomLeft, heightBottomRight, color);
			 vertexes.push(...triangles.vertexes);
			 colors.push(...triangles.colors);
			 normals.push(...triangles.normals);
			}
		}
		return {
			vertexes : new Float32Array(vertexes),
			colors : new Uint8Array(colors),
			normals : new Float32Array(normals),
		}
	}

	_generateTriangleGeometryAndColor(x, z, cellSize, heightTopLeft, heightTopRight, heightBottomLeft, heightBottomRight, color){
		var vertexes = [];
		var colors = [];
		var normals = [];
		var startX = x * cellSize;
		var startZ = z * cellSize;
		var endX = startX + cellSize;
		var endZ = startZ + cellSize;
		var vertex1 = [endX, heightBottomRight, endZ];
		var vertex2 = [startX, heightBottomLeft, endZ];
		var vertex3 = [startX, heightTopLeft, startZ];
		var vertex4 = [endX, heightTopRight, startZ];
		vertexes.push(...vertex1, ...vertex2, ...vertex3);
		var normal1 = m4.surfaceNormal(vertex1, vertex2, vertex3);
		normals.push(...normal1, ...normal1, ...normal1);
		vertexes.push(...vertex3, ...vertex4, ...vertex1);
		var normal2 = m4.surfaceNormal(vertex3, vertex4, vertex1);
		normals.push(...normal2, ...normal2, ...normal2);
		colors.push(...color, ...color, ...color, ...color, ...color, ...color);
		return {vertexes: vertexes, colors: colors, normals: normals};
	}

	_generateVoxelGeometryAndColor(x, y, z, voxelSize, voxelColors){
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





