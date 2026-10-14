import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';

type RecordActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  className?: string;
};

export function RecordActions({
  onEdit,
  onDelete,
  editDisabled = false,
  deleteDisabled = false,
  className = '',
}: RecordActionsProps) {
  const { t } = useTranslation();
  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant="ghost"
        onClick={onEdit}
        disabled={editDisabled}
        aria-label={t('common.edit')}
        className="min-h-9 px-3 py-1.5"
      >
        <IoCreateOutline aria-hidden="true" className="text-base" />
        <span>{t('common.edit')}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={onDelete}
        disabled={deleteDisabled}
        aria-label={t('common.delete')}
        className="min-h-9 px-3 py-1.5 text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_12%,transparent)] hover:text-[var(--error)]"
      >
        <IoTrashOutline aria-hidden="true" className="text-base" />
        <span>{t('common.delete')}</span>
      </Button>
    </div>
  );
}
