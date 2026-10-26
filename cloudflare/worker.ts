export default {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (/^\/atlas\/audio\/(uk|us)\//.test(path)) {
      return env.WORD_AUDIO.fetch(request);
    }
    if (/^\/atlas\/audio\/(ex|ex2)\//.test(path)) {
      return env.EXAMPLE_AUDIO.fetch(request);
    }
    if (path.startsWith("/atlas/audio/")) {
      return new Response("Not found", { status: 404 });
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
