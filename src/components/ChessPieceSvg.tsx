import React from 'react';

export type ChessPieceColor = 'w' | 'b';
export type ChessPieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';

interface ChessPieceSvgProps {
  type: ChessPieceType | string;
  color: ChessPieceColor | string;
  className?: string;
  pieceStyle?: 'hd_vector' | 'high_contrast' | 'giant_emoji';
}

/**
 * Standard, universally rendered Vector SVG Chess Pieces with high-contrast styling.
 * Guaranteed crystal-clear visibility on dark, light, wood, and emerald squares.
 * Includes luminous white halo on black pieces and dark shadow on white pieces.
 */
export const ChessPieceSvg: React.FC<ChessPieceSvgProps> = ({
  type,
  color,
  className = 'w-full h-full',
  pieceStyle = 'hd_vector',
}) => {
  const t = type.toLowerCase() as ChessPieceType;
  const isWhite = color === 'w' || color === 'white';

  if (pieceStyle === 'giant_emoji') {
    const emojis: Record<string, string> = {
      p: isWhite ? '♙' : '♟',
      r: isWhite ? '♖' : '♜',
      n: isWhite ? '♘' : '♞',
      b: isWhite ? '♗' : '♝',
      q: isWhite ? '♕' : '♛',
      k: isWhite ? '♔' : '♚',
    };
    return (
      <span
        className={`select-none flex items-center justify-center font-bold ${
          isWhite
            ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] filter'
            : 'text-zinc-950 drop-shadow-[0_0_3px_rgba(255,255,255,0.95)] filter'
        }`}
        style={{ fontSize: '2rem', lineHeight: 1 }}
      >
        {emojis[t] || '?'}
      </span>
    );
  }

  // HD Vector styling
  const fill = isWhite ? '#ffffff' : '#18181b';
  // Outer outline: Dark outline for white pieces; luminous white outline for black pieces
  const mainStroke = isWhite ? '#090d16' : '#ffffff';
  const detailStroke = isWhite ? '#475569' : '#f8fafc';
  const strokeWidth = 1.8;

  // Visual filter for instant depth and separation from square background
  const pieceFilter = isWhite
    ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.55))'
    : 'drop-shadow(0 0 2.5px rgba(255,255,255,0.95)) drop-shadow(0 2px 4px rgba(0,0,0,0.75))';

  switch (t) {
    case 'p': // Pawn
      return (
        <svg
          viewBox="0 0 45 45"
          className={className}
          style={{ filter: pieceFilter }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={isWhite ? 'Peão Branco' : 'Peão Preto'}
        >
          {/* Main Pawn Body */}
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 L 34,39.5 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 26.5,10.79 24.71,9 22.5,9 z"
            fill={fill}
            stroke={mainStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Collar ring detail */}
          <path
            d="M 17,26 C 19,27 26,27 28,26"
            fill="none"
            stroke={detailStroke}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Base bottom rim */}
          <path
            d="M 12.5,36.5 L 32.5,36.5"
            fill="none"
            stroke={detailStroke}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'r': // Rook
      return (
        <svg
          viewBox="0 0 45 45"
          className={className}
          style={{ filter: pieceFilter }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={isWhite ? 'Torre Branca' : 'Torre Preta'}
        >
          {/* Base and Tower Body */}
          <g fill={fill} stroke={mainStroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,39 L 36,39 L 36,36 L 9,36 z" />
            <path d="M 12,36 L 12,32 L 33,32 L 33,36 z" />
            <path d="M 14,29.5 L 31,29.5 L 33,32 L 12,32 z" />
            <path d="M 14,17 L 31,17 L 31,29.5 L 14,29.5 z" />
            <path d="M 11,14 L 34,14 L 31,17 L 14,17 z" />
            {/* Crenels / Battlements */}
            <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 z" />
          </g>
          {/* Castle window slit */}
          <line x1="22.5" y1="20" x2="22.5" y2="26.5" stroke={detailStroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'n': // Knight
      return (
        <svg
          viewBox="0 0 45 45"
          className={className}
          style={{ filter: pieceFilter }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={isWhite ? 'Cavalo Branco' : 'Cavalo Preto'}
        >
          {/* Fully closed, clean Knight contour */}
          <path
            d="M 22,10 C 32.5,11 38.5,18 38,39 L 11,39 C 11,37 11.5,33.5 13,31 C 12,30 10,29.5 9,28 C 8,26.5 9,23 11,22 C 12,18 13.5,14 14,10.5 C 15.5,8 19,7.5 22,10 z"
            fill={fill}
            stroke={mainStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Snout and jawline */}
          <path
            d="M 9.5,25.5 C 13,26 16,23 18,20 C 20,17 21,14 21,11"
            fill="none"
            stroke={detailStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Eye */}
          <circle cx="15.5" cy="14" r="1.8" fill={detailStroke} />
          {/* Mane fur lines */}
          <path
            d="M 24.5,13.5 C 27,15.5 29,20 28,26"
            fill="none"
            stroke={detailStroke}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Base bottom */}
          <line x1="12" y1="36" x2="36" y2="36" stroke={detailStroke} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg
          viewBox="0 0 45 45"
          className={className}
          style={{ filter: pieceFilter }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={isWhite ? 'Bispo Branco' : 'Bispo Preto'}
        >
          <g fill={fill} stroke={mainStroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            {/* Base */}
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
            <path d="M 12,36 C 12,32 14,24 16,19 C 18,14 20,11 22.5,11 C 25,11 27,14 29,19 C 31,24 33,32 33,36 z" />
            {/* Top pommel */}
            <circle cx="22.5" cy="8" r="2.5" />
          </g>
          {/* Mitre cross detail */}
          <path d="M 17.5,24 L 27.5,24" stroke={detailStroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 22.5,19 L 22.5,29" stroke={detailStroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 20.5,14 L 24.5,18" stroke={detailStroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'q': // Queen
      return (
        <svg
          viewBox="0 0 45 45"
          className={className}
          style={{ filter: pieceFilter }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={isWhite ? 'Dama Branca' : 'Dama Preta'}
        >
          {/* Base */}
          <path
            d="M 9,38.5 L 36,38.5 C 36,37 34.5,34 32.5,33 C 32,31 32.5,30 33.5,29 C 34.5,28 36,27 36,26 L 9,26 C 9,27 10.5,28 11.5,29 C 12.5,30 13,31 12.5,33 C 10.5,34 9,37 9,38.5 z"
            fill={fill}
            stroke={mainStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Crown Spikes */}
          <path
            d="M 9,26 L 6,13 L 14,23 L 22.5,10.5 L 31,23 L 39,13 L 36,26 z"
            fill={fill}
            stroke={mainStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Crown Jewels (Balls at tips) */}
          <circle cx="6" cy="12" r="2.2" fill={fill} stroke={mainStroke} strokeWidth="1.4" />
          <circle cx="14" cy="9.5" r="2.2" fill={fill} stroke={mainStroke} strokeWidth="1.4" />
          <circle cx="22.5" cy="8" r="2.5" fill={fill} stroke={mainStroke} strokeWidth="1.4" />
          <circle cx="31" cy="9.5" r="2.2" fill={fill} stroke={mainStroke} strokeWidth="1.4" />
          <circle cx="39" cy="12" r="2.2" fill={fill} stroke={mainStroke} strokeWidth="1.4" />
          {/* Waist accent line */}
          <path d="M 12,30 C 17,29 28,29 33,30" fill="none" stroke={detailStroke} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'k': // King
      return (
        <svg
          viewBox="0 0 45 45"
          className={className}
          style={{ filter: pieceFilter }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={isWhite ? 'Rei Branco' : 'Rei Preto'}
        >
          {/* Crown Body and Robe Base */}
          <path
            d="M 22.5,11.5 C 19,11.5 15,15.5 15,20 C 15,23.5 17,25 18,26 C 16,27 13.5,29.5 13.5,33 C 13.5,36.5 16.5,37.5 18.5,38.5 L 26.5,38.5 C 28.5,37.5 31.5,36.5 31.5,33 C 31.5,29.5 29,27 27,26 C 28,25 30,23.5 30,20 C 30,15.5 26,11.5 22.5,11.5 z"
            fill={fill}
            stroke={mainStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bottom plinth rims */}
          <path
            d="M 11.5,37.5 C 17,40.5 28,40.5 33.5,37.5"
            fill="none"
            stroke={mainStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M 11.5,39.5 C 17,42.5 28,42.5 33.5,39.5"
            fill="none"
            stroke={mainStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Cross Pattée at top */}
          <line x1="22.5" y1="4.5" x2="22.5" y2="12" stroke={mainStroke} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="18.5" y1="7.5" x2="26.5" y2="7.5" stroke={mainStroke} strokeWidth="2.2" strokeLinecap="round" />
          {/* Inner robe arch highlight */}
          <path
            d="M 18.5,21 C 20,18.5 25,18.5 26.5,21"
            fill="none"
            stroke={detailStroke}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M 17,29 C 20,27.5 25,27.5 28,29"
            fill="none"
            stroke={detailStroke}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
};

