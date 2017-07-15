using UnityEngine;
using System.Collections;

[AddComponentMenu("Game/AutoDestroy")]
public class AutoDestroy : MonoBehaviour {

    public float m_timer = 1.0f;

	void Update () {

        m_timer -= Time.deltaTime;
        if (m_timer <= 0)
            Destroy(this.gameObject);
	
	}
}
