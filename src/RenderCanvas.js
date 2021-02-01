import React from 'react';

class WebGLCanvas extends React.Component {

  constructor(props) {
    super(props);
    this.canvas = React.createRef();  
    this.afterinitializationCallback = props.afterinitializationCallback;
  }

  shouldComponentUpdate(nextProps, nextState){
    return false;
  }
  
  render() {
    return (
        <canvas id="3dCanvas" style={{width:'100%', height:'100%' }} ref={this.canvas}></canvas>
    );
  }

  //set the 3D context in the parent component
  componentDidMount() {
    this.canvas.current.height = this.canvas.current.parentElement.clientHeight;
    this.canvas.current.width = this.canvas.current.parentElement.clientWidth;
    this.glContext = this.canvas.current.getContext("webgl");
    this.canvas.current.tabIndex = 1000;
    this.afterinitializationCallback(this.canvas.current, this.glContext);
  }
}

class MapCanvas extends React.Component {

  constructor(props) {
    super(props);
    this.terrain = props.terrain;
    this.canvas = React.createRef();
    this.bufferCanvas = document.createElement('canvas');
    this.afterinitializationCallback = props.afterinitializationCallback;
  }

  shouldComponentUpdate(nextProps, nextState){
    return false;
  }

  render() {
    return (
        <canvas id="mapCanvas" style={{width:'100%', height:'100%' }} ref={this.canvas}></canvas>
    );
  }

  // create the buffer and render it in the view
  componentDidMount() {
    var backBufferContext = this.bufferCanvas.getContext('2d');
    this.bufferCanvas.width = this.terrain.gridWidth;
    this.bufferCanvas.height = this.terrain.gridHeight;
    var imageData = backBufferContext.createImageData(1,1);
    var data  = imageData.data;
    var minHeight = this.terrain.minHeight;
    var maxHeight = this.terrain.maxHeight;
    for(var x=0; x < this.terrain.cells.length; x++){
      for(var y=0; y < this.terrain.cells[x].length; y++){
        var coeff = ((maxHeight - this.terrain.cells[x][y].height)/(maxHeight - minHeight)) * 255;
        data[0] = coeff;
        data[1] = coeff;
        data[2] = coeff
        data[3] = 255;
        backBufferContext.putImageData(imageData, x, y );
      }
    }
    this.frontBufferContext= this.canvas.current.getContext('2d');
    this.frontBufferContext.drawImage(this.bufferCanvas, 0, 0);
    this.afterinitializationCallback(this);
  }

  setPlayerPosition(x, y){
    this.frontBufferContext.drawImage(this.bufferCanvas, 0, 0);
    var imageData = this.frontBufferContext.createImageData(3,3);
    var data  = imageData.data;
    for(var cpt = 0; cpt < 9; cpt++) {
      data[0+cpt] = 255;
      data[1+cpt] = 0;
      data[2+cpt] = 0
      data[3 + cpt] = 150;
    }
    this.frontBufferContext.putImageData(imageData, Math.floor(x/this.terrain.cellSize), Math.floor(y/this.terrain.cellSize) );
  }
}


export {WebGLCanvas, MapCanvas};
