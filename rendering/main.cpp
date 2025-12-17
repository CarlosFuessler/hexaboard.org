#include <raylib.h>
#include <raymath.h>

#if defined(PLATFORM_WEB)
#include <emscripten/emscripten.h>
#endif

// Keyboard Part Structure
typedef struct
{
    Model model;
    Color color;
    Vector3 explodeOffset;
    Vector3 scale;
    bool loaded;
    const char *name;
} KeyboardPart;

// Globale Variablen
Camera3D camera = {0};
Shader lightingShader = {0};
int lightDirLoc = 0;
Vector2 lastMousePos = {0};
float zoom = 15.0f;
float rotationX = 30.0f;
float rotationY = 45.0f;

// Exploded view slider
float explodeFactor = 0.5f;
Rectangle sliderRect = {0};
bool draggingSlider = false;

// Keyboard parts
#define PARTS_COUNT 6
KeyboardPart parts[PARTS_COUNT];
int partsLoaded = 0;

void UpdateDrawFrame(void)
{
    int screenWidth = GetScreenWidth();
    int screenHeight = GetScreenHeight();

    // Update slider rectangle position
    sliderRect = (Rectangle){(float)(screenWidth / 2 - 160), (float)(screenHeight - 60), 320.0f, 20.0f};

    // Handle slider interaction
    Vector2 mousePos = GetMousePosition();

    if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON))
    {
        if (CheckCollisionPointRec(mousePos, sliderRect))
        {
            draggingSlider = true;
        }
    }

    if (IsMouseButtonReleased(MOUSE_LEFT_BUTTON))
    {
        draggingSlider = false;
    }

    if (draggingSlider)
    {
        float sliderValue = (mousePos.x - sliderRect.x) / sliderRect.width;
        explodeFactor = Clamp(sliderValue, 0.0f, 1.0f);
    }

    // Camera controls (only when not dragging slider)
    if (!draggingSlider && IsMouseButtonDown(MOUSE_BUTTON_LEFT))
    {
        Vector2 currentMousePos = GetMousePosition();
        Vector2 mouseDelta = {currentMousePos.x - lastMousePos.x, currentMousePos.y - lastMousePos.y};

        rotationY += mouseDelta.x * 0.5f;
        rotationX += mouseDelta.y * 0.5f;

        if (rotationX > 89.0f)
            rotationX = 89.0f;
        if (rotationX < -89.0f)
            rotationX = -89.0f;

        lastMousePos = currentMousePos;
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
    if (lightingShader.id > 0)
    {
        SetShaderValue(lightingShader, lightDirLoc, &camera.position, SHADER_UNIFORM_VEC3);
    }

    // Rendering
    BeginDrawing();
    ClearBackground((Color){15, 15, 20, 255});

    BeginMode3D(camera);

    if (partsLoaded > 0)
    {
        // Draw all keyboard parts with explode offset
        for (int i = 0; i < PARTS_COUNT; i++)
        {
            if (parts[i].loaded)
            {
                Vector3 position = {
                    parts[i].explodeOffset.x * explodeFactor,
                    parts[i].explodeOffset.y * explodeFactor,
                    parts[i].explodeOffset.z * explodeFactor};

                DrawModelEx(parts[i].model, position,
                            (Vector3){1.0f, 0.0f, 0.0f}, -90.0f,
                            parts[i].scale, parts[i].color);

                // Debug: Draw part name in 3D space
                if (i == 1)
                { // PCB
                    DrawCube(position, 0.5f, 0.5f, 0.5f, MAGENTA);
                }
            }
        }
    }
    else
    {
        // Fallback cube
        DrawCube((Vector3){0.0f, 0.0f, 0.0f}, 2.0f, 0.5f, 3.0f, SKYBLUE);
        DrawCubeWires((Vector3){0.0f, 0.0f, 0.0f}, 2.0f, 0.5f, 3.0f, WHITE);
    }

    // Draw grid
    // DrawGrid(20, 1.0f);

    EndMode3D();

    // UI Elements
    DrawText("HEXABOARD 3D VIEWER", 10, 10, 20, GREEN);
    DrawText(TextFormat("Parts loaded: %d/%d", partsLoaded, PARTS_COUNT), 10, 35, 16, LIGHTGRAY);
    DrawText(TextFormat("Explode: %.0f%%", explodeFactor * 100), 10, 55, 16, LIGHTGRAY);

    // Draw slider
    DrawRectangleRec(sliderRect, (Color){40, 40, 50, 200});
    DrawRectangleLinesEx(sliderRect, 2, GREEN);

    // Slider handle
    float handleX = sliderRect.x + (sliderRect.width * explodeFactor);
    Rectangle handle = {handleX - 10, sliderRect.y - 5, 20, sliderRect.height + 10};
    DrawRectangleRec(handle, draggingSlider ? LIME : GREEN);
    DrawRectangleLinesEx(handle, 2, WHITE);

    // Slider labels
    DrawText("Zusammen", sliderRect.x - 80, sliderRect.y + 2, 14, WHITE);
    DrawText("Explodiert", sliderRect.x + sliderRect.width + 10, sliderRect.y + 2, 14, WHITE);

    DrawFPS(screenWidth - 90, 10);

    EndDrawing();
}

int main(void)
{
    const int screenWidth = 1200;
    const int screenHeight = 800;

    InitWindow(screenWidth, screenHeight, "Hexaboard 3D Viewer - Exploded View");
    SetWindowState(FLAG_WINDOW_RESIZABLE);

    camera.position = (Vector3){15.0f, 10.0f, 15.0f};
    camera.target = (Vector3){0.0f, 0.0f, 0.0f};
    camera.up = (Vector3){0.0f, 1.0f, 0.0f};
    camera.fovy = 45.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    // Load shader
    lightingShader = LoadShader("Assets/lighting.vs", "Assets/lighting.fs");
    if (lightingShader.id > 0)
    {
        lightDirLoc = GetShaderLocation(lightingShader, "lightDir");
        TraceLog(LOG_INFO, "Lighting shader loaded successfully");
    }

    // Initialize keyboard parts
    parts[0] = (KeyboardPart){
        .model = {0},
        .color = (Color){44, 62, 80, 255}, // Dark gray - Boden
        .explodeOffset = (Vector3){0.0f, -7.0f, 0.0f},
        .scale = (Vector3){0.25f, 0.25f, 0.25f},
        .loaded = false,
        .name = "Boden"};

    parts[1] = (KeyboardPart){
        .model = {0},
        .color = (Color){0, 200, 100, 255},            // Green - PCB
        .explodeOffset = (Vector3){0.0f, -5.0f, 0.0f}, // X-Offset wegen nicht-zentriertem Modell
        .scale = (Vector3){250.0f, 250.0f, 250.0f},
        .loaded = false,
        .name = "PCB"};

    parts[2] = (KeyboardPart){
        .model = {0},
        .color = (Color){52, 73, 94, 255}, // Gray - Plate
        .explodeOffset = (Vector3){0.0f, -6.0f, 0.0f},
        .scale = (Vector3){0.25f, 0.25f, 0.25f},
        .loaded = false,
        .name = "Plate"};

    parts[3] = (KeyboardPart){
        .model = {0},
        .color = (Color){107, 125, 184, 255}, // Blue - Gehäuse
        .explodeOffset = (Vector3){0.0f, 1.0f, 0.0f},
        .scale = (Vector3){0.25f, 0.25f, 0.25f},
        .loaded = false,
        .name = "Gehäuse"};

    parts[4] = (KeyboardPart){
        .model = {0},
        .color = (Color){231, 76, 60, 255}, // Red - Switches
        .explodeOffset = (Vector3){0.0f, 4.5f, 0.0f},
        .scale = (Vector3){2.5f, 2.5f, 2.5f},
        .loaded = false,
        .name = "Switches"};

    parts[5] = (KeyboardPart){
        .model = {0},
        .color = (Color){236, 240, 241, 255}, // White - Keycaps
        .explodeOffset = (Vector3){0.0f, 5.5f, 0.0f},
        .scale = (Vector3){2.5f, 2.5f, 2.5f},
        .loaded = false,
        .name = "Keycaps"};

    // Load all parts
    const char *modelPaths[PARTS_COUNT] = {
        "Assets/Hexaboard_v2 Karabiner v3_Hexaboard_v2 Karabiner v3_Boden.obj",
        "Assets/pcb.obj",
        "Assets/Hexaboard_v2 Karabiner v3_Hexaboard_v2 Karabiner v3_Plate.obj",
        "Assets/Hexaboard_v2 Karabiner v3_Hexaboard_v2 Karabiner v3_Gehäuse.obj",
        "Assets/Hexaboard_v2 Switches.obj",
        "Assets/Hexaboard_v2 Caps.obj"};

    for (int i = 0; i < PARTS_COUNT; i++)
    {
        TraceLog(LOG_INFO, "Loading: %s", parts[i].name);
        parts[i].model = LoadModel(modelPaths[i]);

        if (parts[i].model.meshCount > 0)
        {
            parts[i].loaded = true;
            partsLoaded++;
            TraceLog(LOG_INFO, "✓ %s loaded (%d meshes)", parts[i].name, parts[i].model.meshCount);

            // Apply shader to all materials
            if (lightingShader.id > 0)
            {
                for (int j = 0; j < parts[i].model.materialCount; j++)
                {
                    parts[i].model.materials[j].shader = lightingShader;
                    // Set color
                    parts[i].model.materials[j].maps[MATERIAL_MAP_DIFFUSE].color = parts[i].color;
                }
            }
        }
        else
        {
            TraceLog(LOG_WARNING, "✗ Failed to load: %s", parts[i].name);
        }
    }

    TraceLog(LOG_INFO, "Loaded %d/%d keyboard parts", partsLoaded, PARTS_COUNT);

#if defined(PLATFORM_WEB)
    emscripten_set_main_loop(UpdateDrawFrame, 0, 1);
#else
    SetTargetFPS(60);
    while (!WindowShouldClose())
    {
        UpdateDrawFrame();
    }

    // Cleanup
    for (int i = 0; i < PARTS_COUNT; i++)
    {
        if (parts[i].loaded)
        {
            UnloadModel(parts[i].model);
        }
    }

    if (lightingShader.id > 0)
    {
        UnloadShader(lightingShader);
    }
#endif

    CloseWindow();
    return 0;
}
