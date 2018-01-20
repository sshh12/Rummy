let joinGame = () => {
  window.location.href = "/join/" + $('#code').val();
};

handle.status = (data) => {

  if (data.cmd == 'status') {
    if (data.status == 'waiting') {
      $('#lobbybtn').attr('class', 'btn btn-success');
      $('#lobbybtn').html('Join');
      $('#lobbybtn').on('click', () => joinGame());
    } else if (data.status == 'closed') {
      $('#lobbybtn').attr('class', 'btn btn-danger');
      $('#lobbybtn').html('Full');
    } else if (data.status == 'open') {
      $('#lobbybtn').attr('class', 'btn btn-info');
      $('#lobbybtn').html('Create');
      $('#lobbybtn').on('click', () => joinGame());
    }
  }

};

$('#code').on('keyup', () => {

  $('#lobbybtn').unbind('click');

  let code = $('#code').val().replace(/\W/, '');

  $('#code').val(code);

  if (/^\w{5,12}$/.test(code)) {

    $('#lobbybtn').attr('class', 'btn btn-default');
    $('#lobbybtn').html('....');
    $('#lobbybtn').on('click', () => {});

    send({
      'cmd': 'status',
      'lobby': code
    });

  } else {

    $('#lobbybtn').attr('class', 'btn btn-danger');
    $('#lobbybtn').html('Invalid');
    $('#lobbybtn').on('click', () => {});

  }

});
