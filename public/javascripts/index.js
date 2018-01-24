/*
 * Functions for the Lobby/Index Page
 */

let joinGame = () => { // Joins/Creates regular game
  window.location.href = "/join/" + $('#code').val();
};

let joinCPU = () => { // Creates CPU game
  window.location.href = "/joincpu/" + $('#code').val();
};

handle.status = (data) => { // Handle getting the status of a lobby

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

$('#code').on('keyup', () => { // As the user types...

  $('#lobbybtn').unbind('click');
  $('#cpubtn').unbind('click');

  $('#cpubtn').css({ display: 'none' });

  let code = $('#code').val().replace(/\W/, ''); // Replace invalid chars

  $('#code').val(code);

  if (/^\w{5,12}$/.test(code)) {

    $('#lobbybtn').attr('class', 'btn btn-default');
    $('#lobbybtn').html('....');
    $('#lobbybtn').on('click', () => {});

    send({
      'cmd': 'status',
      'lobby': code
    }); // Request status of currently typed lobby

  } else {

    $('#lobbybtn').attr('class', 'btn btn-danger');
    $('#lobbybtn').html('Invalid');
    $('#lobbybtn').on('click', () => {});

  }

});
