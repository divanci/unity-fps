using UnityEngine;
using System.Collections;
//script for moving a platform horizontally back and fourth
public class MovingPlatform : MonoBehaviour {
	public Transform pointB;
	public Transform pointA;
	public float speed = 1.0f;
	private float direction = 1.0f;

	IEnumerator Start (){
	    while (true) {
	    
			if (transform.position.z < pointA.position.z){
				direction = 1;
			}else{
				if(transform.position.z > pointB.position.z){direction = -1;}
			}
			float delta = Time.smoothDeltaTime * 60;
			transform.Translate(direction  * -speed * delta,0,direction  * speed * delta, Space.World);
				
			yield return 0;
	    }
	}
	
}