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
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center space-x-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <img src={game.icon} alt={game.title} className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-lg object-cover`} />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 truncate">{game.title}</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{game.category}</span>
          <span className="flex items-center text-yellow-500">
             ★ {game.rating}
          </span>
        </div>
        {!compact && (
           <p className="text-xs text-gray-400 mt-1 truncate">{game.description}</p>
        )}
      </div>
      <button className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors">
        Play
      </button>
    </div>
  );
};

export default GameCard;