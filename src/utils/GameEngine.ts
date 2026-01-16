export type Cell = {
    row: number;
    col: number;
    value: number | null;
    isFixed: boolean;
    notes: number[];
    error?: boolean;
};

export type BoardState = Cell[][];

export type VariantType = 'STANDARD' | 'ODD_EVEN' | 'CONSECUTIVE' | 'KILLER';

export type KillerCage = {
    cells: [number, number][]; // [row, col]
    sum: number;
};

export type GameRules = {
    variant: VariantType;
    cages?: KillerCage[];
    oddCells?: [number, number][]; // [row, col]
    evenCells?: [number, number][]; // [row, col]
    parityMap?: ('odd' | 'even')[][]; // For Odd/Even variant
    // Pair of cells [r1, c1, r2, c2]
    consecutiveBars?: [number, number, number, number][];
};

const BLANK = 0;

function isValidStandard(board: number[][], row: number, col: number, num: number): boolean {
    // Row & Col
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num && i !== col) return false;
        if (board[i][col] === num && i !== row) return false;
    }
    // Box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num && (startRow + i !== row || startCol + j !== col)) {
                return false;
            }
        }
    }
    return true;
}

// Check variants during placement
/*
function isValidVariant(board: number[][], row: number, col: number, num: number, rules: GameRules): boolean {
    if (rules.variant === 'ODD_EVEN') {
        // Logic placeholder
    }
    return true;
}
*/

function solveSudoku(board: number[][], rules: GameRules): boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === BLANK) {
                // Randomize order for generation variety
                const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                for (const num of nums) {
                    if (isValidStandard(board, row, col, num)) { // Add variant check here later
                        board[row][col] = num;
                        if (solveSudoku(board, rules)) return true;
                        board[row][col] = BLANK;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

export const generateSudoku = (difficulty: 'easy' | 'medium' | 'hard', rules: GameRules = { variant: 'STANDARD' }): { board: BoardState, solution: number[][] } => {
    // 1. Create empty
    const rawBoard: number[][] = Array.from({ length: 9 }, () => Array(9).fill(BLANK));

    // 2. Fill diagonal boxes (independent) to speed up
    for (let i = 0; i < 9; i = i + 3) {
        fillBox(rawBoard, i, i);
    }

    // 3. Solve to get a full valid board
    solveSudoku(rawBoard, rules);

    // Store the solution before removing numbers
    const solution: number[][] = rawBoard.map(row => [...row]);

    // 4. Generate variants data if needed
    if (rules.variant === 'ODD_EVEN') {
        rules.oddCells = [];
        rules.evenCells = [];
        // Store the parity information for ALL cells first
        const parityMap: ('odd' | 'even')[][] = [];
        for (let r = 0; r < 9; r++) {
            parityMap[r] = [];
            for (let c = 0; c < 9; c++) {
                parityMap[r][c] = rawBoard[r][c] % 2 !== 0 ? 'odd' : 'even';
            }
        }
        // We'll mark empty cells AFTER removing numbers
        rules.parityMap = parityMap;
    } else if (rules.variant === 'KILLER') {
        rules.cages = [];
        const visited = new Set<string>();

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (visited.has(`${r},${c}`)) continue;

                const cageSize = Math.floor(Math.random() * 4) + 1; // 1-5 size
                const currentCage: [number, number][] = [];
                const queue: [number, number][] = [[r, c]];
                let sum = 0;

                while (queue.length > 0 && currentCage.length < cageSize) {
                    const [cr, cc] = queue.shift()!;
                    if (visited.has(`${cr},${cc}`)) continue;

                    visited.add(`${cr},${cc}`);
                    currentCage.push([cr, cc]);
                    sum += rawBoard[cr][cc]; // Use value from solved board

                    // Neighbors
                    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
                    // Randomize directions to get irregular shapes
                    directions.sort(() => Math.random() - 0.5);

                    for (const [dr, dc] of directions) {
                        const nr = cr + dr;
                        const nc = cc + dc;
                        if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && !visited.has(`${nr},${nc}`)) {
                            // Only add same box neighbors to keep it simple?, or allow cross box?
                            // Killer cages usually don't respect boxes, but easier to generate if we don't care.
                            // Let's just blindly adjacent.
                            queue.push([nr, nc]);
                        }
                    }
                }

                // If queue ran out but we haven't reached size, that's fine, close cage.
                // If queue ran out but we haven't reached size, that's fine, close cage.
                rules.cages.push({ cells: currentCage, sum });
            }
        }
    } else if (rules.variant === 'CONSECUTIVE') {
        rules.consecutiveBars = [];
        // Check horizontal
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 8; c++) {
                if (Math.abs(rawBoard[r][c] - rawBoard[r][c + 1]) === 1) {
                    rules.consecutiveBars.push([r, c, r, c + 1]);
                }
            }
        }
        // Check vertical
        for (let c = 0; c < 9; c++) {
            for (let r = 0; r < 8; r++) {
                if (Math.abs(rawBoard[r][c] - rawBoard[r + 1][c]) === 1) {
                    rules.consecutiveBars.push([r, c, r + 1, c]);
                }
            }
        }
    }

    // 5. Remove numbers based on difficulty
    // Better logic: Keep N cells. 
    // Easy: keep 40. Medium: keep 30. Hard: keep 24.
    const cellsToKeep = difficulty === 'easy' ? 45 : difficulty === 'medium' ? 35 : 28;
    const totalCells = 81;
    let removed = 0;
    const toRemove = totalCells - cellsToKeep;

    while (removed < toRemove) {
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);
        if (rawBoard[r][c] !== BLANK) {
            rawBoard[r][c] = BLANK;
            removed++;
        }
    }

    // 6. For Odd/Even variant, mark only EMPTY cells with parity indicators
    if (rules.variant === 'ODD_EVEN' && rules.parityMap) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                // Only mark cells that are now EMPTY (after removal)
                if (rawBoard[r][c] === BLANK) {
                    if (rules.parityMap[r][c] === 'odd') {
                        rules.oddCells!.push([r, c]);
                    } else {
                        rules.evenCells!.push([r, c]);
                    }
                }
            }
        }
    }

    // Convert to Cell objects
    const board = rawBoard.map((row, rIdx) =>
        row.map((val, cIdx) => ({
            row: rIdx,
            col: cIdx,
            value: val === BLANK ? null : val,
            isFixed: val !== BLANK,
            notes: [],
            error: false
        }))
    );

    return { board, solution };
};

function fillBox(board: number[][], row: number, col: number) {
    let num: number;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            do {
                num = Math.floor(Math.random() * 9) + 1;
            } while (!isSafeInBox(board, row, col, num));
            board[row + i][col + j] = num;
        }
    }
}

function isSafeInBox(board: number[][], row: number, col: number, num: number) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[row + i][col + j] === num) return false;
        }
    }
    return true;
}

// Validity Checker (Public)
export const validateBoard = (_board: BoardState): boolean => {
    // Simple check: are there errors? 
    // Real check: re-run isSafe logic for all filled cells
    // For visual feedback, we usually update 'error' prop on cells.
    return true;
};
