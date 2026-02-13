import React from 'react';
import { Game } from '../types';
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  game: Game;
  compact?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, compact = false }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/game/${game.id}`)}
      className="relative card-bg rounded-[18px] p-3 flex items-center gap-3 cursor-pointer group border border-theme shadow-[0_2px_10px_rgba(0,0,0,0.18)] hover:border-accent/60 hover:shadow-[0_6px_18px_rgba(0,0,0,0.24)] hover:translate-y-[-1px] transition-all duration-300 ease-out"
    >
      <img
        src={game.icon}
        alt={game.title}
        className={`${compact ? 'w-14 h-14' : 'w-[88px] h-[88px]'} shrink-0 rounded-2xl object-cover border border-theme group-hover:scale-[1.02] transition-transform duration-300`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`${compact ? 'text-[16px]' : 'text-[19px]'} font-bold truncate leading-tight tracking-tight group-hover:text-accent transition-colors`}
            style={{ color: 'var(--text-primary)' }}
          >
            {game.title}
          </h3>
          <button
            type="button"
            className="shrink-0 text-accent text-[14px] font-bold px-3.5 py-2 rounded-full border border-accent/50 bg-transparent hover:bg-accent/10 transition-colors duration-300"
          >
            进入
          </button>
        </div>

        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center text-amber-500 font-semibold">
            ★ {game.rating || '0.0'}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-500/40" />
          <span className="bg-black/10 text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded-md tracking-wide border border-theme truncate max-w-[96px]">
            {game.category}
          </span>
          {game.downloads ? (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-500/40" />
              <span className="truncate">{game.downloads}</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
