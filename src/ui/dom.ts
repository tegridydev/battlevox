export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw Error(`Missing UI element: ${id}`);
  return el as T;
}
export function text(id: string, value: string | number) {
  const el = byId(id),
    next = String(value);
  if (el.textContent !== next) el.textContent = next;
}
export function option(value: string, label: string) {
  const el = document.createElement('option');
  el.value = value;
  el.textContent = label;
  return el;
}
export function replaceRows(container: HTMLElement, rows: readonly string[]) {
  const old = [...container.children];
  rows.forEach((value, i) => {
    const el = old[i] ?? document.createElement('div');
    if (el.textContent !== value) el.textContent = value;
    if (!el.parentElement) container.append(el);
  });
  for (let i = rows.length; i < old.length; i++) old[i].remove();
}
