import {m4} from './utils/matrix.js';


/**
 * A model with an update method and some velocity parameters to animate it.
 */
export class AnimatedModel {

  constructor(id, programInfo, vertexes, textureCoordinates){
    this.id = id;
    this.programInfo = programInfo;
    this.position = {
      x: 0,
      y: 0,
      z: 0,
    };
    this.rotation = {
      x: 0,
      y: 0,
      z: 0,
    };
    this.scale = {
      x: 1,
      y: 1,
      z: 1,
    };
    this.animationParameters = {
      translate: {
        xDirection: true,
        yDirection: true,
        zDirection: true,
        xOffset: 10,
        yOffset: 10,
        zOffset: 10,
      },
      rotate: {
        x: 0, /*180 to animate*/
        y: 0,
        z: 0,
      },
    }
    var gl = this.programInfo.gl;
    // create the position buffer.
    var positionBuffer = gl.createBuffer();
    // Put geometry data into buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.STATIC_DRAW);
    this.numberOfVertexes = vertexes.length/3; // 3 components per position
    this.attributes = {
      a_position : {
        buffer: positionBuffer, 
        size: 3, 
        type: gl.FLOAT,
        normalize: false,
        stride: 0,     // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset: 0,
      }
    };
    this.transparency = 1.0;
  }

  setTexture(image){
    var gl = this.programInfo.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  getModelViewMatrix(viewProjectionMatrix){
    var matrix = m4.translate(viewProjectionMatrix, this.position.x, this.position.y, this.position.z);
    matrix = m4.xRotate(matrix, this.rotation.x * Math.PI / 180);
    matrix = m4.yRotate(matrix, this.rotation.y * Math.PI / 180);
    matrix = m4.zRotate(matrix, this.rotation.z * Math.PI / 180);
    matrix = m4.scale(matrix, this.scale.x, this.scale.y, this.scale.z);
    return matrix;
  }

  getWorldMatrix(){
    var matrix = m4.translation(this.position.x, this.position.y, this.position.z);
    matrix = m4.xRotate(matrix, this.rotation.x * Math.PI / 180);
    matrix = m4.yRotate(matrix, this.rotation.y * Math.PI / 180);
    matrix = m4.zRotate(matrix, this.rotation.z * Math.PI / 180);
    matrix = m4.scale(matrix, this.scale.x, this.scale.y, this.scale.z);
    return matrix;
  }

  update(deltaTimeSecond){
    this.rotation.x += this.animationParameters.rotate.x * deltaTimeSecond;
    this.rotation.y += this.animationParameters.rotate.y * deltaTimeSecond;
    this.rotation.z += this.animationParameters.rotate.z * deltaTimeSecond;
  }

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
    //var matrix = this.getModelViewMatrix(viewProjectionMatrix);
    var worldMatrix = this.getWorldMatrix();
    var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
   
    // Set the matrix.
    gl.uniformMatrix4fv(this.programInfo.uniformLocations['u_worldViewProjection'], false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(this.programInfo.uniformLocations['u_world'], false, worldMatrix);
    gl.uniform1f(this.programInfo.uniformLocations['u_transparency'], this.transparency);
      // set the light direction.
    //var lightDirection = m4.normalize([0.5, -1.0, 0.5]);
    gl.uniform3fv(this.programInfo.uniformLocations['u_reverseLightDirection'], m4.normalize(lightDirection));
   
    // Draw the geometry.
    gl.drawArrays(gl.TRIANGLES, 0, this.numberOfVertexes);
  }
}

export class WaterModel extends AnimatedModel {

  //constructr stores the vertextes
  constructor(id, programInfo, vertexes){
    super(id, programInfo, vertexes, null);
    this.vertexes = vertexes;
    this.waveDisplacement = {
      current: 0,
      speed: 2,
      waveLongAmplitude: 10,
      direction: [1,1],
      waveHighAmplitude:2,
    };
    this.transparency = 0.8;
  }

  //update is overriding the default animated-model method. Here the vertexes position and normal
  // are reset
  update(deltaTimeSecond){
    this.waveDisplacement.current += deltaTimeSecond * this.waveDisplacement.speed;
    //this.waveDisplacement.current %= this.waveDisplacement.speed;
    var factor = (this.waveDisplacement.current/this.waveDisplacement.waveLongAmplitude)*2*Math.PI;
    var result = {vertexes: [], normals:[]};
    //iterate face by face (3 vertexes, each one with 3D coordinates = 9 numbers)
    for(var i=0, l = this.vertexes.length; i < l; i+=9) {
      var vertex1 = [this.vertexes[i],this.vertexes[i+1], this.vertexes[i+2]];
      var vertex2 = [this.vertexes[i+3],this.vertexes[i+4], this.vertexes[i+5]];
      var vertex3 = [this.vertexes[i+6],this.vertexes[i+7], this.vertexes[i+8]];
      //modify the height (t coordiante) of each vertex
      vertex1[1]+= Math.sin(factor + vertex1[0]*this.waveDisplacement.direction[0] + vertex1[2]*this.waveDisplacement.direction[1])*this.waveDisplacement.waveHighAmplitude;
      vertex2[1]+= Math.sin(factor + vertex2[0]*this.waveDisplacement.direction[0] + vertex2[2]*this.waveDisplacement.direction[1])*this.waveDisplacement.waveHighAmplitude;
      vertex3[1]+= Math.sin(factor + vertex3[0]*this.waveDisplacement.direction[0] + vertex3[2]*this.waveDisplacement.direction[1])*this.waveDisplacement.waveHighAmplitude;
      result.vertexes.push(...vertex1,...vertex2,...vertex3);
      var normal = m4.surfaceNormal(vertex1, vertex2, vertex3);
      result.normals.push(...normal, ...normal, ...normal);
    }
    var gl = this.programInfo.gl;
    var positionBuffer = this.attributes['a_position'].buffer; 
    // Put geometry data into buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    //calculate the geometries
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(result.vertexes), gl.STATIC_DRAW);

    var normalBuffer = this.attributes['a_normal'].buffer; 
    // Put geometry data into buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    //calculate the geometries
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(result.normals), gl.STATIC_DRAW);
  }

}

export class ProgramInfo {
  constructor(gl, vertexShaderSource, fragmentShaderSource, attributeNames, uniformNames){
    this.gl = gl;
    var vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = this.createProgram(gl, vertexShader, fragmentShader);
    this.attributeLocations = {};
    this.uniformLocations = {};
    for (const attributeName of attributeNames){
      this.attributeLocations[attributeName] = gl.getAttribLocation(this.program, attributeName);
    }

    for (const uniformName of uniformNames){
      this.uniformLocations[uniformName] = gl.getUniformLocation(this.program, uniformName);
    }

  }

  //create a WebGL shader
  createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  //create a WebGL program
  createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }
}

export class ModelFactory {

  constructor(colorProgram, textureProgram){
    this.colorProgram = colorProgram;
    this.textureProgram = textureProgram;
  }

  createAnimatedModelTextured(id, vertexes, textureCoordinates){
    var model = new AnimatedModel(id, this.textureProgram, vertexes);
    // Create a buffer to put texture coordinate in
    var gl = this.textureProgram.gl;
    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
    model.attributes['a_texcoord'] = {
      buffer: textureBuffer, 
      size: 2, 
      type: gl.FLOAT,
      normalize: false,
      stride: 0,     // 0 = move forward size * sizeof(type) each iteration to get the next position
      offset: 0,
    };
    return model;
  }

  createAnimatedModelColored(id, vertexes, colors, normals){
    var model = new AnimatedModel(id, this.colorProgram, vertexes);
    // Create a buffer to put texture coordinate in
    var gl = this.colorProgram.gl;
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    model.attributes['a_color'] = {
      buffer: colorBuffer, 
      size: 3, 
      type: gl.UNSIGNED_BYTE,
      normalize: true,
      stride: 0,     // 0 = move forward size * sizeof(type) each iteration to get the next position
      offset: 0,
    };
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    model.attributes['a_normal'] = {
      buffer: normalBuffer, 
      size: 3, 
      type: gl.FLOAT,
      normalize: false,
      stride: 0,     // 0 = move forward size * sizeof(type) each iteration to get the next position
      offset: 0,
    };
    return model;
  }

  createWaterModel(id, vertexes, colors){
    var model = new WaterModel(id, this.colorProgram, vertexes);
    // Create a buffer to put texture coordinate in
    var gl = this.colorProgram.gl;
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    model.attributes['a_color'] = {
      buffer: colorBuffer, 
      size: 3, 
      type: gl.UNSIGNED_BYTE,
      normalize: true,
      stride: 0,     // 0 = move forward size * sizeof(type) each iteration to get the next position
      offset: 0,
    };
    var normalBuffer = gl.createBuffer();
    model.attributes['a_normal'] = {
      buffer: normalBuffer, 
      size: 3, 
      type: gl.FLOAT,
      normalize: false,
      stride: 0,     // 0 = move forward size * sizeof(type) each iteration to get the next position
      offset: 0,
    };
    return model;
  }
}
