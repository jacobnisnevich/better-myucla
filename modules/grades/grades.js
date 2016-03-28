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

// Parses the MyUCLA gradebook to a JS object
var parseGrades = function() {
	var parsedGrades = {};
	var currentSection = '';
	var excluded = false;

	$('#myUCLAGradesGridFoo tr').each(function(index) {
		// Ignore first row
		if (index > 0) {
			// If background color is dark grey, this is a section row
			if ($(this).css('background-color') == 'rgb(208, 208, 208)') {
				currentSection = $(this).text();

				// Check if current section should be excluded
				if (excludableSections.includes(currentSection)) {
					excluded = true;
				} else {
					parsedGrades[currentSection] = [];
					excluded = false;
				}
			} else {
				// Skip assignments that are in excluded sections
				// Skip assignments taht have not been graded
				if (excluded === false || $(this).find('td')) {
					var parsedFraction = parseGradeFraction($($(this).find('td')[1]).text());

					parsedGrades[currentSection].push({
						assigment: $($(this).find('td')[0]).text(),
						pointsAwarded: parsedFraction.pointsAwarded,
						pointsTotal: parsedFraction.pointsTotal,
						percentage: parsedFraction.percentage
					});
				}
			}
		}
	});

	return parsedGrades;
};

// Parse string in form "117 / 120" to pointsAwarded, pointsTotal, and percentage
var parseGradeFraction = function(gradeFractionString) {
	var pointsAwarded = Number(gradeFractionString.match(/(.*)\s\/\s(.*)/i)[1]);
	var pointsTotal = Number(gradeFractionString.match(/(.*)\s\/\s(.*)/i)[2]);

	return {
		pointsAwarded: pointsAwarded,
		pointsTotal: pointsTotal,
		percentage: pointsAwarded / pointsTotal
	};
};

// Get overall grade for a section
var getGradeSectionTotal = function(gradeSection) {
	var totalPointsAwarded = 0;
	var totalPointsSum = 0;

	gradeSection.forEach(function(grade) {
		totalPointsAwarded += grade.pointsAwarded;
		totalPointsSum += grade.pointsTotal;
	});

	return {
		totalPointsAwarded: totalPointsAwarded,
		totalPointsSum: totalPointsSum,
		overallPercentage: totalPointsAwarded / totalPointsSum
	};
};

// Generate initial final raw score based on equal weight distribution
var getInitialScore = function(grades) {
	var weight = 100 / Object.keys(grades).length;
	var score = 0;

	Object.keys(grades).forEach(function(gradeSection) {
		var gradeSectionTotal = getGradeSectionTotal(grades[gradeSection]);

		score += gradeSectionTotal.overallPercentage * (weight / 100);
	});

	return score;
};

// Returns a hash of grade sections to weights
var getSectionWeights = function() {
	var sectionWeights = {};

	$('.grade-section').each(function(index) {
		var gradeSection = $($(this).find('.section')).text();
		var sectionWeight = Number($($(this).find('.weight input')).val());

		sectionWeights[gradeSection] = sectionWeight;
	});

	return sectionWeights;
};

// Validates that section weights add up to 100
var validateSectionWeights = function(sectionWeights) {
	var counter = 0;

	Object.keys(sectionWeights).forEach(function(gradeSection) {
		counter += sectionWeights[gradeSection];
	});

	return counter == 100;
};

// Updates the final score given grades and section weights
var updateFinalScore = function(grades, sectionWeights) {
	var $finalScore = $('#final-score-container .score');

	if (!validateSectionWeights(sectionWeights)) {
		$finalScore.text('Weights do not add up to 100! :/');
		return;
	}

	var score = 0;

	Object.keys(grades).forEach(function(gradeSection) {
		var gradeSectionTotal = getGradeSectionTotal(grades[gradeSection]);

		score += gradeSectionTotal.overallPercentage * (sectionWeights[gradeSection] / 100);
	});

	$finalScore.text((score * 100).toFixed(2));
};

var calculatePassingScore = function() {
	var $finalState = $('#final-score-container .status');
	var passingScore = .70;
	var finalText;

	if (score > passingScore) {
		finalText = 'You have already passed! YAY!';
	}
	else {
		// calculate final score needed to pass
		var percentNeeded = (score - passingScore).toFixed(2);
		var finalPercent = percentNeeded / sectionWeights['final'];
		finalText = 'You need to get ' + (finalPercent*100).toFixed(2) + '& to pass! Good Luck!';
	}

	$finalState.text(finalText);
}

grades = parseGrades();
createRawScoreCalculator(grades);
$(document).on('input', '.grade-section .weight', function() {
	updateFinalScore(grades, getSectionWeights());
});

// Ling 20 distribution:
//
// Mid Term - 8.75
// Quiz     - 20
// Final    - 26.25
// Homework - 45
//
