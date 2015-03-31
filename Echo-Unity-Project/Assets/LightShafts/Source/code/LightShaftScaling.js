#pragma strict

@script ExecuteInEditMode

//var LightShaftPlane:Transform;
@HideInInspector
var MaxDistance:float=1;
@HideInInspector
var SourceRange:boolean=false;
@HideInInspector
var LightSource:Light;


//Enable color sampling
@HideInInspector
var SampleColor:boolean=false;
//only sample one time
@HideInInspector
var StaticSample:boolean=false;
//set the distance to search for color samples
@HideInInspector
var SampleDistance:float=1;
//Do not edit this color value
@HideInInspector
var SampledColor=Color();
//should the light shaft scale or not?
@HideInInspector
var StaticLightShafts:boolean=false;
private var isCasted:boolean=false;
private var readable:boolean=true;


function Start(){


//if static sample only search the color once
if(SampleColor&& StaticSample){
 	ColorSampler();
 	}
 	
	
}               


function Update () {

     //use lightsource light range as ray distance.
     if(SourceRange){
     //if no lightsource is set in slot it will use the lightsource on the transform itself.
     if(!LightSource){
     //if the parent has a lightsource use that
     if(transform.parent && transform.parent.GetComponent(Light)){
          MaxDistance=transform.parent.GetComponent(Light).range;
          }
          //if no parent search for lightsource on the current transform
          else{
          MaxDistance=transform.GetComponent(Light).range;
          }
          }
          //if lightsource is set use that for range.
          else{
        MaxDistance= LightSource.light.range;
          }
     }
     




//get the distance to scale the plane
//dynamic cast
if(!StaticLightShafts){
var hit: RaycastHit;
var RayDirection= transform.forward;

 if(Physics.Raycast(transform.position, RayDirection, hit,MaxDistance)) {
 transform.localScale.z=hit.distance;
 	}
 	else{
 	 transform.localScale.z=MaxDistance;
 	}
 	}
 	else{
//static cast
	if(!isCasted){
	var hit2: RaycastHit;
	var RayDirection2= transform.forward;

	 if(Physics.Raycast(transform.position, RayDirection2, hit2,MaxDistance)) {
	 transform.localScale.z=hit2.distance;
	  		} 
	  		//if no hit detected within range set scale to default maxdistance
	  		else{
			transform.localScale.z=MaxDistance;
	  		}
	  		
 		isCasted=true;
 		}
 	
 	}
 	
 	if(SampleColor&& !StaticSample){
 	ColorSampler();
 	}
  
  

	
}

//Sample color of image behind the current light shaft and send it to the shader.
function ColorSampler(){
var hit: RaycastHit;
var RayDirection= -transform.forward;

  if(Physics.Raycast(transform.position, RayDirection, hit,SampleDistance)) {
  
  //check if mesh has readable colliders
if(hit.collider.GetType() != MeshCollider){
readable=false;
return;
}
else{
readable=true;
}

//use different material setups if in play mode or edit mode
if(readable){
  var TextureMap: Texture2D = hit.transform.renderer.material.mainTexture;
  
  var pixelUV = hit.textureCoord;
  
  var SampledColor = TextureMap.GetPixelBilinear(pixelUV.x, pixelUV.y);
  
  transform.renderer.material.SetColor("_SampleColor",SampledColor);
  }
}
}
