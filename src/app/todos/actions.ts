"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTodoSchema } from "@/lib/schemas/todo";
import { createClient } from "@/lib/supabase/server";

/** TODO 一覧ページのパス（再検証に使用）。 */
const TODOS_PATH = "/todos";

/** createTodoAction の戻り値（フォームの状態）。 */
export interface TodoFormState {
  error?: string;
}

/**
 * 認証済みの Supabase クライアントとユーザーを返す共通ガード。
 * 未認証なら login へリダイレクトする。
 */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}

/**
 * 新しい TODO を作成する Server Action（useActionState 用）。
 * 入力を Zod で検証し、認証済みユーザーの TODO として登録する。
 */
export async function createTodoAction(
  _prevState: TodoFormState,
  formData: FormData,
): Promise<TodoFormState> {
  const { supabase, user } = await requireUser();

  const parsed = createTodoSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  const { error } = await supabase
    .from("todos")
    .insert({ title: parsed.data.title, user_id: user.id });
  if (error) {
    return { error: "TODO の作成に失敗しました" };
  }

  revalidatePath(TODOS_PATH);
  return {};
}

/**
 * TODO の完了状態を反転する Server Action。
 * RLS に加えて user_id でも絞り込み、自分の TODO のみを更新する。
 */
export async function toggleTodoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const completed = formData.get("completed") === "true";
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("todos")
    .update({ completed: !completed })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    throw new Error("TODO の更新に失敗しました");
  }

  revalidatePath(TODOS_PATH);
}

/**
 * TODO を削除する Server Action。
 * RLS に加えて user_id でも絞り込み、自分の TODO のみを削除する。
 */
export async function deleteTodoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    throw new Error("TODO の削除に失敗しました");
  }

  revalidatePath(TODOS_PATH);
}
