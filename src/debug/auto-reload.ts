const wait = (delay = 0) => new Promise((r) => setTimeout(r, delay));

const getCompilationHash = () => fetch("bundle.js").then((res) => res.text());

if (process.env.NODE_ENV !== "production")
  (async () => {
    const hash = await getCompilationHash();

    while (true) {
      await wait(1000);

      await getCompilationHash()
        .then((h) => {
          if (h !== hash) window.location.reload();
        })
        .catch((err) => {
          // silence
        });
    }
  })();
