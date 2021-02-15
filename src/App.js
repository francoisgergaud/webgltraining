import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {MapCanvas, WebGLCanvas} from './RenderCanvas.js';
import TransformationPanel from './transformationPanel.js';
import {texturedFragmentShader, texturedVertexShader, texturedShaderAttributeNames, texturedShaderUniformNames} from './shaders/texturedShader.js';
import {coloredFragmentShader, coloredVertexShader, coloredShaderAttributeNames, coloredShaderUniformNames} from './shaders/coloredShader.js';
import {skinnedVertexShader, skinnedFragmentShader, skinnedShaderAttributeNames, skinnedShaderUniformNames} from './shaders/skinShader.js';
import {LookAtCamera} from './utils/camera.js';
import {InputController} from './utils/inputController.js';
import {ModelFactory, ProgramInfo} from './model.js';
import {TerrainFactory, TerrainGeometryGenerator} from './utils/terrainGenerator.js';
import {ForestGenerator, ForestGeometryGenerator} from './utils/treeGenerator.js';
import {Player} from './utils/player.js';
import {SkinnedModel} from './utils/animalGenerator.js';

class App extends React.Component {

  constructor(props){
    super(props);
    var depth= 400;
    this.rafValue= 0;
    this.state = {
      graphicContext: {
        glContext: null,
        program: null,
        width: null,
        height: null,
        depth: depth,
      },
      models : {},
      selectedModel : "",
      camera : null,
      initialized: false,
    };
    this.mapCanvas = React.createRef();
    this.canvas3D = React.createRef();
  }

  //component render
  render() {
    return (
      <Container fluid className="p-3 MainRow">
        <Row className="MainRow">
          
            { this.state.initialized &&
              <>
                <Col xs={8} className="MainRow">
                  <WebGLCanvas afterinitializationCallback={ this.initialize3Dview.bind(this) } ref={this.canvas3D}/>
                </Col>
                <Col>
                  Object focus: 
                  <select type="text" value={this.state.selectedModel} onChange={this.selectModel.bind(this)} >
                    {Object.keys(this.state.models).map(
                      (value) => {
                        return <option key={value}>{value}</option>
                      }
                    )}
                  </select>
                  <TransformationPanel  key={this.state.selectedModel} selectedModel={ this.state.models[this.state.selectedModel] }/>
                  <div>
                    map:
                    <MapCanvas ref={this.mapCanvas} terrain={ this.terrain } afterinitializationCallback={ this.initialize2DMap.bind(this) }></MapCanvas>
                  </div>
                </Col>
              </>
            }
            { !this.state.initialized && 
              <div className="col text-center align-self-center">
                <div>move with <img src="keyboard-arrow-keys.png"/> </div>
                  <Button onClick={() => this.handleStartAction()}>Start</Button>
              </div>
            }
        </Row>
      </Container>
    );
  }

//
  /**
   * callback used when the 3D canvas did mount. At this point, the canvas3D ref is not set yet as the canvas3D component
   * has not completed it initialization:
   * - build the WebGL program (and shaders)
   * - set the input control
   * - start the rendering loop.
   * @return {[type]} [description]
   */
  initialize3Dview(canvas3D, glContext){
    var width = canvas3D.width;
    var height = canvas3D.height;
    var graphicContext = {...this.state.graphicContext};
    graphicContext.glContext= glContext; 
    graphicContext.width = width;
    graphicContext.height = height;
    var colorProgramInfo = new ProgramInfo(glContext, coloredVertexShader, coloredFragmentShader, coloredShaderAttributeNames, coloredShaderUniformNames);
    var texturedProgramInfo = new ProgramInfo(glContext, texturedVertexShader, texturedFragmentShader, texturedShaderAttributeNames, texturedShaderUniformNames);
    var skinnedProgramInfo = new ProgramInfo(glContext, skinnedVertexShader, skinnedFragmentShader, skinnedShaderAttributeNames, skinnedShaderUniformNames);
    //initialize the scene's models
    var factory = new ModelFactory(colorProgramInfo, texturedProgramInfo);
    var terrainGeometryGenerator = new TerrainGeometryGenerator();
    var terrainGeometry = terrainGeometryGenerator.generate(this.terrain);
    var terrainModel = factory.createAnimatedModelColored('terrain', terrainGeometry.land.vertexes, terrainGeometry.land.colors, terrainGeometry.land.normals);
    var waterModel = factory.createWaterModel('water', terrainGeometry.water.vertexes, terrainGeometry.water.colors);
    var forestGeometryGenerator = new ForestGeometryGenerator();
    var treeModels = forestGeometryGenerator.generateGeometry(this.trees, factory);
    var animalModel = new SkinnedModel('prout', skinnedProgramInfo);
    animalModel.position.x = ((this.terrain.gridWidth/2)-2) * this.terrain.cellSize;
    animalModel.position.z = ((this.terrain.gridHeight/2)-2) * this.terrain.cellSize;
    animalModel.position.y = 50;
    var models = {...treeModels};
    models['terrain'] = terrainModel;
    models['water'] = waterModel;
    models['animal'] = animalModel;
    //set the camera
    var camera = new LookAtCamera(width, height, 1, 2000, 60 * Math.PI / 180);
    camera.rotation.y = 0;
    this.state.player.setCamera(camera);
    this.setState({
      graphicContext : graphicContext,
      models : models,
      selectedModel : 'terrain',
      camera: camera,
    });
    new InputController(canvas3D, this.state.player);
    requestAnimationFrame(this.animate.bind(this));    
  }

  initialize2DMap(miniMap){
    this.state.player.setMiniMap(miniMap);
  }

  /**
   * animate update the models and render them
   * @param  {timestamp} now The current timestamp in milliseconds
   * @return {None}
   */
  animate(now) {
    now *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = now - this.rafValue;
    // Remember the current time for the next frame.
    this.rafValue = now;
    //calculate next animation state
    Object.keys(this.state.models).forEach(
      modelId => this.state.models[modelId].update(deltaTime)
    );
    this.state.player.update(deltaTime);

    //render
    this.resizeCanvasToDisplaySize(this.canvas3D.current.canvas.current);
    var gl = this.state.graphicContext.glContext;
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, this.state.graphicContext.width, this.state.graphicContext.height);
    this.state.camera.setViewportDimension(this.state.graphicContext.width, this.state.graphicContext.height); 
    gl.clearColor(135/256, 206/256, 235/256, 1.0);
    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var viewProjectionMatrix = this.state.camera.getViewProjectionMatrix();
    //render each model from the scene
    Object.keys(this.state.models).forEach( modelId => {
      var model = this.state.models[modelId];
      model.render(viewProjectionMatrix, this.state.lightDirection);
    });
    requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Build the world's data and activate the 3D view initialization by setting the state's 'initialized' property to true.
   * @return {None}
   */
  handleStartAction() {
    //generate the terrain and water
    var terrainFactory = new TerrainFactory();
    this.terrain = terrainFactory.generate(20, 100, 100);
     //generte the trees
    var forestSeed = 1;
    var forestGenerator = new ForestGenerator(forestSeed);
    this.trees = forestGenerator.generate(this.terrain, 100);
    var player = new Player(this.terrain);
    this.setState({
      player : player,
      lightDirection: [-0.5, -1.0, 0.5],
      initialized: true,
    });
  }

  /**
   * Change the model selected
   * @param  {Event} event The select change event
   * @return {None}
   */
  selectModel(event){
    var modelSelectdId = event.target.value;
    var selectedModelPosition = this.state.models[modelSelectdId].position;
    var cameraTarget = [selectedModelPosition.x, selectedModelPosition.y, selectedModelPosition.z];
    this.state.camera.setTarget(cameraTarget);
    this.state.player.setRotation(this.state.camera.rotation);
    this.setState({ selectedModel: modelSelectdId });
    this.canvas3D.current.canvas.current.focus();
  }

  resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
   
    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;
   
    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
      var graphicContext = {...this.state.graphicContext};
      graphicContext.width = canvas.width;
      graphicContext.height = canvas.height;
      this.setState({ graphicContext : graphicContext });
    } 
    return needResize;
  }

}



export default App;
