#pragma strict
private var startTime : float = 0;
@HideInInspector
public var bodyStayTime : float = 15.0f;

function Start () {
	startTime = Time.time;
}

function FixedUpdate () {
	if(startTime + bodyStayTime < Time.time){
		this.gameObject.Destroy(gameObject);
	}
}
