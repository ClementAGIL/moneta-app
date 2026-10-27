// Step 2: the raw grid with a role picker on each column, plus header row, date format and decimal separator.
import { useState } from 'react';
import type { ImportPreview, Mapping } from '@moneta/shared';
import { t } from '../../strings';
import { Button, Card, Field, Select } from '../../ui/kit';
import { ROLES, isComplete, roleOf, setRole, type Role } from './roles';
import s from './import.module.css';

interface Props {
  preview: ImportPreview;
  busy: boolean;
  onBack(): void;
  onAnalyze(mapping: Mapping): void;
}

const HEADER_CHOICES = 10;

export function MappingStep({ preview, busy, onBack, onAnalyze }: Props) {
  const [mapping, setMapping] = useState<Mapping>(preview.mapping);
  const columns = Array.from({ length: preview.columnCount }, (_, i) => i);
  const update = (patch: Partial<Mapping>) => setMapping({ ...mapping, ...patch });

  return (
    <Card>
      <p className={s.muted}>{t.import.rowsDetected(preview.rowCount)}</p>
      <div className={s.options}>
        <Field label={t.import.headerRow}>
          <Select value={mapping.headerRow} onChange={(e) => update({ headerRow: Number(e.target.value) })}>
            <option value={-1}>{t.import.noHeader}</option>
            {preview.rows.slice(0, HEADER_CHOICES).map((row, i) => (
              <option key={i} value={i}>
                {i + 1} · {row.join(' | ').slice(0, 40)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.import.dateFormat}>
          <Select value={mapping.dateFormat} onChange={(e) => update({ dateFormat: e.target.value })}>
            <option value="excel">{t.import.excelDate}</option>
            {preview.dateFormats.map((f) => (
              <option key={f} value={f}>
                {displayLayout(f)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.import.decimal}>
          <Select value={mapping.decimalSep} onChange={(e) => update({ decimalSep: e.target.value as ',' | '.' })}>
            <option value=",">1 234,56</option>
            <option value=".">1,234.56</option>
          </Select>
        </Field>
      </div>
      <div className={s.gridWrap}>
        <table className={s.grid}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>
                  <RolePicker
                    role={roleOf(mapping, col)}
                    onChange={(role) => setMapping(setRole(mapping, col, role))}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, i) => (
              <tr key={i} className={i === mapping.headerRow ? s.headerRow : i < mapping.headerRow ? s.skipped : ''}>
                {columns.map((col) => (
                  <td key={col}>{row[col] ?? ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.actions}>
        <Button variant="secondary" onClick={onBack}>
          {t.common.back}
        </Button>
        <Button disabled={!isComplete(mapping) || busy} onClick={() => onAnalyze(mapping)}>
          {t.import.analyze}
        </Button>
      </div>
    </Card>
  );
}

function RolePicker({ role, onChange }: { role: Role; onChange(role: Role): void }) {
  return (
    <Select value={role} onChange={(e) => onChange(e.target.value as Role)}>
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {t.import.roles[r]}
        </option>
      ))}
    </Select>
  );
}

/** Shows a Go date layout the way people read it: 02/01/2006 → JJ/MM/AAAA. */
function displayLayout(layout: string): string {
  return layout
    .replace('2006', 'AAAA')
    .replace('06', 'AA')
    .replace('02', 'JJ')
    .replace('01', 'MM')
    .replace('2/1', 'J/M');
}
