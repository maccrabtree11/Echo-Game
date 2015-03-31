Shader "LightShafts/Alpha Blended" {
Properties {
	_Intensity ("Shaft Intensity", Range(0.01,255.0)) = 1.0
	_ShaftColor ("Tint Color", Color) = (0.5,0.5,0.5,255)
	_ColorWarmt ("extra Color", Color) = (0.5,0.5,0.5,255)
	_SampleColor("Do not edit this",Color)= (255,255,255,255)
	_MainTex ("Particle Texture", 2D) = "white" {}

}

Category {
	Tags { "Queue"="Transparent" "IgnoreProjector"="True" "RenderType"="Transparent" }
	//Blend SrcAlpha OneMinusSrcAlpha
	Blend SrcAlpha One
	   
	AlphaTest Greater .01
	ColorMask RGB
	Cull Off Lighting Off ZWrite Off
	BindChannels {
		Bind "Color", color
		Bind "Vertex", vertex
		Bind "TexCoord", texcoord
	}
	
	// ---- Fragment program cards
	SubShader {
		Pass {
		
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			#pragma fragmentoption ARB_precision_hint_fastest
			#pragma multi_compile_particles
			
			#include "UnityCG.cginc"

			sampler2D _MainTex;
			fixed4 _ShaftColor;
			fixed4 _ColorWarmt;
			fixed4 _SampleColor;
			float _Intensity;
			
			struct appdata_t {
				float4 vertex : POSITION;
				fixed4 color : COLOR;
				float2 texcoord : TEXCOORD0;
			};

			struct v2f {
				float4 vertex : POSITION;
				fixed4 color : COLOR;
				float2 texcoord : TEXCOORD0;
			
			};
			
			float4 _MainTex_ST;

			v2f vert (appdata_t v)
			{
				v2f o;
				o.vertex = mul(UNITY_MATRIX_MVP, v.vertex);
				
				o.color = v.color;
				o.texcoord = TRANSFORM_TEX(v.texcoord,_MainTex);
				return o;
			}

			sampler2D _CameraDepthTexture;
			float _InvFade;
			
			fixed4 frag (v2f i) : COLOR
			{
			
				return 2.0f * _ShaftColor * _ColorWarmt * _SampleColor *  tex2D(_MainTex, i.texcoord)*_Intensity;
				
			}
			ENDCG 
		}
	} 	
	
	// ---- Dual texture cards
	SubShader {
		Pass {
			SetTexture [_MainTex] {
				constantColor [_ShaftColor]
				combine constant * primary
			}
			SetTexture [_MainTex] {
				combine texture * previous DOUBLE
			}
		}
	}
	
	// ---- Single texture cards (does not do color tint)
	SubShader {
		Pass {
			SetTexture [_MainTex] {
				combine texture * primary
			}
		}
	}
}
}
