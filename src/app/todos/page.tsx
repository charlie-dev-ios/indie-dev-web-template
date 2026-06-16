import { redirect } from "next/navigation";
import { TodoForm } from "@/components/todos/TodoForm";
import { TodoList } from "@/components/todos/TodoList";
import type { Todo } from "@/lib/schemas/todo";
import { createClient } from "@/lib/supabase/server";

export default async function TodosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 二重ガード（middleware でも保護しているが念のため）
  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });
  const todos = (data ?? []) as Todo[];

  return (
    <main className="container mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">TODO</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        あなたの TODO を管理できます。データは Supabase に保存されます。
      </p>

      <div className="mt-6">
        <TodoForm />
      </div>

      <div className="mt-6">
        <TodoList todos={todos} />
      </div>
    </main>
  );
}
