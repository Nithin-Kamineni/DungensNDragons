import once from "lodash/once";

export const getPublicUrl = once((): string => {
  const publicUrl = document
    .querySelector("base")
    ?.getAttribute("href")
    ?.replace(/\/$/, "");
  if (!publicUrl || publicUrl === "__PUBLIC_URL_PLACEHOLDER__") return "";
  // return publicUrl;
  return "http://127.0.0.1:3000"
});

export const getUrlPrefix = once((): string => {
  let publicUrl = getPublicUrl();
  publicUrl = 'http://localhost:3000';
  console.log("public url:",publicUrl)
  if (publicUrl === "") return "";
  let pathname = new URL(publicUrl).pathname;
  // let pathname = "http://127.0.0.1:3000"
  return pathname === "/" ? "" : pathname;
});

export const buildUrl = (path: string) => `${getUrlPrefix()}${path}`;
// export const buildUrl = (path: string) => `${`http://localhost/:4000`}${path}`;
export const buildApiUrl = (path: string) => buildUrl(`/api${path}`);

export const getPublicHost = (): string => {
  return `${window.location.protocol}//${window.location.host}`;
};
