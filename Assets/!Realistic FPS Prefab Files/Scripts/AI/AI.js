public var objectWithAnims : Transform;//the object with the Animation component automatically created by the character mesh's import settings
private var minimumRunSpeed = 3.0;
public var walkAnimSpeed = 1.0;
public var runAnimSpeed = 1.0;
var speed = 6.0;//movement speed of the NPC
private var speedAmt = 1.0;
var pushPower = 5.0;//physics force to apply to rigidbodies blocking NPC path
var rotationSpeed = 5.0;
var targetPlayer = true;//to determine if NPC should ignore player
var shootRange = 15.0;//minimum range to target for attack
var attackRange = 30.0;//range that NPC will start chasing target until they are within shootRange
@HideInInspector
var attackRangeAmt = 30.0;//increased by character damage script if NPC is damaged by player
var sneakRangeMod : float = 0.4f;//reduce NPC's attack range by sneakRangeMod amount when player is sneaking
private var shootAngle = 2.0;
var dontComeCloserRange = 5.0;
var delayShootTime = 0.35;
private var delayShootTimeRand = 0.0;
private var pickNextWaypointDistance = 2.0;
@HideInInspector
var target : Transform;
@HideInInspector
var playerObj : GameObject;
private var myTransform : Transform;
private var initMove : float;
var doPatrol = true;
var walkOnPatrol = true;
public var myWaypointGroup : int;//waypoint group number that this NPC should patrol
var searchMask : LayerMask = 0;//only layers to include in target search (for efficiency)
var eyeHeight = 0.4;//height of rayCast starting point/origin which detects player (can be raised if NPC origin is at their feet)
private var countBackwards : boolean = false;
public var randomSpawnChance : float = 1.0f;//
private var lastShot = -10.0;

// Make sure there is always a character controller
@script RequireComponent (CharacterController)

function Start () {

	Mathf.Clamp01(randomSpawnChance);

	// Activate the npc based on randomSpawnChance
	if(Random.value > randomSpawnChance){
		Destroy(transform.gameObject);
	}else{
	
		//if there is no objectWithAnims defined, use the Animation Component attached to this game object
		if(objectWithAnims == null){objectWithAnims = transform;}

		// Set all animations to loop
		objectWithAnims.animation.wrapMode = WrapMode.Loop;
	
		// Except our action animations, Dont loop those
		objectWithAnims.animation["shoot"].wrapMode = WrapMode.Once;
		// Put idle and run in a lower layer. They will only animate if our action animations are not playing
		objectWithAnims.animation["idle"].layer = -1;
		objectWithAnims.animation["walk"].layer = -1;
		objectWithAnims.animation["run"].layer = -1;
		
		objectWithAnims.animation["walk"].speed = walkAnimSpeed;
		objectWithAnims.animation["run"].speed = runAnimSpeed;
		
		objectWithAnims.animation.Stop();
	
		//initialize AI vars
		playerObj = Camera.main.transform.GetComponent("CameraKick").playerObj;
		attackRangeAmt = attackRange;
		initMove = Time.time;
		objectWithAnims.animation.CrossFade("idle", 0.3);
		// Auto setup player as target through tags
		if(target == null && GameObject.FindWithTag("Player") && targetPlayer){
			target = GameObject.FindWithTag("Player").transform;
		}
		if(doPatrol){
			Patrol();
		}else{
			StandWatch();
		}
		
		if(!targetPlayer){
			//ignore collisions with player if NPC is not targeting player to prevent physics oddities
			transform.gameObject.layer = 9;
		}
	}
}

function Awake () {
    myTransform = transform;
}

function StandWatch () {
	var controller : CharacterController = GetComponent(CharacterController);	
	while (true) {
	
		//play idle animation
		objectWithAnims.animation.CrossFade("idle", 0.3);
		
		//if NPC spawns in the air, move their character controller to the ground
		if(!controller.isGrounded){ 
			var down = myTransform.TransformDirection(-Vector3.up);
			controller.SimpleMove(down);
		}else{		
			if (CanSeeTarget()){
				yield StartCoroutine("AttackPlayer");
			}
		}
		
		yield new WaitForFixedUpdate ();//could wait for longer interval than fixed update for efficiency
	}
}

function Patrol () {
	//find the next waypoint and pass our myWaypointGroup number to AutoWayPoint script
	var curWayPoint = AutoWayPoint.FindClosest(myTransform.position, myWaypointGroup);
	var controller : CharacterController = GetComponent(CharacterController);
	if(curWayPoint){//patrol if NPC has a current waypoint, otherwise stand watch
		while (true) {
			var waypointPosition = curWayPoint.transform.position;
			// Are we close to a waypoint? -> pick the next one!
			if(Vector3.Distance(waypointPosition, myTransform.position) < pickNextWaypointDistance){
				curWayPoint = PickNextWaypoint (curWayPoint);
			}
			
			//if NPC spawns in the air, move their character controller to the ground
			if(!controller.isGrounded){ 
				var down = myTransform.TransformDirection(-Vector3.up);
				controller.SimpleMove(down);
			}else{	
				// Attack the player and wait until
				// - player is killed
				// - player is out of sight	
				if(target){	
					if(CanSeeTarget()){
						yield StartCoroutine("AttackPlayer");
					}
				}
			}
			//determine if NPC should walk or run on patrol
			if(walkOnPatrol){speedAmt = 1.0f;}else{speedAmt = speed;}
			// Move towards our target
			MoveTowards(waypointPosition);
			
			yield new WaitForFixedUpdate ();
		}
	}else{
		StandWatch();
		return;
	}
}


function CanSeeTarget () : boolean {
	var FPSWalker = playerObj.GetComponent("FPSRigidBodyWalker");
	if(FPSWalker.crouched){
		attackRangeAmt = attackRange * sneakRangeMod;//reduce NPC's attack range by sneakRangeMod amount when player is sneaking
	}else{
		attackRangeAmt = attackRange;
	}
	if(Vector3.Distance(myTransform.position, target.position) > attackRangeAmt){
		return false;
	}
	var hit : RaycastHit;
	if(Physics.Linecast (myTransform.position + myTransform.up * (1.0 + eyeHeight), target.position, hit, searchMask)){
		return hit.transform == target;
	}
	return false;
}

function Shoot () {
	// Start shoot animation
	objectWithAnims.animation.CrossFade("shoot", 0.3);
	speedAmt = 0.0f;
	//SendMessage("SetSpeed", 0.0);
	SetSpeed(0.0f);
	// Wait until half the animation has played
	yield WaitForSeconds(delayShootTime);
	// Fire gun
	BroadcastMessage("Fire");
	// Wait for the rest of the animation to finish
	yield WaitForSeconds(objectWithAnims.animation["shoot"].length - delayShootTime + Random.Range(0.0f, 0.75f));
}

function AttackPlayer () {
	var lastVisiblePlayerPosition = target.position;
	while (true) {
		if(CanSeeTarget ()){
			// Target is dead - stop hunting
			if(target == null){
				speedAmt = 1.0f;
				return;
			}
			// Target is too far away - give up	
			var distance = Vector3.Distance(myTransform.position, target.position);
			if(distance > attackRangeAmt){
				speedAmt = 1.0f;
				return;
			}
			speedAmt = speed;
			lastVisiblePlayerPosition = target.position;
			if(distance > dontComeCloserRange){
				MoveTowards (lastVisiblePlayerPosition);
			}else{
				RotateTowards(lastVisiblePlayerPosition);
			}
			var forward = myTransform.TransformDirection(Vector3.forward);
			var targetDirection = lastVisiblePlayerPosition - myTransform.position;
			targetDirection.y = 0;

			var angle = Vector3.Angle(targetDirection, forward);

			// Start shooting if close and player is in sight
			if(distance < shootRange && angle < shootAngle){
				yield StartCoroutine("Shoot");
			}
		}else{
			speedAmt = speed;
			yield StartCoroutine("SearchPlayer", lastVisiblePlayerPosition);
			// Player not visible anymore - stop attacking
			if (!CanSeeTarget ()){
				speedAmt = 1.0f;
				return;
			}
		}

		yield;//dont wait any frames for smooth NPC movement while attacking player
	}
}

function SearchPlayer (position : Vector3) {
	// Run towards the player but after 3 seconds timeout and go back to Patroling
	var timeout = 3.0;
	while(timeout > 0.0){
		MoveTowards(position);

		// We found the player
		if(CanSeeTarget()){
			return;
		}
		timeout -= Time.deltaTime;

		yield;//dont wait any frames for smooth NPC movement while searching for player
	}
}

function RotateTowards (position : Vector3) {
	//SendMessage("SetSpeed", 0.0);
	SetSpeed(0.0f);
	
	var direction = position - myTransform.position;
	direction.y = 0;
	if(direction.magnitude < 0.1){
		return;
	}
	// Rotate towards the target
	myTransform.rotation = Quaternion.Slerp (myTransform.rotation, Quaternion.LookRotation(direction), rotationSpeed * Time.deltaTime * 100);
	myTransform.eulerAngles = Vector3(0, myTransform.eulerAngles.y, 0);
}

function MoveTowards (position : Vector3) {
	var direction = position - myTransform.position;
	direction.y = 0;
	if(direction.magnitude < 0.5){
		SetSpeed(0.0f);
		return;
	}
	
	// Rotate towards the target
	myTransform.rotation = Quaternion.Slerp (myTransform.rotation, Quaternion.LookRotation(direction), rotationSpeed * Time.deltaTime);
	myTransform.eulerAngles = Vector3(0, myTransform.eulerAngles.y, 0);
	// Modify speed so we slow down when we are not facing the target
	var forward = myTransform.TransformDirection(Vector3.forward);
	var speedModifier = Vector3.Dot(forward, direction.normalized);
	speedModifier = Mathf.Clamp01(speedModifier);
	// Move the character
	direction = forward * speedAmt * speedModifier;
	GetComponent (CharacterController).SimpleMove(direction);

	SetSpeed(speedAmt * speedModifier);
	
}

function PickNextWaypoint (currentWaypoint : AutoWayPoint) {

	var best = currentWaypoint;

	for(var cur : AutoWayPoint in currentWaypoint.connected){

		if(!countBackwards){
			if(currentWaypoint.waypointNumber != cur.connected.length){
				if(currentWaypoint.waypointNumber + 1 == cur.waypointNumber){
					best = cur;
					break;
				}
			}else if(currentWaypoint.waypointNumber == cur.connected.length){
				if(currentWaypoint.waypointNumber -1 == cur.waypointNumber){
					best = cur;
					countBackwards = true;
					break;
				}
			}
		}else{
			if(currentWaypoint.waypointNumber != 1){
				if(currentWaypoint.waypointNumber - 1 == cur.waypointNumber){
					best = cur;
					break;
				}
			}else if(currentWaypoint.waypointNumber == 1){
				if(currentWaypoint.waypointNumber + 1 == cur.waypointNumber){
					best = cur;
					countBackwards = false;
					break;
				}
			}
		
		}
		
		
	}
	
	return best;
}

//allow the NPCs to push rigidbodies in their path
function OnControllerColliderHit (hit : ControllerColliderHit) {
    var body : Rigidbody = hit.collider.attachedRigidbody;
    // no rigidbody
    if (body == null || body.isKinematic || body.gameObject.tag == "Player")
        return;
        
    // We dont want to push objects below us
    if (hit.moveDirection.y < -0.3) 
        return;
    
    // Calculate push direction from move direction, 
    // we only push objects to the sides never up and down
    var pushDir : Vector3 = Vector3 (hit.moveDirection.x, 0, hit.moveDirection.z);
    // If you know how fast your character is trying to move,
    // then you can also multiply the push velocity by that.
    
    // Apply the push
    body.velocity = pushDir * pushPower;
}

function SetSpeed (speed : float) {
	if (speed > minimumRunSpeed){
		objectWithAnims.animation.CrossFade("run");
	}else{
		if(speed > 0){
			objectWithAnims.animation.CrossFade("walkg");
		}else{
			objectWithAnims.animation.CrossFade("idle");
		}
	}
}