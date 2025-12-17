#version 100
attribute vec3 vertexPosition;
attribute vec2 vertexTexCoord;
attribute vec3 vertexNormal;

varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform mat4 mvp;
uniform mat4 matModel;
uniform mat4 matNormal;

void main()
{
    fragTexCoord = vertexTexCoord;
    fragNormal = normalize(vec3(matNormal * vec4(vertexNormal, 1.0)));
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
