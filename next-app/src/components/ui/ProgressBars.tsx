import { theme } from '@/styles/theme';

type Props = { total: number; current: number };

export default function ProgressBars({ total, current }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i <= current ? theme.colors.rose : theme.colors.blushMid,
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}
