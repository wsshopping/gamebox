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
      // Light Mode: bg-white, border-gray-100, shadow-sm, hover:shadow-md
      className="relative bg-white rounded-2xl p-3 flex items-center space-x-4 cursor-pointer group overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Subtle Glow Background (Light) */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-100/50 transition-all"></div>

      <img 
        src={game.icon} 
        alt={game.title} 
        className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300`} 
      />
      
      <div className="flex-1 min-w-0 z-10">
        <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-violet-600 transition-colors tracking-tight">{game.title}</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1.5">
          <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-500">{game.category}</span>
          <span className="flex items-center text-amber-500 font-medium">
             ★ {game.rating}
          </span>
        </div>
        {!compact && (
           <p className="text-xs text-gray-400 mt-1.5 truncate pr-2">{game.description}</p>
        )}
      </div>
      
      <button className="relative overflow-hidden bg-violet-50 text-violet-600 text-xs font-bold px-5 py-2 rounded-full hover:bg-violet-600 hover:text-white transition-all transform active:scale-95 border border-violet-100">
        <span className="relative z-10">Play</span>
      </button>
    </div>
  );
};

export default GameCard;