$('head').append('<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react.js"></script>');
$('head').append('<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react-dom.js"></script>');

var excludableSections = [
	'MyUCLA Gradebook Final Grade',
	'Official Final Grade'
];

var boxTemplate = '<div id="${id}" class="widget_container">' +
	'<div class="widget_title page_collapsible page_collapsible_show collapse-open">' +
	'<span>${title}</span>' +
	'</div>' +
	'<div style="display: block;">' +
	'<div class="widget_content">{{html content}}</div>' +
	'</div>' +
	'</div>';

$.template('boxTemplate', boxTemplate);

// Creates the raw score calculator widget
var createRawScoreCalculator = function(grades) {
	var id = 'raw-score-container';
	var title = 'Raw Score Calculator';

	var gradeSections = '<div>';

	// Create new weight and section name for each grade section
	Object.keys(grades).forEach(function(gradeSection) {
		gradeSections += '<div class="grade-section clearfix" data-section="' + gradeSection + '">' + 
			'<div class="section">' + gradeSection + '</div>' + 
			'<div class="weight"><input type="text" value="' + (100 / Object.keys(grades).length) + '"></div>' + 
			'</div>';
	});

	gradeSections += '<hr>';

	gradeSections += '<div id="final-score-container" class="clearfix">';
	gradeSections += '<div class="title">Raw score:</div>';
	gradeSections += '<div class="score">' + (getInitialScore(grades) * 100).toFixed(2) + '</div>';
	gradeSections += '<div class="title">Final Status:>/div>';
	gradeSections += '<div class="status">Please insert information.</div>';
	gradeSections += '</div>';

	gradeSections += '</div>';

	$.tmpl('boxTemplate', {
		id: id,
		title: title,
		content: gradeSections
	}).appendTo('#right-sidebar');
};

