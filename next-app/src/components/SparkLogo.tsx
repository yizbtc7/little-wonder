type SparkLogoProps = {
  size?: number;
  animated?: boolean;
  className?: string;
};

export default function SparkLogo({ size = 120, animated = true, className }: SparkLogoProps) {
  return (
    <div
      className={`${animated ? 'lw-spark-float' : ''}${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(80,84)">
          <path d="M0 -56 C4 -22 11 -13 40 -8 C11 -3 4 13 0 44 C-4 13 -11 -3 -40 -8 C-11 -13 -4 -22 0 -56 Z" fill="url(#sparkGradient)" />
          <g className={animated ? 'lw-center-pulse' : ''}>
            <circle cx="0" cy="-8" r="8.5" fill="#FDDCC8" />
            <circle cx="0" cy="-8" r="4.2" fill="#FFF3EA" />
          </g>
        </g>

        <g transform="translate(130,26)" className={animated ? 'lw-twinkle-1' : ''}>
          <path d="M0 -9 C.56 -3.2 1.1 -1.5 5.6 -1 C1.1 -.46 .56 1.1 0 6.5 C-.56 1.1 -1.1 -.46 -5.6 -1 C-1.1 -1.5 -.56 -3.2 0 -9 Z" fill="#E8785A" />
        </g>
        <g transform="translate(34,44)" className={animated ? 'lw-twinkle-2' : ''}>
          <path d="M0 -5.5 C.35 -2 .7 -.9 3.5 -.6 C.7 -.22 .35 .7 0 4 C-.35 .7 -.7 -.22 -3.5 -.6 C-.7 -.9 -.35 -2 0 -5.5 Z" fill="#E8785A" />
        </g>
        <g transform="translate(122,120)" className={animated ? 'lw-twinkle-3' : ''}>
          <path d="M0 -3.5 C.22 -1.2 .44 -.6 2.2 -.4 C.44 -.15 .22 .44 0 2.5 C-.22 .44 -.44 -.15 -2.2 -.4 C-.44 -.6 -.22 -1.2 0 -3.5 Z" fill="#E8785A" />
        </g>

        <defs>
          <linearGradient id="sparkGradient" x1="0.3" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#E46040" />
            <stop offset="50%" stopColor="#EF8862" />
            <stop offset="100%" stopColor="#E87050" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
