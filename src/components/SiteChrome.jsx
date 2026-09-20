import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Menu } from "lucide-react";
import { Meta } from "./Lockup";
import Mascot from "./Mascot";
import { cx, sectionAccent } from "../lib/utils";
import { getEdition } from "../data/editions";
import { issueSections } from "../lib/issueSections";

// Renders the real logo once it exists at /public/assets/logo.png; falls
// back to a simple monogram so the build/site never breaks on a missing file.
function Logo({ className = "h-8 w-8" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={`grid place-items-center rounded-full bg-green text-cream-soft ${className}`}>
        <span className="font-accent text-lg italic leading-none">a</span>
      </span>
    );
  }
  return (
    <img
      src="/assets/logo.png"
      alt=""
      className={`rounded-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

// The menu is this issue's index. It used to mirror the parent site's own nav,
// which meant a second front door to pages the magazine has no part in — and a
// separate "in this issue" block further down doing the real job. The menu now
// reads the same section manifest the page numbers itself from, so it can
// never list a section the issue doesn't carry.
//
// Nothing here links out to ngoaquaterra.com.
function useIssueSections() {
  const { pathname } = useLocation();
  const [, year, month] = pathname.split("/");
  const edition = year && month ? getEdition(year, month) : null;
  return edition ? issueSections(edition) : [];
}

// One entry in the index, wearing the colour that section already owns — the
// same `-soft` ground the archive's format grid uses, so the menu reads as the
// issue's own table of contents rather than eight rows of the same grey. No new
// colours: every one of these is already on the page below it (§4).
//
// It is a tile, not a row, and it is a tile at every width — the grid stays two
// across on a phone. That is what the stacked shape is for: the numeral and the
// arrow share the top line, which is mostly air anyway, so the label gets the
// tile's full width instead of wrapping around them at 167px.
//
// The arrow only appears on hover or keyboard focus. Eight of them parked on
// the page read as decoration; it means "this one, now", so it turns up when
// you are on one. Hover-only must not mean focus-invisible, hence the
// `group-focus-visible` twin on both the arrow and the mark.
function MenuItem({ section, onNavigate }) {
  const a = sectionAccent(section.accent);
  return (
    <a
      href={`#${section.id}`}
      onClick={onNavigate}
      className={cx(
        "group relative flex min-h-[4.75rem] flex-col justify-between gap-2 overflow-hidden",
        "rounded-2xl py-2.5 pl-4 pr-3 text-ink",
        // Tailwind v4 emits `-translate-y-*` as the `translate` property, not as
        // `transform`, and the base rule on `a` (§4 Motion) lists `transform`.
        // So the lift names its own property or it snaps; the curve and duration
        // still come from the theme.
        "transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-(--shadow-card)",
        a.soft
      )}
    >
      {/* The section's solid colour as a mark down the edge, short at rest and
          drawn to full height when you are on it. A span is not in the base
          transition rule, so it names its own — and it names `scale`, because in
          Tailwind v4 `scale-y-*` is the `scale` property and `transition-transform`
          does not reach it. */}
      <span
        aria-hidden="true"
        className={cx(
          "absolute inset-y-0 left-0 w-[3px] origin-center scale-y-[0.32] rounded-full transition-[scale]",
          "group-hover:scale-y-100 group-focus-visible:scale-y-100",
          a.rule
        )}
      />

      <span className="flex items-center justify-between gap-2">
        <Meta className={cx("tabular-nums", a.text)}>
          {String(section.index).padStart(2, "0")}
        </Meta>
        <span
          aria-hidden="true"
          className={cx(
            "-translate-x-1 opacity-0 transition",
            "group-hover:translate-x-0 group-hover:opacity-100",
            "group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
            a.text
          )}
        >
          →
        </span>
      </span>

      <span className="text-pretty text-[0.875rem] font-semibold leading-tight">
        {section.label}
      </span>
    </a>
  );
}

export function TopBar() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const sections = useIssueSections();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const hasMenu = sections.length > 0;

  return (
    <div className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3 rounded-full border border-line/70 bg-cream-soft/95 py-2 pl-3 pr-2 shadow-(--shadow-card) backdrop-blur-md sm:pl-4">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex min-w-0 items-center gap-2.5"
            aria-label="AquaTerra Recaps — all editions"
          >
            <Logo className="h-7 w-7 shrink-0" />
            <span className="flex min-w-0 items-center gap-2">
              <span className="hidden truncate text-sm font-semibold tracking-tight min-[380px]:inline">AquaTerra</span>
              <span className="shrink-0 rounded-full bg-green px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-cream-soft">
                Recaps
              </span>
            </span>
          </Link>

          {hasMenu && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? "Close the issue index" : "Open the issue index"}
              className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-ink transition-colors hover:bg-paper"
            >
              <Meta className="hidden sm:inline">In this issue</Meta>
              {open ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
            </button>
          )}
        </div>

        {open && hasMenu && (
          <nav
            id={panelId}
            aria-label="In this issue"
            // .rise-in, not .reveal: .reveal is the 0.55s entrance a section gets
            // once, on scroll. A menu you opened yourself should be there by the
            // time you have finished clicking.
            className="rise-in mt-2 rounded-[1.75rem] border border-line/70 bg-cream-soft p-3 shadow-(--shadow-card-hover) sm:p-4"
          >
            <Meta className="block px-2 pb-2 pt-1 text-ink-3">In this issue</Meta>
            <div className="grid grid-cols-2 gap-2">
              {sections.map((section) => (
                <MenuItem key={section.id} section={section} onNavigate={() => setOpen(false)} />
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

// The parent site's footer bar, and only the bar. Its cream letter panel and
// its two social pills were both built here and then taken back out at the
// desk's request, so: no letter, no sign-off, and nothing here links anywhere.
// Both strings are AquaTerra's own copy (CLAUDE.md §2).
export function Footer() {
  return (
    <footer className="bg-near-black">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-9 text-center sm:px-8 sm:flex-row sm:justify-between sm:gap-8 sm:text-left lg:px-10">
        <div className="flex shrink-0 items-center gap-3">
          <Logo className="h-8 w-8" />
          <span className="u-display text-xl text-cream-soft sm:text-2xl">AQUATERRA</span>
          <Mascot className="h-6 w-6" color="var(--color-team-social)" />
        </div>

        <div className="sm:text-right">
          <Meta className="block text-cream-soft/70">
            © {new Date().getFullYear()} AQUATERRA · OPEN COMMUNITY, NO RIGHTS RESERVED.
          </Meta>
          <Meta className="mt-1.5 block text-cream-soft/40">
            Kolkata · est. 2021 · 1,300+ members
          </Meta>
        </div>
      </div>
    </footer>
  );
}
