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

// Supabase クエリの結果（テストごとに差し替える）。
let queryResult: { error: unknown } = { error: null };

// `.eq(...).eq(...)` と連鎖でき、最後に await すると結果を返すクエリビルダーのモック。
// 実体は Promise なので await 可能。eq は自身を返して連鎖できるようにする。
type Chain = Promise<{ error: unknown }> & {
  eq: (...args: unknown[]) => Chain;
};

function makeChain(): Chain {
  const chain = Promise.resolve(queryResult) as Chain;
  chain.eq = (...args: unknown[]) => {
    eq(...args);
    return makeChain();
  };
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: (...args: unknown[]) => getUser(...args) },
    from: () => ({
      insert: (...args: unknown[]) => {
        insert(...args);
        return Promise.resolve(queryResult);
      },
      update: (...args: unknown[]) => {
        update(...args);
        return makeChain();
      },
      delete: (...args: unknown[]) => {
        deleteFn(...args);
        return makeChain();
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

beforeEach(() => {
  vi.clearAllMocks();
  queryResult = { error: null };
  getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
});

describe("createTodoAction", () => {
  it("認証済みユーザーの TODO を作成し /todos を再検証する", async () => {
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

  it("挿入に失敗したらエラーを返し再検証しない", async () => {
    queryResult = { error: { message: "boom" } };
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
  it("完了状態を反転し、自分の TODO に限定して更新する", async () => {
    const { toggleTodoAction } = await import("./actions");
    await toggleTodoAction(form({ id: "t1", completed: "false" }));

    expect(update).toHaveBeenCalledWith({ completed: true });
    expect(eq).toHaveBeenCalledWith("id", "t1");
    expect(eq).toHaveBeenCalledWith("user_id", "u1");
    expect(revalidatePath).toHaveBeenCalledWith("/todos");
  });

  it("完了済みなら未完了に戻す", async () => {
    const { toggleTodoAction } = await import("./actions");
    await toggleTodoAction(form({ id: "t1", completed: "true" }));

    expect(update).toHaveBeenCalledWith({ completed: false });
  });

  it("更新に失敗したら例外を投げ、再検証しない", async () => {
    queryResult = { error: { message: "boom" } };
    const { toggleTodoAction } = await import("./actions");

    await expect(
      toggleTodoAction(form({ id: "t1", completed: "false" })),
    ).rejects.toThrow();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteTodoAction", () => {
  it("自分の TODO に限定して削除し /todos を再検証する", async () => {
    const { deleteTodoAction } = await import("./actions");
    await deleteTodoAction(form({ id: "t1" }));

    expect(deleteFn).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith("id", "t1");
    expect(eq).toHaveBeenCalledWith("user_id", "u1");
    expect(revalidatePath).toHaveBeenCalledWith("/todos");
  });

  it("削除に失敗したら例外を投げる", async () => {
    queryResult = { error: { message: "boom" } };
    const { deleteTodoAction } = await import("./actions");

    await expect(deleteTodoAction(form({ id: "t1" }))).rejects.toThrow();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
