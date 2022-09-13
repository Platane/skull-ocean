(function () {
  var script = document.createElement("script");
  script.onload = function () {
    var stats = new (window as any)[dontmangle("Stats")]();
    document.body.appendChild(stats[dontmangle("dom")]);
    requestAnimationFrame(function loop() {
      stats.update();
      requestAnimationFrame(loop);
    });
  };
  script.src = "//mrdoob.github.io/stats.js/build/stats.min.js";
  document.head.appendChild(script);
})();

const dontmangle = (x: string) => x.replace("xxx", Math.random() + "");
