//DragRigidbody.cs by Azuline Studios© All Rights Reserved
using UnityEngine;
using System.Collections;
//used to spawn NPCs after player picks up an item to set up traps and ambushes
//this script should be excecuted before the AI.js script (set in script excecution order window)
public class MonsterTrigger : MonoBehaviour {
	//NPC objects to deactivate on level load and activate when player walks into trigger (set in inspector)
	public GameObject[] npcsToTrigger;
	
	void Start () {
		//check if there is an NPC is the first index of npcsToTrigger array 
		//to prevent null reference error if the array is empty
		if(npcsToTrigger[0]){
			//deactivate the npcs in the npcsToTrigger array on start up
			foreach (GameObject npc in npcsToTrigger){
				#if UNITY_3_5
					npc.SetActiveRecursively(false);
				#else
					npc.SetActive(false);
				#endif
			}
		}
	}

	void OnTriggerEnter ( Collider col  ){
		if(col.gameObject.tag == "Player" && npcsToTrigger[0]){
			//activate the npcs in the npcsToTrigger array when object is picked up/used by player
			foreach (GameObject npc in npcsToTrigger){
				#if UNITY_3_5
					npc.SetActiveRecursively(true);
				#else
					npc.SetActive(true);
				#endif	
			}
			
			Destroy(transform.gameObject);
		}
	}
}
