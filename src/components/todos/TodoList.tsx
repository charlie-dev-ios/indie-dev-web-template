import type { Todo } from "@/lib/schemas/todo";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
}

/** TODO の一覧を表示する。空のときは案内メッセージを表示する。 */
export function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">TODO はまだありません。</p>
    );
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li key={todo.id}>
          <TodoItem todo={todo} />
        </li>
      ))}
    </ul>
  );
}
