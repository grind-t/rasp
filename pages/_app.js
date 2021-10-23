import { SWRConfig } from "swr";

const api = "https://rasp.msfu.ru/api/";

const swrOptions = {
  fetcher: (resource, init) =>
    fetch(`${api}${resource}`, init).then((res) => res.json()),
};

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={swrOptions}>
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
