document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // Lead form AJAX submit
  const form = document.querySelector('.lead-form');
  if (form) {
    const statusEl = form.querySelector('.form-status');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      const data = Object.fromEntries(new FormData(form).entries());

      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.ok) {
          statusEl.textContent = "Thanks — we got your request and will call you back shortly.";
          statusEl.classList.add('ok');
          form.reset();
        } else {
          statusEl.textContent = json.error || 'Something went wrong. Please call us directly.';
          statusEl.classList.add('err');
        }
      } catch (err) {
        statusEl.textContent = 'Something went wrong. Please call us directly.';
        statusEl.classList.add('err');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }
});
