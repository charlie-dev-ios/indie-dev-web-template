import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const insert = vi.fn();
const update = vi.fn();
const deleteFn = vi.fn();
const eq = vi.fn();
const revalidatePath = vi.fn();
const redirect = vi.fn((..._args: unknown[]) => {
  throw new Error("REDIRECT");
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: (...args: unknown[]) => getUser(...args) },
    from: () => ({
      insert: (...args: unknown[]) => insert(...args),
      update: (...args: unknown[]) => {
        update(...args);
        return { eq: (...inner: unknown[]) => eq(...inner) };
      },
      delete: (...args: unknown[]) => {
        deleteFn(...args);
        return { eq: (...inner: unknown[]) => eq(...inner) };
      },
    }),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirect(...args),
}));

function form(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value);
  }
  return fd;
}

describe("createTodoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
  });

  it("認証済みユーザーの TODO を作成し /todos を再検証する", async () => {
    insert.mockResolvedValue({ error: null });
    const { createTodoAction } = await import("./actions");
    const state = await createTodoAction({}, form({ title: "牛乳を買う" }));

    expect(insert).toHaveBeenCalledWith({ title: "牛乳を買う", user_id: "u1" });
    expect(revalidatePath).toHaveBeenCalledWith("/todos");
    expect(state).toEqual({});
  });

  it("タイトルが空ならエラーを返し insert しない", async () => {
    const { createTodoAction } = await import("./actions");
    const state = await createTodoAction({}, form({ title: "  " }));

    expect(insert).not.toHaveBeenCalled();
    expect(state.error).toBeTruthy();
  });

  it("挿入に失敗したらエラーを返す", async () => {
    insert.mockResolvedValue({ error: { message: "boom" } });
    const { createTodoAction } = await import("./actions");
    const state = await createTodoAction({}, form({ title: "牛乳を買う" }));

    expect(state.error).toBeTruthy();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("未認証なら login へリダイレクトする", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const { createTodoAction } = await import("./actions");

    await expect(createTodoAction({}, form({ title: "x" }))).rejects.toThrow(
      "REDIRECT",
    );
    expect(redirect).toHaveBeenCalledWith("/login");
    expect(insert).not.toHaveBeenCalled();
  });
});

describe("toggleTodoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    eq.mockResolvedValue({ error: null });
  });

  it("完了状態を反転して /todos を再検証する", async () => {
    const { toggleTodoAction } = await import("./actions");
    await toggleTodoAction(form({ id: "t1", completed: "false" }));

    expect(update).toHaveBeenCalledWith({ completed: true });
    expect(eq).toHaveBeenCalledWith("id", "t1");
    expect(revalidatePath).toHaveBeenCalledWith("/todos");
  });

  it("完了済みなら未完了に戻す", async () => {
    const { toggleTodoAction } = await import("./actions");
    await toggleTodoAction(form({ id: "t1", completed: "true" }));

    expect(update).toHaveBeenCalledWith({ completed: false });
  });
});

describe("deleteTodoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    eq.mockResolvedValue({ error: null });
  });

  it("指定した TODO を削除して /todos を再検証する", async () => {
    const { deleteTodoAction } = await import("./actions");
    await deleteTodoAction(form({ id: "t1" }));

    expect(deleteFn).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith("id", "t1");
    expect(revalidatePath).toHaveBeenCalledWith("/todos");
  });
});
