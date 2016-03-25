var grades = parseGrades();
createRawScoreCalculator(grades);

var excludableSections = [
	'MyUCLA Gradebook Final Grade',
	'Official Final Grade'
];

var boxTemplate = '<div id="${id}" class="widget_container">' +
	'<div class="widget_title page_collapsible page_collapsible_show collapse-open">' +
	'<span>${title}</span>' +
	'</div>' +
	'<div style="display: block;">' +
	'<div class="widget_content">${content}</div>' +
	'</div>' +
	'</div>';

$.template("boxTemplate", boxTemplate);

var createRawScoreCalculator = function(grades) {
	var id = 'raw-score-container';
	var title = 'Raw Score Calculator';

	$.tmpl("boxTemplate", {
		id: id,
		title: title,
		content: gradeSections
	});
};

var parseGrades = function() {
	var parsedGrades = {};
	var currentSection = "";
	var excluded = false;

	$('#myUCLAGradesGridFoo tr').each(function(index) {
		// Ignore first row
		if (index > 0) {
			// If background color is dark grey, this is a section row
			if ($(this).css('background-color') == "rgb(208, 208, 208)") {
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
				if (excluded === false) {
					var parsedFraction = parseGradeFraction($($(this).find("td")[1]).text());

					parsedGrades[currentSection].push({
						assigment: $($(this).find("td")[0]).text(),
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
