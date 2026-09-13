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
loadData();