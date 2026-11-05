// Bucket Brothers Excavation: menu and estimate form

// Paste the URL of your form backend (Formspree, Basin, a Cloudflare Worker, etc.)
// to start receiving estimate requests. Until then the form asks people to call.
const FORM_ENDPOINT = '';

const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});

function closeSubs(except) {
  document.querySelectorAll('.has-sub.open').forEach((item) => {
    if (item === except) return;
    item.classList.remove('open');
    item.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false');
  });
}

document.querySelectorAll('.sub-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.has-sub');
    const open = btn.getAttribute('aria-expanded') !== 'true';
    closeSubs(item);
    btn.setAttribute('aria-expanded', String(open));
    item.classList.toggle('open', open);
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.has-sub')) closeSubs();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeSubs();
  if (nav.classList.contains('open')) {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.focus();
  }
});

document.querySelectorAll('form.form').forEach((form) => {
  const status = form.querySelector('.form__status');
  const button = form.querySelector('[type="submit"]');
  const phone = form.dataset.phone;
  const say = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements.company_website.value) return; // filled in by bots only

    if (!FORM_ENDPOINT) {
      say(`Online requests aren't switched on yet. Please call ${phone} and we'll set up your estimate.`, 'error');
      return;
    }

    button.disabled = true;
    say('Sending…', 'busy');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      say('Thanks. We got your request and will call you to set up a site visit.', 'ok');
    } catch {
      say(`Something went wrong sending the form. Please call ${phone}.`, 'error');
    } finally {
      button.disabled = false;
    }
  });
});
