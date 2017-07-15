using UnityEngine;
using System.Collections;

public class Timer : MonoBehaviour 
{
	public float timer;
	public float timerlimit=30.0f;
	public GUIText TimeText;
	// Use this for initialization
	void Start () 
	{
		timer = timerlimit;
		TimeText.text = "Time left:" + timer.ToString ("f0");
	}
	
	// Update is called once per frame
	void Update ()
	{
		timer -= Time .deltaTime;
		TimeText.text = "Time left:" + timer.ToString ("f0");
		if (timer <= 0.0f)
		{
			print ("YOU LOSE!");
			timer=timerlimit ;
		}
	}
}
