export class MapViewport {
  constructor(svg, content) {
    this.svg = svg;
    this.content = content;
    this.scale = 1;
    this.pan = { x: 0, y: 0 };
    this.pointers = new Map();
    this.dragStart = null;
    this.dragged = false;
    this.ignoreClickUntil = 0;
    this.center = { x: 15, y: 13.5 };
    this.bind();
    this.render();
  }

  bind() {
    this.svg.addEventListener("wheel", (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.14 : 0.88;
      this.zoom(factor, event.clientX, event.clientY);
    }, { passive: false });

    this.svg.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      const interactive = Boolean(event.target.closest?.(".province, .map-label"));
      // Capturing immediately retargets a click from an SVG path/label to the parent SVG in Chromium.
      // Keep ordinary taps on controls untouched; acquire capture only once the gesture becomes a drag.
      if (!interactive) this.svg.setPointerCapture?.(event.pointerId);
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, interactive });
      if (this.pointers.size === 1) {
        this.dragStart = { x: event.clientX, y: event.clientY, panX: this.pan.x, panY: this.pan.y };
        this.dragged = false;
      } else if (this.pointers.size === 2) {
        this.pinchStart = this.pinchMetrics();
      }
    });

    this.svg.addEventListener("pointermove", (event) => {
      if (!this.pointers.has(event.pointerId)) return;
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.pointers.size >= 2 && this.pinchStart) {
        const pinch = this.pinchMetrics();
        this.scale = this.clamp(this.pinchStart.scale * (pinch.distance / this.pinchStart.distance), 1, 3);
        this.pan.x = this.pinchStart.panX + (pinch.midX - this.pinchStart.midX) * this.unitsPerPixel().x;
        this.pan.y = this.pinchStart.panY + (pinch.midY - this.pinchStart.midY) * this.unitsPerPixel().y;
        this.dragged = true;
        this.render();
      } else if (this.dragStart) {
        const dx = event.clientX - this.dragStart.x;
        const dy = event.clientY - this.dragStart.y;
        if (Math.hypot(dx, dy) > 5) this.dragged = true;
        if (this.dragged) {
          this.svg.setPointerCapture?.(event.pointerId);
          const units = this.unitsPerPixel();
          this.pan.x = this.dragStart.panX + dx * units.x;
          this.pan.y = this.dragStart.panY + dy * units.y;
          this.render();
        }
      }
    });

    const end = (event) => {
      if (!this.pointers.has(event.pointerId)) return;
      this.pointers.delete(event.pointerId);
      if (this.dragged) this.ignoreClickUntil = Date.now() + 180;
      if (this.pointers.size < 2) this.pinchStart = null;
      if (this.pointers.size === 0) this.dragStart = null;
    };
    this.svg.addEventListener("pointerup", end);
    this.svg.addEventListener("pointercancel", end);

    this.svg.addEventListener("dblclick", (event) => {
      event.preventDefault();
      this.zoom(1.7, event.clientX, event.clientY);
    });
  }

  pinchMetrics() {
    const [a, b] = [...this.pointers.values()];
    return {
      distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2,
      scale: this.scale,
      panX: this.pan.x,
      panY: this.pan.y
    };
  }

  unitsPerPixel() {
    const rect = this.svg.getBoundingClientRect();
    return { x: 30 / Math.max(rect.width, 1), y: 26 / Math.max(rect.height, 1) };
  }

  zoom(factor, clientX, clientY) {
    const previous = this.scale;
    const next = this.clamp(previous * factor, 1, 3);
    if (next === previous) return;
    const rect = this.svg.getBoundingClientRect();
    const anchorX = ((clientX - rect.left) / rect.width) * 30;
    const anchorY = 1 + ((clientY - rect.top) / rect.height) * 26;
    const ratio = 1 / previous - 1 / next;
    this.pan.x += (anchorX - this.center.x) * ratio * next;
    this.pan.y += (anchorY - this.center.y) * ratio * next;
    this.scale = next;
    this.render();
  }

  fit() {
    this.scale = 1;
    this.pan = { x: 0, y: 0 };
    this.render();
  }

  shouldIgnoreClick() { return Date.now() < this.ignoreClickUntil; }

  render() {
    const tx = this.center.x * (1 - this.scale) + this.pan.x;
    const ty = this.center.y * (1 - this.scale) + this.pan.y;
    this.content.setAttribute("transform", `translate(${tx} ${ty}) scale(${this.scale})`);
    this.svg.classList.toggle("is-zoomed", this.scale > 1.01);
  }

  clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
}
