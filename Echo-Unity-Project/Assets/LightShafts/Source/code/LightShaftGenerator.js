#pragma strict


@script ExecuteInEditMode


// serialize fase properties of the generator extension
	//show fases
	@HideInInspector
	 var Phase1:boolean=false;
	@HideInInspector
	 var Phase2:boolean=false;
	@HideInInspector
	 var Phase3:boolean=false;



//shaft intensity
@HideInInspector
var ShaftIntensity:float=0.07;
//shaft fall off
@HideInInspector
var ShaftFalloff:float=0.221;
//shaft color
@HideInInspector
var ShaftColor: Color=Color(1,1, 1,1);
//shaft warmt
@HideInInspector
var ShaftWarmth: Color=Color(1,1,1,1);
//sample color behind the shaft and blend it in
@HideInInspector
var SampleColor:boolean=false;
//Only sample one time
@HideInInspector
var StaticSample:boolean=false;
//max distance to search for color influence
@HideInInspector
var SampleDistance:float=3;
//do not apply dynamic scaling
@HideInInspector
var StaticLightShafts:boolean=false;


//Should we use the transform of a light source as maximum range? This can be the transform itself, if so leave the lightSource slot empty. If false the MaxDistance will be the MaxDistance
@HideInInspector
var SourceRange:boolean=false;
//use a different light source for maximum range (only if sourceRange is enabled).
@HideInInspector
var LightSource:Light;

//if none of the above then the ray distance is MaxDistance
@HideInInspector
var MaxCastDistance:float=10;

@HideInInspector
var LightShaftMaterial:Material;//Here goes the material for the light shaft system.
@HideInInspector
var LightShaftMesh:GameObject;//here goes the plane or object used for the shaft's shape

@HideInInspector
var ShaftWidth:float=0.15;//the width for each shaft.
@HideInInspector
var ShaftSpace:float=0.05;//the spacing between the next spawned shaft.
@HideInInspector
var ShaftRowX:int=20;//how many shafts should spawn on the X axis?
@HideInInspector
var ShaftRowY:int=20;//how many shafts should spawn on the Y axis?
@HideInInspector
var ShaftRowZ:int=1;//how many shafts should spawn on the Z axis?




//only generator preview can button can acces this
@HideInInspector
var CastMesh:boolean=false;
@HideInInspector
var OutwardCast:boolean=false;
@HideInInspector
var BackCast:boolean=false;
@HideInInspector
var SideCast:boolean=false;
@HideInInspector
var mesh:Mesh;
@HideInInspector
var MeshScale:float=1;
//only generator preview can button can acces this
@HideInInspector
var CastCylinder:boolean=false;
//only generator preview can button can acces this
@HideInInspector
var WallCastXAxis:boolean=false;
 //only generator preview can button can acces this
@HideInInspector
var WallCastYAxis:boolean=false;
//only generator preview can button can acces this
@HideInInspector
var WallCastZAxis:boolean=false;
//deforms cylinder into a vortex
@HideInInspector
var Vortex:boolean=false;
@HideInInspector
var CastCone:boolean=false;
 //only generator preview can button can acces this
@HideInInspector
var CylinderRadius:float=1;
@HideInInspector
var ConeRadius:float=0;
@HideInInspector
var ConeOutRadius:float=0.35;


@HideInInspector
var RandomUpAngle:boolean=false;
@HideInInspector
var RandomWidthAngle:boolean=false;

@HideInInspector
var UpAngle:float=0;
@HideInInspector
var UpSpread:float=0;
@HideInInspector
var WidthAngle:float=0;
@HideInInspector
var WidthSpread:float=0;

@HideInInspector
var Smooth:boolean=true;

@HideInInspector
var AnimationOn:boolean=false;


@HideInInspector
var mobile:boolean=false;

@HideInInspector
var DynRot:Vector3;

//Generate shafts according to user settings
function Start () {
 if( Application.isEditor){ 
 DeleteOldShafts();
 

 }

//check if the application is in play-mode
if( Application.isPlaying){
DeleteOldShafts();



//make sure only one cast type is active
if(CastCylinder && mesh){
Debug.LogError("You can't use two cast types at once");
return;
}


if(mesh){
MeshCast();
}
//normal cast
else{
CastSystem();
}


//cast in cylinder shape
if(CastCylinder && !mesh){
CylinderCast();
}


if(CastCone){
ConeCast();
}
if(CastCone && mesh|| CastCylinder && !mesh){
Debug.LogError("please remove mesh from slot if mesh cast is not used");
}
}

}


function Update(){
 AccurateUV();
 
 //enable dynamic rotation of the shafts trhough scripting.
 if(AnimationOn){

for(var child:Transform in transform){
    for(var subchild:Transform in child){
		subchild.eulerAngles.x=subchild.eulerAngles.x+ DynRot.x;
		subchild.eulerAngles.y=subchild.eulerAngles.y+ DynRot.y;
		subchild.eulerAngles.z=subchild.eulerAngles.z+ DynRot.z;
		}
  }
  
 }
}




//this class will generate the light shafts, only use in the Start function, or make sure it only runs once (if in update, etc...)
function CastSystem(){
//if mobile is on always dissable color sampling
if(mobile){
SampleColor=false;
Debug.Log("You can not use real-time color sampling when SharedMaterial/Mobile mode is active. SampleColor is automatically turned off");
}

 //save parents rotation+
   var parentrot:Quaternion= transform.rotation;
   //set rotation to neutral
   transform.rotation=Quaternion.EulerAngles(0,0,0);

//Warnings
if(!LightShaftMaterial){
Debug.LogError("No LightShaftMaterial detected, please set the material to the slot");
return;
}
if(!LightShaftMesh){
Debug.LogError("No LightShaftMesh detected, please set a mesh in the slot");
return;
}
if(SourceRange&&!LightSource){
Debug.LogError("You enabled Source Range but you have not set a LightSource yet");
return;
}



//child on the generator to sub-child the shafts in for mass deletion and refreshing when clicking preview or delete shafts.
var ShaftContainer:GameObject=new GameObject("NewShaft");
//child it under the caster
ShaftContainer.transform.parent=transform;
ShaftContainer.transform.position=transform.position;
ShaftContainer.transform.rotation=transform.rotation;





for(var z:int=0;z<ShaftRowZ;z++){

for(var a:int=0;a<ShaftRowY;a++){

for(var i:int=0;i<ShaftRowX;i++){
//instantiate according to loop values 
//set position and rotation

  //the object to spawn
var NewShaft:GameObject = Instantiate (LightShaftMesh, transform.position, Quaternion.identity);

NewShaft.transform.position.x= transform.position.x + i * ShaftSpace;
NewShaft.transform.position.y= transform.position.y + a * ShaftSpace;
NewShaft.transform.position.z= transform.position.z + z * ShaftSpace;
//cast to ground angle
NewShaft.transform.localRotation.eulerAngles.x= UpAngle;
NewShaft.transform.localRotation.eulerAngles.y= WidthAngle;

//if cylinder casting is off, set width spread
if(!CastCylinder){
NewShaft.transform.localRotation.eulerAngles.y= Random.Range(-WidthSpread+WidthAngle/2,WidthSpread+WidthAngle/2);
NewShaft.transform.localRotation.eulerAngles.x= Random.Range(-UpSpread+UpAngle/2,UpSpread+UpAngle/2);
}





//set random rotation angle
if(RandomWidthAngle){
NewShaft.transform.localRotation.eulerAngles.y= Random.rotation.eulerAngles.y;
}


//Set a random tilt angle
if(RandomUpAngle){
NewShaft.transform.localRotation.eulerAngles.x= Random.rotation.eulerAngles.x;
}

if(Smooth){
//Rotate each shaft so it doesn't give a rasterized illusion
NewShaft.transform.localRotation.eulerAngles.z=Random.rotation.eulerAngles.z;
}


//set width
NewShaft.transform.localScale.x=ShaftWidth;
//add the realtime scaling script and apply the user settings from editor
NewShaft.AddComponent("LightShaftScaling");
NewShaft.GetComponent(LightShaftScaling).MaxDistance=MaxCastDistance;
NewShaft.GetComponent(LightShaftScaling).LightSource=LightSource;
NewShaft.GetComponent(LightShaftScaling).SourceRange=SourceRange;
NewShaft.GetComponent(LightShaftScaling).SampleColor=SampleColor;
NewShaft.GetComponent(LightShaftScaling).SampleDistance=SampleDistance;
NewShaft.GetComponent(LightShaftScaling).StaticSample=StaticSample;
NewShaft.GetComponent(LightShaftScaling).StaticLightShafts=StaticLightShafts;
//if not meant for mobile use different material per shaft for dyanmic sampling
if(!mobile){
NewShaft.transform.renderer.material=LightShaftMaterial;
NewShaft.transform.renderer.material.SetFloat ("_Intensity", ShaftIntensity);
NewShaft.transform.renderer.material.SetColor ("_ShaftColor", ShaftColor);
NewShaft.transform.renderer.material.SetColor ("_ColorWarmt", ShaftWarmth);
}
else{
NewShaft.transform.renderer.sharedMaterial=LightShaftMaterial;
NewShaft.transform.renderer.sharedMaterial.SetFloat ("_Intensity", ShaftIntensity);
NewShaft.transform.renderer.sharedMaterial.SetColor ("_ShaftColor", ShaftColor);
NewShaft.transform.renderer.sharedMaterial.SetColor ("_ColorWarmt", ShaftWarmth);
}




NewShaft.transform.parent=ShaftContainer.transform;


}

}


}

  //reset rotation of parent
   transform.rotation=parentrot;

}






function DeleteOldShafts(){
	 //first clear all old shafts before refreshing
          var tmpCount:int=transform.childCount;
          
          if(tmpCount>=1){
          for (var child : Transform in transform) {
		DestroyImmediate(child.gameObject, false);
		}
		}
}

function CylinderCast(){
  //save parents rotation+
   var parentrot:Quaternion= transform.rotation;
   //set rotation to neutral
   transform.rotation=Quaternion.EulerAngles(0,0,0);
   //execute generation
       var i:int=0;
    var AllChilds:int=ShaftRowX*ShaftRowY*ShaftRowZ;
    for(var child:Transform in transform){
    for(var subchild:Transform in child){
          i++;
          var angle = i * Mathf.PI * 2 / AllChilds;
          var pos = Vector3 (transform.rotation.y+Mathf.Cos(angle),transform.rotation.z+Mathf.Sin(angle),0) * CylinderRadius;
      	  subchild.position.x=pos.x+child.position.x;
          subchild.position.y=pos.y+child.position.y;
          subchild.position.z=pos.z+child.position.z;
          
           if(Vortex){
          subchild.localRotation=Quaternion.EulerAngles(pos);
          }
          
   }
   }
   //reset rotation of parent
   transform.rotation=parentrot;
}
   
   function ConeCast(){
   //save parents rotation+
   var parentrot:Quaternion= transform.rotation;
   //set rotation to neutral
   transform.rotation=Quaternion.EulerAngles(0,0,0);
   //execute generation
       var i:int=0;
    var AllChilds:int=ShaftRowX*ShaftRowY*ShaftRowZ;
    for(var child:Transform in transform){
    for(var subchild:Transform in child){
          i++;
          var angle = i * Mathf.PI * 2 / AllChilds;
          var pos = Vector3 (transform.rotation.y+Mathf.Cos(angle),transform.rotation.z+Mathf.Sin(angle),0) * ConeRadius;
      	  subchild.position.x=pos.x+child.position.x;
          subchild.position.y=pos.y+child.position.y;
          subchild.position.z=child.position.z;
          subchild.localRotation=Quaternion.EulerAngles(Random.Range(-ConeOutRadius/2,ConeOutRadius/2), Random.Range(-ConeOutRadius/2,ConeOutRadius/2), Random.Range(-ConeOutRadius/2,ConeOutRadius/2));
   }
   }
   //reset rotation of parent
   transform.rotation=parentrot;
   }
   
   
   //this class will generate the light shafts on the vertices of a mesh, only use in the Start function, or make sure it only runs once (if in update, etc...)
function MeshCast(){
//if mobile is on always dissable color sampling
if(mobile){
SampleColor=false;
Debug.Log("You can not use real-time color sampling when SharedMaterial/Mobile mode is active. SampleColor is automatically turned off");
}

//Warnings
if(!LightShaftMaterial){
Debug.LogError("No LightShaftMaterial detected, please set the material to the slot");
return;
}
if(!LightShaftMesh){
Debug.LogError("No LightShaftMesh detected, please set a mesh in the slot");
return;
}
if(SourceRange&&!LightSource){
Debug.LogError("You enabled Source Range but you have not set a LightSource yet");
return;
}



//child on the generator to sub-child the shafts in for mass deletion and refreshing when clicking preview or delete shafts.
var ShaftContainer:GameObject=new GameObject("NewShaft");
//child it under the caster
ShaftContainer.transform.parent=transform;
ShaftContainer.transform.position=transform.position;


// find all vertices
var vertices : Vector3[] = mesh.vertices;

for (var i = 0; i < mesh.vertexCount; i++){

//instantiate according to aount of vertices detected.
//set position and rotation
var pos:Vector3= Vector3(-ShaftContainer.transform.position.x-vertices[i].x*MeshScale,-ShaftContainer.transform.position.y-vertices[i].y*MeshScale,-ShaftContainer.transform.position.z-vertices[i].z*MeshScale);

//the object to spawn
var NewShaft:GameObject = Instantiate (LightShaftMesh, -pos , Quaternion.identity);
//shaft name = vertex number
NewShaft.name=i.ToString();
NewShaft.transform.rotation=ShaftContainer.transform.rotation;



//set rotation to the form the mesh shape
if(OutwardCast){

NewShaft.transform.localRotation.eulerAngles.x= Random.rotation.eulerAngles.x;
NewShaft.transform.localRotation.eulerAngles.y= Random.rotation.eulerAngles.y;

}


if(BackCast){

NewShaft.transform.rotation.x=ShaftContainer.transform.rotation.x;
NewShaft.transform.rotation.y=ShaftContainer.transform.rotation.y;

}

if(SideCast){

NewShaft.transform.LookAt(-ShaftContainer.transform.position-vertices[i]);

}


if(!OutwardCast && !BackCast && !SideCast){
Debug.LogError("Please Select a sub type, BackCast selected as scene filler");
}

//set random rotation angle
if(RandomWidthAngle && !OutwardCast){
NewShaft.transform.localRotation.eulerAngles.y= Random.rotation.eulerAngles.y;
}


//Set a rondom tilt angle
if(RandomUpAngle && !OutwardCast){
NewShaft.transform.localRotation.eulerAngles.x= Random.rotation.eulerAngles.x;
}
//if above is false set a fixed angle
if(!RandomUpAngle && !OutwardCast){
//casting angle
NewShaft.transform.localRotation.eulerAngles.x= UpAngle;
NewShaft.transform.localRotation.eulerAngles.y= WidthAngle;
//casting angle spread
NewShaft.transform.localRotation.eulerAngles.y= Random.Range(-WidthSpread+WidthAngle/2,WidthSpread+WidthAngle/2);
NewShaft.transform.localRotation.eulerAngles.x= Random.Range(-UpSpread+UpAngle/2,UpSpread+UpAngle/2);
}

if(Smooth){
//Rotate each shaft so it doesn't give a rasterized illusion
NewShaft.transform.localRotation.eulerAngles.z=Random.rotation.eulerAngles.z;
}


//set width
NewShaft.transform.localScale.x=ShaftWidth;
//add the realtime scaling script and apply the user settings from editor
NewShaft.AddComponent("LightShaftScaling");
NewShaft.GetComponent(LightShaftScaling).MaxDistance=MaxCastDistance;
NewShaft.GetComponent(LightShaftScaling).LightSource=LightSource;
NewShaft.GetComponent(LightShaftScaling).SourceRange=SourceRange;
NewShaft.GetComponent(LightShaftScaling).SampleColor=SampleColor;
NewShaft.GetComponent(LightShaftScaling).SampleDistance=SampleDistance;
NewShaft.GetComponent(LightShaftScaling).StaticSample=StaticSample;
NewShaft.GetComponent(LightShaftScaling).StaticLightShafts=StaticLightShafts;
//if not meant for mobile use different material per shaft for dyanmic sampling
if(!mobile){
NewShaft.transform.renderer.material=LightShaftMaterial;
NewShaft.transform.renderer.material.SetFloat ("_Intensity", ShaftIntensity);
NewShaft.transform.renderer.material.SetColor ("_ShaftColor", ShaftColor);
NewShaft.transform.renderer.material.SetColor ("_ColorWarmt", ShaftWarmth);
}
else{
NewShaft.transform.renderer.sharedMaterial=LightShaftMaterial;
NewShaft.transform.renderer.sharedMaterial.SetFloat ("_Intensity", ShaftIntensity);
NewShaft.transform.renderer.sharedMaterial.SetColor ("_ShaftColor", ShaftColor);
NewShaft.transform.renderer.sharedMaterial.SetColor ("_ColorWarmt", ShaftWarmth);
}



NewShaft.transform.parent=ShaftContainer.transform;



}
ShaftContainer.transform.rotation=transform.rotation;
}


function AccurateUV(){

for(var child:Transform in transform){
    for(var subchild:Transform in child){
//if not meant for mobile use different material per shaft for dyanmic sampling
 if(!mobile){
  subchild.renderer.material.SetTextureScale ("_MainTex", Vector2(1,subchild.localScale.z/ShaftFalloff));
  }
  else{
  subchild.renderer.sharedMaterial.SetTextureScale ("_MainTex", Vector2(1,subchild.localScale.z/ShaftFalloff));
  }


}
}

}



   //draw the gizmo
 function OnDrawGizmos () {
		Gizmos.DrawIcon (transform.position, "LightShaftGizmo.tif", true);
	}