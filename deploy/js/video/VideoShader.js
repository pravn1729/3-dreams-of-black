var DistortUniforms = {

  "aspect": { type: "f", value: 0 },
  "map": { type: "t", value: 0, texture: null },
  "colorScale": { type: "f", value: 1 },
  "threshold": { type: "f", value: 0.5 },
  "alphaFadeout": { type: "f", value: 0.5 },
  "mouseXY": { type: "v2", value: new THREE.Vector2() },
  "trail0": { type: "v2", value: new THREE.Vector2() },
  "trail1": { type: "v2", value: new THREE.Vector2() },
  "trail2": { type: "v2", value: new THREE.Vector2() },
  "trail3": { type: "v2", value: new THREE.Vector2() },
  "trail4": { type: "v2", value: new THREE.Vector2() },
  "mouseSpeed": { type: "v2", value: new THREE.Vector2() },
  "mouseRad": { type: "f", value: 1. }

};


var DistortShaderFragmentPars = [

    "uniform sampler2D map;",
    "uniform float colorScale;",
    "uniform float threshold;",
    "uniform float alphaFadeout;",

    "varying vec2 vUv;",
    "varying vec2 vUvPoly;",
    "varying float distancePoly;",
    "varying float distance;",
    "varying vec2 closestPoly;"

].join("\n");

var DistortVertexShader = [

    "uniform vec2 mouseXY;",
    "uniform vec2 trail0;",
    "uniform vec2 trail1;",
    "uniform vec2 trail2;",
    "uniform vec2 trail3;",
    "uniform vec2 trail4;",
    "uniform float aspect;",
    "uniform vec2 mouseSpeed;",
    "uniform float mouseRad;",

    "varying vec2 vUv;",
    "varying vec2 vUvPoly;",
    "varying float distance;",
    "varying float distancePoly;",

    "varying vec2 closestPoly;",

    "vec2 getClosest(vec2 p, vec2 l1, vec2 l2){",
    
        "vec2 pl1 = p - l1;",
        "vec2 l2l1 = l2 - l1;",

        "float dot = pl1.x * l2l1.x + pl1.y * l2l1.y;",
        "float len_sq = pow(length(l2l1),2.);",
        "float param = dot / len_sq;",

        "if(param < 0.) return l1;",
        "else if(param > 1.) return l2;",
        "else return (l1 + l2l1 * param);",
    "}",

    "float getDistance(vec2 p, vec2 li){",
        "return max(0., 1. - sqrt( (p.x-li.x)*(p.x-li.x) + (p.y-li.y)*(p.y-li.y) ) );",
    "}",

    "void main() {",

        "vUv = uv;",

        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "vUvPoly = uv+vec2(normal.x,normal.y);",
        "vec4 glPosPoly = projectionMatrix * modelViewMatrix * vec4( position-vec3(-normal.x,normal.y,0.), 1.0 );",

        "vec2 projPos = vec2(aspect,1.)*vec2(gl_Position.x/gl_Position.z,gl_Position.y/gl_Position.z);",
        "vec2 projPosPoly = vec2(aspect,1.)*vec2(glPosPoly.x/glPosPoly.z,glPosPoly.y/glPosPoly.z);",

        "float distRand = normal.z+.5;",
        "vec2 closestTrailPoly1 = getClosest(projPosPoly,trail0,trail1);",
        "vec2 closestTrailPoly2 = getClosest(projPosPoly,trail1,trail2);",
        "vec2 closestTrailPoly3 = getClosest(projPosPoly,trail2,trail3);",
        "vec2 closestTrailPoly4 = getClosest(projPosPoly,trail3,trail4);",

        "float distanceTrailPoly1 = 1.0*mouseRad*distRand * getDistance(projPosPoly,closestTrailPoly1);",
        "float distanceTrailPoly2 = 0.9*mouseRad*distRand * getDistance(projPosPoly,closestTrailPoly2);",
        "float distanceTrailPoly3 = 0.8*mouseRad*distRand * getDistance(projPosPoly,closestTrailPoly3);",
        "float distanceTrailPoly4 = 0.7*mouseRad*distRand * getDistance(projPosPoly,closestTrailPoly4);",

        "distancePoly = max(distanceTrailPoly1,max(distanceTrailPoly2,max(distanceTrailPoly3,distanceTrailPoly4)));",

        //"vec2 closestTrail1 = getClosest(projPos,trail0,trail1);",
        //"vec2 closestTrail2 = getClosest(projPos,trail1,trail2);",
        //"vec2 closestTrail3 = getClosest(projPos,trail2,trail3);",
        //"vec2 closestTrail4 = getClosest(projPos,trail3,trail4);",

        //"float distanceTrail1 = 0.9*mouseRad * getDistance(projPos,closestTrail1);",
        //"float distanceTrail2 = 0.8*mouseRad * getDistance(projPos,closestTrail2);",
        //"float distanceTrail3 = 0.7*mouseRad * getDistance(projPos,closestTrail3);",
        //"float distanceTrail4 = 0.6*mouseRad * getDistance(projPos,closestTrail4);",


        //+normalize(closestTrail2)+normalize(closestTrail3)+normalize(closestTrail4);",
        //"gl_Position.xy = gl_Position.xy + normalize(projPos-trail0)*vec2(distanceTrail1*100.);",
        //"gl_Position.xy += normalize(projPos-closestTrail2)*vec2((distanceTrail2)*100.);",
        //"gl_Position.xy += normalize(projPos-closestTrail3)*vec2((distanceTrail3)*100.);",
        //"gl_Position.xy += normalize(projPos-closestTrail4)*vec2((distanceTrail4)*100.);",

        "distance = mouseRad*max(0.,1.-length(projPos-trail0));",
        "gl_Position.xy = gl_Position.xy + normalize(projPos.xy-trail0)*vec2(distance*100.);",
        "gl_Position.xy = gl_Position.xy -mouseSpeed.xy*pow(distance,2.)*100.;",

    "}"


    
].join("\n");


var VideoShaderSource = {
	opaque: {

		uniforms: {
			"map" : { type: "t", value: 0, texture: null }
		},

		vertexShader: [
			"varying vec2 vUv;",

			"void main() {",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"vUv = uv;",
			"}"
		].join("\n"),

		fragmentShader: [
			"uniform sampler2D map;",
			"varying vec2 vUv;",
			
			"void main() {",				
				"gl_FragColor = texture2D( map, vUv );",
			"}"
		].join("\n")

	},
	
	keyedInverse: {

		uniforms: {
			"map" : { type: "t", value: 0, texture: null },
			"colorScale": { type: "f", value: 1 },
			"threshold": { type: "f", value: 0.5 },
			"alphaFadeout": { type: "f", value: 0.5 }
		},

		vertexShader: [
			"varying vec2 vUv;",
			"uniform bool flip;",

			"void main() {",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"vUv = uv;",
			"}"
		].join("\n"),

		fragmentShader: [
			"uniform sampler2D map;",
			"uniform float colorScale;",
			"uniform float threshold;",
			"uniform float alphaFadeout;",
			
			"varying vec2 vUv;",

			"void main() {",
				"vec3 cs = vec3(colorScale);",				
				"vec4 c = texture2D( map, vUv );",
				"float t = c.x + c.y + c.z;",
				"float alpha = 1.0;",
				"if( t > threshold )",
					"alpha = 0.0;//(1.0 - (t - 2.0)) * alphaFadeout;",
				"gl_FragColor = vec4( c.xyz * cs, alpha );",
			"}"
		].join("\n")
	},
	
	halfAlpha : {

		uniforms: {
			"map": { type: "t", value: 0, texture: null }
		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"vUv = uv;",
			"}"

		].join("\n"),

		fragmentShader: [
			"uniform sampler2D map;",

			"varying vec2 vUv;",

			"void main() {",
				"vec4 c = texture2D( map, vec2( vUv.x * 0.5, vUv.y ) );",
				"vec4 a = texture2D( map, vec2( 0.5 + vUv.x * 0.5, vUv.y ) );",
				"gl_FragColor = vec4(c.rgb, a.r);",
			"}"

		].join("\n")

	},
	
	distortSmartalpha: {

		uniforms:DistortUniforms,

		vertexShader: DistortVertexShader,

		fragmentShader: [

      		DistortShaderFragmentPars,

			"void main() {",
				"vec4 c = texture2D( map, vec2( vUv.x * 0.6666, vUv.y ) );",
				"vec4 a = texture2D( map, vec2( 0.6666 + vUv.x * 0.3333, vUv.y ) );",
				"c.a = a.r;",

				"vec4 cPoly = texture2D( map, vec2( vUvPoly.x * 0.6666, vUvPoly.y ) );",
				"vec4 aPoly = texture2D( map, vec2( 0.6666 + vUvPoly.x * 0.3333, vUvPoly.y ) );",
				"cPoly.a = aPoly.r;",
				
				"if ((distancePoly)>0.5) c = cPoly; ",
        "gl_FragColor = c;",//vec4(vec3(distancePoly),1.);//
			"}"

		].join("\n")

	},

	smartAlpha : {

		uniforms: {
			"map": { type: "t", value: 0, texture: null }
		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"vUv = uv;",
			"}"

		].join("\n"),

		fragmentShader: [
			"uniform sampler2D map;",

			"varying vec2 vUv;",

			"void main() {",
				"vec4 c = texture2D( map, vec2( vUv.x * 0.6666, vUv.y ) );",
				"vec4 a = texture2D( map, vec2( 0.6666 + vUv.x * 0.3333, vUv.y ) );",
				"gl_FragColor = vec4(c.rgb, a.r);",
			"}"

		].join("\n")

	},
	
	keyed: {

		uniforms: {
			"map" : { type: "t", value: 0, texture: null },
			"colorScale": { type: "f", value: 1 },
			"threshold": { type: "f", value: 0.5 },
			"alphaFadeout": { type: "f", value: 0.5 }
		},

		vertexShader: [
			"varying vec2 vUv;",
			"uniform bool flip;",

			"void main() {",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"vUv = uv;",
			"}"
		].join("\n"),

		fragmentShader: [
			"uniform sampler2D map;",
			"uniform float colorScale;",
			"uniform float threshold;",
			"uniform float alphaFadeout;",
			
			"varying vec2 vUv;",

			"void main() {",
				"vec3 cd = vec3(1.0 - colorScale);",
				"vec3 cs = vec3(colorScale);",				
				"vec4 c = texture2D( map, vUv );",
				"float t = c.x + c.y + c.z;",
				"float alpha = 1.0;",
				"if( t < threshold )",
					"alpha = t / alphaFadeout;",
				"gl_FragColor = vec4( (c.xyz - cd) * cs, alpha );",
				//"gl_FragColor = vec4( c.xyz, alpha );",
			"}"
		].join("\n")
	},
	
	distortOpaque: {

		uniforms:DistortUniforms,

		vertexShader: DistortVertexShader,

		fragmentShader: [

      DistortShaderFragmentPars,

			"void main() {",
				"vec4 c = texture2D( map, vec2( vUv.x, vUv.y ) );",
                "vec4 cPoly = texture2D( map, vec2( vUvPoly.x, vUvPoly.y ) );",
                "if ((distancePoly)>0.5) c = cPoly; ",
                "else gl_FragColor = c;",
			"}"

		].join("\n")

	},
	
	distortKeyed : {

		uniforms: DistortUniforms,

		vertexShader: DistortVertexShader,

		fragmentShader: [
      DistortShaderFragmentPars,

			"void main() {",
				"vec4 c = texture2D( map, vec2( vUv.x, vUv.y ) );",
                "vec4 cPoly = texture2D( map, vec2( vUvPoly.x, vUvPoly.y ) );",
                "if ((distancePoly)>0.5) c = cPoly; ",
                "if (c.a<=0.1) {",
				"	discard;",
				"} else {",
				"	vec3 cd = vec3(1.0 - colorScale);",
				"	vec3 cs = vec3(colorScale);",
				"	float t = c.x + c.y + c.z;",
				"	float alpha = 1.0;",
				"	if( t < threshold )",
				"		alpha = t / alphaFadeout;",
				"	gl_FragColor = vec4( (c.xyz - cd) * cs, alpha );",
				"}",
			"}"

		].join("\n")

	}

};
