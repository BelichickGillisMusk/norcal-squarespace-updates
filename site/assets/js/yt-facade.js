/**
 * Click-to-load YouTube. The iframe is created only after a play click.
 */
(function () {
  function load(button) {
    var id = button.getAttribute("data-yt");
    if (!id || !/^[A-Za-z0-9_-]{6,}$/.test(id)) return;
    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
    frame.title = button.getAttribute("data-title") || "YouTube video";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.setAttribute("allowfullscreen", "");
    var holder = button.parentElement;
    if (!holder) return;
    holder.replaceChildren(frame);
  }

  document.querySelectorAll(".yt-facade[data-yt]").forEach(function (button) {
    button.addEventListener("click", function () {
      load(button);
    });
  });
})();
