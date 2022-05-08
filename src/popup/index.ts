import {generateToken, generateTotpUri} from 'authenticator';

async function saveSecret(name: string, secret: string) {
  let names = await chrome.storage.local.get("names");
  //ako nisu bila postavljena imena
  if (!names || !names.names) names = { names: [] };
  if (!names.names.includes(name)) {
    names.names.push(name);
    //ova nebulzoa je jer mi onda nastavi redati names.names.names.....
    await chrome.storage.local.set({ names: names.names });
  }
  await chrome.storage.local.set({ [name]: secret });
  return true;
}

async function removeSecret(name: string) {
  //prvo je ukloni iz names niza
  let namesObject = await chrome.storage.local.get("names");
  //sad vec postaje smijesno dokle ide name name name
  if (namesObject && namesObject.names && namesObject.names.includes(name)) {
    let names: string[] = namesObject.names;
    names.splice(names.indexOf(name), 1);
    await chrome.storage.local.remove(name);
    await chrome.storage.local.set({ names });
  }
}

async function getAllSecrets() {
  let results = new Map<string, string>();
  let names = await chrome.storage.local.get("names");
  if (names && names.names) {
    for (let name of names.names) {
      let secret = await chrome.storage.local.get(name as string);
      results.set(name, secret[name]);
    }
  } else console.log("No saved secrets");
  return results;
}

async function refreshCodes() {
  let secrets = await getAllSecrets();
  let codesList = document.getElementById("codes");
  let children: Node[] = [];
  for (let [name, secret] of secrets.entries()) {
    children.push(createPrettyCodeChild(name, secret));
  }
  codesList?.replaceChildren(...children);
}

function createPrettyCodeChild(name: string, secret: string) {
  let li = document.createElement("li");
  let wrapper = document.createElement("div");
  let deleteButton = document.createElement("button");
  let text = document.createElement("p");
  console.log(`Za ${name} secret je ${secret}`)
  let key = generateToken(secret);
  wrapper.className = "code-wrapper";
  text.className = "code-text";
  deleteButton.className = "code-delete";
  deleteButton.onclick = () => removeSecret(name);
  deleteButton.innerText = "Delete";
  text.innerText = `${name} => ${key}`;
  wrapper.append(text, deleteButton);
  li.appendChild(wrapper);
  return li;
}

function btnAddClicked() {
  let secret = document.getElementById("secret-input") as HTMLInputElement;
  let name = document.getElementById("name-input") as HTMLInputElement;
  saveSecret(name.value, secret.value).then((r) => r && alert("success"));
}

document.addEventListener("DOMContentLoaded", async () => {
  let addButton = document.getElementById("add-button");
  addButton?.addEventListener("click", btnAddClicked);
  await refreshCodes();
});
setInterval(refreshCodes, 1000);
