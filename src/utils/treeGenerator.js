import {m4} from './matrix.js';
import {generateIcosahedron} from './icosphereGenerator.js';
import {LinearCongruentialGenerator} from './randomUtils.js';

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
		var numbrOfChildrenToGenerate = Math.floor(randomNumberGenerator.generate()*maxNumberOfChildren)+1;
		
		if(depth > 0){
			for(var i=0; i < numbrOfChildrenToGenerate; i++){
				var childXRotation = randomNumberGenerator.generateRange(-0.2, 0.2) + xRotation;
				var childYRotation = randomNumberGenerator.generate(-0.5, 0.5) + yRotation;
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
	
	generateNode(node, geometry, origin){
		console.log("origin:" + origin + ", length: " + node.size);

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
				this.generateNode(node.children[i], geometry, vertex3);
			}
		}
		//draw the leaf
		var leaf = generateIcosahedron(vertex3, node.width*1.5);
		geometry.vertexes.push(...leaf.vertexes);
		geometry.colors.push(...leaf.colors);
		geometry.normals.push(...leaf.normals);

		  //else {
			//draw a leaf
			// var leafBranchSizeRatio = 2;
			// var leafVertex1 = m4.multiply1D(matrix, [0, node.length, -node.width*leafBranchSizeRatio, 1]);
			// geometry.vertexes.push(leafVertex1[0], -leafVertex1[1], leafVertex1[2]);
			// geometry.colors.push(32, 250, 80);
			// var leafVertex2 =m4.multiply1D(matrix, [node.width*leafBranchSizeRatio, node.length, node.width*leafBranchSizeRatio, 1]);
			// geometry.vertexes.push(leafVertex2[0], -leafVertex2[1], leafVertex2[2]);
			// geometry.colors.push(32, 250, 80);
			// var leafVertex3 = m4.multiply1D(matrix, [-node.width*leafBranchSizeRatio, node.length, node.width*leafBranchSizeRatio, 1]);
			// geometry.vertexes.push(leafVertex3[0], -leafVertex3[1], leafVertex3[2]);
			// geometry.colors.push(32, 250, 80);
			
			// geometry.vertexes.push(leafVertex1[0], -leafVertex1[1], leafVertex1[2]);
			// geometry.colors.push(32, 250, 80);
			// geometry.vertexes.push(leafVertex3[0], -leafVertex3[1], leafVertex3[2]);
			// geometry.colors.push(32, 250, 80);
			// geometry.vertexes.push(leafVertex2[0], -leafVertex2[1], leafVertex2[2]);
			// geometry.colors.push(32, 250, 80);

			// var normal1 = m4.surfaceNormal(leafVertex1, leafVertex2, leafVertex3);
			// var normal2 = m4.surfaceNormal(leafVertex2, leafVertex1 , leafVertex3);
			// geometry.normals.push(...normal2, ...normal2, ...normal2);
			// geometry.normals.push(...normal1, ...normal1, ...normal1);
		//}
	}

	/**
	 * generate the tree's geometries from the tree's branches properties
	 * @param  {Terrain} terrain The terrain to generate the geometries for.
	 * @return {Object} The terrain's geometries
	 */
	generate(root){
		//generate the terrain cells with their heights
		var geometry =  {
			vertexes: [],
			colors: [],
			normals: []
		};
		this.generateNode(root, geometry, [0, 0, 0, 0]);

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
		var treeGenerator = new TreeGenerator();	    
		for (var cpt=0; cpt < numberOfTrees; cpt++){
			var treeSeed = this.randomNumberGenerator.generate() * this.randomNumberGenerator.modulus;//move the 2^48 as the random-generator property
			var treeRandomGenerator = new LinearCongruentialGenerator(treeSeed);
			var tree = treeGenerator.generateRandom(treeRandomGenerator, 35, 8, 0, 0, 2, 0.5, 1);//treeGenerator.generate();
			var treeId = 'tree' + cpt.toString();
			var treeGeometry = this.treeGeometryGenerator.generate(tree);
			var treeModel = this.modelFactory.createAnimatedModelColored(treeId, treeGeometry.vertexes, treeGeometry.colors, treeGeometry.normals);
	    	var xCoordinate = this.randomNumberGenerator.generate()*terrain.gridWidth*terrain.cellSize;
			var zCoordinate = this.randomNumberGenerator.generate()*terrain.gridHeight*terrain.cellSize;
			console.log("generate trees at x: "+xCoordinate +",z: "+zCoordinate);
			var cells = [
				terrain.getCell(xCoordinate, zCoordinate),
				terrain.getCell(xCoordinate + terrain.cellSize, zCoordinate),
				terrain.getCell(xCoordinate, zCoordinate + terrain.cellSize),
				terrain.getCell(xCoordinate + terrain.cellSize, zCoordinate + terrain.cellSize)
			];
			var yCoordinate = Math.min(...cells.filter(cell => cell != null).map(cell => cell.height));
			treeModel.position = {x: xCoordinate, y: yCoordinate, z: zCoordinate};
			result[treeId] = treeModel;
		}
		return result;
	}
}