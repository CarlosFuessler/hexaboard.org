#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Icons
CHECK="✓"
CROSS="✗"
ROCKET="🚀"
WRENCH="🔧"
PACKAGE="📦"
DISPLAY="🖥️"
WEB="🌐"

# Function to print header
print_header() {
    clear
    echo -e "${PURPLE}${BOLD}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║           HEXABOARD BUILD SYSTEM ${ROCKET}                ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Function to print step
print_step() {
    echo -e "${CYAN}${BOLD}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to show menu
show_menu() {
    print_header
    echo -e "${BOLD}Select build target:${NC}\n"
    echo -e "${BLUE}1)${NC} ${DISPLAY} Build Desktop (Raylib C++)"
    echo -e "${BLUE}2)${NC} ${WEB} Build WebAssembly (Raylib → WASM)"
    echo -e "${BLUE}3)${NC} ${PACKAGE} Build Frontend (Next.js)"
    echo -e "${BLUE}4)${NC} ${ROCKET} Build Everything"
    echo -e "${BLUE}5)${NC} ${WRENCH} Clean All Builds"
    echo -e "${BLUE}6)${NC} Exit\n"
    echo -ne "${BOLD}Enter choice [1-6]: ${NC}"
}

# Function to build desktop
build_desktop() {
    print_step "Building Desktop Application..."
    cd hexaboard/rendering
    
    if [ -d "build" ]; then
        print_warning "Cleaning previous build..."
        rm -rf build
    fi
    
    mkdir -p build
    cd build
    
    print_step "Running CMake..."
    if cmake .. > /dev/null 2>&1; then
        print_success "CMake configuration successful"
    else
        print_error "CMake configuration failed"
        return 1
    fi
    
    print_step "Compiling..."
    if make -j$(sysctl -n hw.ncpu) 2>&1 | grep -E "(error|warning)" || true; then
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            print_success "Compilation successful!"
            echo -e "\n${GREEN}${BOLD}Run with: ${NC}./hexaboard/rendering/build/hexaboard_viewer\n"
            
            # Ask to run
            echo -ne "${BOLD}Do you want to run it now? (y/n): ${NC}"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                ./hexaboard_viewer
            fi
        else
            print_error "Compilation failed"
            return 1
        fi
    fi
    
    cd ../../..
}

# Function to build wasm
build_wasm() {
    print_step "Building WebAssembly..."
    
    # Check if emscripten is installed
    if ! command -v emcc &> /dev/null; then
        print_error "Emscripten not found!"
        echo -e "${YELLOW}Install with: brew install emscripten${NC}"
        return 1
    fi
    
    cd hexaboard/rendering
    
    if [ -d "build-wasm" ]; then
        print_warning "Cleaning previous WASM build..."
        rm -rf build-wasm
    fi
    
    mkdir -p build-wasm
    cd build-wasm
    
    print_step "Running Emscripten CMake..."
    if emcmake cmake .. > /dev/null 2>&1; then
        print_success "CMake configuration successful"
    else
        print_error "CMake configuration failed"
        return 1
    fi
    
    print_step "Compiling to WebAssembly..."
    if emmake make 2>&1 | grep -E "(error|warning)" || true; then
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            print_success "WASM compilation successful!"
            echo -e "\n${GREEN}${BOLD}Run with: ${NC}emrun hexaboard/rendering/build-wasm/hexaboard_viewer.html\n"
            
            # Ask to run
            echo -ne "${BOLD}Do you want to run it now? (y/n): ${NC}"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                emrun hexaboard_viewer.html
            fi
        else
            print_error "WASM compilation failed"
            return 1
        fi
    fi
    
    cd ../../..
}

# Function to build frontend
build_frontend() {
    print_step "Building Next.js Frontend..."
    cd hexaboard
    
    if [ ! -d "node_modules" ]; then
        print_step "Installing dependencies..."
        npm install
    fi
    
    print_step "Building production bundle..."
    if npm run build; then
        print_success "Frontend build successful!"
        echo -e "\n${GREEN}${BOLD}Start with: ${NC}cd hexaboard && npm start\n"
        
        # Ask to run
        echo -ne "${BOLD}Do you want to start the server? (y/n): ${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            npm start
        fi
    else
        print_error "Frontend build failed"
        return 1
    fi
    
    cd ..
}

# Function to build everything
build_all() {
    print_header
    echo -e "${PURPLE}${BOLD}Building Everything...${NC}\n"
    
    build_desktop
    echo ""
    build_wasm
    echo ""
    build_frontend
    
    echo -e "\n${GREEN}${BOLD}${ROCKET} All builds complete! ${ROCKET}${NC}\n"
}

# Function to clean
clean_all() {
    print_step "Cleaning all builds..."
    
    rm -rf hexaboard/rendering/build
    rm -rf hexaboard/rendering/build-wasm
    rm -rf hexaboard/.next
    rm -rf hexaboard/out
    
    print_success "All builds cleaned!"
}

# Main loop
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1)
            print_header
            build_desktop
            echo -e "\n${BOLD}Press Enter to continue...${NC}"
            read -r
            ;;
        2)
            print_header
            build_wasm
            echo -e "\n${BOLD}Press Enter to continue...${NC}"
            read -r
            ;;
        3)
            print_header
            build_frontend
            echo -e "\n${BOLD}Press Enter to continue...${NC}"
            read -r
            ;;
        4)
            build_all
            echo -e "\n${BOLD}Press Enter to continue...${NC}"
            read -r
            ;;
        5)
            print_header
            clean_all
            echo -e "\n${BOLD}Press Enter to continue...${NC}"
            read -r
            ;;
        6)
            print_header
            echo -e "${GREEN}Thanks for building Hexaboard! ${ROCKET}${NC}\n"
            exit 0
            ;;
        *)
            print_error "Invalid option. Please try again."
            sleep 1
            ;;
    esac
done