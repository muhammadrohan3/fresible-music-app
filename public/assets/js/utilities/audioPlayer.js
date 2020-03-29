import View from "../View";
export default () => {
  const playing = playerContainer =>
    View.addClass(playerContainer, "player--playing");
  const stopped = playerContainer =>
    View.removeClass(playerContainer, "player--playing");

  const handle = playerContainer => {
    const { playerno } = playerContainer.dataset;
    const audio = View.getElement(`#player-track-${playerno}`);
    if (audio.paused) {
      audio.play();
      return playing(playerContainer);
    }
    audio.pause();
    return stopped(playerContainer);
  };

  const ended = playerContainer => {
    return stopped(playerContainer);
  };
  return { handle, ended };
};
