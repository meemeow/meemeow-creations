const PLAYED_KEY = "home-intro-played";
let playedThisLoad = false;

export const introPlayed = () => {
  if (playedThisLoad) return true;
  try {
    return sessionStorage.getItem(PLAYED_KEY) === "1";
  } catch {
    return false;
  }
};

export const forgetIntroPlayed = () => {
  playedThisLoad = false;
  try {
    sessionStorage.removeItem(PLAYED_KEY);
  } catch {}
};

export const markIntroPlayed = () => {
  playedThisLoad = true;
  try {
    sessionStorage.setItem(PLAYED_KEY, "1");
  } catch {}
};
