import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/overlay';

/** Delete confirmation shared by the admin report list and editor. */
export function DeleteReportModal({
  report,
  pending,
  onCancel,
  onConfirm,
}: {
  report: { title: string; status: string } | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={!!report} onClose={onCancel} title="Delete report" size="sm">
      <div className="space-y-4 p-5">
        <p className="text-sm text-text-secondary">
          This permanently deletes <span className="font-medium text-text">{report?.title}</span> and its attached image and
          video.
          {report?.status === 'published' && ' Its public page will stop working immediately.'} This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" loading={pending} onClick={onConfirm}>
            Delete report
          </Button>
        </div>
      </div>
    </Modal>
  );
}
