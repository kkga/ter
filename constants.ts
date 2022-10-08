// export const MOD_URL = new URL("https://deno.land/x/ter/");
export const INDEX_FILENAME = "index.md";
export const RE_HIDDEN_OR_UNDERSCORED = /^\.|^_|\/\.|\/\_/;

export const HMR_CLIENT = `((l) => {
  let w, i;
  function d(m) { console.info("[refresh] ", m); }
  function r() { l.reload(); }
  function s(f) {
    w && w.close();
    w = new WebSocket(\`\${l.origin.replace("http", "ws")}/refresh\`);
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
})(location)`;

export const INDEXLIST_TEMPLATE = `
<section>
  <h6><%= it.title %></h6>
  <ul class="indexList">
<% it.items.forEach((item) => { %>
    <li class="indexList-item<% if (item?.pinned) { %> indexList-item--pinned<% } %><% if (item?.isIndex) { %> indexList-item--dir<% } %>">
      <a href="<%= item?.url.pathname %>"><%= item?.title %></a><% if (item?.isIndex) { %>/ ..<% } %>
      <span></span>
<%   if (item?.datePublished) { %>
      <time datetime="<%= item?.datePublished %>"><%= item?.datePublished.toLocaleDateString(it?.locale?.date, it?.dateIndexOpts) %></time>
<%   } %>
    </li>
<% }) %>
  </ul>
</section>
`;

export const getHelp = (mod_url: string) =>
  `ter
Tiny wiki-style site builder.

USAGE:
  deno run ${mod_url} [options]

OPTIONS:
  --input\t\tSource directory (default: .)
  --output\t\tOutput directory (default: _site)
  --config\t\tPath to config file (default: .ter/config.json)
  --local\t\tUse local assets (default: false)
  --serve\t\tServe locally and watch for changes (default: false)
  --port\t\tServe port (default: 8000)
  --drafts\t\tRender pages marked as drafts (default: false)
  --quiet\t\tSuppress output (default: false)`;
