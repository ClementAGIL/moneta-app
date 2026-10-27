// Import wizard: upload → (mapping, skipped for a known format) → review → done, plus the import history.
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import {
  useCommitImport,
  useDeleteImport,
  useSetMapping,
  type ImportPreview,
  type ImportSummary,
  type Mapping,
} from '@moneta/shared';
import { t } from '../../strings';
import { ErrorText, PageHeader } from '../../ui/kit';
import { DoneStep } from './DoneStep';
import { ImportHistory } from './ImportHistory';
import { MappingStep } from './MappingStep';
import { ReviewStep } from './ReviewStep';
import { UploadStep } from './UploadStep';
import s from './import.module.css';

type Step = 'upload' | 'mapping' | 'review' | 'done';
const STEPS: Step[] = ['upload', 'mapping', 'review', 'done'];
const STEP_LABELS = [t.import.stepUpload, t.import.stepMapping, t.import.stepReview, t.import.stepDone];

export function ImportPage() {
  const [step, setStep] = useState<Step>('upload');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [accountId, setAccountId] = useState('');
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const setMapping = useSetMapping();
  const commit = useCommitImport();
  const cancel = useDeleteImport();
  const { key } = useLocation();
  const firstKey = useRef(key);

  // Clicking "Importer" in the menu again starts a new import.
  useEffect(() => {
    if (key !== firstKey.current) restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function analyze(p: ImportPreview, account: string, mapping: Mapping) {
    setMapping.mutate(
      { id: p.id, body: { accountId: account, mapping } },
      {
        onSuccess: (s) => {
          setSummary(s);
          setStep('review');
        },
        onError: () => setStep('mapping'),
      },
    );
  }

  function onUploaded(p: ImportPreview, account: string) {
    setPreview(p);
    setAccountId(account);
    if (p.profileId) analyze(p, account, p.mapping);
    else setStep('mapping');
  }

  function restart() {
    if (preview && step !== 'done') cancel.mutate(preview.id);
    setPreview(null);
    setSummary(null);
    setMapping.reset();
    commit.reset();
    setStep('upload');
  }

  return (
    <>
      <PageHeader title={t.import.title} />
      <ol className={s.steps}>
        {STEPS.map((name, i) => (
          <li key={name} className={name === step ? s.current : undefined}>
            {i + 1}. {STEP_LABELS[i]}
          </li>
        ))}
      </ol>
      {step === 'upload' && <UploadStep onUploaded={onUploaded} busy={setMapping.isPending} />}
      {step === 'mapping' && preview && (
        <MappingStep
          preview={preview}
          busy={setMapping.isPending}
          onBack={restart}
          onAnalyze={(mapping) => analyze(preview, accountId, mapping)}
        />
      )}
      {step === 'review' && summary && (
        <ReviewStep
          summary={summary}
          busy={commit.isPending}
          onBack={() => setStep('mapping')}
          onCommit={(keep) =>
            commit.mutate({ id: summary.id, keep }, { onSuccess: (done) => (setSummary(done), setStep('done')) })
          }
        />
      )}
      {step === 'done' && summary && <DoneStep summary={summary} onAgain={restart} />}
      <ErrorText error={setMapping.error ?? commit.error} />
      {step === 'upload' && <ImportHistory />}
    </>
  );
}
