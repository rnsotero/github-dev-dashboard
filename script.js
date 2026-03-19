const button = document.getElementById("searchBtn");
const input = document.getElementById("username");

button.addEventListener("click", buscarPerfil);

input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    buscarPerfil();
  }
});

async function buscarPerfil() {
  const username = input.value;

  if (username === "") {
    alert("Digite um usuário do GitHub");
    return;
  }

  const loading = document.getElementById("loading");
  const profileCard = document.getElementById("profileCard");
  const reposContainer = document.getElementById("repos");

  // 🔒 Reset
  profileCard.style.display = "none";
  reposContainer.innerHTML = "";

  // 🔄 Skeleton UI
  loading.innerHTML = `
    <div class="card">
      <div class="skeleton skeleton-avatar"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
    </div>
  `;

  try {
    const userResponse = await fetch(`https://api.github.com/users/${username}`);

    if (!userResponse.ok) {
      throw new Error("Usuário não encontrado");
    }

    const userData = await userResponse.json();

    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
    const reposData = await reposResponse.json();

    loading.innerHTML = "";

    localStorage.setItem("lastUser", username);

    mostrarPerfil(userData);
    profileCard.style.display = "block";

    mostrarRepos(reposData);
    mostrarGrafico(reposData);

  } catch (error) {
    loading.innerHTML = `
      <div class="error">
        ❌ ${error.message}
      </div>
    `;
    profileCard.style.display = "none";
  }
}

// 👤 Perfil
function mostrarPerfil(data) {
  document.getElementById("profileCard").innerHTML = `
    <div class="profile">
      <img src="${data.avatar_url}" class="avatar">
      <h2>${data.name || data.login}</h2>
      <p>${data.bio || "Sem bio disponível"}</p>

      <div style="margin: 10px 0;">
        <strong>👥 ${data.followers}</strong> seguidores •
        <strong>📦 ${data.public_repos}</strong> repos
      </div>

      <p>📍 ${data.location || "Não informado"}</p>

      <a href="${data.html_url}" target="_blank">
        🔗 Ver perfil
      </a>
    </div>
  `;
}

// 📁 Top repositórios
function mostrarRepos(repos) {
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  let reposHTML = "";

  topRepos.forEach(repo => {
    reposHTML += `
      <div class="repo card">
        <h3>${repo.name}</h3>
        <p>⭐ ${repo.stargazers_count}</p>
        <a href="${repo.html_url}" target="_blank">Abrir projeto</a>
      </div>
    `;
  });

  document.getElementById("repos").innerHTML = reposHTML;
}

// 📊 Gráfico de linguagens
function mostrarGrafico(repos) {
  const linguagens = {};

  repos.forEach(repo => {
    if (repo.language) {
      linguagens[repo.language] = (linguagens[repo.language] || 0) + 1;
    }
  });

  const labels = Object.keys(linguagens);
  const data = Object.values(linguagens);

  const ctx = document.getElementById("languageChart");

  // 🔥 Evita bug de múltiplos gráficos
  if (window.chart) {
    window.chart.destroy();
  }

  window.chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#ffce56",
          "#4caf50",
          "#9966ff"
        ]
      }]
    }
  });
}

// 💾 Carregar última busca ao abrir
window.onload = () => {
  const lastUser = localStorage.getItem("lastUser");
  if (lastUser) {
    input.value = lastUser;
  }
};