//InstantDeathCollider.cs by Azuline Studios© All Rights Reserved
//script for instant death collider which kills player or destroys game objects on contact.
using UnityEngine;
using System.Collections;

public class InstantDeathCollider : MonoBehaviour {
	void OnTriggerEnter ( Collider col  ){
		FPSPlayer player = col.GetComponent<FPSPlayer>();
		
		if (player) {
			player.ApplyDamage(player.maximumHitPoints + 1);
		} else if (col.rigidbody) {	
			Destroy(col.rigidbody.gameObject);
		} else {
			Destroy(col.gameObject);
		}
	}
	
	void Reset (){
		if (collider == null){
			gameObject.AddComponent<BoxCollider>();
			collider.isTrigger = true;
		}
	}
}