import React, { useState } from 'react';
import ReactDOM from "react-dom";
import $ from 'jquery'; 

class WebGLCanvas extends React.Component {

  constructor(props) {
    super(props);
    this.canvas = React.createRef();  
    this.state = {
      initialized:false,
    }
  }

  shouldComponentUpdate(nextProps, nextState){
    return !this.state.initialized
  }
  
  render() {
    this.state.initialized = true;
    return (
        <canvas id="c" width="100%" height="100%" ref={this.canvas}></canvas>
    );
  }

  componentDidMount() {
    this.canvas.current.height = this.canvas.current.parentElement.clientHeight;
    this.canvas.current.width = this.canvas.current.parentElement.clientWidth;
    var glContext = this.canvas.current.getContext("webgl");
    this.canvas.current.tabIndex = 1000;
    this.props.afterInit(glContext, this.canvas.current);
    // this.canvas.current.addEventListener('keydown', (e) => {
    //   if (!e.repeat) {
    //     switch(e.key) {
    //       case "ArrowUp": console.log("ArrowUp"); break;
    //       case "ArrowDown": console.log("ArrowDown"); break;
    //       case "ArrowRight": console.log("ArrowRight"); break;
    //       case "ArrowLeft": console.log("ArrowLeft"); break;
    //     }
    //   }

    // });
  }

}

export default WebGLCanvas;
