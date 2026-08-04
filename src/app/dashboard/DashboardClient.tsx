"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";

type Task = { id: string; text: string; done: boolean };
type Habit = { id: string; name: string };

const FREE_HABIT_LIMIT = 3;
const TASKS_KEY = "lhl-planner-tasks";
const HABITS_KEY = "lhl-planner-habits";
const JOURNAL_KEY = "lhl-planner-journal";

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function DashboardClient({
  firstName,
  premium,
}: {
  firstName: string;
  premium: boolean;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journal, setJournal] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [habitInput, setHabitInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Deliberately loaded post-mount (not via lazy useState) so the client's
    // first render matches the server's, avoiding a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks(loadJSON(TASKS_KEY, []));
    setHabits(loadJSON(HABITS_KEY, []));
    setJournal(loadJSON(JOURNAL_KEY, ""));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    window.localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
  }, [journal]);

  function addTask() {
    if (!taskInput.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: taskInput.trim(), done: false },
    ]);
    setTaskInput("");
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function addHabit() {
    if (!habitInput.trim()) return;
    if (!premium && habits.length >= FREE_HABIT_LIMIT) return;
    setHabits((prev) => [...prev, { id: crypto.randomUUID(), name: habitInput.trim() }]);
    setHabitInput("");
  }

  function removeHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  async function startCheckout(interval: "monthly" | "annual") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function openBillingPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not open billing portal");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  const habitLimitReached = !premium && habits.length >= FREE_HABIT_LIMIT;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
        <div>
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Welcome, {firstName}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {premium ? "Premium plan" : "Free plan"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {premium ? (
            <button
              onClick={openBillingPortal}
              disabled={loading}
              className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Manage billing
            </button>
          ) : null}
          <UserButton />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        ) : null}

        {!premium ? (
          <section className="rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-zinc-950">
            <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
              Upgrade to Premium
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Unlock unlimited habits and daily journaling.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => startCheckout("monthly")}
                disabled={loading}
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
              >
                $5/month
              </button>
              <button
                onClick={() => startCheckout("annual")}
                disabled={loading}
                className="rounded-full border border-black/[.08] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                $50/year
              </button>
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-zinc-950">
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
            Today&apos;s Tasks
          </h2>
          <div className="mt-4 flex gap-2">
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Add a task"
              className="flex-1 rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
            />
            <button
              onClick={addTask}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Add
            </button>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(t.id)}
                />
                <span
                  className={
                    t.done
                      ? "flex-1 text-sm text-zinc-400 line-through"
                      : "flex-1 text-sm text-zinc-800 dark:text-zinc-200"
                  }
                >
                  {t.text}
                </span>
                <button
                  onClick={() => removeTask(t.id)}
                  className="text-xs text-zinc-400 hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
            {tasks.length === 0 ? (
              <p className="text-sm text-zinc-400">No tasks yet.</p>
            ) : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-zinc-950">
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
            Habits
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {premium
              ? "Unlimited habits with Premium."
              : `Free plan: up to ${FREE_HABIT_LIMIT} habits.`}
          </p>
          <div className="mt-4 flex gap-2">
            <input
              value={habitInput}
              onChange={(e) => setHabitInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              placeholder="Add a habit"
              disabled={habitLimitReached}
              className="flex-1 rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm disabled:opacity-50 dark:border-white/[.145]"
            />
            <button
              onClick={addHabit}
              disabled={habitLimitReached}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              Add
            </button>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {habits.map((h) => (
              <li key={h.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200">
                  {h.name}
                </span>
                <button
                  onClick={() => removeHabit(h.id)}
                  className="text-xs text-zinc-400 hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
            {habits.length === 0 ? (
              <p className="text-sm text-zinc-400">No habits yet.</p>
            ) : null}
          </ul>
          {habitLimitReached ? (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              You&apos;ve reached the free plan habit limit. Upgrade to add more.
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-zinc-950">
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
            Journal
          </h2>
          {premium ? (
            <textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="What are your thoughts today?"
              rows={6}
              className="mt-4 w-full rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm dark:border-white/[.145]"
            />
          ) : (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Journaling is a Premium feature.{" "}
              <button
                onClick={() => startCheckout("monthly")}
                className="font-medium text-zinc-950 underline dark:text-zinc-50"
              >
                Upgrade to unlock it
              </button>
              .
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
