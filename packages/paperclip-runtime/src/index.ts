

export type LoadOptions = {
  origin?: string;
};

export const load = (urlOrContent, options: LoadOptions = {}) => {
  if (/^https?\:\/\//.test(urlOrContent)) {
    return loadURL(urlOrContent, options);
  } else {
    return loadContent(urlOrContent, options);
  }
}

const loadURL = async (url: string, options: LoadOptions) => loadContent(await (await fetch(url)).text(), options);

const loadContent = (content: string, options: LoadOptions) => {

};
