import { deleteTodoAction, toggleTodoAction } from "@/app/todos/actions";
import type { Todo } from "@/lib/schemas/todo";

interface TodoItemProps {
  todo: Todo;
}

/**
 * TODO 1 件を表示する。完了トグルと削除はそれぞれ Server Action を呼ぶ
 * フォームとして実装し、JS なしでも動作する（プログレッシブエンハンスメント）。
 */
export function TodoItem({ todo }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-input px-3 py-2">
      <form
        action={toggleTodoAction}
        className="flex flex-1 items-center gap-3"
      >
        <input type="hidden" name="id" value={todo.id} />
        <input type="hidden" name="completed" value={String(todo.completed)} />
        <button
          type="submit"
          aria-label={todo.completed ? "未完了に戻す" : "完了にする"}
          aria-pressed={todo.completed}
          className="flex size-5 shrink-0 items-center justify-center rounded border border-input text-xs"
        >
          {todo.completed ? "✓" : ""}
        </button>
        <span
          className={
            todo.completed
              ? "flex-1 text-sm text-muted-foreground line-through"
              : "flex-1 text-sm"
          }
        >
          {todo.title}
        </span>
      </form>
      <form action={deleteTodoAction}>
        <input type="hidden" name="id" value={todo.id} />
        <button
          type="submit"
          aria-label="削除"
          className="text-sm text-red-600 transition-colors hover:underline"
        >
          削除
        </button>
      </form>
    </div>
  );
}
