const page = window.location.pathname.split("/").pop();

window.addEventListener("scroll", function () {
  let navbar = document.querySelector(".navbar");

  if (navbar && window.scrollY > 50) {
    navbar.classList.add("active");
  } else if (navbar) {
    navbar.classList.remove("active");
  }
});

if (page === "start.html") {
  window.login = function () {
    let email = document.getElementById("email").value.trim();
    let pass = document.getElementById("password").value.trim();

    if (!email || !pass) return alert("Enter details");

    let savedEmail = localStorage.getItem("userEmail");
    let savedPass = localStorage.getItem("userPassword");

    if (email === savedEmail && pass === savedPass) {
      localStorage.setItem("isLoggedIn", "true");
      location.href = "index.html";
    } else {
      alert("Wrong email or password");
    }
  };

  window.goToSignup = () => location.href = "signup.html";
}

if (page === "signup.html") {
  window.signup = function () {
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let pass = document.getElementById("password").value.trim();

    if (!name || !email || !pass) {
      alert("Fill all fields");
      return;
    }

    if (pass.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", pass);

    alert("Account created");
    location.href = "start.html";
  };

  window.goToLogin = () => location.href = "start.html";
}

function showFav() {
  let fav = JSON.parse(localStorage.getItem("fav")) || [];
  let box = document.getElementById("favMovies");

  if (!box) return;

  box.innerHTML = "";

  fav.forEach(m => {
    let card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <img src="${m.poster}" alt="${m.title}" onerror="this.parentElement.remove()">

      <button class="remove-btn" onclick="removeFav('${m.title}')">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    box.appendChild(card);
  });
}

function removeFav(title) {
  let fav = JSON.parse(localStorage.getItem("fav")) || [];
  fav = fav.filter(m => m.title !== title);

  localStorage.setItem("fav", JSON.stringify(fav));
  showFav();
}

if (page === "index.html") {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    location.href = "start.html";
  }

  window.logout = function () {
    localStorage.removeItem("isLoggedIn");
    location.href = "start.html";
  };

  const apiKey = "66448395";

  const trailers = {
    "The Avengers": "https://www.youtube.com/embed/eOrNdBpGMv8",
    "Avengers: Age of Ultron": "https://www.youtube.com/embed/tmeOjFno6Do",
    "Avengers: Infinity War": "https://www.youtube.com/embed/6ZfuNTqbHE8",
    "Avengers: Endgame": "https://www.youtube.com/embed/TcMBFSGVi1c",
    "The Batman": "https://www.youtube.com/embed/mqqft2x_Aa4",
    "Batman Begins": "https://www.youtube.com/embed/neY2xVmOfUM",
    "The Dark Knight": "https://www.youtube.com/embed/EXeTwQWrcwY",
    "Joker": "https://www.youtube.com/embed/zAGVQLHvwOY",
    "Fast & Furious": "https://www.youtube.com/embed/2TAOizOnNPo",
    "Fast Five": "https://www.youtube.com/embed/mw2AqdB5EVA",
    "Furious 7": "https://www.youtube.com/embed/Skpu5HaVkOc",
    "Spider-Man": "https://www.youtube.com/embed/t06RUxPbp_c"
  };

  function loadMovies(search, boxId) {
   fetch(`https://www.omdbapi.com/?s=${search}&apikey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        let box = document.getElementById(boxId);
        if (!box) return;

        box.innerHTML = "";

        if (!data.Search) {
          box.innerHTML = "No movies found";
          return;
        }

        let fav = JSON.parse(localStorage.getItem("fav")) || [];

        data.Search
          .filter(m => m.Poster && m.Poster !== "N/A")
          .forEach(movie => {
            let isFav = fav.some(f => f.title === movie.Title);
            let trailer = trailers[movie.Title] || "https://www.youtube.com/embed/eOrNdBpGMv8";

            let card = document.createElement("div");
            card.className = "movie-card";

            card.innerHTML = `
              <img src="${movie.Poster}" alt="${movie.Title}" onclick="showDetails('${movie.imdbID}')" onerror="this.parentElement.remove()">

              <button class="card-play" onclick="playVideo('${trailer}')">
                <i class="fa-solid fa-play"></i>
              </button>

              <button class="fav-btn"
                onclick="toggleFav('${movie.Title}','${movie.Poster}', this)"
                style="color:${isFav ? 'red' : 'white'}">
                <i class="fa-solid fa-heart"></i>
              </button>
            `;

            box.appendChild(card);
          });
      })
      .catch(() => {
        let box = document.getElementById(boxId);
        if (box) box.innerHTML = "Error loading movies";
      });
  }

  loadMovies("avengers", "movies");
  loadMovies("batman", "popularMovies");
  loadMovies("fast", "actionMovies");
  loadMovies("comedy", "comedyMovies");
  loadMovies("series", "tvShows");

  let searchBox = document.querySelector(".search-box");

  if (searchBox) {
    searchBox.addEventListener("input", function () {
      let val = searchBox.value.trim();

      if (val.length >= 3) {
        document.getElementById("searchPopup").style.display = "flex";
        loadMovies(val, "searchResults");
      }

      if (val.length === 0) {
        document.getElementById("searchPopup").style.display = "none";
        loadMovies("avengers", "movies");
      }
    });
  }

  window.closeSearch = function () {
    document.getElementById("searchPopup").style.display = "none";
    searchBox.value = "";
  };

  window.showDetails = function (id) {
    fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("detailsPopup").style.display = "flex";

        document.getElementById("detailsContent").innerHTML = `
          <img src="${data.Poster}" alt="${data.Title}">

          <div class="details-text">
            <h2>${data.Title}</h2>
            <p><b>Year:</b> ${data.Year}</p>
            <p><b>Genre:</b> ${data.Genre}</p>
            <p><b>IMDB Rating:</b> ${data.imdbRating}</p>
            <p><b>Runtime:</b> ${data.Runtime}</p>
            <p><b>Actors:</b> ${data.Actors}</p>
            <p><b>Director:</b> ${data.Director}</p>
            <p><b>Plot:</b> ${data.Plot}</p>
          </div>
        `;
      });
  };

  window.closeDetails = function () {
    document.getElementById("detailsPopup").style.display = "none";
  };

  window.playVideo = function (link) {
    document.getElementById("videoPopup").style.display = "flex";
    document.getElementById("videoFrame").src = link;
  };

  window.closeVideo = function () {
    document.getElementById("videoPopup").style.display = "none";
    document.getElementById("videoFrame").src = "";
  };

  window.toggleFav = function (title, poster, btn) {
    let fav = JSON.parse(localStorage.getItem("fav")) || [];
    let index = fav.findIndex(m => m.title === title);

    if (index !== -1) {
      fav.splice(index, 1);
      btn.style.color = "white";
    } else {
      fav.push({ title, poster });
      btn.style.color = "red";
    }

    localStorage.setItem("fav", JSON.stringify(fav));
    showFav();
  };

  showFav();
}

if (page === "mylist.html") {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    location.href = "start.html";
  }

  showFav();
}