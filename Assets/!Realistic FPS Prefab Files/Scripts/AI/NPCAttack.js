var range = 100.0;
var fireRate = 0.097F;
var force = 20.0;
var damage = 10.0;
var bulletsPerClip = 50;
var ammo = 150;
var reloadTime = 1.75;

private var canShoot : boolean = true;
private var shooting : boolean = false;
private var reloading : boolean = false;
private var mFlashState : boolean = false;
private var noAmmoState : boolean = false;
private var recoveryTime : float = 0.000F;

//var hitParticles : ParticleEmitter;
var muzzleFlash : Renderer;

var firesnd : AudioClip;
var reloadsnd : AudioClip;
var noammosnd : AudioClip;

private var bulletsLeft : int = 0;

private var shootStartTime : float = -fireRate * 2;
private var shootElapsedTime : float = 0.000F;

function Start () {
	//hitParticles = GetComponentInChildren(ParticleEmitter);

	// We don't want to emit particles all the time, only when we hit something.
//	if (hitParticles)
//		hitParticles.emit = false;
	bulletsLeft = bulletsPerClip;
	
}

function Update() {

	//run shot timer
	shootElapsedTime = Time.time - shootStartTime;

	if(shootElapsedTime >= fireRate){ 
		shooting = false;
	}
	
}

function LateUpdate() {

	//enable muzzle flash
	if (muzzleFlash){
		if(shootElapsedTime < fireRate / 3){ 
			if(mFlashState){
				muzzleFlash.enabled = true;
				mFlashState = false;
			}
		}else{
			if(!mFlashState){
				// We didn't, disable the muzzle flash
				muzzleFlash.enabled = false;
			}
		}
	}

}

function Fire () {

	if (bulletsLeft == 0){
		return;
	}
	
	//fire weapon
	if(!reloading){
		if(canShoot){
			if(!shooting){
				//check sprint recovery timer so gun only shoots after returning to center
				if(recoveryTime + 0.5F < Time.time){
					FireOneShot();
					shootStartTime = Time.time;
					shooting = true;
				}
			}else{
				if(shootElapsedTime >= fireRate){ 
					shooting = false;
				}
			}
		}
	}else{
		shooting = false;
	}

}

function FireOneShot () {

	//No shooting when sprinting
   	if (canShoot){
		var target = transform.GetComponent(AI).target;
		//var direction = transform.TransformDirection(Vector3.forward);
		var hit : RaycastHit;
		
		var targetDir = target.position - transform.position;
   		var forward = transform.forward;
    	var angle = Vector3.Angle(targetDir, forward);
		
		// Did we hit anything?
		if (Physics.Raycast(transform.position, targetDir, hit, range)) {
			// Apply a force to the rigidbody we hit
			if (hit.rigidbody){
				hit.rigidbody.AddForceAtPosition(force * targetDir / (Time.fixedDeltaTime * 100.0f), hit.point);
			}
			// Place the particle system for spawing out of place where we hit the surface!
			// And spawn a couple of particles
//			if (hitParticles) {
//				hitParticles.transform.position = hit.point;
//				hitParticles.transform.rotation = Quaternion.FromToRotation(Vector3.up, hit.normal);
//				hitParticles.Emit();
//			}
			
			// Send a damage message to the hit object			
			hit.collider.SendMessageUpwards("ApplyDamage", Random.Range(damage + 5, damage - 5), SendMessageOptions.DontRequireReceiver);
		}

		audio.clip = firesnd;
		audio.pitch = Random.Range(0.86f, 1);
		audio.PlayOneShot(audio.clip, 0.9f / audio.volume);
		
		bulletsLeft -= 1;

		mFlashState=true;
		enabled = true;
		
		// Reload gun in reload Time		
		if (bulletsLeft == 0){
			Reload();	
		}
	}
	
}

function Reload () {
	
	if(ammo > 0){
		audio.volume = 1.0;
		audio.pitch = 1.0;
		audio.PlayOneShot(reloadsnd, 1.0 / audio.volume);
		
		reloading = true;
		// Wait for reload time first, then proceed
		yield WaitForSeconds(reloadTime);
		//set reloading var in ironsights script to true after reloading delay
		reloading = false;

		// We have ammo left to reload
		if(ammo >= bulletsPerClip){
			ammo -= bulletsPerClip - bulletsLeft;
			bulletsLeft = bulletsPerClip;
		}else{
			bulletsLeft += ammo;
			ammo = 0;
		}
	}
	
}

function GetBulletsLeft () {
	return bulletsLeft;
}