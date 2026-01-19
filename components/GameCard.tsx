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
      className="bg-[#1e293b] rounded-xl shadow-lg border border-white/5 p-3 flex items-center space-x-3 hover:bg-[#334155] transition-all cursor-pointer group"
    >
      <img src={game.icon} alt={game.title} className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-lg object-cover ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all`} />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-100 truncate group-hover:text-blue-300 transition-colors">{game.title}</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
          <span className="bg-[#0f172a] border border-white/10 px-1.5 py-0.5 rounded text-gray-300">{game.category}</span>
          <span className="flex items-center text-yellow-400">
             ★ {game.rating}
          </span>
        </div>
        {!compact && (
           <p className="text-xs text-gray-500 mt-1 truncate">{game.description}</p>
        )}
      </div>
      <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-900/50 hover:shadow-blue-600/50 transition-all transform active:scale-95">
        Play
      </button>
    </div>
  );
};

export default GameCard;