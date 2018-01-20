let joinGame = () => {
  window.location.href = "/join/" + $('#code').val();
};

let joinCPU = () => {
  window.location.href = "/joincpu/" + $('#code').val();
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
      $('#cpubtn').css({ display: 'inline' });
      $('#lobbybtn').html('Create');
      $('#lobbybtn').on('click', () => joinGame());
      $('#cpubtn').on('click', () => joinCPU());
    }
  }

};

$('#code').on('keyup', () => {

  $('#lobbybtn').unbind('click');
  $('#cpubtn').unbind('click');

  $('#cpubtn').css({ display: 'none' });

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
