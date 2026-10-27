// End-of-month forecast: median balance line inside its p25–p75 band, and the recurring items still expected.
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate, formatMoney, useForecast } from '@moneta/shared';
import { t } from '../../strings';
import { Card, ErrorText, Spinner } from '../../ui/kit';
import { Money } from '../../ui/Money';
import s from './dashboard.module.css';

export function ForecastCard() {
  const forecast = useForecast();
  if (forecast.isPending) return <Spinner />;
  if (forecast.error) return <ErrorText error={forecast.error} />;
  const f = forecast.data;
  const today = { date: f.today, p25Cents: f.balanceCents, p50Cents: f.balanceCents, p75Cents: f.balanceCents };
  const data = [today, ...f.days].map((d) => ({
    day: formatDate(d.date).replace(/ \d{4}$/, ''),
    band: [d.p25Cents, d.p75Cents],
    median: d.p50Cents,
  }));

  return (
    <Card title={t.forecast.title}>
      <p className={s.forecastHead}>
        {t.forecast.end} <strong>{formatMoney(f.endOfMonth.p50Cents)}</strong>
        <small>
          {' '}
          ({formatMoney(f.endOfMonth.p25Cents)} – {formatMoney(f.endOfMonth.p75Cents)})
        </small>
      </p>
      {data.length > 1 && (
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={data}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              formatter={(v) =>
                Array.isArray(v) ? v.map((x) => formatMoney(Number(x))).join(' – ') : formatMoney(Number(v))
              }
            />
            <Area dataKey="band" stroke="none" fill="var(--color-brand)" fillOpacity={0.15} isAnimationActive={false} />
            <Line dataKey="median" stroke="var(--color-brand)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      {f.expected.length > 0 && (
        <ul className={s.expected}>
          {f.expected.map((e) => (
            <li key={e.name + e.date}>
              <span>
                {e.name} <small>{formatDate(e.date)}</small>
              </span>
              <Money cents={e.amountCents} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
