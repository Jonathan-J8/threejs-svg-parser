export const beforeUpdate = (cb: () => void) => {
    import.meta?.hot?.on("vite:beforeUpdate", cb);
};
export const beforeFullReload = (cb: () => void) => {
    import.meta?.hot?.on("vite:beforeFullReload", cb);
};
