/**************************************************
Mac Crabtree

EchoTeaCup script, for more complex scenes with multiple objects
	at once. 



Heavily relies on level implementer. Takes the song length,
song pieces, and list of Game Objects to be activated in their 
respective order, this time in a two-dimensional way
which allows for multiple objects to be activated per hit. 
On scene start, randomizes the correct pattern to hit, then waits
for user input. On success hit, the next set of objects is enabled 
and a level of sound is added. On fail hit, all objects are turned off 
and music is muted. 

1/29/15


***********************************************/
using UnityEngine;
using System.Collections;

public class EchoTeaCup : MonoBehaviour {
	public int songLength;	//number of pieces to song
	public int numKeys;		//number of input keys user has
	public int [] song;		//will hold correct song pattern
	
	public int songPiece;	//curr place in song
	public float startTime; //holds starting time, for high scores
	
	public GameObject [] objects = new GameObject[7];
	public GameObject [] objectSound = new GameObject[10];
	//Arrays below hold set of objects for each song piece,
	//currently, 10 is the max, and is set up this way because Unity
	//lacks 2d public array inspecting. Each array holds the set of objects
	//to be activated for each correct hit, 1-10
	public GameObject[] objects1;
	public GameObject[] objects2;
	public GameObject[] objects3;
	public GameObject[] objects4;
	public GameObject[] objects5;
	public GameObject[] objects6;
	public GameObject[] objects7;
	public GameObject[] objects8;
	public GameObject[] objects9;
	public GameObject[] objects10;

	//Will Hold all sets of objects after start
	public TwoDArray[] allObjects;
	public GameObject winner; 	//fireworks, victory light, etc. active on win
	public TwoDArray [] objectArray = new TwoDArray[10];
	
	private bool highScoreChecked;
	void Start () {
		song = new int[songLength];
		
		//build random pattern based on number of input available
		for(int i = 0; i < songLength; i++) {
			song[i] = Random.Range(0, numKeys);
			print(song[i] + "\n");
		}
		
		//objectArray = new TwoDArray[10];
		for(int i = 0; i < 10; i++) objectArray[i] = new TwoDArray();
		print (objectArray [0].objectArray);

	    //assign sets of objects to object array
		objectArray [0].objectArray = objects1;
		objectArray [1].objectArray = objects2;
		objectArray [2].objectArray = objects3;
		objectArray [3].objectArray = objects4;
		objectArray [4].objectArray = objects5;
		objectArray [5].objectArray = objects6;
		objectArray [6].objectArray = objects7;
		objectArray [7].objectArray = objects8;
		objectArray [8].objectArray = objects9;
		objectArray [9].objectArray = objects10;
		
		highScoreChecked = false;

		
		//turn off all objects to start
		for(int i = 0; i < objectArray.Length; i++) {
			for(int j = 0; j < objectArray[i].objectArray.Length; j++) {
				objectArray[i].objectArray[j].SetActive (false);
			}
		}
		
		//mute all sounds initially
		for(int i = 0; i < objectSound.Length; i++) {
			objectSound[i].SetActive (true);
			objectSound[i].GetComponent<AudioSource>().mute = true;
		}
		//winner.SetActive (false);
		songPiece = 0;
		startTime = Time.time;
	}
	
	
	//check which input device is being used
	public bool keyboard;
	public bool drums;
	public bool dancepad;
	
	
	
	// Update is called once per frame
	void Update () {
		if(Input.anyKeyDown) print (Input.inputString);
		
		if(keyboard) {
			if(songPiece == songLength) {
				Win();
				if(Input.anyKeyDown) Fail ();
			} else {
				
				if (Input.GetKeyDown ("a")) {
					if(song[songPiece] == 0) Success ();
					else Fail ();
				} else if(Input.GetKeyDown ("s")) {
					if(song[songPiece] == 1) Success ();
					else Fail ();
				} else if(Input.GetKeyDown ("d")) {
					if(song[songPiece] == 2) Success();
					else Fail ();
				} else if(Input.GetKeyDown ("f")) {
					if(song[songPiece] == 3) Success();
					else Fail ();
				} else if(Input.GetKeyDown ("g")) {
					if(song[songPiece] == 4) Success ();
					else Fail ();
				} else if(Input.GetKeyDown ("h")) {
					if(song[songPiece] == 5) Success ();
					else Fail ();
				} else if(Input.anyKeyDown) {
					Fail ();
				}
			}
		} else if(drums){
			if(songPiece == songLength) {
				Win();
				if(Input.anyKeyDown) Fail ();
			} else {
				
				if(Input.GetKeyDown (KeyCode.JoystickButton1)) {
					if(song[songPiece] == 0) Success ();
					else Fail ();
				} else if(Input.GetKeyDown (KeyCode.JoystickButton2)) {
					if(song[songPiece] == 1) Success ();
					else Fail ();
				} else if(Input.GetKeyDown (KeyCode.JoystickButton3)) {
					if(song[songPiece] == 2) Success ();
					else Fail ();
				} else if(Input.GetKeyDown (KeyCode.JoystickButton4)) {
					if(song[songPiece] == 3) Success ();
					else Fail ();
				} else if(Input.anyKeyDown) {
					if(song[songPiece] == 4) Success ();
					else Fail ();
				}
				Vector3 acceleration = Vector3.zero;
				foreach(AccelerationEvent accEvent in Input.accelerationEvents) {
					acceleration += accEvent.acceleration * accEvent.deltaTime;
				}
				print (acceleration);
			}
			
			
		} else if(dancepad) {
			if(songPiece == songLength) {
				Win();
				if(Input.anyKeyDown) Fail ();
			} else {
				
				if(Input.GetAxis("Vertical") > 0) {
					if(song[songPiece] == 0) Success ();
					else Fail ();
				} else if(Input.GetAxis("Vertical") < 0) {
					if(song[songPiece] == 1) Success ();
					else Fail ();
				} else if(Input.GetAxis ("Horizontal") > 0) {
					if(song[songPiece] == 2) Success ();
					else Fail ();
				} else if(Input.GetAxis ("Horizontal") < 0) {
					if(song[songPiece] == 3) Success ();
					else Fail ();
				} else if(Input.anyKeyDown) {
					if(song[songPiece] == 4) Success ();
					else Fail ();
				}
			}
		}
	}
	void Win() {
		//winner.SetActive (true);
		//
		if(!highScoreChecked){
			if((Time.time - startTime) < PlayerPrefs.GetFloat ("HighScore1")) {
				float original = PlayerPrefs.GetFloat ("HighScore1");
				PlayerPrefs.SetFloat ("HighScore1", Time.time -startTime);
				PlayerPrefs.SetFloat ("HighScore2", original);
			} else if((Time.time - startTime) < PlayerPrefs.GetFloat ("HighScore2")) {
				PlayerPrefs.SetFloat ("HighScore2", Time.time - startTime);
			}
			highScoreChecked = true;
		}
		print ("User win");
	}

	//Successful hit function
	void Success() {

		//turn on next set of objects
		for(int i = 0; i < objectArray[songPiece].objectArray.Length; i++)
			objectArray[songPiece].objectArray[i].SetActive (true);
	
		
		//unmute next level of sound
		objectSound [songPiece].GetComponent<AudioSource> ().mute = false;
	
		//increment song place
		songPiece++;
		print ("Win hit\n");
		
		
	}
	
	
	//Failure hit, wrong pattern
	void Fail() {
		if(songPiece == songLength) songPiece--;
		
		//remute all layers of sound
		for(int i = songPiece; i >= 0; i--) {
			objectSound[i].GetComponent<AudioSource>().mute = true;
		}
		
		//disable each set of objects from the song piece
		for(int j = songPiece; j >= 0; j--)
			for(int i = 0; i < objectArray[j].objectArray.Length; i++) 
				objectArray[j].objectArray[i].SetActive (false);
		
		//reset current position tracker
		songPiece = 0;
		
		
		print ("Fail hit");
		
		//Place failure sound here, failure animation, etc.
		
	}
	
	void OnGUI() {
		GUI.backgroundColor = Color.black;
		GUI.Box (new Rect (Screen.width / 2, 0, 100, 25), (Time.time - startTime).ToString ());
		GUI.Box (new Rect(Screen.width-100, 0, 100, 100), PlayerPrefs.GetFloat ("HighScore1").ToString () + "\n" + PlayerPrefs.GetFloat ("HighScore2").ToString());
		//High Score Box
		
	}
}
