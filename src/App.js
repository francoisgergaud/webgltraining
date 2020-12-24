import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import WebGLCanvas from './WebGLCanvas.js';
import TransformationPanel from './transformationPanel.js';
import {texturedFragmentShader, texturedVertexShader, texturedShaderAttributeNames, texturedShaderUniformNames} from './shaders/texturedShader.js';
import {coloredFragmentShader, coloredVertexShader, coloredShaderAttributeNames, coloredShaderUniformNames} from './shaders/coloredShader.js';
import Slider from 'react-input-slider';
import {Knob} from "react-rotary-knob";
import {webGLUtils} from './utils/webGLUtils.js';
import {LookAtCamera} from './utils/camera.js';
import {inputController} from './utils/inputController.js';
import {modelFactory, programInfo} from './model.js';
import {model, colors, textureCoordinates} from './geometries.js';
import {Terrain} from './utils/geometryGenerator.js';
import {Player} from './utils/player.js';

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
    this.mapCanvas = React.createRef();  
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
            <div>
              height map:
              <canvas id="mapHeights" width="100%" height="100%" ref={this.mapCanvas}></canvas>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  componentDidMount(){
    var myContext= this.mapCanvas.current.getContext('2d');
    var id = myContext.createImageData(1,1);
    var d  = id.data;
    for(var x=0; x < this.terrain.cells.length; x++){
      for(var y=0; y < this.terrain.cells[x].length; y++){
        var coeff = this.terrain.cells[x][y].height * 255;
        d[0]   = coeff;
        d[1]   = coeff;
        d[2]   = coeff
        d[3]   = 255;
        myContext.putImageData( id, x, y );
      }
    }
  }

  //set the WebGL context: this is called when ReactJS initialize the view
  setGlContext(glContext, canvas) {
    var width = canvas.width;
    var height = canvas.height
    var graphicContext = {...this.state.graphicContext}
    graphicContext.glContext= glContext; 
    graphicContext.width = width;
    graphicContext.height = height;
    var colorProgramInfo = new programInfo(glContext, coloredVertexShader, coloredFragmentShader, coloredShaderAttributeNames, coloredShaderUniformNames);
    var texturedProgramInfo = new programInfo(glContext, texturedVertexShader, texturedFragmentShader, texturedShaderAttributeNames, texturedShaderUniformNames);
    
    //initialize the scene's models
    var factory = new modelFactory(colorProgramInfo, texturedProgramInfo);
    var animatedElement1 = factory.createAnimatedModelTextured('id1', model, textureCoordinates);
    var animatedElement2 = factory.createAnimatedModelColored('id2', model, colors);
     
    // Asynchronously load an image for texture
    var image = new Image();
    image.src = "f-texture.png";
    image.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      animatedElement1.setTexture(image);
    });

    //generate the terrain
    this.terrain = new Terrain();
    var terrainModel = factory.createAnimatedModelColored('id3', this.terrain.vertexes, this.terrain.colors);
    
    //set the camera
    var cameraPosition = {x: 0, y:0, z: 500}
    var camera = new LookAtCamera(width, height, 1, 2000, 60 * Math.PI / 180);
    camera.rotation.y = 0;
    var player = new Player(camera, this.terrain);
    this.setState({
      graphicContext : graphicContext,
      models : {'id1': animatedElement1, 'id2': animatedElement2, 'id3': terrainModel},
      selectedModel : 'id1',
      player : player,
      camera: camera,
    });
    var inputController1 = new inputController(canvas, player);
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
    this.state.player.animate(deltaTime);
    //end test
    
    //render
    var gl = this.state.graphicContext.glContext;
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, this.state.graphicContext.width, this.state.graphicContext.height);
    gl.clearColor(176/256, 245/256, 255/256, 1.0);
    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    //lookup camera
    // var selectedModel = this.state.models[this.state.selectedModel];
    // var cameraTarget = [selectedModel.position.x, selectedModel.position.y, selectedModel.position.z];
    // this.state.camera.setTarget(cameraTarget);
    var viewProjectionMatrix = this.state.camera.getViewProjectionMatrix();
    //render each model from the scene
    Object.keys(this.state.models).forEach( modelId => {
      var model = this.state.models[modelId];
      model.render(viewProjectionMatrix);
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

}

export default App;
