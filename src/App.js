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
import {webGLUtils} from './utils/webGLUtils.js';
import {lookAtCamera} from './utils/camera.js';
import {inputController} from './utils/inputController.js';
import {animatedModel, model, colors, textureCoordinates} from './model.js';

class App extends React.Component {

  // the constructor: initialize the state
  constructor(props){
    super(props);
    var width= 100;
    var height= 30;
    var depth= 400;
    this.state = {
      animationContext: {
        rafValue: 0,
      },
      graphicContext: {
        glContext: null,
        program: null,
        width: width,
        height: height,
        depth: depth,
      },
      models : {},
      selectedModel : null,
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

  //set the WebGL context: this is called when ReactJS initialize the view
  setGlContext(glContext, canvas) {
    var width = canvas.width;
    var height = canvas.height
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

    //initialize the scene
    var animatedElement1 = new animatedModel('id1', glContext, model, colors, textureCoordinates);
    var animatedElement2 = new animatedModel('id2', glContext, model, colors, textureCoordinates);
     
    // Asynchronously load an image for texture
    var image = new Image();
    image.src = "f-texture.png";
    image.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      animatedElement1.image = image;
    });
    //var cameraPosition = {x: 0, y:0, z: -500}
    var cameraPosition = {x: 0, y:0, z: 500}
    var camera = new lookAtCamera(width, height, 1, 2000, 60 * Math.PI / 180, cameraPosition, /*[0,0,0]*/null);
    camera.rotation.y = 0;
    this.setState({
      graphicContext : graphicContext,
      models : {'id1': animatedElement1, 'id2': animatedElement2},
      selectedModel : 'id1',
      camera : camera,
    });
    var inputController1 = new inputController(canvas, camera);
  }
  

  //animate bounce the shape against the borders
  animate(now) {
    now *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = now - this.state.animationContext.rafValue;
    // Remember the current time for the next frame.
    this.state.animationContext.rafValue = now;
    //calculate next animation state
    Object.keys(this.state.models).forEach(
      modelId => this.state.models[modelId].animate(deltaTime)
    );
    
    //test controlled camera
    //this.state.camera.setTarget(null);
    this.state.camera.animate(deltaTime);
    //end test
    
    //render
    var gl = this.state.graphicContext.glContext;
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, this.state.graphicContext.width, this.state.graphicContext.height);
    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(this.state.graphicContext.program);
    //lookup camera
    // var selectedModel = this.state.models[this.state.selectedModel];
    // var cameraTarget = [selectedModel.position.x, selectedModel.position.y, selectedModel.position.z];
    // this.state.camera.setTarget(cameraTarget);
    var viewProjectionMatrix = this.state.camera.getViewProjectionMatrix();
    //render each model from the scene
    Object.keys(this.state.models).forEach( modelId => {
      var model = this.state.models[modelId];
      var glAttributes = {
        a_position : {
          location: this.state.graphicContext.positionAttributeLocation, 
          buffer: model.positionBuffer, 
          size: 3, 
          type: gl.FLOAT,
          normalize: false,
          stride: 0,     // 0 = move forward size * sizeof(type) each iteration to get the next position
          offset: 0,
        },
        a_texcoord: {
          location: this.state.graphicContext.texcoordLocation, 
          buffer: model.textureBuffer, 
          size: 2, 
          type: gl.FLOAT,
          normalize: false,
          stride: 0,     // 0 = move forward size * sizeof(type) each iteration to get the next position
          offset: 0,
        },
      };
      webGLUtils.setAttributes(gl, glAttributes);

      var matrix = model.getModelViewMatrix(viewProjectionMatrix);
     
      // Set the matrix.
      gl.uniformMatrix4fv(this.state.graphicContext.matrixLocation, false, matrix);

      //set the texture for the model
      model.swapTexture();
     
      // Draw the geometry.
      gl.drawArrays(gl.TRIANGLES, 0, model.numberOfVertexes);
    });
    requestAnimationFrame(this.animate.bind(this));
  }

  //handle click on 'animate' button
  handleAnimationClick() {
    requestAnimationFrame(this.animate.bind(this));
  }

  selectModel(event){
    var modelSelectdId = event.target.value;
    var selectedModelPosition = this.state.models[modelSelectdId].position;
    var cameraTarget = [selectedModelPosition.x, selectedModelPosition.y, selectedModelPosition.z];
    this.state.camera.setTarget(cameraTarget);
    this.setState({
      ...this.state,
      selectedModel: modelSelectdId,
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
