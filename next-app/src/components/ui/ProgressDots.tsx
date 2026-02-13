import { theme } from '@/styles/theme';

type ProgressDotsProps = {
  total: number;
  current: number;
};

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          style={{
            width: index === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: index === current ? theme.colors.brand : theme.colors.brandLight,
            transition: 'all 0.3s ease',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}
