import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Wand2, Settings, Trophy } from 'lucide-react';
import Board from './components/Board';
import { generateSudoku, type BoardState } from './utils/GameEngine';
import './index.css';

function App() {
  const [board, setBoard] = useState<BoardState>([]);
  const [difficulty, _setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [history, setHistory] = useState<BoardState[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [solutionBoard, setSolutionBoard] = useState<number[][]>([]);

  const [gameRules, setGameRules] = useState<any>({ variant: 'STANDARD' });
  const prevVariantRef = useRef<string>('STANDARD');

  useEffect(() => {
    // Only start new game if variant actually changed
    if (gameRules.variant !== prevVariantRef.current) {
      prevVariantRef.current = gameRules.variant;
      startNewGame();
    }
  }, [gameRules.variant]); // Only depend on variant, not entire gameRules object

  // Initial game on mount
  useEffect(() => {
    startNewGame();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || gameWon) return;

    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, gameWon]);

  const startNewGame = () => {
    // If Odd/Even, we need to pass a fresh object to populate
    const rules: any = { variant: gameRules.variant };
    if (rules.variant === 'ODD_EVEN') {
      rules.oddCells = [];
      rules.evenCells = [];
    }
    if (rules.variant === 'KILLER') {
      rules.cages = [];
    }
    if (rules.variant === 'CONSECUTIVE') {
      rules.consecutiveBars = [];
    }

    const { board: newBoard, solution } = generateSudoku(difficulty, rules); // Get both board and solution

    // Update gameRules with the populated data (oddCells, evenCells, cages, etc.)
    // This is safe now because useEffect only triggers on variant change, not on the entire object
    setGameRules(rules);

    setBoard(newBoard);
    setSolutionBoard(solution);
    setHistory([]);
    setGameWon(false);
    setSelectedCell(null);
    setMistakes(0);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const handleCellClick = (r: number, c: number) => {
    setSelectedCell([r, c]);
  };

  const handleInput = (num: number) => {
    if (!selectedCell || gameWon) return;
    const [r, c] = selectedCell;
    const cell = board[r][c];
    if (cell.isFixed) return;

    // Use functional state update to ensure immutable consistency
    const newBoard = board.map(row => row.map(c => ({ ...c }))); // Deep copy for simplicity (2 levels)
    // Actually shallow copy of rows is enough if we replace the cell object

    if (isNotesMode) {
      const notes = newBoard[r][c].notes;
      if (notes.includes(num)) {
        newBoard[r][c].notes = notes.filter(n => n !== num);
      } else {
        newBoard[r][c].notes = [...notes, num];
      }
    } else {
      const newValue = num === newBoard[r][c].value ? null : num;
      newBoard[r][c].value = newValue;

      // Check for mistakes
      if (newValue !== null && solutionBoard.length > 0) {
        const correctValue = solutionBoard[r][c];
        if (newValue !== correctValue) {
          newBoard[r][c].error = true;
          setMistakes(prev => {
            const newMistakes = prev + 1;
            if (newMistakes >= 3) {
              setIsTimerRunning(false);
              // Game over logic could go here
            }
            return newMistakes;
          });
        } else {
          newBoard[r][c].error = false;
        }
      }

      // Clear notes if value filled
      if (newBoard[r][c].value) newBoard[r][c].notes = [];
    }

    setHistory([...history, board]); // Save old state
    setBoard(newBoard);

    // Check Win
    // TODO: Add full validation check here
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        handleInput(num);
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        // Clear
        if (!selectedCell) return;
        const [r, c] = selectedCell;
        if (board[r][c].isFixed) return;

        const newBoard = board.map(row => row.map(c => ({ ...c })));
        newBoard[r][c].value = null;
        setBoard(newBoard);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedCell, board, isNotesMode]);

  return (
    <div className="min-h-screen flex flex-col items-center py-8">
      {/* Header */}
      <header className="flex justify-between items-center w-full max-w-4xl mb-8 px-4">
        <div className="flex items-center gap-3">
          <div className="bg-accent p-2 rounded-xl">
            <Trophy color="white" size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-500">
            Sudoku Pro
          </h1>
        </div>
        <div className="flex gap-4">
          <button className="btn-icon bg-white text-accent hover:bg-accent hover:text-white"
            onClick={startNewGame}>
            <Play size={20} />
          </button>
          <button className="btn-icon bg-white" onClick={() => { }}>
            <Settings size={20} />
          </button>
          <select
            className="bg-white border-none rounded-lg p-2 font-medium text-secondary cursor-pointer hover:bg-gray-50 outline-none"
            value={gameRules.variant}
            onChange={(e) => setGameRules({ variant: e.target.value })}
          >
            <option value="STANDARD">Standard</option>
            <option value="ODD_EVEN">Odd/Even</option>
            <option value="KILLER">Killer</option>
            <option value="CONSECUTIVE">Consecutive</option>
          </select>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex flex-col lg:flex-row gap-8 items-center justify-center w-full max-w-6xl px-4">


        {/* Board */}
        {board.length > 0 ? (
          <Board
            board={board}
            onCellClick={handleCellClick}
            selectedCell={selectedCell}
            highlightNumber={selectedCell && board[selectedCell[0]][selectedCell[1]].value ? board[selectedCell[0]][selectedCell[1]].value : null}
            rules={gameRules}
          />
        ) : (
          <div className="flex-center w-full h-96 glass-panel">
            <span className="text-xl font-medium text-secondary">Generating Puzzle...</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-6 w-full max-w-xs">

          {/* Status Panel */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-secondary font-medium uppercase text-sm tracking-wider">Difficulty</span>
              <span className="font-bold text-accent capitalize">{difficulty}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary font-medium uppercase text-sm tracking-wider">Mistakes</span>
              <span className="font-bold text-error">{mistakes}/3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary font-medium uppercase text-sm tracking-wider">Time</span>
              <span className="font-mono text-xl">{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-secondary glass-panel p-4 flex flex-col items-center gap-2 hover:bg-white/80 transition"
              onClick={() => {
                if (history.length > 0) {
                  setBoard(history[history.length - 1]);
                  setHistory(history.slice(0, -1));
                }
              }}
            >
              <RotateCcw size={20} />
              <span className="text-sm font-medium">Undo</span>
            </button>
            <button
              className={`glass-panel p-4 flex flex-col items-center gap-2 transition ${isNotesMode ? 'bg-accent/10 border-accent' : 'hover:bg-white/80'}`}
              onClick={() => setIsNotesMode(!isNotesMode)}
            >
              <Wand2 size={20} color={isNotesMode ? 'var(--color-accent)' : 'currentColor'} />
              <span className="text-sm font-medium">Notes</span>
            </button>
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                className="btn-num glass-panel h-14 flex-center rounded-xl hover:bg-accent hover:text-white"
                onClick={() => handleInput(num)}
              >
                {num}
              </button>
            ))}
          </div>

          <button className="btn-primary w-full shadow-lg shadow-accent/20">
            New Game
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
