//ElevatorCrushCollider.cs by Azuline Studios© All Rights Reserved
using UnityEngine;
using System.Collections;
//script for instant death collider which kills player on contact
public class ElevatorCrushCollider : MonoBehaviour {
	public AudioClip squishSnd;
	private bool fxPlayed;
	void OnTriggerEnter ( Collider col  ){
		FPSPlayer player = col.GetComponent<FPSPlayer>();
		
		if (player && !fxPlayed) {
			player.ApplyDamage(player.maximumHitPoints + 1);
			AudioSource.PlayClipAtPoint(squishSnd, player.transform.position, 0.75f);
			fxPlayed = true;
		}
	}
	
	void Reset (){
		if (collider == null){
			gameObject.AddComponent<BoxCollider>();
			collider.isTrigger = true;
		}
	}
}