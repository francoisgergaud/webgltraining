import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import WebGLCanvas from './WebGLCanvas.js';
import VertexShader from './vertexShader.js';
import FragmentShader from './fragmentShader.js';
import Slider from 'react-input-slider';
import {Knob} from "react-rotary-knob";
import {m4} from './matrix.js';
import {model,colors} from './model.js';

class App extends React.Component {

  // the constructor: initialize the state
  constructor(props){
    super(props);
    this.state = {
      animationContext: {
        animationState: false,
        translateDirectionX: true,
        translateDirectionY: true,
        translateDirectionZ: true,
        translationOffsetX: 10,
        translationOffsetY: 10,
        translationOffsetZ: 10,
        rotationOffsetX: 0,
        rotationOffsetY: 0,
        rotationOffsetZ: 0,
        timer: null,
      },
      graphicContext: {
        glContext: null,
        program: null,
        width: 100,
        height: 30,
        depth: 400,
        positionAttributeLocation: null,
        rotationLocation: null, 
        scaleLocation: null, 
        resolutionUniformLocation: null, 
        colorUniformLocation: null, 
        positionBuffer: null,
        colorBuffer: null,
      },
      transformation : {
        color: [Math.random(), Math.random(), Math.random(), 1],
        translationX: 0, 
        translationY: 0,
        translationZ: 0,
        rotationAngleX: 0,
        rotationAngleY: 0,
        rotationAngleZ: 0,
        scaleX: 1, 
        scaleY: 1,
        scaleZ: 1,
      },
      camera : {
        fieldOfViewDegree:60,
        angleDegree: 0,
      },
    };
  }

  //component render
  render() {
    return (
      <Container fluid className="p-3 MainRow">
        <Row className="MainRow">
          <Col xs={8} className="MainRow">
            <WebGLCanvas afterInit={ this.setGlContext.bind(this)}/>
          </Col>
          <Col>
            <>
              <div>{'translation offset x: ' + this.state.animationContext.translationOffsetX + 'current x: ' + this.state.transformation.translationX }</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.animationContext.translationOffsetX}
                onChange={
                  ({ x }) => {
                    this.setState({
                      animationContext: {
                        ...this.state.animationContext,
                        translationOffsetX: x,
                      },
                    });
                  }
                }
              />
            </>
            <>
              <div>{'translation offset y: ' + this.state.animationContext.translationOffsetY + 'current y: ' + this.state.transformation.translationY }</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.animationContext.translationOffsetY}
                onChange={
                  ({ x }) => {
                    this.setState({
                      animationContext: {
                        ...this.state.animationContext,
                        translationOffsetY: x,
                      },
                    });
                  }}
              />
            </>
            <>
              <div>{'translation offset z: ' + this.state.animationContext.translationOffsetZ + 'current z: ' + this.state.transformation.translationZ }</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.animationContext.translationOffsetZ}
                onChange={
                  ({ x }) => {
                    this.setState({
                      animationContext: {
                        ...this.state.animationContext,
                        translationOffsetZ: x,
                      },
                    });
                  }}
              />
            </>
            <>
              <div>{'scaleX: ' + this.state.transformation.scaleX}</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.transformation.scaleX}
                onChange={
                  ({ x }) => {
                    this.setState({
                      transformation: {
                        ...this.state.transformation,
                        scaleX: x,
                      },
                    });
                  }}
              />
            </>
            <>
              <div>{'scaleY: ' + this.state.transformation.scaleY}</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.transformation.scaleY}
                onChange={
                  ({ x }) => {
                    this.setState({
                      transformation: {
                        ...this.state.transformation,
                        scaleY: x,
                      },
                    });
                  }}
              />
            </>
            <>
              <div>{'scaleZ: ' + this.state.transformation.scaleZ}</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.transformation.scaleZ}
                onChange={
                  ({ x }) => {
                    this.setState({
                      transformation: {
                        ...this.state.transformation,
                        scaleZ: x,
                      },
                    });
                  }}
              />
            </>

            <div>
              rotation X: 
                <div style={{display:'inline-block'}}>
                  <Knob 
                    onChange={this.changeRotationValueX.bind(this)}
                    min={0} 
                    max={360} 
                    value={this.state.transformation.rotationOffsetX}
                  />
                </div>
              </div>
              <div>
                rotation Y: 
                <div style={{display:'inline-block'}}>
                  <Knob 
                    onChange={this.changeRotationValueY.bind(this)}
                    min={0} 
                    max={360} 
                    value={this.state.transformation.rotationOffsetY}
                  />
                </div>
              </div>
              <div>
                rotation Z: 
                <div style={{display:'inline-block'}}>
                  <Knob 
                    onChange={this.changeRotationValueZ.bind(this)}
                    min={0} 
                    max={360} 
                    value={this.state.transformation.rotationOffsetZ}
                  />
                </div>
              </div>
            <div>
              <Button onClick={() => this.handleAnimationClick()}>Start/Stop</Button>
            </div>
            <>
              <div>{'fieldOfViewDegree: ' + this.state.camera.fieldOfViewDegree }</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={30}
                xmax={180}
                x={this.state.camera.fieldOfViewDegree}
                onChange={
                  ({ x }) => {
                    this.setState({
                      camera: {
                        ...this.state.camera,
                        fieldOfViewDegree: x,
                      },
                    });
                  }
                }
              />
            </>
          </Col>
        </Row>
      </Container>
    );
  }

  //handler for rotationX value change
  changeRotationValueX(rotationAngleDegree) {
    this.setState({
      animationContext: {
        ...this.state.animationContext,
        rotationOffsetX: rotationAngleDegree,
      },
    });
  }

  //handler for rotationY value change
  changeRotationValueY(rotationAngleDegree) {
    this.setState({
      animationContext: {
        ...this.state.animationContext,
        rotationOffsetY: rotationAngleDegree,
      },
    });
  }

  //handler for rotationZ value change
  changeRotationValueZ(rotationAngleDegree) {
    this.setState({
      animationContext: {
        ...this.state.animationContext,
        rotationOffsetZ: rotationAngleDegree,
      },
    });
  }

  //animate bounce the shape against the borders
  animate() {
    var translateDirectionX = this.state.animationContext.translateDirectionX;
    var translationX = this.state.transformation.translationX;
    if(translationX > this.state.graphicContext.width){
      translateDirectionX= false;
    } else if (translationX < 0){
      translateDirectionX= true;
    } 
    if(translateDirectionX){
      translationX += this.state.animationContext.translationOffsetX;
    } else {
      translationX -= this.state.animationContext.translationOffsetX;
    }
    var translateDirectionY = this.state.animationContext.translateDirectionY;
    var translationY = this.state.transformation.translationY;
    if(translationY > this.state.graphicContext.height){
      translateDirectionY= false;
    } else if (translationY < 0){
      translateDirectionY= true;
    } 
    if(translateDirectionY){
      translationY += this.state.animationContext.translationOffsetY;
    } else {
      translationY -= this.state.animationContext.translationOffsetY;
    }
    var translateDirectionZ = this.state.animationContext.translateDirectionZ;
    var translationZ = this.state.transformation.translationZ;
    if(translationZ > this.state.graphicContext.depth / 2){
      translateDirectionZ= false;
    } else if (translationZ < -this.state.graphicContext.depth / 2){
      translateDirectionZ= true;
    } 
    if(translateDirectionZ){
      translationZ += this.state.animationContext.translationOffsetZ;
    } else {
      translationZ -= this.state.animationContext.translationOffsetZ;
    }
    var rotationAngleX = this.state.transformation.rotationAngleX + this.state.animationContext.rotationOffsetX;
    var rotationAngleY = this.state.transformation.rotationAngleY + this.state.animationContext.rotationOffsetY;
    var rotationAngleZ = this.state.transformation.rotationAngleZ + this.state.animationContext.rotationOffsetZ;

    var cameraAngleDegree = (this.state.camera.angleDegree + 5) % 360
    this.setState({
        animationContext: {
          ...this.state.animationContext,
          translateDirectionX: translateDirectionX,
          translateDirectionY: translateDirectionY,
          translateDirectionZ: translateDirectionZ,
        },
        transformation: {
          ...this.state.transformation,
          translationX: translationX,
          translationY: translationY,
          translationZ: translationZ,
          rotationAngleX: rotationAngleX,
          rotationAngleY: rotationAngleY,
          rotationAngleZ: rotationAngleZ,
        },
        camera: {
          ...this.state.camera,
          angleDegree: cameraAngleDegree,
        }
      });
    this.drawScene(this.state.graphicContext, this.state.transformation);
  }

  // Draw a the scene.
  drawScene(graphicContext, transformation) {
    var gl = graphicContext.glContext;
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, graphicContext.width, graphicContext.height);
    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(graphicContext.program);
    
    // Turn on the attribute
    gl.enableVertexAttribArray(graphicContext.positionAttributeLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, graphicContext.positionBuffer);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(graphicContext.positionAttributeLocation, size, type, normalize, stride, offset);
    
    // Turn on the color attribute
    gl.enableVertexAttribArray(graphicContext.colorLocation);
    // Bind the color buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, graphicContext.colorBuffer);
    // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    var size = 3;                 // 3 components per iteration
    var type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
    var normalize = true;         // normalize the data (convert from 0-255 to 0-1)
    var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;               // start at the beginning of the buffer
    gl.vertexAttribPointer(graphicContext.colorLocation, size, type, normalize, stride, offset);

    var aspect = graphicContext.width / graphicContext.height;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = m4.perspective(this.state.camera.fieldOfViewDegree * Math.PI / 180, aspect, zNear, zFar);

    var numFs = 5;
    var radius = 200;

    // Compute the position of the first F
    var fPosition = [transformation.translationX, transformation.translationY, transformation.translationZ];
     
    // Compute a matrix for the camera
    var cameraMatrix = m4.yRotation(this.state.camera.angleDegree * Math.PI / 180);
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);

    // Get the camera's position from the matrix we computed
    var cameraPosition = [
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14],
    ];

    var up = [0, 1, 0];

    // Compute the camera's matrix using look at.
    var cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);
    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);
    // Compute a view projection matrix
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    for (var ii = 0; ii < numFs; ++ii) {
      var angle = ii * Math.PI * 2 / numFs;
      var x = Math.cos(angle) * radius;
      var y = Math.sin(angle) * radius;
     
      // starting with the view projection matrix
      // compute a matrix for the F
      var matrix = m4.translate(viewProjectionMatrix, x, 0, y);

      //test to remove
      matrix = m4.translate(matrix, transformation.translationX, transformation.translationY, transformation.translationZ);
      matrix = m4.xRotate(matrix, transformation.rotationAngleX * Math.PI / 180);
      matrix = m4.yRotate(matrix, transformation.rotationAngleY * Math.PI / 180);
      matrix = m4.zRotate(matrix, transformation.rotationAngleZ * Math.PI / 180);
      matrix = m4.scale(matrix, transformation.scaleX, transformation.scaleY, transformation.scaleZ);
     
      // Set the matrix.
      gl.uniformMatrix4fv(graphicContext.matrixLocation, false, matrix);
     
      // Draw the geometry.
      gl.drawArrays(gl.TRIANGLES, 0, model.length/3);
    }

    //var matrix = m4.perspective(this.state.camera.fieldOfViewDegree * Math.PI / 180, aspect, zNear, zFar);
    // move the object in front of the frustrum
    //matrix = m4.translate(matrix,-150, 0, -360);
    //var matrix = m4.makeZToWMatrix(this.state.camera.fudgeFactor);
    //matrix = m4.multiply(matrix, m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400));
    //var matrix = m4.orthographic(left, right, bottom, top, near, far);
    //var matrix = m4.projection(graphicContext.width, graphicContext.height, graphicContext.depth);
    // matrix = m4.translate(matrix, transformation.translationX, transformation.translationY, transformation.translationZ);
    // matrix = m4.xRotate(matrix, transformation.rotationAngleX * Math.PI / 180);
    // matrix = m4.yRotate(matrix, transformation.rotationAngleY * Math.PI / 180);
    // matrix = m4.zRotate(matrix, transformation.rotationAngleZ * Math.PI / 180);
    //matrix = m4.scale(matrix, transformation.scaleX, transformation.scaleY, transformation.scaleZ);
   
    // Set the matrix.
    //gl.uniformMatrix4fv(graphicContext.matrixLocation, false, matrix);

    // set the color
    //gl.uniform4fv(graphicContext.colorLocation, transformation.color);
   
    // Draw the rectangle.
    //gl.drawArrays(gl.TRIANGLES, 0, model.length/3);
  }

  // Returns a random integer from 0 to range - 1.
  randomInt(range) {
    return Math.floor(Math.random() * range);
  }

  //draw the shape
  setGeometry(gl, positionBuffer) {
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
    // whatever buffer is bound to the `ARRAY_BUFFER` bind point
    // but so far we only have one buffer. If we had more than one
    // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.
    var matrix = m4.xRotation(Math.PI);
    matrix = m4.translate(matrix, -50, -75, -15);

    for (var ii = 0; ii < model.length; ii += 3) {
      var vector = m4.vectorMultiply([model[ii + 0], model[ii + 1], model[ii + 2], 1], matrix);
      model[ii + 0] = vector[0];
      model[ii + 1] = vector[1];
      model[ii + 2] = vector[2];
    }
    gl.bufferData(gl.ARRAY_BUFFER, model, gl.STATIC_DRAW);
  }

  // Fill the buffer with colors for the 'F'.
  setColors(gl, colorBuffer) {
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  }

  //handle click on 'animate' button
  handleAnimationClick() {
    if(!this.state.animationContext.animationState){
      var newTimer = setInterval(this.animate.bind(this), 25);
      this.setState({
        animationContext: {
          ...this.state.animationContext,
          timer: newTimer,
          animationState: true,
        }
      });
    } else {
      clearInterval(this.state.animationContext.timer);
      this.setState({
        animationContext: {
          ...this.state.animationContext,
          timer: null,
          animationState: false,
        }
      });
    }
  }

  //set the WebGL context: this is called when ReactJS initialize the view
  setGlContext(glContext, width, height) {
    var vertexShaderSource = VertexShader;
    var fragmentShaderSource = FragmentShader;
    var vertexShader = this.createShader(glContext, glContext.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = this.createShader(glContext, glContext.FRAGMENT_SHADER, fragmentShaderSource);
    var program = this.createProgram(glContext, vertexShader, fragmentShader);
    var graphicContext = {...this.state.graphicContext}
    graphicContext.glContext= glContext; 
    graphicContext.width = width;
    graphicContext.height = height;
    graphicContext.program = program;
    graphicContext.positionAttributeLocation = glContext.getAttribLocation(program, "a_position");
    graphicContext.matrixLocation = glContext.getUniformLocation(program, "u_matrix");
    graphicContext.colorLocation = glContext.getAttribLocation(program, "a_color");
    // create the position buffer.
    graphicContext.positionBuffer = glContext.createBuffer();
    // Put geometry data into buffer
    this.setGeometry(glContext, graphicContext.positionBuffer);
    // Create a buffer to put colors in
    graphicContext.colorBuffer = glContext.createBuffer();
    // Put geometry data into buffer
    this.setColors(glContext, graphicContext.colorBuffer);
    this.setState({
      graphicContext : graphicContext
    });
    
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

export default App;
