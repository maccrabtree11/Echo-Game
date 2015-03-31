#pragma strict
import UnityEditor;
import System.IO;

@MenuItem ("GameObject/Create Other/LightShafts",false,-16)



static function SpawnGenerator () {
/*var fwd:Vector3 =  Camera.current.transform.TransformDirection(Vector3.forward);
var hit : RaycastHit;
if(Physics.Raycast(Camera.current.transform.position,fwd, hit, 1000)){
}*/
var ShaftGenerator:GameObject= new GameObject("ShaftGenerator");
ShaftGenerator.AddComponent(LightShaftGenerator);
ShaftGenerator.transform.position=Camera.current.transform.position;
}

