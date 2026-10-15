/* PRIMO portal: login + client/staff workspaces backed by Supabase.
 * Data layer: supabase/schema.sql (tables, row-level security, storage).
 * Connection settings: assets/portal-config.js
 */
(() => {
  'use strict';

  const cfg = window.PRIMO_PORTAL_CONFIG || {};
  const loginForm = document.querySelector('[data-portal-login]');
  const root = document.getElementById('primoWorkspace');
  if (!loginForm && !root) return;

  const base = (loginForm ? loginForm.dataset.base : root.dataset.base) || '../../';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = d => (d ? new Date(d.length === 10 ? d + 'T00:00:00' : d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
  const fmtDateTime = d => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
  const money = (n, cur) => { try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur || 'USD' }).format(Number(n) || 0); } catch { return (cur || '') + ' ' + n; } };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const configured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase && window.supabase.createClient);
  const sb = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;

  const notConfigured = target => {
    target.innerHTML = '<div class="portal-gate"><span class="portal-demo-pill">SETUP REQUIRED</span><h2>The portal is not connected yet.</h2><p>Add the Supabase project URL and public key to <code>assets/portal-config.js</code> and run <code>supabase/schema.sql</code>. Step-by-step instructions are in <code>PORTAL-SETUP.md</code>.</p></div>';
  };

  /* ====================================================== LOGIN PAGE */
  if (loginForm) {
    const status = loginForm.querySelector('#portalAuthStatus');
    const email = loginForm.querySelector('[name=email]');
    const password = loginForm.querySelector('[name=password]');
    const nameInput = loginForm.querySelector('[name=displayName]');
    const heading = loginForm.querySelector('#portalAuthHeading');
    const submit = loginForm.querySelector('#portalAuthSubmit');
    const pwField = password.closest('.portal-auth-field');
    const emailField = email.closest('.portal-auth-field');
    const nameField = loginForm.querySelector('[data-signup-field]');
    const forgot = loginForm.querySelector('[data-reset-password]');
    const tabs = loginForm.querySelector('.portal-auth-tabs');
    let mode = 'signin';

    const say = (msg, ok) => { status.textContent = msg || ''; status.dataset.ok = ok ? '1' : ''; };

    function setMode(next) {
      mode = next;
      const signup = mode === 'signup', reset = mode === 'reset', recovery = mode === 'recovery';
      nameField.hidden = !signup;
      nameInput.required = signup;
      emailField.hidden = recovery;
      email.required = !recovery;
      pwField.hidden = reset;
      password.required = !reset;
      password.autocomplete = signup || recovery ? 'new-password' : 'current-password';
      pwField.querySelector('.pa-label-text').textContent = recovery ? 'New password' : 'Password';
      tabs.hidden = recovery;
      forgot.hidden = recovery || reset || signup;
      heading.textContent = { signin: 'Welcome back.', signup: 'Create your account.', reset: 'Reset your password.', recovery: 'Choose a new password.' }[mode];
      submit.textContent = { signin: 'Sign in ↗', signup: 'Create account ↗', reset: 'Email me a reset link ↗', recovery: 'Save new password ↗' }[mode];
      tabs.querySelectorAll('[data-auth-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.authMode === mode)));
      say('');
    }

    tabs.querySelectorAll('[data-auth-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.authMode)));
    forgot.addEventListener('click', () => setMode('reset'));
    loginForm.querySelector('[data-password-toggle]').addEventListener('click', e => {
      const show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      e.currentTarget.textContent = show ? 'Hide' : 'Show';
      e.currentTarget.setAttribute('aria-pressed', String(show));
    });

    async function goToWorkspace() {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return;
      const { data: prof, error } = await sb.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      if (error || !prof) { say('Signed in, but your profile could not be loaded. Please try again in a moment.'); return; }
      location.href = base + 'portal/' + (prof.role === 'client' ? 'client' : 'staff') + '/';
    }

    if (!configured) {
      submit.disabled = true;
      say('The portal backend is not connected yet (see PORTAL-SETUP.md).');
    } else {
      sb.auth.onAuthStateChange(ev => { if (ev === 'PASSWORD_RECOVERY') setMode('recovery'); });
      if (!/type=recovery/.test(location.hash)) goToWorkspace();
      else setMode('recovery');

      loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        submit.disabled = true;
        say('Working…', true);
        try {
          if (mode === 'signin') {
            const { error } = await sb.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
            if (error) throw error;
            password.value = '';
            await goToWorkspace();
          } else if (mode === 'signup') {
            if (password.value.length < 8) throw new Error('Use a password of at least 8 characters.');
            const { data, error } = await sb.auth.signUp({
              email: email.value.trim(), password: password.value,
              options: { data: { full_name: nameInput.value.trim() }, emailRedirectTo: location.origin + '/portal/login/' }
            });
            if (error) throw error;
            password.value = '';
            if (data.session) await goToWorkspace();
            else say('Almost there. Check your inbox and click the confirmation link, then sign in.', true);
          } else if (mode === 'reset') {
            const { error } = await sb.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: location.origin + '/portal/login/' });
            if (error) throw error;
            say('If that email has an account, a reset link is on its way.', true);
          } else if (mode === 'recovery') {
            if (password.value.length < 8) throw new Error('Use a password of at least 8 characters.');
            const { error } = await sb.auth.updateUser({ password: password.value });
            if (error) throw error;
            password.value = '';
            history.replaceState(null, '', location.pathname);
            say('Password updated.', true);
            await sleep(600);
            await goToWorkspace();
          }
        } catch (err) {
          say(err.message || 'Something went wrong. Please try again.');
        } finally {
          submit.disabled = false;
        }
      });
    }
    return;
  }

  /* ================================================= WORKSPACE PAGES */
  const pageRole = root.dataset.role; // 'client' | 'staff' (page the visitor opened)
  if (!configured) { notConfigured(root); return; }

  const STATUSES = ['To do', 'In progress', 'Review', 'Done'];
  const PHASES = ['Discovery', 'Strategy', 'Design', 'Design review', 'Production', 'Review', 'Launch', 'Completed', 'On hold'];
  const INVOICE_STATUSES = ['Draft', 'Sent', 'Paid', 'Overdue'];
  const REQUEST_STATUSES = ['Open', 'In progress', 'Resolved'];

  const state = { me: null, clients: [], projects: [], tasks: [], approvals: [], files: [], invoices: [], requests: [], activity: [], profiles: [], invites: [], error: '' };
  let tab = 'overview';
  let tabs = [];
  let loaded = false;

  const isStaff = () => state.me && (state.me.role === 'staff' || state.me.role === 'admin');
  const isAdmin = () => state.me && state.me.role === 'admin';
  const byId = (list, id) => list.find(x => x.id === id);
  const projectName = id => (byId(state.projects, id) || {}).name || 'Project';
  const clientName = id => (byId(state.clients, id) || {}).name || '—';
  const personName = id => { const p = byId(state.profiles, id); return p ? (p.full_name || p.email) : 'Unassigned'; };

  /* ---------------------------------------------------------- toasts */
  let toastTimer;
  function toast(msg, bad) {
    let t = document.getElementById('paToast');
    if (!t) { t = document.createElement('div'); t.id = 'paToast'; t.className = 'pa-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.dataset.bad = bad ? '1' : ''; t.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 3500);
  }
  const fail = (err, what) => { console.error(err); toast((what ? what + ': ' : '') + (err && err.message ? err.message : 'Something went wrong'), true); };

  /* ------------------------------------------------------ data loading */
  async function loadAll() {
    const pull = (table, build) => (build ? build(sb.from(table).select('*')) : sb.from(table).select('*'));
    const queries = {
      clients: pull('clients', q => q.order('name')),
      projects: pull('projects', q => q.order('created_at', { ascending: false })),
      tasks: pull('tasks', q => q.order('created_at', { ascending: true })),
      approvals: pull('approvals', q => q.order('created_at', { ascending: false })),
      files: pull('files', q => q.order('created_at', { ascending: false })),
      invoices: pull('invoices', q => q.order('created_at', { ascending: false })),
      requests: pull('requests', q => q.order('created_at', { ascending: false })),
      activity: pull('activity', q => q.order('created_at', { ascending: false }).limit(30)),
      profiles: pull('profiles', q => q.order('created_at', { ascending: true })),
      invites: isStaff() ? pull('invites', q => q.order('created_at', { ascending: false })) : Promise.resolve({ data: [] })
    };
    const keys = Object.keys(queries);
    const results = await Promise.all(keys.map(k => queries[k]));
    state.error = '';
    keys.forEach((k, i) => {
      if (results[i].error) { state.error = results[i].error.message; console.error(k, results[i].error); }
      else state[k] = results[i].data || [];
    });
    loaded = true;
  }

  let reloadTimer;
  function scheduleReload() {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(async () => {
      if (document.querySelector('.pa-dialog[open]')) { scheduleReload(); return; }
      await loadAll(); render();
    }, 500);
  }
  const refresh = async () => { await loadAll(); render(); };

  async function logActivity(projectId, text, visible) {
    if (!isStaff()) return;
    await sb.from('activity').insert({ project_id: projectId || null, actor_id: state.me.id, text, visible_to_client: !!visible });
  }

  /* ------------------------------------------------------ form dialog */
  function dialogEl() {
    let d = document.getElementById('paDialog');
    if (!d) { d = document.createElement('dialog'); d.id = 'paDialog'; d.className = 'pa-dialog'; document.body.appendChild(d); }
    return d;
  }

  function fieldHtml(f, v) {
    const val = v == null ? '' : v;
    const req = f.required ? ' required' : '';
    const hint = f.hint ? '<small>' + esc(f.hint) + '</small>' : '';
    if (f.type === 'checkbox') return '<label class="pa-check"><input type="checkbox" name="' + f.name + '"' + (val ? ' checked' : '') + '><span>' + esc(f.label) + '</span></label>' + hint;
    let control;
    if (f.type === 'textarea') control = '<textarea name="' + f.name + '" rows="4" maxlength="' + (f.max || 4000) + '"' + req + '>' + esc(val) + '</textarea>';
    else if (f.type === 'select') control = '<select name="' + f.name + '"' + req + '>' + (f.required ? '' : '<option value="">' + esc(f.empty || '—') + '</option>') + f.options.map(o => '<option value="' + esc(o.value) + '"' + (String(o.value) === String(val) ? ' selected' : '') + '>' + esc(o.label) + '</option>').join('') + '</select>';
    else if (f.type === 'file') control = '<input type="file" name="' + f.name + '"' + req + '>';
    else control = '<input type="' + (f.type || 'text') + '" name="' + f.name + '" value="' + esc(val) + '"' + req + (f.max ? ' maxlength="' + f.max + '"' : '') + (f.min != null ? ' min="' + f.min + '"' : '') + (f.maxv != null ? ' max="' + f.maxv + '"' : '') + (f.step ? ' step="' + f.step + '"' : '') + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>';
    return '<label class="pa-field"><span>' + esc(f.label) + (f.required ? '' : ' <em>(optional)</em>') + '</span>' + control + hint + '</label>';
  }

  function openForm({ title, intro, fields, values = {}, submitLabel = 'Save', onSubmit, onDelete }) {
    const d = dialogEl();
    d.innerHTML = '<form method="dialog" class="pa-form"><div class="pa-form-head"><h3>' + esc(title) + '</h3><button type="button" class="pa-x" data-pa-close aria-label="Close">×</button></div>' +
      (intro ? '<p class="pa-intro">' + esc(intro) + '</p>' : '') +
      fields.map(f => fieldHtml(f, values[f.name])).join('') +
      '<p class="pa-error" role="alert"></p><div class="pa-form-actions"><button type="submit" class="portal-primary">' + esc(submitLabel) + '</button>' +
      (onDelete ? '<button type="button" class="pa-danger" data-pa-delete>Delete</button>' : '') + '</div></form>';
    const form = d.querySelector('form');
    const err = d.querySelector('.pa-error');
    d.querySelector('[data-pa-close]').addEventListener('click', () => d.close());
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; err.textContent = '';
      const fd = new FormData(form);
      const out = {};
      for (const f of fields) {
        if (f.type === 'checkbox') out[f.name] = fd.get(f.name) === 'on';
        else if (f.type === 'file') out[f.name] = fd.get(f.name);
        else {
          let x = fd.get(f.name);
          x = typeof x === 'string' ? x.trim() : x;
          if (x === '' || x == null) x = null;
          else if (f.type === 'number') x = Number(x);
          out[f.name] = x;
        }
      }
      try { await onSubmit(out); d.close(); await refresh(); }
      catch (ex) { err.textContent = ex.message || 'Could not save.'; console.error(ex); }
      finally { btn.disabled = false; }
    });
    if (onDelete) d.querySelector('[data-pa-delete]').addEventListener('click', async () => {
      if (!confirm('Delete this permanently?')) return;
      try { await onDelete(); d.close(); await refresh(); toast('Deleted'); }
      catch (ex) { err.textContent = ex.message || 'Could not delete.'; }
    });
    d.showModal();
  }

  const must = res => { if (res.error) throw res.error; return res.data; };

  /* ------------------------------------------------------ CRUD forms */
  const clientOptions = () => state.clients.map(c => ({ value: c.id, label: c.name }));
  const projectOptions = () => state.projects.map(p => ({ value: p.id, label: p.name + ' · ' + clientName(p.client_id) }));
  const staffOptions = () => state.profiles.filter(p => p.role !== 'client').map(p => ({ value: p.id, label: p.full_name || p.email }));

  function projectForm(p) {
    if (!state.clients.length) { toast('Add a client first (Clients tab).', true); return; }
    openForm({
      title: p ? 'Edit project' : 'New project', submitLabel: p ? 'Save changes' : 'Create project',
      values: p || { phase: 'Discovery', progress: 0 },
      fields: [
        { name: 'client_id', label: 'Client', type: 'select', required: true, options: clientOptions() },
        { name: 'name', label: 'Project name', required: true, max: 160 },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'phase', label: 'Phase', type: 'select', required: true, options: PHASES.map(x => ({ value: x, label: x })) },
        { name: 'progress', label: 'Progress (%)', type: 'number', required: true, min: 0, maxv: 100, step: 1 },
        { name: 'due_date', label: 'Due date', type: 'date' }
      ],
      onSubmit: async v => {
        if (p) { must(await sb.from('projects').update(v).eq('id', p.id)); await logActivity(p.id, 'Project updated: ' + v.name, v.phase !== p.phase); }
        else { const row = must(await sb.from('projects').insert({ ...v, created_by: state.me.id }).select().single()); await logActivity(row.id, 'Project created: ' + v.name, true); }
      },
      onDelete: p ? async () => { must(await sb.from('projects').delete().eq('id', p.id)); } : null
    });
  }

  function clientForm(c) {
    openForm({
      title: c ? 'Edit client' : 'New client', submitLabel: c ? 'Save changes' : 'Add client',
      values: c || {},
      fields: [
        { name: 'name', label: 'Client / company name', required: true, max: 120 },
        { name: 'contact_email', label: 'Main contact email', type: 'email' },
        { name: 'notes', label: 'Internal notes', type: 'textarea', hint: 'Only the PRIMO team can see this.' }
      ],
      onSubmit: async v => { if (c) must(await sb.from('clients').update(v).eq('id', c.id)); else must(await sb.from('clients').insert(v)); },
      onDelete: c ? async () => { must(await sb.from('clients').delete().eq('id', c.id)); } : null
    });
  }

  function inviteForm(clientId) {
    const roleOptions = isAdmin() ? [{ value: 'client', label: 'Client' }, { value: 'staff', label: 'PRIMO staff' }, { value: 'admin', label: 'Admin' }] : [{ value: 'client', label: 'Client' }];
    openForm({
      title: 'Invite someone', submitLabel: 'Save invite',
      intro: 'They still create their own account on the login page with this exact email. As soon as they confirm it, they are linked automatically.',
      values: { role: 'client', client_id: clientId || '' },
      fields: [
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'role', label: 'Role', type: 'select', required: true, options: roleOptions },
        { name: 'client_id', label: 'Client (for client accounts)', type: 'select', options: clientOptions(), empty: 'Not linked' }
      ],
      onSubmit: async v => {
        if (v.role === 'client' && !v.client_id) throw new Error('Choose which client this person belongs to.');
        must(await sb.from('invites').upsert({ email: v.email.toLowerCase(), role: v.role, client_id: v.role === 'client' ? v.client_id : null, created_by: state.me.id }));
        toast('Invite saved');
      }
    });
  }

  function taskForm(t) {
    if (!state.projects.length) { toast('Create a project first.', true); return; }
    openForm({
      title: t ? 'Edit task' : 'New task', submitLabel: t ? 'Save changes' : 'Add task',
      values: t || { status: 'To do' },
      fields: [
        { name: 'title', label: 'Task', required: true, max: 200 },
        { name: 'project_id', label: 'Project', type: 'select', required: true, options: projectOptions() },
        { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES.map(x => ({ value: x, label: x })) },
        { name: 'assignee_id', label: 'Assigned to', type: 'select', options: staffOptions(), empty: 'Unassigned' },
        { name: 'due_date', label: 'Due date', type: 'date' }
      ],
      onSubmit: async v => {
        if (t) must(await sb.from('tasks').update(v).eq('id', t.id));
        else { must(await sb.from('tasks').insert({ ...v, created_by: state.me.id })); await logActivity(v.project_id, 'Task added: ' + v.title, false); }
      },
      onDelete: t ? async () => { must(await sb.from('tasks').delete().eq('id', t.id)); } : null
    });
  }

  function approvalForm(a) {
    if (!state.projects.length) { toast('Create a project first.', true); return; }
    openForm({
      title: a ? 'Edit approval' : 'Request an approval', submitLabel: a ? 'Save changes' : 'Send to client',
      intro: a ? '' : 'The client sees this under Approvals and can approve it or ask for changes.',
      values: a || {},
      fields: [
        { name: 'project_id', label: 'Project', type: 'select', required: true, options: projectOptions() },
        { name: 'title', label: 'What needs approving?', required: true, max: 200 },
        { name: 'description', label: 'Details / link to the work', type: 'textarea' },
        ...(a ? [{ name: 'status', label: 'Status', type: 'select', required: true, options: ['Awaiting review', 'Approved', 'Changes requested'].map(x => ({ value: x, label: x })) }] : [])
      ],
      onSubmit: async v => {
        if (a) must(await sb.from('approvals').update(v).eq('id', a.id));
        else { must(await sb.from('approvals').insert({ ...v, created_by: state.me.id })); await logActivity(v.project_id, 'Approval requested: ' + v.title, true); }
      },
      onDelete: a ? async () => { must(await sb.from('approvals').delete().eq('id', a.id)); } : null
    });
  }

  function decideForm(a, decision) {
    const changes = decision === 'Changes requested';
    openForm({
      title: changes ? 'Request changes' : 'Approve', submitLabel: changes ? 'Send feedback' : 'Confirm approval',
      intro: a.title,
      fields: [{ name: 'comment', label: changes ? 'What should change?' : 'Comment', type: 'textarea', required: changes }],
      onSubmit: async v => { must(await sb.rpc('decide_approval', { p_id: a.id, p_status: decision, p_comment: v.comment })); toast('Decision sent'); }
    });
  }

  function invoiceForm(i) {
    if (!state.clients.length) { toast('Add a client first.', true); return; }
    openForm({
      title: i ? 'Edit invoice' : 'New invoice', submitLabel: i ? 'Save changes' : 'Create invoice',
      intro: 'Drafts are hidden from the client. Switch the status to Sent to publish it in their portal.',
      values: i || { status: 'Draft', currency: 'USD' },
      fields: [
        { name: 'client_id', label: 'Client', type: 'select', required: true, options: clientOptions() },
        { name: 'project_id', label: 'Project', type: 'select', options: projectOptions(), empty: 'No project' },
        { name: 'number', label: 'Invoice number', required: true, max: 40, placeholder: 'INV-2026-001' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, step: '0.01' },
        { name: 'currency', label: 'Currency (3 letters)', required: true, max: 3, placeholder: 'USD' },
        { name: 'status', label: 'Status', type: 'select', required: true, options: INVOICE_STATUSES.map(x => ({ value: x, label: x })) },
        { name: 'due_date', label: 'Due date', type: 'date' }
      ],
      onSubmit: async v => {
        v.currency = (v.currency || 'USD').toUpperCase();
        if (i) must(await sb.from('invoices').update(v).eq('id', i.id));
        else must(await sb.from('invoices').insert({ ...v, created_by: state.me.id }));
      },
      onDelete: i ? async () => { must(await sb.from('invoices').delete().eq('id', i.id)); } : null
    });
  }

  function requestForm() {
    openForm({
      title: 'New request', submitLabel: 'Send request',
      intro: 'Tell the PRIMO team what you need. We will pick it up and update the status here.',
      fields: [
        { name: 'title', label: 'Subject', required: true, max: 200 },
        { name: 'project_id', label: 'Related project', type: 'select', options: projectOptions(), empty: 'General' },
        { name: 'body', label: 'Details', type: 'textarea' }
      ],
      onSubmit: async v => must(await sb.from('requests').insert({ ...v, client_id: state.me.client_id, created_by: state.me.id }))
    });
  }

  function uploadForm() {
    if (!state.projects.length) { toast('Create a project first.', true); return; }
    openForm({
      title: 'Upload a file', submitLabel: 'Upload',
      intro: 'Files are stored privately. Up to 50 MB each.',
      values: { visible_to_client: true },
      fields: [
        { name: 'project_id', label: 'Project', type: 'select', required: true, options: projectOptions() },
        { name: 'file', label: 'File', type: 'file', required: true },
        { name: 'visible_to_client', label: 'Visible to the client', type: 'checkbox' }
      ],
      onSubmit: async v => {
        const file = v.file;
        if (!file || !file.size) throw new Error('Choose a file.');
        if (file.size > 52428800) throw new Error('That file is over 50 MB.');
        const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-120);
        const path = v.project_id + '/' + crypto.randomUUID() + '-' + safe;
        must(await sb.storage.from('project-files').upload(path, file, { contentType: file.type || 'application/octet-stream' }));
        const ins = await sb.from('files').insert({ project_id: v.project_id, name: file.name, storage_path: path, size_bytes: file.size, mime_type: file.type || null, visible_to_client: v.visible_to_client, uploaded_by: state.me.id });
        if (ins.error) { await sb.storage.from('project-files').remove([path]); throw ins.error; }
        await logActivity(v.project_id, 'File uploaded: ' + file.name, v.visible_to_client);
      }
    });
  }

  async function downloadFile(f) {
    const { data, error } = await sb.storage.from('project-files').createSignedUrl(f.storage_path, 60, { download: f.name });
    if (error) return fail(error, 'Download failed');
    const a = document.createElement('a'); a.href = data.signedUrl; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
  }

  async function deleteFile(f) {
    if (!confirm('Delete "' + f.name + '"?')) return;
    try {
      must(await sb.from('files').delete().eq('id', f.id));
      await sb.storage.from('project-files').remove([f.storage_path]);
      await logActivity(f.project_id, 'File removed: ' + f.name, false);
      toast('File deleted'); await refresh();
    } catch (ex) { fail(ex, 'Delete failed'); }
  }

  function profileForm(p) {
    openForm({
      title: 'Edit ' + (p.full_name || p.email), submitLabel: 'Save access',
      intro: p.email,
      values: { role: p.role, client_id: p.client_id || '' },
      fields: [
        { name: 'role', label: 'Role', type: 'select', required: true, options: [{ value: 'client', label: 'Client' }, { value: 'staff', label: 'PRIMO staff' }, { value: 'admin', label: 'Admin' }] },
        { name: 'client_id', label: 'Client (for client accounts)', type: 'select', options: clientOptions(), empty: 'Not linked' }
      ],
      onSubmit: async v => {
        if (p.id === state.me.id && v.role !== 'admin') throw new Error('You cannot remove your own admin access.');
        if (v.role === 'client' && !v.client_id) throw new Error('Choose which client this person belongs to.');
        must(await sb.from('profiles').update({ role: v.role, client_id: v.role === 'client' ? v.client_id : null }).eq('id', p.id));
      }
    });
  }

  /* ---------------------------------------------------------- views */
  const badge = (s, good, warn) => '<span class="portal-status ' + (good.includes(s) ? 'is-done' : warn.includes(s) ? 'is-review' : '') + '">' + esc(s) + '</span>';
  const phaseBadge = s => badge(s, ['Completed', 'Launch'], ['Design review', 'Review']);
  const apprBadge = s => badge(s, ['Approved'], ['Changes requested', 'Awaiting review']);
  const invBadge = s => badge(s, ['Paid'], ['Overdue', 'Sent']);
  const reqBadge = s => badge(s, ['Resolved'], ['In progress']);
  const stat = (label, note, n) => '<article class="portal-stat"><span>' + esc(label) + '</span><strong>' + esc(n) + '</strong><small>' + esc(note) + '</small></article>';
  const empty = (h, p, btn) => '<div class="portal-empty"><h3>' + esc(h) + '</h3><p>' + esc(p) + '</p>' + (btn || '') + '</div>';
  const btn = (label, action, id, cls) => '<button type="button" class="' + (cls || 'portal-small') + '" data-action="' + action + '"' + (id ? ' data-id="' + esc(id) + '"' : '') + '>' + label + '</button>';
  const sectionHead = (title, actions) => '<div class="portal-section-head"><h2>' + esc(title) + '</h2><div class="pa-toolbar">' + (actions || '') + '</div></div>';
  const size = n => (n == null ? '' : n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');

  function projectsGrid(list) {
    if (!list.length) return empty('No projects yet.', isStaff() ? 'Create the first project to get started.' : 'Your PRIMO team will add your projects here.');
    return '<div class="portal-project-grid">' + list.map(p => {
      const open = state.tasks.filter(t => t.project_id === p.id && t.status !== 'Done').length;
      return '<article class="portal-project"><div class="portal-label">' + esc(clientName(p.client_id)) + '</div><h3>' + esc(p.name) + '</h3>' + phaseBadge(p.phase) +
        '<div class="portal-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p.progress + '" aria-label="' + esc(p.name) + ' progress"><i style="width:' + Math.max(0, Math.min(100, p.progress)) + '%"></i></div>' +
        '<p>' + p.progress + '% complete · Due ' + esc(fmtDate(p.due_date)) + (isStaff() ? ' · ' + open + ' open task' + (open === 1 ? '' : 's') : '') + '</p>' +
        (p.description ? '<p class="pa-desc">' + esc(p.description) + '</p>' : '') +
        (isStaff() ? '<div class="portal-row-actions">' + btn('Edit', 'edit-project', p.id) + '</div>' : '') + '</article>';
    }).join('') + '</div>';
  }

  function activityList() {
    if (!state.activity.length) return '<p class="portal-muted">Updates will appear here as the work moves.</p>';
    return '<div class="portal-activity">' + state.activity.slice(0, 8).map(a => '<div><span aria-hidden="true">↗</span><p>' + esc(a.text) + '<small>' + esc(fmtDateTime(a.created_at)) + (a.project_id ? ' · ' + esc(projectName(a.project_id)) : '') + '</small></p></div>').join('') + '</div>';
  }

  function overview() {
    const awaiting = state.approvals.filter(a => a.status === 'Awaiting review').length;
    const openReq = state.requests.filter(r => r.status !== 'Resolved').length;
    const active = state.projects.filter(p => !['Completed', 'On hold'].includes(p.phase));
    let stats;
    if (isStaff()) {
      stats = stat('Active projects', 'Across all clients', active.length) + stat('Open tasks', 'Not yet done', state.tasks.filter(t => t.status !== 'Done').length) + stat('Awaiting client', 'Approvals pending', awaiting) + stat('Open requests', 'From clients', openReq);
    } else {
      const due = state.invoices.filter(i => ['Sent', 'Overdue'].includes(i.status)).length;
      stats = stat('Active projects', 'In progress with PRIMO', active.length) + stat('Awaiting your review', 'Approvals for you', awaiting) + stat('Open requests', 'Your requests', openReq) + stat('Invoices due', 'Sent or overdue', due);
    }
    const greet = esc((state.me.full_name || '').split(' ')[0] || '');
    return '<div class="portal-stats pa-stats-4">' + stats + '</div>' +
      sectionHead('Projects in motion', btn('View all ↗', 'goto-projects', null, 'pa-link')) + projectsGrid(active.slice(0, 3)) +
      sectionHead('Recent activity') + activityList();
  }

  function projectsView() {
    return sectionHead('Projects', isStaff() ? btn('New project +', 'new-project', null, 'portal-primary') : '') + projectsGrid(state.projects);
  }

  function clientsView() {
    const head = sectionHead('Clients', btn('Invite someone', 'invite', null, 'portal-small secondary') + btn('New client +', 'new-client', null, 'portal-primary'));
    if (!state.clients.length) return head + empty('Add your first client.', 'Clients are the companies you work for. Each gets their own private view of their projects, approvals, files and invoices.');
    return head + '<div class="portal-project-grid">' + state.clients.map(c => {
      const users = state.profiles.filter(p => p.client_id === c.id);
      const pend = state.invites.filter(i => i.client_id === c.id);
      return '<article class="portal-project"><div class="portal-avatar">' + esc(c.name.slice(0, 1).toUpperCase()) + '</div><h3>' + esc(c.name) + '</h3>' +
        '<p>' + state.projects.filter(p => p.client_id === c.id).length + ' project(s) · ' + users.length + ' portal user(s)' + (pend.length ? ' · ' + pend.length + ' invited' : '') + '</p>' +
        (c.contact_email ? '<p class="pa-desc">' + esc(c.contact_email) + '</p>' : '') +
        (users.length ? '<p class="pa-desc">' + users.map(u => esc(u.full_name || u.email)).join(', ') + '</p>' : '') +
        '<div class="portal-row-actions">' + btn('Edit', 'edit-client', c.id) + btn('Invite', 'invite-client', c.id, 'portal-small secondary') + '</div></article>';
    }).join('') + '</div>';
  }

  function tasksView() {
    const head = sectionHead('Task board', btn('New task +', 'new-task', null, 'portal-primary'));
    return head + '<div class="portal-board">' + STATUSES.map(col => {
      const items = state.tasks.filter(t => t.status === col);
      return '<section class="portal-column" data-drop-status="' + col + '"><h3>' + col + ' <span>' + items.length + '</span></h3>' + items.map(t =>
        '<article class="portal-task" draggable="true" data-task-id="' + esc(t.id) + '"><small>' + esc(projectName(t.project_id)) + '</small><h4>' + esc(t.title) + '</h4>' +
        '<p class="pa-meta">' + esc(t.assignee_id ? personName(t.assignee_id) : 'Unassigned') + (t.due_date ? ' · due ' + esc(fmtDate(t.due_date)) : '') + '</p>' +
        '<label class="portal-label">Move task<select data-task-move="' + esc(t.id) + '" aria-label="Move ' + esc(t.title) + '">' + STATUSES.map(s => '<option' + (s === col ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></label>' +
        '<div class="portal-row-actions">' + btn('Edit', 'edit-task', t.id) + '</div></article>').join('') + '</section>';
    }).join('') + '</div>';
  }

  function approvalsView() {
    const head = sectionHead('Creative approvals', isStaff() ? btn('Request approval +', 'new-approval', null, 'portal-primary') : '');
    if (!state.approvals.length) return head + empty('Nothing to approve yet.', isStaff() ? 'Send work to a client for sign-off and track their decision here.' : 'When PRIMO needs your sign-off, it will appear here.');
    return head + '<div class="portal-list">' + state.approvals.map(a =>
      '<article class="portal-list-row"><div><small>' + esc(projectName(a.project_id)) + '</small><h3>' + esc(a.title) + '</h3>' + apprBadge(a.status) +
      (a.description ? '<p class="pa-desc">' + esc(a.description) + '</p>' : '') +
      (a.client_comment ? '<p class="pa-comment">“' + esc(a.client_comment) + '”' + (a.decided_at ? ' <small>' + esc(fmtDateTime(a.decided_at)) + '</small>' : '') + '</p>' : '') + '</div>' +
      '<div class="portal-row-actions">' +
      (!isStaff() ? btn('Approve', 'approve', a.id) + btn('Request changes', 'changes', a.id, 'portal-small secondary') : btn('Edit', 'edit-approval', a.id)) +
      '</div></article>').join('') + '</div>';
  }

  function filesView() {
    const head = sectionHead('Files & handover', isStaff() ? btn('Upload file +', 'upload', null, 'portal-primary') : '');
    if (!state.files.length) return head + empty('No files yet.', isStaff() ? 'Upload briefs, designs and deliverables. They stay private and are only shared with the right client.' : 'Briefs, designs and deliverables from PRIMO will appear here.');
    return head + '<div class="portal-list">' + state.files.map(f =>
      '<article class="portal-list-row"><div><small>' + esc(projectName(f.project_id)) + '</small><h3>' + esc(f.name) + '</h3><p class="pa-meta">' + esc(size(f.size_bytes)) + ' · ' + esc(fmtDate(f.created_at)) + (isStaff() ? (f.visible_to_client ? ' · shared with client' : ' · internal only') : '') + '</p></div>' +
      '<div class="portal-row-actions">' + btn('Download ↓', 'download', f.id) + (isStaff() ? btn('Delete', 'delete-file', f.id, 'portal-small secondary') : '') + '</div></article>').join('') + '</div>';
  }

  function invoicesView() {
    const head = sectionHead('Invoices', isStaff() ? btn('New invoice +', 'new-invoice', null, 'portal-primary') : '');
    if (!state.invoices.length) return head + empty('No invoices yet.', isStaff() ? 'Create an invoice as a draft, then mark it Sent to show it to the client.' : 'Invoices from PRIMO will appear here.');
    return head + '<div class="portal-list">' + state.invoices.map(i =>
      '<article class="portal-list-row"><div><small>' + esc(i.number) + (isStaff() ? ' · ' + esc(clientName(i.client_id)) : '') + '</small><h3>' + esc(money(i.amount, i.currency)) + '</h3>' + invBadge(i.status) +
      '<p class="pa-meta">' + esc(i.description || '') + (i.project_id ? ' · ' + esc(projectName(i.project_id)) : '') + (i.due_date ? ' · due ' + esc(fmtDate(i.due_date)) : '') + '</p></div>' +
      '<div class="portal-row-actions">' + (isStaff() ? btn('Edit', 'edit-invoice', i.id) : '') + btn('View ↗', 'view-invoice', i.id, 'portal-small secondary') + '</div></article>').join('') + '</div>';
  }

  function requestsView() {
    const head = sectionHead('Requests', !isStaff() ? btn('New request +', 'new-request', null, 'portal-primary') : '');
    if (!state.requests.length) return head + empty('No requests yet.', isStaff() ? 'Requests your clients send from their portal will land here.' : 'Need something? Send a request and your PRIMO team will pick it up.');
    return head + '<div class="portal-list">' + state.requests.map(r =>
      '<article class="portal-list-row"><div><small>' + esc((isStaff() ? clientName(r.client_id) + ' · ' : '') + (r.project_id ? projectName(r.project_id) : 'General') + ' · ' + fmtDate(r.created_at)) + '</small><h3>' + esc(r.title) + '</h3>' + reqBadge(r.status) +
      (r.body ? '<p class="pa-desc">' + esc(r.body) + '</p>' : '') + '</div>' +
      (isStaff() ? '<div class="portal-row-actions"><label class="portal-label">Status<select data-request-status="' + esc(r.id) + '">' + REQUEST_STATUSES.map(s => '<option' + (s === r.status ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></label></div>' : '') +
      '</article>').join('') + '</div>';
  }

  function teamView() {
    const head = sectionHead('Team & access', btn('Invite someone', 'invite', null, 'portal-primary'));
    const people = state.profiles.map(p =>
      '<article class="portal-list-row"><div><small>' + esc(p.email) + '</small><h3>' + esc(p.full_name || '(no name)') + '</h3><p class="pa-meta">' + esc({ admin: 'Admin', staff: 'PRIMO staff', client: 'Client' }[p.role]) + (p.client_id ? ' · ' + esc(clientName(p.client_id)) : p.role === 'client' ? ' · not linked to a client yet' : '') + '</p></div>' +
      '<div class="portal-row-actions">' + btn('Change access', 'edit-profile', p.id) + '</div></article>').join('');
    const pend = state.invites.length ? sectionHead('Pending invites') + '<div class="portal-list">' + state.invites.map(i =>
      '<article class="portal-list-row"><div><small>' + esc(i.role === 'client' ? 'Client · ' + clientName(i.client_id) : i.role) + '</small><h3>' + esc(i.email) + '</h3><p class="pa-meta">Waiting for them to create an account</p></div><div class="portal-row-actions">' + btn('Cancel invite', 'cancel-invite', i.email, 'portal-small secondary') + '</div></article>').join('') + '</div>' : '';
    return head + '<div class="portal-list">' + people + '</div>' + pend;
  }

  function view() {
    switch (tab) {
      case 'overview': return overview();
      case 'projects': return projectsView();
      case 'clients': return clientsView();
      case 'tasks': return tasksView();
      case 'approvals': return approvalsView();
      case 'files': return filesView();
      case 'invoices': return invoicesView();
      case 'requests': return requestsView();
      case 'team': return teamView();
      default: return '';
    }
  }

  const TITLES = {
    overview: () => (isStaff() ? 'A clearer view of the work.' : 'Your next chapter, in progress.'),
    projects: () => 'Projects', clients: () => 'Client directory', tasks: () => 'The task board', approvals: () => 'Creative approvals',
    files: () => 'Files & handover', invoices: () => 'Invoices', requests: () => 'Requests', team: () => 'Team & access'
  };
  const ICONS = { overview: '◈', projects: '▤', approvals: '✓', files: '↗', invoices: '▧', clients: '◉', tasks: '▥', requests: '◇', team: '⚙' };

  function shell(content) {
    const label = isStaff() ? 'STAFF' : 'CLIENT';
    return '<div class="portal-layout"><aside class="portal-sidebar"><div class="portal-workspace-brand">PRIMO<span>WORKSPACE / ' + label + '</span></div><nav aria-label="Workspace sections">' +
      tabs.map(n => '<button type="button" data-view="' + n + '" ' + (n === tab ? 'aria-current="page"' : '') + '><span>' + ICONS[n] + '</span>' + n.charAt(0).toUpperCase() + n.slice(1) + '</button>').join('') +
      '</nav><div class="portal-sidebar-foot"><p class="pa-me">' + esc(state.me.full_name || state.me.email) + '<small>' + esc(state.me.email) + '</small></p><button type="button" data-action="rename">Edit my name</button><button type="button" data-leave-workspace>Sign out</button></div></aside>' +
      '<div class="portal-main"><div class="portal-workspace-top"><div><div class="portal-label">' + (isStaff() ? 'PRIMO TEAM' : esc(clientName(state.me.client_id)).toUpperCase()) + '</div><h2>' + esc(TITLES[tab]()) + '</h2></div><span class="portal-demo-pill">' + label + (isAdmin() ? ' · ADMIN' : '') + '</span></div>' +
      (state.error ? '<div class="pa-banner">Some data could not be loaded: ' + esc(state.error) + '</div>' : '') +
      '<div id="portalView">' + content + '</div></div></div>';
  }

  function render() {
    if (!loaded || !state.me) return;
    if (!isStaff() && !state.me.client_id) {
      root.innerHTML = '<div class="portal-gate"><span class="portal-demo-pill">ACCOUNT CREATED</span><h2>Almost there, ' + esc((state.me.full_name || '').split(' ')[0] || 'welcome') + '.</h2><p>Your account (' + esc(state.me.email) + ') is not linked to a client workspace yet. The PRIMO team will connect it shortly. If you were expecting access already, contact your PRIMO project lead.</p><button class="page-secondary" type="button" data-leave-workspace>Sign out</button></div>';
      return;
    }
    const scrollY = window.scrollY;
    root.innerHTML = shell(view());
    window.scrollTo(0, scrollY);
  }

  /* --------------------------------------------------------- events */
  function navigate(next) {
    if (!tabs.includes(next)) return;
    tab = next; history.replaceState(null, '', '#' + next); render();
    const b = root.querySelector('[data-view="' + next + '"]'); if (b) b.focus();
  }

  const find = (list, id) => list.find(x => x.id === id);

  const actions = {
    'goto-projects': () => navigate('projects'),
    'new-project': () => projectForm(),
    'edit-project': id => projectForm(find(state.projects, id)),
    'new-client': () => clientForm(),
    'edit-client': id => clientForm(find(state.clients, id)),
    'invite': () => inviteForm(),
    'invite-client': id => inviteForm(id),
    'new-task': () => taskForm(),
    'edit-task': id => taskForm(find(state.tasks, id)),
    'new-approval': () => approvalForm(),
    'edit-approval': id => approvalForm(find(state.approvals, id)),
    'approve': id => decideForm(find(state.approvals, id), 'Approved'),
    'changes': id => decideForm(find(state.approvals, id), 'Changes requested'),
    'upload': () => uploadForm(),
    'download': id => downloadFile(find(state.files, id)),
    'delete-file': id => deleteFile(find(state.files, id)),
    'new-invoice': () => invoiceForm(),
    'edit-invoice': id => invoiceForm(find(state.invoices, id)),
    'view-invoice': id => showInvoice(find(state.invoices, id)),
    'new-request': () => requestForm(),
    'edit-profile': id => profileForm(find(state.profiles, id)),
    'cancel-invite': async email => { try { must(await sb.from('invites').delete().eq('email', email)); await refresh(); toast('Invite cancelled'); } catch (e) { fail(e); } },
    'rename': () => openForm({
      title: 'Your name', fields: [{ name: 'name', label: 'Display name', required: true, max: 100 }], values: { name: state.me.full_name },
      onSubmit: async v => { must(await sb.rpc('update_my_name', { p_name: v.name })); state.me.full_name = v.name; }
    })
  };

  function showInvoice(i) {
    const d = dialogEl();
    d.innerHTML = '<div class="pa-form pa-invoice"><div class="pa-form-head"><h3>Invoice ' + esc(i.number) + '</h3><button type="button" class="pa-x" data-pa-close aria-label="Close">×</button></div>' +
      '<p><strong>' + esc(clientName(i.client_id)) + '</strong>' + (i.project_id ? '<br>' + esc(projectName(i.project_id)) : '') + '<br>' + esc(i.description || '') + '</p>' +
      '<div class="portal-invoice-total"><span>Amount</span><strong>' + esc(money(i.amount, i.currency)) + '</strong></div>' +
      '<p class="pa-meta">Status: ' + esc(i.status) + (i.due_date ? ' · Due ' + esc(fmtDate(i.due_date)) : '') + ' · Issued ' + esc(fmtDate(i.created_at)) + '</p>' +
      '<div class="pa-form-actions"><button type="button" class="portal-primary" onclick="window.print()">Print ↗</button></div></div>';
    d.querySelector('[data-pa-close]').addEventListener('click', () => d.close());
    d.showModal();
  }

  async function signOut() { await sb.auth.signOut(); location.href = base + 'portal/login/'; }

  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.view) return navigate(b.dataset.view);
    if (b.hasAttribute('data-leave-workspace')) return signOut();
    const fn = actions[b.dataset.action]; if (fn) fn(b.dataset.id);
  });

  root.addEventListener('change', async e => {
    const t = e.target;
    try {
      if (t.matches('[data-task-move]')) { must(await sb.from('tasks').update({ status: t.value }).eq('id', t.dataset.taskMove)); await refresh(); }
      else if (t.matches('[data-request-status]')) { must(await sb.from('requests').update({ status: t.value }).eq('id', t.dataset.requestStatus)); await refresh(); }
    } catch (ex) { fail(ex, 'Update failed'); await refresh(); }
  });

  root.addEventListener('dragstart', e => { const c = e.target.closest('[data-task-id]'); if (c) e.dataTransfer.setData('text/plain', c.dataset.taskId); });
  root.addEventListener('dragover', e => { if (e.target.closest('[data-drop-status]')) e.preventDefault(); });
  root.addEventListener('drop', async e => {
    const col = e.target.closest('[data-drop-status]'); if (!col) return;
    e.preventDefault();
    try { must(await sb.from('tasks').update({ status: col.dataset.dropStatus }).eq('id', e.dataTransfer.getData('text/plain'))); await refresh(); }
    catch (ex) { fail(ex, 'Move failed'); }
  });

  addEventListener('hashchange', () => { const n = location.hash.slice(1); if (tabs.includes(n) && n !== tab) { tab = n; render(); } });

  /* ----------------------------------------------------------- boot */
  async function boot() {
    root.innerHTML = '<div class="portal-gate"><h2>Opening your workspace…</h2></div>';
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { location.replace(base + 'portal/login/'); return; }
    const { data: me, error } = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    if (error || !me) { root.innerHTML = '<div class="portal-gate"><h2>We could not load your profile.</h2><p>' + esc(error ? error.message : 'No profile found.') + '</p><button class="page-secondary" type="button" data-leave-workspace>Sign out</button></div>'; return; }
    state.me = me;
    const staff = isStaff();
    if (staff && pageRole === 'client') { location.replace(base + 'portal/staff/'); return; }
    if (!staff && pageRole === 'staff') { location.replace(base + 'portal/client/'); return; }
    tabs = staff
      ? ['overview', 'projects', 'clients', 'tasks', 'approvals', 'files', 'invoices', 'requests'].concat(isAdmin() ? ['team'] : [])
      : ['overview', 'projects', 'approvals', 'files', 'invoices', 'requests'];
    const hash = location.hash.slice(1); tab = tabs.includes(hash) ? hash : 'overview';
    await loadAll(); render();
    sb.channel('primo-portal').on('postgres_changes', { event: '*', schema: 'public' }, scheduleReload).subscribe();
    sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') location.replace(base + 'portal/login/'); });
  }
  boot().catch(ex => { console.error(ex); root.innerHTML = '<div class="portal-gate"><h2>Something went wrong.</h2><p>' + esc(ex.message || ex) + '</p></div>'; });
})();
