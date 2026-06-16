"use client";

import { useActionState } from "react";
import { createTodoAction, type TodoFormState } from "@/app/todos/actions";

const initialState: TodoFormState = {};

/**
 * TODO を新規作成するフォーム。
 * Server Action を useActionState で呼び出し、バリデーションエラーを表示する。
 */
export function TodoForm() {
  const [state, formAction, pending] = useActionState(
    createTodoAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          name="title"
          placeholder="新しい TODO を入力"
          aria-label="TODO のタイトル"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          追加
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
