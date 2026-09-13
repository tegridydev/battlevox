import { aimSensitivity } from '../core/loadout';
import { angleWrap, clamp } from '../core/math';
import type { App } from '../ui/app';
import { byId } from '../ui/dom';
export class InputController {
  private abort = new AbortController();
  private dragLook = false;
  private movePointer: number | null = null;
  private lookPointer: number | null = null;
  private lookX = 0;
  private lookY = 0;
  private touchHeld = new Map<string, number>();
  constructor(
    private app: App,
    private canvas: HTMLCanvasElement,
  ) {
    const signal = this.abort.signal,
      s = app.sim;
    document.addEventListener('keydown', (e) => this.keyDown(e), { signal });
    document.addEventListener(
      'keyup',
      (e) => {
        s.input.keys.delete(e.code);
      },
      { signal },
    );
    document.addEventListener(
      'pointerlockchange',
      () => {
        if (!document.pointerLockElement && s.acceptsInput && !s.touch && byId('scoreboard').hidden)
          app.pause();
      },
      { signal },
    );
    canvas.addEventListener(
      'wheel',
      (e) => {
        if (
          !s.acceptsInput ||
          !byId('scoreboard').hidden ||
          !Number.isFinite(e.deltaY) ||
          e.deltaY === 0
        )
          return;
        e.preventDefault();
        if (s.input.aim) s.cycleZoom(Math.sign(e.deltaY));
        else s.cycleWeapon(Math.sign(e.deltaY));
      },
      { signal, passive: false },
    );
    canvas.addEventListener('pointercancel', () => this.reset(), { signal });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    canvas.addEventListener(
      'pointerdown',
      (e) => {
        if (!s.acceptsInput || e.pointerType === 'touch') return;
        if (e.button === 0) {
          this.requestLook();
          s.input.fire = true;
          s.input.firePressed = true;
          this.dragLook = true;
        }
        if (e.button === 2) s.toggleAim(true);
      },
      { signal },
    );
    window.addEventListener(
      'pointerup',
      (e) => {
        if (e.pointerType === 'touch') return;
        if (e.button === 0) {
          s.input.fire = false;
          this.dragLook = false;
        }
        if (e.button === 2) s.toggleAim(false);
      },
      { signal },
    );
    window.addEventListener(
      'mousemove',
      (e) => {
        if (!s.acceptsInput || s.touch || (!document.pointerLockElement && !this.dragLook)) return;
        const sensitivity = 0.0021 * s.settings.sensitivity * aimSensitivity(s);
        s.yaw = angleWrap(s.yaw + e.movementX * sensitivity);
        s.pitch = clamp(s.pitch - e.movementY * sensitivity, -1.4, 1.4);
      },
      { signal },
    );
    window.addEventListener(
      'blur',
      () => {
        this.reset();
        if (s.playing) app.pause();
      },
      { signal },
    );
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden && s.playing) app.pause();
      },
      { signal },
    );
    const pad = byId('movePad');
    const stick = (e: PointerEvent) => {
      const r = pad.getBoundingClientRect(),
        dx = e.clientX - r.left - r.width / 2,
        dy = e.clientY - r.top - r.height / 2,
        l = Math.max(1, Math.hypot(dx, dy) / (r.width * 0.35));
      s.input.mx = dx / l / (r.width * 0.35);
      s.input.mz = dy / l / (r.width * 0.35);
      byId('stick').style.transform = `translate(${dx / l}px,${dy / l}px)`;
    };
    pad.addEventListener(
      'pointerdown',
      (e) => {
        if (!s.acceptsInput || this.movePointer !== null) return;
        e.preventDefault();
        this.movePointer = e.pointerId;
        pad.setPointerCapture(e.pointerId);
        stick(e);
      },
      { signal },
    );
    pad.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerId === this.movePointer) stick(e);
      },
      { signal },
    );
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
      pad.addEventListener(
        type,
        (e) => {
          if ((e as PointerEvent).pointerId !== this.movePointer) return;
          this.movePointer = null;
          s.input.mx = s.input.mz = 0;
          byId('stick').style.transform = '';
        },
        { signal },
      );
    canvas.addEventListener(
      'pointerdown',
      (e) => {
        if (!s.acceptsInput || !s.touch || e.pointerType !== 'touch' || this.lookPointer !== null)
          return;
        this.lookPointer = e.pointerId;
        this.lookX = e.clientX;
        this.lookY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
      },
      { signal },
    );
    canvas.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerId !== this.lookPointer || !s.acceptsInput) return;
        const sensitivity = 0.005 * s.settings.sensitivity * aimSensitivity(s);
        s.yaw = angleWrap(s.yaw + (e.clientX - this.lookX) * sensitivity);
        s.pitch = clamp(s.pitch - (e.clientY - this.lookY) * sensitivity, -1.4, 1.4);
        this.lookX = e.clientX;
        this.lookY = e.clientY;
      },
      { signal },
    );
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
      canvas.addEventListener(
        type,
        (e) => {
          if ((e as PointerEvent).pointerId === this.lookPointer) this.lookPointer = null;
        },
        { signal },
      );
    const touch = (id: string, down: () => void, up?: () => void) => {
      const el = byId(id);
      el.addEventListener(
        'pointerdown',
        (e) => {
          if (!s.acceptsInput || this.touchHeld.has(id)) return;
          e.preventDefault();
          this.touchHeld.set(id, e.pointerId);
          el.setPointerCapture(e.pointerId);
          down();
        },
        { signal },
      );
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
        el.addEventListener(
          type,
          (e) => {
            if (this.touchHeld.get(id) === (e as PointerEvent).pointerId) {
              this.touchHeld.delete(id);
              up?.();
            }
          },
          { signal },
        );
    };
    touch(
      'fire',
      () => {
        s.input.fire = true;
        s.input.firePressed = true;
      },
      () => {
        s.input.fire = false;
      },
    );
    touch('jump', () => {
      s.input.jump = true;
    });
    touch(
      'aim',
      () => s.toggleAim(true),
      () => s.toggleAim(false),
    );
    touch('crouch', () => {
      s.input.crouch = !s.input.crouch;
    });
    touch('reload', () => s.reload());
    touch('grenade', () => s.throwGrenade());
    touch('touchSmoke', () => s.throwSmoke());
    touch('touchZoom', () => s.cycleZoom());
    touch('swap', () => s.cycleWeapon());
    touch('enter', () => s.useVehicle());
    touch('liftDown', () => {
      const held = s.input.keys.has('ShiftLeft');
      s.input.keys.add('ShiftLeft');
      s.useLift();
      if (!held) s.input.keys.delete('ShiftLeft');
    });
    touch('heal', () => s.heal());
    touch('touchClass', () => s.classAbility());
    touch('touchPing', () => s.ping());
    touch('buildCover', () => s.fortify());
    touch('touchOrders', () => app.openTactical('orders'));
    touch('touchMap', () => app.openTactical('map'));
  }
  private keyDown(e: KeyboardEvent) {
    const a = this.app,
      s = a.sim;
    if (!byId('actionDialog').hidden) {
      if (e.code === 'Escape') {
        e.preventDefault();
        a.closeDialog();
        return;
      }
      if (e.code === 'Tab') {
        e.preventDefault();
        (document.activeElement === byId('dialogCancel')
          ? byId('dialogConfirm')
          : byId('dialogCancel')
        ).focus();
        return;
      }
      return;
    }
    if (e.code === 'F2') {
      e.preventDefault();
      if (!e.repeat) s.menuState === 'lab' ? a.closeLab() : a.openLab();
      return;
    }
    if (e.code === 'Escape' && s.menuState === 'lab') {
      e.preventDefault();
      a.closeLab();
      return;
    }

    if (e.code === 'Escape') {
      e.preventDefault();
      if (!byId('scoreboard').hidden) {
        a.closeScores();
        return;
      }
      if (['map', 'orders'].includes(s.menuState)) {
        a.resume();
        return;
      }
      if (s.menuState === 'deployment') {
        a.pause();
        return;
      }
      if (s.menuState === 'play') a.pause();
      else if (s.started && !s.ended) a.resume();
      else a.show('home');
      return;
    }
    if (e.code === 'Tab' && (!s.acceptsInput || !byId('scoreboard').hidden)) {
      const panel = !byId('scoreboard').hidden
          ? byId('scoreboard')
          : !byId('tactical').hidden
            ? byId('tactical')
            : byId('overlay'),
        els = [
          ...panel.querySelectorAll<HTMLElement>(
            'button:not(:disabled):not([tabindex="-1"]),input:not(:disabled),select:not(:disabled),summary,[tabindex="0"]:not(:disabled)',
          ),
        ].filter(
          (el) =>
            !el.closest('[hidden],[inert]') &&
            (!el.closest('details:not([open])') || el.tagName === 'SUMMARY'),
        );
      if (els.length) {
        const index = els.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        els[(index + (e.shiftKey ? -1 : 1) + els.length) % els.length].focus();
      }
      return;
    }
    if (!byId('scoreboard').hidden) return;
    if (s.menuState === 'orders' && /^Digit[123]$/.test(e.code)) {
      e.preventDefault();
      if (!e.repeat)
        a.order(
          ['follow', 'objective', 'hold'][Number(e.code.slice(-1)) - 1] as
            | 'follow'
            | 'objective'
            | 'hold',
        );
      return;
    }
    if (
      !s.acceptsInput ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLSelectElement
    )
      return;
    const handled = [
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
      'KeyC',
      'ShiftLeft',
      'ShiftRight',
      'Space',
      'KeyR',
      'KeyG',
      'KeyE',
      'KeyQ',
      'KeyM',
      'KeyP',
      'Digit1',
      'Digit2',
      'Digit3',
      'Digit4',
      'KeyX',
      'KeyH',
      'KeyB',
      'KeyV',
      'KeyF',
      'KeyZ',
      'KeyT',
      'Tab',
    ];
    if (handled.includes(e.code)) e.preventDefault();
    s.input.keys.add(e.code);
    if (e.repeat) return;
    switch (e.code) {
      case 'Space':
        s.input.jump = true;
        break;
      case 'KeyR':
        s.reload();
        break;
      case 'KeyG':
        s.throwGrenade();
        break;
      case 'KeyE':
        s.useVehicle();
        break;
      case 'KeyQ':
        s.cycleWeapon();
        break;
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
        s.selectWeaponSlot(Number(e.code.slice(-1)) - 1);
        break;
      case 'Digit4':
        s.throwSmoke();
        break;
      case 'KeyX':
        s.cycleZoom();
        break;
      case 'KeyM':
      case 'KeyT':
        a.openTactical('map');
        break;
      case 'KeyB':
        a.openTactical('orders');
        break;
      case 'KeyP':
        a.pause();
        break;
      case 'KeyH':
        s.heal();
        break;
      case 'KeyF':
        s.classAbility();
        break;
      case 'KeyZ':
        s.ping();
        break;
      case 'KeyV':
        s.fortify();
        break;
      case 'Tab':
        a.showScores();
        break;
    }
  }
  requestLook() {
    const s = this.app.sim;
    if (s.touch || document.pointerLockElement === this.canvas || !this.canvas.requestPointerLock)
      return;
    try {
      const result = this.canvas.requestPointerLock();
      if (result) void result.catch(() => {});
    } catch {}
  }
  releaseLook() {
    try {
      if (document.pointerLockElement) document.exitPointerLock();
    } catch {}
  }
  reset() {
    this.app.sim.clearInput();
    this.dragLook = false;
    this.movePointer = this.lookPointer = null;
    this.touchHeld.clear();
    byId('stick').style.transform = '';
  }
  dispose() {
    this.abort.abort();
    this.reset();
    this.releaseLook();
  }
}
