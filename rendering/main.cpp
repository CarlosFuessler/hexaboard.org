#include <raylib.h>
#include <raymath.h>

#if defined(PLATFORM_WEB)
#include <emscripten/emscripten.h>
#endif

// Globale Variablen
Camera3D camera = {0};
Model keyboardModel = {0};
Shader lightingShader = {0};
int lightDirLoc = 0;
Vector2 lastMousePos = {0};
float zoom = 15.0f;
float rotationX = 30.0f;
float rotationY = 45.0f;
bool modelLoaded = false;

void UpdateDrawFrame(void)
{

    if (IsMouseButtonDown(MOUSE_BUTTON_LEFT))
    {
        Vector2 mousePos = GetMousePosition();
        Vector2 mouseDelta = {mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y};

        rotationY += mouseDelta.x * 0.5f;
        rotationX += mouseDelta.y * 0.5f;

        if (rotationX > 89.0f)
            rotationX = 89.0f;
        if (rotationX < -89.0f)
            rotationX = -89.0f;

        lastMousePos = mousePos;
    }
    else
    {
        lastMousePos = GetMousePosition();
    }

    float wheel = GetMouseWheelMove();
    zoom -= wheel * 2.0f;
    if (zoom < 5.0f)
        zoom = 5.0f;
    if (zoom > 50.0f)
        zoom = 50.0f;

    float radX = rotationX * DEG2RAD;
    float radY = rotationY * DEG2RAD;

    camera.position.x = cosf(radX) * sinf(radY) * zoom;
    camera.position.y = sinf(radX) * zoom;
    camera.position.z = cosf(radX) * cosf(radY) * zoom;
    camera.target = (Vector3){0.0f, 0.0f, 0.0f};

    // Update light direction (camera position)
    SetShaderValue(lightingShader, lightDirLoc, &camera.position, SHADER_UNIFORM_VEC3);

    // Rendering
    BeginDrawing();
    ClearBackground(BLACK);

    BeginMode3D(camera);

    if (modelLoaded)
    {

        DrawModelEx(keyboardModel, (Vector3){0.0f, 0.0f, 0.0f}, (Vector3){1.0f, 0.0f, 0.0f}, -90.0f, (Vector3){1.0f, 1.0f, 1.0f}, WHITE);
    }
    else
    {

        DrawCube((Vector3){0.0f, 0.0f, 0.0f}, 2.0f, 0.5f, 3.0f, SKYBLUE);
        DrawCubeWires((Vector3){0.0f, 0.0f, 0.0f}, 2.0f, 0.5f, 3.0f, WHITE);
    }

    EndMode3D();

    DrawText("Hexaboard 3D Model", 10, 10, 20, GREEN);

    EndDrawing();
}

int main(void)
{
    const int screenWidth = 800;
    const int screenHeight = 450;

    InitWindow(screenWidth, screenHeight, "Hexaboard 3D Viewer");

    camera.position = (Vector3){15.0f, 10.0f, 15.0f};
    camera.target = (Vector3){0.0f, 0.0f, 0.0f};
    camera.up = (Vector3){0.0f, 1.0f, 0.0f};
    camera.fovy = 45.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    keyboardModel = LoadModel("Assets/Hexaboard_v3_Display.obj");

    lightingShader = LoadShader("Assets/lighting.vs", "Assets/lighting.fs");
    lightDirLoc = GetShaderLocation(lightingShader, "lightDir");

    if (keyboardModel.meshCount > 0)
    {
        modelLoaded = true;
        TraceLog(LOG_INFO, "Hexaboard model loaded with %d meshes", keyboardModel.meshCount);

        // Shader auf alle Materialien anwenden
        for (int i = 0; i < keyboardModel.materialCount; i++)
        {
            keyboardModel.materials[i].shader = lightingShader;
        }

        BoundingBox bbox = GetMeshBoundingBox(keyboardModel.meshes[0]);
        TraceLog(LOG_INFO, "Model bounds: min(%.2f,%.2f,%.2f) max(%.2f,%.2f,%.2f)",
                 bbox.min.x, bbox.min.y, bbox.min.z,
                 bbox.max.x, bbox.max.y, bbox.max.z);
    }
    else
    {
        TraceLog(LOG_WARNING, "Could not load Hexaboard model, using fallback");
        modelLoaded = false;
    }

#if defined(PLATFORM_WEB)
    emscripten_set_main_loop(UpdateDrawFrame, 0, 1);
#else
    SetTargetFPS(60);
    while (!WindowShouldClose())
    {
        UpdateDrawFrame();
    }

    if (modelLoaded)
    {
        UnloadModel(keyboardModel);
    }
    UnloadShader(lightingShader);
#endif

    CloseWindow();
    return 0;
}
