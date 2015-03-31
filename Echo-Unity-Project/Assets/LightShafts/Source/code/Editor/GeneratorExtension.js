#pragma strict
import System;
import System.IO;
import UnityEngine;
import UnityEditor;

	@CustomEditor(LightShaftGenerator)
	


 
//@System.Serializable
class GeneratorExtension extends Editor  {
	
	function Start(){
	
	
	
	 DeleteOldShafts();
	}
	
		//apply only to this generator
		 var CurrentGenerator = Selection.activeGameObject;
		
	
	
/////////////////////////////////////////////////////////////////////////////////////////////////		
		function OnInspectorGUI() {
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//if gizmo folder does not exist create it
if (!Directory.Exists(Application.dataPath+"/Gizmos")){
Directory.CreateDirectory(Application.dataPath+"/Gizmos");
}
//then copy the gizmo into the folder
var info = new DirectoryInfo(Application.dataPath+"/Gizmos");
var fileInfo = info.GetFiles();
if(!File.Exists(Application.dataPath+"/Gizmos/LightShaftGizmo.tif")){
File.Copy(Application.dataPath+"/LightShafts/Source/LightShaftGizmo.tif",Application.dataPath+"/Gizmos/LightShaftGizmo.tif");
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
//--General generator info--//	

				
		//show number of shafts on this generator
		var ShaftCounter:int=0;
		var LoadingString:String="";
		
		//show number of verts on the parent mesh.
		var VertCounter:int=0;
	    
		// shaft counter
		  for (var child : Transform in CurrentGenerator.transform.transform) {
  			 for(var subChild: Transform in child){ 
  			 ShaftCounter++;
  			 }
  			 }
  			 
  			 //count shafts and show load process.
		GUILayout.Label("Shafts casted "+ ShaftCounter);
		if(ShaftCounter==0){
		LoadingString="No shafts casted";
		}

	if(ShaftCounter>1&&ShaftCounter>ShaftCounter-1){
	LoadingString="Casted";
	}
	
	//if not mobile use normal progress bar else change to mobile counting
	if(!CurrentGenerator.GetComponent(LightShaftGenerator).mobile){
		ProgressBar (ShaftCounter/ 100.0, LoadingString);
		}
		else{
		ProgressBar (ShaftCounter/ 1000.0, LoadingString);
		}
		
		//vert counter
		// find all vertices
		if(CurrentGenerator.GetComponent(LightShaftGenerator).CastMesh){
		var mesh : Mesh = CurrentGenerator.GetComponent(LightShaftGenerator).mesh;
		if(!mesh){
		Debug.LogError("Warning! No mesh detected, please insert mesh.");
		}
		if(mesh){
		VertCounter = mesh.vertexCount;
		
		}
		}
		
/////////////////////////////////////////////////////////////////////////////////////////////////////		
//-----preview buttons------//			
		GUILayout.Label("Delete all shafts on this generator");
		
		if(GUILayout.Button("Delete shafts")) {
	DeleteOldShafts();
	}
	
	GUILayout.Label("Preview current settings ");
	   //generate in editor preview
		 if(GUILayout.Button("Preview")) {
			 //first clear all old shafts before refreshing
     		DeleteOldShafts();
			 //generate
			 //Cast mesh
				 if(CurrentGenerator.GetComponent(LightShaftGenerator).CastMesh && CurrentGenerator.GetComponent(LightShaftGenerator).mesh){
				 CurrentGenerator.GetComponent(LightShaftGenerator).MeshCast();
		 		}
			 //if no mesh cast is selected, cast regular
			  else{
        	  CurrentGenerator.GetComponent(LightShaftGenerator).CastSystem();
        	  }
        	  //cast cylinder shape
        	  if( CurrentGenerator.GetComponent(LightShaftGenerator).CastCylinder){
         	  CurrentGenerator.GetComponent(LightShaftGenerator).CylinderCast();
        	  }
           
 //cast cone
 if(CurrentGenerator.GetComponent(LightShaftGenerator).CastCone){
  CurrentGenerator.GetComponent(LightShaftGenerator).ConeCast();
 }

 		}
		GUILayout.Label("");
		
	
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			
///Required Setup
	GUI.contentColor = Color(255,100,0);
	GUILayout.Label(GUIContent ("REQUIRED:","This MUST be setup first before you cast. An error will be thrown out if you forgot or if you have placed a non castable GameObject inside the Transform slot"));
	GUI.contentColor = Color.white;
//Redirect material to generator
CurrentGenerator.GetComponent(LightShaftGenerator).LightShaftMaterial = EditorGUILayout.ObjectField(CurrentGenerator.GetComponent(LightShaftGenerator).LightShaftMaterial , Material, true);
//Redirect mesh to generator
CurrentGenerator.GetComponent(LightShaftGenerator).LightShaftMesh = EditorGUILayout.ObjectField(CurrentGenerator.GetComponent(LightShaftGenerator).LightShaftMesh , GameObject, true);			

		GUILayout.Label("");

///////////////////////////////////////////////////////////////////////////////////////////////	///////////////////////////////////////////////////////////////////////////////////////////////
//-----Phase 1 setup-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//		
	CurrentGenerator.GetComponent(LightShaftGenerator).Phase1 = EditorGUILayout.Foldout(CurrentGenerator.GetComponent(LightShaftGenerator).Phase1, GUIContent ("Phase 1 setup", "Contains the system's cast types."));
	if(CurrentGenerator.GetComponent(LightShaftGenerator).Phase1){
		GUILayout.Label("------------------------------------------------------------------------------");
			GUILayout.Label("Select cast type ");
			GUILayout.Label("None = default Square cast");
		
		//toggle the cast types
		//mesh casting
		CurrentGenerator.GetComponent(LightShaftGenerator).CastMesh=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).CastMesh, GUIContent ("Mesh cast", "Gather data to cast a shaft for every vertex found. This wil not place an object in the scene, it only reads in the position of each vertex point. Overrides: Shaft row x,y,z and Shaft space"));
		if(CurrentGenerator.GetComponent(LightShaftGenerator).CastMesh){
		GUILayout.Label("Place mesh for mesh casting (Overrides shaft space and row value.");
		GUILayout.Label("(amount of casted shafts = amount of vertices)");
		CurrentGenerator.GetComponent(LightShaftGenerator).mesh = EditorGUILayout.ObjectField(CurrentGenerator.GetComponent(LightShaftGenerator).mesh , Mesh, true);
		
		//set Scale
		CurrentGenerator.GetComponent(LightShaftGenerator).MeshScale = EditorGUILayout.FloatField("MeshScale:", CurrentGenerator.GetComponent(LightShaftGenerator).MeshScale);
		GUILayout.Label(" ");
		//outward cast
		CurrentGenerator.GetComponent(LightShaftGenerator).OutwardCast=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).OutwardCast,"Cast outward");
			if(CurrentGenerator.GetComponent(LightShaftGenerator).OutwardCast){
			GUILayout.Label("(Overrides Random Up, Width, Fixed Angle and Shaft space)");
			GUILayout.Label(" ");
			CurrentGenerator.GetComponent(LightShaftGenerator).BackCast=false;
			CurrentGenerator.GetComponent(LightShaftGenerator).SideCast=false;
		}
		
		//BackCasting
		CurrentGenerator.GetComponent(LightShaftGenerator).BackCast=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).BackCast,"Cast from behind");
			if(CurrentGenerator.GetComponent(LightShaftGenerator).BackCast){
			GUILayout.Label("(All functions can be applied, except Shaft space)");
			GUILayout.Label(" ");
			CurrentGenerator.GetComponent(LightShaftGenerator).OutwardCast=false;
			CurrentGenerator.GetComponent(LightShaftGenerator).SideCast=false;
		}
		
		//SideCasting
			CurrentGenerator.GetComponent(LightShaftGenerator).SideCast=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).SideCast,"Cast from the side");
			if(CurrentGenerator.GetComponent(LightShaftGenerator).SideCast){
			GUILayout.Label("(All functions can be applied, except Shaft space)");
			GUILayout.Label(" ");
			CurrentGenerator.GetComponent(LightShaftGenerator).OutwardCast=false;
			CurrentGenerator.GetComponent(LightShaftGenerator).BackCast=false;
		}
	
		
		
		
		//count vertices
		GUILayout.Label("Verts detected on mesh "+ VertCounter);
		
		GUILayout.Label("This is the raw vertex count as the gpu sees it");
		GUILayout.Label("and may differ from your 3D application");
		GUILayout.Label(" ");
		
		CurrentGenerator.GetComponent(LightShaftGenerator).CastCylinder=false;
		}
		else{
		CurrentGenerator.GetComponent(LightShaftGenerator).mesh = null;
		CurrentGenerator.GetComponent(LightShaftGenerator).OutwardCast=false;
			CurrentGenerator.GetComponent(LightShaftGenerator).BackCast=false;
			CurrentGenerator.GetComponent(LightShaftGenerator).SideCast=false;
		}
		//Cone casting
		CurrentGenerator.GetComponent(LightShaftGenerator).CastCone=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).CastCone,GUIContent ("Cone cast", "Collects all the casted shafts and places them in a cone shape. Overrides: shaft space, up angle/spread, width angle/spread, random up/width angle and smooth (does this by default)"));
		if(CurrentGenerator.GetComponent(LightShaftGenerator).CastCone){
		
		GUILayout.Label("Radius overrides shaft space value");
		GUILayout.Label("(amount of shafts is the multiplication of Row x*y*z)");
		
		CurrentGenerator.GetComponent(LightShaftGenerator).CastCylinder=false;
		CurrentGenerator.GetComponent(LightShaftGenerator).CastMesh=false;
		
		//set radius
		CurrentGenerator.GetComponent(LightShaftGenerator).ConeRadius = EditorGUILayout.FloatField("Inner radius:", CurrentGenerator.GetComponent(LightShaftGenerator).ConeRadius);
		CurrentGenerator.GetComponent(LightShaftGenerator).ConeOutRadius = EditorGUILayout.FloatField("Outer radius:", CurrentGenerator.GetComponent(LightShaftGenerator).ConeOutRadius);
		}
		
		//cylinder casting
		CurrentGenerator.GetComponent(LightShaftGenerator).CastCylinder=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).CastCylinder,GUIContent ("Cylinder cast","Collects all shafts and places them in a cylinder. Overrides: shaft space, up/width spread"));
		
		if(CurrentGenerator.GetComponent(LightShaftGenerator).CastCylinder){
		GUILayout.Label("Radius overrides shaft space value");
		GUILayout.Label("(amount of shafts is the multiplication of Row x*y*z)");
		
		CurrentGenerator.GetComponent(LightShaftGenerator).Vortex = GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).Vortex,"Turn cylinder in vortex");
		//set the radius
		CurrentGenerator.GetComponent(LightShaftGenerator).CylinderRadius = EditorGUILayout.FloatField("Radius:", CurrentGenerator.GetComponent(LightShaftGenerator).CylinderRadius);
		
		CurrentGenerator.GetComponent(LightShaftGenerator).CastMesh=false;
		CurrentGenerator.GetComponent(LightShaftGenerator).CastCone=false;
	 	}
		else{
		//vortex cast
		CurrentGenerator.GetComponent(LightShaftGenerator).Vortex = false;
			
		}

//use animation 
 GUILayout.Label("");
 GUILayout.Label("Animation");
CurrentGenerator.GetComponent(LightShaftGenerator).AnimationOn=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).AnimationOn,GUIContent ("New animation/scriptable shaft rotation","ENABLE for scriptable rotation! This will let you set the rotation speed for each shaft's local rotaion. This replaces the old 'file' dependant animation system. This native supported animation will be much more performance friendly."));
			if(CurrentGenerator.GetComponent(LightShaftGenerator).AnimationOn){
			CurrentGenerator.GetComponent(LightShaftGenerator).DynRot = EditorGUILayout.Vector3Field("Rotation speed:", CurrentGenerator.GetComponent(LightShaftGenerator).DynRot);
			}
		
GUILayout.Label("------------------------------------------------------------------------------");
		
		}
		
		
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//						
////////////////////////////////////////////////////////////
//-----Phase 2 setup-----//		
GUILayout.Label("");
CurrentGenerator.GetComponent(LightShaftGenerator).Phase2 = EditorGUILayout.Foldout(CurrentGenerator.GetComponent(LightShaftGenerator).Phase2, GUIContent ("Phase 2 setup", "Contains the shafts's color, range/collision and cast settings"));	
if(CurrentGenerator.GetComponent(LightShaftGenerator).Phase2){

GUILayout.Label("_________________________________________________________");
GUILayout.Label("Color settings:");

//Redirect shaft intensity to generator
CurrentGenerator.GetComponent(LightShaftGenerator).ShaftIntensity = EditorGUILayout.Slider(GUIContent ("Shaft Intensity:","How bright should the shafts be?"),CurrentGenerator.GetComponent(LightShaftGenerator).ShaftIntensity,0.0,1.0);
//Redirect shaft falloff to generator
//if not mobile use these falloff settings else switch
if(!CurrentGenerator.GetComponent(LightShaftGenerator).mobile){
CurrentGenerator.GetComponent(LightShaftGenerator).ShaftFalloff = EditorGUILayout.Slider(GUIContent ("Shaft Falloff:","How sharp should the shaft collide against an object: 0.001 super soft, 1.0 extremely sharp"), CurrentGenerator.GetComponent(LightShaftGenerator).ShaftFalloff,0.1,CurrentGenerator.GetComponent(LightShaftGenerator).MaxCastDistance);
}
else{
CurrentGenerator.GetComponent(LightShaftGenerator).ShaftFalloff = EditorGUILayout.Slider(GUIContent ("Shaft Falloff:","How sharp should the shaft collide against an object: 0.001 super soft, 1.0 extremely sharp"), CurrentGenerator.GetComponent(LightShaftGenerator).ShaftFalloff,0.1,CurrentGenerator.GetComponent(LightShaftGenerator).MaxCastDistance/5);

}
GUILayout.Label("");

//Redirect color values to generator
CurrentGenerator.GetComponent(LightShaftGenerator).ShaftColor = EditorGUILayout.ColorField(GUIContent ("Shaft Color:","The main color of the shaft"), CurrentGenerator.GetComponent(LightShaftGenerator).ShaftColor);
CurrentGenerator.GetComponent(LightShaftGenerator).ShaftWarmth = EditorGUILayout.ColorField(GUIContent("Shaft Warmth:","This color will be combined with the Shaft Color to give it extra tone, red = warmer, blue= colder, this is of course not only limited to those two colors."), CurrentGenerator.GetComponent(LightShaftGenerator).ShaftWarmth);
//Redirect color sampling to generator
 CurrentGenerator.GetComponent(LightShaftGenerator).SampleColor=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).SampleColor,GUIContent ("Sample Color","Disabled when mobile support is on!  Enable real time color sampling which gets blended with the above two values. Note: the object of which is sampled must have a mesh collider attached and the texture has to be set to -Advanced->Read/Write enabled)"));
//only show this part when color sampling is enabled
if(CurrentGenerator.GetComponent(LightShaftGenerator).SampleColor){
//Redirect static sample to generator
 CurrentGenerator.GetComponent(LightShaftGenerator).StaticSample=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).StaticSample,GUIContent ("Static Sample","Only sample color at the start of the first frame. This is ideal for colored static objects like windows, as it gives a good result with no performance cost"));
//Redirect sample distance to generator
CurrentGenerator.GetComponent(LightShaftGenerator).SampleDistance = EditorGUILayout.FloatField(GUIContent ("Sample Distance:","How far (behind) should the generator search for colors (on enabled object, read tooltip from Sample Color)"), CurrentGenerator.GetComponent(LightShaftGenerator).SampleDistance);
	}
	
	GUILayout.Label("");
	GUILayout.Label("Range/Collision settings:");
//Redirect static lightshaft to generator
CurrentGenerator.GetComponent(LightShaftGenerator).StaticLightShafts=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).StaticLightShafts,GUIContent ("Static LightShafts","Disables real-time collision: Recommended for systems that never have to collide with anything or to save memory on mobile devices"));
//Redirect source range to generator
 CurrentGenerator.GetComponent(LightShaftGenerator).SourceRange=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).SourceRange,GUIContent ("Source Range","If enabled the maximum cast distance will be set to the distance of the light source inside the slot below."));
//only show when source range is selected
if (CurrentGenerator.GetComponent(LightShaftGenerator).SourceRange){
//Redirect Light source to generator
CurrentGenerator.GetComponent(LightShaftGenerator).LightSource = EditorGUILayout.ObjectField(CurrentGenerator.GetComponent(LightShaftGenerator).LightSource , Light, true);
}
//only show when source range is false
if(!CurrentGenerator.GetComponent(LightShaftGenerator).SourceRange){
//Redirect max cast distance to generator
CurrentGenerator.GetComponent(LightShaftGenerator).MaxCastDistance = EditorGUILayout.FloatField(GUIContent ("Max Cast Distance:","How far can the maximum distance be for the shafts to be casted (for static cast this will be the first collision point with this range as its max))"), CurrentGenerator.GetComponent(LightShaftGenerator).MaxCastDistance);
}



GUILayout.Label("");
GUILayout.Label(GUIContent ("Shaft cast settings:","These settings control how the system will cast the shafts (amount, fall angle, spread width). Tooltips will tell you which of these settings will be overridden by above settings (mostly by certain cast types)."));
//Redirect ShaftWidth to generator
CurrentGenerator.GetComponent(LightShaftGenerator).ShaftWidth = EditorGUILayout.FloatField(GUIContent ("Shaft Width:","How wide will each shaft be?"), CurrentGenerator.GetComponent(LightShaftGenerator).ShaftWidth);
//Redirect ShaftSpace to generator
CurrentGenerator.GetComponent(LightShaftGenerator).ShaftSpace = EditorGUILayout.FloatField(GUIContent ("Shaft Space:","Distance between each shaft"), CurrentGenerator.GetComponent(LightShaftGenerator).ShaftSpace);
GUILayout.Label("");
//Redirect all axis to generator
CurrentGenerator.GetComponent(LightShaftGenerator).ShaftRowX = EditorGUILayout.FloatField(GUIContent ("Shaft Row X:","Amount of shafts casted allong the X axis"), CurrentGenerator.GetComponent(LightShaftGenerator).ShaftRowX);
CurrentGenerator.GetComponent(LightShaftGenerator).ShaftRowY = EditorGUILayout.FloatField(GUIContent ("Shaft Row Y:","Amount of shafts casted allong the Y axis"), CurrentGenerator.GetComponent(LightShaftGenerator).ShaftRowY);
CurrentGenerator.GetComponent(LightShaftGenerator).ShaftRowZ = EditorGUILayout.FloatField(GUIContent ("Shaft Row Z:","Amount of shafts casted allong the Z axis (in general you want to leave this on 1, Higher numbers will create a 3D cube cast and 0 prevents the system to cast"), CurrentGenerator.GetComponent(LightShaftGenerator).ShaftRowZ);
GUILayout.Label("");

//Redirect all random toggle functions to the generator
 CurrentGenerator.GetComponent(LightShaftGenerator).RandomUpAngle=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).RandomUpAngle,GUIContent ("Random up angle","Casts randomly in all vertical angles, overrides Up angle."));
 CurrentGenerator.GetComponent(LightShaftGenerator).RandomWidthAngle=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).RandomWidthAngle,GUIContent ("Random width angle","Casts randomly in all horizontal angles, overrides Width angle."));


//Redirect all width and up angles/spread to the generator
//if random up is not selected
if(! CurrentGenerator.GetComponent(LightShaftGenerator).RandomUpAngle){
CurrentGenerator.GetComponent(LightShaftGenerator).UpAngle = EditorGUILayout.FloatField(GUIContent ("Up angle:","The vertical angle in which the shafts should be casted 0=straight"), CurrentGenerator.GetComponent(LightShaftGenerator).UpAngle);
CurrentGenerator.GetComponent(LightShaftGenerator).UpSpread = EditorGUILayout.FloatField(GUIContent ("Up spread:","This angle sets the spread falloff, 0=straight"), CurrentGenerator.GetComponent(LightShaftGenerator).UpSpread);
}
//if random up is not selected
if(!CurrentGenerator.GetComponent(LightShaftGenerator).RandomWidthAngle){
CurrentGenerator.GetComponent(LightShaftGenerator).WidthAngle = EditorGUILayout.FloatField(GUIContent ("Width angle:","The horizontal angle in which the shafts should be casted 0=straight"), CurrentGenerator.GetComponent(LightShaftGenerator).WidthAngle);
CurrentGenerator.GetComponent(LightShaftGenerator).WidthSpread = EditorGUILayout.FloatField(GUIContent ("Width spread:","This angle sets the spread falloff, 0=straight"), CurrentGenerator.GetComponent(LightShaftGenerator).WidthSpread);
}

GUILayout.Label("_________________________________________________________");	


//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//						
}

////////////////////////////////////////////////////////////
//-----Phase 3 setup-----//	
GUILayout.Label("");
CurrentGenerator.GetComponent(LightShaftGenerator).Phase3 = EditorGUILayout.Foldout(CurrentGenerator.GetComponent(LightShaftGenerator).Phase3, GUIContent ("Phase 3 setup", "Contains settings to reduce unwanted results and performance enhancment settings."));	
if(CurrentGenerator.GetComponent(LightShaftGenerator).Phase3){
GUILayout.Label("..........................................................................");
GUILayout.Label("Optimizations:");
//Redirect smooth toggle to generator
 CurrentGenerator.GetComponent(LightShaftGenerator).Smooth=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).Smooth,GUIContent ("Smooth","Never cast shafts in the same way as its neighbour. This prevents Moiré effect when watching from the side"));
//Redirect mobile support to generator
 CurrentGenerator.GetComponent(LightShaftGenerator).mobile=GUILayout.Toggle(CurrentGenerator.GetComponent(LightShaftGenerator).mobile,GUIContent ("Mobile/SharedMaterial","Changes the way materials are created, this automatically disables real-time color sampling (if turned on, it will be turned off). Highly recommended for mobile builds or if you are not using any color sampling"));

GUILayout.Label("..........................................................................");												

}
																						
//--------------------------------------------------------------------------------------------------------------------//
										
GUILayout.Label("");
if ( GUI.changed ){

EditorUtility.SetDirty(target);

}
		
	// Show default inspector property editor
	DrawDefaultInspector ();
	}
	
	
	
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	
	
	function DeleteOldShafts(){
	 var CurrentGenerator = Selection.activeGameObject;
			 //first clear all old shafts before refreshing
          var tmpCount:int=CurrentGenerator.transform.childCount;
          if(tmpCount>=1){
          for (var child : Transform in CurrentGenerator.transform) {
		DestroyImmediate(child.gameObject, false);
		}
		}
	}
}
	
	
	
	
		// Custom GUILayout progress bar.
	function ProgressBar (value : float, label : String) {
		// Get a rect for the progress bar using the same margins as a textfield:
		var rect : Rect = GUILayoutUtility.GetRect (18, 18, "TextField");
		EditorGUI.ProgressBar (rect, value, label);
		EditorGUILayout.Space ();
	}
	
	