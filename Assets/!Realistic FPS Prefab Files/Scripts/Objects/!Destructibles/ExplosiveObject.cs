//ExplosiveObject.cs by Azuline Studios© All Rights Reserved
using UnityEngine;
using System.Collections;
//set up and detonation of explosive objects
public class ExplosiveObject : MonoBehaviour {
	public float hitPoints = 100;//when hit points of object are depleted, object will explode
	public float explosionDamage = 200.0f;//maximum damage dealt at center of explosion (damage decreases from center)
	public float damageDelay = 0.2f;//delay before this object applies explosion force and damage to other objects;
	private float explosionDamageAmt;//actual explosion damage amount
	public float blastForce = 15.0f;//explosive physics force applied to objects
	public Transform explosionEffect;//particle effect object to use for explosion
	public float explosionHeight = 0.4f;//height of explosion effect
	public float shockwaveHeight = 0.45f;//height of explosion effect
	public float radius = 7.0f;//radius of explosion
	public LayerMask blastMask;//should be layers 9,10,11,12,13
	private Transform myTransform;
	private bool detonated;
	private bool audioPlayed;
	private RaycastHit hit;
	
	void Start (){
		myTransform = transform;
	}
	
	void FixedUpdate(){
		if(audioPlayed){//destroy object after sound has finished playing
			if(!audio.isPlaying){
				Destroy(myTransform.gameObject);	
			}
		}
	}
	
	//find objects in blast radius, apply damage and physics force, and remove explosive object
    IEnumerator Detonate() {

		//play explosion effects and apply explosion damage and force after damageDelay
		yield return new WaitForSeconds(damageDelay);
		
		Vector3 explodePos;
		
		//play explosion effects
		if(explosionEffect){
		    foreach (Transform child in explosionEffect){//emit all particles in the particle effect game object group stored in explosionEffect var
				
				if(child.name == "Shockwave"){
					explodePos = new Vector3(myTransform.position.x, myTransform.position.y + shockwaveHeight, myTransform.position.z);
					child.particleEmitter.transform.position = explodePos;
				}else{
					explodePos = new Vector3(myTransform.position.x, myTransform.position.y + explosionHeight, myTransform.position.z);
					child.particleEmitter.transform.position = explodePos;	
				}
				child.particleEmitter.transform.rotation = Quaternion.FromToRotation(Vector3.up, Vector3.up);//rotate effects so they are vertical
				child.particleEmitter.Emit();//emit the particle(s)
			}
		}
		
		myTransform.GetComponent<MeshRenderer>().enabled = false;
		audio.pitch = Random.Range(0.75f * Time.timeScale, 1.0f * Time.timeScale);//add slight random value to sound pitch for variety
		audio.Play();
		audioPlayed = true;
		
		//find surrounding objects to be damaged by explosion
        Collider[] hitColliders = Physics.OverlapSphere(myTransform.position, radius, blastMask);
		//apply damage and force to surrounding objects
		for(int i = 0; i < hitColliders.Length; i++){
			
			//don't call ApplyDamage on this explosive object
			if(hitColliders[i].transform != transform
			//don't damage or apply force to object if it is shielded/hidden from blast by other object
			&& (Physics.Linecast(hitColliders[i].transform.position, myTransform.position, out hit, blastMask) 
			&& hit.collider == myTransform.collider)){
				explosionDamageAmt = explosionDamage * Mathf.Clamp01((1.0f - (myTransform.position - hitColliders[i].transform.position).magnitude / radius));//make damage decrease by distance from center
            	if(explosionDamageAmt >= 1){
					hitColliders[i].SendMessageUpwards("ApplyDamage", explosionDamageAmt, SendMessageOptions.DontRequireReceiver);//call ApplyDamage() function of objects in radius
				}
				//apply explosion force
				if (hitColliders[i].transform.rigidbody){
                	hitColliders[i].transform.rigidbody.AddExplosionForce(blastForce * hitColliders[i].transform.rigidbody.mass, myTransform.position, radius, 3.0F, ForceMode.Impulse);
				}
			}
			
			if(i < hitColliders.Length - 1){
				continue;
			}else{//if all objects have been damaged by blast, disable collider (it was needed for the line cast above)
				myTransform.GetComponent<MeshCollider>().enabled = false;
				
			}
		}
    }
	
	//if explosive object is shot or damaged by explosion, subtract hitpoints or detonate
	void ApplyDamage( int damage ){
		hitPoints -= damage;
		if(!detonated && hitPoints <= 0.0f){
			detonated = true;//this line must be before call to Detonate() otherwise stack overflow occurs
			StartCoroutine("Detonate");
		}
	}
	
}