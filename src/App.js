import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import WebGLCanvas from './WebGLCanvas.js';
import TransformationPanel from './transformationPanel.js';
import VertexShader from './vertexShader.js';
import FragmentShader from './fragmentShader.js';
import Slider from 'react-input-slider';
import {Knob} from "react-rotary-knob";
import {m4} from './matrix.js';
import {animatedModel,model,colors} from './model.js';

class App extends React.Component {

  // the constructor: initialize the state
  constructor(props){
    super(props);
    var width= 100;
    var height= 30;
    var depth= 400;
    var animatedElement1 = new animatedModel('id1', model, colors, width, height, depth);
    var animatedElement2 = new animatedModel('id2', model, colors, width, height, depth);
    this.state = {
      animationContext: {
        rafValue: 0,
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
      models : {'id1': animatedElement1, 'id2': animatedElement2},
      selectedModel : 'id1',
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
            <select type="text" value={this.state.selectedModel} onChange={this.selectModel.bind(this)} >
              {Object.keys(this.state.models).map(
                (value) => {
                  return <option key={value}>{value}</option>
                }
              )}
            </select>
            <TransformationPanel  key={this.state.selectedModel} selectedModel={ this.state.models[this.state.selectedModel] }/>
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
        <div>
          <Button onClick={() => this.handleAnimationClick()}>Start/Stop</Button>
        </div>
          </Col>
        </Row>
      </Container>
    );
  }

  

  //animate bounce the shape against the borders
  animate(now) {
    now *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = now - this.state.animationContext.rafValue;
    // Remember the current time for the next frame.
    this.state.animationContext.rafValue = now;
    Object.keys(this.state.models).forEach(
      modelId => this.state.models[modelId].animate(deltaTime)
    );
    this.drawScene(this.state.graphicContext, this.state.models, this.state.models[this.state.selectedModel]);
    requestAnimationFrame(this.animate.bind(this));
  }

  // Draw a the scene.
  drawScene(graphicContext, models, selectedModel) {
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
    size = 3;                 // 3 components per iteration
    type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
    normalize = true;         // normalize the data (convert from 0-255 to 0-1)
    stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
    offset = 0;               // start at the beginning of the buffer
    gl.vertexAttribPointer(graphicContext.colorLocation, size, type, normalize, stride, offset);

    var aspect = graphicContext.width / graphicContext.height;
    var zNear = 1;
    var zFar = 2000;
    
    var projectionMatrix = m4.perspective(this.state.camera.fieldOfViewDegree * Math.PI / 180, aspect, zNear, zFar);
    // Compute the position of the first F
    var cameraTarget = [selectedModel.position.x, selectedModel.position.y, selectedModel.position.z];
    // Compute a matrix for the camera
    var cameraMatrix = m4.translation(0, 0, -500);
    // Get the camera's position from the matrix we computed
    var cameraPosition = [
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14],
    ];
    var up = [0, -1, 0];
    // Compute the camera's matrix using look at.
    cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, up);
    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);
    // Compute a view projection matrix
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    Object.keys(models).forEach( modelId => {
      var model = models[modelId];
      //test to remove
      var matrix = m4.translate(viewProjectionMatrix, model.position.x, model.position.y, model.position.z);
      matrix = m4.xRotate(matrix, model.rotation.x * Math.PI / 180);
      matrix = m4.yRotate(matrix, model.rotation.y * Math.PI / 180);
      matrix = m4.zRotate(matrix, model.rotation.z * Math.PI / 180);
      matrix = m4.scale(matrix, model.scale.x, model.scale.y, model.scale.z);
     
      // Set the matrix.
      gl.uniformMatrix4fv(graphicContext.matrixLocation, false, matrix);
     
      // Draw the geometry.
      gl.drawArrays(gl.TRIANGLES, 0, model.vertex.length/3);
    });
  }

  // Returns a random integer from 0 to range - 1.
  randomInt(range) {
    return Math.floor(Math.random() * range);
  }

  //draw the shape
  setGeometry(gl, positionBuffer) {
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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
    requestAnimationFrame(this.animate.bind(this));
  }

  selectModel(event){
    this.setState({
      ...this.state,
      selectedModel: event.target.value,
    });
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
