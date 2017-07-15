//RemovePrefabRoot.cs by Azuline Studios© All Rights Reserved
using UnityEngine;
using System.Collections;
//deparents child gameObjects and then removes this object
public class RemovePrefabRoot : MonoBehaviour {
	
	public GameObject[] children;

	void Start () {

		for (int i = 0; i < children.Length; i++){
			children[i].transform.parent = null;
			if(i < children.Length - 1){
				continue;
			}else{
				Destroy(gameObject);
			}
		}
		
	}
}
