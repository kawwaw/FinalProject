$(document).ready(function() {
	$('#fullpage').fullpage({
    //Navigation
		menu: '#menu',
		lockAnchors: false,
		anchors:['first', 'second', 'third', 'fourth'],
		navigation: false,
		navigationPosition: 'right',
		navigationTooltips: ['firstSlide', 'secondSlide'],
		showActiveTooltip: false,
		slidesNavigation: false,
		slidesNavPosition: 'bottom',
  
  });
});


