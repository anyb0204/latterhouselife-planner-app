import Link from "next/link";
import { Show } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center gap-12 px-6 py-24 text-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Latter House Life Planner
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            A daily planner for tasks, habits, and journaling — with a
            premium tier for unlimited habits and full journaling.
          </p>
        </div>

        <div className="flex gap-4">
          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Get started
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-solid border-black/[.08] px-6 py-3 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Sign in
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Go to your planner
            </Link>
          </Show>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/[.08] p-6 text-left dark:border-white/[.145]">
            <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
              Free
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Daily tasks and up to 3 habits.
            </p>
          </div>
          <div className="rounded-2xl border border-black/[.08] p-6 text-left dark:border-white/[.145]">
            <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
              Basic — $4.99/mo or $49.99/yr
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Unlimited habits.
            </p>
          </div>
          <div className="rounded-2xl border border-black/[.08] p-6 text-left dark:border-white/[.145]">
            <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
              Premium — $9.99/mo or $99.99/yr
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Unlimited habits and daily journaling.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
