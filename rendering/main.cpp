#include <raylib.h>
#include <raymath.h>
#include <vector>
#include <dirent.h>
#include <string>
#include <algorithm>

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

// UI / effect globals
float patsDistance = 1.5f;     // Abstand zwischen 'Pats'
float effectStrength = 0.5f;   // Stärke des Wobble-Effekts
std::vector<Model> meshModels; // Einzelne Modelle pro Mesh
// Optional: separate OBJ parts placed in Assets/
std::vector<Model> partModels; // einzelne OBJ-Dateien (Assets)
std::vector<Vector3> partCenters;
std::vector<Vector3> partDirs;
Vector3 partsOverallCenter = {0, 0, 0};
float partSeparation = 0.0f; // Abstand zum Auseinanderschieben
bool sliderActiveSpacing = false;
bool sliderActiveEffect = false;
bool sliderActiveSeparation = false;

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
        if (!partModels.empty())
        {
            int pc = (int)partModels.size();
            for (int i = 0; i < pc; i++)
            {
                Vector3 base = Vector3Subtract(partCenters[i], partsOverallCenter);
                Vector3 offset = Vector3Scale(partDirs[i], partSeparation);
                float wobble = sinf(GetTime() * 2.0f + i) * effectStrength;
                Vector3 pos = Vector3Add(base, offset);
                pos.y += wobble;
                DrawModelEx(partModels[i], pos, (Vector3){1.0f, 0.0f, 0.0f}, -90.0f, (Vector3){1.0f, 1.0f, 1.0f}, WHITE);
            }
        }
        else
        {
            int mc = (int)meshModels.size();
            for (int i = 0; i < mc; i++)
            {
                float idx = i - (mc - 1) * 0.5f; // center the row
                float x = idx * patsDistance;
                float wobble = sinf(GetTime() * 2.0f + i) * effectStrength;
                Vector3 pos = {x, wobble, 0.0f};
                DrawModelEx(meshModels[i], pos, (Vector3){1.0f, 0.0f, 0.0f}, -90.0f, (Vector3){1.0f, 1.0f, 1.0f}, WHITE);
            }
        }
    }
    else
    {

        DrawCube((Vector3){0.0f, 0.0f, 0.0f}, 2.0f, 0.5f, 3.0f, SKYBLUE);
        DrawCubeWires((Vector3){0.0f, 0.0f, 0.0f}, 2.0f, 0.5f, 3.0f, WHITE);
    }

    EndMode3D();

    // --- Simple sliders (spacing + effect + separation) ---
    Rectangle sliderRect = {20, 20, 220, 6};
    Rectangle sliderRect2 = {20, 50, 220, 6};
    Rectangle sliderRect3 = {20, 80, 220, 6};
    Vector2 mpos = GetMousePosition();
    bool mouseDown = IsMouseButtonDown(MOUSE_BUTTON_LEFT);

    // Spacing slider interaction
    if ((mouseDown && CheckCollisionPointRec(mpos, sliderRect)) || sliderActiveSpacing)
    {
        sliderActiveSpacing = mouseDown;
        float t = (mpos.x - sliderRect.x) / sliderRect.width;
        if (t < 0)
            t = 0;
        if (t > 1)
            t = 1;
        patsDistance = 0.2f + t * 6.0f; // range 0.2 - 6.2
    }

    // Effect slider interaction
    if ((mouseDown && CheckCollisionPointRec(mpos, sliderRect2)) || sliderActiveEffect)
    {
        sliderActiveEffect = mouseDown;
        float t = (mpos.x - sliderRect2.x) / sliderRect2.width;
        if (t < 0)
            t = 0;
        if (t > 1)
            t = 1;
        effectStrength = t * 2.0f; // range 0 - 2
    }

    // Separation slider interaction (for individual parts)
    if ((mouseDown && CheckCollisionPointRec(mpos, sliderRect3)) || sliderActiveSeparation)
    {
        sliderActiveSeparation = mouseDown;
        float t = (mpos.x - sliderRect3.x) / sliderRect3.width;
        if (t < 0)
            t = 0;
        if (t > 1)
            t = 1;
        partSeparation = t * 10.0f; // range 0 - 10
    }

    // Draw sliders
    DrawRectangleRec(sliderRect, DARKGRAY);
    float thumbX = sliderRect.x + ((patsDistance - 0.2f) / 6.0f) * sliderRect.width;
    DrawCircleV((Vector2){thumbX, sliderRect.y + sliderRect.height * 0.5f}, 8, GREEN);
    DrawText(TextFormat("Spacing: %.2f", patsDistance), 20, 8, 12, WHITE);

    DrawRectangleRec(sliderRect2, DARKGRAY);
    float thumbX2 = sliderRect2.x + (effectStrength / 2.0f) * sliderRect2.width;
    DrawCircleV((Vector2){thumbX2, sliderRect2.y + sliderRect2.height * 0.5f}, 8, GREEN);
    DrawText(TextFormat("Effect: %.2f", effectStrength), 20, 38, 12, WHITE);

    DrawRectangleRec(sliderRect3, DARKGRAY);
    float thumbX3 = sliderRect3.x + (partSeparation / 10.0f) * sliderRect3.width;
    DrawCircleV((Vector2){thumbX3, sliderRect3.y + sliderRect3.height * 0.5f}, 8, GREEN);
    DrawText(TextFormat("Separation: %.2f", partSeparation), 20, 68, 12, WHITE);

    // -----------------------------------------

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

        // Build individual models per mesh so we can transform them separately
        meshModels.clear();
        meshModels.reserve(keyboardModel.meshCount);
        for (int i = 0; i < keyboardModel.meshCount; i++)
        {
            Model sub = LoadModelFromMesh(keyboardModel.meshes[i]);
            if (sub.materialCount > 0 && keyboardModel.materialCount > 0)
            {
                sub.materials[0] = keyboardModel.materials[i % keyboardModel.materialCount];
            }
            meshModels.push_back(sub);
        }

        // Try loading individual OBJ files from Assets/ (skip combined model if present)
        {
            DIR *d = opendir("Assets");
            if (d)
            {
                struct dirent *entry;
                std::vector<Model> loadedParts;
                while ((entry = readdir(d)) != NULL)
                {
                    std::string name(entry->d_name);
                    if (name.size() > 4 && name.substr(name.size() - 4) == ".obj")
                    {
                        if (name == "Hexaboard_v3_Display.obj")
                            continue; // skip combined
                        std::string path = std::string("Assets/") + name;
                        Model pm = LoadModel(path.c_str());
                        if (pm.meshCount > 0)
                        {
                            for (int mi = 0; mi < pm.materialCount; mi++)
                                pm.materials[mi].shader = lightingShader;
                            loadedParts.push_back(pm);
                        }
                        else
                        {
                            UnloadModel(pm);
                        }
                    }
                }
                closedir(d);

                if (!loadedParts.empty())
                {
                    partModels = std::move(loadedParts);
                    partCenters.clear();
                    partDirs.clear();
                    partCenters.resize(partModels.size());
                    for (size_t i = 0; i < partModels.size(); ++i)
                    {
                        BoundingBox pb = GetModelBoundingBox(partModels[i]);
                        partCenters[i] = (Vector3){(pb.min.x + pb.max.x) * 0.5f, (pb.min.y + pb.max.y) * 0.5f, (pb.min.z + pb.max.z) * 0.5f};
                    }
                    Vector3 overall = {0, 0, 0};
                    for (auto &c : partCenters)
                        overall = Vector3Add(overall, c);
                    overall = Vector3Scale(overall, 1.0f / (float)partCenters.size());
                    partsOverallCenter = overall;
                    partDirs.resize(partCenters.size());
                    for (size_t i = 0; i < partCenters.size(); ++i)
                    {
                        Vector3 dir = Vector3Subtract(partCenters[i], overall);
                        float len = Vector3Length(dir);
                        if (len < 1e-6f)
                        {
                            dir = (Vector3){(float)i - (float)partCenters.size() * 0.5f, 0.0f, 0.0f};
                            dir = Vector3Normalize(dir);
                        }
                        else
                        {
                            dir = Vector3Normalize(dir);
                        }
                        partDirs[i] = dir;
                    }
                }
            }
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
        for (auto &m : meshModels)
            UnloadModel(m);
        for (auto &p : partModels)
            UnloadModel(p);
        UnloadModel(keyboardModel);
    }
    UnloadShader(lightingShader);
#endif

    CloseWindow();
    return 0;
}
