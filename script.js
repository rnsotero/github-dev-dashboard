const button = document.getElementById("searchBtn");
const input = document.getElementById("username");

button.addEventListener("click", buscarPerfil);

input.addEventListener("keypress", function(e){
if(e.key === "Enter"){
buscarPerfil();
}
});

async function buscarPerfil(){

const username = input.value;

if(username === ""){
alert("Digite um usuário do GitHub");
return;
}

document.getElementById("loading").innerHTML = "Carregando...";

try{

const userResponse = await fetch(`https://api.github.com/users/${username}`);
const userData = await userResponse.json();

if(userData.message === "Not Found"){
document.getElementById("loading").innerHTML = "Usuário não encontrado";
return;
}

const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
const reposData = await reposResponse.json();

document.getElementById("loading").innerHTML = "";

mostrarPerfil(userData);
mostrarRepos(reposData);
mostrarGrafico(reposData);

}catch(error){

document.getElementById("loading").innerHTML = "Erro ao buscar dados";

}

}

function mostrarPerfil(data){

document.getElementById("profileCard").innerHTML = `
<div class="profile">

<img src="${data.avatar_url}">

<h2>${data.name}</h2>

<p>${data.bio || "Sem bio"}</p>

<p>Seguidores: ${data.followers}</p>

<p>Repositórios: ${data.public_repos}</p>

<a href="${data.html_url}" target="_blank">Ver perfil</a>

</div>
`;

}

function mostrarRepos(repos){

const topRepos = repos
.sort((a,b)=> b.stargazers_count - a.stargazers_count)
.slice(0,5);

let reposHTML = "";

topRepos.forEach(repo =>{

reposHTML += `
<div class="repo">

<strong>${repo.name}</strong>

<p>⭐ ${repo.stargazers_count}</p>

<a href="${repo.html_url}" target="_blank">Abrir projeto</a>

</div>
`;

});

document.getElementById("repos").innerHTML = reposHTML;

}

function mostrarGrafico(repos){

const linguagens = {};

repos.forEach(repo =>{

if(repo.language){

if(!linguagens[repo.language]){
linguagens[repo.language] = 1;
}else{
linguagens[repo.language]++;
}

}

});

const labels = Object.keys(linguagens);
const data = Object.values(linguagens);

const ctx = document.getElementById("languageChart");

new Chart(ctx,{
type:"doughnut",
data:{
labels:labels,
datasets:[{
data:data
}]
}
});

}