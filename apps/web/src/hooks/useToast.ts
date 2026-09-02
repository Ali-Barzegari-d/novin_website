'use client';

import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/Toast';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 240;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastInput = Omit<ToasterToast, 'id' | 'open'>;
type ToastUpdate = Partial<ToastInput>;

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST'
} as const;

type Action =
  | { type: typeof actionTypes.ADD_TOAST; toast: ToasterToast }
  | { type: typeof actionTypes.UPDATE_TOAST; toast: ToastUpdate & Pick<ToasterToast, 'id'> }
  | { type: typeof actionTypes.DISMISS_TOAST; toastId?: string }
  | { type: typeof actionTypes.REMOVE_TOAST; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

let count = 0;
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners = new Set<(state: State) => void>();
let memoryState: State = { toasts: [] };

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: actionTypes.REMOVE_TOAST, toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === action.toast.id ? { ...toast, ...action.toast } : toast
        )
      };
    case actionTypes.DISMISS_TOAST: {
      const toDismiss = action.toastId
        ? state.toasts.filter((toast) => toast.id === action.toastId)
        : state.toasts;
      toDismiss.forEach((toast) => addToRemoveQueue(toast.id));
      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          action.toastId === undefined || toast.id === action.toastId
            ? { ...toast, open: false }
            : toast
        )
      };
    }
    case actionTypes.REMOVE_TOAST:
      return action.toastId === undefined
        ? { ...state, toasts: [] }
        : { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.toastId) };
  }
}

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

function toast(props: ToastInput) {
  const id = genId();
  const { onOpenChange, ...toastProps } = props;
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });
  const update = (next: ToastUpdate) =>
    dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...next, id } });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...toastProps,
      id,
      open: true,
      onOpenChange: (open) => {
        onOpenChange?.(open);
        if (!open) dismiss();
      }
    }
  });

  return { id, dismiss, update };
}

function dismissToast(toastId?: string) {
  dispatch(
    toastId === undefined
      ? { type: actionTypes.DISMISS_TOAST }
      : { type: actionTypes.DISMISS_TOAST, toastId }
  );
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: dismissToast
  };
}

export { reducer, toast, useToast };
