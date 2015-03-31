/*****************************************

Mac Crabtree


Echo Main Mechanic Script.

Heavily relies on level implementer. Takes the song length,
song pieces, and list of Game Objects to be activated in their 
respective order. On scene start, randomizes the correct pattern
to hit, then waits for user input. On success hit, the next object
is enabled and a level of sound is added. On fail hit, all objects are
turned off and music is muted. 


1/29/2015


**************************************/
using UnityEngine;
using System.Collections;

public class EchoMain : MonoBehaviour {
	public int songLength;		//how many pieces to song
	public int numKeys;			//number of input keys available
	public int [] song;			//will hold the correct song pattern
	
	public int songPiece;		//current place
	public float startTime;
	public GameObject [] objects = new GameObject[7];	//obj to turn on
	public GameObject [] objectSound = new GameObject[10]; //songs to be activated
	public GameObject winner;	//winning piece. fireworks, victory light, etc.


	private bool highScoreChecked;
	
	void Start () {
		song = new int[songLength];
		for(int i = 0; i < songLength; i++) {
			song[i] = Random.Range(0, numKeys);
			//randomize song pattern
			print(song[i] + "\n");
			//print in log (to cheat)
		}



		highScoreChecked = false;
		//PlayerPrefs.SetFloat ("HighScore1", 49.67f);
		//PlayerPrefs.SetFloat ("HighScore2", 62.44f);
		//PlayerPrefs.SetFloat ("HighScore3", 400f);
		
		//make sure all objects start as off
		for(int i = 0; i < objects.Length; i++) {
			objects[i].SetActive (false);
			objectSound[i].SetActive (true);
			objectSound[i].GetComponent<AudioSource>().mute = true;
		}

		winner.SetActive (false);		//winning piece, fireworks, etc.
		songPiece = 0;					//start at 0
		startTime = Time.time;			//grab start time for high score checking
	}

	//check which input device being used
	public bool keyboard;
	public bool drums;
	public bool dancepad;
	// Update is called once per frame
	void Update () {
		//if(Input.anyKeyDown) print (Input.inputString);

		if(keyboard) {	//keyboard handler
			if(songPiece == songLength) {
				Win();
				if(Input.anyKeyDown) Fail ();
			} else {
				//0 = a, 1 = s, 2 = d, 3 = e, 4 = f, 5 = g
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
		winner.SetActive (true);
		//check for high score
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

	void Success() {

		objects [songPiece].SetActive (true);  	//turn on next piece
		//objectSound [songPiece].SetActive (true);
		objectSound [songPiece].GetComponent<AudioSource> ().mute = false;
		//unmute sound layer
		songPiece++;	//increment place in song
		print ("Win hit\n");


	}



	void Fail() {
		if(songPiece == songLength) songPiece--;
		for(int i = songPiece; i >= 0; i--) {
			objects[i].SetActive (false);
			//objectSound[i].SetActive (false);
			objectSound[i].GetComponent<AudioSource>().mute = true;
		}
		songPiece = 0;
		print ("Fail hit");

		//Place failure sound here, failure animation, etc.

	}

	void OnGUI() {
		GUI.backgroundColor = Color.black;
		GUI.Box (new Rect (Screen.width / 2, 0, 100, 25), (Time.time - startTime).ToString ());
		GUI.Box (new Rect(Screen.width-100, 0, 100, 100), PlayerPrefs.GetFloat ("HighScore1").ToString () + "\n" + PlayerPrefs.GetFloat ("HighScore2").ToString());
		//high score box

	}
}
