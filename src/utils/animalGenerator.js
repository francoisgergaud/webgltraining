
import {AnimatedModel} from '../model.js';
import {createBoxVertexes} from './basicGeometriesGenerator.js';
import {m4} from './matrix.js';


//animated model whith bones hierarchy: the vertexes from a same model can be animated independently using
// a bone hierarchy. The general skinning technic has been simplified:
// - only one bone influence a vertex, hence no need of wieght
// - the model is composed only of 3D box geometries
// For the animation parameters and constraints, see https://www.smashingmagazine.com/2017/09/animation-interaction-techniques-webgl/
export class SkinnedModel extends AnimatedModel {

    // pass the vertexes and bones as parameters
	constructor(id, programInfo, terrain){
        super(id, programInfo, [], null);
        this.terrain = terrain;
        var bodyBindPose = {translation: {x: 0, y: 0, z: 0}, rotation: {x: 0, y: 0, z: Math.PI*0.2}, scale: {x: 1, y: 1, z: 1}};
        var leftLegBindPose = {translation: {x: 0, y: -15, z: -10}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}};
        var rightLegBindPose = {translation: {x: 0, y: -15, z: +10}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}};
        var headBindPose = {translation: {x: 20, y: 30, z: 0}, rotation: {x: 0, y: 0, z: 0-Math.PI*0.1}, scale: {x: 1, y: 1, z: 1}};
        var righEyeBindPose = {translation: {x: 0, y: 0, z: -12}, rotation: {x: 0, y: 0, z: 0},scale: {x: 1, y: 1, z: 1}};
        var rightEyebrowBindPose = {translation: {x: 0, y: 0, z: -1}, rotation: {x: 0, y: 0, z: 0}, scale: {x: 1, y: 1, z: 1}};
        
        this.rootModel = {
            boneName: 'body',
			size: {x: 40, y: 20, z: 30},
            color: [241, 245, 24],
            initialPose: bodyBindPose,
			children: [
				{
                    boneName: 'leftLeg',
                    size: {x: 15, y: 5, z: 10},
					color: [245, 24, 223],
                    initialPose: leftLegBindPose,
				},
				{
                    boneName: 'rightLeg',
                    size: {x: 15, y: 5, z: 10},
					color: [3, 252, 232],
                    initialPose: rightLegBindPose,
				},
				{
                    boneName: 'head',
                    size: {x: 20, y: 10, z: 10},
					color: [17, 247, 244],
                    initialPose: headBindPose,
                    children : [
                        {
                            boneName: 'rightEye',
                            size: {x: 5, y: 5, z: 1},
                            color: [242, 250, 250],
                            initialPose: righEyeBindPose,
                            children : [
                            {
                                boneName: 'rightEyebrow',
                                size: {x: 8, y: 2, z: 1},
                                color: [0, 0, 0],
                                initialPose: rightEyebrowBindPose,
                            },
                            ]
                        },
                    ]
				},
                
			]
		};
        //TODO:relate the indexes dynamically between model and bones
        this.bones = {
            name: 'body',
            //idx: 0,
            //boneID: 
            bindPose: bodyBindPose,
            'children': [
                {
                    name: 'leftLeg',
                    //idx: 1,
                    bindPose: leftLegBindPose,
                },
                {
                    name: 'rightLeg',
                    //idx: 2,
                    bindPose: rightLegBindPose,
                },
                {
                    name: 'head',
                    //idx: 3,
                    bindPose: headBindPose,
                    'children': [
                        {
                            name: 'rightEye',
                            //idx: 4,
                            bindPose: righEyeBindPose,
                            'children': [
                                {
                                    name: 'rightEyebrow',
                                    //idx: 5,
                                    bindPose: rightEyebrowBindPose,
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        this.orderedBones = this._initializeBoneArray(this.bones, this.rootModel);
        this.runningCycle = 0;
        //update method per bone index
        var animation = {};
        animation['body'] = function(runningCycle){
            return {
                translation: {
                    x: Math.sin(runningCycle*8) * 5,
                    y: Math.cos(runningCycle*8) * 5,
                    z: 0,
                },
                rotation: {
                    x: -Math.cos(runningCycle*4) * 0.2,
                    y: 0,
                    z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            }

        };
        animation['leftLeg'] = function(runningCycle){
            return {
                translation: {
                    x: 0,
                    y: Math.max(0, Math.cos(Math.PI+runningCycle*4) * 10) - Math.abs(Math.cos(runningCycle*4) * 10),
                    z: 0,
                },
                rotation: {
                    x: Math.cos(runningCycle*4) * 0.2,
                    y: 0,
                    z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            }
        };
        animation['rightLeg'] = function(runningCycle){
            return {
                translation: {
                    x: 0,
                    y: Math.max(0, Math.cos(runningCycle*4) * 10) - Math.abs(Math.cos(runningCycle*4) * 10),
                    z: 0,
                },
                rotation: {
                    x: Math.cos(runningCycle*4) * 0.3,
                    y: 0,
                    z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            }
        };
        animation['head'] = function(runningCycle){
            return {
                translation: {
                    x: 0,
                    y: -Math.abs(Math.cos(runningCycle*4) * 15),
                    z: 0,
                },
                rotation: {
                    x: Math.cos(runningCycle*4)*0.04 - Math.cos(runningCycle*4) * 0.3,
                    y: Math.cos(runningCycle*4)*0.02,
                    z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            }
        };
        animation['rightEye'] = function(runningCycle){
            return {
                translation: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            }
        };
        animation['rightEyebrow'] = function(runningCycle){
            return {
                translation: {
                    x: 0,
                    y: 0,//Math.abs(Math.cos(runningCycle*4) * 15),
                    z: 0,
                },
                rotation: {
                    x: 0,//-Math.cos(runningCycle*4)*0.04 - Math.cos(runningCycle*4) * 0.3,
                    y: 0,
                    z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            }
        };
        this.animation = animation;
        var geometry = this.generateGeometry(this.rootModel, null);
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

    generateGeometry(geometryNode, parentTransformationMatrix){
        var geometryVertexes = createBoxVertexes(geometryNode.size);
        var normals = [];
        var colors = [];
        var boneIdx = [];
        var vertexes = [];
        var transformationMatrix = m4.generateTranformationMatrix(geometryNode.initialPose);
        if(parentTransformationMatrix != null){
            transformationMatrix = m4.multiply(parentTransformationMatrix, transformationMatrix);
        }
        for(var i=0, l = geometryVertexes.length; i < l; i+=9) {
            var vertex1 = m4.multiply1D(transformationMatrix, [geometryVertexes[i], geometryVertexes[i+1], geometryVertexes[i+2], 1]);
            var vertex2 = m4.multiply1D(transformationMatrix, [geometryVertexes[i+3], geometryVertexes[i+4], geometryVertexes[i+5], 1]);
            var vertex3 = m4.multiply1D(transformationMatrix, [geometryVertexes[i+6], geometryVertexes[i+7], geometryVertexes[i+8], 1]);
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
                var childResult = this.generateGeometry(geometryNode.children[i], transformationMatrix);
                vertexes.push(...childResult['vertexes']);
                normals.push(...childResult['normals']);
                colors.push(...childResult['colors']);
                boneIdx.push(...childResult['boneIdx']);
            }
            
        }
        return {'vertexes': vertexes, 'normals': normals, 'colors': colors, 'boneIdx': boneIdx}
    }

    initializeBones(boneNode, parent){
        boneNode.bindPoseMatrix = m4.generateTranformationMatrix(boneNode.bindPose);
        if(parent!=null){
            boneNode.bindPoseMatrix = m4.multiply(parent.bindPoseMatrix, boneNode.bindPoseMatrix);
        }
        boneNode.bonePoseInverseMatrix = m4.inverse(boneNode.bindPoseMatrix);
        if(boneNode.children != null){
            for(var i=0, l= boneNode.children.length; i < l; i++) {
                this.initializeBones(boneNode.children[i], boneNode);
            }
        }
        return boneNode;
    }

    // update the bones matrices uniforms and set them
    update(deltaTimeSecond){
        this.runningCycle += deltaTimeSecond;
        //this.position.x+=Math.abs(Math.sin(this.runningCycle*4) * 0.8);
        this.position.y= 15 + this.terrain.getHeight(this.position.x, this.position.z);
        this.boneRecursiveUpdate(this.runningCycle, null, this.bones);
        
    }

    /**
     * update the bones hierarchy: this is where the animation parameters are used
     * @param  {integer} deltaTimeSecond The difference between the time this frame and the previous are generated, in seconds.
     * @param  {Bone} parent the parent bone, which movement influate the current bone
     * @param  {Bone} bone the current bone to be animated
     * @return {None}
     */
    boneRecursiveUpdate(runningCycle, parent, bone){
        //generate the transformation matrix for the current state of animation
        var boneTransformation = this.animation[bone.name](runningCycle);
        bone.transformationMatrix = m4.generateTranformationMatrix(boneTransformation);
        bone.transformationMatrix = m4.multiply(bone.bindPoseMatrix, bone.transformationMatrix);
        //transformation matrix is using bone.local coordinates. The translation would be empty. We need to multiply if by the bone
        //local bind-position
        bone.transformationMatrix = m4.multiply(bone.transformationMatrix, bone.bonePoseInverseMatrix);
        //apply the parent´s global-transformation on the bone local-transformation
        if(parent != null){
            bone.transformationMatrix = m4.multiply(parent.transformationMatrix, bone.transformationMatrix);
        }
        
        if(bone.children != null){
            for(var i=0, l= bone.children.length; i < l; i++) {
                this.boneRecursiveUpdate(runningCycle, bone, bone.children[i]);
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
        var bonesMatrices = [];
        for(var i =0, l= this.orderedBones.length; i<l; i++){
            bonesMatrices.push(...this.orderedBones[i].transformationMatrix);
        }
        //var bonesMatrices = [...this.bones.transformationMatrix, ...this.bones['children'][0].transformationMatrix, ...this.bones['children'][1].transformationMatrix, ...this.bones['children'][2].transformationMatrix, ...this.bones['children'][2]['children'][0].transformationMatrix, ...this.bones['children'][2]['children'][0]['children'][0].transformationMatrix];
        var bonesMatricesForUniform = new Float32Array(bonesMatrices);
        gl.uniformMatrix4fv(this.programInfo.uniformLocations['u_bones'], false, bonesMatricesForUniform);

        // Draw the geometry.
        gl.drawArrays(gl.TRIANGLES, 0, this.numberOfVertexes);
    }

    _initializeBoneArray(boneRootNode, modelRootNode){
        var boneNodeOrderedList = [];
        var tempStack = [boneRootNode];
        var boneIndexByName = {};
        while(tempStack.length > 0) {
            var boneNode = tempStack.pop();
            boneNodeOrderedList.push(boneNode);
            boneIndexByName[boneNode.name] = boneNodeOrderedList.length-1;
            if(boneNode.children != null){
                for(var i=0, l= boneNode.children.length; i < l; i++) {
                    tempStack.push(boneNode.children[i]);
                }
            }
        }
        tempStack = [modelRootNode];
        while(tempStack.length > 0) {
            var modelNode = tempStack.pop();
            modelNode.boneIdx = boneIndexByName[modelNode.boneName];
            if(modelNode.children != null){
                for(var i=0, l= modelNode.children.length; i < l; i++) {
                    tempStack.push(modelNode.children[i]);
                }
            }
        }
        return boneNodeOrderedList;
    }
}
