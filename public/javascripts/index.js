let joinGame = () => {
  window.location.href = "/join/" + $('#code').val();
};

socketHandlers.status = (data) => {

  if (data.cmd == 'status') {
    if (data.status == 'waiting') {
      $('#lobbybtn').addClass('btn-success');
      $('#lobbybtn').html('Join');
      $('#lobbybtn').on('click', () => {
        joinGame();
      });
    } else if (data.status == 'closed') {
      $('#lobbybtn').addClass('btn-danger');
      $('#lobbybtn').html('Full');
    } else if (data.status == 'open') {
      $('#lobbybtn').addClass('btn-info');
      $('#lobbybtn').html('Create');
      $('#lobbybtn').on('click', () => {
        joinGame();
      });
    }
  }

};

$('#code').on('keyup', () => {

  $('#lobbybtn').on('click', () => {});

  let code = $('#code').val().replace(' ', '');

  $('#code').val(code);

  if (/^\w{5,12}$/.test(code)) {

    $('#lobbybtn').removeClass('btn-default');
    $('#lobbybtn').removeClass('btn-info');
    $('#lobbybtn').removeClass('btn-danger');
    $('#lobbybtn').removeClass('btn-success');
    $('#lobbybtn').html('....');
    $('#lobbybtn').on('click', () => {});

    send({
      'cmd': 'status',
      'lobby': code
    });

  } else {

    $('#lobbybtn').removeClass('btn-default');
    $('#lobbybtn').removeClass('btn-info');
    $('#lobbybtn').removeClass('btn-success');
    $('#lobbybtn').addClass('btn-danger');
    $('#lobbybtn').html('Invalid');
    $('#lobbybtn').on('click', () => {});

  }

});
