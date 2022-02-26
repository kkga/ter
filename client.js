((l) => {
  let w, i;

  function d(m) {
    console.info("[refresh] ", m);
  }

  function r() {
    l.reload();
  }

  function s(f) {
    w && w.close();
    w = new WebSocket(`${l.origin.replace("http", "ws")}/_r`);
    w.addEventListener("open", f);
    w.addEventListener("message", () => {
      d("reloading...");
      r();
    });
    w.addEventListener("close", () => {
      d("connection lost - reconnecting...");
      clearTimeout(i);
      i = setTimeout(() => s(r), 1000);
    });
  }

  s();
})(location);
