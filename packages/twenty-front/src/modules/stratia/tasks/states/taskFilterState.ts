import { atom } from 'jotai';

export const isTaskCreationOpenAtom = atom<boolean>(false);

export const taskCreationLeadIdAtom = atom<string | null>(null);
