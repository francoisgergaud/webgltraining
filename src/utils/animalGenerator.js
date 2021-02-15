
import {AnimatedModel} from '../model.js';
import {createBoxVertexes} from './basicGeometriesGenerator.js';
import {m4} from './matrix.js';


//animated model whith bones hierarchy: the vertexes from a same model can be animated independently using
// a bone hierarchy. The general skinning technic has been simplified:
// - only one bone influence a vertex, hence no need of wieght
// - the model is composed only of 3D box geometries
export class SkinnedModel extends AnimatedModel {

    // pass the vertexes and bones as parameters
	constructor(id, programInfo){
        super(id, programInfo, [], null);
        this.rootModel = {
			boneIdx: 0,
            size: {x: 40, y: 40, z: 40},
            color: [241, 245, 24],
            initialPose: {
                translation: {x: 0, y: 0, z: 0}, 
                rotation: {x: 0, y: 0, z: 0}, 
                scale: {x: 1, y: 1, z: 1}
            },
			children: [
				{
					boneIdx: 1,
                    size: {x: 15, y: 15, z: 10},
					color: [245, 24, 223],
                    initialPose: {
                        translation: {x: -35, y: -35, z: -20}, 
                        rotation: {x: 0, y: 0, z: 0}, 
                        scale: {x: 1, y: 1, z: 1}
                    },
				},
				{
					boneIdx: 2,
                    size: {x: 15, y: 15, z: 10},
					color: [3, 252, 232],
                    initialPose: {
                        translation: {x: -35, y: -35, z: +20}, 
                        rotation: {x: 0, y: 0, z: 0}, 
                        scale: {x: 1, y: 1, z: 1}
                    },
				},
				{
					boneIdx: 3,
                    size: {x: 40, y: 20, z: 20},
					color: [17, 247, 244],
                    initialPose: {
                        translation: {x: +40, y: 25, z: +0}, 
                        rotation: {x: 0, y: 0, z: 0}, 
                        scale: {x: 1, y: 1, z: 1}
                    },
				}
			]
		};
        //TODO:relate the indexes dynamically between model and bones
        var zeroBindPose = {translation: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}};
        var leftLegBindPose = {translation: {x: -20, y: -20, z: -20}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}};
        var rightLegBindPose = {translation: {x: -20, y: -20, z: +20}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}};
        var headBindPose = {translation: {x: +30, y: 25, z: +0}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}};
        this.bones = {
            id: 'body',
            idx: 0,
            bindPose: zeroBindPose,
            animationParameters: {
                runningCycle:0,
                speed: 2,
                xAmplitude: 30,
                yAmplitude: 10,
                scale: false,
            },
            'children': [
                {
                    id: 'leftLeg',
                    idx: 1,
                    bindPose: leftLegBindPose,
                    animationParameters: {
                        runningCycle:0,
                        speed: 1.5,
                        xAmplitude: 5,
                        yAmplitude: 25,
                        scale: false,
                    },
                },
                {
                    id: 'rightLeg',
                    idx: 2,
                    bindPose: rightLegBindPose,
                    animationParameters: {
                        runningCycle:0,
                        speed: 1.5,
                        xAmplitude: 5,
                        yAmplitude: 25,
                        scale: false,
                    }
                },
                {
                    id: 'head',
                    idx: 3,
                    bindPose: headBindPose,
                    animationParameters: {
                        runningCycle:0,
                        speed: 2,
                        xAmplitude: 3,
                        yAmplitude: 1,
                        scale: false,
                    }
                }
            ]
        };

        var geometry = this.generateGeometry(this.rootModel, zeroBindPose);
        this.bones = this.initializeBones(this.bones, null);
        
        //TODO reuse parent constructor
        var gl = this.programInfo.gl;
        // create the position buffer.
        var positionBuffer = gl.createBuffer();
        // Put geometry data into buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertexes), gl.STATIC_DRAW);
        this.numberOfVertexes = geometry.vertexes.length/3; // 3 components per position
        this.attributes = {
            a_position : {
                buffer: positionBuffer, 
                size: 3, 
                type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0,
            }
        };
        
        this.transparency = 1.0;
        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(geometry.colors), gl.STATIC_DRAW);
        this.attributes['a_color'] = {
          buffer: colorBuffer, 
          size: 3, 
          type: gl.UNSIGNED_BYTE,
          normalize: true,
          stride: 0,
          offset: 0,
        };
        
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);
        this.attributes['a_normal'] = {
          buffer: normalBuffer, 
          size: 3, 
          type: gl.FLOAT,
          normalize: false,
          stride: 0,
          offset: 0,
        };

        var boneNdxBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boneNdxBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.boneIdx), gl.STATIC_DRAW);
        this.attributes['a_boneNdx'] = {
            buffer: boneNdxBuffer, 
            size: 1, 
            type: gl.FLOAT,
            normalize: false,
            stride: 0,
            offset: 0,
        }
    }

    generateGeometry(geometryNode, parentInitialPose){
        //cal build box directly here
        var geometryVertexes = createBoxVertexes(geometryNode.size, geometryNode.initialPose.translation);
        var normals = [];
        var colors = [];
        var boneIdx = [];
        var vertexes = [];
        var currentInitialPose = {
            translation: {
                x: parentInitialPose.translation.x + geometryNode.initialPose.translation.x,
                y: parentInitialPose.translation.y + geometryNode.initialPose.translation.y,
                z: parentInitialPose.translation.z + geometryNode.initialPose.translation.z,
            },
            rotation: {
                x: parentInitialPose.rotation.x + geometryNode.initialPose.rotation.x,
                y: parentInitialPose.rotation.y + geometryNode.initialPose.rotation.y,
                z: parentInitialPose.rotation.z + geometryNode.initialPose.rotation.z,
            },
            scale: {
                x: parentInitialPose.scale.x * geometryNode.initialPose.scale.x,
                y: parentInitialPose.scale.y * geometryNode.initialPose.scale.y,
                z: parentInitialPose.scale.z * geometryNode.initialPose.scale.z,
            },
        };
        var transformationMatrix = m4.translation(currentInitialPose.translation.x, currentInitialPose.translation.y, currentInitialPose.translation.z);
        transformationMatrix = m4.xRotate(transformationMatrix, currentInitialPose.rotation.x);
        transformationMatrix = m4.yRotate(transformationMatrix, currentInitialPose.rotation.y);
        transformationMatrix = m4.zRotate(transformationMatrix, currentInitialPose.rotation.z);
        transformationMatrix = m4.scale(transformationMatrix, currentInitialPose.scale.x, currentInitialPose.scale.y, currentInitialPose.scale.z);
        for(var i=0, l = geometryVertexes.length; i < l; i+=9) {
            var vertex1 = m4.multiply1D(transformationMatrix, [geometryVertexes[i], geometryVertexes[i+1], geometryVertexes[i+2], 0]);
            var vertex2 = m4.multiply1D(transformationMatrix, [geometryVertexes[i+3], geometryVertexes[i+4], geometryVertexes[i+5], 0]);
            var vertex3 = m4.multiply1D(transformationMatrix, [geometryVertexes[i+6], geometryVertexes[i+7], geometryVertexes[i+8], 0]);
            vertexes.push(vertex1[0],vertex1[1],vertex1[2],vertex2[0],vertex2[1],vertex2[2], vertex3[0], vertex3[1], vertex3[2]);
            //push 3 times the color, once per vertice
            colors.push(...geometryNode.color, ...geometryNode.color, ...geometryNode.color);
            //calculate the normal for each face/triangle
            var normal = m4.surfaceNormal(vertex1, vertex2, vertex3);
            //push 3 times the normal, once per vertice
            normals.push(...normal, ...normal, ...normal);
            //push 3 times the bone index, once per vertice
            boneIdx.push(geometryNode.boneIdx, geometryNode.boneIdx, geometryNode.boneIdx);
        }
        if(geometryNode.children != null) {
            for(var i=0, l=geometryNode.children.length; i<l; i++ ){
                var childResult = this.generateGeometry(geometryNode.children[i], currentInitialPose);
                vertexes.push(...childResult['vertexes']);
                normals.push(...childResult['normals']);
                colors.push(...childResult['colors']);
                boneIdx.push(...childResult['boneIdx']);
            }
            
        }
        return {'vertexes': vertexes, 'normals': normals, 'colors': colors, 'boneIdx': boneIdx}
    }

    initializeBones(boneNode, parent){
        var boneBindPose = boneNode.bindPose;
        var boneTranformationMatrix = m4.translation(boneBindPose.translation.x, boneBindPose.translation.y, boneBindPose.translation.z);
        boneTranformationMatrix = m4.xRotate(boneTranformationMatrix, boneBindPose.rotation.x);
        boneTranformationMatrix = m4.yRotate(boneTranformationMatrix, boneBindPose.rotation.y);
        boneTranformationMatrix = m4.zRotate(boneTranformationMatrix, boneBindPose.rotation.z);
        boneTranformationMatrix = m4.scale(boneTranformationMatrix, boneBindPose.scale.x, boneBindPose.scale.y, boneBindPose.scale.z);
        boneNode.bonePoseInverse = m4.inverse(boneTranformationMatrix);
        if(parent!=null){
            boneNode.bonePoseInverse = m4.multiply(boneNode.bonePoseInverse, parent.bonePoseInverse);
        }
        if(boneNode.children != null){
            for(var i=0, l= boneNode.children.length; i < l; i++) {
                this.initializeBones(boneNode.children[i], boneNode);
            }
        }
        return boneNode;
    }

    // update the bones matrices uniforms and set them
    update(deltaTimeSecond){
        this.boneRecursiveUpdate(deltaTimeSecond, null, this.bones);
        this.position.x+=deltaTimeSecond*10;
    }

    /**
     * update the bones hierarchy: this is where the animation parameters are used
     * @param  {integer} deltaTimeSecond The difference between the time this frame and the previous are generated, in seconds.
     * @param  {Bone} parent the parent bone, which movement influate the current bone
     * @param  {Bone} bone the current bone to be animated
     * @return {None}
     */
    boneRecursiveUpdate(deltaTimeSecond, parent, bone){
        bone.animationParameters.runningCycle += deltaTimeSecond*bone.animationParameters.speed;
        var xPosition = Math.cos(bone.animationParameters.runningCycle) * bone.animationParameters.xAmplitude;
        var yPosition = Math.sin(bone.animationParameters.runningCycle) * bone.animationParameters.yAmplitude;
        var xRotate = 0;
        var yRotate = 0;
        var zRotate = 0;
        var xScale = 1;
        var yScale = 1;
        var zScale = 1;
        if(bone.animationParameters.scale){
            xScale = Math.cos(bone.animationParameters.runningCycle);
            yScale = xScale;
            zScale = xScale;
        }
        bone.matrix= m4.translation(xPosition, yPosition, 0);
        bone.matrix= m4.xRotate(bone.matrix, xRotate);
        bone.matrix= m4.yRotate(bone.matrix, yRotate);
        bone.matrix= m4.zRotate(bone.matrix, zRotate);
        bone.matrix= m4.scale(bone.matrix, xScale, yScale, zScale);
        if(parent != null){
            bone.matrix = m4.multiply(bone.matrix, parent.matrix);
            //bonePoseInverse has been setup for all bones by the initializeBones function
            //bone.matrix = m4.multiply(bone.matrix, bone.bonePoseInverse);
        }
        if(bone.children != null){
            for(var i=0, l= bone.children.length; i < l; i++) {
                this.boneRecursiveUpdate(deltaTimeSecond, bone, bone.children[i]);
            }
        }
    }

    //set the bones in uniform
    render(viewProjectionMatrix, lightDirection){
        var gl = this.programInfo.gl;
        gl.useProgram(this.programInfo.program);
        for (var key in this.attributes) {
            //console.log("loading attributes " + key);
            var location = this.programInfo.attributeLocations[key];
            gl.enableVertexAttribArray(location);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.attributes[key].buffer);
            gl.vertexAttribPointer(location, this.attributes[key].size, this.attributes[key].type, this.attributes[key].normalize, this.attributes[key].stride, this.attributes[key].offset);
        }
        //TODO: set the uniforms in the same way as the attributes
        var worldMatrix = this.getWorldMatrix();
        var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);

        // Set the matrix.
        gl.uniformMatrix4fv(this.programInfo.uniformLocations['u_worldViewProjection'], false, worldViewProjectionMatrix);
        gl.uniformMatrix4fv(this.programInfo.uniformLocations['u_world'], false, worldMatrix);
        gl.uniform1f(this.programInfo.uniformLocations['u_transparency'], this.transparency);
          // set the light direction.
        gl.uniform3fv(this.programInfo.uniformLocations['u_reverseLightDirection'], m4.normalize(lightDirection));

        //set the bones
        var bonesMatrices = [...this.bones.matrix, ...this.bones['children'][0].matrix, ...this.bones['children'][1].matrix, ...this.bones['children'][2].matrix];
        var bonesMatricesForUniform = new Float32Array(bonesMatrices);
        gl.uniformMatrix4fv(this.programInfo.uniformLocations['u_bones'], false, bonesMatricesForUniform);

        // Draw the geometry.
        gl.drawArrays(gl.TRIANGLES, 0, this.numberOfVertexes);
    }
}
