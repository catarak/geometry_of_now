(function(){
  // inspired by/borrowed from http://jsfiddle.net/gaJyT/18/ -- thanks!
  // and adopted from https://github.com/kylestetz/lissajous/blob/master/environment/drag-and-drop.js

  var dragAndDrop = document.querySelector('.drag-and-drop');
  var dragging = {};

  function dragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    var dragAndDrop = $(e.target).closest('.drag-and-drop');
    var rowNumber = dragAndDrop.data("row");
    console.log("dragOver for row " + rowNumber);
    if(!dragging[rowNumber]) {
      dragAndDrop.addClass('show');
      dragging[rowNumber] = true;
    }
    return false;
  }

  function dragEnd(e) {
      e.stopPropagation();
      e.preventDefault();
      var dragAndDrop = $(e.target).closest('.drag-and-drop');
      var rowNumber = dragAndDrop.data("row");
      console.log("dragEnd for row " + rowNumber);
      dragAndDrop.removeClass('show');
      dragging[rowNumber] = false;
      return false;
  }

  function dragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    var dragAndDrop = $(e.target).closest('.drag-and-drop');
    var rowNumber = dragAndDrop.data("row");
    console.log("dragLeave for row " + rowNumber);
    dragAndDrop.removeClass('show');
    dragging[rowNumber] = false;
    return false;
  }

  function dropEvent(e) {
    e.stopPropagation();
    e.preventDefault();
    var dragAndDrop = $(e.target).closest('.drag-and-drop');
    var rowNumber = dragAndDrop.data("row");
    console.log("dropEvent for row " + rowNumber);
    dragAndDrop.removeClass('show');
    dragging[rowNumber] = false;

    var droppedFiles = e.dataTransfer.files;
    var readers = [];
    var filenames = [];

    droppedFiles = Array.prototype.slice.call(droppedFiles);
    droppedFiles.forEach(function(item, i){

      readers.push( new FileReader() );
      filenames.push( droppedFiles[i].name.replace('.wav', '') );

      readers[i].onload = function(fileEvent) {
        var data = fileEvent.target.result;

        Tone.context.decodeAudioData(data, function(buffer) {

          if(
            window[filenames[i]] !== undefined ||
            filenames[i] === 'undefined' ||
            filenames[i].match(/^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|null|this|true|void|with|break|catch|class|const|false|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/)
          ) {
            filenames[i] = 'sampleupload_' + (filenames[i] || (new Date()).getTime());
          }

          window[filenames[i]] = buffer;

          if(filenames[i].match(/\/|\-|\~|\%|\,|\.|\;|\:|\!|\@|\#|\^|\&|\*|\(|\)|\\|\ /)) {
            console.log('The AudioBuffer `window["' + filenames[i] + '"]` is ready for you to use.');
          } else {
            console.log('The AudioBuffer `' + filenames[i] + '` is ready for you to use.');
          }

        }, function(e) {
          console.log('There was an error decoding your file (make sure it\'s a .wav file!)');
          console.log(e);
        });
      }
      readers[i].readAsArrayBuffer(droppedFiles[i]);
    });
  }
$(function() {
  var rows = document.getElementsByClassName("row");
  Array.prototype.forEach.call(rows, function(row) {
    console.log('adding row event listener for ', row);
    row.addEventListener('dragover', dragOver, false);
    row.addEventListener('dragend', dragEnd, false);
    row.addEventListener('dragleave', dragLeave, false);
    row.addEventListener('drop', dropEvent, false);
  });
});
//want to add thse event listeners to each row. can only do this after the rows have been rendered.
// window.addEventListener('dragover', dragOver, false);
// window.addEventListener('dragend', dragEnd, false);
// window.addEventListener('drop', dropEvent, false);
})();