var stream = require('stream')
var events = require('events')
var csv = require('csv')
var util = require('util')
var start

$(function() {
  $('#upload').click(function() {
    start = new Date()
    var fstream = new FileStream( $('#file')[0].files[0] )
    var fsstream = new FSStream()
    fstream.pipe(fsstream)
    parseCSV(fsstream)
  })
  
  function FSStream() {
    var me = this;
    stream.Stream.call(me);
    me.writable = true;
    me.readable = true;
    this.loaded = 0
  }
  
  util.inherits(FSStream, stream.Stream);
  
  FSStream.prototype.write = function(data) {
    if (data.loaded === this.loaded) return true
    this.emit('data', data.target.result.slice(this.loaded))
    this.loaded = data.loaded
    if (data.loaded === data.total) this.end()
    return true
  };
  
  FSStream.prototype.end = function(){
    this.emit('end')
    return true
  };
  
  function parseCSV(fileStream) {
    var headers, rows = []
    c = csv()
      c
      .fromStream(fileStream)
      .on('data',function(data, index) {
        if (!headers) {
          headers = data;
          return;
        }
        var row = {}
        _(_.zip(headers, data)).each(function(tuple) {
          row[_.first(tuple)] = _.last(tuple)
        })
        rows.push(row)
      })
      .on('end', function(count) {
        $('p').html(count + ' row csv parsed into json in ' + (new Date() - start) / 1000 + ' seconds')
        console.log(rows)
      })
      .on('error',function(error){
        console.error("csv error!", error.message);
      })
  }
})
