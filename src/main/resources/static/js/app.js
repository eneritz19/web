const app = document.getElementById('app');

const state = {
    user: JSON.parse(localStorage.getItem('ecomoveUser') || 'null'),
    dashboard: null,
    riders: [],
    lines: [],
    transportStops: [],
    rewards: [],
    corporate: null,
    companies: [],
    carModels: [],
    tracking: null,
    trackingSessionId: null,
    trackingTimer: null,
    lastLocation: null,
    trackingLocationCount: 0,
    activeRewardCategory: 'Guztiak',
    carpoolTab: 'bilatu'
};

const titles = {
    home: ['Hasiera', 'Zure datu pertsonalizatuak CSV fitxategietatik'],
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

function currentUserId() {
    return state.user?.id;
}

function requireLogin() {
    if (!currentUserId()) {
        go('#/login');
        throw new Error('Para entrar primero tienes que iniciar sesión');
    }
}

async function loadCatalogs() {
    const tasks = [];
    if (!state.companies.length) tasks.push(api('/api/catalog/companies').then(data => state.companies = data));
    if (!state.carModels.length) tasks.push(api('/api/catalog/car-models').then(data => state.carModels = data));
    await Promise.all(tasks);
}

function clearLoadedData() {
    state.dashboard = null;
    state.riders = [];
    state.corporate = null;
}

async function ensureData() {
    requireLogin();
    const userId = currentUserId();
    const tasks = [];
    if (!state.dashboard) tasks.push(api(`/api/dashboard?userId=${userId}`).then(data => state.dashboard = data));
    if (!state.riders.length) tasks.push(api(`/api/riders?userId=${userId}`).then(data => state.riders = data));
    if (!state.lines.length) tasks.push(api('/api/transport-lines').then(data => state.lines = data));
    if (!state.transportStops.length) {
        tasks.push(Promise.all([
            api('/api/transport-stops?proveedor=Ekialdebus&limit=8'),
            api('/api/transport-stops?proveedor=Euskotren&limit=8'),
            api('/api/transport-stops?proveedor=Bizkaibus&limit=8')
        ]).then(groups => state.transportStops = groups.flat()));
    }
    if (!state.rewards.length) tasks.push(api('/api/rewards').then(data => state.rewards = data));
    if (!state.corporate) tasks.push(api(`/api/corporate?userId=${userId}`).then(data => state.corporate = data));
    await Promise.all(tasks);
    state.user = state.dashboard.user;
    localStorage.setItem('ecomoveUser', JSON.stringify(state.user));
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
                    <p>Orain datuak erabiltzaile bakoitzaren CSVetatik kargatzen dira.</p>
                    <div style="display:grid;gap:12px;margin-top:28px">
                        <div class="feature-pill">👤 Probako erabiltzailea: jonu / 123456</div>
                        <div class="feature-pill">👤 Beste erabiltzailea: anez / 123456</div>
                        <div class="feature-pill">📊 Estatistikak ez dira berdinak erabiltzaile guztientzat</div>
                    </div>
                </div>
                <p style="font-size:12px">© 2026 EcoMove · Bilbo, Euskadi</p>
            </div>
            <div class="auth-right">
                <form class="auth-box" onsubmit="login(event)">
                    <h2>Sartu</h2>
                    <p>Zure kontuan sartu</p>
                    <div class="form-group">
                        <label>Nombre de usuario</label>
                        <input name="nombreUsuario" value="jonu" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input name="contrasena" type="password" value="123456" required>
                    </div>
                    <button class="btn" style="width:100%">Sartu</button>
                    <p style="text-align:center;margin-top:24px">Ez duzu konturik? <a href="#/register">Erregistratu</a></p>
                </form>
            </div>
        </section>
    `;
}

async function renderRegister() {
    matomoPage('Register');
    await loadCatalogs();
    const companyOptions = state.companies.map(company => `
        <option value="${company.empresaID}">${escapeHtml(company.nombre)}</option>
    `).join('');
    const carOptions = state.carModels
        .filter(car => car.modeloCocheID !== 'SIN_COCHE')
        .map(car => `<option value="${escapeHtml(car.modeloCocheID)}">${escapeHtml(car.marca)} ${escapeHtml(car.modelo)} · ${escapeHtml(car.tipo)}</option>`)
        .join('');

    app.innerHTML = `
        <section class="auth-page">
            <div class="auth-left">
                <button class="logo" style="border:0;padding:0;color:white;background:transparent" onclick="go('#/')"><span class="logo-icon" style="background:rgba(255,255,255,.18)">🌿</span> EcoMove</button>
                <div>
                    <div style="font-size:80px;margin-bottom:18px">🚀</div>
                    <h2>Batu gure<br>komunitateari</h2>
                    <p>Erregistroan aukeratutako enpresa eta autoa CSVtik irakurtzen dira.</p>
                    <div class="grid-2" style="margin-top:28px">
                        <div class="feature-pill">🏢 Empresas desde empresas.csv</div>
                        <div class="feature-pill">🚗 Coches desde coches.csv</div>
                        <div class="feature-pill">💾 Usuario guardado en usuarios.csv</div>
                        <div class="feature-pill">📊 Datos personalizados</div>
                    </div>
                </div>
                <p style="font-size:12px">EcoMove prototipo sinplifikatua</p>
            </div>
            <div class="auth-right">
                <form class="auth-box" onsubmit="register(event)">
                    <h2>Kontua sortu</h2>
                    <p>Formulario conectado a CSV</p>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Nombre</label>
                            <input name="nombre" value="Nerea" required>
                        </div>
                        <div class="form-group">
                            <label>Apellidos</label>
                            <input name="apellidos" value="Mendizabal" required>
                        </div>
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Nombre de usuario</label>
                            <input name="nombreUsuario" value="nerea" required>
                        </div>
                        <div class="form-group">
                            <label>Contraseña</label>
                            <input name="contrasena" type="password" value="123456" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input name="email" type="email" value="nerea@ecomove.eus">
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Empresa</label>
                            <select name="empresaID" required>${companyOptions}</select>
                        </div>
                        <div class="form-group">
                            <label>Pueblo / Ciudad</label>
                            <input name="puebloCiudad" value="Bilbo" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>¿Tiene coche?</label>
                        <select name="tieneCoche" onchange="toggleCarFields(this.value)">
                            <option value="false">No</option>
                            <option value="true">Sí</option>
                        </select>
                    </div>
                    <div class="form-group hidden" id="carModelGroup">
                        <label>Modelo de coche</label>
                        <select name="modeloCocheID">${carOptions}</select>
                    </div>
                    <button class="btn" style="width:100%">Sortu kontua</button>
                    <p style="text-align:center;margin-top:24px">Baduzu kontua? <a href="#/login">Sartu</a></p>
                </form>
            </div>
        </section>
    `;
}

function toggleCarFields(value) {
    const group = document.getElementById('carModelGroup');
    if (group) group.classList.toggle('hidden', value !== 'true');
}

async function login(event) {
    event.preventDefault();

    const form = new FormData(event.target);

    const data = {
        nombreUsuario: form.get('nombreUsuario'),
        contrasena: form.get('contrasena')
    };

    try {
        const response = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            showToast(response.message || 'Usuario o contraseña incorrectos');
            return;
        }

        state.user = response.user;
        localStorage.setItem('ecomoveUser', JSON.stringify(state.user));
        clearLoadedData();

        matomoEvent('Auth', 'login', data.nombreUsuario);
        showToast(response.message || 'Login correcto');
        go('#/app');

    } catch (error) {
        console.error('Login error:', error);
        showToast('Usuario o contraseña incorrectos');
    }
}

async function register(event) {
    event.preventDefault();

    const form = new FormData(event.target);
    const tieneCoche = form.get('tieneCoche') === 'true';

    const data = {
        empresaID: Number(form.get('empresaID')),
        nombre: form.get('nombre'),
        apellidos: form.get('apellidos'),
        nombreUsuario: form.get('nombreUsuario'),
        contrasena: form.get('contrasena'),
        email: form.get('email'),
        tieneCoche,
        modeloCocheID: tieneCoche ? form.get('modeloCocheID') : 'SIN_COCHE',
        puebloCiudad: form.get('puebloCiudad')
    };

    try {
        const response = await api('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            showToast(response.message || 'No se pudo crear la cuenta');
            return;
        }

        state.user = response.user;
        localStorage.setItem('ecomoveUser', JSON.stringify(state.user));
        clearLoadedData();

        matomoEvent('Auth', 'register', data.nombreUsuario);
        showToast(response.message || 'Cuenta creada');
        go('#/app');

    } catch (error) {
        console.error('Register error:', error);
        showToast('No se pudo crear la cuenta');
    }
}

function shell(pageKey, content) {
    let [title, subtitle] = titles[pageKey] || titles.home;
    if (pageKey === 'home' && state.user) {
        title = `Kaixo, ${state.user.name.split(' ')[0]} 👋`;
        subtitle = `${state.user.organization} · ${state.user.puebloCiudad}`;
    }
    if (pageKey === 'rewards' && state.user) {
        subtitle = `${state.user.points} puntu eskuragarri`;
    }
    if (pageKey === 'corporate' && state.user) {
        subtitle = `${state.user.organization} · CSV datuetatik`;
    }
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
                        <small style="color:#9ca3af;font-weight:800">Maila ${state.user?.level || 1} · ${state.user?.points || 0} pts</small>
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
    if (!data || !data.length) {
        return `<p style="color:#6b7280;font-weight:700">Oraindik ez dago daturik erabiltzaile honentzat.</p>`;
    }
    const max = Math.max(1, ...data.map(item => Number(item[field])));
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
    const last = state.lastLocation;
    const content = `
        <section class="grid-3">
            <article class="card" style="grid-column:span 2">
                <div class="page-title">
                    <div>
                        <h2>Bidaia trakeatua</h2>
                        <p>GPS erreala erabiliz. Garraiobidea ez da erabiltzaileari eskatzen; beste aplikazio batek kalkulatuko du.</p>
                    </div>
                    <span class="badge ${tracking?.active ? '' : 'warning'}">${tracking?.active ? 'Aktibo' : 'Geldituta'}</span>
                </div>
                <div class="grid-4">
                    <div class="card soft"><small class="label">Modua</small><strong>${tracking?.mode || 'SIN_CALCULAR'}</strong></div>
                    <div class="card soft"><small class="label">Distantzia GPS</small><strong>${tracking?.distance || '0.0 km'}</strong></div>
                    <div class="card soft"><small class="label">Iraupena</small><strong>${tracking?.duration || '00:00'}</strong></div>
                    <div class="card soft"><small class="label">Puntuak</small><strong class="color-yellow">${tracking?.points || 0}</strong></div>
                </div>
                <div class="grid-2" style="margin-top:18px">
                    <div class="card soft"><small class="label">Session ID</small><strong style="font-size:13px;word-break:break-all">${escapeHtml(tracking?.sessionId || state.trackingSessionId || '-')}</strong></div>
                    <div class="card soft"><small class="label">Puntu GPS gordeta</small><strong>${tracking?.samples || state.trackingLocationCount || 0}</strong></div>
                </div>
                <div class="actions-row" style="margin-top:20px">
                    <button class="btn" onclick="startTracking()" ${tracking?.active ? 'disabled' : ''}>▶ Hasi bidaia</button>
                    <button class="btn danger" onclick="stopTracking()" ${tracking?.active ? '' : 'disabled'}>■ Amaitu bidaia</button>
                </div>
                <p style="color:#6b7280;font-weight:700;margin-top:16px">
                    Al empezar se guarda una primera ubicación y después una ubicación cada minuto en <code>data/ubicaciones_bidaia.csv</code>.
                </p>
            </article>
            <article class="card bg-green" style="border-color:#bbf7d0">
                <h2 style="margin-top:0">GPS erreala</h2>
                <p style="font-weight:700;color:#166534">${tracking?.active ? 'Kokapena minuturo gordetzen ari da.' : 'Sakatu “Hasi bidaia” eta baimendu kokapena.'}</p>
                <div style="font-size:90px;text-align:center;margin:24px 0">📍</div>
                <div class="card soft">
                    <small class="label">Azken kokapena</small>
                    <p style="margin-bottom:0;font-weight:800">
                        ${last ? `${last.latitude.toFixed(6)}, ${last.longitude.toFixed(6)}` : 'Oraindik ez dago kokapenik'}
                    </p>
                    <small style="color:#6b7280">${last ? escapeHtml(last.timestamp) : ''}</small>
                </div>
                <span class="badge" style="margin-top:12px">Matomo event: tracking</span>
            </article>
        </section>
    `;
    shell('tracking', content);
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Tu navegador no soporta geolocalización.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        });
    });
}

function buildLocationPayload(position, sessionId = null) {
    const coords = position.coords;
    return {
        userId: currentUserId(),
        sessionId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        speed: coords.speed,
        heading: coords.heading,
        altitude: coords.altitude,
        timestamp: new Date(position.timestamp || Date.now()).toISOString()
    };
}

function updateLastLocation(position) {
    state.lastLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp || Date.now()).toLocaleString()
    };
}

function stopLocationTimer() {
    if (state.trackingTimer) {
        clearInterval(state.trackingTimer);
        state.trackingTimer = null;
    }
}

function startLocationTimer() {
    stopLocationTimer();
    state.trackingTimer = setInterval(saveCurrentLocationPoint, 60000);
}

async function saveCurrentLocationPoint() {
    if (!state.tracking?.active || !state.trackingSessionId) {
        stopLocationTimer();
        return;
    }

    try {
        const position = await getCurrentLocation();
        updateLastLocation(position);
        state.tracking = await api('/api/tracking/location', {
            method: 'POST',
            body: JSON.stringify(buildLocationPayload(position, state.trackingSessionId))
        });
        state.trackingLocationCount = state.tracking.samples || state.trackingLocationCount + 1;

        if (routes[location.hash] === 'tracking') {
            renderTracking();
        }
    } catch (error) {
        showToast('No se ha podido guardar la ubicación: ' + error.message);
    }
}

async function startTracking() {
    requireLogin();

    if (state.tracking?.active) {
        showToast('Ya hay una bidaia activa');
        return;
    }

    try {
        const position = await getCurrentLocation();
        updateLastLocation(position);
        state.tracking = await api('/api/tracking/start', {
            method: 'POST',
            body: JSON.stringify(buildLocationPayload(position))
        });
        state.trackingSessionId = state.tracking.sessionId;
        state.trackingLocationCount = state.tracking.samples || 1;
        startLocationTimer();
        matomoEvent('Tracking', 'start', 'gps');
        showToast('Bidaia hasita. Kokapena minuturo gordeko da.');
        renderTracking();
    } catch (error) {
        showToast('No se ha podido iniciar el GPS: ' + error.message);
    }
}

async function stopTracking() {
    requireLogin();

    if (!state.tracking?.active || !state.trackingSessionId) {
        showToast('Ez dago bidaia aktiborik');
        return;
    }

    try {
        // Guardamos una última ubicación justo antes de terminar.
        await saveCurrentLocationPoint();
    } catch { }

    stopLocationTimer();
    const userId = currentUserId();
    const sessionId = state.trackingSessionId;
    state.tracking = await api(`/api/tracking/stop?userId=${userId}&sessionId=${encodeURIComponent(sessionId)}`, { method: 'POST' });
    state.trackingSessionId = null;
    state.trackingLocationCount = state.tracking.samples || 0;
    clearLoadedData();
    matomoEvent('Tracking', 'stop', 'gps');
    showToast('Bidaia amaituta. Kokapenak CSVn gordeta eta bidaia SIN_CALCULAR moduan sortuta.');
    await ensureData();
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
    const u = state.user || {};
    if (!u.tieneCoche) {
        return `
            <article class="card bg-green" style="border-color:#bbf7d0">
                <h2 style="margin-top:0">Ezin duzu bidaia eskaini</h2>
                <p style="font-weight:800;color:#166534;line-height:1.8">
                    Zure erabiltzaileak ez dauka autorik erregistratuta. Hau register formularioan gordetzen da
                    <strong>data/usuarios.csv</strong> fitxategian, <strong>tieneCoche</strong> zutabean.
                </p>
                <button class="btn secondary" onclick="go('#/app/profila')">Profila ikusi</button>
            </article>
        `;
    }

    return `
        <section class="grid-2">
            <form class="card" onsubmit="offerTrip(event)">
                <h2 style="margin-top:0">Nire ibilbidea eskaini</h2>
                <p class="label">Auto eredua: ${escapeHtml(u.modeloCocheID)}</p>
                <div class="form-group"><label>Abiapuntua</label><input name="from" value="${escapeHtml(u.puebloCiudad || 'Bilbo')}"></div>
                <div class="form-group"><label>Helburua</label><input name="to" value="Getxo"></div>
                <div class="grid-2">
                    <div class="form-group"><label>Ordua</label><input name="time" type="time" value="08:30"></div>
                    <div class="form-group"><label>Leku libre</label><select name="seats"><option value="1">1 leku</option><option value="2">2 leku</option><option value="3">3 leku</option></select></div>
                </div>
                <button class="btn" style="width:100%">Argitaratu bidaia</button>
            </form>
            <article class="card bg-green" style="border-color:#bbf7d0">
                <h2 style="margin-top:0">Karpoola abantailak</h2>
                <p style="font-weight:800;color:#166534">Argitaratutako bidaia <strong>data/carpool_ofertas.csv</strong> fitxategian gordeko da.</p>
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

async function joinRide(name) {
    await api(`/api/carpool/join?userId=${currentUserId()}&riderName=${encodeURIComponent(name)}`, { method: 'POST' });
    matomoEvent('Carpool', 'join', name);
    showToast(`${name} erabiltzailearen bidaian batu zara eta data/carpool_uniones.csv fitxategian gorde da`);
}

async function offerTrip(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
        from: form.get('from'),
        to: form.get('to'),
        time: form.get('time'),
        seats: Number(form.get('seats'))
    };
    await api(`/api/carpool/offers?userId=${currentUserId()}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    state.riders = [];
    matomoEvent('Carpool', 'offer', 'publish');
    showToast('Bidaia data/carpool_ofertas.csv fitxategian gorde da');
    renderCarpool();
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
                <article class="card" style="padding:0;overflow:hidden">
                    <div style="padding:22px">
                        <h2 style="margin:0">Parada errealak</h2>
                        <p style="margin:6px 0 0;color:var(--muted);font-weight:800">paradas_transporte.csv fitxategitik irakurrita</p>
                    </div>
                    <table class="table">
                        <thead><tr><th>Hornitzailea</th><th>Parada</th><th>Herria/Zona</th><th>Koordenatuak</th></tr></thead>
                        <tbody>
                            ${state.transportStops.map(stop => `
                                <tr>
                                    <td><span class="badge">${escapeHtml(stop.proveedor)}</span></td>
                                    <td>${escapeHtml(stop.nombre)}</td>
                                    <td>${escapeHtml(stop.municipio || stop.zona)}</td>
                                    <td><small>${Number(stop.latitud).toFixed(4)}, ${Number(stop.longitud).toFixed(4)}</small></td>
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
                    <strong>📍 CSV errealak</strong>
                    <p style="font-weight:700;color:#075985">Parada datuak paradas_transporte.csv fitxategitik datoz: Ekialdebus, Euskotren eta Bizkaibus.</p>
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
            <div><p style="font-weight:800;margin:0 0 4px;color:#fef3c7">Nire saldo osoa</p><h2>${state.user?.points || 0} puntu</h2><p style="font-weight:800;margin:6px 0 0;color:#fef3c7">Saldoa data/viajes.csv eta data/canjeos.csv fitxategietatik</p></div>
            <div class="actions-row"><span class="feature-pill">Sariak: recompensas.csv</span><span class="feature-pill">Canjeoak: canjeos.csv</span></div>
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
                        <button class="btn small" onclick="redeemReward(${r.id}, '${escapeHtml(r.title)}')">Trukatu</button>
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

async function redeemReward(rewardId, title) {
    const response = await api(`/api/rewards/redeem?userId=${currentUserId()}&rewardId=${rewardId}`, { method: 'POST' });
    clearLoadedData();
    await ensureData();
    matomoEvent('Rewards', 'redeem', title);
    showToast(response.message || `${title} saria trukatzeko eskaera sortu da`);
    renderRewards();
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
                <p style="font-weight:800;color:#166534;line-height:1.8">Zure ${escapeHtml(state.user?.co2Saved || '0 kg')} CO₂ aurrezpena <strong>data/viajes.csv</strong> fitxategitik kalkulatzen da.</p>
                <button class="btn" onclick="exportStats()">⬇ Esportatu datuak</button>
            </article>
        </section>
    `;
    shell('stats', content);
}

function exportStats() {
    matomoEvent('Stats', 'export', 'user_stats');
    window.open('/api/csv/trips', '_blank');
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
        ['👤', `Usuario: ${u.nombreUsuario}`, `${u.name} · ${u.email}`],
        ['🏢', `Empresa: ${u.organization}`, `empresaID: ${u.empresaID}`],
        ['📍', `Pueblo/Ciudad: ${u.puebloCiudad}`, 'Guardado en data/usuarios.csv'],
        ['🚗', u.tieneCoche ? `Coche: ${u.modeloCocheID}` : 'No tiene coche', 'Campo tieneCoche + modeloCocheID']
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
    stopLocationTimer();
    matomoEvent('Auth', 'logout', 'profile');
    localStorage.removeItem('ecomoveUser');
    state.user = null;
    clearLoadedData();
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
    window.open('/api/csv/trips', '_blank');
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
        if (!currentUserId()) {
            return renderLogin();
        }
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
window.toggleCarFields = toggleCarFields;
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
