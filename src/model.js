import {m4} from './utils/matrix.js';

export class animatedModel {

  constructor(id, gl, vertexes, colors, textureCoordinates){
    this.id = id;
    this.gl = gl;
    this.colors = colors;
    this.textureCoordinates = textureCoordinates;

    this.position = {
      x: 0,
      y: 0,
      z: 0,
    };
    this.rotation = {
      x: 180, //the model coordinates are upside-down regarding the 3D referential. Need to revert it
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
    // create the position buffer.
    this.positionBuffer = gl.createBuffer();
    // Put geometry data into buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.STATIC_DRAW);
    this.numberOfVertexes = vertexes.length/3; // 3 components per position
    // Create a buffer to put texture coordinate in
    this.textureBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
    // Create a texture.
    this.texture = gl.createTexture();
    this.image = null;
  }

  swapTexture(){
    if(this.image == null) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      // Fill the texture with a 1x1 blue pixel.
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    } else {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }
  }

  animate(deltaTimeSecond){
    this.rotation.x += this.animationParameters.rotate.x * deltaTimeSecond;
    this.rotation.y += this.animationParameters.rotate.y * deltaTimeSecond;
    this.rotation.z += this.animationParameters.rotate.z * deltaTimeSecond;
  }

  getModelViewMatrix(viewProjectionMatrix){
    var matrix = m4.translate(viewProjectionMatrix, this.position.x, this.position.y, this.position.z);
    matrix = m4.xRotate(matrix, this.rotation.x * Math.PI / 180);
    matrix = m4.yRotate(matrix, this.rotation.y * Math.PI / 180);
    matrix = m4.zRotate(matrix, this.rotation.z * Math.PI / 180);
    matrix = m4.scale(matrix, this.scale.x, this.scale.y, this.scale.z);
    return matrix;
  }
}

//contains array of coordinate which define the vertices of a model
export const model = new Float32Array([
          // left column front
                    // left column front
          0,   0,  0,
          0, 150,  0,
          30,   0,  0,
          0, 150,  0,
          30, 150,  0,
          30,   0,  0,

          // top rung front
          30,   0,  0,
          30,  30,  0,
          100,   0,  0,
          30,  30,  0,
          100,  30,  0,
          100,   0,  0,

          // middle rung front
          30,  60,  0,
          30,  90,  0,
          67,  60,  0,
          30,  90,  0,
          67,  90,  0,
          67,  60,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung right
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   60,  30,
          30,   30,  30,
          30,   30,   0,
          30,   60,   0,
          30,   60,  30,

          // top of middle rung
          30,   60,   0,
          67,   60,  30,
          30,   60,  30,
          30,   60,   0,
          67,   60,   0,
          67,   60,  30,

          // right of middle rung
          67,   60,   0,
          67,   90,  30,
          67,   60,  30,
          67,   60,   0,
          67,   90,   0,
          67,   90,  30,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // right of bottom
          30,   90,   0,
          30,  150,  30,
          30,   90,  30,
          30,   90,   0,
          30,  150,   0,
          30,  150,  30,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0]);

export const colors = new Uint8Array([
          // left column front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // top rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // middle rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // left column back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // top rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // middle rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // top
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,

          // top rung right
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,

          // under top rung
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,

          // between top rung and middle
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,

          // top of middle rung
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,

          // right of middle rung
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,

          // bottom of middle rung.
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,

          // right of bottom
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,

          // bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,

          // left side
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220]);

export const textureCoordinates =
      new Float32Array([
        // left column front
         38 / 255,  44 / 255,
         38 / 255, 223 / 255,
        113 / 255,  44 / 255,
         38 / 255, 223 / 255,
        113 / 255, 223 / 255,
        113 / 255,  44 / 255,

        // top rung front
        113 / 255, 44 / 255,
        113 / 255, 85 / 255,
        218 / 255, 44 / 255,
        113 / 255, 85 / 255,
        218 / 255, 85 / 255,
        218 / 255, 44 / 255,

        // middle rung front
        113 / 255, 112 / 255,
        113 / 255, 151 / 255,
        203 / 255, 112 / 255,
        113 / 255, 151 / 255,
        203 / 255, 151 / 255,
        203 / 255, 112 / 255,

        // left column back
         38 / 255,  44 / 255,
        113 / 255,  44 / 255,
         38 / 255, 223 / 255,
         38 / 255, 223 / 255,
        113 / 255,  44 / 255,
        113 / 255, 223 / 255,

        // top rung back
        113 / 255, 44 / 255,
        218 / 255, 44 / 255,
        113 / 255, 85 / 255,
        113 / 255, 85 / 255,
        218 / 255, 44 / 255,
        218 / 255, 85 / 255,

        // middle rung back
        113 / 255, 112 / 255,
        203 / 255, 112 / 255,
        113 / 255, 151 / 255,
        113 / 255, 151 / 255,
        203 / 255, 112 / 255,
        203 / 255, 151 / 255,

        // top
        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        // top rung right
        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        // under top rung
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // between top rung and middle
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // top of middle rung
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // right of middle rung
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // bottom of middle rung.
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // right of bottom
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // bottom
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // left side
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,]);