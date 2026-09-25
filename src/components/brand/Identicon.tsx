export function Identicon({ address, size = 28 }: { address: string; size?: number }) {
  const seed = [...address].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const cells: { x: number; y: number }[] = [];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const on = ((seed >> (row * 3 + col)) & 3) !== 0;
      if (!on) continue;
      cells.push({ x: col, y: row });
      if (col !== 2) cells.push({ x: 4 - col, y: row });
    }
  }

  return (
    <svg className="identicon" width={size} height={size} viewBox="0 0 5 5" aria-hidden="true">
      {cells.map((cell) => (
        <rect key={`${cell.x}-${cell.y}`} x={cell.x} y={cell.y} width="1" height="1" />
      ))}
    </svg>
  );
}
