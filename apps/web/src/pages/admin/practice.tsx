import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, PencilLine, Plus, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { timeAgo } from '@/lib/utils';
import { StatusBadge } from '@/features/admin/status-badge';
import { ExerciseModal, type AdminExercise } from '@/features/admin/exercise-modal';
import { Button } from '@/components/ui/button';
import { Badge, Card, EmptyState, ErrorState, Skeleton } from '@/components/ui/card';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';

interface AdminExerciseRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  xpReward: number;
  questionCount: number;
  updatedAt: string;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  pathName: string;
}

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');

export default function AdminPractice() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminExercise | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminExerciseRow | null>(null);

  const listQ = useQuery({
    queryKey: qk.adminExercises,
    queryFn: () => api<{ exercises: AdminExerciseRow[] }>('/admin/content/exercises'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api(`/admin/content/exercises/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('success', 'Exercise deleted');
      setDeleteTarget(null);
      void qc.invalidateQueries({ queryKey: qk.adminExercises });
    },
    onError: (e) => toast('error', 'Delete failed', errMsg(e)),
  });

  const rows = listQ.data?.exercises ?? [];

  const openEdit = async (row: AdminExerciseRow) => {
    setLoadingEditId(row.id);
    try {
      const { exercise } = await api<{ exercise: AdminExercise & { lessonId: string } }>(`/admin/content/exercises/${row.id}`);
      setEditing(exercise);
      setFormOpen(true);
    } catch (e) {
      toast('error', 'Could not load exercise', errMsg(e));
    } finally {
      setLoadingEditId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Practice</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Quiz exercises learners attempt from the Practice hub. Each one is attached to a lesson.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" aria-hidden />
          New exercise
        </Button>
      </div>

      {listQ.isError ? (
        <ErrorState description={errMsg(listQ.error)} action={<Button variant="outline" size="sm" onClick={() => void listQ.refetch()}>Try again</Button>} />
      ) : listQ.isLoading ? (
        <Card>
          <div className="space-y-px p-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-none" />
            ))}
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No practice exercises yet"
          description="Create a quiz and attach it to a lesson — it shows up in the learner Practice hub and can be embedded in the lesson via a Practice reference block."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" aria-hidden />
              New exercise
            </Button>
          }
        />
      ) : (
        <TableCard>
          <Table>
            <THead>
              <TR>
                <TH>Exercise</TH>
                <TH>Lesson</TH>
                <TH>Questions</TH>
                <TH>XP</TH>
                <TH>Status</TH>
                <TH>Updated</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD>
                    <p className="font-medium text-text">{row.title}</p>
                    <p className="font-mono text-xs text-text-tertiary">{row.slug}</p>
                  </TD>
                  <TD>
                    <p className="text-sm text-text-secondary">{row.lessonTitle}</p>
                    <p className="text-xs text-text-tertiary">{row.pathName}</p>
                  </TD>
                  <TD>
                    <Badge variant="outline">{row.questionCount} Q</Badge>
                  </TD>
                  <TD>
                    <Badge variant="accent">+{row.xpReward} XP</Badge>
                  </TD>
                  <TD>
                    <StatusBadge status={row.status} />
                  </TD>
                  <TD className="text-sm text-text-tertiary">{timeAgo(row.updatedAt)}</TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" loading={loadingEditId === row.id} onClick={() => void openEdit(row)}>
                        <PencilLine className="size-3.5" aria-hidden />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger-subtle"
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableCard>
      )}

      <ExerciseModal
        open={formOpen}
        initial={editing}
        lessonId={editing?.lessonId}
        onClose={() => setFormOpen(false)}
      />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete exercise" size="sm">
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">
            Delete <span className="font-medium text-text">{deleteTarget?.title}</span>? Learner completion history for this exercise is
            preserved, but it disappears from the Practice hub and its lesson.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteMut.isPending} onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
