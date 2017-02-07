(function(){
  // inspired by/borrowed from http://jsfiddle.net/gaJyT/18/ -- thanks!
  // and adopted from https://github.com/kylestetz/lissajous/blob/master/environment/drag-and-drop.js

  var dragAndDrop = document.querySelector('.drag-and-drop');
  var dragging = false;

  function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }

  function dragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    var dragAndDrop = $(e.target);
    if(!dragging) {
      dragAndDrop.addClass('show');
      dragging = true;
    }
    return false;
  }

  function dragEnd(e) {
      e.stopPropagation();
      e.preventDefault();
      var dragAndDrop = $(e.target);
      dragAndDrop.removeClass('show');
      dragging = false;
      return false;
  }

  function dragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    var dragAndDrop = $(e.target);
    dragAndDrop.removeClass('show');
    dragging = false;
    return false;
  }

  function dropEvent(e) {
    e.stopPropagation();
    e.preventDefault();
    var dragAndDrop = $(e.target);
    dragAndDrop.removeClass('show');
    dragging= false;

    var droppedFiles = e.dataTransfer.files;
    var readers = [];
    var filenames = [];

    droppedFiles = Array.prototype.slice.call(droppedFiles);
    droppedFiles.forEach(function(item, i){

      readers.push( new FileReader() );
      // filenames.push( droppedFiles[i].name.replace('.wav', '') );

      readers[i].onload = function(fileEvent) {
        var data = fileEvent.target.result;

        var fileString = _arrayBufferToBase64(data);
        $.post('/sounds', {
          file: fileString,
          filename: item.name
        });
        
        // var xhr = new XMLHttpRequest;
        // xhr.open("POST", '/sounds', true);
        // xhr.send(data);
        // xhr.onload = function(e) {
        //   console.log(e);
        // };

        Tone.context.decodeAudioData(data, function(buffer) {
          beatgridSample.buffer.set(buffer);

          webAudioBeatDetector.analyze(buffer)
            .then(function(bpm) {
              Tone.Transport.bpm.value = bpm;
              $("#bpm-input").val(bpm);
            })
            .catch(function(err) {

            });

          //get BPM
          //webAudioBeatDetector.analyze...

          // if(
          //   window[filenames[i]] !== undefined ||
          //   filenames[i] === 'undefined' ||
          //   filenames[i].match(/^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|null|this|true|void|with|break|catch|class|const|false|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/)
          // ) {
          //   filenames[i] = 'sampleupload_' + (filenames[i] || (new Date()).getTime());
          // }

          // window[filenames[i]] = buffer;

          // if(filenames[i].match(/\/|\-|\~|\%|\,|\.|\;|\:|\!|\@|\#|\^|\&|\*|\(|\)|\\|\ /)) {
          //   console.log('The AudioBuffer `window["' + filenames[i] + '"]` is ready for you to use.');
          // } else {
          //   console.log('The AudioBuffer `' + filenames[i] + '` is ready for you to use.');
          // }

        }, function(e) {
          console.log('There was an error decoding your file (make sure it\'s a .wav file!)');
          console.log(e);
        });
      }
      readers[i].readAsArrayBuffer(droppedFiles[i]);
    });
  }
$(function() {
  var loop = document.getElementById("drag-container");
  loop.addEventListener('dragover', dragOver, false);
  loop.addEventListener('dragend', dragEnd, false);
  loop.addEventListener('dragleave', dragLeave, false);
  loop.addEventListener('drop', dropEvent, false);
});
//want to add thse event listeners to each row. can only do this after the rows have been rendered.
// window.addEventListener('dragover', dragOver, false);
// window.addEventListener('dragend', dragEnd, false);
// window.addEventListener('drop', dropEvent, false);
})();