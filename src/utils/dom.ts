export function qs<T extends Element = Element>(sel: string, root: ParentNode = document): T | null {
    return root.querySelector<T>(sel);
}
