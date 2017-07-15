using UnityEngine;
using System.Collections;


[AddComponentMenu("Game/attack")]
public class attack : MonoBehaviour {
	
	// Transform×é¼þ
	Transform m_transform;
	//CharacterController m_ch;
	
	// ¶¯»­×é¼þ
	Animator m_ani;
	
	// Ñ°Â·×é¼þ
	NavMeshAgent m_agent;
	
	// Ö÷½Ç
	Player m_player;
	
	// ½ÇÉ«ÒÆ¶¯ËÙ¶È
	float m_movSpeed = 0.5f;
	
	// ½ÇÉ«Ðý×ªËÙ¶È
	float m_rotSpeed = 120;
	
	//  ¼ÆÊ±Æ÷
	float m_timer=2;
	
	// ÉúÃüÖµ
	int m_life = 15;
	
	// ³ÉÉúµã
	protected EnemySpawn m_spawn;
	
	// Use this for initialization
	void Start () {
		
		// »ñÈ¡×é¼þ
		m_transform = this.transform;
		m_ani = this.GetComponent<Animator>();
		m_agent = GetComponent<NavMeshAgent>();
		
		// »ñµÃÖ÷½Ç
		m_player = GameObject.FindGameObjectWithTag("!!!FPS Player Main").GetComponent<Player>();
		
	}
	
	// ³õÊ¼»¯
	public void Init(EnemySpawn spawn)
	{
		m_spawn = spawn;
		
		m_spawn.m_enemyCount++;
	}
	
	// µ±±»Ïú»ÙÊ±
	public void OnDeath()
	{
		//¸üÐÂµÐÈËÊýÁ¿
		m_spawn.m_enemyCount--;
		
		// ¼Ó100·Ö
		GameManager.Instance.SetScore(100);
		
		// Ïú»Ù
		Destroy(this.gameObject);
	}
	
	// Update is called once per frame
	void Update () {
		
		// Èç¹ûÖ÷½ÇÉúÃüÎª0£¬Ê²Ã´Ò²²»×ö
		if (m_player.m_life <= 0)
			return;
		
		// »ñÈ¡µ±Ç°¶¯»­×´Ì¬
		AnimatorStateInfo stateInfo = m_ani.GetCurrentAnimatorStateInfo(0);
		
		// Èç¹û´¦ÓÚ´ý»ú×´Ì¬
		if (stateInfo.nameHash == Animator.StringToHash("Base Layer.walk") && !m_ani.IsInTransition(0))
		{
			m_ani.SetBool("walk", false);
			
			// ´ý»úÒ»¶¨Ê±¼ä
			m_timer -= Time.deltaTime;
			if (m_timer > 0)
				return;
			
			// Èç¹û¾àÀëÖ÷½ÇÐ¡ÓÚ1.5Ã×£¬½øÈë¹¥»÷¶¯»­×´Ì¬
			if (Vector3.Distance(m_transform.position, m_player. m_transform.position) < 1.5f)
			{
				m_ani.SetBool("attack", true);
			}
			else
			{
				// ÖØÖÃ¶¨Ê±Æ÷
				m_timer=1;
				
				// ÉèÖÃÑ°Â·Ä¿±êµã
				m_agent.SetDestination(m_player. m_transform.position);
				
				// ½øÈëÅÜ²½¶¯»­×´Ì¬
				m_ani.SetBool("walk", true);
			}
		}
		
		// Èç¹û´¦ÓÚÅÜ²½×´Ì¬
		if (stateInfo.nameHash == Animator.StringToHash("Base Layer.walk") && !m_ani.IsInTransition(0))
		{
			
			m_ani.SetBool("walk", false);
			
			
			// Ã¿¸ô1ÃëÖØÐÂ¶¨Î»Ö÷½ÇµÄÎ»ÖÃ
			m_timer -= Time.deltaTime;
			if (m_timer < 0)
			{
				m_agent.SetDestination(m_player. m_transform.position);
				
				m_timer = 1;
			}
			
			// ×·ÏòÖ÷½Ç
			MoveTo();
			
			// Èç¹û¾àÀëÖ÷½ÇÐ¡ÓÚ1.5Ã×£¬ÏòÖ÷½Ç¹¥»÷
			if (Vector3.Distance(m_transform.position, m_player. m_transform.position) <= 1.5f)
			{
				//Í£Ö¹Ñ°Â·	
				m_agent.ResetPath();
				// ½øÈë¹¥»÷×´Ì¬
				m_ani.SetBool("attack", true);
			}
		}
		
		// Èç¹û´¦ÓÚ¹¥»÷×´Ì¬
		if (stateInfo.nameHash == Animator.StringToHash("Base Layer.attack") && !m_ani.IsInTransition(0))
		{
			
			// ÃæÏòÖ÷½Ç
			RotateTo();
			
			m_ani.SetBool("attack", false);
			
			// Èç¹û¹¥»÷¶¯»­²¥Íê£¬ÖØÐÂ½øÈë´ý»ú×´Ì¬
			if (stateInfo.normalizedTime >= 1.0f)
			{
				m_ani.SetBool("walk", true);
				
				// ÖØÖÃ¼ÆÊ±Æ÷
				m_timer = 2;
				
				m_player.OnDamage(1);
			}
		}
		
		// ËÀÍö
		if (stateInfo.nameHash == Animator.StringToHash("Base Layer.back_fall") && !m_ani.IsInTransition(0))
		{
			if (stateInfo.normalizedTime >= 1.0f)
			{
				OnDeath();
				
			}
		}
		
		
	}
	
	// ×ªÏòÄ¿±êµã
	void RotateTo()
	{
		// µ±Ç°½Ç¶È   
		Vector3 oldangle = m_transform.eulerAngles;
		
		//  »ñµÃÃæÏòÖ÷½ÇµÄ½Ç¶È
		m_transform.LookAt(m_player.m_transform);
		float target = m_transform.eulerAngles.y;
		
		// ×ªÏòÖ÷½Ç
		float speed = m_rotSpeed * Time.deltaTime;
		float angle = Mathf.MoveTowardsAngle(oldangle.y, target, speed);
		m_transform.eulerAngles = new Vector3(0, angle, 0);
	}
	
	// Ñ°Â·ÒÆ¶¯
	void MoveTo()
	{
		float speed = m_movSpeed * Time.deltaTime;
		m_agent.Move(m_transform.TransformDirection((new Vector3(0, 0, speed))));
		
	}
	
	// ÉËº¦
	public void OnDamage(int damage)
	{
		m_life -= damage;
		
		// Èç¹ûÉúÃüÎª0£¬Ïú»Ù×ÔÉí
		if (m_life <= 0)
		{
			m_ani.SetBool("back_fall", true);
		}
	}
}
