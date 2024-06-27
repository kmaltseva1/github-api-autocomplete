const searchInput = document.querySelector(".search-input");
const wrapper = document.querySelector(".wrapper");
const chosenRepos = document.querySelector(".chosen-repos");

const URL = "https://api.github.com/search/repositories?q=Q";

const loading = document.createElement("h1");
loading.textContent = "Loading";

const getRepos = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (error) {
    throw new Error(error);
  }
};

const debounce = (fn, debounceTime) => {
  let time;
  return function (...args) {
    clearTimeout(time);
    time = setTimeout(() => {
      fn.apply(this, args);
    }, debounceTime);
  };
};

const clearInput = () => {
  searchInput.value = "";
};

const createDefaultCard = (data) => {
  const card = document.createElement("div");
  card.className = "repos-name";
  card.textContent = data.name;
  return card;
};

const chooseRepo = (data) => {
  const fragment = document.createDocumentFragment();
  const card = document.createElement("div");
  card.className = "repos-name chosen";
  card.textContent = "";
  const infoEl = document.createElement("div");
  const infoName = document.createElement("div");
  const infoOwner = document.createElement("div");
  const infoStars = document.createElement("div");
  infoEl.className = "info";
  infoName.className = "info__name";
  infoOwner.className = "info__owner";
  infoStars.className = "info__stars";

  infoName.textContent = `Name: ${data.name}`;
  infoOwner.textContent = `Owner: ${data.owner.login}`;
  infoStars.textContent = `Stars: ${data.stargazers_count}`;

  const closeEl = document.createElement("div");
  closeEl.className = "cross";

  infoEl.append(infoName, infoOwner, infoStars);
  card.append(infoEl, closeEl);
  fragment.append(card);
  chosenRepos.append(fragment);
  clearInput();
  wrapper.replaceChildren();
};

async function onChange() {
  if (!searchInput.value.trim()) {
    wrapper.replaceChildren();
    return;
  }
  wrapper.replaceChildren();
  const userValue = searchInput.value.toLowerCase().trim();

  wrapper.append(loading);
  const response = await getRepos(URL.replace("Q", userValue));

  if (!response.items) {
    wrapper.textContent = response.message.slice(0, 21);
    return;
  }
  const { items: repositories } = response;
  wrapper.replaceChildren();
  const fragment = document.createDocumentFragment();

  const filteredArr = repositories
    .filter((i) => i.name.toLowerCase().startsWith(userValue))
    .splice(0, 5);
  if (!filteredArr) return;

  filteredArr.map((repos) => {
    const card = createDefaultCard(repos);
    card.addEventListener("click", (e) => chooseRepo(repos));
    fragment.append(card);
  });
  loading.remove();
  wrapper.append(fragment);
  if (!wrapper.childNodes.length) wrapper.textContent = "No repos was found";
}

chosenRepos.addEventListener("click", (e) => {
  const { target } = e;
  const element = target.closest(".cross");
  if (!element) return;
  element.parentNode.remove();
});

onChange = debounce(onChange, 400);
searchInput.addEventListener("keyup", onChange);
