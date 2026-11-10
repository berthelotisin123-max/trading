/* BETZO browser-only chart, screenshot, and source-link enhancements.
   This module intentionally does not claim AI analysis or live market data. */
(() => {
  const byId = id => document.getElementById(id);
  const analysis = byId('page-analysis');
  const confluenceForm = byId('confluenceForm');
  const confluenceCard = confluenceForm?.closest('.card');
  if (!analysis || !confluenceForm || !confluenceCard) return;

  const screenshotCard = document.createElement('section');
  screenshotCard.className = 'card';
  screenshotCard.style.marginTop = '16px';
  screenshotCard.innerHTML = `
    <div class="card-head">
      <div><h2><span aria-hidden="true">▧</span> Setup screenshots</h2>
        <p>Attach chart evidence to your local analysis record.</p></div>
      <span class="tag neutral">Browser only</span>
    </div>
    <label class="form-grid">Screenshots (PNG, JPG, or WebP; max 4 files, 8 MB each)
      <input id="analysisScreenshots" type="file" accept="image/png,image/jpeg,image/webp" multiple>
    </label>
    <p id="analysisScreenshotStatus" class="chart-footnote" aria-live="polite">
      Images stay in this browser. They are not uploaded or sent to an AI service.
    </p>
    <div id="analysisScreenshotPreview" class="screenshot-list"></div>`;
  confluenceCard.after(screenshotCard);

  const aiCard = document.createElement('section');
  aiCard.className = 'card';
  aiCard.style.marginTop = '16px';
  aiCard.innerHTML = `
    <div class="card-head"><div><h2><span aria-hidden="true">✦</span> AI setup analysis</h2>
      <p>Source-aware review of screenshots, chart context, and your trade thesis.</p></div>
      <span class="tag warn">Service unavailable</span></div>
    <p class="muted">No secure BETZO AI backend or licensed live data feed is connected. This prototype cannot analyze screenshots with AI or confirm a trusted setup.</p>
    <button class="btn" type="button" id="aiAvailabilityButton"><span aria-hidden="true">✦</span> Check AI availability</button>
    <p class="auth-message" id="aiAvailabilityMessage" aria-live="polite">No screenshot or trade plan has been sent to an AI provider.</p>`;
  screenshotCard.after(aiCard);
  byId('aiAvailabilityButton').addEventListener('click', () => {
    byId('aiAvailabilityMessage').textContent =
      'AI review is not configured. No analysis was run and no files left this browser.';
  });

  const upload = byId('analysisScreenshots');
  const preview = byId('analysisScreenshotPreview');
  const uploadStatus = byId('analysisScreenshotStatus');
  let selectedFiles = [];
  let objectUrls = [];

  function drawPreviews(files, message) {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls = [];
    preview.replaceChildren();
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      objectUrls.push(url);
      const item = document.createElement('div');
      item.className = 'screenshot-preview';
      const image = document.createElement('img');
      image.src = url;
      image.alt = 'Trade setup screenshot: ' + file.name;
      const label = document.createElement('small');
      label.textContent = file.name;
      item.append(image, label);
      preview.append(item);
    });
    uploadStatus.textContent = message;
  }

  upload.addEventListener('change', () => {
    const files = Array.from(upload.files || []);
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (files.length > 4 || files.some(file =>
      !validTypes.includes(file.type) || file.size > 8 * 1024 * 1024)) {
      upload.value = '';
      selectedFiles = [];
      drawPreviews([], 'Choose up to 4 PNG, JPG, or WebP images, no larger than 8 MB each.');
      return;
    }
    selectedFiles = files;
    drawPreviews(files, files.length + ' screenshot(s) attached. Save the analysis to keep them in this browser.');
  });

  function openAssetDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error('IndexedDB is unavailable'));
      const request = indexedDB.open('betzo-analysis-assets', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('screenshots', { keyPath: 'key' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveFiles(key, files) {
    const db = await openAssetDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('screenshots', 'readwrite');
      transaction.objectStore('screenshots').put({
        key,
        files: files.map(file => ({ name: file.name, type: file.type, blob: file }))
      });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async function loadFiles(symbol) {
    try {
      const record = JSON.parse(localStorage.getItem('betzoConfluence_' + symbol.toUpperCase()) || 'null');
      if (!record?.screenshotKey) return;
      const db = await openAssetDb();
      const transaction = db.transaction('screenshots', 'readonly');
      const request = transaction.objectStore('screenshots').get(record.screenshotKey);
      request.onsuccess = () => {
        const files = (request.result?.files || []).map(item =>
          new File([item.blob], item.name, { type: item.type }));
        selectedFiles = files;
        drawPreviews(files, files.length + ' saved screenshot(s) restored from this browser.');
      };
    } catch (_) {
      uploadStatus.textContent = 'Saved screenshots could not be restored in this browser.';
    }
  }

  byId('confluenceSymbol').addEventListener('change', event => loadFiles(event.target.value));
  loadFiles(byId('confluenceSymbol').value);
  byId('saveConfluence').addEventListener('click', async () => {
    if (!selectedFiles.length) return;
    const symbol = byId('confluenceSymbol').value.trim().toUpperCase();
    const key = 'screenshots-' + symbol + '-' + Date.now();
    try {
      await saveFiles(key, selectedFiles);
      const record = JSON.parse(localStorage.getItem('betzoConfluence_' + symbol) || '{}');
      record.screenshotKey = key;
      record.screenshotNames = selectedFiles.map(file => file.name);
      localStorage.setItem('betzoConfluence_' + symbol, JSON.stringify(record));
      uploadStatus.textContent = 'Analysis screenshots saved locally in this browser. They were not uploaded or sent to AI.';
    } catch (_) {
      uploadStatus.textContent = 'Image preview works, but this browser could not save the screenshot files.';
    }
  });

  function tvUrl(symbol) {
    return 'https://www.tradingview.com/chart/?symbol=' + encodeURIComponent(symbol || '');
  }
  function makeTvLink(label) {
    const link = document.createElement('a');
    link.className = 'btn icon-link';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = '<span aria-hidden="true">↗</span> ' + label;
    return link;
  }
  const chartLink = makeTvLink('Open on TradingView');
  byId('page-charts').querySelector('.page-head').append(chartLink);
  const chartSelect = byId('chartSymbol');
  const setChartLink = () => { chartLink.href = tvUrl(chartSelect.value); };
  chartSelect.addEventListener('change', setChartLink);
  setChartLink();
  const analysisLink = makeTvLink('Verify symbol on TradingView');
  confluenceCard.querySelector('.card-head').append(analysisLink);
  const updateAnalysisLink = () => { analysisLink.href = tvUrl(byId('confluenceSymbol').value); };
  byId('confluenceSymbol').addEventListener('input', updateAnalysisLink);
  updateAnalysisLink();

  const chartToolbar = (id) => byId(id);
  function addIndicator(toolbarId, key, label) {
    const toolbar = chartToolbar(toolbarId);
    const group = toolbar.querySelector('.chart-tool-group:nth-child(2)');
    if (group.querySelector('[data-indicator="' + key + '"]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chart-tool-btn';
    button.dataset.indicator = key;
    button.textContent = label;
    group.append(button);
  }
  function addDrawing(toolbarId, action, label) {
    const groups = chartToolbar(toolbarId).querySelectorAll('.chart-tool-group');
    const group = groups[groups.length - 1];
    if (!group) return;
    if (group.querySelector('[data-action="' + action + '"]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chart-tool-btn';
    button.dataset.action = action;
    button.textContent = label;
    group.append(button);
  }

  function installExtras(targetId, toolbarId) {
    const toolbar = chartToolbar(toolbarId);
    addIndicator(toolbarId, 'bb20', 'Bollinger 20');
    addIndicator(toolbarId, 'rsi14', 'RSI 14');
    addDrawing(toolbarId, 'zone', 'Supply/demand zone');
    addDrawing(toolbarId, 'trend', 'Trendline');
    toolbar.addEventListener('click', event => {
      const button = event.target.closest('[data-action]');
      if (!button || !['zone', 'trend'].includes(button.dataset.action)) return;
      const symbol = targetId === 'chartPageFrame' ? chartSelect.value : byId('chartAsset').value;
      const interval = toolbar.dataset.interval || '15m';
      const key = 'betzoChartDrawing_' + targetId + '_' + symbol + '_' + interval;
      if (button.dataset.action === 'zone') {
        const side = (prompt('Zone type: SUPPLY or DEMAND') || '').trim().toUpperCase();
        if (!['SUPPLY', 'DEMAND'].includes(side)) return;
        const high = Number(prompt('Zone upper price:'));
        const low = Number(prompt('Zone lower price:'));
        if (!Number.isFinite(high) || !Number.isFinite(low) || high <= low) {
          toast('Enter a valid supply or demand range.');
          return;
        }
        localStorage.setItem(key, JSON.stringify({ type: 'zone', side, high, low }));
      } else {
        const start = Number(prompt('Trendline start price:'));
        const end = Number(prompt('Trendline end price:'));
        if (!Number.isFinite(start) || !Number.isFinite(end)) return;
        localStorage.setItem(key, JSON.stringify({ type: 'trend', start, end }));
      }
      renderCandleChart(targetId);
    });

    if (window.betzoExtraRenderInstalled) return;
    window.betzoExtraRenderInstalled = true;
    const baseRender = renderCandleChart;
    renderCandleChart = function (id) {
      baseRender(id);
      const frame = byId(id), svg = frame?.querySelector('svg');
      const controls = byId(id === 'chartPageFrame' ? 'chartPageTools' : 'overviewChartTools');
      if (!svg || !controls) return;
      const symbol = id === 'chartPageFrame' ? chartSelect.value : byId('chartAsset').value;
      const interval = controls.dataset.interval || '15m';
      const bars = makeDemoBars(symbol + interval);
      const W=900,H=300,L=18,R=58,T=14,B=26,PW=W-L-R,PH=H-T-B;
      const lo=Math.min(...bars.map(b=>b.low))-.5,hi=Math.max(...bars.map(b=>b.high))+.5;
      const y=value=>T+(hi-value)/(hi-lo)*PH,x=i=>L+(i+.5)*PW/bars.length;
      const ns='http://www.w3.org/2000/svg';
      const poly=(points,color,dash)=>{const el=document.createElementNS(ns,'polyline');el.setAttribute('points',points.join(' '));el.setAttribute('fill','none');el.setAttribute('stroke',color);el.setAttribute('stroke-width','1.4');if(dash)el.setAttribute('stroke-dasharray',dash);svg.append(el)};
      if(controls.dataset.bb20==='1'){
        const upper=[],lower=[];
        for(let i=19;i<bars.length;i++){
          const window=bars.slice(i-19,i+1),mean=window.reduce((sum,b)=>sum+b.close,0)/20;
          const deviation=Math.sqrt(window.reduce((sum,b)=>sum+Math.pow(b.close-mean,2),0)/20);
          upper.push(x(i)+','+y(mean+2*deviation));lower.push(x(i)+','+y(mean-2*deviation));
        }
        poly(upper,'#60a5fa','4 3');poly(lower,'#60a5fa','4 3');
      }
      if(controls.dataset.rsi14==='1'){
        const recent=bars.slice(-15),changes=recent.slice(1).map((bar,i)=>bar.close-recent[i].close);
        const gain=changes.reduce((sum,v)=>sum+Math.max(v,0),0)/14,loss=changes.reduce((sum,v)=>sum+Math.max(-v,0),0)/14;
        const rsi=loss===0?100:100-100/(1+gain/loss),label=document.createElementNS(ns,'text');
        label.setAttribute('x',L+8);label.setAttribute('y',T+15);label.setAttribute('fill','#c084fc');label.setAttribute('font-size','11');
        label.textContent='Illustrative RSI 14: '+rsi.toFixed(1);svg.append(label);
      }
      let drawing=null;try{drawing=JSON.parse(localStorage.getItem('betzoChartDrawing_'+id+'_'+symbol+'_'+interval)||'null');}catch(_){}
      if(drawing?.type==='zone'){
        const top=Math.max(T,Math.min(y(drawing.high),y(drawing.low))),bottom=Math.min(T+PH,Math.max(y(drawing.high),y(drawing.low)));
        if(bottom>top){const color=drawing.side==='SUPPLY'?'#ff647c':'#4f9cff',rect=document.createElementNS(ns,'rect');rect.setAttribute('x',L);rect.setAttribute('y',top);rect.setAttribute('width',PW);rect.setAttribute('height',bottom-top);rect.setAttribute('fill',color);rect.setAttribute('fill-opacity','.12');rect.setAttribute('stroke',color);rect.setAttribute('stroke-dasharray','5 4');svg.append(rect);}
      }
      if(drawing?.type==='trend'){
        const line=document.createElementNS(ns,'line');line.setAttribute('x1',L);line.setAttribute('y1',y(drawing.start));line.setAttribute('x2',W-R);line.setAttribute('y2',y(drawing.end));line.setAttribute('stroke','#f4c66a');line.setAttribute('stroke-dasharray','6 4');svg.append(line);
      }
      let crosshair=null;
      svg.addEventListener('pointermove',event=>{
        const rect=svg.getBoundingClientRect(),px=(event.clientX-rect.left)/rect.width*W,py=(event.clientY-rect.top)/rect.height*H;
        if(px<L||px>W-R||py<T||py>T+PH)return;
        if(!crosshair){crosshair=document.createElementNS(ns,'g');crosshair.setAttribute('pointer-events','none');const v=document.createElementNS(ns,'line'),h=document.createElementNS(ns,'line'),t=document.createElementNS(ns,'text');[v,h].forEach(line=>{line.setAttribute('stroke','#9bb4d6');line.setAttribute('stroke-dasharray','3 3');crosshair.append(line);});t.setAttribute('fill','#9bb4d6');t.setAttribute('font-size','10');crosshair.append(t);svg.append(crosshair);}
        const lines=crosshair.querySelectorAll('line');lines[0].setAttribute('x1',px);lines[0].setAttribute('x2',px);lines[0].setAttribute('y1',T);lines[0].setAttribute('y2',T+PH);lines[1].setAttribute('x1',L);lines[1].setAttribute('x2',W-R);lines[1].setAttribute('y1',py);lines[1].setAttribute('y2',py);
        const price=hi-(py-T)/PH*(hi-lo),text=crosshair.querySelector('text');text.setAttribute('x',L+4);text.setAttribute('y',py-5);text.textContent=price.toFixed(2);
      });
      svg.addEventListener('pointerleave',()=>{crosshair?.remove();crosshair=null;});
    };
  }

  installExtras('overviewChartFrame','overviewChartTools');
  installExtras('chartPageFrame','chartPageTools');
  renderCandleChart('overviewChartFrame');
  renderCandleChart('chartPageFrame');

  const welcome = byId('page-welcome');
  const photoCredits = document.createElement('p');
  photoCredits.className = 'chart-footnote';
  photoCredits.innerHTML = 'Background photos: <a href="https://unsplash.com/photos/trader-analyzing-stock-market-charts-on-multiple-screens-j_hho1mE47s" target="_blank" rel="noopener noreferrer">welcome</a> · <a href="https://unsplash.com/photos/laptop-on-desk-edMu3cQKrho" target="_blank" rel="noopener noreferrer">sign in</a> · <a href="https://unsplash.com/photos/a-person-using-a-laptop-computer-with-a-chart-on-the-screen-InWI1lteYfU" target="_blank" rel="noopener noreferrer">sign up</a>.';
  welcome.querySelector('.public-hero').after(photoCredits);
  const overviewTv = makeTvLink('Open chart on TradingView');
  byId('overviewChartTools').append(overviewTv);
const setOverviewTv = () => { overviewTv.href = tvUrl(byId('chartAsset').value); };
byId('chartAsset').addEventListener('change', setOverviewTv);
setOverviewTv();

// ---------- Journal screenshot upload ----------
(function initJournalScreenshots() {
  const input = byId('tradeScreenshotInput');
  const preview = byId('tradeScreenshotPreview');
  const status = byId('tradeScreenshotStatus');
  const form = byId('tradeForm');
  if (!input || !preview || !status || !form) return;

  const dbName = 'betzo-journal-assets';
  const storeName = 'screenshots';
  let selectedFiles = [];
  let objectUrls = [];

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error('IndexedDB unavailable'));
      const req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(storeName, { keyPath: 'key' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function drawPreviews(files, msg) {
    objectUrls.forEach(u => URL.revokeObjectURL(u));
    objectUrls = [];
    preview.replaceChildren();
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      objectUrls.push(url);
      const item = document.createElement('div');
      item.className = 'screenshot-preview';
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Journal screenshot: ' + f.name;
      const label = document.createElement('small');
      label.textContent = f.name;
      item.append(img, label);
      preview.append(item);
    });
    status.textContent = msg;
  }

  input.addEventListener('change', () => {
    const files = Array.from(input.files || []);
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (files.length > 4 || files.some(f => !validTypes.includes(f.type) || f.size > 8 * 1024 * 1024)) {
      input.value = '';
      selectedFiles = [];
      drawPreviews([], 'Choose up to 4 PNG, JPG, or WebP images, no larger than 8 MB each.');
      return;
    }
    selectedFiles = files;
    drawPreviews(files, files.length + ' screenshot(s) attached. Save the trade to keep them in this browser.');
  });

  async function saveJournalScreenshot(tradeKey, files) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put({ key: tradeKey, files: files.map(f => ({ name: f.name, type: f.type, blob: f })) });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function loadJournalScreenshot(tradeKey) {
    try {
      const db = await openDb();
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(tradeKey);
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result ? req.result.files : []);
        req.onerror = () => reject(req.error);
      });
    } catch (_) { return []; }
  }

  // Hook into existing save: attach screenshot file refs to the trade object
  // Screenshots are saved first; the index.html submit handler saves the trade
  // and applies window.__tradeScreenshotKey if set.
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (selectedFiles.length) {
      const tradeKey = 'trade-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      try {
        await saveJournalScreenshot(tradeKey, selectedFiles);
        window.__tradeScreenshotKey = tradeKey;
        window.__tradeScreenshotNames = selectedFiles.map(f => f.name);
      } catch (_) {
        status.textContent = 'Could not save screenshots. Trade saved without images.';
        window.__tradeScreenshotKey = null;
        window.__tradeScreenshotNames = [];
      }
    } else {
      window.__tradeScreenshotKey = null;
      window.__tradeScreenshotNames = [];
    }
    // Let the index.html submit handler save the trade, reset form, render, toast
  });

  // Render screenshots in journal table rows
  const origRenderTrades = window.renderTrades;
  window.renderTrades = function () {
    origRenderTrades();
    document.querySelectorAll('#journalTable tr').forEach((row, idx) => {
      const trade = trades[idx];
      if (!trade || !trade.screenshotKey) return;
      const existing = row.querySelector('.trade-screenshots');
      if (existing) return;
      const cell = document.createElement('td');
      cell.className = 'trade-screenshots';
      cell.style.fontSize = '11px';
      cell.style.color = 'var(--muted)';
      loadJournalScreenshot(trade.screenshotKey).then(files => {
        if (!files.length) return;
        cell.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '6px';
        wrapper.style.flexWrap = 'wrap';
        files.forEach(f => {
          const url = URL.createObjectURL(f.blob);
          const img = document.createElement('img');
          img.src = url;
          img.style.width = '48px';
          img.style.height = '48px';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '6px';
          img.style.border = '1px solid var(--line)';
          img.title = f.name;
          wrapper.appendChild(img);
          objectUrls.push(url);
        });
        cell.appendChild(wrapper);
      });
      row.appendChild(cell);
    });
  };
})();

})();
