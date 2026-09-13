const state = { data: null };
const loadData = async () => {
  $('#status').removeClass('alert-danger').addClass('alert-warning').text('加载中...').show();
  try {
    const response = await fetch('data/sales.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (!data.series || data.series.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：' + data.source);
    $('#status').hide();
    renderCards(data);
    renderBarChart(data);
    renderLineChart(data);
    bindResize();
  } catch (error) {
    $('#status').removeClass('alert-warning').addClass('alert-danger')
              .text('加载失败：' + error.message).show();
  }
};
const renderCards = (data) => {
  data.series.forEach(s => {
    const total = s.counts.reduce((sum, n) => sum + n, 0);
    $('#cards').append(`
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${s.category}</h3>
            <p class="card-text fs-4">
              ${total} <span class="fs-6 text-muted">${data.unit}</span>
            </p>
            <p class="card-text small text-muted">共${data.months.length}个月累计销量</p>
          </div>
        </div>
      </div>
    `);
  });
};
const renderBarChart = (data) => {
  if (!state.barChart) {
    state.barChart = echarts.init(document.getElementById('bar-chart'));
  }
  state.barChart.setOption({
    color: ['#0d6efd', '#198754', '#fd7e14'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 0 },
    grid: { top: 40, left: 50, right: 20, bottom: 40 },
    xAxis: { type: 'category', data: data.months, name: '月份' },
    yAxis: { type: 'value', name: '销量（杯）' },
    series: data.series.map(s => ({
      name: s.category,
      type: 'bar',
      data: s.counts
    }))
  }, true);
};
const renderLineChart = (data) => {
  if (state.lineChart) {
    state.lineChart.destroy();
  }
  const colors = ['#0d6efd', '#198754', '#fd7e14'];
  const bgColors = ['rgba(13,110,253,.15)', 'rgba(25,135,84,.15)', 'rgba(253,126,20,.15)'];
  state.lineChart = new Chart(document.getElementById('line-chart'), {
    type: 'line',
    data: {
      labels: data.months,
      datasets: data.series.map((s, i) => ({
        label: s.category,
        data: s.counts,
        borderColor: colors[i],
        backgroundColor: bgColors[i],
        borderWidth: 2,
        pointRadius: 3,
        fill: false,
        tension: 0.35
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: { label: (ctx) => ctx.dataset.label + '：' + ctx.parsed.y + ' 杯' }
        }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: '销量（杯）' } },
        x: { title: { display: true, text: '2026年月份' } }
      }
    }
  });
};
const bindResize = () => {
  if (state.resizeBound) return;
  state.resizeBound = true;
  window.addEventListener('resize', () => {
    if (state.barChart) state.barChart.resize();
    if (state.lineChart) state.lineChart.resize();
  });
};
loadData();