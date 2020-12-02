import React from 'react';
import Slider from 'react-input-slider';
import {Knob} from "react-rotary-knob";

class TransformationPanel extends React.Component {

	// the constructor: initialize the state
  	constructor(props){
    	super(props);
    	this.state = {
    		selectedModel: props.selectedModel,
    	}

	}
	
	//component render
	render() {
		return (
			<>
		    { this.state.selectedModel != null &&
			    <div>
		    		<div>
						<fieldset>
							<legend>position</legend>
							<div>
								x: { this.state.selectedModel.position.x }
								<Slider
									axis="x"
									xstep={1}
									xmin={-200}
									xmax={200}
									x={ this.state.selectedModel.position.x}
									onChange={
									  ({ x }) => {
									    var newState = {
									      ...this.state
									    };
									    newState.selectedModel.position.x = x;
									    this.setState(newState);
									  }
									}
								/>
							</div>
							<div>
								y: { this.state.selectedModel.position.y }
								<Slider
									axis="x"
									xstep={1}
									xmin={-200}
									xmax={200}
									x={this.state.selectedModel.position.y}
									onChange={
									  ({ x }) => {
									    var newState = {
									      ...this.state
									    };
									    newState.selectedModel.position.y = x;
									    this.setState(newState);
									  }
									}
								/>
							</div>
							<div>
								z: { this.state.selectedModel.position.z }			
								<Slider
									axis="x"
									xstep={1}
									xmin={-200}
									xmax={200}
									x={this.state.selectedModel.position.z}
									onChange={
									  ({ x }) => {
									    var newState = {
									      ...this.state
									    };
									    newState.selectedModel.position.z = x;
									    this.setState(newState);
									  }
									}
								/>
							</div>
						</fieldset>
					</div>
					<div>
						<fieldset>
							<legend>scale</legend>
							<div>
								x: { this.state.selectedModel.scale.x }
								<Slider
									axis="x"
									xstep={1}
									xmin={1}
									xmax={20}
									x={ this.state.selectedModel.scale.x }
									onChange={
									  ({ x }) => {
									    var newState = {
									      ...this.state
									    };
									    newState.selectedModel.scale.x = x;
									    this.setState(newState);
									  }
									}
								/>
							</div>
							<div>
								y: {this.state.selectedModel.scale.y }
								<Slider
									axis="x"
									xstep={1}
									xmin={1}
									xmax={20}
									x={ this.state.selectedModel.scale.y }
									onChange={
									  ({ x }) => {
									    var newState = {
									      ...this.state
									    };
									    newState.selectedModel.scale.y = x;
									    this.setState(newState);
									  }
									}
								/>
							</div>
							<div>
								z: {this.state.selectedModel.scale.z }
								<Slider
									axis="x"
									xstep={1}
									xmin={1}
									xmax={20}
									x={this.state.selectedModel.scale.z}
									onChange={
									  ({ x }) => {
									    var newState = {
									      ...this.state
									    };
									    newState.selectedModel.scale.z = x;
									    this.setState(newState);
									  }
									}
								/>
							</div>
						</fieldset>
					</div>

					<div>
						<fieldset>
							<legend>rotation</legend>
						  	x: 
						    <div style={{display:'inline-block'}}>
							    <Knob 
							        onChange={this.changeRotationValueX.bind(this)}
							        min={0} 
							        max={360} 
							        value={this.state.selectedModel.rotation.x}
							    />
							</div>
							y: 
						    <div style={{display:'inline-block'}}>
						      	<Knob 
							        onChange={this.changeRotationValueY.bind(this)}
							        min={0} 
							        max={360} 
							        value={this.state.selectedModel.rotation.y}
							    />
						    </div>
							z: 
						    <div style={{display:'inline-block'}}>
						    	<Knob 
							        onChange={this.changeRotationValueZ.bind(this)}
							        min={0} 
							        max={360} 
							        value={this.state.selectedModel.rotation.z}
							    />
							</div>
						</fieldset>
					</div>
				</div>
			}
			</>
	    );
	}

	//handler for rotationX value change
  	changeRotationValueX(rotationAngleDegree) {
	    var newState = {
	      ...this.state
	    };
	    newState.selectedModel.rotation.x = rotationAngleDegree;
	    this.setState(newState);
	  }

	//handler for rotationY value change
	changeRotationValueY(rotationAngleDegree) {
		var newState = {
		  ...this.state
		};
		newState.selectedModel.rotation.y = rotationAngleDegree;
		this.setState(newState);
	}

	//handler for rotationZ value change
	changeRotationValueZ(rotationAngleDegree) {
		var newState = {
		  ...this.state
		};
		newState.selectedModel.rotation.z = rotationAngleDegree;
		this.setState(newState);
	}
}

export default TransformationPanel;