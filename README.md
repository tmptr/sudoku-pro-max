# Sudoku Pro Max 🎮

A premium Sudoku game with a modern glassmorphism UI and support for multiple Sudoku variants.

![Sudoku Pro Max](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple)

## ✨ Features

### Game Modes
- **Standard Sudoku**: Classic 9x9 Sudoku puzzle
- **Odd/Even Sudoku**: Cells marked with circles (odd) or squares (even) as constraints
- **Killer Sudoku**: Cages with sum constraints
- **Consecutive Sudoku**: Bars between cells with consecutive values

### Gameplay Features
- ✅ **Mistake Tracking**: Track up to 3 mistakes with visual feedback
- ⏱️ **Timer**: Real-time game timer
- 📝 **Notes Mode**: Add candidate numbers to cells
- ↩️ **Undo**: Undo your last move
- 🎯 **Smart Highlighting**: Highlights related cells and numbers
- ⌨️ **Keyboard Support**: Full keyboard navigation and input
- 🎨 **Premium UI**: Glassmorphism design with smooth animations

### Difficulty Levels
- Easy
- Medium
- Hard

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Docker

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# Stop the container
docker-compose down
```

The app will be available at `http://localhost:3000`

### Using Docker directly

```bash
# Build the image
docker build -t sudoku-pro-max .

# Run the container
docker run -d -p 3000:80 sudoku-pro-max
```

## 🎮 How to Play

1. **Select a game mode** from the dropdown (Standard, Odd/Even, Killer, or Consecutive)
2. **Click on an empty cell** to select it
3. **Enter a number** (1-9) using your keyboard or the on-screen numpad
4. **Use Notes mode** to add candidate numbers
5. **Track your progress** with the timer and mistake counter
6. **Complete the puzzle** without making 3 mistakes!

### Variant-Specific Rules

**Odd/Even Sudoku**
- Circles (○) indicate cells that must contain odd numbers (1, 3, 5, 7, 9)
- Squares (□) indicate cells that must contain even numbers (2, 4, 6, 8)

**Killer Sudoku**
- Numbers in a cage must sum to the indicated total
- Numbers cannot repeat within a cage

**Consecutive Sudoku**
- Teal bars between cells indicate the numbers must be consecutive (differ by 1)

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **Vanilla CSS** - Styling with custom design system

## 📁 Project Structure

```
sudoku/
├── src/
│   ├── components/
│   │   └── Board.tsx          # Sudoku board component
│   ├── utils/
│   │   └── GameEngine.ts      # Game logic and puzzle generation
│   ├── App.tsx                # Main app component
│   ├── index.css              # Global styles and design system
│   └── main.tsx               # App entry point
├── Dockerfile                 # Docker build configuration
├── docker-compose.yml         # Docker Compose setup
├── nginx.conf                 # Nginx configuration
└── package.json               # Dependencies
```

## 🎨 Design System

The app uses a custom CSS design system with:
- **Glassmorphism effects**: Backdrop blur and transparency
- **Color palette**: Purple accent with gradient backgrounds
- **Responsive layout**: Works on desktop and mobile
- **Smooth animations**: Hover effects and transitions

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 🙏 Acknowledgments

Built with ❤️ using modern web technologies and best practices.

---

**Enjoy playing Sudoku Pro Max!** 🎯
