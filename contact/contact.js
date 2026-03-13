const SUPABASE_URL = 'https://zgacsvbvlkquflbbduey.supabase.co';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_Cgvx4_0yhbmc2e3gp0BDBw_1WSE8gZ4';

const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('contactSubmitBtn');
const formStatus = document.getElementById('formStatus');

function setStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = 'form-status';

  if (type) {
    formStatus.classList.add(`status-${type}`);
  }
}

function validateForm(data) {
  const fullName = (data.get('full_name') || '').toString().trim();
  const email = (data.get('email') || '').toString().trim();
  const message = (data.get('message') || '').toString().trim();
  const website = (data.get('website') || '').toString().trim();

  if (!fullName || !email || !message) {
    return 'Please complete all required fields.';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return 'Please enter a valid email address.';
  }

  if (message.length < 10) {
    return 'Please provide a bit more detail in your message.';
  }

  if (website) {
    return 'Spam check triggered.';
  }

  return null;
}

async function submitContactForm(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const validationError = validateForm(formData);

  if (validationError) {
    if (validationError === 'Spam check triggered.') {
      setStatus('Thank you. Your request has been received.', 'success');
      form.reset();
      return;
    }

    setStatus(validationError, 'error');
    return;
  }

  const payload = {
    full_name: formData.get('full_name')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim() || '',
    phone: formData.get('phone')?.toString().trim() || '',
    company_name: formData.get('company_name')?.toString().trim() || '',
    service_needed: formData.get('service_needed')?.toString().trim() || '',
    subject: formData.get('subject')?.toString().trim() || '',
    message: formData.get('message')?.toString().trim() || '',
    budget_range: formData.get('budget_range')?.toString().trim() || '',
    preferred_contact_method: formData.get('preferred_contact_method')?.toString().trim() || '',
    source_page: window.location.pathname,
    website: formData.get('website')?.toString().trim() || ''
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  setStatus('Sending your message...', 'loading');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_PUBLIC_KEY,
        'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.error || 'Something went wrong while sending your message.');
    }

    setStatus(
      result?.message || 'Thank you. Your message has been sent successfully.',
      'success'
    );

    form.reset();
  } catch (error) {
    setStatus(
      error.message || 'Sorry, we could not send your message right now. Please try again later.',
      'error'
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
}

if (form) {
  form.addEventListener('submit', submitContactForm);
}
