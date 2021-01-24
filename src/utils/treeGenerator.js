import {m4} from './matrix.js';
import {generateIcosahedron} from './icosphereGenerator.js';
import {LinearCongruentialGenerator, generate2DPerlinNoise} from './randomUtils.js';

/**
 * A simple tree generator
 */
export class TreeGenerator{

	generateStatic(){
		var root = {
			length: 40,
			width:10,
			value: [0, 0, 0],
			children: [
				{
					length:30,
					width: 7,
					value: [0.12, 0.25, 0.12],
				},
				{
					length: 20,
					width: 5,
					value: [0, 0, -0.25],
					children: [
						{
							length:10,
							width: 5,
							value: [0, 0, 0.50],
						},
					]
				},
			]
		}
		return root;
	}

	generateRandom(randomNumberGenerator, length, width, xRotation, yRotation, maxNumberOfChildren, reductionFactor, depth){
		
		var children = [];
		var numberOfChildrenToGenerate = Math.floor(randomNumberGenerator.generate()*maxNumberOfChildren)+1;
		
		if(depth > 0){
			for(var i=0; i < numberOfChildrenToGenerate; i++){
				var childXRotation = randomNumberGenerator.generateRange(-0.2, 0.2) + xRotation;
				var childYRotation = randomNumberGenerator.generate(-0.5, 0.5) + yRotation;
				var branchLength = length*reductionFactor - randomNumberGenerator.generate(0, length*reductionFactor) +1;
				children.push(this.generateRandom(randomNumberGenerator, length*reductionFactor, width*reductionFactor, childXRotation, childYRotation, maxNumberOfChildren, reductionFactor, depth-1));
			}
		}	
		return {
			length: length,
			width: width,
			value: [xRotation, yRotation, 0],
			children: children,
		}
	}
}

export class TreeGeometryGenerator {
	
	generateNode(node, geometry, origin, randomGenerator){
		//console.log("origin:" + origin + ", length: " + node.size);

		var matrix = m4.translation(origin[0], origin[1], origin[2]);
		matrix = m4.xRotate(matrix, node.value[0]*Math.PI*2);
		matrix = m4.yRotate(matrix, node.value[1]*Math.PI*2);
		matrix = m4.zRotate(matrix, node.value[2]*Math.PI*2);

		var vertex1 = m4.multiply1D(matrix, [-node.width/2, 0, 0, 1]);
		geometry.vertexes.push(vertex1[0], vertex1[1], vertex1[2]);
		geometry.colors.push(112, 65, 2);
		//console.log("vertex1: [" + vertex1[0] + ", " + vertex1[1] + ", " + vertex1[2] + "]");
		var vertex2 =m4.multiply1D(matrix, [node.width/2, 0, 0, 1]);
		geometry.vertexes.push(vertex2[0], vertex2[1], vertex2[2]);
		geometry.colors.push(112, 65, 2);
		//console.log("vertex2: [" + vertex2[0] + ", " + vertex2[1] + ", " + vertex2[2] + "]");
		var vertex3 = m4.multiply1D(matrix, [0, node.length, 0, 1]);
		geometry.vertexes.push(vertex3[0], vertex3[1], vertex3[2]);
		geometry.colors.push(112, 65, 2);
		//console.log("vertex3: [" + vertex3[0] + ", " + vertex3[1] + ", " + vertex3[2] + "]");		
		var normal1 = m4.surfaceNormal(vertex1, vertex2, vertex3);
		geometry.normals.push(...normal1, ...normal1, ...normal1);
		var vertex4 = m4.multiply1D(matrix, [node.width/2, 0, 0, 1]);
		geometry.vertexes.push(vertex4[0], vertex4[1], vertex4[2]);
		geometry.colors.push(112, 65, 2);
		var vertex5 = m4.multiply1D(matrix, [0, 0, node.width, 1]);
		geometry.vertexes.push(vertex5[0], vertex5[1], vertex5[2]);
		geometry.colors.push(112, 65, 2);
		var vertex6 = m4.multiply1D(matrix, [0, node.length, 0, 1]);
		geometry.vertexes.push(vertex6[0], vertex6[1], vertex6[2]);
		geometry.colors.push(112, 65, 2);
		var normal2 = m4.surfaceNormal(vertex4, vertex5, vertex6);
		geometry.normals.push(...normal2, ...normal2, ...normal2);

		var vertex7 = m4.multiply1D(matrix, [0, 0, node.width, 1]);
		geometry.vertexes.push(vertex7[0], vertex7[1], vertex7[2]);
		geometry.colors.push(112, 65, 2);
		var vertex8 =m4.multiply1D(matrix, [-node.width/2, 0, 0, 1]);
		geometry.vertexes.push(vertex8[0], vertex8[1], vertex8[2]);
		geometry.colors.push(112, 65, 2);
		var vertex9 = m4.multiply1D(matrix, [0, node.length, 0, 1]);
		geometry.vertexes.push(vertex9[0], vertex9[1], vertex9[2]);
		geometry.colors.push(112, 65, 2);
		var normal3 = m4.surfaceNormal(vertex7, vertex8, vertex9);
		geometry.normals.push(...normal3, ...normal3, ...normal3);


		if(node.children != null){
			for(var i=0; i<node.children.length; i++){
				this.generateNode(node.children[i], geometry, vertex3, randomGenerator);
			}
		}
		//draw the leaf
		var xRadian = randomGenerator.generateRange(0,1) * Math.PI*2;
		var yRadian = randomGenerator.generateRange(0,1) * Math.PI*2;
		var leaf = generateIcosahedron(vertex3, xRadian, yRadian, node.width*randomGenerator.generateRange(1,2));
		geometry.vertexes.push(...leaf.vertexes);
		geometry.colors.push(...leaf.colors);
		geometry.normals.push(...leaf.normals);
	}

	/**
	 * generate the tree's geometries from the tree's branches properties
	 * @param  {root} The tree root node (i.e.: the main trunc).
	 * @return {Object} The terrain's geometries
	 */
	generate(root, randomGenerator){
		//generate the terrain cells with their heights
		var geometry =  {
			vertexes: [],
			colors: [],
			normals: []
		};
		this.generateNode(root, geometry, [0, 0, 0, 0], randomGenerator);

		
		return {
			vertexes : new Float32Array(geometry.vertexes),
			colors : new Uint8Array(geometry.colors),
			normals : new Float32Array(geometry.normals),
		}
	}
}

export class ForestGenerator {

	constructor(seed, modelFactory){
		this.randomNumberGenerator = new LinearCongruentialGenerator(seed);
		this.treeGeometryGenerator = new TreeGeometryGenerator();
		this.modelFactory = modelFactory;
	}
	
	generate(terrain, numberOfTrees){
		var result = {};
		var seed = this.randomNumberGenerator.generate();
		var harmonics = new Map([
			[terrain.cellSize, 1]
		]);
		var perlinNoise = generate2DPerlinNoise(seed, terrain.gridWidth, terrain.gridHeight, harmonics);
		var treeGenerator = new TreeGenerator();
		var cpt = 0;
		var amplitude = perlinNoise.max - perlinNoise.min;
		var randomFactor = 0.2;
		for(var i= 0; i < terrain.gridWidth; i++){
			for(var j= 0; j < terrain.gridHeight; j++){
				var noiseValue = perlinNoise.value[i][j];
				var probability = (perlinNoise.max - noiseValue)/amplitude;
				if(probability < this.randomNumberGenerator.generate() * randomFactor){
					var xCoordinate = i*terrain.cellSize;
					var zCoordinate = j*terrain.cellSize;
					//console.log("generate trees at x: "+xCoordinate +",z: "+zCoordinate);
					var cells = [
						terrain.getCell(xCoordinate, zCoordinate),
						terrain.getCell(xCoordinate + terrain.cellSize, zCoordinate),
						terrain.getCell(xCoordinate, zCoordinate + terrain.cellSize),
						terrain.getCell(xCoordinate + terrain.cellSize, zCoordinate + terrain.cellSize)
					];
					//do not generate a tree if the cell is on water
					var cellsWithWater = cells.filter(cell => cell != null).filter(cell => cell.type == 2 || cell.type == 3);
					if(cellsWithWater.length == 0){
						var treeSeed = this.randomNumberGenerator.generate() * this.randomNumberGenerator.modulus;
						var treeRandomGenerator = new LinearCongruentialGenerator(treeSeed);
						var mainTruncLength = treeRandomGenerator.generateRange(40, 80); 
						var tree = treeGenerator.generateRandom(treeRandomGenerator, mainTruncLength, 8, 0, 0, 2, 0.5, 1);
						var treeId = 'tree' + cpt.toString();
						var treeGeometry = this.treeGeometryGenerator.generate(tree, treeRandomGenerator);
						var treeModel = this.modelFactory.createAnimatedModelColored(treeId, treeGeometry.vertexes, treeGeometry.colors, treeGeometry.normals);
						var yCoordinate = Math.min(...cells.filter(cell => cell != null).map(cell => cell.height));
						treeModel.position = {x: xCoordinate, y: yCoordinate, z: zCoordinate};
						result[treeId] = treeModel;
						cpt++;
						//probabilityCumulated = 0;
					}
				}

			}	
		}
		console.log("number of trees created: "+cpt);
		return result;
	}
}