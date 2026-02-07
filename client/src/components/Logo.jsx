const Logo = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: { width: 120, height: 40 },
    md: { width: 160, height: 50 },
    lg: { width: 220, height: 70 },
  };
  const { width, height } = sizes[size] || sizes.md;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 80"
      width={width}
      height={height}
      className={className}
    >
      {/* Crown / Watch Icon */}
      <g transform="translate(10, 10)">
        {/* Outer circle */}
        <circle cx="30" cy="30" r="28" fill="none" stroke="#D4AF37" strokeWidth="2" />
        {/* Inner circle */}
        <circle cx="30" cy="30" r="22" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.6" />
        {/* Crown top */}
        <path
          d="M22 8 L26 2 L30 6 L34 2 L38 8"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Hour hand */}
        <line x1="30" y1="30" x2="30" y2="14" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
        {/* Minute hand */}
        <line x1="30" y1="30" x2="42" y2="24" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
        {/* Center dot */}
        <circle cx="30" cy="30" r="2" fill="#D4AF37" />
        {/* Hour markers */}
        <circle cx="30" cy="11" r="1" fill="#D4AF37" />
        <circle cx="49" cy="30" r="1" fill="#D4AF37" />
        <circle cx="30" cy="49" r="1" fill="#D4AF37" />
        <circle cx="11" cy="30" r="1" fill="#D4AF37" />
      </g>

      {/* Wordmark */}
      <text
        x="80"
        y="48"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="34"
        fontWeight="600"
        fill="#D4AF37"
        letterSpacing="3"
      >
        Sa3ati
      </text>

      {/* Tagline */}
      <text
        x="82"
        y="66"
        fontFamily="'Inter', sans-serif"
        fontSize="9"
        fill="#8A8A8A"
        letterSpacing="4"
        textTransform="uppercase"
      >
        LUXURY TIMEPIECES
      </text>
    </svg>
  );
};

export default Logo;
