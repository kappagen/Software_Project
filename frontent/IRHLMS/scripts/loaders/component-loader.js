export class ComponentLoader {
  static async load(componentName, targetId) {
    const res = await fetch(`components/${componentName}/${componentName}.html`);
    if (!res.ok) throw new Error(`Component not found: ${componentName}`);
    const html = await res.text();
    const target = document.getElementById(targetId);
    if (target) target.innerHTML = html;
  }
  static async loadAll(components) {
    await Promise.all(components.map(({ name, target }) => this.load(name, target).catch(console.warn)));
  }
}