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
      className="relative bg-[#111827]/60 backdrop-blur-md rounded-2xl p-3 flex items-center space-x-4 cursor-pointer group overflow-hidden border border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:bg-[#1f2937]/60"
    >
      {/* Subtle Glow Background */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-violet-500/10 transition-all"></div>

      <img 
        src={game.icon} 
        alt={game.title} 
        className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl object-cover shadow-lg shadow-black/40 group-hover:scale-105 transition-transform duration-300 border border-white/5`} 
      />
      
      <div className="flex-1 min-w-0 z-10">
        <h3 className="text-base font-bold text-gray-100 truncate group-hover:text-violet-300 transition-colors tracking-tight">{game.title}</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1.5">
          <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300 backdrop-blur-sm">{game.category}</span>
          <span className="flex items-center text-amber-400 font-medium">
             ★ {game.rating}
          </span>
        </div>
        {!compact && (
           <p className="text-xs text-gray-500 mt-1.5 truncate pr-2 opacity-80">{game.description}</p>
        )}
      </div>
      
      <button className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_16px_rgba(124,58,237,0.5)] transition-all transform active:scale-95 border border-white/10">
        <span className="relative z-10">Play</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      </button>
    </div>
  );
};

export default GameCard;