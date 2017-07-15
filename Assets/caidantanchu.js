private var menuShow:boolean;
public var MouseLook;

 function Start(){

 menuShow=false;

 Screen.showCursor = false;

 }

 function Update (){
 if(Input.GetKeyDown(KeyCode.Tab)){
 //Time.timeScale = 0; 

 
 if(menuShow==false){

 menuShow=true;

 GetComponent (MouseLook).enabled = false;

 Screen.showCursor = true;

 }

 else if (menuShow==true){

 menuShow=false;

 GetComponent (MouseLook).enabled = true;

 Screen.showCursor = false;

 }

 }
 }
 function OnGUI(){

 if(menuShow==false){

 return;

 }

 else if (menuShow==true){
 if(GUI.Button(Rect(Screen.width/2 - 30, Screen.height/2-50,60,30),"Restar")){

 Application.LoadLevel(1);

 menuShow=false;

 }else if(GUI.Button(Rect(Screen.width/2 - 30, Screen.height/2-10,60,30),"Quit")){

 Application.Quit();
 
 
 

 }

 }

 }