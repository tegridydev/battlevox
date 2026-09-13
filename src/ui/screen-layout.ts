import type { CareerViewState } from './career';
/** Fixed page chrome with keyboard-accessible, scrollable tab panels. */
export class ScreenLayout {
  readonly career: CareerViewState = {
    item: 'ar30',
    assignments: 0,
    stats: 0,
    medals: 0,
    history: 0,
  };
  constructor(
    signal: AbortSignal,
    private refresh: () => void,
  ) {
    const groups = new Set<string>();
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-tab]')) {
      const [group, value] = b.dataset.tab!.split(':');
      groups.add(group);
      b.id = `tab-${group}-${value}`;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', `panel-${group}-${value}`);
    }
    for (const panel of document.querySelectorAll<HTMLElement>('[data-panel]')) {
      const [group, value] = panel.dataset.panel!.split(':');
      panel.id = `panel-${group}-${value}`;
      panel.setAttribute('role', 'tabpanel');
      panel.tabIndex = 0;
      panel.setAttribute('aria-labelledby', `tab-${group}-${value}`);
    }
    for (const group of groups) {
      const value = document
        .querySelector<HTMLElement>(`[data-tab^="${group}:"]`)!
        .dataset.tab!.split(':')[1];
      this.select(group, value);
    }
    document.addEventListener(
      'click',
      (e) => {
        if (!(e.target instanceof HTMLElement)) return;
        const b = (e.target as HTMLElement).closest<HTMLElement>('[data-tab],[data-page-step]');
        if (!b) return;
        if (b.dataset.tab) {
          const [group, value] = b.dataset.tab.split(':');
          this.select(group, value);
        }
        if (b.dataset.pageStep) {
          const [key, step] = b.dataset.pageStep.split(':');
          if (key === 'assignments' || key === 'stats' || key === 'medals' || key === 'history') {
            this.career[key] = Math.max(0, this.career[key] + Number(step));
            this.refresh();
          }
        }
      },
      { signal },
    );
    document.addEventListener(
      'keydown',
      (e) => {
        if (!(e.target instanceof HTMLElement)) return;
        const b = (e.target as HTMLElement).closest<HTMLElement>('[data-tab]');
        if (!b || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.code)) return;
        e.preventDefault();
        const group = b.dataset.tab!.split(':')[0];
        const buttons = [
          ...document.querySelectorAll<HTMLButtonElement>(`[data-tab^="${group}:"]`),
        ].filter((b) => !b.hidden && !b.disabled);
        const i = buttons.indexOf(b as HTMLButtonElement);
        const next =
          e.code === 'Home'
            ? 0
            : e.code === 'End'
              ? buttons.length - 1
              : (i + (e.code === 'ArrowLeft' ? -1 : 1) + buttons.length) % buttons.length;
        const target = buttons[next];
        if (!target) return;
        this.select(group, target.dataset.tab!.split(':')[1]);
        target.focus({ preventScroll: true });
      },
      { signal },
    );
    document.getElementById('arsenalItem')!.addEventListener(
      'change',
      (e) => {
        this.career.item = (e.target as HTMLSelectElement).value;
        this.refresh();
      },
      { signal },
    );
    window.addEventListener('resize', () => this.refresh(), { signal });
  }
  select(group: string, value: string) {
    const key = `${group}:${value}`;
    if (!document.querySelector(`[data-panel="${key}"]`)) return;
    for (const b of document.querySelectorAll<HTMLButtonElement>(`[data-tab^="${group}:"]`)) {
      const selected = b.dataset.tab === key;
      b.classList.toggle('selected', selected);
      b.setAttribute('aria-selected', String(selected));
      b.tabIndex = selected ? 0 : -1;
    }
    for (const panel of document.querySelectorAll<HTMLElement>(`[data-panel^="${group}:"]`))
      panel.hidden = panel.dataset.panel !== key;
  }
}
