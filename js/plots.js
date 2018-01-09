d3.select(window).on('load', init);

function init() {
  d3.tsv('HFUDD20.txt', function(error, data) {
    if (error) {
      throw error;
    }

    console.log(data[0]);
  });
}
