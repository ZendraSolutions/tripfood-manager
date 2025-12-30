/**
 * CSS Module type declarations for TypeScript
 * This file allows TypeScript to understand CSS module imports
 */

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
