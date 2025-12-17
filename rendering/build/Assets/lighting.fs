#version 100
precision mediump float;

varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform vec4 colDiffuse;
uniform vec3 lightDir;

void main()
{
    vec3 L = normalize(lightDir);
    vec3 normal = normalize(fragNormal);
    float diff = max(dot(normal, L), 0.0);
    vec3 diffuse = diff * vec3(1.0, 1.0, 1.0);
    vec3 ambient = vec3(0.2, 0.2, 0.2);
    
    gl_FragColor = vec4((ambient + diffuse) * colDiffuse.rgb, colDiffuse.a);
}
