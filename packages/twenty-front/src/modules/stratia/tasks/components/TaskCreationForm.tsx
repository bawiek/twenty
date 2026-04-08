import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { isPast, parseISO, startOfDay } from 'date-fns';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useTaskMutations } from '../hooks/useTaskMutations';
import {
  isTaskCreationOpenAtom,
  taskCreationLeadIdAtom,
} from '../states/taskFilterState';

const taskSchema = z.object({
  title: z.string().min(1, { message: 'Le titre est requis' }),
  description: z.string().default(''),
  dueAt: z.string().refine(
    (dateString) => {
      if (!dateString) return false;
      const parsed = parseISO(dateString);
      return !isPast(startOfDay(parsed)) || startOfDay(parsed).getTime() === startOfDay(new Date()).getTime();
    },
    { message: "La date doit etre aujourd'hui ou plus tard" },
  ),
  priority: z.enum(['URGENT', 'IMPORTANT', 'NORMAL']).default('NORMAL'),
  leadId: z.string().nullable().default(null),
});

type TaskFormData = z.infer<typeof taskSchema>;

const StyledForm = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
    outline: none;
  }
`;

const StyledTextArea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  min-height: 60px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  resize: vertical;

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
    outline: none;
  }
`;

const StyledSelect = styled.select`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  &:focus {
    border-color: ${themeCssVariables.accent.primary};
    outline: none;
  }
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledError = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
`;

export const TaskCreationForm = () => {
  const [isOpen, setIsOpen] = useAtomState(isTaskCreationOpenAtom);
  const prefilledLeadId = useAtomStateValue(taskCreationLeadIdAtom);
  const { createTask, isCreating } = useTaskMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      dueAt: '',
      priority: 'NORMAL',
      leadId: prefilledLeadId,
    },
  });

  const handleClose = useCallback(() => {
    reset();
    setIsOpen(false);
  }, [reset, setIsOpen]);

  const onSubmit = useCallback(
    async (data: TaskFormData) => {
      await createTask({
        title: data.title,
        description: data.description ?? '',
        dueAt: new Date(data.dueAt).toISOString(),
        priority: data.priority ?? 'NORMAL',
        leadId: data.leadId ?? undefined,
      });
      handleClose();
    },
    [createTask, handleClose],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <StyledForm>
      <StyledFieldGroup>
        <StyledLabel htmlFor="task-title">{t`Titre`}</StyledLabel>
        <StyledInput
          id="task-title"
          type="text"
          placeholder={t`Nom de la tache`}
          {...register('title')}
        />
        {errors.title && <StyledError>{errors.title.message}</StyledError>}
      </StyledFieldGroup>

      <StyledFieldGroup>
        <StyledLabel htmlFor="task-description">{t`Description`}</StyledLabel>
        <StyledTextArea
          id="task-description"
          placeholder={t`Description optionnelle`}
          {...register('description')}
        />
      </StyledFieldGroup>

      <StyledRow>
        <StyledFieldGroup style={{ flex: 1 }}>
          <StyledLabel htmlFor="task-dueAt">{t`Date d'echeance`}</StyledLabel>
          <StyledInput
            id="task-dueAt"
            type="date"
            {...register('dueAt')}
          />
          {errors.dueAt && <StyledError>{errors.dueAt.message}</StyledError>}
        </StyledFieldGroup>

        <StyledFieldGroup style={{ flex: 1 }}>
          <StyledLabel htmlFor="task-priority">{t`Priorite`}</StyledLabel>
          <StyledSelect id="task-priority" {...register('priority')}>
            <option value="NORMAL">Normal</option>
            <option value="IMPORTANT">Important</option>
            <option value="URGENT">Urgent</option>
          </StyledSelect>
        </StyledFieldGroup>
      </StyledRow>

      {prefilledLeadId === null && (
        <StyledFieldGroup>
          <StyledLabel htmlFor="task-leadId">{t`Lead associe`}</StyledLabel>
          <StyledInput
            id="task-leadId"
            type="text"
            placeholder={t`ID du lead (optionnel)`}
            {...register('leadId')}
          />
        </StyledFieldGroup>
      )}

      <StyledActions>
        <Button
          title={t`Annuler`}
          variant="tertiary"
          size="small"
          onClick={handleClose}
        />
        <Button
          title={t`Creer`}
          variant="primary"
          accent="blue"
          size="small"
          disabled={!isValid || isCreating}
          onClick={handleSubmit(onSubmit)}
        />
      </StyledActions>
    </StyledForm>
  );
};
