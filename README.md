# Doom Web

[![Tests](https://img.shields.io/badge/tests-15%2F15%20passing-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/Prompt-0/doom-web)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-blue?style=for-the-badge&logo=typescript)](https://github.com/Prompt-0/doom-web)
[![Vite](https://img.shields.io/badge/vite-6.2-purple?style=for-the-badge&logo=vite)](https://github.com/Prompt-0/doom-web)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

A retro 2.5D first-person raycasting engine recreation inspired by id Software's classic DOOM. Implemented in pure TypeScript and HTML5 Canvas with zero external 3D libraries, featuring DDA raycasting, monster AI state machines, weapon animations, collision physics, and procedural Web Audio SFX.

---

## 🎮 Engine Architecture & Features

- **DDA Raycasting Pipeline**: Real-time Digital Differential Analysis (DDA) raycaster rendering textured wall slices, depth-based fog shading, and sprite billboards at 60 FPS.
- **Entity & AI State Machines**: Finite state machine (FSM) driven monster behaviors including idle patrol, line-of-sight player detection, ranged/melee attacks, pain states, and death sequences.
- **Arsenal System**: Complete retro weapon arsenal (Fist, Pistol, Shotgun, Chaingun, Plasma Rifle) with sprite frame animations, muzzle flash lighting, and hitscan/projectile ballistic math.
- **Procedural Web Audio Engine**: Synthesizes authentic retro sound effects directly in the browser using the Web Audio API without relying on external WAV/MP3 soundbanks.
- **Deterministic Collision & Movement**: Circle-AABB spatial grid collision detection, strafing physics, and camera bobbing.
- **Automated Test Suite**: 15 unit tests covering collision resolution, cheat codes, weapon ammo state, asset parsing, and monster AI transitions.

---

## 🕹️ Controls

| Key | Action |
| :--- | :--- |
| `W` / `S` | Move Forward / Backward |
| `A` / `D` | Strafe Left / Right |
| `←` / `→` | Turn Left / Right |
| `Space` / `Left Click` | Fire Weapon |
| `1` - `5` | Switch Weapons |
| `Shift` | Sprint |
| `E` | Open Doors / Interact |

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Prompt-0/doom-web.git
cd doom-web

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Run unit tests
npm run test

# Type check
npm run typecheck

# Build for production
npm run build
```

---

## 📄 License
Licensed under the MIT License.
