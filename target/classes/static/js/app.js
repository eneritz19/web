const app = document.getElementById('app');

const state = {
    user: null,
    dashboard: null,
    riders: [],
    lines: [],
    rewards: [],
    corporate: null,
    tracking: null,
    activeRewardCategory: 'Guztiak',
    carpoolTab: 'bilatu'
};

const titles = {
    home: ['Kaixo, Jon 👋', 'Astelehena, 27 maiatza 2026'],
    tracking: ['Bidaia Trakeatua', 'GPS aktiboa · Bilbo, Euskadi'],
    carpool: ['Karpoola', 'Hurbileko bidaiariak'],
    transport: ['Garraioa', 'Zerbitzu publikoak eta ibilbideak'],
    rewards: ['Sariak', '1.240 puntu eskuragarri'],
    stats: ['Estatistikak', 'Zure inpaktu ekologikoa'],
    profile: ['Profila', 'Ezarpenak eta kontua'],
    corporate: ['Panel Korporatiboa', 'Bizkaiko Foru Aldundia · 2026']
};

const routes = {
    '#/app': 'home',
    '#/app/bidaia': 'tracking',
    '#/app/karpoola': 'carpool',
    '#/app/garraioa': 'transport',
    '#/app/sariak': 'rewards',
    '#/app/estatistikak': 'stats',
    '#/app/profila': 'profile',
    '#/app/enpresa': 'corporate'
};

async function api(path, options = {}) {
    const response = await fetch(path, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });

    if (!response.ok) {
        let errorMessage = `API error ${response.status}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch { }

        throw new Error(errorMessage);
    }

    return response.json();
}

function go(hash) {
    location.hash = hash;
}

function matomoPage(pageName) {
    if (window._paq) {
        window._paq.push(['setCustomUrl', location.href]);
        window._paq.push(['setDocumentTitle', pageName]);
        window._paq.push(['trackPageView']);
    }
}

function matomoEvent(category, action, name) {
    if (window._paq) {
        window._paq.push(['trackEvent', category, action, name]);
    }
}

function showToast(message) {
    const old = document.querySelector('.toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function ensureData() {
    const tasks = [];
    if (!state.dashboard) tasks.push(api('/api/dashboard').then(data => state.dashboard = data));
    if (!state.riders.length) tasks.push(api('/api/riders').then(data => state.riders = data));
    if (!state.lines.length) tasks.push(api('/api/transport-lines').then(data => state.lines = data));
    if (!state.rewards.length) tasks.push(api('/api/rewards').then(data => state.rewards = data));
    if (!state.corporate) tasks.push(api('/api/corporate').then(data => state.corporate = data));
    await Promise.all(tasks);
    state.user = state.dashboard.user;
}

function renderWelcome() {
    matomoPage('Welcome');
    app.innerHTML = `
        <section class="auth-page">
            <div class="auth-left">
                <div class="logo" style="border:0;padding:0;color:white"><span class="logo-icon" style="background:rgba(255,255,255,.18)">🌿</span> EcoMove</div>
                <div>
                    <h1>Mugitu<br>adimenduagoa.<br><span style="color:#bbf7d0">Bizi berdeagoa.</span></h1>
                    <p>Euskadiko mugikortasun jasangarrirako plataforma. Karpoola, garraio publikoa eta bidaien trakeatua leku bakarrean.</p>
                    <div class="stat-pills" style="margin-top:32px">
                        <div class="stat-pill"><strong>12k+</strong>Erabiltzaileak</div>
                        <div class="stat-pill"><strong>847t</strong>CO₂ Aurreztua</div>
                        <div class="stat-pill"><strong>98%</strong>Asebetetzea</div>
                    </div>
                </div>
                <div class="feature-pills">
                    <span class="feature-pill">🚌 Garraio publikoa</span>
                    <span class="feature-pill">🚗 Karpoola</span>
                    <span class="feature-pill">📊 Estatistikak</span>
                    <span class="feature-pill">🏆 Sariak</span>
                    <span class="feature-pill">🏢 Enpresa panel</span>
                </div>
            </div>
            <div class="auth-right">
                <div class="auth-box">
                    <h2>Ongi etorri</h2>
                    <p>Hasi zure bidaia jasangarria gaur</p>
                    <button class="btn" style="width:100%;margin-bottom:12px" onclick="go('#/register')">Kontu berria sortu</button>
                    <button class="btn secondary" style="width:100%;margin-bottom:22px" onclick="go('#/login')">Badut kontua — Sartu</button>
                    <div class="grid-2">
                        <button class="btn secondary">🔵 Google</button>
                        <button class="btn secondary">🍎 Apple</button>
                    </div>
                    <p style="font-size:12px;text-align:center;margin-top:28px">Erregistratuz, Erabilera Baldintzak eta Pribatutasun Politika onartzen dituzu.</p>
                </div>
            </div>
        </section>
    `;
}

function renderLogin() {
    matomoPage('Login');
    app.innerHTML = `
        <section class="auth-page">
            <div class="auth-left">
                <button class="logo" style="border:0;padding:0;color:white;background:transparent" onclick="go('#/')"><span class="logo-icon" style="background:rgba(255,255,255,.18)">🌿</span> EcoMove</button>
                <div>
                    <div style="font-size:80px;margin-bottom:18px">🌿</div>
                    <h2>Ongi etorri<br>berriro</h2>
                    <p>Zure bidaia jasangarria jarraitzen du</p>
                    <div style="display:grid;gap:12px;margin-top:28px">
                        <div class="feature-pill">🌍 847 kg CO₂ aurreztua aurten</div>
                        <div class="feature-pill">🚌 47 bidaia jasangarri</div>
                        <div class="feature-pill">⭐ 1.240 puntu pilatua</div>
                    </div>
                </div>
                <p style="font-size:12px">© 2026 EcoMove · Bilbo, Euskadi</p>
            </div>
            <div class="auth-right">
                <form class="auth-box" onsubmit="login(event)">
                    <h2>Sartu</h2>
                    <p>Zure kontuan sartu</p>
                    <div class="form-group">
                        <label>Helbide elektronikoa</label>
                        <input name="email" type="email" value="jon.urrutia@ecomove.eus" required>
                    </div>
                    <div class="form-group">
                        <label>Pasahitza</label>
                        <input name="password" type="password" value="123456" required>
                    </div>
                    <button class="btn" style="width:100%">Sartu</button>
                    <p style="text-align:center;margin-top:24px">Ez duzu konturik? <a href="#/register">Erregistratu</a></p>
                </form>
            </div>
        </section>
    `;
}

function renderRegister() {
    matomoPage('Register');
    app.innerHTML = `
        <section class="auth-page">
            <div class="auth-left">
                <button class="logo" style="border:0;padding:0;color:white;background:transparent" onclick="go('#/')"><span class="logo-icon" style="background:rgba(255,255,255,.18)">🌿</span> EcoMove</button>
                <div>
                    <div style="font-size:80px;margin-bottom:18px">🚀</div>
                    <h2>Batu gure<br>komunitateari</h2>
                    <p>12.000+ lagun mugitzen ari dira modu jasangarrian.</p>
                    <div class="grid-2" style="margin-top:28px">
                        <div class="feature-pill">🌱 Doakoa</div>
                        <div class="feature-pill">🚌 Garraio sareak</div>
                        <div class="feature-pill">🏆 Puntu sariak</div>
                        <div class="feature-pill">📊 Estatistikak</div>
                    </div>
                </div>
                <p style="font-size:12px">EcoMove prototipo sinplifikatua</p>
            </div>
            <div class="auth-right">
                <form class="auth-box" onsubmit="register(event)">
                    <h2>Kontua sortu</h2>
                    <p>Formulario simplea prototiporako</p>
                    <div class="form-group">
                        <label>Izen-abizenak</label>
                        <input name="name" value="Jon Urrutia" required>
                    </div>
                    <div class="form-group">
                        <label>Helbide elektronikoa</label>
                        <input name="email" type="email" value="jon.urrutia@ecomove.eus" required>
                    </div>
                    <div class="form-group">
                        <label>Pasahitza</label>
                        <input name="password" type="password" value="123456" required>
                    </div>
                    <button class="btn" style="width:100%">Sortu kontua</button>
                    <p style="text-align:center;margin-top:24px">Baduzu kontua? <a href="#/login">Sartu</a></p>
                </form>
            </div>
        </section>
    `;
}

async function login(event) {
    event.preventDefault();

    const form = new FormData(event.target);

    const data = {
        email: form.get('email'),
        password: form.get('password')
    };

    try {
        const response = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        state.user = response.user;

        matomoEvent('Auth', 'login', data.email);

        showToast(response.message || 'Login correcto');

        go('#/app');

    } catch (error) {
        console.error('Login error:', error);

        showToast('Email o contraseña incorrectos');
    }
}

async function register(event) {
    event.preventDefault();

    const form = new FormData(event.target);

    const data = {
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password')
    };

    try {
        const response = await api('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        state.user = response.user;

        matomoEvent('Auth', 'register', data.email);

        showToast(response.message || 'Cuenta creada');

        go('#/app');

    } catch (error) {
        console.error('Register error:', error);

        showToast('No se pudo crear la cuenta');
    }
}

function shell(pageKey, content) {
    const [title, subtitle] = titles[pageKey] || titles.home;
    const navItems = [
        ['#/app', '🏠', 'Hasiera', 'home'],
        ['#/app/bidaia', '🧭', 'Bidaia', 'tracking'],
        ['#/app/karpoola', '👥', 'Karpoola', 'carpool'],
        ['#/app/garraioa', '🚆', 'Garraioa', 'transport'],
        ['#/app/sariak', '⭐', 'Sariak', 'rewards'],
        ['#/app/estatistikak', '📊', 'Estatistikak', 'stats'],
        ['#/app/enpresa', '🏢', 'Enpresa', 'corporate']
    ];

    app.innerHTML = `
        <div class="app-shell">
            <aside class="sidebar">
                <div class="logo"><span class="logo-icon">🌿</span> EcoMove</div>
                <nav class="nav">
                    ${navItems.map(([hash, icon, label, key]) => `
                        <button class="${pageKey === key ? 'active' : ''}" onclick="go('${hash}')">
                            <span>${icon}</span>${label}
                        </button>
                    `).join('')}
                </nav>
                <button class="sidebar-user" onclick="go('#/app/profila')" style="background:white;text-align:left">
                    <span class="avatar">${state.user?.initials || 'JU'}</span>
                    <span>
                        <strong>${escapeHtml(state.user?.name || 'Jon Urrutia')}</strong><br>
                        <small style="color:#9ca3af;font-weight:800">Maila ${state.user?.level || 5} · ${state.user?.points || 1240} pts</small>
                    </span>
                </button>
            </aside>
            <main class="main">
                <header class="topbar">
                    <div><h1>${title}</h1><p>${subtitle}</p></div>
                    <div class="actions-row">
                        <button class="btn secondary small">🔔 3</button>
                        <button class="avatar" onclick="go('#/app/profila')">${state.user?.initials || 'JU'}</button>
                    </div>
                </header>
                <section class="content">${content}</section>
            </main>
        </div>
    `;
    matomoPage(title);
}

function renderKpis(stats) {
    return stats.map(s => `
        <article class="card kpi">
            <div>
                <small>${escapeHtml(s.label)}</small>
                <strong class="color-${s.color}">${escapeHtml(s.value)}</strong>
                <span class="sub">${escapeHtml(s.sub)}</span>
            </div>
            <div class="kpi-icon bg-${s.color}">${s.icon}</div>
        </article>
    `).join('');
}

function renderTrips(trips) {
    return `
        <div class="card">
            <div class="page-title"><div><h2>Azken bidaiak</h2><p>Zure mugimendu jasangarriak</p></div></div>
            <table class="table">
                <thead><tr><th>Modua</th><th>Ibilbidea</th><th>Km</th><th>CO₂</th><th>Data</th><th>Puntuak</th></tr></thead>
                <tbody>
                    ${trips.map(t => `
                        <tr>
                            <td>${t.icon} ${escapeHtml(t.mode)}</td>
                            <td>${escapeHtml(t.from)} → ${escapeHtml(t.to)}</td>
                            <td>${escapeHtml(t.km)}</td>
                            <td><span class="badge">${escapeHtml(t.co2)}</span></td>
                            <td>${escapeHtml(t.date)}</td>
                            <td class="color-yellow">${escapeHtml(t.points)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderChart(data, field, label) {
    const max = Math.max(...data.map(item => Number(item[field])));
    return `
        <div class="chart-bars">
            ${data.map(item => {
        const height = Math.max(12, (Number(item[field]) / max) * 190);
        return `
                    <div class="bar-wrap">
                        <strong>${item[field]}</strong>
                        <div class="bar" style="--h:${height}px"></div>
                        <small>${escapeHtml(item.month)}</small>
                    </div>
                `;
    }).join('')}
        </div>
        <p style="color:#6b7280;font-weight:700;margin:12px 0 0">${label}</p>
    `;
}

function renderHome() {
    const d = state.dashboard;
    const content = `
        <section class="grid-4" style="margin-bottom:22px">${renderKpis(d.stats)}</section>
        <section class="grid-3" style="margin-bottom:22px">
            <article class="card" style="grid-column:span 2">
                <div class="page-title"><div><h2>Gomendatutako ibilbidea</h2><p>Ibilbide efizientea / CO₂ gutxiago</p></div><span class="badge">Ibilbide berdea</span></div>
                <div class="route">
                    <strong>${escapeHtml(d.recommendedRoute.from)}</strong>
                    ${d.recommendedRoute.steps.map(s => `<span class="route-step">${s.icon} ${escapeHtml(s.label)} · ${escapeHtml(s.detail)}</span>`).join('')}
                    <strong>${escapeHtml(d.recommendedRoute.to)}</strong>
                </div>
                <div class="grid-3" style="margin-top:18px">
                    <div class="card soft"><small class="label">Iraupena</small><strong>${d.recommendedRoute.duration}</strong></div>
                    <div class="card soft"><small class="label">Distantzia</small><strong>${d.recommendedRoute.distance}</strong></div>
                    <div class="card soft"><small class="label">CO₂</small><strong class="color-green">${d.recommendedRoute.co2}</strong></div>
                </div>
            </article>
            <article class="card">
                <h2 style="margin-top:0">Gaurko ekintza</h2>
                <p style="color:#6b7280;font-weight:700">Hasi bidaia bat eta irabazi puntu gehiago.</p>
                <button class="btn" style="width:100%;margin-top:12px" onclick="go('#/app/bidaia')">▶ Bidaia hasi</button>
                <button class="btn secondary" style="width:100%;margin-top:10px" onclick="go('#/app/karpoola')">🚗 Karpoola bilatu</button>
            </article>
        </section>
        <section class="grid-2">
            ${renderTrips(d.recentTrips)}
            <article class="card">
                <div class="page-title"><div><h2>CO₂ eboluzioa</h2><p>Azken 6 hilabeteak</p></div></div>
                ${renderChart(d.monthlyStats, 'co2', 'Zenbat eta baxuago, orduan eta hobea.')}
            </article>
        </section>
    `;
    shell('home', content);
}

function renderTracking() {
    const tracking = state.tracking;
    const content = `
        <section class="grid-3">
            <article class="card" style="grid-column:span 2">
                <div class="page-title">
                    <div><h2>Bidaia trakeatua</h2><p>Aukeratu garraiobidea eta hasi simulazioa</p></div>
                    <span class="badge ${tracking?.active ? '' : 'warning'}">${tracking?.active ? 'Aktibo' : 'Geldituta'}</span>
                </div>
                <div class="grid-4" style="margin-bottom:18px">
                    <button class="btn secondary" onclick="startTracking('Oinez')">🚶 Oinez</button>
                    <button class="btn secondary" onclick="startTracking('Bizikleta')">🚲 Bizikleta</button>
                    <button class="btn secondary" onclick="startTracking('Autobusa')">🚌 Autobusa</button>
                    <button class="btn secondary" onclick="startTracking('Karpoola')">🚗 Karpoola</button>
                </div>
                <div class="grid-4">
                    <div class="card soft"><small class="label">Modua</small><strong>${tracking?.mode || 'Autobusa'}</strong></div>
                    <div class="card soft"><small class="label">Distantzia</small><strong>${tracking?.distance || '0.0 km'}</strong></div>
                    <div class="card soft"><small class="label">Iraupena</small><strong>${tracking?.duration || '00:00'}</strong></div>
                    <div class="card soft"><small class="label">Puntuak</small><strong class="color-yellow">${tracking?.points || 0}</strong></div>
                </div>
                <div class="actions-row" style="margin-top:20px">
                    <button class="btn" onclick="startTracking('Autobusa')">▶ Hasi</button>
                    <button class="btn danger" onclick="stopTracking()">■ Amaitu</button>
                </div>
            </article>
            <article class="card bg-green" style="border-color:#bbf7d0">
                <h2 style="margin-top:0">GPS simulazioa</h2>
                <p style="font-weight:700;color:#166534">Pantaila hau prest dago gero GPS edo backend erreala konektatzeko.</p>
                <div style="font-size:90px;text-align:center;margin:30px 0">🗺️</div>
                <span class="badge">Matomo event: tracking</span>
            </article>
        </section>
    `;
    shell('tracking', content);
}

async function startTracking(mode) {
    state.tracking = await api(`/api/tracking/start?mode=${encodeURIComponent(mode)}`, { method: 'POST' });
    matomoEvent('Tracking', 'start', mode);
    showToast(`${mode} bidaia hasita`);
    renderTracking();
}

async function stopTracking() {
    state.tracking = await api('/api/tracking/stop', { method: 'POST' });
    matomoEvent('Tracking', 'stop', state.tracking.mode);
    showToast(`Bidaia amaituta: ${state.tracking.points} puntu`);
    renderTracking();
}

function renderCarpool() {
    const isSearch = state.carpoolTab === 'bilatu';
    const content = `
        <div class="search-row">
            <div class="tabs">
                <button class="${isSearch ? 'active' : ''}" onclick="setCarpoolTab('bilatu')">🔍 Bilatu bidaiariak</button>
                <button class="${!isSearch ? 'active' : ''}" onclick="setCarpoolTab('eskaini')">🚗 Nire bidaia eskaini</button>
            </div>
            ${isSearch ? '<input style="max-width:320px" id="riderSearch" placeholder="Bilatu izena edo ibilbidea..." oninput="filterRiders()">' : ''}
        </div>
        <section id="carpoolContent">
            ${isSearch ? renderRiderCards(state.riders) : renderOfferTrip()}
        </section>
    `;
    shell('carpool', content);
}

function renderRiderCards(riders) {
    return `
        <p class="label" style="margin-bottom:14px">${riders.length} pertsona gertu</p>
        <div class="grid-3">
            ${riders.map(r => `
                <article class="card">
                    <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
                        <div style="display:flex;gap:12px;align-items:center">
                            <span class="avatar">${escapeHtml(r.initials)}</span>
                            <div><strong>${escapeHtml(r.name)}</strong><br><small style="color:#9ca3af;font-weight:800">${escapeHtml(r.department)}</small></div>
                        </div>
                        <span class="badge warning">⭐ ${r.rating}</span>
                    </div>
                    <div class="card soft" style="margin:16px 0">
                        <strong>${escapeHtml(r.trip)}</strong><br>
                        <small style="color:#6b7280;font-weight:800">🕘 ${escapeHtml(r.time)} · 📍 ${escapeHtml(r.distance)} ${r.electric ? '· ⚡ EV' : ''}</small>
                    </div>
                    <button class="btn" style="width:100%" onclick="joinRide('${escapeHtml(r.name)}')">Bidaiari batu</button>
                </article>
            `).join('')}
        </div>
    `;
}

function renderOfferTrip() {
    return `
        <section class="grid-2">
            <form class="card" onsubmit="offerTrip(event)">
                <h2 style="margin-top:0">Nire ibilbidea eskaini</h2>
                <div class="form-group"><label>Abiapuntua</label><input value="Bilbo, Abando"></div>
                <div class="form-group"><label>Helburua</label><input value="Getxo, Las Arenas"></div>
                <div class="grid-2">
                    <div class="form-group"><label>Ordua</label><input type="time" value="08:30"></div>
                    <div class="form-group"><label>Leku libre</label><select><option>1 leku</option><option>2 leku</option><option>3 leku</option></select></div>
                </div>
                <button class="btn" style="width:100%">Argitaratu bidaia</button>
            </form>
            <article class="card bg-green" style="border-color:#bbf7d0">
                <h2 style="margin-top:0">Karpoola abantailak</h2>
                <p style="font-weight:800;color:#166534">Gastu txikiagoa, CO₂ gutxiago eta puntu gehiago erabiltzaileentzat.</p>
                <ul style="font-weight:800;color:#166534;line-height:2">
                    <li>Gastuaren %50 aurreztea</li>
                    <li>CO₂ isuria erdira murriztea</li>
                    <li>Langileen arteko harremanak sendotzea</li>
                    <li>EcoMove puntuak lortzea</li>
                </ul>
            </article>
        </section>
    `;
}

function setCarpoolTab(tab) {
    state.carpoolTab = tab;
    matomoEvent('Carpool', 'tab', tab);
    renderCarpool();
}

function filterRiders() {
    const value = document.getElementById('riderSearch').value.toLowerCase();
    const filtered = state.riders.filter(r =>
        r.name.toLowerCase().includes(value) ||
        r.trip.toLowerCase().includes(value) ||
        r.department.toLowerCase().includes(value)
    );
    document.getElementById('carpoolContent').innerHTML = renderRiderCards(filtered);
}

function joinRide(name) {
    matomoEvent('Carpool', 'join', name);
    showToast(`${name} erabiltzailearen bidaian batu zara`);
}

function offerTrip(event) {
    event.preventDefault();
    matomoEvent('Carpool', 'offer', 'publish');
    showToast('Bidaia argitaratu da');
}

function renderTransport() {
    const route = state.dashboard.recommendedRoute;
    const content = `
        <section class="grid-3">
            <div style="grid-column:span 2;display:grid;gap:18px">
                <article class="card">
                    <div class="page-title"><div><h2>Gomendatutako ibilbidea</h2><p>Denbora eta CO₂ gutxiago</p></div><span class="badge">Ibilbide berdea</span></div>
                    <div class="route"><strong>${route.from}</strong>${route.steps.map(s => `<span class="route-step">${s.icon} ${s.label} · ${s.detail}</span>`).join('')}<strong>${route.to}</strong></div>
                    <div class="grid-3" style="margin-top:18px">
                        <div class="card soft"><small class="label">Iraupena</small><strong>${route.duration}</strong></div>
                        <div class="card soft"><small class="label">Distantzia</small><strong>${route.distance}</strong></div>
                        <div class="card soft"><small class="label">CO₂</small><strong class="color-green">${route.co2}</strong></div>
                    </div>
                </article>
                <article class="card" style="padding:0;overflow:hidden">
                    <div style="padding:22px"><h2 style="margin:0">Hurbileko lineak</h2></div>
                    <table class="table">
                        <thead><tr><th>Linea</th><th>Ibilbidea</th><th>Geltokiak</th><th>Hurrengoa</th><th>Egoera</th></tr></thead>
                        <tbody>
                            ${state.lines.map(line => `
                                <tr onclick="selectLine('${line.id}')" style="cursor:pointer">
                                    <td><span class="badge" style="background:${line.color}22;color:${line.color}">${line.id}</span></td>
                                    <td>${escapeHtml(line.name)}</td>
                                    <td>${line.stops}</td>
                                    <td><strong>${line.minutes} min</strong></td>
                                    <td><span class="badge ${line.status === 'garaiz' ? '' : 'warning'}">${line.status === 'garaiz' ? 'Garaiz' : 'Atzeratua'}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </article>
            </div>
            <aside style="display:grid;gap:18px;align-content:start">
                <form class="card" onsubmit="searchRoute(event)">
                    <h2 style="margin-top:0">Helburua bilatu</h2>
                    <div class="form-group"><label>Nondik</label><input value="Bilbo, Abando"></div>
                    <div class="form-group"><label>Nora</label><input value="Getxo, Las Arenas"></div>
                    <button class="btn" style="width:100%">Ibilbidea bilatu</button>
                </form>
                <article class="card bg-blue" style="border-color:#bae6fd">
                    <strong>🔵 Bilboko Metroa</strong>
                    <p style="font-weight:700;color:#075985">M1: Basauri ↔ Plentzia · M2: Basauri ↔ Santurtzi. Denbora errealeko informazioa.</p>
                </article>
            </aside>
        </section>
    `;
    shell('transport', content);
}

function searchRoute(event) {
    event.preventDefault();
    matomoEvent('Transport', 'search_route', 'recommended');
    showToast('Ibilbide berdea aurkitu da');
}

function selectLine(id) {
    matomoEvent('Transport', 'select_line', id);
    const line = state.lines.find(item => item.id === id);
    showToast(`${line.name}: ${line.minutes} min`);
}

function renderRewards() {
    const cats = ['Guztiak', 'Janaria', 'Garraioa', 'Erosketak', 'Natura', 'Aisia', 'Osasuna'];
    const filtered = state.activeRewardCategory === 'Guztiak'
        ? state.rewards
        : state.rewards.filter(r => r.category === state.activeRewardCategory);

    const content = `
        <div class="banner">
            <div><p style="font-weight:800;margin:0 0 4px;color:#fef3c7">Nire saldo osoa</p><h2>1.240 puntu</h2><p style="font-weight:800;margin:6px 0 0;color:#fef3c7">+180 aste honetan</p></div>
            <div class="actions-row"><span class="feature-pill">Hurrengo saria: Bizikleta %15</span><span class="feature-pill">Historikoa: 3.840 pts</span></div>
        </div>
        <div class="actions-row" style="margin-bottom:18px">
            ${cats.map(cat => `<button class="btn small ${state.activeRewardCategory === cat ? 'warning' : 'secondary'}" onclick="setRewardCategory('${cat}')">${cat}</button>`).join('')}
        </div>
        <section class="grid-4" style="margin-bottom:22px">
            ${filtered.map(r => `
                <article class="reward-card">
                    <div class="emoji">${r.emoji}</div>
                    <h3>${escapeHtml(r.title)}</h3>
                    <p style="color:#9ca3af;font-weight:800">${escapeHtml(r.category)}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px">
                        <strong class="color-yellow">⭐ ${r.points}</strong>
                        <button class="btn small" onclick="redeemReward('${escapeHtml(r.title)}')">Trukatu</button>
                    </div>
                </article>
            `).join('')}
        </section>
        <article class="card">
            <h2 style="margin-top:0">Nire txapelak</h2>
            <div class="actions-row">
                ${['🌱 Ernari', '🚲 Biziklaria', '☀️ Ekologista', '🏆 Liderra', '🌍 Herritarra', '🔒 Bidaiari Pro'].map(b => `<span class="badge warning" style="font-size:16px;padding:12px 14px">${b}</span>`).join('')}
            </div>
        </article>
    `;
    shell('rewards', content);
}

function setRewardCategory(category) {
    state.activeRewardCategory = category;
    matomoEvent('Rewards', 'filter', category);
    renderRewards();
}

function redeemReward(title) {
    matomoEvent('Rewards', 'redeem', title);
    showToast(`${title} saria trukatzeko eskaera sortu da`);
}

function renderStats() {
    const d = state.dashboard;
    const content = `
        <section class="grid-4" style="margin-bottom:22px">${renderKpis(d.stats)}</section>
        <section class="grid-2">
            <article class="card">
                <div class="page-title"><div><h2>CO₂ isurketak</h2><p>Aurtengo eboluzioa</p></div></div>
                ${renderChart(d.monthlyStats, 'co2', 'CO₂ kg hilabeteka')}
            </article>
            <article class="card">
                <div class="page-title"><div><h2>Km garbiak</h2><p>Autorik gabe egindako kilometroak</p></div></div>
                ${renderChart(d.monthlyStats, 'km', 'Km garbiak hilabeteka')}
            </article>
        </section>
        <section class="grid-2" style="margin-top:18px">
            <article class="card">
                <h2 style="margin-top:0">Garraio erabilera</h2>
                <div class="progress-list">
                    ${d.transportShare.map(t => `<div><div style="display:flex;justify-content:space-between;font-weight:900"><span>${t.name}</span><span>${t.value}%</span></div><div class="progress-line"><span style="--w:${t.value}%"></span></div></div>`).join('')}
                </div>
            </article>
            <article class="card bg-green" style="border-color:#bbf7d0">
                <h2 style="margin-top:0">Inpaktu laburpena</h2>
                <p style="font-weight:800;color:#166534;line-height:1.8">Zure 847 kg CO₂ aurrezpenak erakusten du aplikazioaren erabilerak inpaktu zuzena izan dezakeela mugikortasun jasangarrian.</p>
                <button class="btn" onclick="exportStats()">⬇ Esportatu datuak</button>
            </article>
        </section>
    `;
    shell('stats', content);
}

function exportStats() {
    matomoEvent('Stats', 'export', 'user_stats');
    showToast('Datuak esportatzeko ekintza simulatu da');
}

function renderProfile() {
    const u = state.user || state.dashboard.user;
    const content = `
        <section class="grid-3">
            <article class="card">
                <div style="text-align:center">
                    <div class="avatar" style="width:86px;height:86px;margin:auto;font-size:26px">${escapeHtml(u.initials)}</div>
                    <h2>${escapeHtml(u.name)}</h2>
                    <p style="color:#6b7280;font-weight:800">${escapeHtml(u.email)}</p>
                    <span class="badge">🏆 Maila ${u.level} · ${escapeHtml(u.badge)}</span>
                </div>
                <div class="grid-3" style="margin-top:22px">
                    <div class="card soft"><small class="label">Bidaiak</small><strong>${u.trips}</strong></div>
                    <div class="card soft"><small class="label">CO₂</small><strong>${u.co2Saved}</strong></div>
                    <div class="card soft"><small class="label">Puntuak</small><strong>${u.points}</strong></div>
                </div>
            </article>
            <div style="grid-column:span 2;display:grid;gap:18px">
                ${settingsGroup('Kontua', [
        ['👤', 'Nire datu pertsonalak', 'Izena, helbidea, telefonoa'],
        ['🏢', `Erakundea: ${u.organization}`, u.department],
        ['🔔', 'Jakinarazpenak', 'Push eta email alertak']
    ])}
                ${settingsGroup('Pribatutasuna eta Segurtasuna', [
        ['📍', 'Kokapena eta GPS', 'Bidai trakeatua'],
        ['🛡️', 'Datuen partekatzea', 'Enpresarekin eta hirugarrenekin']
    ])}
                ${settingsGroup('Aplikazioa', [
        ['🌍', 'Hizkuntza: Euskara', 'Euskara · Castellano · English'],
        ['📈', 'Panel korporatiboa', 'Langile estatistikak']
    ])}
                <button class="btn danger" onclick="logout()">🚪 Saioa itxi</button>
            </div>
        </section>
    `;
    shell('profile', content);
}

function settingsGroup(title, items) {
    return `
        <article class="card" style="padding:0;overflow:hidden">
            <p class="label" style="padding:18px 22px 0;margin:0">${title}</p>
            ${items.map(item => `
                <button onclick="showToast('${escapeHtml(item[1])}')" style="width:100%;background:white;display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-top:1px solid #f3f4f6;text-align:left">
                    <span style="display:flex;gap:12px;align-items:center"><span class="kpi-icon bg-green">${item[0]}</span><span><strong>${escapeHtml(item[1])}</strong><br><small style="color:#9ca3af;font-weight:800">${escapeHtml(item[2])}</small></span></span>
                    <span>›</span>
                </button>
            `).join('')}
        </article>
    `;
}

function logout() {
    matomoEvent('Auth', 'logout', 'profile');
    showToast('Saioa itxita');
    go('#/');
}

function renderCorporate() {
    const c = state.corporate;
    const content = `
        <section class="grid-4" style="margin-bottom:22px">
            ${c.kpis.map(k => `
                <article class="card kpi bg-${k.color}" style="box-shadow:none">
                    <div><small>${k.label}</small><strong class="color-${k.color}">${k.value}</strong><span class="sub">${k.delta}</span></div>
                    <div class="kpi-icon" style="background:white">${k.icon}</div>
                </article>
            `).join('')}
        </section>
        <section class="grid-2" style="margin-bottom:22px">
            <article class="card">
                <div class="page-title"><div><h2>CO₂ murrizketa</h2><p>Enpresako joera</p></div><button class="btn secondary small" onclick="exportCorporate()">⬇ Esportatu</button></div>
                ${renderChart(c.monthlyStats, 'co2', 'CO₂ kg enpresa mailan')}
            </article>
            <article class="card">
                <div class="page-title"><div><h2>Langile aktiboak</h2><p>Erabiltzaile hazkundea</p></div></div>
                ${renderChart(c.monthlyStats, 'employees', 'Langile aktiboak hilabeteka')}
            </article>
        </section>
        <section class="grid-3">
            <article class="card" style="grid-column:span 2;padding:0;overflow:hidden">
                <div style="padding:22px"><h2 style="margin:0">Top langile jasangarriak</h2></div>
                <table class="table">
                    <thead><tr><th>#</th><th>Langilea</th><th>Saila</th><th>Bidaiak</th><th>CO₂</th><th>Puntuak</th></tr></thead>
                    <tbody>
                        ${c.topEmployees.map(e => `
                            <tr><td>${e.rank}</td><td><span class="badge">${e.initials}</span> ${e.name}</td><td>${e.department}</td><td>${e.trips}</td><td><span class="badge">${e.co2Saved}</span></td><td class="color-yellow">${e.points}</td></tr>
                        `).join('')}
                    </tbody>
                </table>
            </article>
            <article class="card">
                <h2 style="margin-top:0">Sailen parte-hartzea</h2>
                <div class="progress-list">
                    ${c.departments.map(d => `<div><div style="display:flex;justify-content:space-between;font-weight:900"><span>${d.name}</span><span>${d.employees} · ${d.percentage}%</span></div><div class="progress-line"><span style="--w:${d.percentage}%"></span></div></div>`).join('')}
                </div>
            </article>
        </section>
    `;
    shell('corporate', content);
}

function exportCorporate() {
    matomoEvent('Corporate', 'export', 'dashboard');
    showToast('Enpresako datuak esportatzeko ekintza simulatu da');
}

async function renderAppPage(pageKey) {
    try {
        await ensureData();
        const renderers = {
            home: renderHome,
            tracking: renderTracking,
            carpool: renderCarpool,
            transport: renderTransport,
            rewards: renderRewards,
            stats: renderStats,
            profile: renderProfile,
            corporate: renderCorporate
        };
        renderers[pageKey]();
    } catch (error) {
        app.innerHTML = `<div class="content"><div class="card"><h1>Error cargando datos</h1><p>${escapeHtml(error.message)}</p></div></div>`;
    }
}

function router() {
    const hash = location.hash || '#/';

    if (hash === '#/' || hash === '') return renderWelcome();
    if (hash === '#/login') return renderLogin();
    if (hash === '#/register') return renderRegister();

    const pageKey = routes[hash] || 'home';
    return renderAppPage(pageKey);
}

window.addEventListener('hashchange', router);
window.go = go;
window.login = login;
window.register = register;
window.startTracking = startTracking;
window.stopTracking = stopTracking;
window.setCarpoolTab = setCarpoolTab;
window.filterRiders = filterRiders;
window.joinRide = joinRide;
window.offerTrip = offerTrip;
window.searchRoute = searchRoute;
window.selectLine = selectLine;
window.setRewardCategory = setRewardCategory;
window.redeemReward = redeemReward;
window.exportStats = exportStats;
window.exportCorporate = exportCorporate;
window.logout = logout;
window.showToast = showToast;

router();
