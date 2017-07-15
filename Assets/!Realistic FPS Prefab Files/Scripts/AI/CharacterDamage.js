var hitPoints = 100.0;
var deadReplacement : Transform;
var dieSound : AudioClip;
var removeBody : boolean;
var bodyStayTime : float = 15.0f;

function ApplyDamage(damage : float) {
	// We already have less than 0 hitpoints, maybe we got killed already?
	if (hitPoints <= 0.0){
		return;
	}
	
	hitPoints -= damage;
	//expand enemy search radius if attacked outside default search radius to defend against sniping
	if(transform.GetComponent(AI)){
		transform.GetComponent(AI).attackRangeAmt = transform.GetComponent(AI).attackRange * 3;
	}
	
	if (hitPoints <= 0.0){
		Die();
	}
}

function Die () {
	
	// Play a dying audio clip
	if (dieSound){
		AudioSource.PlayClipAtPoint(dieSound, transform.position);
	}

	// Replace ourselves with the dead body
	if (deadReplacement) {
		var dead : Transform = Instantiate(deadReplacement, transform.position, transform.rotation);

		// Copy position & rotation from the old hierarchy into the dead replacement
		CopyTransformsRecurse(transform, dead);
		
		if(dead.GetComponent(RemoveBody)){
			if(removeBody){
				dead.GetComponent(RemoveBody).enabled = true;
				dead.GetComponent(RemoveBody).bodyStayTime = bodyStayTime;//pass bodyStayTime to RemoveBody.js script
			}else{
				dead.GetComponent(RemoveBody).enabled = false;
			}
		}
		
		Destroy(transform.gameObject);
		
	}

}

static function CopyTransformsRecurse (src : Transform,  dst : Transform) {
	dst.position = src.position;
	dst.rotation = src.rotation;
	
	for (var child : Transform in dst) {
		// Match the transform with the same name
		var curSrc = src.Find(child.name);
		if (curSrc)
			CopyTransformsRecurse(curSrc, child);
	}
}