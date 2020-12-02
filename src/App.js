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
import {m4} from './utils/matrix.js';
import {webGLUtils} from './utils/webGLUtils.js';
import {lookAtCamera} from './utils/camera.js';
import {animatedModel, model, colors, textureCoordinates} from './model.js';

class App extends React.Component {

  // the constructor: initialize the state
  constructor(props){
    super(props);
    var width= 100;
    var height= 30;
    var depth= 400;
    var animatedElement1 = new animatedModel('id1', model, colors, textureCoordinates, width, height, depth);
    var animatedElement2 = new animatedModel('id2', model, colors, textureCoordinates, width, height, depth);
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
      },
      models : {'id1': animatedElement1, 'id2': animatedElement2},
      selectedModel : 'id1',
      camera : null,
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
    
    var glAttributes = {
      a_position : {
        location: graphicContext.positionAttributeLocation, 
        buffer: graphicContext.positionBuffer, 
        size: 3, 
        type: gl.FLOAT,
        normalize: false,
        stride: 0,     // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset: 0,
      },
      a_texcoord: {
        location: graphicContext.texcoordLocation, 
        buffer: graphicContext.textureBuffer, 
        size: 2, 
        type: gl.FLOAT,
        normalize: false,
        stride: 0,     // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset: 0,
      },
    };
    webGLUtils.setAttributes(gl, glAttributes);

    var cameraTarget = [selectedModel.position.x, selectedModel.position.y, selectedModel.position.z];
    this.state.camera.setTarget(cameraTarget);
    var viewProjectionMatrix = this.state.camera.getViewProjectionMatrix();

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

  setTexcoords(gl, textureBuffer) {
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
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
    graphicContext.texcoordLocation = glContext.getAttribLocation(program, "a_texcoord");
    // create the position buffer.
    graphicContext.positionBuffer = glContext.createBuffer();
    // Put geometry data into buffer
    this.setGeometry(glContext, graphicContext.positionBuffer);
    // Create a texture.
    var texture = glContext.createTexture();
    glContext.bindTexture(glContext.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, 1, 1, 0, glContext.RGBA, glContext.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
     
    // Asynchronously load an image
    var image = new Image();
    image.src = "f-texture.png";
    image.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      glContext.bindTexture(glContext.TEXTURE_2D, texture);
      glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA,glContext.UNSIGNED_BYTE, image);
      glContext.generateMipmap(glContext.TEXTURE_2D);
    });
    // Create a buffer to put texture coordinate in
    graphicContext.textureBuffer = glContext.createBuffer();
    // Put texture coordinate data into buffer
    this.setTexcoords(glContext, graphicContext.textureBuffer);
    var camera = new lookAtCamera(width, height, 1, 2000, 60 * Math.PI / 180, [0, 0, -500], [0,0,0]);
    this.setState({
      graphicContext : graphicContext,
      camera : camera,
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
