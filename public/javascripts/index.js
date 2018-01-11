
socket.ondata = (data) => {

  if(data.cmd == 'status') {
    if(data.status == 'waiting') {
      $('#lobbybtn').addClass('btn-success');
      $('#lobbybtn').html('Join');
    } else if(data.status == 'playing') {
      $('#lobbybtn').addClass('btn-danger');
      $('#lobbybtn').html('Full');
    } else if(data.status == 'open') {
      $('#lobbybtn').addClass('btn-info');
      $('#lobbybtn').html('Create');
    }
  }

}

$('#code').on('keyup', () => {

  let code = $('#code').val();

  if(/^\w{5}$/.test(code)) {

    $('#lobbybtn').removeClass('btn-default');
    $('#lobbybtn').removeClass('btn-info');
    $('#lobbybtn').removeClass('btn-danger');
    $('#lobbybtn').removeClass('btn-success');
    $('#lobbybtn').html('...');

    getLobbyStatus(code);

  } else {

    $('#lobbybtn').removeClass('btn-default');
    $('#lobbybtn').removeClass('btn-info');
    $('#lobbybtn').removeClass('btn-success');
    $('#lobbybtn').addClass('btn-danger');
    $('#lobbybtn').html('Invalid');

  }

});
