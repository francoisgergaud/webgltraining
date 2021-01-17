import {m4} from './matrix.js';

// see http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html
/**
 * generate a Icosahedron, scale by 'scale-factor', at the position 'translation'
 * @param  {[number]} translation a 3D vector (tha is an array with 3 scalars)
 * @param  {[number]} xRadian scalar value: the rotation along X axis applied before translation
 * @param  {[number]} yRadian scalar value: the rotation along Y axis applied before translation
 * @param  {number} scaleFactor a scalar
 * @return {[number]} the vertices coordinates
 */
export function generateIcosahedron(translation, xRadian, yRadian, scaleFactor){
	var geometry =  {
		vertexes: [],
		colors: [],
		normals: []
	};
	var t = (1.0 + Math.sqrt(5.0)) / 2.0;
	var vertexes =[
		[-1,  t,  0],
		[ 1,  t,  0],
		[-1, -t,  0],
		[1, -t,  0],
		[0, -1,  t],
		[0,  1,  t],
		[0, -1, -t],
		[0,  1, -t],
		[t,  0, -1],
		[t,  0,  1],
		[-t,  0, -1],
		[-t,  0,  1],
	]

	var faces = [
		[vertexes[0], vertexes[11], vertexes[5]],//faces.Add(new TriangleIndices(0, 11, 5));
		[vertexes[0], vertexes[5], vertexes[1]],//faces.Add(new TriangleIndices(0, 5, 1));
		[vertexes[0], vertexes[1], vertexes[7]],//faces.Add(new TriangleIndices(0, 1, 7));
		[vertexes[0], vertexes[7], vertexes[10]],//faces.Add(new TriangleIndices(0, 7, 10));
		[vertexes[0], vertexes[10], vertexes[11]],//faces.Add(new TriangleIndices(0, 10, 11));
		[vertexes[1], vertexes[5], vertexes[9]],//faces.Add(new TriangleIndices(1, 5, 9));
		[vertexes[5], vertexes[11], vertexes[4]],//faces.Add(new TriangleIndices(5, 11, 4));
		[vertexes[11], vertexes[10], vertexes[2]],//faces.Add(new TriangleIndices(11, 10, 2));
		[vertexes[10], vertexes[7], vertexes[6]],//faces.Add(new TriangleIndices(10, 7, 6));
		[vertexes[7], vertexes[1], vertexes[8]],//faces.Add(new TriangleIndices(7, 1, 8));
		[vertexes[3], vertexes[9], vertexes[4]],//faces.Add(new TriangleIndices(3, 9, 4));
		[vertexes[3], vertexes[4], vertexes[2]],//faces.Add(new TriangleIndices(3, 4, 2));
		[vertexes[3], vertexes[2], vertexes[6]],//faces.Add(new TriangleIndices(3, 2, 6));
		[vertexes[3], vertexes[6], vertexes[8]],//faces.Add(new TriangleIndices(3, 6, 8));
		[vertexes[3], vertexes[8], vertexes[9]],//faces.Add(new TriangleIndices(3, 8, 9));
		[vertexes[4], vertexes[9], vertexes[5]],//faces.Add(new TriangleIndices(4, 9, 5));
		[vertexes[2], vertexes[4], vertexes[11]],//faces.Add(new TriangleIndices(2, 4, 11));
		[vertexes[6], vertexes[2], vertexes[10]],//faces.Add(new TriangleIndices(6, 2, 10));
		[vertexes[8], vertexes[6], vertexes[7]],//faces.Add(new TriangleIndices(8, 6, 7));
		[vertexes[9], vertexes[8], vertexes[1]]//faces.Add(new TriangleIndices(9, 8, 1));

	];
	var matrix = m4.xRotation(xRadian);
	matrix = m4.yRotate(matrix, yRadian);
	for (var i=0, l=faces.length; i<l; i++) {
		for(var j=0, m=faces[i].length; j<m; j++) {
			var vertex = m4.multiply1D(matrix, [faces[i][j][0], faces[i][j][1], faces[i][j][2], 1]);
			geometry.vertexes.push(
				(vertex[0]*scaleFactor)+translation[0],
				(vertex[1]*scaleFactor)+translation[1],
				(vertex[2]*scaleFactor)+translation[2]
			);
		}
	}
	for (var i=0, l=faces.length; i<l; i++) {
		var normal = m4.surfaceNormal(faces[i][1], faces[i][0], faces[i][2]);
		geometry.normals.push(...normal, ...normal, ...normal);
		geometry.colors.push(...[21, 153, 57], ...[21, 153, 57], ...[21, 153, 57]);
	}
	return geometry;
}