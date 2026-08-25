import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BadgeCheck, CheckCircle2, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent } from '@/components/ui/card';
import { cn, formatXp } from '@/lib/utils';
import type { ExercisePublic, ExerciseResult } from '@suraksha/shared';
import { RichText } from './rich-text';

export function ExerciseCard({ exercise, onCompleted }: { exercise: ExercisePublic; onCompleted?: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const { toast } = useToast();

  const submit = useMutation({
    mutationFn: () =>
      api<ExerciseResult>(`/learn/exercises/${exercise.slug}/submit`, {
        method: 'POST',
        body: {
          answers: Object.entries(answers).map(([questionIndex, choiceIndex]) => ({
            questionIndex: Number(questionIndex),
            choiceIndex,
          })),
        },
      }),
    onSuccess: (res) => {
      setResult(res);
      if (res.firstCompletion && res.xpAwarded > 0) {
        toast('success', `+${formatXp(res.xpAwarded)} XP`, `${exercise.title} completed`);
      }
      onCompleted?.();
    },
  });

  const allAnswered = exercise.questions.every((_, i) => answers[i] !== undefined);
  const completedOnce = exercise.completed || (result?.firstCompletion ?? false);

  const reset = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent">
              <HelpCircle className="size-4.5" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold tracking-tight text-text">{exercise.title}</h3>
              {exercise.instructions && (
                <RichText text={exercise.instructions} className="mt-0.5 block text-sm text-text-secondary" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {completedOnce && (
              <Badge variant="success">
                <BadgeCheck className="size-3.5" aria-hidden />
                Completed
              </Badge>
            )}
            <Badge variant="accent">+{formatXp(exercise.xpReward)} XP</Badge>
          </div>
        </div>

        <div className="space-y-6">
          {exercise.questions.map((q, qi) => {
            const pq = result?.perQuestion.find((p) => p.index === qi);
            return (
              <fieldset key={qi} className="space-y-2.5">
                <legend className="text-sm font-medium text-text">
                  <span className="mr-1.5 text-text-tertiary">{qi + 1}.</span>
                  {q.prompt}
                </legend>
                <div role="radiogroup" aria-label={q.prompt} className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[qi] === oi;
                    const showCorrect = result != null && pq?.correctIndex === oi;
                    const showWrong = result != null && selected && !pq?.correct;
                    return (
                      <button
                        key={oi}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                        disabled={result != null}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors',
                          showCorrect
                            ? 'border-success bg-success-subtle text-text'
                            : showWrong
                              ? 'border-danger bg-danger-subtle text-text'
                              : selected
                                ? 'border-accent bg-accent-subtle text-text'
                                : 'border-border text-text-secondary hover:border-border-strong hover:bg-surface-2',
                          result != null && 'cursor-default',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-px flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                            showCorrect
                              ? 'border-success/40 text-success'
                              : showWrong
                                ? 'border-danger/40 text-danger'
                                : selected
                                  ? 'border-accent/40 text-accent'
                                  : 'border-border-strong text-text-tertiary',
                          )}
                          aria-hidden
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span>{opt}</span>
                        {showCorrect && <CheckCircle2 className="ml-auto size-4 shrink-0 text-success" aria-hidden />}
                        {showWrong && <XCircle className="ml-auto size-4 shrink-0 text-danger" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
                {result && (
                  <div
                    className={cn(
                      'rounded-lg px-3.5 py-2.5 text-sm',
                      pq?.correct ? 'bg-success-subtle' : 'bg-warning-subtle',
                    )}
                  >
                    <p className={cn('flex items-center gap-1.5 font-medium', pq?.correct ? 'text-success' : 'text-warning')}>
                      {pq?.correct ? (
                        <>
                          <CheckCircle2 className="size-3.5" aria-hidden /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3.5" aria-hidden /> Incorrect — correct answer:{' '}
                          {String.fromCharCode(65 + (pq?.correctIndex ?? 0))}
                        </>
                      )}
                    </p>
                    {pq?.explanation && (
                      <RichText text={pq.explanation} className="mt-1 block text-text-secondary" />
                    )}
                  </div>
                )}
              </fieldset>
            );
          })}
        </div>

        {result ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-text">
              You scored{' '}
              <span className={result.passed ? 'text-success' : 'text-warning'}>
                {result.score}/{result.total}
              </span>
            </p>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="size-3.5" aria-hidden />
              Retake
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            {submit.isError ? (
              <p role="alert" className="text-sm text-danger">
                {submit.error instanceof Error ? submit.error.message : 'Submission failed. Try again.'}
              </p>
            ) : (
              <p className="text-xs text-text-tertiary">Answer every question to submit.</p>
            )}
            <Button onClick={() => submit.mutate()} loading={submit.isPending} disabled={!allAnswered}>
              Check answers
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
