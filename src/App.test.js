import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import {m4} from './utils/matrix.js';


test('test transformation: translation', () => {
	var transformation = {
		translation: {x: 1, y: 2, z: 3}, 
		rotation: {x: 0, y: 0, z: 0}, 
		scale: {x: 1, y: 1, z: 1}
	};
	var matrix = m4.generateTranformationMatrix(transformation);
	var vertex = [1, 1, 1, 1];
	var vertexTransformed = m4.multiply1D(matrix, vertex);
	expect(vertexTransformed[0]).toBe(2);
	expect(vertexTransformed[1]).toBe(3);
	expect(vertexTransformed[2]).toBe(4);
	expect(vertexTransformed[3]).toBe(1);
});

test('test transformation: rotation x-axis', () => {
	var transformation = {
		translation: {x: 0, y: 0, z: 0}, 
		rotation: {x: Math.PI, y: 0, z: 0}, 
		scale: {x: 1, y: 1, z: 1}
	};
	var matrix = m4.generateTranformationMatrix(transformation);
	var vertex = [1, 1, 1, 1];
	var vertexTransformed = m4.multiply1D(matrix, vertex);
	expect(vertexTransformed[0]).toBeCloseTo(1, 4);
	expect(vertexTransformed[1]).toBeCloseTo(-1, 4);
	expect(vertexTransformed[2]).toBeCloseTo(-1, 4);
	expect(vertexTransformed[3]).toBe(1);
});

test('test transformation: rotation x-axis', () => {
	var transformation = {
		translation: {x: 0, y: 0, z: 0}, 
		rotation: {x: Math.PI, y: 0, z: 0}, 
		scale: {x: 1, y: 1, z: 1}
	};
	var matrix = m4.generateTranformationMatrix(transformation);
	var vertex = [1, 1, 1, 1];
	var vertexTransformed = m4.multiply1D(matrix, vertex);
	expect(vertexTransformed[0]).toBeCloseTo(1, 4);
	expect(vertexTransformed[1]).toBeCloseTo(-1, 4);
	expect(vertexTransformed[2]).toBeCloseTo(-1, 4);
	expect(vertexTransformed[3]).toBe(1);
});

test('test transformation: rotation y-axis', () => {
	var transformation = {
		translation: {x: 0, y: 0, z: 0}, 
		rotation: {x: 0, y: Math.PI, z: 0}, 
		scale: {x: 1, y: 1, z: 1}
	};
	var matrix = m4.generateTranformationMatrix(transformation);
	var vertex = [1, 1, 1, 1];
	var vertexTransformed = m4.multiply1D(matrix, vertex);
	expect(vertexTransformed[0]).toBeCloseTo(-1, 4);
	expect(vertexTransformed[1]).toBeCloseTo(1, 4);
	expect(vertexTransformed[2]).toBeCloseTo(-1, 4);
	expect(vertexTransformed[3]).toBe(1);
});

test('test transformation: rotation z-axis', () => {
	var transformation = {
		translation: {x: 0, y: 0, z: 0}, 
		rotation: {x: 0, y: 0, z: Math.PI}, 
		scale: {x: 1, y: 1, z: 1}
	};
	var matrix = m4.generateTranformationMatrix(transformation);
	var vertex = [1, 1, 1, 1];
	var vertexTransformed = m4.multiply1D(matrix, vertex);
	expect(vertexTransformed[0]).toBeCloseTo(-1, 4);
	expect(vertexTransformed[1]).toBeCloseTo(-1, 4);
	expect(vertexTransformed[2]).toBeCloseTo(1, 4);
	expect(vertexTransformed[3]).toBe(1);
});

test('test transformation: translation + rotation x-axis in order', () => {
	var transformation = {
		translation: {x: 1, y: 2, z: 3}, 
		rotation: {x: Math.PI, y: 0, z: 0}, 
		scale: {x: 1, y: 1, z: 1}
	};
	var matrix = m4.generateTranformationMatrix(transformation);
	var vertex = [1, 1, 1, 1];
	var vertexTransformed = m4.multiply1D(matrix, vertex);
	expect(vertexTransformed[0]).toBeCloseTo(2, 4);
	expect(vertexTransformed[1]).toBeCloseTo(-3, 4);
	expect(vertexTransformed[2]).toBeCloseTo(-4, 4);
	expect(vertexTransformed[3]).toBe(1);
});

test('test consecutives transformations', () => {
	var transformationA = {
		translation: {x: 1, y: 2, z: 3}, 
		rotation: {x: Math.PI, y: 0, z: 0}, 
		scale: {x: 1, y: 1, z: 1}
	};
	var transformationB = {
		translation: {x: 4, y: 5, z: 6}, 
		rotation: {x: 0, y: Math.PI, z: 0}, 
		scale: {x: 1, y: 1, z: 1}
	};
	var matrixA = m4.generateTranformationMatrix(transformationA);
	var matrixB = m4.generateTranformationMatrix(transformationB);
	var matrixAB = m4.multiply(matrixB, matrixA);
	var vertex = [1, 1, 1, 1];
	var vertexTransformed = m4.multiply1D(matrixAB, vertex);
	expect(vertexTransformed[0]).toBeCloseTo(-6, 4);
	expect(vertexTransformed[1]).toBeCloseTo(2, 4);
	expect(vertexTransformed[2]).toBeCloseTo(-2, 4);
	expect(vertexTransformed[3]).toBe(1);
});

test('test inverse transformation', () => {
	var transformation = {
		translation: {x: 1, y: 2, z: 3}, 
		rotation: {x: Math.PI, y: 0, z: Math.PI*0.5}, 
		scale: {x: 1, y: 1, z: 1}
	};
	var matrix = m4.generateTranformationMatrix(transformation);
	var matrixInverse = m4.inverse(matrix);
	var matrixTest = m4.multiply(matrix, matrixInverse);
	var vertex = [1, 1, 1, 1];
	var vertexTransformed = m4.multiply1D(matrixTest, vertex);

	expect(vertexTransformed[0]).toBeCloseTo(1, 4);
	expect(vertexTransformed[1]).toBeCloseTo(1, 4);
	expect(vertexTransformed[2]).toBeCloseTo(1, 4);
	expect(vertexTransformed[3]).toBe(1);
});