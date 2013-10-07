function FogFX(o)
{
	this.enabled = true;
	this.start = 100;
	this.end = 1000;
	this.density = 0.001;
	this.type = FogFX.LINEAR;
	this.color = vec3.fromValues(0.5,0.5,0.5);

	if(o)
		this.configure(o);
}

FogFX.icon = "mini-icon-fog.png";

FogFX.LINEAR = 1;
FogFX.EXP = 2;
FogFX.EXP2 = 3;

FogFX["@color"] = { type: "color" };
FogFX["@density"] = { type: "number", min: 0, max:1, step:0.0001, precision: 4 };
FogFX["@type"] = { type:"enum", values: {"linear": FogFX.LINEAR, "exponential": FogFX.EXP, "exponential 2": FogFX.EXP2 }};


FogFX.prototype.onAddedToNode = function(node)
{
	LEvent.bind(Scene,"fillLightUniforms",this.fillUniforms,this);
	LEvent.bind(Scene,"fillMacros",this.fillMacros,this);
}

FogFX.prototype.onRemovedFromNode = function(node)
{
	LEvent.unbind(Scene,"fillLightUniforms",this.fillUniforms,this);
	LEvent.unbind(Scene,"fillMacros",this.fillMacros,this);
}

FogFX.prototype.fillUniforms = function(e, pass)
{
	if(!this.enabled) return;

	pass.uniforms.u_fog_info = [this.start, this.end, this.density ];

	if(pass.light == pass.lights[0])
		pass.uniforms.u_fog_color = this.color;
	else
		pass.uniforms.u_fog_color = [0,0,0];
}

FogFX.prototype.fillMacros = function(e, pass)
{
	if(!this.enabled) return;

	var macros = pass.macros;
	macros.USE_FOG = ""
	switch(this.type)
	{
		case FogFX.EXP:	macros.USE_FOG_EXP = ""; break;
		case FogFX.EXP2: macros.USE_FOG_EXP2 = ""; break;
	}
}

LS.registerComponent(FogFX);