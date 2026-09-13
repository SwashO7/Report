import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { slugify } from '@/features/admin/slugify';
import { Button } from '@/components/ui/button';
import { FormHint, Input, Label, Select, Textarea } from '@/components/ui/input';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';

export interface AdminQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface AdminExercise {
  id: string;
  slug: string;
  title: string;
  instructions: string;
  kind: string;
  questions: AdminQuestion[];
  xpReward: number;
  status: string;
  lessonId?: string;
}

interface ExQuestionForm {
  prompt: string;
  optionsText: string;
  correctIndex: number;
  explanation: string;
}

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');
const linesOf = (s: string) => s.split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l.trim().length > 0);

/**
 * Create/edit form for a practice exercise (quiz). Used both inside a
 * lesson's editor (lessonId fixed, no picker) and from the standalone
 * Practice admin page (lessonId chosen from a dropdown).
 */
export function ExerciseModal({
  open,
  initial,
  lessonId,
  onClose,
}: {
  open: boolean;
  initial: AdminExercise | null;
  /** Fixed lesson to attach new exercises to. Omit to show a lesson picker (Practice hub usage). */
  lessonId?: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState('draft');
  const [xp, setXp] = useState('50');
  const [selectedLessonId, setSelectedLessonId] = useState(lessonId ?? '');
  const [questions, setQuestions] = useState<ExQuestionForm[]>([
    { prompt: '', optionsText: '', correctIndex: 0, explanation: '' },
  ]);

  const needsLessonPicker = !lessonId;
  const lessonsQ = useQuery({
    queryKey: qk.adminExerciseLessons,
    queryFn: () => api<{ lessons: { id: string; title: string; slug: string; pathName: string }[] }>('/admin/content/exercises/lessons'),
    enabled: open && needsLessonPicker,
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setSlug(initial.slug);
      setSlugTouched(true);
      setInstructions(initial.instructions);
      setStatus(initial.status);
      setXp(String(initial.xpReward));
      setSelectedLessonId(initial.lessonId ?? lessonId ?? '');
      setQuestions(
        initial.questions.map((q) => ({
          prompt: q.prompt,
          optionsText: q.options.join('\n'),
          correctIndex: q.correctIndex,
          explanation: q.explanation ?? '',
        })),
      );
    } else {
      setTitle('');
      setSlug('');
      setSlugTouched(false);
      setInstructions('');
      setStatus('draft');
      setXp('50');
      setSelectedLessonId(lessonId ?? '');
      setQuestions([{ prompt: '', optionsText: '', correctIndex: 0, explanation: '' }]);
    }
  }, [open, initial, lessonId]);

  const effSlug = slugTouched ? slug : slugify(title);
  const parsed = questions.map((q) => {
    const options = linesOf(q.optionsText);
    return {
      prompt: q.prompt.trim(),
      options,
      correctIndex: Math.min(Math.max(q.correctIndex, 0), Math.max(0, options.length - 1)),
      ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}),
    };
  });
  const effLessonId = lessonId ?? selectedLessonId;
  const valid =
    title.trim().length >= 2 &&
    effSlug.length >= 2 &&
    !!effLessonId &&
    parsed.length >= 1 &&
    parsed.every((q) => q.prompt.length > 0 && q.options.length >= 2);

  const mut = useMutation({
    mutationFn: () => {
      const body = {
        lessonId: effLessonId,
        slug: effSlug,
        title: title.trim(),
        instructions,
        kind: 'quiz' as const,
        questions: parsed,
        xpReward: Math.max(0, Math.trunc(Number(xp)) || 0),
        status,
      };
      if (initial) return api(`/admin/content/exercises/${initial.id}`, { method: 'PATCH', body });
      return api('/admin/content/exercises', { method: 'POST', body });
    },
    onSuccess: () => {
      toast('success', initial ? 'Exercise updated' : 'Exercise created');
      if (lessonId) void qc.invalidateQueries({ queryKey: qk.adminLesson(lessonId) });
      void qc.invalidateQueries({ queryKey: qk.adminExercises });
      onClose();
    },
    onError: (e) => toast('error', 'Could not save exercise', errMsg(e)),
  });

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit exercise' : 'New exercise'} size="lg">
      <div className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. XSS Fundamentals Check" />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={effSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="font-mono"
            />
          </div>
        </div>
        {needsLessonPicker && (
          <div>
            <Label>Lesson</Label>
            <Select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)}>
              <option value="">Select a lesson…</option>
              {(lessonsQ.data?.lessons ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.pathName} · {l.title}
                </option>
              ))}
            </Select>
            <FormHint>The exercise appears attached to this lesson and can be embedded there via a Practice reference block.</FormHint>
          </div>
        )}
        <div>
          <Label>Instructions</Label>
          <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="min-h-[70px]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="w-full">
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <div className="w-full">
            <Label>XP reward</Label>
            <Input type="number" min={0} max={10000} value={xp} onChange={(e) => setXp(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="mb-0">Questions ({questions.length})</Label>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setQuestions((qs) => [...qs, { prompt: '', optionsText: '', correctIndex: 0, explanation: '' }])}
            >
              <Plus className="size-3.5" aria-hidden />
              Add question
            </Button>
          </div>
          {questions.map((q, i) => {
            const opts = linesOf(q.optionsText);
            return (
              <div key={i} className="space-y-2.5 rounded-lg border border-border p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Question {i + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={questions.length <= 1}
                    className="text-danger hover:bg-danger-subtle"
                    onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    Remove
                  </Button>
                </div>
                <Input
                  value={q.prompt}
                  onChange={(e) => setQuestions((qs) => qs.map((x, j) => (j === i ? { ...x, prompt: e.target.value } : x)))}
                  placeholder="Question prompt"
                />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Options (one per line)</Label>
                    <Textarea
                      value={q.optionsText}
                      onChange={(e) =>
                        setQuestions((qs) =>
                          qs.map((x, j) =>
                            j === i
                              ? { ...x, optionsText: e.target.value, correctIndex: Math.min(x.correctIndex, Math.max(0, linesOf(e.target.value).length - 1)) }
                              : x,
                          ),
                        )
                      }
                      className="min-h-[84px]"
                      placeholder={'Option A\nOption B'}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <Label className="text-xs">Correct answer</Label>
                      <Select
                        value={Math.min(q.correctIndex, Math.max(0, opts.length - 1))}
                        onChange={(e) => setQuestions((qs) => qs.map((x, j) => (j === i ? { ...x, correctIndex: Number(e.target.value) } : x)))}
                      >
                        {opts.map((o, oi) => (
                          <option key={oi} value={oi}>
                            Option {oi + 1}
                          </option>
                        ))}
                        {opts.length < 2 && <option value={0}>Add at least 2 options</option>}
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Explanation</Label>
                      <Input
                        value={q.explanation}
                        onChange={(e) => setQuestions((qs) => qs.map((x, j) => (j === i ? { ...x, explanation: e.target.value } : x)))}
                        placeholder="Why is this correct?"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mut.isPending} disabled={!valid} onClick={() => mut.mutate()}>
            {initial ? 'Save exercise' : 'Create exercise'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
