//WorldRecenter.cs by Azuline Studios© All Rights Reserved
//Orients all game objects to scene origin if player travels 
//beyond threshold to correct floating point precision loss in large scenes.
using UnityEngine;
using System.Collections;

public class WorldRecenter : MonoBehaviour {
	private Object[] objects;
	public float threshold = 700.0f;//re-center objects if player moves farther than this distance from scene origin
	public bool refreshTerrain = true;//Refresh terrain to update tree colliders (can cause momentary hiccup on large terrains)
	[HideInInspector]
	public float worldRecenterTime = 0.0f;//most recent time of world recenter
	
    void LateUpdate(){
        Vector3 cameraPosition = gameObject.transform.position;
        cameraPosition.y = 0f;
		//if we're beyond the recenter threshold, recenter objects to scene origin
        if (cameraPosition.magnitude > threshold){
			worldRecenterTime = Time.time;//update time of world recenter
			//recenter objects
            objects = FindObjectsOfType(typeof(Transform));
            foreach(Object o in objects){
                Transform t = (Transform)o;
                if (t.parent == null && t.gameObject.layer != 14){//don't change position of GUI elements which need to stay at scene origin 0,0,0
                    t.position -= cameraPosition;
                }
            }
			//recenter particles and particle emitters
            objects = FindObjectsOfType(typeof(ParticleEmitter));
            foreach (Object o in objects)
            {
                ParticleEmitter pe = (ParticleEmitter)o;
                Particle[] emitterParticles = pe.particles;
                for(int i = 0; i < emitterParticles.Length; ++i)
                {
                    emitterParticles[i].position -= cameraPosition;
                }
                pe.particles = emitterParticles;
            }
			
			//Refresh terrain to update tree colliders (can cause momentary hiccup on large terrains)
			if(refreshTerrain){
				if(Terrain.activeTerrain){
					TerrainData terrain = Terrain.activeTerrain.terrainData;
		            float[,] heights = terrain.GetHeights(0, 0, 0, 0);
		            terrain.SetHeights(0, 0, heights);
				}
			}
		}
	}
}