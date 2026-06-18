import { z } from "zod";

/** TODO タイトルの最大文字数（DB の CHECK 制約と一致させる）。 */
export const TODO_TITLE_MAX_LENGTH = 200;

/** DB の todos テーブル 1 行に対応する型。 */
export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

/** TODO 作成時の入力バリデーションスキーマ。 */
export const createTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "タイトルを入力してください")
    .max(
      TODO_TITLE_MAX_LENGTH,
      `タイトルは ${TODO_TITLE_MAX_LENGTH} 文字以内で入力してください`,
    ),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
