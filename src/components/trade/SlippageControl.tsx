import { Gear } from '@phosphor-icons/react';
import { useId, useState } from 'react';
import { useTradeSettings } from '../../context/TradeSettingsContext';
import { sanitizeAmount, parseAmount } from '../../lib/format';
import { SLIPPAGE_PRESETS } from '../../lib/trade/quote';
import { Icon } from '../primitives/Icon';
import { Tooltip } from '../primitives/Tooltip';

export function SlippageControl() {
  const { slippagePct, setSlippagePct } = useTradeSettings();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const panelId = useId();

  return (
    <div className="slippage">
      <Tooltip content="Slippage tolerance">
        <button
          type="button"
          className="icon-btn"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon icon={Gear} size={20} />
          <span className="sr-only">Slippage {slippagePct.toFixed(2)} percent</span>
        </button>
      </Tooltip>
      {open ? (
        <div className="slippage-pop raised" id={panelId} role="dialog" aria-label="Slippage tolerance">
          <p className="eyebrow">Slippage</p>
          <div className="preset-row">
            {SLIPPAGE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={slippagePct === preset ? 'pill is-active' : 'pill'}
                onClick={() => {
                  setSlippagePct(preset);
                  setCustom('');
                }}
              >
                <span className="num">{preset.toFixed(preset < 1 ? 1 : 0)}%</span>
              </button>
            ))}
          </div>
          <label className="field">
            <span className="field-label">Custom</span>
            <input
              className="input"
              inputMode="decimal"
              value={custom}
              placeholder={slippagePct.toFixed(2)}
              onChange={(event) => {
                const next = sanitizeAmount(event.target.value);
                setCustom(next);
                const parsed = parseAmount(next);
                if (parsed != null && parsed > 0 && parsed < 50) setSlippagePct(parsed);
              }}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
