import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useUserStore } from "../store/userStore";
import WelcomeBar from "@/components/WelcomeBar";

const API_URL = "https://jsonplaceholder.typicode.com/todos";

const fetchTodos = async () => {
  const { data } = await axios.get(API_URL + "?_limit=100");
  return data;
};

const createTodo = async (todo: any) => {
  const { data } = await axios.post(API_URL, todo);
  return data;
};

const updateTodo = async (todo: any) => {
  const { data } = await axios.put(`${API_URL}/${todo.id}`, todo);
  return data;
};

const deleteTodo = async (id: number) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
};

const ITEMS_PER_PAGE = 10;

const TodoList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{
    type: "create" | "edit" | "delete" | null;
    todo?: any;
  }>({ type: null });
  const username = useUserStore((state) => state.username);
  const setUsername = useUserStore((state) => state.setUsername);

  const { data: todos, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: (newTodo) => {
      queryClient.setQueryData(["todos"], (old: any) => [
        newTodo,
        ...(old || []),
      ]);
      closeModal();
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const [form, setForm] = useState({ title: "", completed: false });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (modal.type === "edit" && modal.todo) {
      setForm({ title: modal.todo.title, completed: modal.todo.completed });
    }
    if (modal.type === "create") {
      setForm({ title: "", completed: false });
    }
  }, [modal]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const openModal = (type: "create" | "edit" | "delete", todo?: any) => {
    setForm(
      todo
        ? { title: todo.title, completed: todo.completed }
        : { title: "", completed: false }
    );
    setModal({ type, todo });
  };

  const closeModal = () => setModal({ type: null });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.type === "create") {
      createMutation.mutate({ ...form, userId: 1 }, { onSuccess: closeModal });
    } else if (modal.type === "edit" && modal.todo) {
      updateMutation.mutate(
        { ...modal.todo, ...form },
        { onSuccess: closeModal }
      );
    }
  };

  const handleDelete = () => {
    if (modal.todo) {
      deleteMutation.mutate(modal.todo.id, { onSuccess: closeModal });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    Cookies.remove("token");
    setUsername(null);
    router.push("/");
  };

  // --- Pagination & Search ---
  const filteredTodos = todos
    ? todos.filter((todo: any) =>
        todo.title.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);
  const pagedTodos = filteredTodos.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="p-6">
      <WelcomeBar />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">لیست کارها</h1>
        <input
          type="text"
          placeholder="جستجو..."
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-400 w-full sm:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded shadow transition"
          onClick={() => openModal("create")}
        >
          افزودن کار جدید
        </button>
      </div>

      {isLoading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-right">#</th>
                <th className="py-2 px-4 border-b text-right">عنوان</th>
                <th className="py-2 px-4 border-b text-right">وضعیت</th>
                <th className="py-2 px-4 border-b text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {pagedTodos.map((todo: any, idx: number) => (
                <tr key={todo.id} className="hover:bg-rose-50 transition">
                  <td className="py-2 px-4 border-b">
                    {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                  </td>
                  <td className="py-2 px-4 border-b">{todo.title}</td>
                  <td className="py-2 px-4 border-b">
                    {todo.completed ? (
                      <span className="text-green-600 font-bold">
                        انجام شده
                      </span>
                    ) : (
                      <span className="text-gray-500">در انتظار</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow transition"
                      onClick={() => openModal("edit", todo)}
                    >
                      ویرایش
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow transition"
                      onClick={() => openModal("delete", todo)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {pagedTodos.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">
                    آیتمی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            قبلی
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-rose-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            بعدی
          </button>
        </div>
      )}

      {/* Modal */}
      {modal.type && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-all duration-200">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in">
            {modal.type === "delete" ? (
              <>
                <h2 className="text-xl font-bold mb-4">حذف کار</h2>
                <p className="mb-6">آیا از حذف این کار مطمئن هستید؟</p>
                <div className="flex justify-end gap-2">
                  <button
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={closeModal}
                  >
                    انصراف
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    onClick={handleDelete}
                  >
                    حذف
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold mb-4">
                  {modal.type === "create" ? "افزودن کار جدید" : "ویرایش کار"}
                </h2>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">
                    عنوان
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-400"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.completed}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, completed: e.target.checked }))
                    }
                    id="completed"
                  />
                  <label htmlFor="completed" className="text-sm">
                    انجام شده
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={closeModal}
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded"
                  >
                    {modal.type === "create" ? "افزودن" : "ذخیره"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
