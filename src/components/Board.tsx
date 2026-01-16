import React from 'react';
import type { Cell } from '../utils/GameEngine';

interface BoardProps {
    board: Cell[][];
    onCellClick: (row: number, col: number) => void;
    selectedCell: [number, number] | null;
    highlightNumber: number | null;
    rules?: {
        oddCells?: [number, number][],
        evenCells?: [number, number][],
        cages?: { cells: [number, number][], sum: number }[],
        consecutiveBars?: [number, number, number, number][]
    };
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, selectedCell, highlightNumber, rules }) => {
    // We render 9 Palaces (3x3 boxes)
    const palaces = [];
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            palaces.push({ r: boxRow, c: boxCol });
        }
    }

    return (
        <div className="sudoku-board glass-panel" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--palace-gap)',
            padding: '12px',
            width: 'fit-content',
            margin: '0 auto'
        }}>
            {palaces.map((box, boxIdx) => (
                <div key={boxIdx} className="sudoku-palace" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--grid-gap)',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}>
                    {Array.from({ length: 9 }).map((_, cellIdx) => {
                        const r = box.r * 3 + Math.floor(cellIdx / 3);
                        const c = box.c * 3 + (cellIdx % 3);
                        const cell = board[r][c];
                        const isSelected = selectedCell ? selectedCell[0] === r && selectedCell[1] === c : false;
                        const isRelated = selectedCell ? (selectedCell[0] === r || selectedCell[1] === c) : false;
                        const isHighlighted = highlightNumber !== null && cell.value === highlightNumber;

                        const isOddOverlay = rules?.oddCells?.some(([or, oc]) => or === r && oc === c);
                        const isEvenOverlay = rules?.evenCells?.some(([er, ec]) => er === r && ec === c);

                        return (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => onCellClick(r, c)}
                                className={`sudoku-cell flex-center ${cell.isFixed ? 'fixed' : 'editable'} ${isSelected ? 'selected' : ''}`}
                                style={{
                                    width: 'var(--cell-size)',
                                    height: 'var(--cell-size)',
                                    backgroundColor: isSelected ? 'var(--color-accent)' :
                                        isHighlighted ? 'var(--color-warning)' :
                                            isRelated ? '#eef2ff' :
                                                cell.isFixed ? '#dfe6e9' : 'white',
                                    color: isSelected ? 'white' : 'var(--color-text-primary)',
                                    fontSize: '1.2rem',
                                    fontWeight: cell.isFixed ? 700 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                {/* Odd cells - Grey Circle */}
                                {isOddOverlay && <div style={{
                                    position: 'absolute',
                                    width: '70%',
                                    height: '70%',
                                    borderRadius: '50%',
                                    border: '2px solid rgba(100, 100, 100, 0.4)',
                                    backgroundColor: 'rgba(150, 150, 150, 0.15)',
                                    zIndex: -1,
                                    pointerEvents: 'none'
                                }} />}
                                {/* Even cells - Light Square */}
                                {isEvenOverlay && <div style={{
                                    position: 'absolute',
                                    width: '70%',
                                    height: '70%',
                                    border: '2px solid rgba(100, 150, 255, 0.4)',
                                    backgroundColor: 'rgba(200, 220, 255, 0.2)',
                                    zIndex: -1,
                                    pointerEvents: 'none',
                                    borderRadius: '6px'
                                }} />}

                                {rules?.cages?.map((cage, cageIdx) => {
                                    const inCage = cage.cells.some(([cr, cc]) => cr === r && cc === c);
                                    if (!inCage) return null;

                                    // Determine borders
                                    const hasTop = cage.cells.some(([cr, cc]) => cr === r - 1 && cc === c);
                                    const hasBottom = cage.cells.some(([cr, cc]) => cr === r + 1 && cc === c);
                                    const hasLeft = cage.cells.some(([cr, cc]) => cr === r && cc === c - 1);
                                    const hasRight = cage.cells.some(([cr, cc]) => cr === r && cc === c + 1);

                                    const minR = Math.min(...cage.cells.map(c => c[0]));
                                    const minC = Math.min(...cage.cells.filter(c => c[0] === minR).map(c => c[1]));
                                    const showSum = r === minR && c === minC;

                                    return (
                                        <React.Fragment key={cageIdx}>
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                borderTop: hasTop ? '1px dashed rgba(0,0,0,0.1)' : '2px dashed #2d3436',
                                                borderBottom: hasBottom ? '1px dashed rgba(0,0,0,0.1)' : '2px dashed #2d3436',
                                                borderLeft: hasLeft ? '1px dashed rgba(0,0,0,0.1)' : '2px dashed #2d3436',
                                                borderRight: hasRight ? '1px dashed rgba(0,0,0,0.1)' : '2px dashed #2d3436',
                                                pointerEvents: 'none', zIndex: 0
                                            }} />
                                            {showSum && (
                                                <div style={{
                                                    position: 'absolute', top: '2px', left: '2px',
                                                    fontSize: '0.6rem', fontWeight: 'bold',
                                                    backgroundColor: 'white', padding: '0 2px', lineHeight: 1, zIndex: 2
                                                }}>
                                                    {cage.sum}
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                                {rules?.consecutiveBars?.map((bar, barIdx) => {
                                    const [r1, c1, r2, c2] = bar;
                                    const isHoriz = r1 === r2;
                                    const isVert = c1 === c2;

                                    // We want to render the bar 'between' cells.
                                    // We can render it inside the first cell (r1,c1) if (r2,c2) is right/bottom
                                    if (r !== r1 || c !== c1) return null;

                                    return (
                                        <div key={barIdx} style={{
                                            position: 'absolute',
                                            width: isHoriz ? '4px' : '40%',
                                            height: isVert ? '4px' : '40%',
                                            backgroundColor: '#00cec9',
                                            right: isHoriz ? '-2px' : 'auto',
                                            bottom: isVert ? '-2px' : 'auto',
                                            left: isVert ? '30%' : 'auto',
                                            top: isHoriz ? '30%' : 'auto',
                                            zIndex: 10,
                                            borderRadius: '2px'
                                        }} />
                                    )
                                })}

                                {cell.value}
                                {cell.notes.length > 0 && !cell.value && (
                                    <div className="notes-grid" style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                                        width: '100%', height: '100%', position: 'absolute', top: 0, left: 0,
                                        fontSize: '0.6rem', color: '#636e72'
                                    }}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                            <span key={n} className="flex-center">
                                                {cell.notes.includes(n) ? n : ''}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Board;
