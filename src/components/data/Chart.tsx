import { useEffect, useId, useRef, useState } from 'react';
import type { Candle } from '../../lib/api';
import { formatPrice, formatToken } from '../../lib/format';
import { cn } from '../../lib/cn';

export function ChartFrame({
  candles,
  mode,
  className,
  summary,
}: {
  candles: Candle[];
  mode: 'candle' | 'line';
  className?: string;
  summary: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(320);
  const [hover, setHover] = useState<number | null>(null);
  const labelId = useId();

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setWidth(Math.max(280, Math.floor(rect.width)));
      setHeight(Math.max(160, Math.floor(rect.height)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const pad = { top: 16, right: 64, bottom: 28, left: 8 };
  const volumeHeight = Math.round(height * 0.22);
  const plotBottom = height - pad.bottom - volumeHeight - 10;
  const plotHeight = Math.max(40, plotBottom - pad.top);
  const plotWidth = Math.max(40, width - pad.left - pad.right);
  const highs = candles.map((candle) => candle.high);
  const lows = candles.map((candle) => candle.low);
  const max = highs.length ? Math.max(...highs) : 1;
  const min = lows.length ? Math.min(...lows) : 0;
  const span = max - min || Math.max(Math.abs(max) * 0.08, 1e-12);
  const maxVolume = Math.max(...candles.map((candle) => candle.volume), 1);

  const xAt = (index: number) => pad.left + (candles.length <= 1 ? plotWidth / 2 : (index / (candles.length - 1)) * plotWidth);
  const yAt = (price: number) => pad.top + ((max - price) / span) * plotHeight;
  const slot = candles.length > 1 ? plotWidth / (candles.length - 1) : plotWidth;
  const bodyWidth = Math.max(3, Math.min(14, slot * 0.62));

  const linePoints = candles.map((candle, index) => `${xAt(index)},${yAt(candle.close)}`).join(' ');
  const areaPoints =
    candles.length > 0
      ? `${xAt(0)},${plotBottom} ${linePoints} ${xAt(candles.length - 1)},${plotBottom}`
      : '';

  const ticks = [max, min + span / 2, min];
  const active = hover != null ? candles[hover] : null;

  return (
    <div
      ref={wrapRef}
      className={cn('chart-frame', className)}
      role="img"
      aria-labelledby={labelId}
      onMouseLeave={() => setHover(null)}
    >
      <p id={labelId} className="sr-only">
        {summary}
      </p>
      {candles.length > 0 ? (
        <svg
          className="chart-svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - bounds.left - pad.left;
            const index = Math.round((x / plotWidth) * (candles.length - 1));
            setHover(Math.max(0, Math.min(candles.length - 1, index)));
          }}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line className="chart-grid" x1={pad.left} x2={width - pad.right} y1={yAt(tick)} y2={yAt(tick)} />
              <text className="chart-axis" x={width - pad.right + 8} y={yAt(tick) + 4}>
                {formatPrice(tick)}
              </text>
            </g>
          ))}

          {mode === 'line' ? (
            <>
              <polygon className="chart-area" points={areaPoints} />
              <polyline className="chart-line" points={linePoints} fill="none" />
            </>
          ) : (
            candles.map((candle, index) => {
              const up = candle.close >= candle.open;
              const x = xAt(index);
              const yHigh = yAt(candle.high);
              const yLow = yAt(candle.low);
              const yOpen = yAt(candle.open);
              const yClose = yAt(candle.close);
              const top = Math.min(yOpen, yClose);
              const body = Math.max(1, Math.abs(yClose - yOpen));
              return (
                <g key={candle.time} className={up ? 'candle-up' : 'candle-down'}>
                  <line x1={x} x2={x} y1={yHigh} y2={yLow} />
                  <rect x={x - bodyWidth / 2} y={top} width={bodyWidth} height={body} rx="1" />
                </g>
              );
            })
          )}

          {candles.map((candle, index) => {
            const up = candle.close >= candle.open;
            const x = xAt(index);
            const bar = (candle.volume / maxVolume) * (volumeHeight - 4);
            const y = height - pad.bottom - bar;
            return (
              <rect
                key={`v-${candle.time}`}
                className={up ? 'volume-up' : 'volume-down'}
                x={x - bodyWidth / 2}
                y={y}
                width={bodyWidth}
                height={bar}
                rx="1"
              />
            );
          })}

          {active && hover != null ? (
            <g>
              <line className="chart-cross" x1={xAt(hover)} x2={xAt(hover)} y1={pad.top} y2={height - pad.bottom} />
            </g>
          ) : null}
        </svg>
      ) : null}
      {active ? (
        <div className="chart-tip">
          <span className="num">O {formatPrice(active.open)}</span>
          <span className="num">H {formatPrice(active.high)}</span>
          <span className="num">L {formatPrice(active.low)}</span>
          <span className="num">C {formatPrice(active.close)}</span>
          <span className="num">V {formatToken(active.volume, 0)}</span>
        </div>
      ) : null}
    </div>
  );
}
