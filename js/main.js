(() => {
  "use strict";


/* Images des œuvres : une URL de secours si la miniature Wikimedia échoue.
   Une fois les reproductions téléchargées dans images/peintures, les pages
   utilisent les fichiers locaux et ne dépendent plus du réseau. */
document.querySelectorAll('img[data-art-file]').forEach((img) => {
  let triedOriginal = false;
  const handleArtworkError = () => {
    if (!triedOriginal && img.dataset.fallbackSrc && !img.src.includes('/images/peintures/')) {
      triedOriginal = true;
      img.src = img.dataset.fallbackSrc;
      return;
    }
    const holder = img.parentElement;
    if (!holder) return;
    const note = document.createElement('span');
    note.className = 'image-placeholder';
    note.setAttribute('role', 'status');
    note.textContent = 'Reproduction indisponible. Consultez la fiche source de l’œuvre.';
    img.remove();
    holder.append(note);
  };
  img.addEventListener('error', handleArtworkError);
  // Image may have failed before the defer script installed its listener.
  if (img.complete && img.naturalWidth === 0) handleArtworkError();
});

/* Menu mobile : accessible au clavier et aux lecteurs d'écran. */
document.documentElement.classList.add("has-js");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.getElementById("navigation");

function setMenu(open) {
  if (!menuButton || !navigation) return;
  navigation.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuButton.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
      setMenu(false);
    }
  });
}

/*
  Simulation d'inscription : validation uniquement côté navigateur.
  Aucun fetch, aucun stockage local, aucun cookie, aucune requête d'envoi.
*/
const form = document.getElementById("inscription-form");

if (form) {
  const fields = [
    { id: "prenom", label: "prénom" },
    { id: "nom", label: "nom" },
    { id: "email", label: "adresse e-mail" }
  ];
  const message = document.getElementById("message-formulaire");

  function getError(input, label) {
    const value = input.value.trim();
    if (!value) return `Veuillez saisir votre ${label}.`;
    if (input.id !== "email" && value.length < 2) {
      return `Votre ${label} doit contenir au moins deux caractères.`;
    }
    if (input.id === "email" && (input.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))) {
      return "Veuillez saisir une adresse e-mail valide (exemple@domaine.fr).";
    }
    return "";
  }

  function validateField(item) {
    const input = document.getElementById(item.id);
    const error = document.getElementById(`erreur-${item.id}`);
    const text = getError(input, item.label);
    error.textContent = text;
    input.setAttribute("aria-invalid", String(Boolean(text)));
    return !text;
  }

  fields.forEach((item) => {
    document.getElementById(item.id).addEventListener("input", () => {
      validateField(item);
      message.textContent = "";
      message.classList.remove("is-error");
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Important : pas d'envoi de données sur GitHub Pages.
    const valid = fields.map(validateField).every(Boolean);
    message.classList.toggle("is-error", !valid);

    if (valid) {
      message.textContent = "Les champs sont valides. Cette démonstration ne transmet ni n'enregistre vos données.";
    } else {
      message.textContent = "Merci de corriger les champs signalés avant de continuer.";
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
    }
  });
}

})();
